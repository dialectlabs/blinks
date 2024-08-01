import type { ActionsSpecPostRequestBody } from '../../actions-spec.ts';
import { AbstractActionComponent } from './AbstractActionComponent.ts';
import { ButtonActionComponent } from './ButtonActionComponent.ts';
import { SingleValueActionComponent } from './SingleValueActionComponent.ts';

export class FormActionComponent extends AbstractActionComponent {
  private parameterValues: Record<string, string | string[]> = {};

  protected buildBody(account: string): ActionsSpecPostRequestBody {
    const paramNames = Object.keys(this.parameterValues);
    const bodyParams: string[] = [];

    paramNames.forEach((paramName) => {
      if (this._href.indexOf(`{${paramName}}`) === -1) {
        bodyParams.push(paramName);
      }
    });

    if (bodyParams.length > 0) {
      return {
        account,
        data: Object.fromEntries(
          paramNames.map((paramName) => [
            paramName,
            this.parameterValues[paramName],
          ]),
        ),
      };
    }

    return { account };
  }

  get href(): string {
    return this.parameters.reduce((href, param) => {
      const value = this.parameterValues[param.name];

      return href.replace(
        `{${param.name}}`,
        encodeURIComponent(
          typeof value === 'string' ? value : value?.join(','),
        ),
      );
    }, this._href);
  }

  public setValue(value: string | Array<string>, name: string) {
    this.parameterValues[name] = value;
  }

  toButtonActionComponent(): ButtonActionComponent {
    return new ButtonActionComponent(this._parent, this._label, this.href);
  }

  toInputActionComponent(paramName: string): SingleValueActionComponent {
    const parameter = this.parameters.find((param) => param.name === paramName);

    if (!parameter) {
      // very unlikely to happen
      throw new Error(`Input Parameter ${paramName} not found`);
    }

    return new SingleValueActionComponent(
      this._parent,
      this._label,
      this.href,
      [parameter],
    );
  }
}
