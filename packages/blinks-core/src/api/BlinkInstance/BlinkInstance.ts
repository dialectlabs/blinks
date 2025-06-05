import type { MessageNextActionPostRequest } from '@solana/actions-spec';
import { nanoid } from 'nanoid/non-secure';
import {
  type Supportability,
  getBlinkSupportabilityMetadata,
  isProxified,
  proxify,
  proxifyImage,
  secureFetch,
} from '../../utils';
import { isUrlSameOrigin } from '../../utils/security.ts';
import type { BlinkAdapter } from '../BlinkAdapter.ts';
import type {
  ActionGetResponse,
  ActionParameterType,
  LinkedAction,
  LinkedActionType,
  NextAction,
  NextActionLink,
  NextActionPostRequest,
  OnActionSuccess,
  PostNextActionLink,
  TypedActionParameter,
} from '../actions-spec.ts';
import {
  type AbstractActionComponent,
  ButtonActionComponent,
  FormActionComponent,
  MultiValueActionComponent,
  SingleValueActionComponent,
} from './action-components';
import {
  type BlinkSupportStrategy,
  BASELINE_ACTION_VERSION,
  BASELINE_BLINK_BLOCKCHAIN_IDS,
  defaultBlinkSupportStrategy,
} from './blink-supportability.ts';

const MULTI_VALUE_TYPES: ActionParameterType[] = ['checkbox'];

const EXPERIMENTAL_LIVE_DATA_DEFAULT_DELAY_MS = 1000;

type BlinkChainMetadata =
  | {
      isChained: true;
      isInline: boolean;
    }
  | {
      isChained: false;
    };

interface LiveData {
  enabled: boolean;
  delayMs?: number;
}

interface ExperimentalFeatures {
  liveData?: LiveData;
}

export class BlinkInstance {
  private readonly _actions: AbstractActionComponent[];

  private constructor(
    private readonly _url: string,
    private readonly _data: NextAction,
    private readonly _metadata: Supportability,
    private readonly _supportStrategy: BlinkSupportStrategy,
    private readonly _chainMetadata: BlinkChainMetadata = { isChained: false },
    private readonly _id?: string,
    private readonly _experimental?: ExperimentalFeatures,
  ) {
    // if no links present or completed, fallback to original solana pay spec (or just using the button as a placeholder)
    if (_data.type === 'completed' || !_data.links?.actions) {
      this._actions = [
        new ButtonActionComponent(this, _data.label, _url, 'transaction'),
      ];
      return;
    }

    const urlObj = new URL(_url);
    this._actions = _data.links.actions.map((action) => {
      const href = action.href.startsWith('http')
        ? action.href
        : urlObj.origin + action.href;

      return componentFactory(
        this,
        action.label,
        href,
        action.type ?? 'transaction',
        action.parameters,
      );
    });
  }

  // this API MAY change in the future
  public get liveData_experimental(): Required<LiveData> | null {
    const liveData = this._experimental?.liveData;

    if (!liveData) {
      return null;
    }

    return {
      enabled: liveData.enabled,
      delayMs: liveData.delayMs
        ? Math.max(liveData.delayMs, EXPERIMENTAL_LIVE_DATA_DEFAULT_DELAY_MS)
        : EXPERIMENTAL_LIVE_DATA_DEFAULT_DELAY_MS,
    };
  }

  public get id() {
    return this._id;
  }

  public get data() {
    return this._data;
  }

  public get supportStrategy() {
    return this._supportStrategy;
  }

  public get isChained() {
    return this._chainMetadata.isChained;
  }

  public get isInline() {
    return this._chainMetadata.isChained ? this._chainMetadata.isInline : false;
  }

  public get type() {
    return this._data.type;
  }

  public get url() {
    return this._url;
  }

  public get icon() {
    if (
      this._data.icon.startsWith('data:') ||
      isProxified(this._data.icon) ||
      !this._data.icon
    ) {
      return this._data.icon;
    }
    return proxifyImage(this._data.icon).url.toString();
  }

  public get title() {
    return this._data.title;
  }

  public get description() {
    return this._data.description;
  }

  public get disabled() {
    return this._data.disabled ?? false;
  }

  public get actions() {
    return this._actions;
  }

  public get error() {
    return this._data.error?.message ?? null;
  }

  public get message() {
    return this._data.message ?? null;
  }

  public get metadata(): Supportability {
    // TODO: Remove fallback to baseline version after a few weeks after compatibility is adopted
    return {
      blockchainIds:
        this._metadata.blockchainIds ?? BASELINE_BLINK_BLOCKCHAIN_IDS,
      version: this._metadata.version ?? BASELINE_ACTION_VERSION,
    };
  }

  public async isSupported(adapter: BlinkAdapter) {
    try {
      return await this._supportStrategy(this, adapter);
    } catch (e) {
      console.error(
        `[@dialectlabs/blinks] Failed to check supportability for action ${this.url}`,
        e,
      );
      return {
        isSupported: false,
        message:
          'Failed to check supportability, please contact your Blink client provider.',
      };
    }
  }

  public async chain<N extends NextActionLink>(
    next: N,
    chainData?: N extends PostNextActionLink
      ? MessageNextActionPostRequest | NextActionPostRequest
      : never,
    lifecycleData?: OnActionSuccess,
  ): Promise<BlinkInstance | null> {
    const id = nanoid();

    if (next.type === 'inline') {
      return new BlinkInstance(
        this.url,
        lifecycleData
          ? mergeLifecycleData(next.action, lifecycleData)
          : next.action,
        this.metadata,
        this._supportStrategy,
        {
          isChained: true,
          isInline: true,
        },
        id,
      );
    }

    const baseUrlObj = new URL(this.url);

    if (!isUrlSameOrigin(baseUrlObj.origin, next.href)) {
      console.error(
        `Chained action is not the same origin as the current action. Original: ${this.url}, chained: ${next.href}`,
      );
      return null;
    }

    const href = next.href.startsWith('http')
      ? next.href
      : baseUrlObj.origin + next.href;

    const { url: proxyUrl, headers: proxyHeaders } = proxify(href);
    const response = await fetch(proxyUrl, {
      method: 'POST',
      body: JSON.stringify(chainData),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...proxyHeaders,
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch chained action ${proxyUrl}, action url: ${next.href}`,
      );
      return null;
    }

    const data = (await response.json()) as NextAction;
    const metadata = getBlinkSupportabilityMetadata(response);

    return new BlinkInstance(
      href,
      lifecycleData ? mergeLifecycleData(data, lifecycleData) : data,
      metadata,
      this._supportStrategy,
      {
        isChained: true,
        isInline: false,
      },
      id,
    );
  }

  public safeInlineChain(lifecycleData?: OnActionSuccess): BlinkInstance {
    if (!lifecycleData) {
      return this;
    }

    const id = nanoid();
    return new BlinkInstance(
      this.url,
      mergeLifecycleData(this._data, lifecycleData),
      this.metadata,
      this._supportStrategy,
      {
        isChained: true,
        isInline: true,
      },
      id,
    );
  }

  // be sure to use this only if the action is valid
  static hydrate(
    url: string,
    data: NextAction,
    metadata: Supportability,
    supportStrategy: BlinkSupportStrategy,
  ) {
    const id = nanoid();
    return new BlinkInstance(
      url,
      data,
      metadata,
      supportStrategy,
      { isChained: false },
      id,
    );
  }

  private static async _fetch(
    apiUrl: string,
    supportStrategy: BlinkSupportStrategy = defaultBlinkSupportStrategy,
    chainMetadata?: BlinkChainMetadata,
    id?: string,
  ) {
    const { url: proxyUrl, headers: proxyHeaders } = proxify(apiUrl);
    const response = await secureFetch(proxyUrl.toString(), {
      headers: {
        Accept: 'application/json',
        ...proxyHeaders,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch action ${proxyUrl}, action url: ${apiUrl}`,
      );
    }

    const data = (await response.json()) as ActionGetResponse;
    const metadata = getBlinkSupportabilityMetadata(response);

    return new BlinkInstance(
      apiUrl,
      { ...data, type: 'action' },
      metadata,
      supportStrategy,
      chainMetadata,
      id,
      data.dialectExperimental,
    );
  }

  static async fetch(
    apiUrl: string,
    supportStrategy: BlinkSupportStrategy = defaultBlinkSupportStrategy,
  ) {
    const id = nanoid();
    return BlinkInstance._fetch(
      apiUrl,
      supportStrategy,
      {
        isChained: false,
      },
      id,
    );
  }

  refresh() {
    return BlinkInstance._fetch(
      this.url,
      this._supportStrategy,
      this._chainMetadata,
      this._id,
    );
  }

  withUpdate(update: { supportStrategy?: BlinkSupportStrategy }) {
    return new BlinkInstance(
      this._url,
      this._data,
      this._metadata,
      update.supportStrategy ?? this._supportStrategy,
      this._chainMetadata,
      this._id,
      this._experimental,
    );
  }
}

const componentFactory = (
  parent: BlinkInstance,
  label: string,
  href: string,
  type: LinkedActionType,
  parameters?: TypedActionParameter[],
): AbstractActionComponent => {
  if (!parameters?.length) {
    return new ButtonActionComponent(parent, label, href, type);
  }

  if (parameters.length > 1) {
    return new FormActionComponent(parent, label, href, type, parameters);
  }

  const [parameter] = parameters;

  if (!parameter.type) {
    return new SingleValueActionComponent(
      parent,
      label,
      href,
      type,
      parameters,
    );
  }

  if (MULTI_VALUE_TYPES.includes(parameter.type)) {
    return new MultiValueActionComponent(parent, label, href, type, parameters);
  }

  return new SingleValueActionComponent(parent, label, href, type, parameters);
};

const mergeLifecycleData = (
  action: NextAction,
  lifecycleData: OnActionSuccess,
): NextAction => {
  const links: LinkedAction[] = [];

  if (action.type !== 'completed' && action.links) {
    links.push(...(action.links.actions ?? []));
  }

  if (lifecycleData.links?.actions) {
    links.push(...lifecycleData.links.actions);
  }

  return {
    ...action,
    type: 'action', // if lifecycle data present, we are not in a completed state
    message: lifecycleData.message ?? action.message,
    links: links.length > 0 ? { actions: links } : undefined,
  };
};

// For backward compatibility. Will be removed in future releases
export { BlinkInstance as Action };
