import { FormEngine } from '../engine/state-machine';
import type { FlowType, LanguageCode, EngineState } from '../engine/types';
import { FormScreen } from '../components/form-screen';
import { injectStyles } from '../components/styles';

/**
 * `<digitalbridge-onboarding>` Custom Element (Web Component).
 * Drop-in accessible form runner supporting attributes:
 * - `flow`: "onboarding" | "job_apply" | "employer_accommodation"
 * - `lang`: "en" | "am"
 * - `low-literacy`: boolean attribute ("true" / "false" or present)
 *
 * Emits custom DOM events:
 * - `digitalbridge-step`
 * - `digitalbridge-save`
 * - `digitalbridge-complete`
 */
export class DigitalBridgeOnboardingElement extends HTMLElement {
  public static readonly observedAttributes = ['flow', 'lang', 'low-literacy'];

  private engine: FormEngine | null = null;
  private screen: FormScreen | null = null;
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  public connectedCallback(): void {
    injectStyles(this.shadow);
    this.initEngine();
  }

  public disconnectedCallback(): void {
    if (this.screen) {
      this.screen.destroy();
      this.screen = null;
    }
  }

  public attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null
  ): void {
    if (oldVal === newVal || !this.engine) return;

    switch (name) {
      case 'flow':
        if (newVal === 'onboarding' || newVal === 'job_apply' || newVal === 'employer_accommodation') {
          this.engine.setFlow(newVal as FlowType);
        }
        break;
      case 'lang':
        if (newVal === 'en' || newVal === 'am') {
          this.engine.setLanguage(newVal as LanguageCode);
        }
        break;
      case 'low-literacy':
        this.engine.setLowLiteracyMode(newVal !== null && newVal !== 'false');
        break;
    }
  }

  private initEngine(): void {
    const flowAttr = (this.getAttribute('flow') || 'onboarding') as FlowType;
    const langAttr = (this.getAttribute('lang') || 'en') as LanguageCode;
    const lowLitAttr =
      this.hasAttribute('low-literacy') &&
      this.getAttribute('low-literacy') !== 'false';

    this.engine = new FormEngine({
      flow: flowAttr,
      initialLanguage: langAttr,
      initialLowLiteracy: lowLitAttr,
      callbacks: {
        onStepChange: (step, state) => {
          this.dispatchEvent(
            new CustomEvent('digitalbridge-step', {
              bubbles: true,
              composed: true,
              detail: {
                stepId: step.stepId,
                stepIndex: state.currentStepIndex,
                totalSteps: state.totalSteps,
                answers: state.answers,
              },
            })
          );
        },
        onSaveResume: (state) => {
          this.dispatchEvent(
            new CustomEvent('digitalbridge-save', {
              bubbles: true,
              composed: true,
              detail: {
                flow: state.flow,
                stepIndex: state.currentStepIndex,
                answers: state.answers,
                savedAt: state.lastSavedAt,
              },
            })
          );
        },
        onSubmit: (answers, state) => {
          this.dispatchEvent(
            new CustomEvent('digitalbridge-complete', {
              bubbles: true,
              composed: true,
              detail: {
                flow: state.flow,
                answers,
                completedAt: new Date().toISOString(),
              },
            })
          );
        },
        onLanguageChange: (lang) => {
          this.setAttribute('lang', lang);
        },
        onLowLiteracyToggle: (enabled) => {
          if (enabled) {
            this.setAttribute('low-literacy', 'true');
          } else {
            this.removeAttribute('low-literacy');
          }
        },
      },
    });

    this.screen = new FormScreen({
      engine: this.engine,
      container: this.shadow,
    });
  }

  // ==========================================
  // Public Programmatic Methods
  // ==========================================

  public setFlow(flow: FlowType): void {
    this.setAttribute('flow', flow);
  }

  public setLanguage(lang: LanguageCode): void {
    this.setAttribute('lang', lang);
  }

  public setLowLiteracyMode(enabled: boolean): void {
    if (enabled) {
      this.setAttribute('low-literacy', 'true');
    } else {
      this.removeAttribute('low-literacy');
    }
  }

  public getState(): EngineState | null {
    return this.engine ? this.engine.getState() : null;
  }

  public submit(): Promise<boolean> {
    if (this.engine) {
      return this.engine.submit();
    }
    return Promise.resolve(false);
  }
}

// Auto-register Custom Element if running in browser
if (typeof window !== 'undefined' && 'customElements' in window) {
  if (!customElements.get('digitalbridge-onboarding')) {
    customElements.define('digitalbridge-onboarding', DigitalBridgeOnboardingElement);
  }
}
