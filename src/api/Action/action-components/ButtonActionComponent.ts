import type { ActionsSpecPostRequestBody } from '../../actions-spec.ts';
import { AbstractActionComponent } from './AbstractActionComponent.ts';

export class ButtonActionComponent extends AbstractActionComponent {
  protected buildBody(account: string): ActionsSpecPostRequestBody {
    return { account };
  }

  get href(): string {
    return this._href;
  }
}
