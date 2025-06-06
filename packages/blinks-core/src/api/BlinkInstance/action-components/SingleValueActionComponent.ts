import type {
  ActionPostRequest,
  GeneralParameterType,
  LinkedActionType,
  TypedActionParameter,
} from '../../actions-spec.ts';
import { BlinkInstance } from '../BlinkInstance.ts';
import { AbstractActionComponent } from './AbstractActionComponent.ts';
import { ButtonActionComponent } from './ButtonActionComponent.ts';

export class SingleValueActionComponent extends AbstractActionComponent {
  private parameterValue: string | null = null;

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

  protected buildBody(account: string): ActionPostRequest<any> {
    if (
      this._href.indexOf(`{${this.parameter.name}}`) > -1 ||
      this.parameterValue === null
    ) {
      return { account, type: this.type };
    }

    return {
      account,
      type: this.type,
      data: {
        [this.parameter.name]: this.parameterValue,
      },
    };
  }

  public get parameter(): TypedActionParameter<GeneralParameterType> {
    const [param] = this.parameters;

    return param as TypedActionParameter<GeneralParameterType>;
  }

  public setValue(value: string) {
    this.parameterValue = value;
  }

  get href(): string {
    return this._href.replace(
      `{${this.parameter.name}}`,
      encodeURIComponent(this.parameterValue?.toString().trim() ?? ''),
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
