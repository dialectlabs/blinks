import {
  Action,
  type ActionAdapter,
  type ActionCallbacksConfig,
  type ActionsJsonConfig,
  ActionsRegistry,
  type ActionSupportStrategy,
  ActionsURLMapper,
  checkSecurity,
  defaultActionSupportStrategy,
  getExtendedActionState,
  getExtendedInterstitialState,
  getExtendedWebsiteState,
  isInterstitial,
  proxify,
  type SecurityLevel,
} from '@dialectlabs/blinks-core';
import { createRoot } from 'react-dom/client';
import { Blink, type StylePreset } from '../ui';

type ObserverSecurityLevel = SecurityLevel;

const noop = () => {};

export interface ObserverOptions {
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

export function setupYouTubeObserver(
  config: ActionAdapter,
  callbacks: Partial<ActionCallbacksConfig> = {},
  options: Partial<ObserverOptions> = DEFAULT_OPTIONS,
) {
  const mergedOptions = normalizeOptions(options);
  const youtubeCommentsSection = document.querySelector('ytd-comments#comments');

  const refreshRegistry = async () => {
    return ActionsRegistry.getInstance().init();
  };

  refreshRegistry().then(() => {
    const observer = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        for (let j = 0; j < mutation.addedNodes.length; j++) {
          const node = mutation.addedNodes[j];
          if (node.nodeType === Node.ELEMENT_NODE) {
            handleNewYouTubeNode(
              node as Element,
              config,
              callbacks,
              mergedOptions,
            ).catch(noop);
          }
        }
      }
    });

    if (youtubeCommentsSection) {
      observer.observe(youtubeCommentsSection, { childList: true, subtree: true });
    }
  });
}

async function handleNewYouTubeNode(
  node: Element,
  config: ActionAdapter,
  callbacks: Partial<ActionCallbacksConfig>,
  options: NormalizedObserverOptions,
) {
  if (!node || node.nodeName !== 'YTD-COMMENT-THREAD-RENDERER') {
    return;
  }

  const contentElement = node.querySelector('#content-text');
  if (!contentElement) {
    return;
  }

  const anchorTags = Array.from(contentElement.querySelectorAll('a.yt-core-attributed-string__link'));
  for (const anchor of anchorTags) {
    const linkText = anchor.textContent?.trim();
    if (linkText && isValidUrl(linkText)) {
      await processYouTubeLink(new URL(linkText), node, config, callbacks, options);
    }
  }
}

async function processYouTubeLink(
  originalUrl: URL,
  commentNode: Element,
  config: ActionAdapter,
  callbacks: Partial<ActionCallbacksConfig>,
  options: NormalizedObserverOptions,
) {
  const interstitialData = isInterstitial(originalUrl);

  let actionApiUrl: string | null;
  if (interstitialData.isInterstitial) {
    const interstitialState = getExtendedInterstitialState(originalUrl.toString());
    if (!checkSecurity(interstitialState, options.securityLevel.interstitials)) {
      return;
    }
    actionApiUrl = interstitialData.decodedActionUrl;
  } else {
    const websiteState = getExtendedWebsiteState(originalUrl.toString());
    if (!checkSecurity(websiteState, options.securityLevel.websites)) {
      return;
    }

    const actionsJsonUrl = originalUrl.origin + '/actions.json';
    const actionsJson = await fetch(proxify(actionsJsonUrl)).then(
      (res) => res.json() as Promise<ActionsJsonConfig>,
    );

    const actionsUrlMapper = new ActionsURLMapper(actionsJson);
    actionApiUrl = actionsUrlMapper.mapUrl(originalUrl);
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

  const { container: actionContainer, reactRoot } = createYouTubeAction({
    originalUrl,
    action,
    callbacks,
    options,
    isInterstitial: interstitialData.isInterstitial,
  });

  const containerWrapper = document.createElement('div');
  containerWrapper.className = 'dialect-wrapper';
  containerWrapper.style.marginTop = '12px';
  containerWrapper.appendChild(actionContainer);

  commentNode.appendChild(containerWrapper);

  new MutationObserver((mutations, observer) => {
    for (const mutation of mutations) {
      for (const removedNode of Array.from(mutation.removedNodes)) {
        if (
          removedNode === containerWrapper ||
          !document.body.contains(containerWrapper)
        ) {
          reactRoot.unmount();
          observer.disconnect();
        }
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}

function createYouTubeAction({
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
      <Blink
        stylePreset={resolveYouTubeStylePreset()}
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

const resolveYouTubeStylePreset = (): StylePreset => {
  const darkTheme = document.documentElement.getAttribute('dark') === 'true';
  return darkTheme ? 'youtube-dark' : 'youtube-light';
};

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
