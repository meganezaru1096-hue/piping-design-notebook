'use strict';
const fs=require('fs'),L=require('./circulation'),E=require('./cost-estimate');
const project=JSON.parse(fs.readFileSync('サンプル/図面_注記整理/注記整理_サンプル.json','utf8')),s=project.data,r=L.calculate(s);
s.costEstimate={reference:'評価用の仮単価。実際の市場価格・見積額ではありません。',rates:{},items:[{id:1,name:'支持材（仮）',qty:8,unit:'組'}]};
for(const row of E.calculate(s,r,'closed').rows)s.costEstimate.rates[row.key]={material:1000,labour:500};
for(const row of E.calculate(s,r,'closed').rows)if(row.key.startsWith('equipment|'))s.costEstimate.rates[row.key].include=false;
fs.mkdirSync('サンプル/概算金額',{recursive:true});fs.writeFileSync('サンプル/概算金額/概算金額_サンプル.json',JSON.stringify(project,null,2));fs.writeFileSync('サンプル/概算金額/概算金額_評価用.pdf',Buffer.from(E.pdf(s,r,'closed')));console.log('Cost sample generated:',E.calculate(s,r,'closed').total);
