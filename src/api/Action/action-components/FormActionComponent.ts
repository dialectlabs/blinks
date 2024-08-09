import type {
  ActionPostRequest,
  TypedActionParameter,
} from '../../actions-spec.ts';
import { Action } from '../Action.ts';
import { AbstractActionComponent } from './AbstractActionComponent.ts';
import { ButtonActionComponent } from './ButtonActionComponent.ts';
import { SingleValueActionComponent } from './SingleValueActionComponent.ts';

export class FormActionComponent extends AbstractActionComponent {
  private parameterValues: Record<string, string | string[]> = {};

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

  // any, since we don't know the parameter names on the client level
  protected buildBody(account: string): ActionPostRequest<any> {
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
          paramNames
            .filter((name) => bodyParams.includes(name))
            .map((paramName) => [paramName, this.parameterValues[paramName]]),
        ),
      };
    }

    return { account };
  }

  get href(): string {
    const replacedHref = this.parameters.reduce((href, param) => {
      const value = this.parameterValues[param.name];

      if (!value) {
        return href;
      }

      return href.replace(
        `{${param.name}}`,
        encodeURIComponent(
          typeof value === 'string' ? value : value?.join(','),
        ),
      );
    }, this._href);

    return replacedHref
      .replaceAll(/={[^}]+}&/g, '=&')
      .replaceAll(/={[^}]+}/g, '=');
  }

  public setValue(value: string | Array<string>, name: string) {
    this.parameterValues[name] = value;
  }

  toButtonActionComponent(): ButtonActionComponent {
    return new ButtonActionComponent(
      this._parent,
      this._label,
      this.href,
      undefined,
      this,
    );
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
      this._href,
      [parameter],
      this,
    );
  }
}
