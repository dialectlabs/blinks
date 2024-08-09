import { isUrlSameOrigin } from '../../shared';
import { proxify, proxifyImage } from '../../utils/proxify.ts';
import type { ActionAdapter } from '../ActionConfig.ts';
import type {
  ActionGetResponse,
  ActionParameterType,
  NextAction,
  NextActionLink,
  NextActionPostRequest,
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

const MULTI_VALUE_TYPES: ActionParameterType[] = ['checkbox'];

interface ActionMetadata {
  blockchainIds: string[];
}

type ActionChainMetadata =
  | {
      isChained: true;
      isInline: boolean;
    }
  | {
      isChained: false;
    };

export class Action {
  private readonly _actions: AbstractActionComponent[];

  private constructor(
    private readonly _url: string,
    private readonly _data: NextAction,
    private readonly _metadata: ActionMetadata,
    private _adapter?: ActionAdapter,
    private readonly _chainMetadata: ActionChainMetadata = { isChained: false },
  ) {
    // if no links present or completed, fallback to original solana pay spec (or just using the button as a placeholder)
    if (_data.type === 'completed' || !_data.links?.actions) {
      this._actions = [new ButtonActionComponent(this, _data.label, _url)];
      return;
    }

    const urlObj = new URL(_url);
    this._actions = _data.links.actions.map((action) => {
      const href = action.href.startsWith('http')
        ? action.href
        : urlObj.origin + action.href;

      return componentFactory(this, action.label, href, action.parameters);
    });
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
    if (this._data.icon.startsWith('data:')) {
      return this._data.icon;
    }
    return proxifyImage(this._data.icon).toString();
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

  public get metadata() {
    return this._metadata;
  }

  public get adapter() {
    if (!this._adapter) {
      throw new Error('No adapter provided');
    }

    return this._adapter;
  }

  public setAdapter(adapter: ActionAdapter) {
    this._adapter = adapter;
  }

  public async chain<N extends NextActionLink>(
    next: N,
    chainData?: N extends PostNextActionLink ? NextActionPostRequest : never,
  ): Promise<Action | null> {
    if (next.type === 'inline') {
      return new Action(this.url, next.action, this.metadata, this.adapter, {
        isChained: true,
        isInline: true,
      });
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

    const proxyUrl = proxify(href);
    const response = await fetch(proxyUrl, {
      method: 'POST',
      body: JSON.stringify(chainData),
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch chained action ${proxyUrl}, action url: ${next.href}`,
      );
      return null;
    }

    const data = (await response.json()) as NextAction;
    const metadata = getActionMetadata(response);

    return new Action(href, data, metadata, this.adapter, {
      isChained: true,
      isInline: false,
    });
  }

  // be sure to use this only if the action is valid
  static hydrate(
    url: string,
    data: NextAction,
    metadata: ActionMetadata,
    adapter?: ActionAdapter,
  ) {
    return new Action(url, data, metadata, adapter);
  }

  static async fetch(apiUrl: string, adapter?: ActionAdapter) {
    const proxyUrl = proxify(apiUrl);
    const response = await fetch(proxyUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch action ${proxyUrl}, action url: ${apiUrl}`,
      );
    }

    const data = (await response.json()) as ActionGetResponse;
    const metadata = getActionMetadata(response);

    return new Action(apiUrl, { ...data, type: 'action' }, metadata, adapter);
  }
}

const getActionMetadata = (response: Response): ActionMetadata => {
  // for multi-chain x-blockchain-ids
  const blockchainIds = (
    response?.headers?.get('x-blockchain-ids') || ''
  ).split(',');

  return {
    blockchainIds,
  } satisfies ActionMetadata;
};

const componentFactory = (
  parent: Action,
  label: string,
  href: string,
  parameters?: TypedActionParameter[],
): AbstractActionComponent => {
  if (!parameters?.length) {
    return new ButtonActionComponent(parent, label, href);
  }

  if (parameters.length > 1) {
    return new FormActionComponent(parent, label, href, parameters);
  }

  const [parameter] = parameters;

  if (!parameter.type) {
    return new SingleValueActionComponent(parent, label, href, parameters);
  }

  if (MULTI_VALUE_TYPES.includes(parameter.type)) {
    return new MultiValueActionComponent(parent, label, href, parameters);
  }

  return new SingleValueActionComponent(parent, label, href, parameters);
};
