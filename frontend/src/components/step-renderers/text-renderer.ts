import type { FormStep } from '../../../../shared/schemas/step.schema';
import type { LanguageCode, EngineSlots } from '../../engine/types';
import { ICONS } from '../icons';

export interface TextRendererProps {
  step: FormStep;
  currentValue: string;
  onChange: (val: string) => void;
  language: LanguageCode;
  lowLiteracyMode: boolean;
  error?: string;
  slots?: EngineSlots;
}

export function renderTextInput(props: TextRendererProps): HTMLElement {
  const { step, currentValue, onChange, language, lowLiteracyMode, error, slots } = props;
  const isAm = language === 'am';
  const inputId = `input-${step.stepId}`;
  const hintId = `hint-${step.stepId}`;
  const errorId = `error-${step.stepId}`;

  const container = document.createElement('div');
  container.className = 'db-field-group';

  // Explicit <label for="...">
  const label = document.createElement('label');
  label.className = 'db-label';
  label.htmlFor = inputId;
  const labelText = lowLiteracyMode ? step.simpleLabel[language] : step.label[language];
  label.textContent = labelText;

  if (step.required) {
    const reqBadge = document.createElement('span');
    reqBadge.className = 'db-step-required-badge';
    reqBadge.setAttribute('aria-hidden', 'true');
    reqBadge.textContent = ' *';
    label.appendChild(reqBadge);
  }
  container.appendChild(label);

  // Optional hint text
  const hint = document.createElement('div');
  hint.id = hintId;
  hint.className = 'db-hint';
  hint.textContent = isAm
    ? 'ጽሑፍ እዚህ ይተይቡ ወይም የድምጽ መቅረጫውን ይጠቀሙ'
    : 'Type your answer here or tap the microphone to speak.';
  container.appendChild(hint);

  // Input wrapper
  const inputWrap = document.createElement('div');
  inputWrap.className = 'db-input-voice-wrap';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = inputId;
  input.className = 'db-input-text';
  input.value = currentValue || '';
  input.setAttribute('autocomplete', 'off');

  const describedBy: string[] = [hintId];
  if (error) {
    input.setAttribute('aria-invalid', 'true');
    describedBy.push(errorId);
  }
  input.setAttribute('aria-describedby', describedBy.join(' '));

  input.addEventListener('input', () => {
    onChange(input.value);
  });

  inputWrap.appendChild(input);

  // Voice Input Slot / Fallback
  if (step.allowVoiceInput) {
    let customVoiceSlot: HTMLElement | null = null;
    if (slots?.renderVoiceInput) {
      customVoiceSlot = slots.renderVoiceInput(
        step,
        currentValue,
        (spokenText) => {
          input.value = spokenText;
          onChange(spokenText);
        },
        language
      );
    }

    if (customVoiceSlot) {
      inputWrap.appendChild(customVoiceSlot);
    } else {
      // Lightweight standalone fallback voice button
      const voiceBtn = document.createElement('button');
      voiceBtn.type = 'button';
      voiceBtn.className = 'db-btn-util';
      voiceBtn.setAttribute(
        'aria-label',
        isAm ? 'በድምጽ መልስ ለመስጠት ማይክሮፎኑን ይጫኑ' : 'Voice input: Speak your answer'
      );
      voiceBtn.title = isAm ? 'በድምጽ ይናገሩ' : 'Speak with microphone';
      voiceBtn.innerHTML = `${ICONS.mic} <span class="db-sr-only">Voice</span>`;

      let isRecording = false;
      voiceBtn.addEventListener('click', () => {
        const SpeechRec =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;

        if (SpeechRec) {
          try {
            const recognition = new SpeechRec();
            recognition.lang = language === 'am' ? 'am-ET' : 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
              isRecording = true;
              voiceBtn.setAttribute('aria-pressed', 'true');
              voiceBtn.style.borderColor = 'var(--db-error)';
            };

            recognition.onresult = (evt: any) => {
              const transcript = evt.results[0][0].transcript;
              if (transcript) {
                input.value = transcript;
                onChange(transcript);
              }
            };

            recognition.onerror = () => {
              isRecording = false;
              voiceBtn.setAttribute('aria-pressed', 'false');
              voiceBtn.style.borderColor = '';
            };

            recognition.onend = () => {
              isRecording = false;
              voiceBtn.setAttribute('aria-pressed', 'false');
              voiceBtn.style.borderColor = '';
            };

            recognition.start();
          } catch {
            simulateVoicePrompt(input, onChange, isAm);
          }
        } else {
          simulateVoicePrompt(input, onChange, isAm);
        }
      });

      inputWrap.appendChild(voiceBtn);
    }
  }

  container.appendChild(inputWrap);

  // Inline error message
  if (error) {
    const errorEl = document.createElement('div');
    errorEl.id = errorId;
    errorEl.className = 'db-hint';
    errorEl.style.color = 'var(--db-error)';
    errorEl.style.fontWeight = '600';
    errorEl.textContent = error;
    container.appendChild(errorEl);
  }

  return container;
}

function simulateVoicePrompt(
  input: HTMLInputElement,
  onChange: (val: string) => void,
  isAm: boolean
): void {
  const simulated = prompt(
    isAm
      ? 'የድምጽ ማስገቢያ (ማይክሮፎን በማይገኝበት ጊዜ እዚህ ይናገሩ ወይም ይተይቡ)፦'
      : 'Speech recognition not supported in this browser. Enter voice transcript manually:'
  );
  if (simulated !== null && simulated.trim().length > 0) {
    input.value = simulated.trim();
    onChange(simulated.trim());
  }
}
