import { proxify, proxifyImage } from '../../utils/proxify.ts';
import type { ActionAdapter } from '../ActionConfig.ts';
import type {
  ActionGetResponse,
  ActionParameter,
  ActionParameterType,
} from '../actions-spec.ts';
import {
  type AbstractActionComponent,
  ButtonActionComponent,
  FormActionComponent,
  MultiValueActionComponent,
  SingleValueActionComponent,
} from './action-components';
import {
  type ActionSupportStrategy,
  BASELINE_ACTION_BLOCKCHAIN_IDS,
  BASELINE_ACTION_VERSION,
} from './action-supportability.ts';

const MULTI_VALUE_TYPES: ActionParameterType[] = ['checkbox'];

interface ActionMetadata {
  blockchainIds?: string[];
  version?: string;
}

export class Action {
  private readonly _actions: AbstractActionComponent[];

  private constructor(
    private readonly _url: string,
    private readonly _data: ActionGetResponse,
    private readonly _metadata: ActionMetadata,
    private readonly _supportStrategy: ActionSupportStrategy,
    private _adapter?: ActionAdapter,
  ) {
    // if no links present, fallback to original solana pay spec
    if (!_data.links?.actions) {
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

  public get metadata(): Required<ActionMetadata> {
    // TODO: Change fallback to baseline version after a few weeks after proxies adopt versioning and remove Required
    return {
      blockchainIds:
        this._metadata.blockchainIds ?? BASELINE_ACTION_BLOCKCHAIN_IDS,
      version: this._metadata.version ?? BASELINE_ACTION_VERSION,
    };
  }

  public get adapterUnsafe() {
    return this._adapter;
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

  public isSupported() {
    return this._supportStrategy(this);
  }

  // be sure to use this only if the action is valid
  static hydrate(
    url: string,
    data: ActionGetResponse,
    metadata: ActionMetadata,
    supportStrategy: ActionSupportStrategy,
    adapter?: ActionAdapter,
  ) {
    return new Action(url, data, metadata, supportStrategy, adapter);
  }

  static async fromApiUrl(
    apiUrl: string,
    supportStrategy: ActionSupportStrategy,
  ) {
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

    const blockchainIds = response.headers
      .get('x-blockchain-ids')
      ?.split(',')
      .map((id) => id.trim());
    const version = response.headers.get('x-action-version')?.trim();

    const metadata: ActionMetadata = {
      blockchainIds,
      version,
    };

    return new Action(apiUrl, data, metadata, supportStrategy);
  }
}

const componentFactory = (
  parent: Action,
  label: string,
  href: string,
  parameters?: ActionParameter<ActionParameterType>[],
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
