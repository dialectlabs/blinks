const solanaActionPrefix = /^(solana-action:|solana:)/;

export type IsInterstitialResult =
  | {
      isInterstitial: true;
      decodedActionUrl: string;
    }
  | {
      isInterstitial: false;
    };

export function isInterstitial(url: string | URL): IsInterstitialResult {
  try {
    const urlObj = new URL(url);

    const actionUrl = urlObj.searchParams.get('action');
    if (!actionUrl) {
      return { isInterstitial: false };
    }
    const urlDecodedActionUrl = decodeURIComponent(actionUrl);

    if (!solanaActionPrefix.test(urlDecodedActionUrl)) {
      return { isInterstitial: false };
    }

    const decodedActionUrl = urlDecodedActionUrl.replace(
      solanaActionPrefix,
      '',
    );

    // Validate the decoded action URL
    const decodedActionUrlObj = new URL(decodedActionUrl);

    return {
      isInterstitial: true,
      decodedActionUrl: decodedActionUrlObj.toString(),
    };
  } catch (e) {
    console.error(`Failed to check if URL is interstitial: ${url}`, e);
    return { isInterstitial: false };
  }
}
