const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/activities/wordcloud/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const context={font:'',measureText(text){return {width:text.length*parseFloat(this.font.match(/([\d.]+)px/)[1])*.85};}};
const sandbox={document:{getElementById(){return {getContext(){return context}}}}};
vm.createContext(sandbox);vm.runInContext(script.split('let result=null;')[0]+';globalThis.api={parseData,placeWords};',sandbox);
const {parseData,placeWords}=sandbox.api;
assert.equal(parseData('사과:12\n딸기：8\n사과:3')[0].value,15);
for(const text of ['', '사과:-1','사과:1.5','사과:NaN','사과:0',':3','사과:1000001'])assert.throws(()=>parseData(text));
assert.throws(()=>parseData(Array.from({length:81},(_,i)=>`항목${i}:1`).join('\n')));
for(const text of ['사과:12\n딸기:8\n포도:5\n수박:0','가장긴항목'.repeat(5)+':1000000\n작은항목:1',Array.from({length:80},(_,i)=>`항목${i}:${i+1}`).join('\n'),'가:2\n나:2']){
 const items=parseData(text),boxes=placeWords(items);assert.equal(boxes.length,items.filter(x=>x.value>0).length);
 for(let i=0;i<boxes.length;i++){const a=boxes[i];assert(a.x>=35&&a.x+a.width<=1565&&a.y>=200&&a.y+a.height<=1040);if(i&&a.value<boxes[i-1].value)assert(a.size<boxes[i-1].size);for(const b of boxes.slice(i+1))assert(a.x+a.width<=b.x||a.x>=b.x+b.width||a.y+a.height<=b.y||a.y>=b.y+b.height);}
}
const portal=fs.readFileSync(__dirname+'/portal.js','utf8');assert(portal.includes('href="#/4/3"'));assert(portal.includes('https://www.ebsmath.co.kr/'));assert(!portal.includes('tsherpa'));console.log('PASS: parsing, invalid inputs, duplicate counts, font sizes, 80-item packing, bounds, overlap, and lesson links');
