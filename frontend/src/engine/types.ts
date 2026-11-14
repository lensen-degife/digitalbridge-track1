import type {
  FlowType,
  StepFieldType,
  LocalizedText,
  FormStep,
} from '../../../shared/schemas/step.schema';
import {
  SUPPORT_TAGS,
  type SupportTag,
} from '../../../shared/schemas/tags';

export { FlowType, StepFieldType, LocalizedText, FormStep };
export { SUPPORT_TAGS, SupportTag };

/**
 * Accommodation tags alias matching ACCOMMODATION_TAGS requirement
 */
export const ACCOMMODATION_TAGS = SUPPORT_TAGS;
export type AccommodationTag = SupportTag;

export type LanguageCode = 'en' | 'am';

export interface ReferralData {
  verificationType: 'refugee_id' | 'community_document' | 'partner_referral';
  file?: File | { name: string; size: number; type: string };
  partnerName?: string;
  notes?: string;
  consentGranted: boolean;
}

export interface EthiopianDateValue {
  year: number; // e.g., 2016
  month: number; // 1-13 (Meskerem - Pagume)
  day: number; // 1-30
  formatted: string; // e.g. "12/03/2016 ዓ.ም."
  gregorianEquivalent?: string; // ISO date string
}

export type StepAnswerValue =
  | string
  | string[]
  | EthiopianDateValue
  | ReferralData
  | null;

export interface EngineState {
  flow: FlowType;
  currentStepIndex: number;
  totalSteps: number;
  currentStep: FormStep;
  answers: Record<string, StepAnswerValue>;
  errors: Record<string, string>;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitted: boolean;
  isValid: boolean;
  progressPercentage: number;
  language: LanguageCode;
  lowLiteracyMode: boolean;
  lastSavedAt: string | null;
  isSaving: boolean;
}

export interface StepValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export interface EngineCallbacks {
  /**
   * Auto-save persistence hook triggered on every step change or value change.
   * Member 2 plugs their offline persistence (IndexedDB / SQLite) in here.
   */
  onStepChange?: (step: FormStep, state: EngineState) => void | Promise<void>;

  /**
   * Triggered when user explicitly hits "Save & Resume Later".
   */
  onSaveResume?: (state: EngineState) => void | Promise<void>;

  /**
   * Triggered when the final step of a flow is successfully submitted.
   */
  onSubmit?: (answers: Record<string, StepAnswerValue>, state: EngineState) => void | Promise<void>;

  /**
   * Triggered when validation fails.
   */
  onValidationError?: (errors: Record<string, string>) => void;

  /**
   * Triggered when the language is toggled.
   */
  onLanguageChange?: (lang: LanguageCode) => void;

  /**
   * Triggered when Low-Literacy mode is toggled.
   */
  onLowLiteracyToggle?: (enabled: boolean) => void;
}

export interface EngineSlots {
  /**
   * Member 2 slot: Custom dual-language toggle component.
   */
  renderLanguageToggle?: (
    currentLang: LanguageCode,
    setLanguage: (lang: LanguageCode) => void
  ) => HTMLElement | null;

  /**
   * Member 2 slot: Voice input field / microphone button for speech-to-text.
   */
  renderVoiceInput?: (
    step: FormStep,
    currentValue: string,
    onVoiceResult: (text: string) => void,
    lang: LanguageCode
  ) => HTMLElement | null;

  /**
   * Member 2 slot: One-tap Read-Aloud audio button.
   */
  renderReadAloud?: (
    textToRead: string,
    lang: LanguageCode
  ) => HTMLElement | null;

  /**
   * Member 2 slot: Dual Ethiopic/Gregorian date picker.
   */
  renderDateEthiopianPicker?: (
    currentValue: EthiopianDateValue | null,
    onDateChange: (date: EthiopianDateValue) => void,
    lang: LanguageCode
  ) => HTMLElement | null;

  /**
   * Member 2 slot: Persistent offline auto-save storage hook.
   */
  autoSaveHandler?: (state: EngineState) => Promise<void> | void;
}

export interface EngineOptions {
  flow?: FlowType;
  initialLanguage?: LanguageCode;
  initialLowLiteracy?: boolean;
  initialAnswers?: Record<string, StepAnswerValue>;
  callbacks?: EngineCallbacks;
  slots?: EngineSlots;
  stepsOverride?: FormStep[];
}
