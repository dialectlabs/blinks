import type { ActionsSpecPostRequestBody } from '../../actions-spec.ts';
import { AbstractActionComponent } from './AbstractActionComponent.ts';

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

  public get parameter() {
    const [param] = this.parameters;

    return param;
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
}
