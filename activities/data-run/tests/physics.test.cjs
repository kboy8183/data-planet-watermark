const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function setup(){
 const nodes={};const get=id=>nodes[id]||= {style:{},classList:{toggle(){}},children:[],replaceChildren(){this.children=[]},append(el){this.children.push(el)},addEventListener(){},remove(){},offsetLeft:180,offsetWidth:120};
 const context=vm.createContext({cancelAnimationFrame(){},window:{scrollTo(){},DATA_RUN_QUESTIONS:{questions:[]}},document:{getElementById:get,createElement:()=>get('new'),addEventListener(){}},DataRun:{validate(){}},console,Math});
 let src=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
 src=src.trimEnd().slice(0,-5) + 'globalThis.api={player,updatePhysics,overGap,spawnObject,frame,setObjects(v){objects=v},getObjects(){return objects},setGame(m){model=m;state="running"},getState(){return state}};})();';
 vm.runInContext(src,context);return {api:context.api,get};
}
test('new objects have their offscreen position before the first animation frame',()=>{const {api,get}=setup();api.spawnObject('gap',1400,0,120,false);assert.equal(get('objects').children[0].style.transform,'translateX(1400px)');assert.equal(get('objects').children[0].style.left,'0px')});
test('a partial overlap with a gap still has supporting floor',()=>{const {api}=setup();api.setObjects([{type:'gap',x:245,width:120}]);assert.equal(api.overGap(),false);api.updatePhysics(.016);assert.equal(api.player.grounded,true)});
test('jumping at the edge retains upward velocity',()=>{const {api}=setup();api.setObjects([{type:'gap',x:200,width:120}]);Object.assign(api.player,{grounded:false,vy:710});api.updatePhysics(.016);assert.ok(api.player.y>0);assert.equal(api.player.falling,false)});
test('solid floor does not rescue a runner already falling below a gap',()=>{const {api}=setup();Object.assign(api.player,{grounded:false,falling:true,y:-20,vy:-200});api.updatePhysics(.016);assert.ok(api.player.y < -20);assert.equal(api.player.grounded,false);assert.equal(api.player.falling,true)});
test('a normal jump lands on solid floor',()=>{const {api}=setup();Object.assign(api.player,{grounded:false,falling:false,y:1,vy:-200});api.updatePhysics(.016);assert.equal(api.player.y,0);assert.equal(api.player.grounded,true);assert.equal(api.player.jumps,0)});
test('an actual open gap causes downward movement',()=>{const {api}=setup();api.setObjects([{type:'gap',x:200,width:120}]);api.updatePhysics(.016);assert.equal(api.player.falling,true);assert.ok(api.player.y<0)});

function runner(hearts){return {hearts,maxHearts:5,score:0,coins:0,bonusCorrect:0,bonusAnswered:0,distance:0,hitObstacle(){this.hearts--;}};}
test('a moving gap costs exactly one heart and respawns the runner',()=>{const {api}=setup(),model=runner(5);api.setGame(model);api.setObjects([{type:'gap',x:200,width:120,el:{remove(){}}}]);api.updatePhysics(.033);assert.equal(api.player.falling,true);api.setObjects([]);for(let i=0;i<35;i++)api.updatePhysics(.033);assert.equal(model.hearts,4);assert.equal(api.player.grounded,true);assert.equal(api.player.y,0);assert.equal(api.getState(),'running')});
test('falling with the last heart ends the run',()=>{const {api,get}=setup(),model=runner(1);api.setGame(model);Object.assign(api.player,{grounded:false,falling:true,y:-219,vy:-400});api.updatePhysics(.033);assert.equal(model.hearts,0);assert.equal(api.getState(),'results');assert.equal(get('results').hidden,false)});
