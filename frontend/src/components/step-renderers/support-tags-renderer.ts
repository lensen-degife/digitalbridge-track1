import type { FormStep } from '../../../../shared/schemas/step.schema';
import {
  SUPPORT_TAGS,
  type SupportTag,
} from '../../../../shared/schemas/tags';
import type { LanguageCode } from '../../engine/types';

export interface SupportTagsRendererProps {
  step: FormStep;
  currentValue: SupportTag[] | null;
  onChange: (val: SupportTag[]) => void;
  language: LanguageCode;
  lowLiteracyMode: boolean;
  error?: string;
}

interface TagMetadata {
  tag: SupportTag;
  labelEn: string;
  labelAm: string;
  simpleEn: string;
  simpleAm: string;
  descEn: string;
  descAm: string;
}

export const TAG_DEFINITIONS: Record<SupportTag, TagMetadata> = {
  screen_reader_ready: {
    tag: 'screen_reader_ready',
    labelEn: 'Screen reader & assistive technology compatibility',
    labelAm: 'ስክሪን አንባቢ እና አጋዥ የቴክኖሎጂ ድጋፍ',
    simpleEn: 'Audio / Screen Reader Computer',
    simpleAm: 'ድምፅ የሚያነብ ኮምፒውተር',
    descEn: 'Digital tools with keyboard accessibility and text-to-speech compatibility.',
    descAm: 'በቁልፍ ሰሌዳ እና በድምጽ ንባብ የሚሰሩ የኮምፒውተር መተግበሪያዎች።',
  },
  step_free_access: {
    tag: 'step_free_access',
    labelEn: 'Step-free physical workspace (ramps, wide doors, elevators)',
    labelAm: 'ደረጃ-አልባ የመንቀሳቀሻ መንገድ (መወጣጫዎች፣ ሊፍት፣ ሰፊ በሮች)',
    simpleEn: 'No Stairs / Wheelchair Ramps',
    simpleAm: 'ያለ ደረጃ መግቢያ',
    descEn: 'Physical access with ground floor or elevator access and accessible restrooms.',
    descAm: 'ደረጃ የሌለው የመግቢያና የመንቀሳቀሻ ምቹ ቢሮ።',
  },
  flexible_hours: {
    tag: 'flexible_hours',
    labelEn: 'Flexible working hours or structured rest intervals',
    labelAm: 'ተለዋዋጭ የሥራ ሰዓት ወይም የታቀደ የእረፍት ጊዜ',
    simpleEn: 'Flexible Rest & Work Hours',
    simpleAm: 'ተመቻች የሥራ ሰዓት',
    descEn: 'Adjustable shifts accommodating medical routines, prayer, or rest needs.',
    descAm: 'እንደ ሁኔታዎ የሚስተካከል የሥራ ሰዓትና የእረፍት ጊዜ።',
  },
  sign_language_support: {
    tag: 'sign_language_support',
    labelEn: 'Sign language interpretation & visual work notices',
    labelAm: 'የምልክት ቋንቋ አስተርጓሚ እና የጽሑፍ/ምስል መመሪያዎች',
    simpleEn: 'Sign Language & Captions',
    simpleAm: 'የምልክት ቋንቋ ድጋፍ',
    descEn: 'Ethiopian Sign Language interpreters for interviews and team communication.',
    descAm: 'የኢትዮጵያ ምልክት ቋንቋ አስተርጓሚና የጽሑፍ ግንኙነት።',
  },
  low_literacy_friendly: {
    tag: 'low_literacy_friendly',
    labelEn: 'Visual task guides, audio read-aloud, and simplified language',
    labelAm: 'የምስል እና የድምፅ መመሪያዎች እንዲሁም ቀላል ቋንቋ',
    simpleEn: 'Picture & Audio Instructions',
    simpleAm: 'በምስልና በድምፅ መመሪያ',
    descEn: 'Clear graphical workflow diagrams, voice prompts, and zero complex jargon.',
    descAm: 'ግልጽ የምስል መመሪያዎች እና በድምጽ የሚነበቡ ማብራሪያዎች።',
  },
  remote_option: {
    tag: 'remote_option',
    labelEn: 'Remote work capability (home-based or local community hub)',
    labelAm: 'የርቀት ሥራ (ከቤት ወይም በአቅራቢያ ከሚገኝ ማዕከል)',
    simpleEn: 'Work From Home / Hub',
    simpleAm: 'ከቤት ሆኖ መሥራት',
    descEn: 'Ability to complete tasks digitally without commuting obstacles.',
    descAm: 'የትራንስፖርት ችግር ሳይኖር ከቤት ሆነው የሚሰሩበት ዕድል።',
  },
};

export function renderSupportTagsInput(
  props: SupportTagsRendererProps
): HTMLElement {
  const { step, currentValue, onChange, language, lowLiteracyMode, error } = props;
  const isAm = language === 'am';

  const selectedTags: Set<SupportTag> = new Set(currentValue || []);

  const container = document.createElement('div');
  container.className = 'db-field-group';

  // Privacy-first banner (FR-05, FR-08, FR-09)
  const privacyNotice = document.createElement('div');
  privacyNotice.className = 'db-gregorian-hint';
  privacyNotice.style.borderLeftColor = 'var(--db-success)';
  privacyNotice.innerHTML = `
    <strong>${isAm ? '🔒 የግላዊነት ዋስትና (Privacy-First)፦' : '🔒 Privacy-First Guarantee:'}</strong>
    <p style="margin: 0.25rem 0 0 0;">
      ${
        isAm
          ? 'እኛ የምንጠይቀው ለሥራ የሚያስፈልጉዎትን ማመቻቻዎች ብቻ ነው። የሕክምና ምርመራ ወይም የአካል ጉዳት ስም ፈጽሞ አንጠይቅም።'
          : 'We only ask what workplace adjustments support you best. We never ask for medical diagnoses, disability labels, or doctor certifications.'
      }
    </p>
  `;
  container.appendChild(privacyNotice);

  const fieldset = document.createElement('fieldset');
  fieldset.className = 'db-tags-group';
  fieldset.style.marginTop = '1rem';

  const legend = document.createElement('legend');
  legend.className = 'db-label';
  legend.textContent = lowLiteracyMode ? step.simpleLabel[language] : step.label[language];
  if (step.required) {
    const reqBadge = document.createElement('span');
    reqBadge.className = 'db-step-required-badge';
    reqBadge.textContent = ' *';
    legend.appendChild(reqBadge);
  }
  fieldset.appendChild(legend);

  // Render each accommodation tag
  SUPPORT_TAGS.forEach((tagKey) => {
    const meta = TAG_DEFINITIONS[tagKey];
    const isChecked = selectedTags.has(tagKey);
    const cardId = `tag-${step.stepId}-${tagKey}`;

    const card = document.createElement('label');
    card.htmlFor = cardId;
    card.className = `db-tag-card ${isChecked ? 'db-checked' : ''}`;
    card.setAttribute('tabindex', '0');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = cardId;
    checkbox.value = tagKey;
    checkbox.className = 'db-tag-checkbox';
    checkbox.checked = isChecked;
    checkbox.setAttribute('tabindex', '-1');

    const content = document.createElement('div');
    content.className = 'db-tag-content';

    const title = document.createElement('div');
    title.className = 'db-tag-title';
    title.textContent = lowLiteracyMode
      ? isAm ? meta.simpleAm : meta.simpleEn
      : isAm ? meta.labelAm : meta.labelEn;

    const desc = document.createElement('div');
    desc.className = 'db-tag-desc';
    desc.textContent = isAm ? meta.descAm : meta.descEn;

    content.appendChild(title);
    content.appendChild(desc);

    card.appendChild(checkbox);
    card.appendChild(content);

    const toggle = () => {
      if (selectedTags.has(tagKey)) {
        selectedTags.delete(tagKey);
        card.classList.remove('db-checked');
        checkbox.checked = false;
      } else {
        selectedTags.add(tagKey);
        card.classList.add('db-checked');
        checkbox.checked = true;
      }
      onChange(Array.from(selectedTags));
    };

    card.addEventListener('click', (e) => {
      // Prevent double trigger if clicked directly on checkbox
      if (e.target !== checkbox) {
        toggle();
      } else {
        if (checkbox.checked) {
          selectedTags.add(tagKey);
          card.classList.add('db-checked');
        } else {
          selectedTags.delete(tagKey);
          card.classList.remove('db-checked');
        }
        onChange(Array.from(selectedTags));
      }
    });

    card.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    });

    fieldset.appendChild(card);
  });

  container.appendChild(fieldset);

  // Inline error message
  if (error) {
    const errorEl = document.createElement('div');
    errorEl.className = 'db-hint db-inline-error';
    errorEl.style.color = 'var(--db-error)';
    errorEl.style.fontWeight = '600';
    errorEl.style.marginTop = '0.5rem';
    errorEl.textContent = error;
    container.appendChild(errorEl);
  }

  return container;
}
