const assert=require('node:assert/strict'),C=require('./core'),N=require('./network'),K=require('./components');
assert.equal(K.elbowF['50A'],76.2);assert.equal(K.elbowF['40A'],57.2);assert.equal(K.valve.length,180);assert.equal(K.valve.flangeDiameter,155);
const s=N.fromLegacy(structuredClone(C.defaults));s.joints={1:{catalog:'benkan_90_lr'}};s.routes[0].parts[0].catalog='kitz_10fcl_50';const r=N.calculate(s),plan=K.plan(s,r);assert.deepEqual(plan.errors,[]);assert.equal(plan.elbows.length,1);assert.equal(plan.elbows[0].radius,76.2);assert.equal(plan.trims.get(1).end,76.2);assert.equal(plan.trims.get(2).start,76.2);let seg=K.segment(s,r,s.routes[0],plan);assert(Math.abs(seg.points[1].x-7.9238)<1e-10);assert.equal(seg.parts[0].bodyLength,180);assert.equal(seg.parts[0].bodyWidth,155);assert.deepEqual(N.drawingErrors(s,r),[]);
for(const v of ['top','front','side','iso'])assert(K.elbowDrawing(plan.elbows[0],v).filter(x=>x.kind==='line').length>0);
assert(N.drawing(s,'top',r).some(x=>x.kind==='label'&&x.text.includes('F=76.2mm')));
assert(N.drawing(s,'top',r).some(x=>x.kind==='label'&&x.text==='P0-P1 8000'));
const axes={east:[1,0,0],west:[-1,0,0],north:[0,1,0],south:[0,-1,0],up:[0,0,1],down:[0,0,-1]};
for(const [before,u] of Object.entries(axes))for(const [after,v] of Object.entries(axes)){if(u.findIndex(x=>x!==0)===v.findIndex(x=>x!==0))continue;const item={point:{x:0,y:0,z:0},up:{direction:before},down:{direction:after},radius:76.2,od:60.5,node:1,name:'50A'};let path=K.elbowDrawing(item,'iso').filter(x=>x.kind==='line'&&x.layer==='CENTER');let a=C.project({x:-u[0]*.0762,y:-u[1]*.0762,z:-u[2]*.0762},'iso').map(x=>x*1000),b=C.project({x:v[0]*.0762,y:v[1]*.0762,z:v[2]*.0762},'iso').map(x=>x*1000);assert(Math.hypot(path[0].a[0]-a[0],path[0].a[1]-a[1])<1e-7);assert(Math.hypot(path.at(-1).b[0]-b[0],path.at(-1).b[1]-b[1])<1e-7)}

const orphan=structuredClone(s);orphan.routes=orphan.routes.slice(0,1);orphan.equipment[0].node=1;delete orphan.joints[2];let orphanReview=N.inspectConnections(orphan,N.calculate(orphan));assert(orphanReview.items.some(x=>x.node===1&&x.record.catalog==='benkan_90_lr'));assert(N.drawingErrors(orphan,N.calculate(orphan)).length>0);
const short=structuredClone(s);short.routes[0].len=.05;assert(N.drawingErrors(short,N.calculate(short)).length>0);
const mismatch=structuredClone(s);mismatch.routes[0].pipe='40A';assert(N.drawingErrors(mismatch,N.calculate(mismatch)).length>0);
const badValve=structuredClone(s);badValve.routes[0].pipe='40A';delete badValve.joints[1];assert(N.drawingErrors(badValve,N.calculate(badValve)).some(x=>x.includes('50A')));
require('fs').writeFileSync(require('os').tmpdir()+'/piping_catalog_test.dxf',N.dxf(s,['top','front','side']));console.log('部品寸法、エルボ端面・直管控除、配置チェック、DXF: OK');
