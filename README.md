# @dialectlabs/blinks &mdash; the [Actions](https://github.com/dialectlabs/actions) Interface

## Usage
### Chrome Extension

Package provides an entrypoint function with styled for X Blink components

```ts
// contentScript.ts
import { setupTwitterObserver } from "@dialectlabs/blinks/ext/twitter";
import { ActionConfig } from "@dialectlabs/blinks";

// your RPC_URL is used to create a connection to confirm the transaction after action execution
setupTwitterObserver(new ActionConfig(RPC_URL, {
  signTransaction: async (tx: string) => { ... },
  connect: async () => { ... }
}))

// or

import { type ActionAdapter } from "@dialectlabs/blinks";

class MyActionAdapter implements ActionAdapter {
  async signTransaction(tx: string) { ... }
  async connect() { ... }
  async confirmTransaction(sig: string) { ... }
}

setupTwitterObserver(new MyActionAdapter());
```

