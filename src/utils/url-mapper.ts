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
    // Ensure the input is a URL object
    const urlObj = typeof url === 'string' ? new URL(url) : url;
    const queryParams = urlObj.search; // Extract the query parameters from the URL

    for (const action of this.config.rules) {
      // Handle direct mapping without wildcards
      if (this.isExactMatch(action.pathPattern, urlObj)) {
        return `${action.apiPath}${queryParams}`;
      }

      // Match the pattern with the URL
      const match = this.matchPattern(action.pathPattern, urlObj);

      if (match) {
        // Construct the mapped URL if there's a match
        return this.constructMappedUrl(
          action.apiPath,
          match,
          queryParams,
          urlObj.origin,
        );
      }
    }

    // If no match is found, return null
    return null;
  }

  // Helper method to check for exact match
  private isExactMatch(pattern: string, urlObj: URL): boolean {
    return pattern === `${urlObj.origin}${urlObj.pathname}`;
  }

  // Helper method to match the URL with the pattern
  private matchPattern(pattern: string, urlObj: URL): RegExpMatchArray | null {
    const fullPattern = new RegExp(
      `^${pattern.replace(/\*\*/g, '(.*)').replace(/\/(\*)/g, '/([^/]+)')}$`,
    );

    const urlToMatch = pattern.startsWith('http')
      ? urlObj.toString()
      : urlObj.pathname;
    return urlToMatch.match(fullPattern);
  }

  // Helper method to construct the mapped URL
  private constructMappedUrl(
    apiPath: string,
    match: RegExpMatchArray,
    queryParams: string,
    origin: string,
  ): string {
    let mappedPath = apiPath;
    match.slice(1).forEach((group) => {
      mappedPath = mappedPath.replace(/\*+/, group);
    });

    if (apiPath.startsWith('http')) {
      const mappedUrl = new URL(mappedPath);
      return `${mappedUrl.origin}${mappedUrl.pathname}${queryParams}`;
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
