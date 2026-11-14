import type { FormEngine } from '../engine/state-machine';
import type { EngineState, FormStep, LanguageCode } from '../engine/types';
import { ICONS, getIconSvg } from './icons';
import { FocusManager } from './focus-manager';
import { renderErrorSummary } from './error-summary';
import { renderTextInput } from './step-renderers/text-renderer';
import { renderChoiceGroup } from './step-renderers/choice-renderer';
import { renderDateEthiopianInput } from './step-renderers/date-ethiopian-renderer';
import { renderFileOrReferralInput } from './step-renderers/file-or-referral-renderer';
import { renderSupportTagsInput } from './step-renderers/support-tags-renderer';

export interface FormScreenOptions {
  engine: FormEngine;
  container: HTMLElement | ShadowRoot;
}

export class FormScreen {
  private engine: FormEngine;
  private root: HTMLElement | ShadowRoot;
  private focusManager: FocusManager;
  private unsubscribeEngine?: () => void;
  private previousStepId: string | null = null;

  constructor(options: FormScreenOptions) {
    this.engine = options.engine;
    this.root = options.container;
    this.focusManager = new FocusManager(this.root);

    this.init();
  }

  private init(): void {
    this.unsubscribeEngine = this.engine.subscribe((state) => {
      this.render(state);
    });
  }

  public destroy(): void {
    if (this.unsubscribeEngine) {
      this.unsubscribeEngine();
    }
  }

  public render(state: EngineState): void {
    // Clear root container
    let container = this.root.querySelector('.db-container') as HTMLElement;
    if (!container) {
      container = document.createElement('div');
      container.className = 'db-container';
      if (this.root instanceof HTMLElement) {
        this.root.appendChild(container);
      } else {
        this.root.appendChild(container);
      }
    }
    container.innerHTML = '';

    const isAm = state.language === 'am';
    const step = state.currentStep;
    const isStepChange = this.previousStepId !== step.stepId;
    this.previousStepId = step.stepId;

    // 1. Skip to Content Link (A11y)
    const skipLink = document.createElement('a');
    skipLink.href = `#heading-${step.stepId}`;
    skipLink.className = 'db-skip-link';
    skipLink.textContent = isAm ? 'ወደ ጥያቄው በቀጥታ ይለፉ' : 'Skip to question';
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.focusManager.focusStepHeading(step.stepId);
    });
    container.appendChild(skipLink);

    // 2. Header (Language Switcher, Low-Literacy Toggle, Read-Aloud)
    const header = document.createElement('header');
    header.className = 'db-header';

    const brand = document.createElement('div');
    brand.className = 'db-brand';
    brand.innerHTML = `<span>🌐</span> <span>DigitalBridge</span>`;
    header.appendChild(brand);

    const headerActions = document.createElement('div');
    headerActions.className = 'db-header-actions';

    // Member 2 Slot or Standalone Fallback: Language Toggle
    const slots = this.engine.getSlots();
    let langToggleEl: HTMLElement | null = null;
    if (slots.renderLanguageToggle) {
      langToggleEl = slots.renderLanguageToggle(state.language, (newLang) => {
        this.engine.setLanguage(newLang);
      });
    }

    if (langToggleEl) {
      headerActions.appendChild(langToggleEl);
    } else {
      const langBtn = document.createElement('button');
      langBtn.type = 'button';
      langBtn.className = 'db-btn-util';
      langBtn.setAttribute('aria-label', isAm ? 'Switch to English' : 'ወደ አማርኛ ይቀይሩ');
      langBtn.innerHTML = `${ICONS.globe} <span>${isAm ? 'English' : 'አማርኛ'}</span>`;
      langBtn.addEventListener('click', () => {
        this.engine.setLanguage(isAm ? 'en' : 'am');
      });
      headerActions.appendChild(langBtn);
    }

    // Low-Literacy Mode Toggle (FR-03)
    const lowLitBtn = document.createElement('button');
    lowLitBtn.type = 'button';
    lowLitBtn.className = 'db-btn-util';
    lowLitBtn.setAttribute('aria-pressed', state.lowLiteracyMode ? 'true' : 'false');
    lowLitBtn.setAttribute(
      'aria-label',
      isAm
        ? state.lowLiteracyMode
          ? 'ቀላል የንባብ ሁነታ ነቅቷል (ለመደበኛ ሁነታ ይጫኑ)'
          : 'ቀላል የንባብ ሁነታን ያብሩ'
        : state.lowLiteracyMode
        ? 'Low-Literacy Mode active (tap to switch to standard)'
        : 'Enable Low-Literacy Mode (simple words & large icons)'
    );
    lowLitBtn.innerHTML = `${ICONS.eye} <span>${
      isAm
        ? state.lowLiteracyMode
          ? 'ቀላል ሁነታ (በርቷል)'
          : 'ቀላል ሁነታ'
        : state.lowLiteracyMode
        ? 'Simple Mode (On)'
        : 'Simple Mode'
    }</span>`;
    lowLitBtn.addEventListener('click', () => {
      this.engine.toggleLowLiteracyMode();
    });
    headerActions.appendChild(lowLitBtn);

    header.appendChild(headerActions);
    container.appendChild(header);

    // If form is already submitted, show completion confirmation
    if (state.isSubmitted) {
      container.appendChild(this.renderCompletionScreen(state));
      return;
    }

    // 3. Progress Bar (WCAG 4.1.2)
    const progressRegion = document.createElement('div');
    progressRegion.className = 'db-progress-region';

    const progressMeta = document.createElement('div');
    progressMeta.className = 'db-progress-meta';
    progressMeta.innerHTML = `
      <span>${
        isAm
          ? `ጥያቄ ${state.currentStepIndex + 1} ከ ${state.totalSteps}`
          : `Question ${state.currentStepIndex + 1} of ${state.totalSteps}`
      }</span>
      <span>${state.progressPercentage}%</span>
    `;
    progressRegion.appendChild(progressMeta);

    const progressTrack = document.createElement('div');
    progressTrack.className = 'db-progress-track';
    progressTrack.setAttribute('role', 'progressbar');
    progressTrack.setAttribute('aria-valuenow', String(state.currentStepIndex + 1));
    progressTrack.setAttribute('aria-valuemin', '1');
    progressTrack.setAttribute('aria-valuemax', String(state.totalSteps));
    progressTrack.setAttribute(
      'aria-valuetext',
      isAm
        ? `${state.totalSteps} ጥያቄዎች ውስጥ ጥያቄ ${state.currentStepIndex + 1}`
        : `Step ${state.currentStepIndex + 1} of ${state.totalSteps}`
    );

    const progressFill = document.createElement('div');
    progressFill.className = 'db-progress-fill';
    progressFill.style.width = `${state.progressPercentage}%`;
    progressTrack.appendChild(progressFill);
    progressRegion.appendChild(progressTrack);

    container.appendChild(progressRegion);

    // 4. Main Step Card (FR-01: ONE Question per screen)
    const stepCard = document.createElement('main');
    stepCard.className = 'db-step-card';
    stepCard.setAttribute('role', 'region');
    stepCard.setAttribute('aria-label', `Question ${state.currentStepIndex + 1}`);

    // Step Header with Icon & Heading
    const stepHeader = document.createElement('div');
    stepHeader.className = 'db-step-header';

    const iconWrap = document.createElement('div');
    iconWrap.className = 'db-step-icon-wrap';
    iconWrap.innerHTML = getIconSvg(step.icon);
    stepHeader.appendChild(iconWrap);

    const titleWrap = document.createElement('div');
    titleWrap.className = 'db-step-title-wrap';

    const heading = document.createElement('h2');
    heading.id = `heading-${step.stepId}`;
    heading.className = 'db-step-heading';
    heading.setAttribute('tabindex', '-1');
    heading.setAttribute('data-step-heading', 'true');
    const promptText = state.lowLiteracyMode
      ? step.simpleLabel[state.language]
      : step.label[state.language];
    heading.textContent = promptText;

    if (step.required) {
      const reqBadge = document.createElement('span');
      reqBadge.className = 'db-step-required-badge';
      reqBadge.textContent = ' *';
      reqBadge.title = isAm ? 'ግዴታ' : 'Required';
      heading.appendChild(reqBadge);
    }
    titleWrap.appendChild(heading);

    // Read-Aloud Trigger Button (Member 2 slot or Web Speech fallback)
    const readAloudWrap = document.createElement('div');
    readAloudWrap.className = 'db-read-aloud-wrap';

    let customReadAloud: HTMLElement | null = null;
    if (slots.renderReadAloud) {
      customReadAloud = slots.renderReadAloud(promptText, state.language);
    }

    if (customReadAloud) {
      readAloudWrap.appendChild(customReadAloud);
    } else {
      const readBtn = document.createElement('button');
      readBtn.type = 'button';
      readBtn.className = 'db-btn-util';
      readBtn.setAttribute(
        'aria-label',
        isAm ? 'ጥያቄውን በድምጽ ያዳምጡ' : 'Listen to this question read aloud'
      );
      readBtn.innerHTML = `${ICONS.speaker} <span>${isAm ? 'ጥያቄውን አዳምጥ' : 'Read Aloud'}</span>`;
      readBtn.addEventListener('click', () => {
        this.speakText(promptText, state.language);
      });
      readAloudWrap.appendChild(readBtn);
    }
    titleWrap.appendChild(readAloudWrap);

    stepHeader.appendChild(titleWrap);
    stepCard.appendChild(stepHeader);

    // Error Summary Banner (WCAG 3.3.1)
    const errorSummaryEl = renderErrorSummary({
      errors: state.errors,
      language: state.language,
    });
    if (errorSummaryEl) {
      stepCard.appendChild(errorSummaryEl);
    }

    // Step Type Renderer
    const activeRenderer = this.renderStepInput(step, state);
    stepCard.appendChild(activeRenderer);

    // Navigation Footer (Back, Next/Submit, Save & Resume)
    const navFooter = document.createElement('div');
    navFooter.className = 'db-nav-footer';

    // Back Button
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'db-btn db-btn-secondary';
    backBtn.disabled = state.isFirstStep;
    backBtn.innerHTML = `${ICONS.arrowLeft} <span>${isAm ? 'ወደ ኋላ' : 'Back'}</span>`;
    backBtn.addEventListener('click', () => {
      this.engine.goToPrevious();
    });
    navFooter.appendChild(backBtn);

    // Next / Submit Button
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'db-btn db-btn-primary';
    const nextText = state.isLastStep
      ? isAm ? 'አጠናቅቅና አስገባ' : 'Complete & Submit'
      : isAm ? 'ቀጣይ' : 'Next';
    nextBtn.innerHTML = `<span>${nextText}</span> ${state.isLastStep ? ICONS.check : ICONS.arrowRight}`;
    nextBtn.addEventListener('click', () => {
      const success = this.engine.goToNext();
      if (!success) {
        this.focusManager.focusError();
      }
    });
    navFooter.appendChild(nextBtn);

    // Save & Resume Later Trigger
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'db-btn db-btn-save';
    saveBtn.innerHTML = `${ICONS.save} <span>${
      state.isSaving
        ? isAm ? 'እየተቀመጠ...' : 'Saving...'
        : isAm ? 'ቆይቼ እቀጥላለሁ' : 'Save & Resume Later'
    }</span>`;
    saveBtn.addEventListener('click', async () => {
      await this.engine.saveAndResumeLater();
      alert(
        isAm
          ? 'መልሶችዎ በደህና ተቀምጠዋል! በማንኛውም ጊዜ ተመልሰው ከቆሙበት መቀጠል ይችላሉ።'
          : 'Your answers have been safely saved. You can resume anytime!'
      );
    });
    navFooter.appendChild(saveBtn);

    stepCard.appendChild(navFooter);
    container.appendChild(stepCard);

    // Status & Zero Timeout Notice
    const statusBar = document.createElement('div');
    statusBar.className = 'db-status-bar';

    const autoSaveStatus = document.createElement('div');
    autoSaveStatus.className = 'db-status-badge db-status-saved';
    autoSaveStatus.innerHTML = `<span>✓</span> <span>${
      isAm
        ? state.lastSavedAt
          ? `የተቀመጠው፦ ${new Date(state.lastSavedAt).toLocaleTimeString()}`
          : 'ራስ-ሰር ይቀመጣል'
        : state.lastSavedAt
        ? `Auto-saved at ${new Date(state.lastSavedAt).toLocaleTimeString()}`
        : 'Auto-saved locally'
    }</span>`;
    statusBar.appendChild(autoSaveStatus);

    const noTimeoutBadge = document.createElement('div');
    noTimeoutBadge.innerHTML = `<span>⌛ ${isAm ? 'ያለ ጊዜ ገደብ (FR-01)' : 'No Session Timeout (FR-01)'}</span>`;
    statusBar.appendChild(noTimeoutBadge);

    container.appendChild(statusBar);

    // Focus management on step transition
    if (isStepChange) {
      this.focusManager.focusStepHeading(step.stepId);
      this.focusManager.announce(
        isAm
          ? `ጥያቄ ${state.currentStepIndex + 1} ከ ${state.totalSteps}። ${promptText}`
          : `Step ${state.currentStepIndex + 1} of ${state.totalSteps}. ${promptText}`
      );
    }
  }

  private renderStepInput(step: FormStep, state: EngineState): HTMLElement {
    const error = state.errors[step.stepId];
    const currentValue = state.answers[step.stepId];

    switch (step.type) {
      case 'text':
        return renderTextInput({
          step,
          currentValue: (currentValue as string) || '',
          onChange: (val) => this.engine.setAnswer(step.stepId, val),
          language: state.language,
          lowLiteracyMode: state.lowLiteracyMode,
          error,
          slots: this.engine.getSlots(),
        });

      case 'choice':
        return renderChoiceGroup({
          step,
          currentValue: (currentValue as string) || '',
          onChange: (val) => this.engine.setAnswer(step.stepId, val),
          language: state.language,
          lowLiteracyMode: state.lowLiteracyMode,
          error,
        });

      case 'date_ethiopian':
        return renderDateEthiopianInput({
          step,
          currentValue: (currentValue as any) || null,
          onChange: (val) => this.engine.setAnswer(step.stepId, val),
          language: state.language,
          lowLiteracyMode: state.lowLiteracyMode,
          error,
          slots: this.engine.getSlots(),
        });

      case 'file_or_referral':
        return renderFileOrReferralInput({
          step,
          currentValue: (currentValue as any) || null,
          onChange: (val) => this.engine.setAnswer(step.stepId, val),
          language: state.language,
          lowLiteracyMode: state.lowLiteracyMode,
          error,
        });

      case 'support_tags':
        return renderSupportTagsInput({
          step,
          currentValue: (currentValue as any) || null,
          onChange: (val) => this.engine.setAnswer(step.stepId, val),
          language: state.language,
          lowLiteracyMode: state.lowLiteracyMode,
          error,
        });

      default: {
        const fallback = document.createElement('div');
        fallback.textContent = 'Unsupported step type';
        return fallback;
      }
    }
  }

  private renderCompletionScreen(state: EngineState): HTMLElement {
    const isAm = state.language === 'am';

    const card = document.createElement('div');
    card.className = 'db-step-card';
    card.style.textAlign = 'center';
    card.style.padding = '2.5rem 1.5rem';

    const iconWrap = document.createElement('div');
    iconWrap.className = 'db-step-icon-wrap';
    iconWrap.style.margin = '0 auto 1.25rem auto';
    iconWrap.style.backgroundColor = 'var(--db-success-bg)';
    iconWrap.style.borderColor = 'var(--db-success)';
    iconWrap.style.color = 'var(--db-success)';
    iconWrap.innerHTML = ICONS.check;
    card.appendChild(iconWrap);

    const heading = document.createElement('h2');
    heading.className = 'db-step-heading';
    heading.setAttribute('tabindex', '-1');
    heading.textContent = isAm ? 'መረጃዎ በተሳካ ሁኔታ ተልኳል!' : 'Form Successfully Completed!';
    card.appendChild(heading);

    const desc = document.createElement('p');
    desc.style.color = 'var(--db-text-muted)';
    desc.style.fontSize = '1.0625rem';
    desc.style.maxWidth = '30rem';
    desc.style.margin = '0.75rem auto 1.5rem auto';
    desc.textContent = isAm
      ? 'ምላሾችዎ በጥንቃቄ ተመዝግበዋል። በአጭር ጊዜ ውስጥ በተመረጠው የመገናኛ መንገድ እንደውላለን።'
      : 'Your information and accessibility accommodations have been securely recorded. Our team will contact you soon.';
    card.appendChild(desc);

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'db-btn db-btn-primary';
    resetBtn.textContent = isAm ? 'አዲስ ቅጽ ይጀምሩ' : 'Start Fresh';
    resetBtn.addEventListener('click', () => {
      this.engine.reset();
    });
    card.appendChild(resetBtn);

    setTimeout(() => {
      heading.focus();
    }, 60);

    return card;
  }

  private speakText(text: string, lang: LanguageCode): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'am' ? 'am-ET' : 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`[Audio Playback]: ${text}`);
    }
  }
}
