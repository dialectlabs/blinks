import type {
  ActionsSpecPostRequestBody,
  SelectableParameterType,
  TypedParameter,
} from '../../actions-spec.ts';
import { AbstractActionComponent } from './AbstractActionComponent.ts';
import { ButtonActionComponent } from './ButtonActionComponent.ts';

export class SelectableInputActionComponent extends AbstractActionComponent {
  private parameterValue: Array<string> = [];

  protected buildBody(account: string): ActionsSpecPostRequestBody {
    if (this._href.indexOf(`{${this.parameter.name}}`) > -1) {
      return { account };
    }

    return {
      account,
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

  public get parameter(): TypedParameter<SelectableParameterType> {
    const [param] = this.parameters;

    return param as TypedParameter<SelectableParameterType>;
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
    return new ButtonActionComponent(this._parent, this._label, this.href);
  }
}
