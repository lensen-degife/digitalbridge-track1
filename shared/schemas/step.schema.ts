export type FlowType = 'onboarding' | 'job_apply' | 'employer_accommodation';

export type StepFieldType =
  | 'text'
  | 'choice'
  | 'date_ethiopian'
  | 'file_or_referral'
  | 'support_tags';

export interface LocalizedText {
  en: string;
  am: string;
}
export interface FormStep {
  stepId: string;
  flow: FlowType;
  type: StepFieldType;
  label: LocalizedText;
  simpleLabel: LocalizedText;
  icon: string;
  allowVoiceInput: boolean;
  required: boolean;
  options?: { value: string; label: LocalizedText; simpleLabel: LocalizedText }[];
}
