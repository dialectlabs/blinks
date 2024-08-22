import { createRoot } from 'react-dom/client';
import {
  Action,
  type ActionAdapter,
  type ActionCallbacksConfig,
  ActionsRegistry,
  type ActionSupportStrategy,
  defaultActionSupportStrategy,
  getExtendedActionState,
  getExtendedInterstitialState,
  getExtendedWebsiteState,
} from '../api';
import { checkSecurity, type SecurityLevel } from '../shared';
import { ActionContainer, type StylePreset } from '../ui';
import { noop } from '../utils/constants';
import { isInterstitial } from '../utils/interstitial-url.ts';
import { proxify } from '../utils/proxify.ts';
import { type ActionsJsonConfig, ActionsURLMapper } from '../utils/url-mapper';

type ObserverSecurityLevel = SecurityLevel;

export interface ObserverOptions {
  // trusted > unknown > malicious
  securityLevel:
    | ObserverSecurityLevel
    | Record<'websites' | 'interstitials' | 'actions', ObserverSecurityLevel>;
  supportStrategy: ActionSupportStrategy;
}

interface NormalizedObserverOptions {
  securityLevel: Record<
    'websites' | 'interstitials' | 'actions',
    ObserverSecurityLevel
  >;
  supportStrategy: ActionSupportStrategy;
}

const DEFAULT_OPTIONS: ObserverOptions = {
  securityLevel: 'only-trusted',
  supportStrategy: defaultActionSupportStrategy,
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
  config: ActionAdapter,
  callbacks: Partial<ActionCallbacksConfig> = {},
  options: Partial<ObserverOptions> = DEFAULT_OPTIONS,
) {
  const mergedOptions = normalizeOptions(options);
  const twitterReactRoot = document.getElementById('react-root')!;

  const refreshRegistry = async () => {
    return ActionsRegistry.getInstance().init();
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
  config: ActionAdapter,
  callbacks: Partial<ActionCallbacksConfig>,
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
  const actionUrl = await resolveTwitterShortenedUrl(shortenedUrl);
  const interstitialData = isInterstitial(actionUrl);

  let actionApiUrl: string | null;
  if (interstitialData.isInterstitial) {
    const interstitialState = getExtendedInterstitialState(
      actionUrl.toString(),
    );

    if (
      !checkSecurity(interstitialState, options.securityLevel.interstitials)
    ) {
      return;
    }

    actionApiUrl = interstitialData.decodedActionUrl;
  } else {
    const websiteState = getExtendedWebsiteState(actionUrl.toString());

    if (!checkSecurity(websiteState, options.securityLevel.websites)) {
      return;
    }

    const actionsJsonUrl = actionUrl.origin + '/actions.json';
    const actionsJson = await fetch(proxify(actionsJsonUrl)).then(
      (res) => res.json() as Promise<ActionsJsonConfig>,
    );

    const actionsUrlMapper = new ActionsURLMapper(actionsJson);

    actionApiUrl = actionsUrlMapper.mapUrl(actionUrl);
  }

  const state = actionApiUrl ? getExtendedActionState(actionApiUrl) : null;
  if (
    !actionApiUrl ||
    !state ||
    !checkSecurity(state, options.securityLevel.actions)
  ) {
    return;
  }

  const action = await Action.fetch(
    actionApiUrl,
    config,
    options.supportStrategy,
  ).catch(noop);

  if (!action) {
    return;
  }

  const { container: actionContainer, reactRoot } = createAction({
    originalUrl: actionUrl,
    action,
    callbacks,
    options,
    isInterstitial: interstitialData.isInterstitial,
  });

  addStyles(container).replaceChildren(actionContainer);

  new MutationObserver((mutations, observer) => {
    for (const mutation of mutations) {
      for (const removedNode of Array.from(mutation.removedNodes)) {
        if (
          removedNode === actionContainer ||
          !document.body.contains(actionContainer)
        ) {
          reactRoot.unmount();
          observer.disconnect();
        }
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}

function createAction({
  originalUrl,
  action,
  callbacks,
  options,
}: {
  originalUrl: URL;
  action: Action;
  callbacks: Partial<ActionCallbacksConfig>;
  options: NormalizedObserverOptions;
  isInterstitial: boolean;
}) {
  const container = document.createElement('div');
  container.className = 'dialect-action-root-container';

  const actionRoot = createRoot(container);

  actionRoot.render(
    <div onClick={(e) => e.stopPropagation()}>
      <ActionContainer
        stylePreset={resolveXStylePreset()}
        action={action}
        websiteUrl={originalUrl.toString()}
        websiteText={originalUrl.hostname}
        callbacks={callbacks}
        securityLevel={options.securityLevel}
      />
    </div>,
  );

  return { container, reactRoot: actionRoot };
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
