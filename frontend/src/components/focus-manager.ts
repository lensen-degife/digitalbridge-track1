/**
 * Programmatic Focus Management & Screen Reader Live Announcements.
 * Conforms to WCAG 2.2 AA (2.4.3 Focus Order, 2.4.7 Focus Visible, 4.1.3 Status Messages).
 */
export class FocusManager {
  private announcerEl: HTMLElement | null = null;
  private container: HTMLElement | ShadowRoot;

  constructor(container: HTMLElement | ShadowRoot) {
    this.container = container;
    this.initAnnouncer();
  }

  /**
   * Initializes a hidden polite live region for assistive tech announcements.
   */
  private initAnnouncer(): void {
    const existing = this.container.querySelector('.db-announcer');
    if (existing) {
      this.announcerEl = existing as HTMLElement;
      return;
    }

    const announcer = document.createElement('div');
    announcer.className = 'db-announcer db-sr-only';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');

    if (this.container instanceof HTMLElement) {
      this.container.appendChild(announcer);
    } else {
      this.container.appendChild(announcer);
    }

    this.announcerEl = announcer;
  }

  /**
   * Announces a message to screen reader users politely.
   */
  public announce(message: string): void {
    if (!this.announcerEl) {
      this.initAnnouncer();
    }
    if (this.announcerEl) {
      // Clear briefly to ensure repeated announcements are read aloud
      this.announcerEl.textContent = '';
      setTimeout(() => {
        if (this.announcerEl) {
          this.announcerEl.textContent = message;
        }
      }, 50);
    }
  }

  /**
   * Programmatically moves focus on step transition:
   * 1. First priority: The step heading (h2[tabindex="-1"])
   * 2. Fallback: The primary form input
   */
  public focusStepHeading(stepId: string): void {
    setTimeout(() => {
      // Target step heading first
      const heading = this.container.querySelector<HTMLElement>(
        `#heading-${stepId}, [data-step-heading]`
      );

      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: false });
        return;
      }

      // Fallback: first interactive input
      const firstInput = this.container.querySelector<HTMLElement>(
        'input:not([type="hidden"]), select, textarea, button.db-choice-card, [tabindex="0"]'
      );
      if (firstInput) {
        firstInput.focus();
      }
    }, 60);
  }

  /**
   * Moves focus directly to the error summary or first invalid form element.
   */
  public focusError(): void {
    setTimeout(() => {
      const errorSummary = this.container.querySelector<HTMLElement>(
        '.db-error-summary, [role="alert"]'
      );
      if (errorSummary) {
        errorSummary.setAttribute('tabindex', '-1');
        errorSummary.focus();
        return;
      }

      const invalidInput = this.container.querySelector<HTMLElement>(
        '[aria-invalid="true"]'
      );
      if (invalidInput) {
        invalidInput.focus();
      }
    }, 60);
  }
}
