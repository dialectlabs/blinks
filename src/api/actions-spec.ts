import type {
  SolanaPaySpecGetResponse,
  SolanaPaySpecPostRequestBody,
  SolanaPaySpecPostResponse,
} from './solana-pay-spec'; // DTOs

// A common error data structure that should be used in all responses for error indication,
// can be used in both GET and POST and extended with additional fields if needed
export interface ActionError {
  message: string;
}

// Error response that can be used in both GET and POST for non 200 status codes
// interoperable with: https://github.com/anza-xyz/solana-pay/blob/master/SPEC1.1.md#error-handling
export interface ActionsSpecErrorResponse extends ActionError {}

export interface ActionsSpecGetResponse extends SolanaPaySpecGetResponse {
  icon: string; // image
  label: string; // button text
  title: string;
  description: string;
  disabled?: boolean; // allows to model invalid state of the action e.g. nft sold out
  links?: {
    // linked actions inspired by HAL https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-11
    actions: LinkedAction[];
  };
  // optional error indication for non-fatal errors, if present client should display it to the user
  // doesn't prevent client from interpreting the action or displaying it to the user
  // e.g. can be used together with 'disabled' to display the reason: business constraints, authorization
  error?: ActionError;
}

// Linked action inspired by HAL https://datatracker.ietf.org/doc/html/draft-kelly-json-hal-11
export interface LinkedAction {
  href: string; // solana pay/actions get/post url
  label: string; // button text
  // optional parameters for the action, e.g. input fields, inspired by OpenAPI
  // enforcing single parameter for now for simplicity and determenistic client UIs
  // can be extended to multiple inputs w/o breaking change by switching to Parameter[]
  // note: there are no use-cases for multiple parameters atm, e.g. farcaster frames also have just single input
  parameters?: TypedParameter[];
}

export type GeneralParameterType =
  | 'text'
  | 'email'
  | 'url'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'textarea';

export type SelectableParameterType = 'select' | 'radio' | 'checkbox';

export type ParameterType = GeneralParameterType | SelectableParameterType;

type MinMax<T extends ParameterType> = T extends 'date' | 'datetime-local'
  ? string
  : T extends 'radio' | 'select'
    ? never
    : number;

export interface Parameter<T extends ParameterType, M = MinMax<T>> {
  /** input field type */
  type?: T;
  /** regular expression pattern to validate user input client side */
  pattern?: string;
  /** human-readable description of the `pattern` */
  patternDescription?: string;
  /** parameter name in url */
  name: string;
  /** input placeholder */
  label?: string;
  /** input required */
  required?: boolean;
  min?: M;
  max?: M;
}

export interface ParameterSelectable<T extends ParameterType>
  extends Omit<Parameter<T>, 'pattern' | 'patternDescription'> {
  options: Array<{
    /** displayed UI label of this selectable option */
    label: string;
    /** value of this selectable option */
    value: string;
    /** whether this option should be selected by default */
    selected?: boolean;
  }>;
}

export type TypedParameter<T extends ParameterType = ParameterType> =
  T extends SelectableParameterType ? ParameterSelectable<T> : Parameter<T>;

export interface ActionsSpecPostRequestBody<V extends string = string>
  extends SolanaPaySpecPostRequestBody {
  data?: Record<V, string | string[]>;
}

// Almost no changes, omitting old `redirect`
export interface ActionsSpecPostResponse
  extends Omit<SolanaPaySpecPostResponse, 'redirect'> {}
