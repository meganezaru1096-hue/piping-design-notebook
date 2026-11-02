'use strict';
const fs=require('fs'),path=require('path'),L=require('./circulation'),A=require('./pump-analysis');
const x=JSON.parse(fs.readFileSync('サンプル/設備別経路と操作/設備別経路_サンプル.json','utf8')),s=x.data;
s.pumpAnalysis={points:[{flow:0,head:14},{flow:.15,head:10},{flow:.3,head:2}],reference:'評価用仮値・実機曲線ではありません',factors:{1:.65,2:1}};
const r=L.calculate(s),errors=L.drawingErrors(s,r),full=A.solve(s,r,s.pumpAnalysis,'open'),custom=A.solve(s,r,s.pumpAnalysis);if(errors.length||full.errors.length||custom.errors.length)throw Error([...errors,...full.errors,...custom.errors].join('\n'));
const dir='サンプル/ポンプ曲線_運転点';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'ポンプ曲線_サンプル.json'),JSON.stringify(x,null,2));fs.writeFileSync(path.join(dir,'ポンプ曲線_図面と計算.pdf'),Buffer.from(L.pdf(s)));fs.writeFileSync(path.join(dir,'ポンプ曲線_アイソメ.dxf'),L.dxf(s,['iso']));fs.writeFileSync(path.join(dir,'ポンプ曲線_三面図.dxf'),L.dxf(s,['top','front','side']));console.log(JSON.stringify({full,custom},null,2));
