import type { FlowType, LanguageCode } from '../engine/types';

export interface IframeEmbedOptions {
  src: string;
  flow?: FlowType;
  lang?: LanguageCode;
  lowLiteracy?: boolean;
  title?: string;
  className?: string;
  onStepChange?: (data: any) => void;
  onSave?: (data: any) => void;
  onComplete?: (data: any) => void;
  onResize?: (height: number) => void;
}

export interface IframeEmbedController {
  iframe: HTMLIFrameElement;
  setFlow: (flow: FlowType) => void;
  setLanguage: (lang: LanguageCode) => void;
  setLowLiteracy: (enabled: boolean) => void;
  destroy: () => void;
}

/**
 * Creates an accessible, sandboxed iframe drop-in wrapper with responsive auto-resizing.
 * WCAG 2.2 AA compliant (4.1.2 Name, Role, Value with accessible title).
 */
export function createDigitalBridgeIframe(
  options: IframeEmbedOptions
): IframeEmbedController {
  const {
    src,
    flow = 'onboarding',
    lang = 'en',
    lowLiteracy = false,
    title = 'DigitalBridge Accessible Form',
    className = 'db-embed-iframe',
    onStepChange,
    onSave,
    onComplete,
    onResize,
  } = options;

  const url = new URL(src, window.location.href);
  url.searchParams.set('flow', flow);
  url.searchParams.set('lang', lang);
  if (lowLiteracy) {
    url.searchParams.set('lowLiteracy', 'true');
  }

  const iframe = document.createElement('iframe');
  iframe.src = url.toString();
  iframe.className = className;
  iframe.title = title;
  iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');
  iframe.setAttribute('scrolling', 'no');
  iframe.style.width = '100%';
  iframe.style.border = 'none';
  iframe.style.minHeight = '35rem';
  iframe.style.overflow = 'hidden';
  iframe.style.display = 'block';

  // postMessage listener
  const messageHandler = (event: MessageEvent) => {
    // Only accept messages from iframe
    if (event.source !== iframe.contentWindow) return;

    const data = event.data;
    if (!data || typeof data !== 'object') return;

    switch (data.type) {
      case 'digitalbridge:resize':
        if (typeof data.height === 'number') {
          iframe.style.height = `${Math.max(data.height, 400)}px`;
          onResize?.(data.height);
        }
        break;

      case 'digitalbridge:step':
        onStepChange?.(data.payload);
        break;

      case 'digitalbridge:save':
        onSave?.(data.payload);
        break;

      case 'digitalbridge:complete':
        onComplete?.(data.payload);
        break;
    }
  };

  window.addEventListener('message', messageHandler);

  const sendCommand = (type: string, payload: any) => {
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type, payload }, '*');
    }
  };

  return {
    iframe,
    setFlow: (newFlow: FlowType) => {
      sendCommand('digitalbridge:set-flow', { flow: newFlow });
    },
    setLanguage: (newLang: LanguageCode) => {
      sendCommand('digitalbridge:set-lang', { lang: newLang });
    },
    setLowLiteracy: (enabled: boolean) => {
      sendCommand('digitalbridge:set-low-literacy', { enabled });
    },
    destroy: () => {
      window.removeEventListener('message', messageHandler);
      iframe.remove();
    },
  };
}
