import { SOLANA_ACTION_PREFIX } from './constants';
import { isInterstitial } from './interstitial-url';
import { proxify } from './proxify';

type Action = {
  pathPattern: string;
  apiPath: string;
};

export type ActionsJsonConfig = {
  rules: Action[];
};

export class ActionsURLMapper {
  private config: ActionsJsonConfig;

  constructor(config: ActionsJsonConfig) {
    this.config = config;
  }

  public mapUrl(url: string | URL): string | null {
    console.log("Looking for URL: ", url);
    const urlObj = typeof url === 'string' ? new URL(url) : url;
    const queryParams = urlObj.search;
    const fullPath = `${urlObj.origin}${urlObj.pathname}`;

    for (const action of this.config.rules) {
      const normalizedPattern = this.normalizePattern(action.pathPattern, urlObj.origin);
      const match = this.matchPattern(normalizedPattern, fullPath);

      if (match) {
        return this.constructMappedUrl(
          action.apiPath,
          match,
          queryParams,
          urlObj.origin,
        );
      }
    }

    return null;
  }

  private normalizePattern(pattern: string, origin: string): string {
    return pattern.startsWith('http') ? pattern : `${origin}${pattern}`;
  }

  private matchPattern(pattern: string, fullPath: string): RegExpMatchArray | null {
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '(.*)')
      .replace(/\*/g, '([^/]+)');

    const fullPattern = new RegExp(`^${regexPattern}$`);
    return fullPath.match(fullPattern);
  }

  private constructMappedUrl(
    apiPath: string,
    match: RegExpMatchArray,
    queryParams: string,
    origin: string,
  ): string {
    let mappedPath = apiPath;
    
    // Replace wildcards with captured groups
    match.slice(1).forEach((group, index) => {
      mappedPath = mappedPath.replace(/\*+/, group);
    });

    // If there are remaining wildcards, remove them
    mappedPath = mappedPath.replace(/\*+/g, '');

    if (apiPath.startsWith('http')) {
      const mappedUrl = new URL(mappedPath);
      return `${mappedUrl.origin}${mappedUrl.pathname}${queryParams}`;
    }

    // Handle cases where apiPath doesn't start with a slash
    if (!mappedPath.startsWith('/')) {
      mappedPath = '/' + mappedPath;
    }

    return `${origin}${mappedPath}${queryParams}`;
  }
}

export async function unfurlUrlToActionApiUrl(
  actionUrl: URL | string,
): Promise<string | null> {
  const url = new URL(actionUrl);
  const strUrl = actionUrl.toString();
  // case 1: if the URL is a solana action URL
  if (SOLANA_ACTION_PREFIX.test(strUrl)) {
    return strUrl.replace(SOLANA_ACTION_PREFIX, '');
  }

  // case 2: if the URL is an interstitial URL
  const interstitialData = isInterstitial(url);
  if (interstitialData.isInterstitial) {
    return interstitialData.decodedActionUrl;
  }

  // case 3: if the URL is a website URL which has action.json

  const actionsJsonUrl = url.origin + '/actions.json';
  const actionsJson = await fetch(proxify(actionsJsonUrl)).then(
    (res) => res.json() as Promise<ActionsJsonConfig>,
  );

  const actionsUrlMapper = new ActionsURLMapper(actionsJson);

  return actionsUrlMapper.mapUrl(url);
}
