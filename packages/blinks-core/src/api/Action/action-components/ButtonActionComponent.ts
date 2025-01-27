import type {
  ActionPostRequest,
  LinkedActionType,
  TypedActionParameter,
} from '../../actions-spec.ts';
import { BlinkInstance } from '../BlinkInstance.ts';
import { AbstractActionComponent } from './AbstractActionComponent.ts';

export class ButtonActionComponent extends AbstractActionComponent {
  constructor(
    protected _parent: BlinkInstance,
    protected _label: string,
    protected _href: string,
    protected _type: LinkedActionType,
    protected _parameters?: TypedActionParameter[],
    protected _parentComponent?: AbstractActionComponent,
  ) {
    super(_parent, _label, _href, _type, _parameters);
  }

  get parentComponent() {
    return this._parentComponent ?? null;
  }

  protected buildBody(account: string): ActionPostRequest {
    return { account, type: this.type };
  }

  get href(): string {
    return this._href;
  }
}
