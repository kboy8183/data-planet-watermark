// Use the visible viewport, including tablet browser bars and the on-screen keyboard.
(() => {
  const host = document.getElementById('activity-host');
  const updateHeight = () => document.documentElement.style.setProperty('--app-height', `${Math.round(window.visualViewport?.height || window.innerHeight)}px`);
  updateHeight();
  window.addEventListener('resize', updateHeight);
  window.visualViewport?.addEventListener('resize', updateHeight);
  async function closeExpanded() {
    document.body.classList.remove('activity-expanded');
    if (document.fullscreenElement && document.exitFullscreen) {
      try { await document.exitFullscreen(); } catch { /* CSS mode already closed. */ }
    }
  }
  document.getElementById('fullscreen').onclick = async () => {
    if (document.body.classList.contains('activity-expanded') || document.fullscreenElement) return closeExpanded();
    document.body.classList.add('activity-expanded');
    // CSS mode remains usable on iPad browsers without element fullscreen support.
    if (host.requestFullscreen) { try { await host.requestFullscreen(); } catch { /* Keep CSS mode. */ } }
  };
  host.addEventListener('click', event => { if (event.target.closest('.exit-full')) { event.stopImmediatePropagation(); closeExpanded(); } }, true);
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) document.body.classList.remove('activity-expanded'); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeExpanded(); });
  window.addEventListener('hashchange', closeExpanded);
})();
