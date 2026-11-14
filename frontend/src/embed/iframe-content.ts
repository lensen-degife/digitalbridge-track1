import { FormEngine } from '../engine/state-machine';
import type { FlowType, LanguageCode } from '../engine/types';
import { FormScreen } from '../components/form-screen';
import { injectStyles } from '../components/styles';

/**
 * Embedded iframe client script.
 * Initializes form runner, forwards lifecycle events to host window,
 * and maintains dynamic height auto-resizing via ResizeObserver.
 */
export function initIframeContent(): { engine: FormEngine; screen: FormScreen } {
  injectStyles(document);

  const urlParams = new URLSearchParams(window.location.search);
  const flow = (urlParams.get('flow') || 'onboarding') as FlowType;
  const lang = (urlParams.get('lang') || 'en') as LanguageCode;
  const lowLiteracy = urlParams.get('lowLiteracy') === 'true';

  const engine = new FormEngine({
    flow,
    initialLanguage: lang,
    initialLowLiteracy: lowLiteracy,
    callbacks: {
      onStepChange: (step, state) => {
        postToParent('digitalbridge:step', {
          stepId: step.stepId,
          stepIndex: state.currentStepIndex,
          totalSteps: state.totalSteps,
          answers: state.answers,
        });
      },
      onSaveResume: (state) => {
        postToParent('digitalbridge:save', {
          flow: state.flow,
          stepIndex: state.currentStepIndex,
          answers: state.answers,
          savedAt: state.lastSavedAt,
        });
      },
      onSubmit: (answers, state) => {
        postToParent('digitalbridge:complete', {
          flow: state.flow,
          answers,
          completedAt: new Date().toISOString(),
        });
      },
    },
  });

  const screen = new FormScreen({
    engine,
    container: document.body,
  });

  // Dynamic height auto-resizing
  const sendHeight = () => {
    const height = document.body.scrollHeight;
    postToParent('digitalbridge:resize', { height });
  };

  const win = window as any;
  if (typeof win.ResizeObserver !== 'undefined') {
    const observer = new win.ResizeObserver(() => {
      sendHeight();
    });
    observer.observe(document.body);
  } else {
    window.addEventListener('resize', sendHeight);
  }

  // Initial height dispatch
  setTimeout(sendHeight, 100);

  // Listen for commands from host window
  window.addEventListener('message', (event: MessageEvent) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    switch (data.type) {
      case 'digitalbridge:set-flow':
        if (data.payload?.flow) {
          engine.setFlow(data.payload.flow);
        }
        break;
      case 'digitalbridge:set-lang':
        if (data.payload?.lang) {
          engine.setLanguage(data.payload.lang);
        }
        break;
      case 'digitalbridge:set-low-literacy':
        if (typeof data.payload?.enabled === 'boolean') {
          engine.setLowLiteracyMode(data.payload.enabled);
        }
        break;
    }
  });

  return { engine, screen };
}

function postToParent(type: string, payload: any): void {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type, ...payload }, '*');
  }
}

// Auto-run if running directly in a browser document
if (typeof window !== 'undefined' && document.body) {
  if (window.location.search.includes('flow=')) {
    initIframeContent();
  }
}
