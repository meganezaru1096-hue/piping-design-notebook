const assert=require('node:assert/strict'),C=require('./core'),N=require('./network'),K=require('./components');
const expected={50:[180,155,343,170],65:[190,175,390,170],80:[200,185,464,200],100:[230,210,548,250],125:[250,250,649,280],150:[270,280,760,300],200:[290,330,957,350]};
for(const [size,values] of Object.entries(expected)){
  const id=`kitz_10fcl_${size}`,v=K.valves[id];
  assert.deepEqual([v.length,v.flangeDiameter,v.height,v.wheelDiameter],values);
  let s=structuredClone(N.defaults);s.valveDrawingStyle='reference';s.routes=[{id:1,parent:0,direction:'east',len:4,pipe:`${size}A`,parts:[{type:'gate',catalog:id,position:50,count:1,k:.2}]}];s.equipment=[{id:1,name:'設備',node:1,flow:.01,pressure:0}];
  let r=N.calculate(s);assert.deepEqual(N.drawingErrors(s,r),[]);
  assert.deepEqual(K.partSize(s.routes[0].parts[0],0),{length:values[0],width:values[1]});
  assert(N.drawing(s,'top',r).some(x=>x.kind==='label'&&x.text===`10FCL-${size}A L${values[0]} FLANGE-D${values[1]} REFERENCE BOX`));
  s.routes[0].pipe=size==='50'?'65A':'50A';r=N.calculate(s);assert(N.drawingErrors(s,r).some(x=>x.includes(`${size}A`)));
}
console.log('10FCL 寸法7種・口径照合・図面注記: OK');
