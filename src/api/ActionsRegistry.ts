import { Action } from './Action';

export type LookupType = 'action' | 'website' | 'interstitial';

const DEFAULT_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export class ActionsRegistry {
  private static instance: ActionsRegistry | null = null;
  private actionsByHost: Record<string, RegisteredEntity>;
  private websitesByHost: Record<string, RegisteredEntity>;
  private interstitialsByHost: Record<string, RegisteredEntity>;

  private initPromise: Promise<ActionsRegistryConfig> | null = null;

  private constructor(config?: ActionsRegistryConfig) {
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

  public static getInstance(config?: ActionsRegistryConfig): ActionsRegistry {
    if (this.instance === null || config) {
      this.instance = new ActionsRegistry(config);
    }
    return this.instance;
  }

  public async init(): Promise<void> {
    if (this.initPromise !== null) {
      return;
    }
    await this.refresh();
    setInterval(() => this.refresh(), DEFAULT_REFRESH_INTERVAL);
  }

  public async refresh(): Promise<void> {
    this.initPromise = fetchActionsRegistryConfig();
    const config = await this.initPromise;
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
      return this.lookupAction(url);
    }

    if (type === 'website') {
      return this.lookupWebsite(url);
    }

    if (type === 'interstitial') {
      return this.lookupInterstitial(url);
    }

    return null;
  }

  private lookupAction(url: string | URL): RegisteredEntity | null {
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

export interface ActionsRegistryConfig {
  actions: RegisteredEntity[];
  websites: RegisteredEntity[];
  interstitials: RegisteredEntity[];
}

export interface RegisteredEntity {
  host: string;
  state: 'trusted' | 'malicious';
}

export type ExtendedActionState = RegisteredEntity['state'] | 'unknown';

export const mergeActionStates = (
  ...states: ExtendedActionState[]
): ExtendedActionState => {
  if (states.includes('malicious')) {
    return 'malicious';
  }

  if (states.includes('unknown')) {
    return 'unknown';
  }

  return 'trusted';
};

export const getExtendedActionState = (
  actionOrUrl: Action | string,
): ExtendedActionState => {
  return (
    ActionsRegistry.getInstance().lookup(
      typeof actionOrUrl === 'string' ? actionOrUrl : actionOrUrl.url,
      'action',
    )?.state ?? 'unknown'
  );
};

export const getExtendedWebsiteState = (url: string): ExtendedActionState => {
  return (
    ActionsRegistry.getInstance().lookup(url, 'website')?.state ?? 'unknown'
  );
};

export const getExtendedInterstitialState = (
  url: string,
): ExtendedActionState => {
  return (
    ActionsRegistry.getInstance().lookup(url, 'interstitial')?.state ??
    'unknown'
  );
};

async function fetchActionsRegistryConfig(): Promise<ActionsRegistryConfig> {
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
