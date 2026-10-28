class TetrisEngine{
 constructor(cols=8,rows=16){this.cols=cols;this.rows=rows;this.boards=[this.empty(),this.empty()];this.serial=0;this.active=null;this.over=false;this.lines=0;this.score=0;this.combo=0;this.locked=0;this.labels=new Map()}
 empty(){return Array.from({length:this.rows},()=>Array(this.cols).fill(0))}
 static shapes=[[[0,0],[1,0],[0,1],[1,1]],[[0,0],[1,0],[2,0],[3,0]],[[0,0],[1,0],[2,0],[1,1]],[[0,0],[0,1],[1,1],[2,1]],[[2,0],[0,1],[1,1],[2,1]],[[1,0],[2,0],[0,1],[1,1]],[[0,0],[1,0],[1,1],[2,1]]];
 fits(cells,x,y,b){return cells.every(([cx,cy])=>x+cx>=0&&x+cx<this.cols&&y+cy>=0&&y+cy<this.rows&&!this.boards[b][y+cy][x+cx])}
 spawn(item,shape,board=item.type,answerCorrect=board===item.type){const cells=shape.map(p=>[...p]);this.active={cells,x:2,y:0,board,item,answerCorrect,id:++this.serial};for(const x of [2,0,1,3,4,5,6,7])if(this.fits(cells,x,0,board)){this.active.x=x;return true}this.over=true;return false}
 addPenalty(board){const rows=this.boards[board];const overflow=rows.shift().some(Boolean);rows.push(Array(this.cols).fill(-1));if(overflow)this.over=true;return !overflow}
 move(dx){const a=this.active;if(!a||this.over)return false;const x=a.x+dx;if(this.fits(a.cells,x,a.y,a.board)){a.x=x;return true}return false}
 rotate(){const a=this.active;if(!a||this.over)return false;const maxY=Math.max(...a.cells.map(c=>c[1]));const r=a.cells.map(([x,y])=>[maxY-y,x]);for(const k of [0,-1,1,-2,2,-3,3])if(this.fits(r,a.x+k,a.y,a.board)){a.cells=r;a.x+=k;return true}return false}
 ghostY(){const a=this.active;if(!a)return 0;let y=a.y;while(this.fits(a.cells,a.x,y+1,a.board))y++;return y}
 step(){const a=this.active;if(!a||this.over)return 'idle';if(this.fits(a.cells,a.x,a.y+1,a.board)){a.y++;return 'moved'}return this.lock()}
 drop(){if(!this.active||this.over)return 'idle';this.active.y=this.ghostY();return this.lock()}
 lock(){const a=this.active;for(const [x,y]of a.cells)this.boards[a.board][a.y+y][a.x+x]=a.id;this.labels.set(a.id,{text:a.item.text,board:a.board});const kept=this.boards[a.board].filter(row=>row.every(v=>v===-1)||row.some(v=>v===0));const n=this.rows-kept.length;while(kept.length<this.rows)kept.unshift(Array(this.cols).fill(0));this.boards[a.board]=kept;this.lines+=n;const correct=a.answerCorrect;if(correct)this.combo++;else this.combo=0;this.locked++;this.score+=(correct?100+Math.min(this.combo-1,10)*10:0)+([0,100,300,500,800][n]||n*200);const live=new Set(this.boards.flat(2));for(const id of this.labels.keys())if(!live.has(id))this.labels.delete(id);return n?'clear':'locked'}
}
if(typeof module!=='undefined')module.exports=TetrisEngine;
