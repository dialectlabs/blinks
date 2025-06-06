import { BlinkInstance } from './BlinkInstance';

// NOTE: `action` lookup type is replaced by `blink`, and will be removed in future versions
export type LookupType = 'action' | 'blink' | 'website' | 'interstitial';

const DEFAULT_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export class BlinksRegistry {
  private static instance: BlinksRegistry | null = null;
  private blinksByHost: Record<string, RegisteredEntity>;
  private websitesByHost: Record<string, RegisteredEntity>;
  private interstitialsByHost: Record<string, RegisteredEntity>;

  private intervalId: NodeJS.Timeout | null = null;

  private constructor(config?: BlinksRegistryConfig) {
    this.blinksByHost = config
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
    this.blinksByHost = Object.fromEntries(
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
  ): { state: SecurityBlinkState } {
    // If apiUrl param is present, check both URLs
    try {
      const probe = new URL(url.toString());
      const apiUrlParam = probe.searchParams.get('apiUrl');

      if (apiUrlParam) {
        // Check both current URL and target URL
        const currentUrlState = this.lookupInterstitialState(probe);
        const targetUrlState = this.lookupBlinkState(apiUrlParam);

        const mergedState = mergeBlinkStates(currentUrlState, targetUrlState);

        return {
          state: mergedState,
        };
      }
    } catch {
      // ignore malformed URL
    }

    if (type === 'action' || type === 'blink') {
      const state = this.lookupBlinkState(url);
      return {
        state,
      };
    }

    if (type === 'website') {
      const state = this.lookupWebsiteState(url);
      return {
        state,
      };
    }

    if (type === 'interstitial') {
      const state = this.lookupInterstitialState(url);
      return {
        state,
      };
    }

    return {
      state: 'unknown',
    };
  }

  private lookupBlinkState(url: string | URL): SecurityBlinkState {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'https:') {
        console.error(
          `[@dialectlabs/blinks] URL protocol must be https: ${url}`,
        );
        return 'unknown';
      }
      const host = urlObj.host;
      return this.blinksByHost[host]?.state ?? 'unknown';
    } catch (e) {
      console.error(
        `[@dialectlabs/blinks] Failed to lookup action for URL: ${url}`,
        e,
      );
      return 'unknown';
    }
  }

  private lookupWebsiteState(url: string | URL): SecurityBlinkState {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'https:') {
        console.error(
          `[@dialectlabs/blinks] URL protocol must be https: ${url}`,
        );
        return 'unknown';
      }
      const host = urlObj.host;
      return this.websitesByHost[host]?.state ?? 'unknown';
    } catch (e) {
      console.error(
        `[@dialectlabs/blinks] Failed to lookup website for URL: ${url}`,
        e,
      );
      return 'unknown';
    }
  }

  private lookupInterstitialState(url: string | URL): SecurityBlinkState {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'https:') {
        console.error(
          `[@dialectlabs/blinks] URL protocol must be https: ${url}`,
        );
        return 'unknown';
      }
      const host = urlObj.host;
      return this.interstitialsByHost[host]?.state ?? 'unknown';
    } catch (e) {
      console.error(
        `[@dialectlabs/blinks] Failed to lookup interstitial for URL: ${url}`,
        e,
      );
      return 'unknown';
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
      'blink',
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
