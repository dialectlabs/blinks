# @dialectlabs/blinks &mdash; the [Actions](https://github.com/dialectlabs/actions) Interface

## Usage
### Style Presets & Overriding Theme

#### Style Presets
`Blink` component contains a `stylePreset` prop that accepts the following values:
* `default` - [dial.to](https://dial.to)-styled blink (light)
* `x-dark` - [X](https://x.com/)-styled blink (dark)
* `x-light` - [X](https://x.com/)-styled blink (light)
* `custom` - clean slate, no colors, radii at all, use CSS Variables to style. See [Overriding Theme](#overriding-theme). 

```tsx
import '@dialectlabs/blinks/index.css';
import { Blink } from "@dialectlabs/blinks";

<Blink stylePreset="x-dark" ... />
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
  --blink-button-success: #00ae661a;
  --blink-icon-error: #ff6565;
  --blink-icon-error-hover: #ff7a7a;
  --blink-icon-primary: #6e767d;
  --blink-icon-primary-hover: #949ca4;
  --blink-icon-warning: #ffb545;
  --blink-icon-warning-hover: #ffc875;
  --blink-input-bg: #202327;
  --blink-input-stroke: #3d4144;
  --blink-input-stroke-disabled: #2f3336;
  --blink-input-stroke-error: #ff6565;
  --blink-input-stroke-hover: #6e767d;
  --blink-input-stroke-selected: #1d9bf0;
  --blink-stroke-error: #ff6565;
  --blink-stroke-primary: #1d9bf0;
  --blink-stroke-secondary: #3d4144;
  --blink-stroke-warning: #ffb545;
  --blink-text-brand: #35aeff;
  --blink-text-button: #ffffff;
  --blink-text-button-disabled: #768088;
  --blink-text-button-success: #12dc88;
  --blink-text-error: #ff6565;
  --blink-text-error-hover: #ff7a7a;
  --blink-text-input: #ffffff;
  --blink-text-input-disabled: #566470;
  --blink-text-input-placeholder: #6e767d;
  --blink-text-link: #6e767d;
  --blink-text-link-hover: #949ca4;
  --blink-text-primary: #ffffff;
  --blink-text-secondary: #949ca4;
  --blink-text-success: #12dc88;
  --blink-text-warning: #ffb545;
  --blink-text-warning-hover: #ffc875;
  --blink-transparent-error: #aa00001a;
  --blink-transparent-grey: #6e767d1a;
  --blink-transparent-warning: #a966001a;

  --blink-border-radius-rounded-lg: 0.25rem;
  --blink-border-radius-rounded-xl: 0.5rem;
  --blink-border-radius-rounded-2xl: 1.125rem;
  --blink-border-radius-rounded-button: 624.9375rem;
  --blink-border-radius-rounded-input: 624.9375rem;

  /* box-shadow */
  --blink-shadow-container: 0px 2px 8px 0px rgba(59, 176, 255, 0.22), 0px 1px 48px 0px rgba(29, 155, 240, 0.24);
}
```

> be sure to import these overrides after @dialectlabs/blinks styles (or by [CSS Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity) as suggested above)

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
