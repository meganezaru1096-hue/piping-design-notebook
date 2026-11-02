const assert=require('node:assert/strict'),C=require('./core'),N=require('./network'),K=require('./components');
const data={50:[120,4,19,20],65:[140,4,19,22],80:[150,8,19,22],100:[175,8,19,24],125:[210,8,23,24],150:[240,8,23,26],200:[290,12,23,26]};
const cases=[['east','side'],['west','side'],['north','front'],['south','front'],['up','top'],['down','top']];
for(const [n,row] of Object.entries(data)){
 const model=K.valves[`kitz_10fcl_${n}`];assert.deepEqual([model.pcd,model.holeCount,model.holeDiameter,model.flangeThickness],row);
 for(const [direction,endView] of cases){let s=structuredClone(N.defaults);s.valveDrawingStyle='reference';s.routes=[{id:1,parent:0,direction,len:3,pipe:`${n}A`,parts:[{type:'gate',catalog:`kitz_10fcl_${n}`,position:50,count:1,k:.2}]}];s.equipment=[{id:1,name:'設備',node:1,flow:.01,pressure:0}];const r=N.calculate(s);assert.deepEqual(N.drawingErrors(s,r),[]);
 let scene=N.drawing(s,endView,r),holes=scene.filter(x=>x.layer==='FLANGE_HOLES'),pcd=scene.find(x=>x.layer==='FLANGE_PCD');assert.equal(holes.length,row[1]);assert.equal(pcd.r,row[0]/2);for(const h of holes){assert.equal(h.r,row[2]/2);assert(Math.abs(Math.hypot(h.c[0]-pcd.c[0],h.c[1]-pcd.c[1])-row[0]/2)<1e-7)}
 const first=Math.atan2(holes[0].c[1]-pcd.c[1],holes[0].c[0]-pcd.c[0]),angles=holes.map(h=>Math.atan2(h.c[1]-pcd.c[1],h.c[0]-pcd.c[0]));assert(angles.every((a,i)=>angles.every((b,j)=>i===j||Math.abs(Math.sin((a-b)/2))>1e-6)));assert(scene.some(x=>x.kind==='label'&&x.text.includes('ROTATION ASSUMED')));
 const sideView=endView==='top'?'front':'top',lines=N.drawing(s,sideView,r).filter(x=>x.layer==='FLANGE_THICKNESS');assert.equal(lines.length,2);assert(Math.abs(Math.hypot(lines[0].a[0]-lines[1].a[0],lines[0].a[1]-lines[1].a[1])-(model.length-2*row[3]))<1e-7);
 assert.equal(N.drawing(s,'iso',r).filter(x=>x.layer==='FLANGE_HOLES').length,0);
 }
}
console.log('7口径・6方向のボルト穴、PCD、フランジ厚さ: OK');
