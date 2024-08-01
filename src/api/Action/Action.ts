import { proxify, proxifyImage } from '../../utils/proxify.ts';
import type { ActionAdapter } from '../ActionConfig.ts';
import type {
  ActionsSpecGetResponse,
  TypedParameter,
} from '../actions-spec.ts';
import {
  type AbstractActionComponent,
  ButtonActionComponent,
  FormActionComponent,
  MultiValueActionComponent,
  SingleValueActionComponent,
} from './action-components';

export class Action {
  private readonly _actions: AbstractActionComponent[];

  private constructor(
    private readonly _url: string,
    private readonly _data: ActionsSpecGetResponse,
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

  public get adapter() {
    if (!this._adapter) {
      throw new Error('No adapter provided');
    }

    return this._adapter;
  }

  public setAdapter(adapter: ActionAdapter) {
    this._adapter = adapter;
  }

  // be sure to use this only if the action is valid
  static hydrate(
    url: string,
    data: ActionsSpecGetResponse,
    adapter?: ActionAdapter,
  ) {
    return new Action(url, data, adapter);
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

    const data = (await response.json()) as ActionsSpecGetResponse;

    return new Action(apiUrl, data, adapter);
  }
}

const componentFactory = (
  parent: Action,
  label: string,
  href: string,
  parameters?: TypedParameter[],
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

  if (['checkbox'].includes(parameter.type)) {
    return new MultiValueActionComponent(parent, label, href, parameters);
  }

  return new SingleValueActionComponent(parent, label, href, parameters);
};
