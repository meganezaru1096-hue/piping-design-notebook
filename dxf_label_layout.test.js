'use strict';
const assert=require('assert'),fs=require('fs'),L=require('./circulation'),N=require('./network');
const s=JSON.parse(fs.readFileSync('サンプル/図面_流れ方向/流れ方向_サンプル.json','utf8')).data,r=L.calculate(s);
for(const view of ['iso','top','front','side']){
 const items=L.scene(s,r,view,true),box=N.drawingBounds(items),h=Math.max(30,.015*Math.max(1000,box.width,box.height)),placed=L.dxfLabelLayout(items,h);
 const tags=new Set(items.filter(x=>x.kind==='label'&&x.layer==='PIPE_TAG').map(x=>x.systemSide+':'+x.routeId+':'+(x.text.match(/\b(\d+A)\b/)||[])[1]));const expected=items.filter(x=>{if(x.kind!=='label')return false;const m=x.text.match(/^[PR](\d+) (\d+A)$/);return !m||!tags.has(x.systemSide+':'+Number(m[1])+':'+m[2])});assert.equal(placed.length,expected.length);if(view==='front')assert(placed.some(x=>x.value==='P3 100A'),'zero-projection pipe size remains visible');
 for(let i=0;i<placed.length;i++){assert.strictEqual(placed[i].item,expected[i]);for(let j=i+1;j<placed.length;j++){const a=placed[i].rect,b=placed[j].rect;assert(!(a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1]),`${view}: overlapping labels`);}}
 for(const x of placed){assert(x.value.includes('→')||x.value.length>0);assert(x.rect.every(Number.isFinite))}
}
const repetitive=Array.from({length:60},(_,i)=>({kind:'label',p:[0,0],text:'機器'+i,layer:'EQUIPMENT_LABEL'}));const placed=L.dxfLabelLayout(repetitive,30);assert.equal(placed.length,repetitive.length);assert(placed.some(x=>Math.hypot(...x.point)>30));
const dxf=L.dxf(s,['iso']);assert(dxf.includes('\r\nANNOTATION\r\n'));assert(dxf.includes('EQ1 設備 A'));assert(dxf.includes('P0-P1 6000'));assert(!dxf.includes('\r\nP1 100A\r\n'));
console.log('DXF label spacing, duplicate suppression and retention: OK');
