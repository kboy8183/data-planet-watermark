// Native HTML drag-and-drop does not work consistently with tablet touch input.
(() => {
  let drag = null, frame = 0, suppressClickUntil = 0;
  const zonesInPage = () => document.querySelectorAll('[data-zone]');
  function highlight(x, y) {
    const hit = document.elementFromPoint(x, y);
    const zone = hit && hit.closest('[data-zone]');
    zonesInPage().forEach(el => el.classList.toggle('touch-drop-target', el === zone));
    return zone;
  }
  function scrollDuringDrag() {
    if (!drag || !drag.moved) return;
    const edge = Math.min(80, innerHeight / 5);
    const delta = drag.y > innerHeight - edge ? 12 : drag.y < edge ? -12 : 0;
    if (delta) { window.scrollBy(0, delta); highlight(drag.x, drag.y); }
    frame = requestAnimationFrame(scrollDuringDrag);
  }
  function start(event) {
    const card = event.target.closest('.card');
    if (!card || stage !== 1 || drag || (event.button != null && event.button > 0)) return;
    const index = Number(card.dataset.cardIndex);
    if (!Number.isInteger(index)) return;
    const rect = card.getBoundingClientRect();
    drag = { card, index, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, dx: event.clientX - rect.left, dy: event.clientY - rect.top, moved: false, ghost: null };
    card.draggable = false;
    if (card.setPointerCapture && event.pointerId != null) card.setPointerCapture(event.pointerId);
    event.preventDefault();
  }
  function movePointer(event) {
    if (!drag || (event.pointerId != null && event.pointerId !== drag.pointerId)) return;
    event.preventDefault();
    drag.x = event.clientX; drag.y = event.clientY;
    if (!drag.moved && Math.hypot(drag.x - drag.startX, drag.y - drag.startY) > 6) {
      drag.moved = true;
      const ghost = drag.card.cloneNode(true);
      ghost.className = 'card touch-drag-ghost';
      ghost.setAttribute('aria-hidden', 'true');
      ghost.style.width = `${drag.card.getBoundingClientRect().width}px`;
      document.body.append(ghost);
      drag.ghost = ghost;
      drag.card.classList.add('touch-drag-source');
      frame = requestAnimationFrame(scrollDuringDrag);
    }
    if (drag.ghost) drag.ghost.style.transform = `translate(${drag.x - drag.dx}px, ${drag.y - drag.dy}px)`;
    highlight(drag.x, drag.y);
  }
  function cleanup() {
    const previous = drag;
    drag = null;
    cancelAnimationFrame(frame);
    zonesInPage().forEach(el => el.classList.remove('touch-drop-target'));
    if (previous) {
      if (previous.ghost) previous.ghost.remove();
      previous.card.classList.remove('touch-drag-source');
      previous.card.draggable = true;
    }
    return previous;
  }
  function finish(event, cancelled = false) {
    if (!drag || (event.pointerId != null && event.pointerId !== drag.pointerId)) return;
    const zone = highlight(event.clientX == null ? drag.x : event.clientX, event.clientY == null ? drag.y : event.clientY);
    const previous = cleanup();
    suppressClickUntil = Date.now() + 700;
    if (cancelled) return;
    if (previous.moved) {
      if (zone) { selected = previous.index; move(Number(zone.dataset.zone)); }
      else $('status').textContent = 'A 또는 B 분류함 안에 카드를 놓아 주세요.';
    } else {
      selected = selected === previous.index ? null : previous.index;
      render();
      $('status').textContent = selected === null ? '선택을 취소했어요.' : '선택한 카드를 옮길 분류함을 눌러 주세요.';
    }
  }
  document.addEventListener('click', event => {
    if (Date.now() < suppressClickUntil && event.target.closest('.card')) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  if (window.PointerEvent) {
    document.addEventListener('pointerdown', start, { passive: false });
    document.addEventListener('pointermove', movePointer, { passive: false });
    document.addEventListener('pointerup', event => finish(event));
    document.addEventListener('pointercancel', event => finish(event, true));
    window.addEventListener('blur', cleanup);
  } else {
    const touchEvent = event => { const point = event.changedTouches[0]; return { target: event.target, clientX: point.clientX, clientY: point.clientY, preventDefault: () => event.preventDefault() }; };
    document.addEventListener('touchstart', event => start(touchEvent(event)), { passive: false });
    document.addEventListener('touchmove', event => movePointer(touchEvent(event)), { passive: false });
    document.addEventListener('touchend', event => finish(touchEvent(event)));
    document.addEventListener('touchcancel', event => finish(touchEvent(event), true));
  }
})();
