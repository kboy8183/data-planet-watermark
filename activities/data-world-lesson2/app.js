const $=s=>document.querySelector(s);
const places=[
 {id:'cafeteria',name:'급식실',icon:'🍽️',box:[6,11,28,23],pin:[31,31]},
 {id:'library',name:'도서관',icon:'📚',box:[34,10,30,24],pin:[61,30]},
 {id:'classroom',name:'교실',icon:'🏫',box:[65,10,21,24],pin:[83,30]},
 {id:'corridor',name:'복도',icon:'🚪',box:[6,34,79,10],pin:[76,41]},
 {id:'toilet',name:'화장실',icon:'🚰',box:[86,24,13,23],pin:[97,43]},
 {id:'playground',name:'운동장',icon:'⚽',box:[16,56,66,27],pin:[76,78]}
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sceneAlts={map:'학교 전체 지도. 위쪽 왼편 급식실, 가운데 도서관, 오른편 교실과 화장실, 건물 앞쪽 복도, 아래쪽 운동장.',cafeteria:'학생들이 식사하는 급식실. 왼쪽 벽의 오늘의 식단표와 오른쪽 벽의 급식 염도 안내판을 관찰할 수 있습니다.',library:'도서관. 왼쪽 벽의 이달의 책 포스터와 오른쪽 책 위치 검색 컴퓨터를 관찰할 수 있습니다.',classroom:'5학년 3반 교실. 학생 책상 번호, 왼쪽 사물함 번호, 칠판의 날짜와 오른쪽 오늘의 시간표가 보입니다.',corridor:'복도. 교실 표지 5-3과 여학생 수 11명, 남학생 수 14명이 적힌 학급 안내판이 보입니다.',toilet:'화장실. 이달의 화장실 관리 학반 안내판에 10월, 5학년 3반이 적혀 있습니다.',playground:'운동장. 오늘의 온도 22도와 미세먼지 PM10 농도 25마이크로그램/세제곱미터, 좋음, 맑음 안내판이 보입니다.'};
const scenePath=id=>`assets/${id}.png`;
function sceneMarkup(id){return `<img class="scene-image" src="${scenePath(id)}" alt="${sceneAlts[id]}" draggable="false" width="1536" height="1024">`+(id==='map'?places.map(p=>`<button class="room-hotspot" data-room="${p.id}" aria-label="${p.name} 확대하기" title="${p.name} 둘러보기" style="left:${p.box[0]}%;top:${p.box[1]}%;width:${p.box[2]}%;height:${p.box[3]}%"><span>${p.icon} ${p.name} 둘러보기 ↗</span></button>`).join(''):'')}
let state={cards:[],selection:''},current='map',editing=null,pending=null,storageOkay=true;
try{const v=JSON.parse(localStorage.getItem('school-data-lesson2-v1'));if(v&&Array.isArray(v.cards)){state.cards=v.cards.filter(c=>places.some(p=>p.id===c.place)&&typeof c.text==='string'&&Number.isFinite(c.x)&&Number.isFinite(c.y)).map(c=>({...c,text:c.text.slice(0,160),x:Math.max(0,Math.min(1,c.x)),y:Math.max(0,Math.min(1,c.y))}));state.selection=typeof v.selection==='string'?v.selection.slice(0,500):''}}catch{storageOkay=false}
function save(){try{localStorage.setItem('school-data-lesson2-v1',JSON.stringify(state));$('#saveStatus').textContent='이 브라우저에 자동 저장';storageOkay=true}catch{storageOkay=false;$('#saveStatus').textContent='자동 저장 불가 · 이미지로 저장해 주세요'}}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
function render(){$('#zoomTitle').textContent=current==='map'?'우리 학교 탐험 지도':`${places.find(p=>p.id===current).name} 자세히 살펴보기`;const p=places.find(p=>p.id===current);$('#scene').innerHTML=sceneMarkup(current);$('#sceneWrap').classList.toggle('detail',!!p);$('#sceneTitle').textContent=p?`${p.name} 자세히 살펴보기`:'우리 학교 탐험 지도';$('#sceneSub').textContent=p?'발견한 데이터 근처를 눌러 카드를 붙여요':'가고 싶은 장소를 눌러 보세요';$('#backMap').hidden=!p;$('#sceneHint').textContent=p?'✦ 그림 속 데이터가 있는 곳을 눌러 기록해요.':'✦ 여섯 장소 중 궁금한 곳부터 탐험해요!';$('#totalCount').textContent=`발견 카드 ${state.cards.length}개`;
 $('#placeList').innerHTML=places.map(p=>`<button class="place ${current===p.id?'active':''}" data-place="${p.id}"><span>${p.icon}</span><div>${p.name}</div>${state.cards.filter(c=>c.place===p.id).length?`<span class="count">${state.cards.filter(c=>c.place===p.id).length}</span>`:''}</button>`).join('');document.querySelector('[data-place="map"]').classList.toggle('active',current==='map');
 $('#cardLayer').innerHTML=p?state.cards.filter(c=>c.place===current).map(c=>`<button class="found-card" data-edit="${esc(c.id)}" style="left:${Math.min(78,Math.max(3,c.x*100))}%;top:${Math.max(23,c.y*100)}%" aria-label="발견 카드 수정: ${esc(c.text)}"><small>✦ 내가 찾은 데이터</small>${esc(c.text)}</button><span style="position:absolute;left:${c.x*100}%;top:${c.y*100}%;width:9px;height:9px;background:#9670df;border:2px solid white;border-radius:50%;transform:translate(-50%,-50%)"></span>`).join(''):places.map(p=>{const n=state.cards.filter(c=>c.place===p.id).length;return n?`<button class="map-pin" data-place="${p.id}" style="left:${p.pin[0]}%;top:${p.pin[1]}%" aria-label="${p.name} 발견 카드 ${n}개">${n}</button>`:''}).join('');
 $('#recordSubtitle').textContent=state.cards.length?`${state.cards.length}개의 발견 카드 · 카드를 누르면 수집할 데이터로 선택돼요.`:'발견한 순간을 카드로 모아 보세요.';$('#recordList').innerHTML=state.cards.length?state.cards.map(c=>`<button data-select-card="${esc(c.id)}" aria-pressed="${state.selection===c.text}" class="${state.selection===c.text?'selected':''}">${places.find(p=>p.id===c.place).icon} ${esc(c.text)} <span style="opacity:.6">· ${places.find(p=>p.id===c.place).name}</span></button>`).join(''):'<p class="empty">아직 비어 있어요. 첫 번째 데이터를 발견해 볼까요?</p>';
}
function openCard(c,point){editing=c?.id||null;pending=point||null;$('#dialogTitle').textContent=c?'발견 카드를 다듬어 볼까요?':'어떤 데이터를 발견했나요?';$('#dialogPlace').textContent=`${places.find(p=>p.id===current).icon} ${places.find(p=>p.id===current).name}에서 발견했어요`;$('#cardText').value=c?.text||'';$('#deleteCard').hidden=!c;$('#cardDialog').showModal();setTimeout(()=>$('#cardText').focus(),50)}
document.addEventListener('click',e=>{const a=e.target.closest('[data-place],[data-room]');if(a){current=a.dataset.place||a.dataset.room;render();return}const select=e.target.closest('[data-select-card]');if(select){const c=state.cards.find(c=>c.id===select.dataset.selectCard);if(c){state.selection=c.text;$('#selection').value=state.selection;$('#charCount').textContent=state.selection.length;save();syncSelectionCards();$('#choose').scrollIntoView({behavior:'smooth',block:'center'});toast('수집하고 싶은 데이터에 바로 반영했어요!')}return}const edit=e.target.closest('[data-edit]');if(edit){const c=state.cards.find(c=>c.id===edit.dataset.edit);if(c){current=c.place;render();openCard(c)}return}});
$('#scene').addEventListener('keydown',e=>{const a=e.target.closest('[data-room]');if(a&&(e.key==='Enter'||e.key===' ')){e.preventDefault();current=a.dataset.room;render()}});
$('#sceneWrap').addEventListener('click',e=>{if(current==='map'||e.target.closest('button'))return;const b=$('#sceneWrap').getBoundingClientRect();const x=(e.clientX-b.left)/b.width,y=(e.clientY-b.top)/b.height;if(x<0||x>1||y<0||y>1)return;openCard(null,{x,y})});
// The SVG is keyboard discoverable; Enter on the scene starts a card at its center.
$('#sceneWrap').tabIndex=0;$('#sceneWrap').setAttribute('aria-label','장소 그림. 확대된 장소에서 Enter 키를 누르면 발견 카드를 작성합니다.');$('#sceneWrap').addEventListener('keydown',e=>{if(e.target===$('#sceneWrap')&&current!=='map'&&e.key==='Enter'){e.preventDefault();openCard(null,{x:.5,y:.5})}});
$('#backMap').onclick=()=>{current='map';render()};$('#closeDialog').onclick=$('#cancelDialog').onclick=()=>$('#cardDialog').close();$('#cardDialog').addEventListener('click',e=>{if(e.target===$('#cardDialog')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)e.target.close()}});
$('#cardForm').onsubmit=e=>{e.preventDefault();const text=$('#cardText').value.trim();if(!text){$('#cardText').setCustomValidity('찾은 데이터를 적어 주세요.');$('#cardText').reportValidity();return}if(editing){state.cards.find(c=>c.id===editing).text=text}else state.cards.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),place:current,...pending,text});save();render();$('#cardDialog').close();toast(storageOkay?'발견 카드를 저장했어요! ✦':'카드를 만들었어요. 이미지로 저장해 주세요.')};$('#cardText').oninput=()=>$('#cardText').setCustomValidity('');$('#deleteCard').onclick=()=>{state.cards=state.cards.filter(c=>c.id!==editing);save();render();$('#cardDialog').close();toast('카드를 삭제했어요.')};
$('#selection').value=state.selection;$('#charCount').textContent=state.selection.length;$('#selection').oninput=e=>{state.selection=e.target.value;$('#charCount').textContent=state.selection.length;save();syncSelectionCards()};
function syncSelectionCards(){document.querySelectorAll('[data-select-card]').forEach(button=>{const card=state.cards.find(c=>c.id===button.dataset.selectCard);const selected=!!card&&state.selection===card.text;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected))})}

$('#expandScene').onclick=()=>{if($('#imageDialog').open)return;$('#zoomStage').append($('#sceneWrap'));$('#imageDialog').showModal()};
$('#closeZoom').onclick=()=>$('#imageDialog').close();
$('#imageDialog').addEventListener('close',()=>{$('.map-area').insertBefore($('#sceneWrap'),$('.map-caption'))});
const imageCache=new Map();
function loadScene(id){if(!imageCache.has(id))imageCache.set(id,new Promise((resolve,reject)=>{const im=new Image;im.onload=()=>resolve(im);im.onerror=()=>{imageCache.delete(id);reject(new Error('그림을 불러오지 못했어요.'))};im.src=scenePath(id)}));return imageCache.get(id)}
function textLines(ctx,text,width){const lines=[];let row='';for(const ch of text){if(ch==='\n'){lines.push(row);row='';continue}if(ctx.measureText(row+ch).width>width&&row){lines.push(row);row=ch}else row+=ch}lines.push(row);return lines}
function drawLines(ctx,lines,x,y,lineHeight){for(const line of lines){ctx.fillText(line,x,y);y+=lineHeight}return y}
function rounded(ctx,x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
async function exportImage(){
 if(!state.selection.trim()){toast('먼저 수집하고 싶은 데이터를 적어 주세요.');$('#selection').focus();return}
 const btn=$('#exportBtn');btn.disabled=true;btn.textContent='이미지 만드는 중…';
 try{
  await document.fonts.ready;
  const snapshot=JSON.parse(JSON.stringify(state));
  const images=await Promise.all(['map',...places.map(p=>p.id)].map(loadScene));
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');canvas.width=1800;
  ctx.font='22px Arial, Malgun Gothic, sans-serif';
  const panels=places.map(p=>{const cards=snapshot.cards.filter(c=>c.place===p.id);const lines=cards.map((c,j)=>textLines(ctx,`${j+1}. ${c.text}`,753));return {p,cards,lines,height:Math.max(690,640+lines.reduce((n,l)=>n+l.length*32+14,0))}});
  const heights=[0,1,2].map(i=>Math.max(panels[i*2].height,panels[i*2+1].height));
  ctx.font='26px Arial, Malgun Gothic, sans-serif';const selectionLines=textLines(ctx,snapshot.selection,1600);
  const panelStart=1350,sy=panelStart+heights.reduce((a,b)=>a+b,0)+100;
  canvas.height=sy+245+selectionLines.length*38;
  if(canvas.height>30000)throw new Error('카드가 너무 많아 이미지가 너무 커졌어요. 카드 수를 줄여 주세요.');
  ctx.fillStyle='#f6f5ff';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#574477';ctx.font='48px Dohyeon';ctx.fillText('우리 학교 데이터 탐험 기록',70,95);
  ctx.font='24px Arial';ctx.fillStyle='#8b7c9f';ctx.fillText(`둘째마당 · 2차시 데이터 수집  |  발견 카드 ${snapshot.cards.length}개`,72,145);
  ctx.drawImage(images[0],70,190,1660,1660*2/3);
  for(const p of places){const count=snapshot.cards.filter(c=>c.place===p.id).length;if(!count)continue;const x=70+p.pin[0]/100*1660,y=190+p.pin[1]/100*1660*2/3;ctx.fillStyle='#845bdd';ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='white';ctx.font='bold 21px Arial';ctx.textAlign='center';ctx.fillText(count,x,y+7);ctx.textAlign='left'}
  for(let i=0;i<panels.length;i++){
   const {p,cards,lines}=panels[i],row=Math.floor(i/2),x=55+(i%2)*855,y=panelStart+heights.slice(0,row).reduce((a,b)=>a+b,0)+row*25;
   rounded(ctx,x,y,835,heights[row],20,'white');ctx.font='30px Dohyeon';ctx.fillStyle='#62547e';ctx.fillText(p.name,x+25,y+44);
   const ix=x+25,iy=y+65,iw=785,ih=iw*2/3;ctx.drawImage(images[i+1],ix,iy,iw,ih);
   cards.forEach((c,j)=>{const px=ix+c.x*iw,py=iy+c.y*ih;ctx.fillStyle='#845bdd';ctx.beginPath();ctx.arc(px,py,15,0,Math.PI*2);ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='white';ctx.font='bold 17px Arial';ctx.textAlign='center';ctx.fillText(j+1,px,py+6);ctx.textAlign='left'});
   let ty=y+632;ctx.font='22px Arial, Malgun Gothic, sans-serif';ctx.fillStyle='#6d6280';
   if(!cards.length){ctx.fillStyle='#a9a2b6';ctx.fillText('아직 발견 카드가 없어요.',x+25,ty)}
   for(const list of lines)ty=drawLines(ctx,list,x+25,ty,32)+14;
  }
  rounded(ctx,55,sy,1690,canvas.height-sy-35,20,'#e8f5f0');ctx.fillStyle='#508478';ctx.font='32px Dohyeon';ctx.fillText('내가 수집하고 싶은 데이터',90,sy+57);
  ctx.font='26px Arial, Malgun Gothic, sans-serif';ctx.fillStyle='#4c6e66';const bottom=drawLines(ctx,selectionLines,90,sy+111,38);
  ctx.font='24px Dohyeon';ctx.fillStyle='#538b7b';ctx.fillText('교과서에 데이터 수집 계획을 세워 데이터를 꾸준히 기록해보세요!',90,bottom+45);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('이미지 생성 실패')),'image/png'));
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='우리학교_데이터탐험_2차시.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  toast('새 학교 그림과 발견 카드, 수집할 데이터를 이미지로 저장했어요!');
 }catch(e){console.error(e);toast(e.message||'이미지를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.')}
 finally{btn.disabled=false;btn.innerHTML='<span>↓</span> 탐험 지도 이미지 저장'}
}
$('#exportBtn').onclick=exportImage;render();if(!storageOkay)$('#saveStatus').textContent='자동 저장 불가 · 이미지로 저장해 주세요';
