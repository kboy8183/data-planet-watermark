(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const words=['데이터','정보','자료','수집','분석','시각화','활용','예측','해결','가치','변화'];
  const criteria=[
    {key:'knowledge',label:'지식',text:'데이터의 종류와 생활 속 활용 사례를 설명할 수 있나요?'},
    {key:'skill',label:'기능',text:'데이터를 수집·분류하고 알맞게 시각화할 수 있나요?'},
    {key:'attitude',label:'태도',text:'데이터를 바르게 활용하며 친구와 협력할 수 있나요?'}
  ];
  const storageKey='data-planet-lesson5-reflection-v1';
  const now=new Date();
  $('learning-date').value=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  $('rubric').innerHTML=criteria.map(c=>`<fieldset class="rubric-row" data-key="${c.key}"><legend>${c.label}</legend><p>${c.text}</p><div class="stars">${[1,2,3,4,5].map(n=>`<label class="star-label"><input type="radio" name="${c.key}" value="${n}" aria-label="${c.label} ${n}점" required><span aria-hidden="true">★</span></label>`).join('')}<output class="rating-value" id="rating-${c.key}">별점을 골라 주세요</output></div></fieldset>`).join('');
  function read(){return {name:$('student-name').value.trim(),className:$('student-class').value.trim(),date:$('learning-date').value,summary:$('summary').value,ratings:Object.fromEntries(criteria.map(c=>[c.key,Number(document.querySelector(`input[name="${c.key}"]:checked`)?.value||0)]))};}
  function paint(){
    $('char-count').textContent=`${$('summary').value.length} / 200`;
    for(const c of criteria){const n=Number(document.querySelector(`input[name="${c.key}"]:checked`)?.value||0);document.querySelectorAll(`input[name="${c.key}"]`).forEach(input=>input.parentElement.classList.toggle('filled',Number(input.value)<=n));$(`rating-${c.key}`).textContent=n?`${n} / 5점`:'별점을 골라 주세요';}
  }
  function save(){paint();try{localStorage.setItem(storageKey,JSON.stringify(read()));$('save-status').textContent='이 브라우저에 자동 저장했어요.';}catch{$('save-status').textContent='자동 저장이 어려워요. 작성 후 PNG로 저장해 주세요.';}}
  try{const data=JSON.parse(localStorage.getItem(storageKey)||'null');if(data){$('student-name').value=String(data.name||'').slice(0,20);$('student-class').value=String(data.className||'').slice(0,20);if(/^\d{4}-\d{2}-\d{2}$/.test(data.date))$('learning-date').value=data.date;$('summary').value=String(data.summary||'').slice(0,200);for(const c of criteria){const n=Number(data.ratings?.[c.key]);if(n>=1&&n<=5&&Number.isInteger(n))document.querySelector(`input[name="${c.key}"][value="${n}"]`).checked=true;}}}catch{}
  paint();$('reflection-form').addEventListener('input',save);$('reflection-form').addEventListener('change',save);
  function rounded(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
  function textLines(ctx,text,x,y,width,lineHeight){let line='';for(const ch of String(text)){if(ch==='\n'||(line&&ctx.measureText(line+ch).width>width)){ctx.fillText(line,x,y);y+=lineHeight;line=ch==='\n'?'':ch;}else line+=ch;}if(line){ctx.fillText(line,x,y);y+=lineHeight;}return y;}
  function star(ctx,x,y,r,filled){ctx.beginPath();for(let i=0;i<10;i++){const angle=-Math.PI/2+i*Math.PI/5;const radius=i%2?r*.45:r;const px=x+Math.cos(angle)*radius,py=y+Math.sin(angle)*radius;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);}ctx.closePath();ctx.fillStyle=filled?'#e7b252':'#e6e0ed';ctx.fill();}
  function image(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});}
  async function renderImage(data){
    await document.fonts.ready;
    const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1900;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#f4f0f9';ctx.fillRect(0,0,1600,1900);
    rounded(ctx,36,30,1528,1840,32,'#fff');
    try{const logo=await image('../../assets/daegu-education.png');ctx.drawImage(logo,58,32,300,100);}catch{}
    ctx.font='22px Dohyeon';ctx.fillStyle='#9678b1';ctx.fillText('데이터 플래닛 · 5차시',1190,91);
    ctx.font='48px Dohyeon';ctx.fillStyle='#4a3c62';ctx.fillText('나의 한 문장 정리와 자기평가',78,174);
    ctx.font='25px Dohyeon';ctx.fillStyle='#8f7c9e';ctx.fillText('WITH 5학년 디지털 사회와 인공지능',80,219);
    ctx.font='24px Dohyeon';ctx.fillStyle='#6c5d7c';ctx.fillText(`이름: ${data.name||'(미작성)'}`,80,268,450);ctx.fillText(`학년·반: ${data.className||'(미작성)'}`,570,268,540);ctx.fillText(`날짜: ${data.date}`,1150,268,360);
    rounded(ctx,66,310,1468,650,24,'#faf7ff','#e8deef');
    ctx.font='31px Dohyeon';ctx.fillStyle='#745991';ctx.fillText('01  생활 속 데이터의 의미를 한 문장으로 정리해요',96,369);
    rounded(ctx,96,398,1408,104,16,'#fff0d9');ctx.font='25px Dohyeon';ctx.fillStyle='#8a6335';textLines(ctx,'보기  '+words.join(' · '),122,439,1350,36);
    rounded(ctx,96,532,1408,366,16,'#fff','#e6deed');ctx.font='34px Dohyeon';ctx.fillStyle='#453955';textLines(ctx,data.summary.replace(/\s+/g,' ').trim(),128,594,1340,54);
    rounded(ctx,66,1002,1468,772,24,'#f6faf8','#dcebe5');ctx.font='31px Dohyeon';ctx.fillStyle='#538572';ctx.fillText('02  단원 전체의 배움을 스스로 평가해요',96,1063);
    ctx.font='22px Dohyeon';ctx.fillStyle='#82948a';ctx.fillText('1점: 더 연습할래요     3점: 어느 정도 할 수 있어요     5점: 자신 있게 할 수 있어요',98,1108);
    criteria.forEach((c,i)=>{const y=1140+i*194;rounded(ctx,96,y,1408,172,17,'#fff','#e2e9e5');ctx.font='25px Dohyeon';ctx.fillStyle='#7c6396';ctx.fillText(c.label,124,y+40);ctx.font='29px Dohyeon';ctx.fillStyle='#453955';textLines(ctx,c.text,224,y+40,1220,38);for(let j=0;j<5;j++)star(ctx,145+j*62,y+117,24,j<data.ratings[c.key]);ctx.font='27px Dohyeon';ctx.fillStyle='#917446';ctx.fillText(`${data.ratings[c.key]} / 5점`,486,y+127);});
    ctx.font='22px Dohyeon';ctx.fillStyle='#a394af';ctx.fillText('데이터를 활용해 생활 속 변화를 만들어 가는 나의 배움 기록',442,1826);
    return canvas;
  }
  let currentUrl=null;
  $('reflection-form').addEventListener('submit',async event=>{
    event.preventDefault();const data=read();$('form-error').textContent='';
    if(!data.summary.trim()||criteria.some(c=>data.ratings[c.key]<1||data.ratings[c.key]>5)){$('form-error').textContent='나의 한 문장과 세 항목의 별점을 모두 작성해 주세요.';return;}
    const button=$('export-image');button.disabled=true;button.textContent='이미지를 만들고 있어요…';
    try{const canvas=await renderImage(data);const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG 생성 실패')),'image/png'));if(currentUrl)URL.revokeObjectURL(currentUrl);currentUrl=URL.createObjectURL(blob);const link=$('download-image');link.href=currentUrl;link.download=`데이터플래닛_배움정리_${data.date}.png`;$('image-preview').src=currentUrl;$('image-result').hidden=false;link.click();$('save-status').textContent='PNG 이미지가 완성됐어요. 아래 미리보기에서 다시 저장할 수 있어요.';$('image-result').scrollIntoView({behavior:'smooth',block:'start'});}catch(error){$('form-error').textContent='이미지를 만들지 못했어요. 작성 내용은 유지되어 있어요. 잠시 후 다시 저장해 주세요.';console.error(error);}finally{button.disabled=false;button.textContent='↓ PNG 이미지로 저장';}
  });
})();
