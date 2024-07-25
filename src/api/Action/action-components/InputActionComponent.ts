import { AbstractActionComponent } from './AbstractActionComponent.ts';

export class InputActionComponent extends AbstractActionComponent {
  private parameterValue: string | null = '';

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

  public get parameter() {
    const [param] = this.parameters;

    return param;
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
}
