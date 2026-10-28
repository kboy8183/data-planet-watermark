(() => {
  const stage = document.getElementById('stage');
  document.getElementById('fullscreen').onclick = async () => {
    if (document.fullscreenElement || document.body.classList.contains('tablet-expanded')) {
      document.body.classList.remove('tablet-expanded');
      if (document.fullscreenElement && document.exitFullscreen) { try { await document.exitFullscreen(); } catch {} }
      return;
    }
    document.body.classList.add('tablet-expanded');
    if (stage.requestFullscreen) { try { await stage.requestFullscreen(); } catch {} }
  };
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) document.body.classList.remove('tablet-expanded'); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') document.body.classList.remove('tablet-expanded'); });
})();
