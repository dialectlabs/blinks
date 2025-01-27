import { BlinkInstance } from './Action';

export type LookupType = 'action' | 'website' | 'interstitial';

const DEFAULT_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export class BlinksRegistry {
  private static instance: BlinksRegistry | null = null;
  private actionsByHost: Record<string, RegisteredEntity>;
  private websitesByHost: Record<string, RegisteredEntity>;
  private interstitialsByHost: Record<string, RegisteredEntity>;

  private intervalId: NodeJS.Timeout | null = null;

  private constructor(config?: BlinksRegistryConfig) {
    this.actionsByHost = config
      ? Object.fromEntries(
          config.actions.map((action) => [action.host, action]),
        )
      : {};

    this.websitesByHost = config
      ? Object.fromEntries(
          config.websites.map((website) => [website.host, website]),
        )
      : {};

    this.interstitialsByHost = config
      ? Object.fromEntries(
          config.interstitials.map((interstitial) => [
            interstitial.host,
            interstitial,
          ]),
        )
      : {};
  }

  public static getInstance(config?: BlinksRegistryConfig): BlinksRegistry {
    if (this.instance === null || config) {
      this.instance = new BlinksRegistry(config);
    }
    return this.instance;
  }

  public async init(): Promise<void> {
    if (this.intervalId !== null) {
      return;
    }
    await this.refresh();
    this.intervalId = setInterval(
      () => this.refresh(),
      DEFAULT_REFRESH_INTERVAL,
    );
  }

  public stopRefresh(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public async refresh(): Promise<void> {
    const config = await fetchBlinksRegistryConfig();
    this.actionsByHost = Object.fromEntries(
      config.actions.map((action) => [action.host, action]),
    );
    this.websitesByHost = Object.fromEntries(
      config.websites.map((website) => [website.host, website]),
    );
    this.interstitialsByHost = Object.fromEntries(
      config.interstitials.map((interstitial) => [
        interstitial.host,
        interstitial,
      ]),
    );
  }

  public lookup(
    url: string | URL,
    type: LookupType = 'action',
  ): RegisteredEntity | null {
    if (type === 'action') {
      return this.lookupBlink(url);
    }

    if (type === 'website') {
      return this.lookupWebsite(url);
    }

    if (type === 'interstitial') {
      return this.lookupInterstitial(url);
    }

    return null;
  }

  private lookupBlink(url: string | URL): RegisteredEntity | null {
    try {
      const urlObj = new URL(url);
      const host = urlObj.host;
      return this.actionsByHost[host] ?? null;
    } catch (e) {
      console.error(
        `[@dialectlabs/blinks] Failed to lookup action for URL: ${url}`,
        e,
      );
      return null;
    }
  }

  private lookupWebsite(url: string | URL): RegisteredEntity | null {
    try {
      const urlObj = new URL(url);
      const host = urlObj.host;
      return this.websitesByHost[host] ?? null;
    } catch (e) {
      console.error(
        `[@dialectlabs/blinks] Failed to lookup website for URL: ${url}`,
        e,
      );
      return null;
    }
  }

  private lookupInterstitial(url: string | URL): RegisteredEntity | null {
    try {
      const urlObj = new URL(url);
      const host = urlObj.host;
      return this.interstitialsByHost[host] ?? null;
    } catch (e) {
      console.error(
        `[@dialectlabs/blinks] Failed to lookup interstitial for URL: ${url}`,
        e,
      );
      return null;
    }
  }
}

export interface BlinksRegistryConfig {
  actions: RegisteredEntity[];
  websites: RegisteredEntity[];
  interstitials: RegisteredEntity[];
}

export interface RegisteredEntity {
  host: string;
  state: 'trusted' | 'malicious';
}

export type SecurityBlinkState = RegisteredEntity['state'] | 'unknown';

export const mergeBlinkStates = (
  ...states: SecurityBlinkState[]
): SecurityBlinkState => {
  if (states.includes('malicious')) {
    return 'malicious';
  }

  if (states.includes('unknown')) {
    return 'unknown';
  }

  return 'trusted';
};

export const getExtendedBlinkState = (
  blinkOrUrl: BlinkInstance | string,
): SecurityBlinkState => {
  return (
    BlinksRegistry.getInstance().lookup(
      typeof blinkOrUrl === 'string' ? blinkOrUrl : blinkOrUrl.url,
      'action',
    )?.state ?? 'unknown'
  );
};

export const getExtendedWebsiteState = (url: string): SecurityBlinkState => {
  return (
    BlinksRegistry.getInstance().lookup(url, 'website')?.state ?? 'unknown'
  );
};

export const getExtendedInterstitialState = (
  url: string,
): SecurityBlinkState => {
  return (
    BlinksRegistry.getInstance().lookup(url, 'interstitial')?.state ?? 'unknown'
  );
};

async function fetchBlinksRegistryConfig(): Promise<BlinksRegistryConfig> {
  try {
    const response = await fetch('https://actions-registry.dial.to/all');

    if (!response.ok) {
      console.error(
        '[@dialectlabs/blinks] Failed to fetch actions registry config',
        await response.json(),
      );
      return { actions: [], interstitials: [], websites: [] };
    }

    return await response.json();
  } catch (e) {
    console.error(
      '[@dialectlabs/blinks] Failed to fetch actions registry config',
      e,
    );
    return { actions: [], interstitials: [], websites: [] };
  }
}

// backwards compatibility
export {
  BlinksRegistry as ActionsRegistry,
  fetchBlinksRegistryConfig as fetchActionsRegistryConfig,
  getExtendedBlinkState as getExtendedActionState,
  mergeBlinkStates as mergeActionStates,
  type BlinksRegistryConfig as ActionsRegistryConfig,
  type SecurityBlinkState as SecurityActionState,
};
