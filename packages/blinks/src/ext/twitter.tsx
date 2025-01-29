import {
  type ActionsJsonConfig,
  type BlinkAdapter,
  type BlinkCallbacksConfig,
  BlinkInstance,
  BlinksRegistry,
  type BlinkSupportStrategy,
  BlinksURLMapper,
  checkSecurity,
  defaultBlinkSupportStrategy,
  getExtendedBlinkState,
  getExtendedInterstitialState,
  getExtendedWebsiteState,
  isInterstitial,
  proxify,
  type SecurityLevel,
} from '@dialectlabs/blinks-core';
import { createRoot } from 'react-dom/client';
import { BlinkComponent, type StylePreset } from '../ui';

type ObserverSecurityLevel = SecurityLevel;

const noop = () => {};

export interface ObserverOptions {
  // trusted > unknown > malicious
  securityLevel:
    | ObserverSecurityLevel
    | Record<'websites' | 'interstitials' | 'actions', ObserverSecurityLevel>;
  supportStrategy: BlinkSupportStrategy;
}

interface NormalizedObserverOptions {
  securityLevel: Record<
    'websites' | 'interstitials' | 'actions',
    ObserverSecurityLevel
  >;
  supportStrategy: BlinkSupportStrategy;
}

const DEFAULT_OPTIONS: ObserverOptions = {
  securityLevel: 'only-trusted',
  supportStrategy: defaultBlinkSupportStrategy,
};

const normalizeOptions = (
  options: Partial<ObserverOptions>,
): NormalizedObserverOptions => {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
    securityLevel: (() => {
      if (!options.securityLevel) {
        return {
          websites: DEFAULT_OPTIONS.securityLevel as ObserverSecurityLevel,
          interstitials: DEFAULT_OPTIONS.securityLevel as ObserverSecurityLevel,
          actions: DEFAULT_OPTIONS.securityLevel as ObserverSecurityLevel,
        };
      }

      if (typeof options.securityLevel === 'string') {
        return {
          websites: options.securityLevel,
          interstitials: options.securityLevel,
          actions: options.securityLevel,
        };
      }

      return options.securityLevel;
    })(),
  };
};

export function setupTwitterObserver(
  config: BlinkAdapter,
  callbacks: Partial<BlinkCallbacksConfig> = {},
  options: Partial<ObserverOptions> = DEFAULT_OPTIONS,
) {
  const mergedOptions = normalizeOptions(options);
  const twitterReactRoot = document.getElementById('react-root')!;

  const refreshRegistry = async () => {
    return BlinksRegistry.getInstance().init();
  };

  // if we don't have the registry, then we don't show anything
  refreshRegistry().then(() => {
    // entrypoint
    const observer = new MutationObserver((mutations) => {
      // it's fast to iterate like this
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];

        for (let j = 0; j < mutation.addedNodes.length; j++) {
          const node = mutation.addedNodes[j];
          if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
          }
          handleNewNode(
            node as Element,
            config,
            callbacks,
            mergedOptions,
          ).catch(noop);
        }
      }
    });

    observer.observe(twitterReactRoot, { childList: true, subtree: true });
  });
}

async function handleNewNode(
  node: Element,
  config: BlinkAdapter,
  callbacks: Partial<BlinkCallbacksConfig>,
  options: NormalizedObserverOptions,
) {
  const element = node as Element;
  // first quick filtration
  if (!element || element.localName !== 'div') {
    return;
  }

  let anchor;

  const linkPreview = findLinkPreview(element);

  let container = findContainerInTweet(
    linkPreview?.card ?? element,
    Boolean(linkPreview),
  );
  if (linkPreview) {
    anchor = linkPreview.anchor;
    container && container.remove();
    container = linkPreview.card.parentElement as HTMLElement;
  } else {
    if (container) {
      return;
    }
    const link = findLastLinkInText(element);
    if (link) {
      anchor = link.anchor;
      container = getContainerForLink(link.tweetText);
    }
  }

  if (!anchor || !container) return;

  const shortenedUrl = anchor.href;
  const blinkUrl = await resolveTwitterShortenedUrl(shortenedUrl);
  const interstitialData = isInterstitial(blinkUrl);

  let blinkApiUrl: string | null;
  if (interstitialData.isInterstitial) {
    const interstitialState = getExtendedInterstitialState(blinkUrl.toString());

    if (
      !checkSecurity(interstitialState, options.securityLevel.interstitials)
    ) {
      return;
    }

    blinkApiUrl = interstitialData.decodedActionUrl;
  } else {
    const websiteState = getExtendedWebsiteState(blinkUrl.toString());

    if (!checkSecurity(websiteState, options.securityLevel.websites)) {
      return;
    }

    const actionsJsonUrl = blinkUrl.origin + '/actions.json';
    const { url: proxyUrl, headers: proxyHeaders } = proxify(actionsJsonUrl);
    const actionsJson = await fetch(proxyUrl, {
      headers: proxyHeaders,
    }).then((res) => res.json() as Promise<ActionsJsonConfig>);

    const blinksUrlMapper = new BlinksURLMapper(actionsJson);

    blinkApiUrl = blinksUrlMapper.mapUrl(blinkUrl);
  }

  const state = blinkApiUrl ? getExtendedBlinkState(blinkApiUrl) : null;
  if (
    !blinkApiUrl ||
    !state ||
    !checkSecurity(state, options.securityLevel.actions)
  ) {
    return;
  }

  const blink = await BlinkInstance.fetch(
    blinkApiUrl,
    options.supportStrategy,
  ).catch(noop);

  if (!blink) {
    return;
  }

  const { container: blinkContainer, reactRoot } = createBlink({
    config,
    originalUrl: blinkUrl,
    blink,
    callbacks,
    options,
    isInterstitial: interstitialData.isInterstitial,
  });

  addStyles(container).replaceChildren(blinkContainer);

  new MutationObserver((mutations, observer) => {
    for (const mutation of mutations) {
      for (const removedNode of Array.from(mutation.removedNodes)) {
        if (
          removedNode === blinkContainer ||
          !document.body.contains(blinkContainer)
        ) {
          reactRoot.unmount();
          observer.disconnect();
        }
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}

function createBlink({
  originalUrl,
  blink,
  callbacks,
  options,
  config,
}: {
  originalUrl: URL;
  blink: BlinkInstance;
  callbacks: Partial<BlinkCallbacksConfig>;
  options: NormalizedObserverOptions;
  isInterstitial: boolean;
  config: BlinkAdapter;
}) {
  const container = document.createElement('div');
  container.className = 'dialect-blink-root-container';

  const blinkRoot = createRoot(container);

  blinkRoot.render(
    <div onClick={(e) => e.stopPropagation()}>
      <BlinkComponent
        adapter={config}
        stylePreset={resolveXStylePreset()}
        blink={blink}
        websiteUrl={originalUrl.toString()}
        websiteText={originalUrl.hostname}
        callbacks={callbacks}
        securityLevel={options.securityLevel}
      />
    </div>,
  );

  return { container, reactRoot: blinkRoot };
}

const resolveXStylePreset = (): StylePreset => {
  const colorScheme = document.querySelector('html')?.style.colorScheme;

  if (colorScheme) {
    return colorScheme === 'dark' ? 'x-dark' : 'x-light';
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'x-dark' : 'x-light';
};

async function resolveTwitterShortenedUrl(shortenedUrl: string): Promise<URL> {
  const res = await fetch(shortenedUrl);
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const actionUrl = doc.querySelector('title')?.textContent;
  return new URL(actionUrl!);
}

function findElementByTestId(element: Element, testId: string) {
  if (element.attributes.getNamedItem('data-testid')?.value === testId) {
    return element;
  }
  return element.querySelector(`[data-testid="${testId}"]`);
}

function findContainerInTweet(element: Element, searchUp?: boolean) {
  const message = searchUp
    ? (element.closest(`[data-testid="tweet"]`) ??
      element.closest(`[data-testid="messageEntry"]`))
    : (findElementByTestId(element, 'tweet') ??
      findElementByTestId(element, 'messageEntry'));

  if (message) {
    return message.querySelector('.dialect-wrapper') as HTMLElement;
  }
  return null;
}

function findLinkPreview(element: Element) {
  const card = findElementByTestId(element, 'card.wrapper');
  if (!card) {
    return null;
  }

  const anchor = card.children[0]?.children[0] as HTMLAnchorElement;

  return anchor ? { anchor, card } : null;
}

function findLastLinkInText(element: Element) {
  const tweetText = findElementByTestId(element, 'tweetText');
  if (!tweetText) {
    return null;
  }

  const links = tweetText.getElementsByTagName('a');
  if (links.length > 0) {
    const anchor = links[links.length - 1] as HTMLAnchorElement;
    return { anchor, tweetText };
  }
  return null;
}

function getContainerForLink(tweetText: Element) {
  const root = document.createElement('div');
  root.className = 'dialect-wrapper';
  const dm = tweetText.closest(`[data-testid="messageEntry"]`);
  if (dm) {
    root.classList.add('dialect-dm');
    tweetText.parentElement?.parentElement?.prepend(root);
  } else {
    tweetText.parentElement?.append(root);
  }
  return root;
}

function addStyles(element: HTMLElement) {
  if (element && element.classList.contains('dialect-wrapper')) {
    element.style.marginTop = '12px';
    if (element.classList.contains('dialect-dm')) {
      element.style.marginBottom = '8px';
      element.style.width = '100%';
      element.style.minWidth = '350px';
    }
  }
  return element;
}
