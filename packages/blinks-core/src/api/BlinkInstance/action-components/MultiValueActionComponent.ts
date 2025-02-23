import type {
  ActionPostRequest,
  LinkedActionType,
  SelectableParameterType,
  TypedActionParameter,
} from '../../actions-spec.ts';
import { BlinkInstance } from '../BlinkInstance.ts';
import { AbstractActionComponent } from './AbstractActionComponent.ts';
import { ButtonActionComponent } from './ButtonActionComponent.ts';

export class MultiValueActionComponent extends AbstractActionComponent {
  private parameterValue: Array<string> = [];

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

  // any, since we don't know the parameter names on the client level
  protected buildBody(account: string): ActionPostRequest<any> {
    if (this._href.indexOf(`{${this.parameter.name}}`) > -1) {
      return { account, type: this.type };
    }

    return {
      account,
      type: this.type,
      data: {
        [this.parameter.name]: this.isMultiOptions
          ? this.parameterValue
          : this.parameterValue[0],
      },
    };
  }

  public get isMultiOptions() {
    return this.parameter.type === 'checkbox';
  }

  public get parameter(): TypedActionParameter<SelectableParameterType> {
    const [param] = this.parameters;

    return param as TypedActionParameter<SelectableParameterType>;
  }

  public setValue(value: string | Array<string>) {
    this.parameterValue = typeof value === 'string' ? [value] : value;
  }

  get href(): string {
    return this._href.replace(
      `{${this.parameter.name}}`,
      encodeURIComponent(this.parameterValue.join(',')),
    );
  }

  toButtonActionComponent(): ButtonActionComponent {
    return new ButtonActionComponent(
      this._parent,
      this._label,
      this._href,
      this._type,
      undefined,
      this,
    );
  }
}
