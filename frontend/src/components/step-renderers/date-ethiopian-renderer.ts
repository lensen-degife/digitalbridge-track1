import type { FormStep } from '../../../../shared/schemas/step.schema';
import type { LanguageCode, EngineSlots, EthiopianDateValue } from '../../engine/types';

export interface DateEthiopianRendererProps {
  step: FormStep;
  currentValue: EthiopianDateValue | null;
  onChange: (val: EthiopianDateValue) => void;
  language: LanguageCode;
  lowLiteracyMode: boolean;
  error?: string;
  slots?: EngineSlots;
}

export const ETHIOPIAN_MONTHS = [
  { num: 1, en: '1 - Meskerem (መስከረም)', am: '1 - መስከረም' },
  { num: 2, en: '2 - Tikimt (ጥቅምት)', am: '2 - ጥቅምት' },
  { num: 3, en: '3 - Hidar (ኅዳር)', am: '3 - ኅዳር' },
  { num: 4, en: '4 - Tahsas (ታኅሣሥ)', am: '4 - ታኅሣሥ' },
  { num: 5, en: '5 - Tir (ጥር)', am: '5 - ጥር' },
  { num: 6, en: '6 - Yekatit (የካቲት)', am: '6 - የካቲት' },
  { num: 7, en: '7 - Megabit (መጋቢት)', am: '7 - መጋቢት' },
  { num: 8, en: '8 - Miazia (ሚያዝያ)', am: '8 - ሚያዝያ' },
  { num: 9, en: '9 - Ginbot (ግንቦት)', am: '9 - ግንቦት' },
  { num: 10, en: '10 - Sene (ሰኔ)', am: '10 - ሰኔ' },
  { num: 11, en: '11 - Hamle (ሐምሌ)', am: '11 - ሐምሌ' },
  { num: 12, en: '12 - Nehase (ነሐሴ)', am: '12 - ነሐሴ' },
  { num: 13, en: '13 - Pagume (ጳጉሜ)', am: '13 - ጳጉሜ' },
];

export function renderDateEthiopianInput(
  props: DateEthiopianRendererProps
): HTMLElement {
  const { step, currentValue, onChange, language, lowLiteracyMode, error, slots } = props;
  const isAm = language === 'am';

  const container = document.createElement('div');
  container.className = 'db-field-group';

  // Primary label
  const label = document.createElement('label');
  label.className = 'db-label';
  const labelText = lowLiteracyMode ? step.simpleLabel[language] : step.label[language];
  label.textContent = labelText;
  if (step.required) {
    const reqBadge = document.createElement('span');
    reqBadge.className = 'db-step-required-badge';
    reqBadge.textContent = ' *';
    label.appendChild(reqBadge);
  }
  container.appendChild(label);

  // 1. Check if Member 2 provided a custom picker slot
  if (slots?.renderDateEthiopianPicker) {
    const customSlot = slots.renderDateEthiopianPicker(currentValue, onChange, language);
    if (customSlot) {
      container.appendChild(customSlot);
      return container;
    }
  }

  // 2. Standalone Fallback Ethiopian Calendar Picker
  const dateControls = document.createElement('div');
  dateControls.className = 'db-eth-date-container';

  let currentYear = currentValue?.year || 1995;
  let currentMonth = currentValue?.month || 1;
  let currentDay = currentValue?.day || 1;

  const emitDate = () => {
    const formatted = `${currentDay}/${currentMonth}/${currentYear} ዓ.ም.`;
    // Approximate Gregorian year (+7 or 8 years)
    const approxGregYear = currentMonth >= 1 && currentMonth <= 4 ? currentYear + 7 : currentYear + 8;
    const gregorianEquivalent = `${approxGregYear} (Approx Gregorian)`;

    onChange({
      year: currentYear,
      month: currentMonth,
      day: currentDay,
      formatted,
      gregorianEquivalent,
    });

    if (gregHint) {
      gregHint.textContent = isAm
        ? `የጎርጎሮሳውያን (ፈረንጆች) ግምታዊ አቆጣጠር፦ ${gregorianEquivalent}`
        : `Approximate Gregorian Calendar: ${gregorianEquivalent}`;
    }
  };

  // Day Selector
  const dayGroup = document.createElement('div');
  dayGroup.className = 'db-date-field';
  const dayLabel = document.createElement('label');
  dayLabel.className = 'db-date-label';
  dayLabel.htmlFor = `eth-day-${step.stepId}`;
  dayLabel.textContent = isAm ? 'ቀን' : 'Day';
  const daySelect = document.createElement('select');
  daySelect.id = `eth-day-${step.stepId}`;
  daySelect.className = 'db-select';
  for (let d = 1; d <= 30; d++) {
    const opt = document.createElement('option');
    opt.value = String(d);
    opt.textContent = String(d);
    if (d === currentDay) opt.selected = true;
    daySelect.appendChild(opt);
  }
  daySelect.addEventListener('change', () => {
    currentDay = parseInt(daySelect.value, 10);
    emitDate();
  });
  dayGroup.appendChild(dayLabel);
  dayGroup.appendChild(daySelect);
  dateControls.appendChild(dayGroup);

  // Month Selector
  const monthGroup = document.createElement('div');
  monthGroup.className = 'db-date-field';
  const monthLabel = document.createElement('label');
  monthLabel.className = 'db-date-label';
  monthLabel.htmlFor = `eth-month-${step.stepId}`;
  monthLabel.textContent = isAm ? 'ወር' : 'Month';
  const monthSelect = document.createElement('select');
  monthSelect.id = `eth-month-${step.stepId}`;
  monthSelect.className = 'db-select';
  ETHIOPIAN_MONTHS.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = String(m.num);
    opt.textContent = isAm ? m.am : m.en;
    if (m.num === currentMonth) opt.selected = true;
    monthSelect.appendChild(opt);
  });
  monthSelect.addEventListener('change', () => {
    currentMonth = parseInt(monthSelect.value, 10);
    // If Pagume (month 13), limit days to 6
    if (currentMonth === 13 && currentDay > 6) {
      currentDay = 5;
      daySelect.value = '5';
    }
    emitDate();
  });
  monthGroup.appendChild(monthLabel);
  monthGroup.appendChild(monthSelect);
  dateControls.appendChild(monthGroup);

  // Year Selector
  const yearGroup = document.createElement('div');
  yearGroup.className = 'db-date-field';
  const yearLabel = document.createElement('label');
  yearLabel.className = 'db-date-label';
  yearLabel.htmlFor = `eth-year-${step.stepId}`;
  yearLabel.textContent = isAm ? 'ዓመተ ምህረት' : 'Year (E.C.)';
  const yearSelect = document.createElement('select');
  yearSelect.id = `eth-year-${step.stepId}`;
  yearSelect.className = 'db-select';
  // List Ethiopian years from 1950 to 2017 ዓ.ም.
  for (let y = 2017; y >= 1950; y--) {
    const opt = document.createElement('option');
    opt.value = String(y);
    opt.textContent = `${y} ዓ.ም.`;
    if (y === currentYear) opt.selected = true;
    yearSelect.appendChild(opt);
  }
  yearSelect.addEventListener('change', () => {
    currentYear = parseInt(yearSelect.value, 10);
    emitDate();
  });
  yearGroup.appendChild(yearLabel);
  yearGroup.appendChild(yearSelect);
  dateControls.appendChild(yearGroup);

  container.appendChild(dateControls);

  // Gregorian Hint Box
  const gregHint = document.createElement('div');
  gregHint.className = 'db-gregorian-hint';
  const initialApprox = currentMonth >= 1 && currentMonth <= 4 ? currentYear + 7 : currentYear + 8;
  gregHint.textContent = isAm
    ? `የጎርጎሮሳውያን (ፈረንጆች) ግምታዊ አቆጣጠር፦ ${initialApprox} እ.ኤ.አ.`
    : `Approximate Gregorian Calendar: ${initialApprox} G.C.`;
  container.appendChild(gregHint);

  // Error message
  if (error) {
    const errorEl = document.createElement('div');
    errorEl.className = 'db-hint';
    errorEl.style.color = 'var(--db-error)';
    errorEl.style.fontWeight = '600';
    errorEl.textContent = error;
    container.appendChild(errorEl);
  }

  // Ensure default emitted if not already present
  if (!currentValue) {
    emitDate();
  }

  return container;
}
