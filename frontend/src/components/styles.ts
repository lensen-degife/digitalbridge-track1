/**
 * Accessible, WCAG 2.2 AA compliant stylesheet for DigitalBridge form engine.
 * - Single-column responsive layout
 * - Relative rem units throughout
 * - Zero horizontal scroll at 200% zoom (WCAG 1.4.10 Reflow)
 * - Minimum touch target >= 48px (3rem) (WCAG 2.5.8)
 * - Contrast ratios >= 4.5:1 for text, >= 3:1 for UI components (WCAG 1.4.3 & 1.4.11)
 * - Prominent focus rings: 3px solid #1d4ed8 with 2px offset (WCAG 2.4.7)
 */
export const ACCESSIBLE_CSS = `
:root {
  --db-font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Nyala', 'Abyssinica SIL', sans-serif;
  --db-bg-canvas: #ffffff;
  --db-bg-surface: #f8fafc;
  --db-bg-card: #ffffff;
  --db-text-main: #0f172a;
  --db-text-muted: #334155;
  --db-text-inverse: #ffffff;
  --db-primary: #1e3a8a;
  --db-primary-hover: #172554;
  --db-primary-light: #eff6ff;
  --db-border: #94a3b8;
  --db-border-strong: #475569;
  --db-focus-ring: #2563eb;
  --db-error: #b91c1c;
  --db-error-bg: #fef2f2;
  --db-error-border: #f87171;
  --db-success: #047857;
  --db-success-bg: #ecfdf5;
  --db-success-border: #34d399;
  --db-touch-min: 3rem; /* 48px */
}

/* Scoped reset & container */
.db-container {
  font-family: var(--db-font-family);
  color: var(--db-text-main);
  background-color: var(--db-bg-surface);
  box-sizing: border-box;
  width: 100%;
  max-width: 44rem; /* 704px single column */
  margin: 0 auto;
  padding: 1.25rem 1rem;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.db-container *,
.db-container *::before,
.db-container *::after {
  box-sizing: border-box;
}

/* Skip link for keyboard users */
.db-skip-link {
  position: absolute;
  top: -3rem;
  left: 1rem;
  background: var(--db-primary);
  color: var(--db-text-inverse);
  padding: 0.75rem 1.25rem;
  z-index: 100;
  text-decoration: none;
  font-weight: 700;
  border-radius: 0.375rem;
  transition: top 0.15s ease;
}
.db-skip-link:focus {
  top: 1rem;
  outline: 3px solid var(--db-focus-ring);
  outline-offset: 2px;
}

/* Screen reader only utility */
.db-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Universal high-visibility focus */
.db-container :focus-visible {
  outline: 3px solid var(--db-focus-ring) !important;
  outline-offset: 2px !important;
}

/* Header & utility bar */
.db-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--db-border);
}

.db-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--db-primary);
}

.db-header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

/* Interactive Utility Buttons (min 48px touch target) */
.db-btn-util {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-height: var(--db-touch-min);
  min-width: var(--db-touch-min);
  padding: 0.5rem 0.875rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--db-text-main);
  background-color: var(--db-bg-canvas);
  border: 2px solid var(--db-border-strong);
  border-radius: 0.5rem;
  cursor: pointer;
  touch-action: manipulation;
}
.db-btn-util:hover {
  background-color: var(--db-primary-light);
  border-color: var(--db-primary);
}
.db-btn-util[aria-pressed="true"] {
  background-color: var(--db-primary);
  color: var(--db-text-inverse);
  border-color: var(--db-primary);
}

/* Progress bar container */
.db-progress-region {
  margin-bottom: 1.5rem;
}
.db-progress-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--db-text-muted);
  margin-bottom: 0.5rem;
}
.db-progress-track {
  width: 100%;
  height: 0.75rem;
  background-color: #cbd5e1;
  border-radius: 0.375rem;
  overflow: hidden;
  border: 1px solid var(--db-border);
}
.db-progress-fill {
  height: 100%;
  background-color: var(--db-primary);
  transition: width 0.25s ease-in-out;
}

/* Main Step Card */
.db-step-card {
  background-color: var(--db-bg-card);
  border: 2px solid var(--db-border);
  border-radius: 0.75rem;
  padding: 1.5rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Step Header with High Contrast Icon */
.db-step-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.db-step-icon-wrap {
  flex-shrink: 0;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--db-primary-light);
  color: var(--db-primary);
  border: 2px solid var(--db-primary);
  border-radius: 0.625rem;
}
.db-step-icon-wrap svg {
  width: 2rem;
  height: 2rem;
}
.db-step-title-wrap {
  flex: 1;
}
.db-step-heading {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--db-text-main);
  margin: 0 0 0.375rem 0;
  line-height: 1.35;
}
.db-step-heading:focus {
  outline: none;
}
.db-step-required-badge {
  display: inline-block;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--db-error);
  margin-left: 0.375rem;
}

/* Read Aloud Trigger Slot */
.db-read-aloud-wrap {
  margin-top: 0.5rem;
}

/* Error Summary Banner (WCAG 3.3.1) */
.db-error-summary {
  background-color: var(--db-error-bg);
  border: 2px solid var(--db-error);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.25rem;
}
.db-error-summary-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: var(--db-error);
  font-size: 1.0625rem;
  margin-bottom: 0.375rem;
}
.db-error-summary-header svg {
  width: 1.25rem;
  height: 1.25rem;
}
.db-error-summary-text {
  margin: 0;
  color: var(--db-text-main);
  font-size: 0.9375rem;
}

/* Field / Input Styles */
.db-field-group {
  margin-top: 1rem;
}
.db-label {
  display: block;
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--db-text-main);
  margin-bottom: 0.5rem;
}
.db-hint {
  font-size: 0.875rem;
  color: var(--db-text-muted);
  margin-bottom: 0.625rem;
}

.db-input-text {
  width: 100%;
  min-height: var(--db-touch-min);
  padding: 0.75rem 1rem;
  font-size: 1.125rem;
  color: var(--db-text-main);
  background-color: #ffffff;
  border: 2px solid var(--db-border-strong);
  border-radius: 0.5rem;
}
.db-input-text:hover {
  border-color: var(--db-primary);
}
.db-input-text[aria-invalid="true"] {
  border-color: var(--db-error);
  background-color: var(--db-error-bg);
}

/* Voice Input wrapper */
.db-input-voice-wrap {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}
.db-input-voice-wrap .db-input-text {
  flex: 1;
}

/* Choice / Radio Cards */
.db-choice-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: none;
  padding: 0;
  margin: 0;
}
.db-choice-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: 3.5rem;
  padding: 0.875rem 1rem;
  background-color: #ffffff;
  border: 2px solid var(--db-border-strong);
  border-radius: 0.625rem;
  cursor: pointer;
  touch-action: manipulation;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.db-choice-card:hover {
  border-color: var(--db-primary);
  background-color: var(--db-primary-light);
}
.db-choice-card.db-selected {
  border-color: var(--db-primary);
  background-color: var(--db-primary-light);
  border-width: 3px;
}
.db-choice-radio {
  width: 1.5rem;
  height: 1.5rem;
  accent-color: var(--db-primary);
  cursor: pointer;
  flex-shrink: 0;
}
.db-choice-label {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--db-text-main);
  cursor: pointer;
}

/* Ethiopian Date Picker Container & Fallback */
.db-eth-date-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}
.db-date-field {
  display: flex;
  flex-direction: column;
}
.db-date-label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.db-select {
  min-height: var(--db-touch-min);
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 2px solid var(--db-border-strong);
  border-radius: 0.5rem;
  background-color: #ffffff;
  color: var(--db-text-main);
}
.db-gregorian-hint {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background-color: #f1f5f9;
  border-left: 3px solid var(--db-primary);
  font-size: 0.875rem;
  color: var(--db-text-muted);
}

/* Support Tags / Accommodations (Privacy-First) */
.db-tags-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: none;
  padding: 0;
  margin: 0;
}
.db-tag-card {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  min-height: 3.25rem;
  padding: 0.875rem 1rem;
  background-color: #ffffff;
  border: 2px solid var(--db-border-strong);
  border-radius: 0.625rem;
  cursor: pointer;
  touch-action: manipulation;
}
.db-tag-card:hover {
  background-color: var(--db-primary-light);
  border-color: var(--db-primary);
}
.db-tag-card.db-checked {
  border-color: var(--db-primary);
  background-color: var(--db-primary-light);
  border-width: 3px;
}
.db-tag-checkbox {
  width: 1.5rem;
  height: 1.5rem;
  margin-top: 0.125rem;
  accent-color: var(--db-primary);
  cursor: pointer;
  flex-shrink: 0;
}
.db-tag-content {
  flex: 1;
}
.db-tag-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--db-text-main);
  margin-bottom: 0.125rem;
}
.db-tag-desc {
  font-size: 0.875rem;
  color: var(--db-text-muted);
}

/* File or Referral (FR-04) */
.db-referral-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.db-referral-tab {
  flex: 1 1 9rem;
  min-height: var(--db-touch-min);
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  background-color: #ffffff;
  border: 2px solid var(--db-border-strong);
  border-radius: 0.5rem;
  cursor: pointer;
}
.db-referral-tab.db-active {
  background-color: var(--db-primary);
  color: var(--db-text-inverse);
  border-color: var(--db-primary);
}
.db-file-dropzone {
  border: 2px dashed var(--db-border-strong);
  border-radius: 0.625rem;
  padding: 1.5rem 1rem;
  text-align: center;
  background-color: #f8fafc;
  cursor: pointer;
  min-height: 7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.db-file-dropzone:hover {
  border-color: var(--db-primary);
  background-color: var(--db-primary-light);
}
.db-consent-card {
  margin-top: 1.25rem;
  padding: 1rem;
  background-color: #eff6ff;
  border: 2px solid #bfdbfe;
  border-radius: 0.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.db-consent-check {
  width: 1.5rem;
  height: 1.5rem;
  margin-top: 0.125rem;
  accent-color: var(--db-primary);
  cursor: pointer;
  flex-shrink: 0;
}
.db-consent-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--db-primary);
  cursor: pointer;
}

/* Navigation Footer (Back, Next/Submit, Save & Resume) */
.db-nav-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 2px solid var(--db-border);
}

.db-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 3.25rem;
  min-width: 7.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1.0625rem;
  font-weight: 700;
  border-radius: 0.5rem;
  cursor: pointer;
  touch-action: manipulation;
  border: 2px solid transparent;
}

.db-btn-primary {
  background-color: var(--db-primary);
  color: var(--db-text-inverse);
  flex: 1 1 10rem;
}
.db-btn-primary:hover {
  background-color: var(--db-primary-hover);
}

.db-btn-secondary {
  background-color: #ffffff;
  color: var(--db-text-main);
  border-color: var(--db-border-strong);
  flex: 0 1 auto;
}
.db-btn-secondary:hover {
  background-color: #f1f5f9;
}
.db-btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.db-btn-save {
  background-color: #ffffff;
  color: var(--db-primary);
  border-color: var(--db-primary);
  flex: 0 1 auto;
  font-size: 0.9375rem;
}
.db-btn-save:hover {
  background-color: var(--db-primary-light);
}

/* Auto-save & Status Notice */
.db-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: var(--db-text-muted);
}
.db-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 600;
}
.db-status-saved {
  color: var(--db-success);
}
`;

/**
 * Injects the accessible stylesheet into a document or ShadowRoot.
 */
export function injectStyles(target: Document | ShadowRoot): void {
  const existing = target.querySelector('style[data-digitalbridge-styles]');
  if (existing) return;

  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-digitalbridge-styles', 'true');
  styleEl.textContent = ACCESSIBLE_CSS;

  if (target instanceof Document) {
    target.head.appendChild(styleEl);
  } else {
    target.appendChild(styleEl);
  }
}
