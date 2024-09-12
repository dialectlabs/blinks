import type {
  ActionPostRequest,
  TypedActionParameter,
} from '../../actions-spec.ts';
import { Action } from '../Action.ts';
import { AbstractActionComponent } from './AbstractActionComponent.ts';

export class ButtonActionComponent extends AbstractActionComponent {
  constructor(
    protected _parent: Action,
    protected _label: string,
    protected _href: string,
    protected _parameters?: TypedActionParameter[],
    protected _parentComponent?: AbstractActionComponent,
  ) {
    super(_parent, _label, _href, _parameters);
  }

  get parentComponent() {
    return this._parentComponent ?? null;
  }

  protected buildBody(account: string): ActionPostRequest {
    return { account };
  }

  get href(): string {
    return this._href;
  }
}
