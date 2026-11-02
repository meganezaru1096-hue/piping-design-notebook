'use strict';
const assert=require('node:assert/strict'), fs=require('node:fs'), E=require('./cost-estimate'),N=require('./network'),L=require('./circulation');
const copy=x=>JSON.parse(JSON.stringify(x));
let s=copy(N.defaults),r=N.calculate(s),cost=E.calculate(s,r,'open');
assert.equal(cost.rows.find(x=>x.key==='pipe|40A').qty,8);assert.equal(cost.missing,cost.rows.length);assert.equal(cost.total,0);
s.costEstimate={rates:{'pipe|40A':{material:1000,labour:500},pump:{include:false}},items:[],reference:'評価仮値'};cost=E.calculate(s,r,'open');assert.equal(cost.material,8000);assert.equal(cost.labour,4000);assert.equal(cost.total,12000);assert(!cost.rows.find(x=>x.key==='pump').include);assert(cost.missing>0);
s.costEstimate.rates['pipe|40A'].labour=0;cost=E.calculate(s,r,'open');assert.equal(cost.rows.find(x=>x.key==='pipe|40A').missing,false);assert.equal(cost.total,8000);
s.costEstimate.rates['pipe|40A'].labour=-1;assert(E.calculate(s,r,'open').rows.find(x=>x.key==='pipe|40A').missing);
s.costEstimate.items=[{id:1,name:'支持材',qty:3,unit:'組'}];s.costEstimate.rates['manual|1']={material:200,labour:100};cost=E.calculate(s,r,'open');assert.equal(cost.rows.find(x=>x.key==='manual|1').materialCost,600);assert.equal(cost.rows.find(x=>x.key==='manual|1').labourCost,300);
s.costEstimate.items[0].qty=null;assert(E.calculate(s,r,'open').issues.length);
const project=JSON.parse(fs.readFileSync('サンプル/図面_注記整理/注記整理_サンプル.json','utf8'));s=project.data;r=L.calculate(s);cost=E.calculate(s,r,'closed');assert.equal(cost.rows.find(x=>x.key==='pipe|100A').qty,37+Math.sqrt(2));assert.equal(cost.rows.find(x=>x.key==='elbow|45|100A').qty,1);assert.equal(cost.rows.find(x=>x.key==='elbow|90|100A').qty,2);assert.equal(cost.rows.find(x=>x.key==='tee|100A|100A').qty,2);assert.equal(cost.rows.filter(x=>x.key.startsWith('balance|')).length,2);assert(!cost.rows.some(x=>x.key.startsWith('part|elbow')));assert(E.pdf(s,r,'closed').startsWith('%PDF-1.4'));
const restored=JSON.parse(JSON.stringify({format:'piping-closed-circulation',version:1,data:s})).data;assert.equal(E.calculate(restored,L.calculate(restored),'closed').rows.length,cost.rows.length);assert.equal(E.calculate(restored,L.calculate(restored),'closed').missing,cost.missing);assert(E.calculate({}, {errors:['x']},'open').error);console.log('cost quantities, material/labour rates, exclusions, incomplete inputs and report: OK');

