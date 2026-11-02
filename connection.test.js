const assert=require('node:assert/strict');const C=require('./core'),N=require('./network');
const inspect=s=>N.inspectConnections(s,N.calculate(s));
let s=structuredClone(N.defaults),review=inspect(s);
assert.equal(review.items.length,1);assert.equal(review.items[0].node,1);assert.equal(review.items[0].kind,'unsupported');assert.equal(review.missing,1);assert.equal(review.unreferenced.length,3);
// A real tee has two antiparallel ports and a third perpendicular port.
s.routes[2].direction='east';assert.equal(inspect(s).items[0].kind,'unsupported');s.routes[2].pipe='40A';let r=N.calculate(s);assert.deepEqual(r.errors,[]);review=inspect(s);assert.equal(review.items[0].kind,'tee');assert.equal(review.items[0].untracked.length,2);
s.routes[1].parts[0].jointId=1;s.routes[1].parts[0].kRef='spec-branch';s.routes[2].parts[0].jointId=1;s.routes[2].parts[0].kRef='spec-run';
s.joints={1:{type:'tee',reference:'型式と資料を確認',ports:{1:r.edges.get(1).name,2:r.edges.get(2).name,3:r.edges.get(3).name}}};
for(const route of s.routes)for(const part of route.parts)if(part.kRef)part.kContext=N.lossContext(s,N.calculate(s),route,part);
review=inspect(s);assert.equal(review.items[0].status,'入力整合');assert.equal(review.missing,0);assert.equal(review.unreferenced.length,1);
const dup=structuredClone(s);dup.routes[1].parts.push({...dup.routes[1].parts[0]});assert(inspect(dup).items[0].problems.some(x=>x.includes('重複')));
// An automatic diameter change must invalidate the recorded port size.
s.equipment[1].flow=.5;review=inspect(s);assert.equal(review.items[0].status,'要確認');
// Omission of a branch K reference must not be treated as a completed check.
s.equipment[1].flow=.05;s.routes[1].parts[0].kRef='';review=inspect(s);assert(review.items[0].untracked.some(x=>x.routeId===2));
let t=N.fromLegacy(structuredClone(C.defaults));r=N.calculate(t);review=inspect(t);assert.equal(review.items.length,2);assert(review.items.every(x=>x.kind==='elbow'));
for(const item of review.items){const child=t.routes.find(x=>x.parent===item.node);const elbow=child.parts.find(p=>p.type==='elbow');elbow.jointId=item.node;elbow.kRef='エルボ資料';t.joints=t.joints||{};t.joints[item.node]={type:'elbow',reference:'メーカー寸法表',ports:Object.fromEntries(item.ports.map(p=>[p.id,p.pipe]))}}
for(const route of t.routes)for(const part of route.parts)if(part.kRef)part.kContext=N.lossContext(t,N.calculate(t),route,part);
review=inspect(t);assert.equal(review.missing,0);
t.routes[1].pipe='65A';review=inspect(t);assert(review.items.some(x=>x.kind==='reducing_elbow'&&x.status==='要確認'));
// A source junction or equipment at a branching node has no modeled nozzle directions.
let u=structuredClone(N.defaults);u.equipment.push({id:3,name:'途中設備',node:1,flow:.02,pressure:0});assert.equal(inspect(u).items[0].kind,'unsupported');
console.log('接続方向、径、損失の根拠、変更後の再確認: OK');
