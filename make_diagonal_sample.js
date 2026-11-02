'use strict';
const fs=require('fs'),path=require('path'),L=require('./circulation');
const src=JSON.parse(fs.readFileSync(path.join('サンプル','密閉循環_分岐再合流','循環サンプル.json'),'utf8')).data;
Object.assign(src.supply.routes[1],{direction:'diagonal',dx:3,dy:1,dz:1,len:Math.sqrt(11)});
Object.assign(src.return.routes[2],{direction:'diagonal',dx:-1,dy:0,dz:1,len:Math.sqrt(2)});
delete src.supply.joints[1];delete src.return.joints[2];
const r=L.calculate(src),errors=L.drawingErrors(src,r);if(errors.length)throw Error(errors.join(' / '));const dir=path.join('サンプル','斜め配管_密閉循環');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'斜め配管_サンプル.json'),JSON.stringify({format:'piping-closed-circulation',version:1,data:src},null,2));fs.writeFileSync(path.join(dir,'斜め配管_図面と計算.pdf'),Buffer.from(L.pdf(src)));fs.writeFileSync(path.join(dir,'斜め配管_アイソメ.dxf'),L.dxf(src,['iso']));fs.writeFileSync(path.join(dir,'斜め配管_三面図.dxf'),L.dxf(src,['top','front','side']));console.log(JSON.stringify({head:r.design,flow:r.totalFlow,power:r.power,warnings:L.warnings(src,r).length,output:dir}));
