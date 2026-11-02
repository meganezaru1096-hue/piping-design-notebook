'use strict';
const fs=require('fs'),path=require('path'),L=require('./circulation');
const x=JSON.parse(fs.readFileSync('サンプル/ポンプ曲線_運転点/ポンプ曲線_サンプル.json','utf8')),s=x.data;
s.density=971.8;s.viscosity=.365;s.npshCheck={flow:.2,temperature:80,atmosphere:101.325,vapourMode:'water-if97',suctionGauge:0,velocity:1.5,required:3,margin:1,reference:'評価用仮値。物性・吸込圧・NPSHrは実機照合が必要'};
const r=L.calculate(s),p=L.pressureChecks(s,r),errors=L.drawingErrors(s,r);if(errors.length||p.npsh.errors.length)throw Error([...errors,...p.npsh.errors].join('\n'));
const dir='サンプル/水温とNPSH';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'水温とNPSH_サンプル.json'),JSON.stringify(x,null,2));fs.writeFileSync(path.join(dir,'水温とNPSH_図面と計算.pdf'),Buffer.from(L.pdf(s)));fs.writeFileSync(path.join(dir,'水温とNPSH_アイソメ.dxf'),L.dxf(s,['iso']));fs.writeFileSync(path.join(dir,'水温とNPSH_三面図.dxf'),L.dxf(s,['top','front','side']));console.log(JSON.stringify(p.npsh));
