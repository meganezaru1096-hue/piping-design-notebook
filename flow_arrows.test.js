'use strict';
const assert=require('assert/strict'),C=require('./core'),L=require('./circulation');
const s=require('./サンプル/水温とNPSH/水温とNPSH_サンプル.json').data,r=L.calculate(s);assert.deepEqual(r.errors,[]);
for(const view of ['iso','top','front','side']){
 const arrows=L.flowArrowPlan(s,r,view,L.scene(s,r,view)),draw=L.scene(s,r,view,true);
 assert.equal(arrows.items.length%3,0);assert.equal(arrows.labels.length,arrows.items.length/3);assert(arrows.labels.every(x=>x.layer==='FLOW_TAG'&&x.text.includes('→')));assert.equal(draw.filter(x=>x.layer==='FLOW_SUPPLY'||x.layer==='FLOW_RETURN').length,arrows.items.length);
 for(let i=0;i<arrows.items.length;i+=3){const line=arrows.items[i],side=line.systemSide,net=s[side],res=side==='supply'?r.a:r.b,route=net.routes.find(x=>x.id===line.routeId),a=C.project(res.points.get(route.parent),view),b=C.project(res.points.get(route.id),view),dot=(line.b[0]-line.a[0])*(b[0]-a[0])+(line.b[1]-line.a[1])*(b[1]-a[1]);assert(side==='supply'?dot>0:dot<0,`${view} ${side} ${route.id}`);assert(arrows.items[i+1].layer===line.layer&&arrows.items[i+2].layer===line.layer)}
 assert.equal(arrows.items.length/3+arrows.omitted.length,s.supply.routes.length+s.return.routes.length);
}
const overlap=structuredClone(L.defaults);overlap.return=structuredClone(overlap.supply);overlap.equipment.forEach(e=>e.returnNode=e.supplyNode);const or=L.calculate(overlap);assert.deepEqual(or.errors,[]);const op=L.flowArrowPlan(overlap,or,'top',L.scene(overlap,or,'top'));assert.equal(op.items.length,0);assert(op.omitted.every(x=>x.reason==='投影重なり'));assert(op.omitted.some(x=>x.name==='R1→R0'));
const dx=L.dxf(s,['iso','top','front','side']);assert(dx.includes('FLOW_SUPPLY'));assert(dx.includes('FLOW_RETURN'));assert(dx.includes('実流矢印省略'));const h=x=>Buffer.from(x,'utf16le').swap16().toString('hex').toUpperCase();const pdf=L.pdf(s);assert(pdf.includes(h('図面の流れ方向')));assert(pdf.includes(h('投影重なり')));
console.log('supply/return vector direction, diagonal projections, overlap suppression, DXF and PDF: OK');
