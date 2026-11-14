import { ICONS } from './icons';
import type { LanguageCode } from '../engine/types';

export interface ErrorSummaryProps {
  errors: Record<string, string>;
  language: LanguageCode;
}

/**
 * Accessible Plain-Language Error Summary Region.
 * Conforms to WCAG 2.2 AA (3.3.1 Error Identification, 3.3.3 Error Suggestion, 4.1.3 Status Messages).
 */
export function renderErrorSummary(props: ErrorSummaryProps): HTMLElement | null {
  const errorEntries = Object.entries(props.errors);
  if (errorEntries.length === 0) return null;

  const isAm = props.language === 'am';

  const container = document.createElement('div');
  container.className = 'db-error-summary';
  container.setAttribute('role', 'alert');
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('tabindex', '-1');

  const titleText = isAm ? 'እባክዎ የሚከተሉትን ስህተቶች ያርሙ፦' : 'Please fix the following issue to continue:';

  let listHtml = '';
  for (const [fieldId, message] of errorEntries) {
    listHtml += `
      <li style="margin-top: 0.25rem;">
        <a href="#input-${fieldId}" style="color: var(--db-error); font-weight: 600; text-decoration: underline;" onclick="document.getElementById('input-${fieldId}')?.focus(); return false;">
          ${escapeHtml(message)}
        </a>
      </li>
    `;
  }

  container.innerHTML = `
    <div class="db-error-summary-header">
      ${ICONS.alert}
      <span>${titleText}</span>
    </div>
    <ul style="margin: 0; padding-left: 1.25rem; list-style-type: disc;">
      ${listHtml}
    </ul>
  `;

  return container;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
