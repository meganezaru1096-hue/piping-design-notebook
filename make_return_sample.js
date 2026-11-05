'use strict';
const fs=require('fs'),L=require('./circulation'),H=require('./return-route');
const s=structuredClone(L.defaults);s.supply.routes[1]={id:2,parent:1,direction:'diagonal',dx:3,dy:4,dz:0,len:5,pipe:'65A',parts:[]};s.return.origin=H.relativeOrigin(s,0,{x:0,y:-1,z:-1});const made=H.copySupply(s);s.return=made.branch;s.equipment=made.equipment.map(e=>({...e,pressureDropBasis:"total"}));const r=L.calculate(s);if(L.drawingErrors(s,r).length)throw Error(L.drawingErrors(s,r).join('\n'));const dir='サンプル/戻り配管の簡易作成';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/戻り配管_サンプル.json',JSON.stringify({format:'piping-closed-circulation',version:1,data:s},null,2));fs.writeFileSync(dir+'/戻り配管_図面と計算.pdf',Buffer.from(L.pdf(s)));console.log('pdf pages sample created');


