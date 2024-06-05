type ActionRule = {
  pathPattern: string;
  apiPath: string;
};

export type ActionsJsonConfig = {
  rules: ActionRule[];
};

export class ActionsURLMapper {
  private config: ActionsJsonConfig;

  constructor(config: ActionsJsonConfig) {
    this.config = config;
  }

  public mapUrl(url: string | URL): string | null {
    const urlStr = url.toString();
    const urlObj = new URL(url); // Parse the input URL
    const path = urlObj.pathname; // Extract the path from the URL
    const queryParams = urlObj.search; // Extract the query parameters from the URL

    for (const action of this.config.rules) {
      // Handle direct mapping without wildcards
      if (action.pathPattern === `${urlObj.origin}${path}`) {
        return `${action.apiPath}${queryParams}`;
      }

      // Create a regex pattern from the pathPattern by replacing '*' with '(.*)'
      // Example: "/artists/*/donate" -> /^\/artists\/(.*)\/donate$/
      const fullPattern = new RegExp(
        `^${action.pathPattern.replace(/\*/g, '(.*)')}$`,
      );

      // Determine if we should match against the full URL or just the path
      // Example: "https://example.com/special/*" should match against the full URL
      const match = (
        action.pathPattern.startsWith('http') ? urlStr : path
      ).match(fullPattern);

      if (match) {
        // Replace '*' in the apiPath with the captured groups from the match
        // Example: "/api/artists/*/donate" -> "/api/artists/123/donate"
        let mappedPath = action.apiPath;
        match.slice(1).forEach((group) => {
          mappedPath = mappedPath.replace(`*`, group);
        });

        // If the apiPath is a full URL, return it directly with query parameters
        // Example: "https://api.example.com/special/*" -> "https://api.example.com/special/feature?x=y"
        if (action.apiPath.startsWith('http')) {
          const mappedUrl = new URL(mappedPath);
          return `${mappedUrl.origin}${mappedUrl.pathname}${queryParams}`;
        }

        // Otherwise, construct the new URL based on the original origin with query parameters
        // Example: "/api/artists/123/donate?foo=bar"
        return `${urlObj.origin}${mappedPath}${queryParams}`;
      }
    }

    // If no match is found, return null
    return null;
  }
}
