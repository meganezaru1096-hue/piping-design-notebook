'use strict';const fs=require('fs'),path=require('path'),L=require('./circulation');
const x=JSON.parse(fs.readFileSync('サンプル/機器と調整弁_循環/機器と調整弁_サンプル.json','utf8')),s=x.data;
s.staticCheck={anchorZ:1,anchorGauge:150,minimumGauge:30,reference:'評価用仮値。停止・満水、実機の圧力設定は未確認。'};
s.npshCheck={flow:.2,temperature:20,atmosphere:101.325,vapour:2.339,suctionGauge:100,velocity:1,required:3,margin:1,reference:'評価用仮値。吸込圧とNPSHrは実機・運転範囲で要確認。'};
const r=L.calculate(s),err=L.drawingErrors(s,r);if(err.length)throw Error(err.join('\n'));const dir='サンプル/静圧とNPSH_循環';fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'静圧とNPSH_サンプル.json'),JSON.stringify(x,null,2));fs.writeFileSync(path.join(dir,'静圧とNPSH_図面と計算.pdf'),Buffer.from(L.pdf(s)));fs.writeFileSync(path.join(dir,'静圧とNPSH_アイソメ.dxf'),L.dxf(s,['iso']));fs.writeFileSync(path.join(dir,'静圧とNPSH_三面図.dxf'),L.dxf(s,['top','front','side']));
console.log(JSON.stringify(L.pressureChecks(s,r)));
