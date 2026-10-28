(() => {
  const mode=location.pathname.endsWith('/tablet.html')?'tablet':location.pathname.endsWith('/pc.html')?'pc':(matchMedia('(pointer:coarse)').matches?'tablet':'pc');
  document.body.dataset.device=mode;
  const bar=document.querySelector('.education-bar'),switcher=document.createElement('nav');switcher.className='device-switch';switcher.setAttribute('aria-label','화면 버전');
  for(const [key,label] of [['pc','PC용'],['tablet','태블릿용']]){const a=document.createElement('a');a.href=`${key}.html${location.hash}`;a.textContent=label;if(key===mode)a.setAttribute('aria-current','page');switcher.append(a);}bar.append(switcher);
  window.addEventListener('hashchange',()=>switcher.querySelectorAll('a').forEach((a,i)=>a.href=`${i?'tablet':'pc'}.html${location.hash}`));
  const host=document.getElementById('activity-host');let clean=null,queued=0;
  function attach(frame){
    clean?.();let doc;try{doc=frame.contentDocument;if(!doc?.body||doc.URL==='about:blank')return;}catch{return;}
    let running=false,disposed=false;const stops=[];
    const style=doc.createElement('style');style.textContent='html{overflow:hidden!important}body{overflow-x:hidden!important}.game-screen{height:var(--fit-height)!important;min-height:0!important}';doc.head.append(style);doc.body.dataset.screenDevice=mode;const layout=doc.createElement('link');layout.rel='stylesheet';layout.href='../../device-layout.css?v=2';layout.onload=()=>schedule();doc.head.append(layout);
    function fit(){
      if(disposed||running||!frame.isConnected||!host.clientWidth||!host.clientHeight)return;running=true;
      const compact=/data-run|learning-summary/.test(frame.src);const w=mode==='tablet'?Math.max(768,host.clientWidth):Math.max(compact?960:1280,Math.min(1600,host.clientWidth)),base=Math.max(480,host.clientHeight);
      frame.style.width=w+'px';frame.style.height=base+'px';doc.documentElement.style.setProperty('--tablet-vh',(base/100)+'px');doc.documentElement.style.setProperty('--fit-height',base+'px');
      const h=Math.ceil(Math.max(base,doc.body.scrollHeight,doc.documentElement.scrollHeight));frame.style.height=h+'px';
      const scale=Math.min(host.clientWidth/w,host.clientHeight/h);
      frame.style.transform=`scale(${scale})`;frame.style.left=Math.max(0,(host.clientWidth-w*scale)/2)+'px';frame.style.top=Math.max(0,(host.clientHeight-h*scale)/2)+'px';
      frame.dataset.fitScale=scale.toFixed(4);frame.dataset.device=mode;running=false;
    }
    let timer=0;const schedule=()=>{clearTimeout(timer);timer=setTimeout(fit,80);};
    const ro=new ResizeObserver(schedule);ro.observe(doc.body);stops.push(()=>ro.disconnect());
    const ignore='#objects,#score,#coins,#hearts,#bonus-count,#run-progress-fill,#countdown,#floating-score,#stage-text,#theme-banner,#scene-message';
    const mo=new MutationObserver(records=>{if(records.some(r=>!(r.target.parentElement||r.target).closest?.(ignore)&&r.type==='childList'))schedule();});mo.observe(doc.body,{childList:true,subtree:true});stops.push(()=>mo.disconnect());
    frame.addEventListener('fit-viewport',schedule);doc.addEventListener('click',schedule);doc.addEventListener('load',schedule,true);window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);doc.fonts?.ready.then(schedule);fit();
    clean=()=>{disposed=true;clearTimeout(timer);stops.forEach(fn=>fn());window.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('resize',schedule);};
  }
  host.addEventListener('load',event=>{if(event.target.tagName==='IFRAME')attach(event.target);},true);
  new ResizeObserver(()=>{cancelAnimationFrame(queued);queued=requestAnimationFrame(()=>host.querySelector('iframe')?.dispatchEvent(new Event('fit-viewport')));}).observe(host);
  // Fullscreen changes alter the host even when the browser viewport stays the same.
  new MutationObserver(()=>{if(!host.querySelector('iframe'))clean?.();}).observe(host,{childList:true});
  const existing=host.querySelector('iframe');if(existing?.contentDocument?.readyState==='complete')attach(existing);
})();
