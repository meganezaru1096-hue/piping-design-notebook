const assert=require('node:assert/strict'),fs=require('fs'),N=require('./network'),P=require('./pdf');
const s=JSON.parse(fs.readFileSync('サンプル/複雑配管_評価用.json','utf8')).data,r=N.calculate(s);assert.deepEqual(r.errors,[]);
const c=r.equipment.find(e=>e.id===3),path=[1,2,8,9,10,11],summed=path.reduce((n,id)=>n+r.edges.get(id).pipeLoss+r.edges.get(id).partLoss,0);assert(Math.abs(c.loss-summed)<1e-12);assert(Math.abs(c.total-(c.loss+c.staticHead+c.pressureHead))<1e-12);assert(Math.abs(r.design-Math.max(0,c.total)*1.1)<1e-12);
const route=s.routes.find(x=>x.id===5),part=route.parts[0];let joint=N.inspectConnections(s,r).items.find(x=>x.node===4);assert.equal(part.jointId,4);assert.equal(N.lossStatus(s,r,route,part),'missing');assert(joint.untracked.some(x=>x.routeId===5&&x.type==='elbow'));
part.kRef='評価用の根拠';part.kContext=N.lossContext(s,r,route,part);joint=N.inspectConnections(s,r).items.find(x=>x.node===4);assert.equal(N.lossStatus(s,r,route,part),'current');assert(!joint.untracked.some(x=>x.routeId===5&&x.type==='elbow'));s.equipment.find(x=>x.id===1).flow=.081;const changed=N.calculate(s);assert.equal(N.lossStatus(s,changed,route,part),'stale');
const hex=x=>Buffer.from(x,'utf16le').swap16().toString('hex').toUpperCase(),pdf=P.pdf(s);assert(pdf.includes(hex('計算：概算・要確認（未確認 ')));assert(N.dxf(s,['iso']).includes('計算：概算・要確認（未確認 '));
console.log('設備経路損失の積算、K確認状態の変化、出力時の概算表示: OK');
