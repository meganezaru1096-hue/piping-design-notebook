(function(root){
'use strict';
const N=typeof module!=='undefined'&&module.exports?require('./network'):root.Network;
function relativeOrigin(s,node,offset){
 const geom=N.geometryPreview(s.supply),point=geom.points.get(node);
 if(!point)throw Error('指定した往きの点が未確定です。経路の方向・長さを確認してください。');
 if(!offset||!['x','y','z'].every(k=>Number.isFinite(offset[k])))throw Error('ずらす距離をすべて数値で入力してください。');
 const p=Object.fromEntries(['x','y','z'].map(k=>[k,point[k]+offset[k]]));
 if(!Object.values(p).every(v=>Number.isFinite(v)&&Math.abs(v)<=1e9))throw Error('戻り始点が表示可能な座標範囲外です。');
 return p;
}
function copySupply(s){
 const g=N.geometryPreview(s.supply);
 if(!s.supply.routes.length||g.issues.length||g.segments.length!==s.supply.routes.length)throw Error('往きの全区間の方向・長さ・接続を確定してください。');
 if(!['x','y','z'].every(k=>Number.isFinite(s.return.origin[k])&&Math.abs(s.return.origin[k])<=1e9))throw Error('戻り始点の座標を確認してください。');
 for(const p of g.points.values())for(const k of ['x','y','z'])if(Math.abs(p[k]-s.supply.origin[k]+s.return.origin[k])>1e9)throw Error('複製後の座標が表示可能な範囲外です。');
 if(s.equipment.some(e=>!g.points.has(e.supplyNode)||e.supplyNode===0))throw Error('すべての設備に有効な往き入口を指定してください。');
 if((s.commonDevices||[]).some(d=>d.side==='return')||s.equipment.some(e=>e.balanceValve?.side==='return'))throw Error('戻りに配置した共通機器または調整弁があります。配置を変更してから複製してください。');
 const routes=s.supply.routes.map(r=>({id:r.id,parent:r.parent,direction:r.direction,len:r.len,pipe:r.pipe,parts:[],...(r.direction==='diagonal'?{dx:r.dx,dy:r.dy,dz:r.dz}:{})}));
 return {branch:{origin:{...s.return.origin},routes,joints:{}},equipment:s.equipment.map(e=>({...e,returnNode:e.supplyNode}))};
}
const api={relativeOrigin,copySupply};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ReturnRouteHelper=api;
})(typeof globalThis!=='undefined'?globalThis:this);
