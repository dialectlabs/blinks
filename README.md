# @dialectlabs/blinks &mdash; the [Actions](https://github.com/dialectlabs/actions) Interface

## Usage
### Style Presets & Overriding Theme

#### Style Presets
`ActionContainer` contains a `stylePreset` prop that accepts the following values:
* `default` - [dial.to](https://dial.to)-styled blink (light)
* `x-dark` - [X](https://x.com/)-styled blink (dark)
* `x-light` - [X](https://x.com/)-styled blink (light)
* `custom` - clean slate, no colors at all, use CSS Variables to style. See [Overriding Theme](#overriding-theme). 

```tsx
import { ActionContainer } from "@dialectlabs/blinks";

<ActionContainer stylePreset="x-dark" ... />
```

#### Overriding Theme

In your CSS, you can override the following CSS Variables to customize the look of the blink:

```css
/* x-dark */
.blink.x-dark {
  --blink-bg-primary: #202327;
  --blink-button: #1d9bf0;
  --blink-button-disabled: #2f3336;
  --blink-button-hover: #3087da;
  --blink-icon-error: #ff6565;
  --blink-icon-error-hover: #ff7a7a;
  --blink-icon-primary: #6e767d;
  --blink-icon-primary-hover: #949ca4;
  --blink-icon-warning: #ffb545;
  --blink-icon-warning-hover: #ffc875;
  --blink-stroke-brand: #1d9bf0;
  --blink-stroke-error: #ff6565;
  --blink-stroke-primary: #3d4144;
  --blink-stroke-secondary: #3d4144;
  --blink-stroke-warning: #ffb545;
  --blink-text-brand: #35aeff;
  --blink-text-button: #ffffff;
  --blink-text-error: #ff6565;
  --blink-text-error-hover: #ff7a7a;
  --blink-text-hover: #949ca4;
  --blink-text-primary: #ffffff;
  --blink-text-secondary: #949ca4;
  --blink-text-success: #12dc88;
  --blink-text-tertiary: #6e767d;
  --blink-text-warning: #ffb545;
  --blink-text-warning-hover: #ffc875;
  --blink-transparent-error: #aa00001a;
  --blink-transparent-grey: #6e767d1a;
  --blink-transparent-warning: #a966001a;
}
```

> be sure to import these overrides after @dialectlabs/blinks styles

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

## Learn More:

- [Join our Discord](https://discord.gg/saydialect) - join the community and ask us a question
