import { proxify } from '../../../utils/proxify.ts';
import type {
  ActionError,
  ActionPostRequest,
  ActionPostResponse,
  TypedActionParameter,
} from '../../actions-spec.ts';
import { Action } from '../Action.ts';

export abstract class AbstractActionComponent {
  protected constructor(
    protected _parent: Action,
    protected _label: string,
    protected _href: string,
    protected _parameters?: TypedActionParameter[],
  ) {}

  public get parent() {
    return this._parent;
  }

  public get label() {
    return this._label;
  }

  public get parameters() {
    return this._parameters ?? [];
  }

  public abstract get href(): string;

  protected abstract buildBody(account: string): ActionPostRequest;

  public async post(account: string) {
    const proxyUrl = proxify(this.href);
    const response = await fetch(proxyUrl, {
      method: 'POST',
      body: JSON.stringify(this.buildBody(account)),
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

    return (await response.json()) as ActionPostResponse;
  }
}
