import { proxify, proxifyImage } from '../utils/proxify.ts';
import type { ActionAdapter } from './ActionConfig.ts';
import type {
  ActionError,
  ActionsSpecGetResponse,
  ActionsSpecPostRequestBody,
  ActionsSpecPostResponse,
  Parameter,
} from './actions-spec';

export class Action {
  private readonly _actions: ActionComponent[];

  private constructor(
    private readonly _url: string,
    private readonly _data: ActionsSpecGetResponse,
    private _adapter?: ActionAdapter,
  ) {
    // if no links present, fallback to original solana pay spec
    if (!_data.links?.actions) {
      this._actions = [new ActionComponent(this, _data.label, _url)];
      return;
    }

    const urlObj = new URL(_url);
    this._actions = _data.links.actions.map((action) => {
      const href = action.href.startsWith('http')
        ? action.href
        : urlObj.origin + action.href;

      return new ActionComponent(this, action.label, href, action.parameters);
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

  public resetActions() {
    this._actions.forEach((action) => action.reset());
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

export class ActionComponent {
  private parameterValue: Record<string, string> = {};

  constructor(
    private _parent: Action,
    private _label: string,
    private _href: string,
    private _parameters?: Parameter[],
  ) {}

  public get href() {
    // input with a button
    if (this.parameters.length === 1) {
      return this._href.replace(
        `{${this.parameter.name}}`,
        encodeURIComponent(
          this.parameterValue[this.parameter.name]?.trim() ?? '',
        ),
      );
    }

    // form
    if (this.parameters.length > 1) {
      return this.parameters.reduce((href, param) => {
        return href.replace(
          `{${param.name}}`,
          encodeURIComponent(this.parameterValue[param.name]?.trim() ?? ''),
        );
      }, this._href);
    }

    // button
    return this._href;
  }

  public get parent() {
    return this._parent;
  }

  public get label() {
    return this._label;
  }

  // initial version uses only one parameter, so using the first one
  public get parameter() {
    const [param] = this.parameters;

    return param;
  }

  public get parameters() {
    return this._parameters ?? [];
  }

  public reset() {
    this.parameterValue = {};
  }

  public setValue(value: string, name?: string) {
    if (!this.parameter) {
      return;
    }

    this.parameterValue[name ?? this.parameter.name] = value;
  }

  public async post(account: string) {
    const proxyUrl = proxify(this.href);
    const response = await fetch(proxyUrl, {
      method: 'POST',
      body: JSON.stringify({ account } as ActionsSpecPostRequestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = (await response.json()) as ActionError;
      console.error(
        `[@dialectlabs/blinks] Failed to execute action ${proxyUrl}, href ${this.href}, reason: ${error.message}`,
      );

      throw {
        message: error.message,
      } as ActionError;
    }

    return (await response.json()) as ActionsSpecPostResponse;
  }
}
