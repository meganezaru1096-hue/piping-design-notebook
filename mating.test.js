const assert=require('node:assert/strict'),C=require('./core'),N=require('./network'),K=require('./components');
const thickness={50:16,65:18,80:18,100:18,125:20,150:22,200:22};
for(const [n,t] of Object.entries(thickness))for(const dir of ['east','west','north','south','up','down']){
 let s=structuredClone(N.defaults);s.valveDrawingStyle='reference';let part={type:'gate',catalog:`kitz_10fcl_${n}`,mating:'jis10k_sop_ff',gasketThickness:3,position:50,count:1,k:.2};s.routes=[{id:1,parent:0,direction:dir,len:2,pipe:`${n}A`,parts:[part]}];s.equipment=[{id:1,name:'設備',node:1,flow:.1,pressure:0}];let r=N.calculate(s);assert.deepEqual(N.drawingErrors(s,r),[]);const valve=K.valves[part.catalog];assert.equal(K.partSize(part,0).length,valve.length+2*(t+3));
 const view=dir==='north'||dir==='south'?'side':'front',out=N.drawing(s,view,r),flanges=out.filter(x=>x.layer==='MATING_FLANGE'),gaskets=out.filter(x=>x.layer==='GASKET_REFERENCE');assert.equal(flanges.length,8);assert.equal(gaskets.length,8);assert(out.some(x=>x.kind==='label'&&x.text.includes(`t${t} GASKET x2 t3`)));
 let a=structuredClone(s);a.routes[0].len=(valve.length+2*(t+3)-1)/1000;assert(N.drawingErrors(a,N.calculate(a)).some(x=>/越え|はみ出/.test(x)));
 part.gasketThickness=0;assert(N.drawingErrors(s,N.calculate(s)).some(x=>x.includes('ガスケット厚さ')));
}
let s=structuredClone(N.defaults);s.valveDrawingStyle='reference';s.routes=[{id:1,parent:0,direction:'east',len:1,pipe:'100A',parts:[{type:'gate',catalog:'kitz_10fcl_100',mating:'jis10k_sop_ff',gasketThickness:3,position:50,count:1,k:.2},{type:'gate',position:70,count:1,k:.2,bodyLength:150,bodyWidth:100}]}];s.equipment=[{id:1,name:'設備',node:1,flow:.1,pressure:0}];assert(N.drawingErrors(s,N.calculate(s)).some(x=>x.includes('重な')));
console.log('相手フランジ7口径・6方向、両端寸法、干渉および厚さ入力チェック: OK');
