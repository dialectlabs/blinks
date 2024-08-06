import type {
  ActionParameter,
  ActionParameterType,
  GeneralParameterType,
} from '../../actions-spec.ts';
import { Action } from '../Action.ts';
import { AbstractActionComponent } from './AbstractActionComponent.ts';
import { ButtonActionComponent } from './ButtonActionComponent.ts';

export class SingleValueActionComponent extends AbstractActionComponent {
  private parameterValue: string | null = null;

  constructor(
    protected _parent: Action,
    protected _label: string,
    protected _href: string,
    protected _parameters?: ActionParameter<ActionParameterType>[],
    protected _parentComponent?: AbstractActionComponent,
  ) {
    super(_parent, _label, _href, _parameters);
  }

  get parentComponent() {
    return this._parentComponent ?? null;
  }

  protected buildBody(account: string) {
    if (this._href.indexOf(`{${this.parameter.name}}`) > -1) {
      return { account };
    }

    return {
      account,
      params: {
        [this.parameter.name]: this.parameterValue,
      },
    };
  }

  public get parameter(): ActionParameter<GeneralParameterType> {
    const [param] = this.parameters;

    return param as ActionParameter<GeneralParameterType>;
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
      undefined,
      this,
    );
  }
}
