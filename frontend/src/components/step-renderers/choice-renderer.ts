import type { FormStep } from '../../../../shared/schemas/step.schema';
import type { LanguageCode } from '../../engine/types';

export interface ChoiceRendererProps {
  step: FormStep;
  currentValue: string;
  onChange: (val: string) => void;
  language: LanguageCode;
  lowLiteracyMode: boolean;
  error?: string;
}

export function renderChoiceGroup(props: ChoiceRendererProps): HTMLElement {
  const { step, currentValue, onChange, language, lowLiteracyMode, error } = props;
  const isAm = language === 'am';
  const options = step.options || [];

  const fieldset = document.createElement('fieldset');
  fieldset.className = 'db-choice-group';
  fieldset.setAttribute('role', 'radiogroup');
  fieldset.setAttribute('aria-required', step.required ? 'true' : 'false');

  const legend = document.createElement('legend');
  legend.className = 'db-sr-only';
  legend.textContent = lowLiteracyMode
    ? step.simpleLabel[language]
    : step.label[language];
  fieldset.appendChild(legend);

  if (error) {
    const errorEl = document.createElement('div');
    errorEl.className = 'db-hint db-inline-error';
    errorEl.style.color = 'var(--db-error)';
    errorEl.style.fontWeight = '600';
    errorEl.textContent = error;
    fieldset.appendChild(errorEl);
  }

  const radioInputs: HTMLInputElement[] = [];

  options.forEach((opt, idx) => {
    const optId = `choice-${step.stepId}-${opt.value}`;
    const isSelected = currentValue === opt.value;

    const card = document.createElement('label');
    card.htmlFor = optId;
    card.className = `db-choice-card ${isSelected ? 'db-selected' : ''}`;
    card.setAttribute('tabindex', '0');

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.id = optId;
    radio.name = `radio-group-${step.stepId}`;
    radio.value = opt.value;
    radio.className = 'db-choice-radio';
    radio.checked = isSelected;
    radio.setAttribute('tabindex', '-1'); // Card receives the keyboard focus
    radioInputs.push(radio);

    const labelSpan = document.createElement('span');
    labelSpan.className = 'db-choice-label';
    const text = lowLiteracyMode ? opt.simpleLabel[language] : opt.label[language];
    labelSpan.textContent = text;

    card.appendChild(radio);
    card.appendChild(labelSpan);

    // Event handling
    const selectThisOption = () => {
      fieldset.querySelectorAll('.db-choice-card').forEach((c) => {
        c.classList.remove('db-selected');
      });
      card.classList.add('db-selected');
      radio.checked = true;
      onChange(opt.value);
    };

    card.addEventListener('click', () => {
      selectThisOption();
    });

    // Keyboard support: Space / Enter selects; Arrow keys navigate
    card.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectThisOption();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const nextCard = card.nextElementSibling as HTMLElement;
        if (nextCard && nextCard.classList.contains('db-choice-card')) {
          nextCard.focus();
          const nextRadio = nextCard.querySelector<HTMLInputElement>('input[type="radio"]');
          if (nextRadio) {
            nextRadio.checked = true;
            nextCard.classList.add('db-selected');
            card.classList.remove('db-selected');
            onChange(nextRadio.value);
          }
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevCard = card.previousElementSibling as HTMLElement;
        if (prevCard && prevCard.classList.contains('db-choice-card')) {
          prevCard.focus();
          const prevRadio = prevCard.querySelector<HTMLInputElement>('input[type="radio"]');
          if (prevRadio) {
            prevRadio.checked = true;
            prevCard.classList.add('db-selected');
            card.classList.remove('db-selected');
            onChange(prevRadio.value);
          }
        }
      }
    });

    fieldset.appendChild(card);
  });

  return fieldset;
}
