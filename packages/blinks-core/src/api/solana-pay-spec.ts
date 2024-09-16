// GET
export interface SolanaPaySpecGetResponse {
  label: string;
  icon: string;
}

// POST
export interface SolanaPaySpecPostRequestBody {
  account: string; // transaction signer public key
}

export interface SolanaPaySpecPostResponse {
  transaction: string; // base64-encoded serialized transaction
  message?: string; // the nature of the transaction response e.g. the name of an item being purchased
  redirect?: string; // redirect URL after the transaction is successful
}
