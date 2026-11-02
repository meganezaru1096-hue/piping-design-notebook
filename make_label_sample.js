'use strict';
const fs=require('fs'),path=require('path'),L=require('./circulation'),E=require('./dxf-encoding');
const project=JSON.parse(fs.readFileSync('サンプル/図面_流れ方向/流れ方向_サンプル.json','utf8')),s=project.data,r=L.calculate(s),errors=L.drawingErrors(s,r);
if(errors.length)throw Error(errors.join('\n'));
const dir='サンプル/図面_注記整理';fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'注記整理_サンプル.json'),JSON.stringify(project,null,2));
fs.writeFileSync(path.join(dir,'注記整理_図面と計算.pdf'),Buffer.from(L.pdf(s)));
for(const [name,views] of [['アイソメ',['iso']],['三面図',['top','front','side']]]){const dxf=L.dxf(s,views);fs.writeFileSync(path.join(dir,'注記整理_'+name+'.dxf'),dxf);fs.writeFileSync(path.join(dir,'注記整理_'+name+'_Jw_cad.dxf'),E.jwcad(dxf))}
console.log('Evaluation PDF, DXF and input data generated.');
