// Shared viewport sizing and a dialog fallback for older tablet browsers.
(() => {
  if (window.CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radii) {
      const requested = Array.isArray(radii) ? radii[0] : radii || 0;
      const radius = Math.min(Math.max(0, Number(requested)), Math.abs(width) / 2, Math.abs(height) / 2);
      this.moveTo(x + radius, y);
      this.arcTo(x + width, y, x + width, y + height, radius);
      this.arcTo(x + width, y + height, x, y + height, radius);
      this.arcTo(x, y + height, x, y, radius);
      this.arcTo(x, y, x + width, y, radius);
      this.closePath();
      return this;
    };
  }
  function sizeUnits() {
    const root = document.documentElement;
    root.style.setProperty('--tablet-vh', `${window.innerHeight / 100}px`);
    const stage = document.getElementById('stage');
    const box = stage ? stage.getBoundingClientRect() : { width: innerWidth, height: innerHeight };
    root.style.setProperty('--chart-cqw', `${box.width / 100}px`);
    root.style.setProperty('--chart-cqh', `${box.height / 100}px`);
  }
  sizeUnits();
  window.addEventListener('resize', sizeUnits);
  window.addEventListener('orientationchange', sizeUnits);
  document.addEventListener('DOMContentLoaded', () => {
    sizeUnits();
    if (window.ResizeObserver) {
      const stage = document.getElementById('stage');
      if (stage) new ResizeObserver(sizeUnits).observe(stage);
    }
    document.querySelectorAll('dialog').forEach(dialog => {
      if (typeof dialog.showModal === 'function') return;
      let backdrop = null;
      let focusBefore = null;
      Object.defineProperty(dialog, 'open', {
        configurable: true,
        get() { return this.hasAttribute('open'); },
        set(value) { this.toggleAttribute('open', Boolean(value)); }
      });
      dialog.showModal = function () {
        if (this.open) return;
        focusBefore = document.activeElement;
        backdrop = document.createElement('div');
        backdrop.className = 'tablet-dialog-backdrop';
        document.body.append(backdrop);
        this.setAttribute('open', '');
        this.classList.add('tablet-dialog-fallback');
        this.setAttribute('role', 'dialog');
        this.setAttribute('aria-modal', 'true');
        const focusTarget = this.querySelector('[autofocus],input,textarea,button');
        if (focusTarget) focusTarget.focus();
      };
      dialog.close = function (value) {
        if (!this.open) return;
        this.removeAttribute('open');
        this.classList.remove('tablet-dialog-fallback');
        this.returnValue = value || '';
        if (backdrop) backdrop.remove();
        backdrop = null;
        this.dispatchEvent(new Event('close'));
        if (focusBefore && focusBefore.isConnected) focusBefore.focus();
      };
    });
  });
})();
