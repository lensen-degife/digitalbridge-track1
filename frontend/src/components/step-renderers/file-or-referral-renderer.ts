import type { FormStep } from '../../../../shared/schemas/step.schema';
import type { LanguageCode, ReferralData } from '../../engine/types';
import { ICONS } from '../icons';

export interface FileOrReferralRendererProps {
  step: FormStep;
  currentValue: ReferralData | null;
  onChange: (val: ReferralData) => void;
  language: LanguageCode;
  lowLiteracyMode: boolean;
  error?: string;
}

export function renderFileOrReferralInput(
  props: FileOrReferralRendererProps
): HTMLElement {
  const { step, currentValue, onChange, language, lowLiteracyMode, error } = props;
  const isAm = language === 'am';

  const container = document.createElement('div');
  container.className = 'db-field-group';

  // State initialization
  let currentType: ReferralData['verificationType'] =
    currentValue?.verificationType || 'refugee_id';
  let consentGranted = currentValue?.consentGranted ?? false;
  let selectedPartner = currentValue?.partnerName || 'AAAPD (Addis Ababa Association of Persons with Disabilities)';
  let attachedFileName = currentValue?.file?.name || '';
  let idNumberOrNotes = currentValue?.notes || '';

  const emitData = () => {
    onChange({
      verificationType: currentType,
      consentGranted,
      partnerName: currentType === 'partner_referral' ? selectedPartner : undefined,
      file: attachedFileName ? { name: attachedFileName, size: 1024, type: 'application/pdf' } : undefined,
      notes: idNumberOrNotes,
    });
  };

  // Primary Prompt Label
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

  // Tabs / Choice Buttons
  const tabWrap = document.createElement('div');
  tabWrap.className = 'db-referral-tabs';
  tabWrap.setAttribute('role', 'tablist');

  const tabsConfig = [
    {
      type: 'refugee_id' as const,
      labelEn: 'Refugee ID / UNHCR',
      labelAm: 'የስደተኛ መታወቂያ / UNHCR',
      simpleEn: 'Refugee ID',
      simpleAm: 'ስደተኛ መታወቂያ',
    },
    {
      type: 'community_document' as const,
      labelEn: 'Community / School ID',
      labelAm: 'የቀበሌ / ትምህርት ሰነድ',
      simpleEn: 'School or Kebele ID',
      simpleAm: 'የትምህርት ሰነድ',
    },
    {
      type: 'partner_referral' as const,
      labelEn: 'Refer me (AAAPD / Partner)',
      labelAm: 'በአጋር ድርጅት (AAAPD) ይረጋገጥ',
      simpleEn: 'Help from AAAPD Partner',
      simpleAm: 'የአጋር ሪፈራል',
    },
  ];

  const contentArea = document.createElement('div');
  contentArea.style.marginTop = '1rem';

  const updateView = () => {
    tabWrap.querySelectorAll('.db-referral-tab').forEach((tabEl) => {
      const type = tabEl.getAttribute('data-type');
      if (type === currentType) {
        tabEl.classList.add('db-active');
        tabEl.setAttribute('aria-selected', 'true');
      } else {
        tabEl.classList.remove('db-active');
        tabEl.setAttribute('aria-selected', 'false');
      }
    });

    contentArea.innerHTML = '';

    if (currentType === 'partner_referral') {
      // Partner Referral Section
      const referralNotice = document.createElement('div');
      referralNotice.className = 'db-gregorian-hint';
      referralNotice.style.borderLeftColor = 'var(--db-primary)';
      referralNotice.innerHTML = `
        <strong>${isAm ? 'የታመነ አጋር ሪፈራል (AAAPD)፦' : 'Accredited Partner Referral:'}</strong>
        <p style="margin: 0.375rem 0 0 0;">
          ${
            isAm
              ? 'መታወቂያ ወይም ሰነድ ከሌለዎት ችግር የለውም። የአዲስ አበባ አካል ጉዳተኞች ማህበር (AAAPD) ወይም የተፈቀደላቸው የማህበረሰብ አጋሮቻችን ማንነትዎን እንዲያረጋግጡልዎ መምረጥ ይችላሉ።'
              : 'If you lack physical identity documents, accredited disability and refugee associations like AAAPD will verify your eligibility directly with zero stigma.'
          }
        </p>
      `;
      contentArea.appendChild(referralNotice);

      const partnerSelectWrap = document.createElement('div');
      partnerSelectWrap.style.marginTop = '0.75rem';

      const partnerLabel = document.createElement('label');
      partnerLabel.className = 'db-label';
      partnerLabel.htmlFor = `partner-select-${step.stepId}`;
      partnerLabel.textContent = isAm ? 'የአጋር ድርጅት ይምረጡ' : 'Select Accredited Referral Partner';
      partnerSelectWrap.appendChild(partnerLabel);

      const partnerSelect = document.createElement('select');
      partnerSelect.id = `partner-select-${step.stepId}`;
      partnerSelect.className = 'db-select';
      partnerSelect.style.width = '100%';

      const partners = [
        'AAAPD (Addis Ababa Association of Persons with Disabilities)',
        'Refugee Community Assistance Committee',
        'Sub-City Youth & Inclusion Association',
        'Ethio-Disability Empowerment Hub',
      ];
      partners.forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        if (p === selectedPartner) opt.selected = true;
        partnerSelect.appendChild(opt);
      });

      partnerSelect.addEventListener('change', () => {
        selectedPartner = partnerSelect.value;
        emitData();
      });

      partnerSelectWrap.appendChild(partnerSelect);
      contentArea.appendChild(partnerSelectWrap);
    } else {
      // Document upload / ID number section
      const dropzone = document.createElement('div');
      dropzone.className = 'db-file-dropzone';
      dropzone.setAttribute('tabindex', '0');
      dropzone.setAttribute('role', 'button');
      dropzone.setAttribute(
        'aria-label',
        isAm ? 'ሰነድ ለማያያዝ እዚህ ይጫኑ ወይም ፋይል ይጎትቱ' : 'Click or drag file to attach document'
      );

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.className = 'db-sr-only';
      fileInput.id = `file-input-${step.stepId}`;
      fileInput.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';

      dropzone.innerHTML = `
        <div style="color: var(--db-primary);">${ICONS.document}</div>
        <div style="font-weight: 700; color: var(--db-text-main);">
          ${
            attachedFileName
              ? `${isAm ? 'የተያያዘ ፋይል፦' : 'Attached File:'} ${attachedFileName}`
              : isAm
              ? 'ፋይል ለማያያዝ እዚህ ይጫኑ (PDF, JPG, PNG)'
              : 'Click to browse or drop document here (PDF, JPG, PNG)'
          }
        </div>
        <div style="font-size: 0.8125rem; color: var(--db-text-muted);">
          ${isAm ? 'ከ 10MB ያልበለጠ' : 'Up to 10MB'}
        </div>
      `;

      dropzone.addEventListener('click', () => {
        fileInput.click();
      });
      dropzone.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          fileInput.click();
        }
      });

      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
          attachedFileName = fileInput.files[0].name;
          updateView();
          emitData();
        }
      });

      contentArea.appendChild(dropzone);
      contentArea.appendChild(fileInput);

      // Manual ID Number fallback
      const notesWrap = document.createElement('div');
      notesWrap.style.marginTop = '0.75rem';
      const notesLabel = document.createElement('label');
      notesLabel.className = 'db-label';
      notesLabel.htmlFor = `id-number-${step.stepId}`;
      notesLabel.textContent = isAm ? 'ወይም የመታወቂያ ቁጥርዎን እዚህ ይጻፉ' : 'Or enter your ID number / case number manually:';
      const notesInput = document.createElement('input');
      notesInput.type = 'text';
      notesInput.id = `id-number-${step.stepId}`;
      notesInput.className = 'db-input-text';
      notesInput.value = idNumberOrNotes;
      notesInput.placeholder = isAm ? 'ምሳሌ፦ UNHCR-12345 ወይም የቀበሌ መታወቂያ ቁጥር' : 'e.g. UNHCR-12345 or Kebele ID number';
      notesInput.addEventListener('input', () => {
        idNumberOrNotes = notesInput.value;
        emitData();
      });
      notesWrap.appendChild(notesLabel);
      notesWrap.appendChild(notesInput);
      contentArea.appendChild(notesWrap);
    }

    // Consent Card (FR-04: Explicit Consent Checkbox)
    const consentCard = document.createElement('div');
    consentCard.className = 'db-consent-card';

    const consentCheck = document.createElement('input');
    consentCheck.type = 'checkbox';
    consentCheck.id = `consent-check-${step.stepId}`;
    consentCheck.className = 'db-consent-check';
    consentCheck.checked = consentGranted;
    consentCheck.setAttribute('aria-required', 'true');

    const consentLabel = document.createElement('label');
    consentLabel.htmlFor = `consent-check-${step.stepId}`;
    consentLabel.className = 'db-consent-label';
    consentLabel.textContent = isAm
      ? 'ለሥራ ምደባና ማመቻቻ ድጋፍ ሲባል ማንነቴ በዚህ ሰነድ ወይም በአጋር ሪፈራል እንዲረጋገጥ ፈቃዴን እሰጣለሁ (FR-04 Consent)።'
      : 'I consent to verify my identity through this document or accredited partner referral for placement and accommodation purposes (FR-04 Consent).';

    consentCheck.addEventListener('change', () => {
      consentGranted = consentCheck.checked;
      emitData();
    });

    consentCard.appendChild(consentCheck);
    consentCard.appendChild(consentLabel);
    contentArea.appendChild(consentCard);
  };

  // Build Tab Buttons
  tabsConfig.forEach((tab) => {
    const tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'db-referral-tab';
    tabBtn.setAttribute('data-type', tab.type);
    tabBtn.setAttribute('role', 'tab');
    tabBtn.textContent = lowLiteracyMode
      ? isAm ? tab.simpleAm : tab.simpleEn
      : isAm ? tab.labelAm : tab.labelEn;

    tabBtn.addEventListener('click', () => {
      currentType = tab.type;
      updateView();
      emitData();
    });

    tabWrap.appendChild(tabBtn);
  });

  container.appendChild(tabWrap);
  container.appendChild(contentArea);

  // Render initial view
  updateView();

  // Error message
  if (error) {
    const errorEl = document.createElement('div');
    errorEl.className = 'db-hint';
    errorEl.style.color = 'var(--db-error)';
    errorEl.style.fontWeight = '600';
    errorEl.style.marginTop = '0.5rem';
    errorEl.textContent = error;
    container.appendChild(errorEl);
  }

  return container;
}
