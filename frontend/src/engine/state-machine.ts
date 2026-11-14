import type {
  FlowType,
  FormStep,
} from '../../../shared/schemas/step.schema';
import {
  SUPPORT_TAGS,
} from '../../../shared/schemas/tags';
import type {
  EngineState,
  EngineOptions,
  EngineCallbacks,
  EngineSlots,
  StepAnswerValue,
  StepValidationResult,
  LanguageCode,
  EthiopianDateValue,
  ReferralData,
  EngineEvent,
  EngineSubscriber,
} from './types';
import { getStepsForFlow } from './step-catalog';

const STORAGE_PREFIX = 'digitalbridge_form_v1_';

export class FormEngine {
  private flow: FlowType;
  private steps: FormStep[];
  private currentStepIndex = 0;
  private answers: Record<string, StepAnswerValue> = {};
  private errors: Record<string, string> = {};
  private language: LanguageCode = 'en';
  private lowLiteracyMode = false;
  private lastSavedAt: string | null = null;
  private isSubmitted = false;
  private isSaving = false;

  private callbacks: EngineCallbacks;
  private slots: EngineSlots;
  private listeners: Array<EngineSubscriber> = [];

  constructor(options: EngineOptions = {}) {
    this.flow = options.flow || 'onboarding';
    this.steps = options.stepsOverride || getStepsForFlow(this.flow);
    this.language = options.initialLanguage || 'en';
    this.lowLiteracyMode = options.initialLowLiteracy ?? false;
    this.callbacks = options.callbacks || {};
    this.slots = options.slots || {};

    if (options.initialAnswers) {
      this.answers = { ...options.initialAnswers };
    } else {
      this.restoreFromStorage();
    }
  }

  // ==========================================
  // Public State Getters
  // ==========================================

  public getState(): EngineState {
    const totalSteps = this.steps.length;
    const progressPercentage =
      totalSteps > 0
        ? Math.round(((this.currentStepIndex + 1) / totalSteps) * 100)
        : 0;

    const currentStep = this.steps[this.currentStepIndex] || this.steps[0];

    return {
      flow: this.flow,
      currentStepIndex: this.currentStepIndex,
      totalSteps,
      currentStep,
      answers: { ...this.answers },
      errors: { ...this.errors },
      isFirstStep: this.currentStepIndex === 0,
      isLastStep: this.currentStepIndex === totalSteps - 1,
      isSubmitted: this.isSubmitted,
      isValid: Object.keys(this.errors).length === 0,
      progressPercentage,
      language: this.language,
      lowLiteracyMode: this.lowLiteracyMode,
      lastSavedAt: this.lastSavedAt,
      isSaving: this.isSaving,
    };
  }

  public getCurrentStep(): FormStep {
    return this.steps[this.currentStepIndex] || this.steps[0];
  }

  public getSteps(): FormStep[] {
    return [...this.steps];
  }

  public getAnswer<T = StepAnswerValue>(stepId: string): T | undefined {
    return this.answers[stepId] as T | undefined;
  }

  public getSlots(): EngineSlots {
    return this.slots;
  }

  public getCallbacks(): EngineCallbacks {
    return this.callbacks;
  }

  // ==========================================
  // State Subscriptions
  // ==========================================

  public subscribe(listener: EngineSubscriber): () => void {
    this.listeners.push(listener);
    listener(this.getState(), { type: 'init' });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(event?: EngineEvent): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(state, event);
      } catch (err) {
        console.error('Error in FormEngine subscriber:', err);
      }
    }
  }

  // ==========================================
  // Flow and Navigation Actions
  // ==========================================

  public setFlow(flow: FlowType, stepsOverride?: FormStep[]): void {
    if (this.flow === flow && !stepsOverride) return;

    this.flow = flow;
    this.steps = stepsOverride || getStepsForFlow(flow);
    this.currentStepIndex = 0;
    this.errors = {};
    this.isSubmitted = false;
    this.restoreFromStorage();
    this.notify({ type: 'flow_change' });
  }

  public setLanguage(lang: LanguageCode): void {
    if (this.language === lang) return;
    this.language = lang;
    this.callbacks.onLanguageChange?.(lang);
    this.notify({ type: 'language_change' });
  }

  public toggleLowLiteracyMode(): void {
    this.lowLiteracyMode = !this.lowLiteracyMode;
    this.callbacks.onLowLiteracyToggle?.(this.lowLiteracyMode);
    this.persistAutoSave();
    this.notify({ type: 'low_literacy_toggle' });
  }

  public setLowLiteracyMode(enabled: boolean): void {
    if (this.lowLiteracyMode === enabled) return;
    this.lowLiteracyMode = enabled;
    this.callbacks.onLowLiteracyToggle?.(this.lowLiteracyMode);
    this.persistAutoSave();
    this.notify({ type: 'low_literacy_toggle' });
  }

  public setAnswer(stepId: string, value: StepAnswerValue): void {
    this.answers[stepId] = value;
    // Clear validation error when user touches input
    if (this.errors[stepId]) {
      delete this.errors[stepId];
    }
    this.persistAutoSave();
    this.notify({ type: 'answer_change', stepId, value });
  }

  public goToNext(): boolean {
    const currentStep = this.getCurrentStep();
    const validation = this.validateStep(currentStep);

    if (!validation.isValid) {
      this.errors[currentStep.stepId] =
        validation.errorMessage || 'Please answer this required question.';
      this.callbacks.onValidationError?.(this.errors);
      this.notify({
        type: 'validation_error',
        errors: { ...this.errors },
        stepId: currentStep.stepId,
      });
      return false;
    }

    delete this.errors[currentStep.stepId];

    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.triggerStepChangeHook();
      this.persistAutoSave();
      this.notify({ type: 'step_change', stepId: this.getCurrentStep().stepId });
      return true;
    } else {
      // Last step reached -> Submit
      this.submit();
      return true;
    }
  }

  public goToPrevious(): boolean {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.triggerStepChangeHook();
      this.persistAutoSave();
      this.notify({ type: 'step_change', stepId: this.getCurrentStep().stepId });
      return true;
    }
    return false;
  }

  public goToStep(index: number): boolean {
    if (index >= 0 && index < this.steps.length) {
      this.currentStepIndex = index;
      this.triggerStepChangeHook();
      this.persistAutoSave();
      this.notify({ type: 'step_change', stepId: this.getCurrentStep().stepId });
      return true;
    }
    return false;
  }

  // ==========================================
  // Validation Rules
  // ==========================================

  public validateCurrentStep(): StepValidationResult {
    const currentStep = this.getCurrentStep();
    const result = this.validateStep(currentStep);
    if (!result.isValid && result.errorMessage) {
      this.errors[currentStep.stepId] = result.errorMessage;
    } else {
      delete this.errors[currentStep.stepId];
    }
    this.notify();
    return result;
  }

  public validateStep(step: FormStep): StepValidationResult {
    const value = this.answers[step.stepId];
    const isAm = this.language === 'am';

    if (!step.required) {
      return { isValid: true };
    }

    switch (step.type) {
      case 'text': {
        if (typeof value !== 'string' || value.trim().length === 0) {
          return {
            isValid: false,
            errorMessage: isAm
              ? 'እባክዎ ይህንን መስክ በትክክል ይሙሉ ወይም በድምጽ ያስገቡ።'
              : 'Please fill in this required field or use voice input.',
          };
        }
        return { isValid: true };
      }

      case 'choice': {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
          return {
            isValid: false,
            errorMessage: isAm
              ? 'እባክዎ ከቀረቡት አማራጮች አንዱን ይምረጡ።'
              : 'Please choose one of the available options.',
          };
        }
        return { isValid: true };
      }

      case 'date_ethiopian': {
        if (!value) {
          return {
            isValid: false,
            errorMessage: isAm
              ? 'እባክዎ የኢትዮጵያ ዘመን አቆጣጠር ቀን፣ ወር እና ዓመተ ምህረት ያስገቡ።'
              : 'Please enter a valid Ethiopian calendar date (Day, Month, Year).',
          };
        }
        const ethDate = value as EthiopianDateValue;
        if (!ethDate.year || !ethDate.month || !ethDate.day) {
          return {
            isValid: false,
            errorMessage: isAm
              ? 'እባክዎ ዓመተ ምህረት፣ ወር እና ቀን ሙሉ መሆናቸውን ያረጋግጡ።'
              : 'Please complete Year, Month, and Day.',
          };
        }
        if (ethDate.month < 1 || ethDate.month > 13) {
          return {
            isValid: false,
            errorMessage: isAm
              ? 'የኢትዮጵያ ወር ከ 1 (መስከረም) እስከ 13 (ጳጉሜ) መሆን አለበት።'
              : 'Ethiopian month must be between 1 (Meskerem) and 13 (Pagume).',
          };
        }
        if (ethDate.day < 1 || ethDate.day > 30) {
          return {
            isValid: false,
            errorMessage: isAm
              ? 'የኢትዮጵያ ቀን ከ 1 እስከ 30 መሆን አለበት።'
              : 'Ethiopian day must be between 1 and 30.',
          };
        }
        return { isValid: true };
      }

      case 'file_or_referral': {
        if (!value) {
          return {
            isValid: false,
            errorMessage: isAm
              ? 'እባክዎ ሰነድ ይምረጡ ወይም የታመነ የአጋር ድርጅት ሪፈራል ይጠይቁ።'
              : 'Please provide an ID document or select an accredited partner referral.',
          };
        }
        const refData = value as ReferralData;

        // Consent checkbox requirement (FR-04)
        if (!refData.consentGranted) {
          return {
            isValid: false,
            errorMessage: isAm
              ? 'የማንነት ማረጋገጫ ፈቃድ መስጫውን ሳጥን ምልክት ማድረግ አለብዎት።'
              : 'You must check the consent box to proceed with document verification.',
          };
        }

        if (refData.verificationType === 'partner_referral') {
          if (!refData.partnerName || refData.partnerName.trim().length === 0) {
            return {
              isValid: false,
              errorMessage: isAm
                ? 'እባክዎ አጋር ድርጅት (ለምሳሌ፦ AAAPD) ይምረጡ።'
                : 'Please select an accredited partner organization (e.g., AAAPD).',
            };
          }
        } else {
          // File/document verification
          if (!refData.file && (!refData.notes || refData.notes.trim().length === 0)) {
            return {
              isValid: false,
              errorMessage: isAm
                ? 'እባክዎ ፋይል ያያይዙ ወይም የመታወቂያ ቁጥርዎን ያስገቡ።'
                : 'Please attach a document file or enter your ID number.',
            };
          }
        }
        return { isValid: true };
      }

      case 'support_tags': {
        if (!value || !Array.isArray(value) || value.length === 0) {
          return {
            isValid: false,
            errorMessage: isAm
              ? 'እባክዎ ቢያንስ አንድ የማመቻቻ አማራጭ ይምረጡ።'
              : 'Please select at least one accommodation option.',
          };
        }
        // Verify all tags belong to SUPPORT_TAGS
        const invalidTags = (value as string[]).filter(
          (t) => !(SUPPORT_TAGS as readonly string[]).includes(t)
        );
        if (invalidTags.length > 0) {
          return {
            isValid: false,
            errorMessage: isAm
              ? 'የተመረጡት ድጋፎች በትክክል አልተለዩም።'
              : 'One or more selected accommodations are unrecognized.',
          };
        }
        return { isValid: true };
      }

      default:
        return { isValid: true };
    }
  }

  // ==========================================
  // Submission & Persistence (FR-01: Zero Session Timeouts)
  // ==========================================

  public async saveAndResumeLater(): Promise<void> {
    this.isSaving = true;
    this.notify({ type: 'save_resume' });

    await this.persistAutoSave();

    const state = this.getState();
    if (this.callbacks.onSaveResume) {
      await this.callbacks.onSaveResume(state);
    }

    this.isSaving = false;
    this.notify({ type: 'save_resume' });
  }

  public async submit(): Promise<boolean> {
    // Validate current step before final submit
    const currentStep = this.getCurrentStep();
    const validation = this.validateStep(currentStep);

    if (!validation.isValid) {
      this.errors[currentStep.stepId] =
        validation.errorMessage || 'Please complete this required question.';
      this.callbacks.onValidationError?.(this.errors);
      this.notify({
        type: 'validation_error',
        errors: { ...this.errors },
        stepId: currentStep.stepId,
      });
      return false;
    }

    this.isSubmitted = true;
    this.lastSavedAt = new Date().toISOString();
    this.notify({ type: 'submit' });

    const state = this.getState();
    if (this.callbacks.onSubmit) {
      await this.callbacks.onSubmit(this.answers, state);
    }

    return true;
  }

  public reset(): void {
    this.answers = {};
    this.errors = {};
    this.currentStepIndex = 0;
    this.isSubmitted = false;
    this.lastSavedAt = null;
    this.clearStorage();
    this.notify({ type: 'reset' });
  }

  // ==========================================
  // Auto-Save Hook & Storage Sync
  // ==========================================

  private triggerStepChangeHook(): void {
    const currentStep = this.getCurrentStep();
    const state = this.getState();
    try {
      this.callbacks.onStepChange?.(currentStep, state);
    } catch (err) {
      console.error('Error invoking onStepChange callback:', err);
    }
  }

  public async persistAutoSave(): Promise<void> {
    const timestamp = new Date().toISOString();
    this.lastSavedAt = timestamp;

    const payload = {
      flow: this.flow,
      currentStepIndex: this.currentStepIndex,
      answers: this.answers,
      language: this.language,
      lowLiteracyMode: this.lowLiteracyMode,
      savedAt: timestamp,
    };

    // 1. Standalone Fallback: Browser LocalStorage (Zero Session Timeout)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(
          `${STORAGE_PREFIX}${this.flow}`,
          JSON.stringify(payload)
        );
      }
    } catch (storageErr) {
      console.warn('LocalStorage auto-save write warning:', storageErr);
    }

    // 2. Member 2 Slot Hook: Offline SQLite / IndexedDB
    if (this.slots.autoSaveHandler) {
      try {
        await this.slots.autoSaveHandler(this.getState());
      } catch (err) {
        console.error('Error in Member 2 autoSaveHandler slot:', err);
      }
    }
  }

  private restoreFromStorage(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;

      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${this.flow}`);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (parsed.answers && typeof parsed.answers === 'object') {
          this.answers = { ...this.answers, ...parsed.answers };
        }
        if (typeof parsed.currentStepIndex === 'number' && parsed.currentStepIndex < this.steps.length) {
          this.currentStepIndex = parsed.currentStepIndex;
        }
        if (parsed.language === 'en' || parsed.language === 'am') {
          this.language = parsed.language;
        }
        if (typeof parsed.lowLiteracyMode === 'boolean') {
          this.lowLiteracyMode = parsed.lowLiteracyMode;
        }
        if (parsed.savedAt) {
          this.lastSavedAt = parsed.savedAt;
        }
      }
    } catch (err) {
      console.warn('Could not restore state from localStorage:', err);
    }
  }

  private clearStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(`${STORAGE_PREFIX}${this.flow}`);
      }
    } catch (err) {
      console.warn('Could not clear localStorage:', err);
    }
  }
}
