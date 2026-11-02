(function(root){
'use strict';
const K=typeof module!=='undefined'&&module.exports?require('./components'):root.ComponentCatalog;
const P=typeof module!=='undefined'&&module.exports?require('./pdf'):root.PipePDF;
const N=typeof module!=='undefined'&&module.exports?require('./network'):root.Network;
const limit=1e12, lossOnly=new Set(['elbow','tee','reducer','combined']);
const validNumber=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=limit;
const money=n=>Number.isFinite(n)?Math.round(n).toLocaleString('ja-JP'):'—';
const quantity=n=>Number(n.toPrecision(12)).toLocaleString('ja-JP',{maximumFractionDigits:6});
const unitPrice=n=>Number(n.toPrecision(15)).toLocaleString('ja-JP',{maximumFractionDigits:8});
function calculate(s,r,system){
 if(!r||r.errors?.length)return {error:'配管計算の入力を整えると数量を集計できます。'};
 const data=s.costEstimate??{},rates=data&&typeof data.rates==='object'&&!Array.isArray(data.rates)&&data.rates?data.rates:{},rows=new Map(),issues=[];
 function add(key,name,unit,n){if(!Number.isFinite(n)||n<0){issues.push(name+'の数量が不正です。');return}const row=rows.get(key)||{key,name,unit,qty:0};row.qty+=n;rows.set(key,row)}
 const networks=system==='closed'?[['往き',r.supply,r.a],['戻り',r.back,r.b]]:[['開放系',s,r]];
 for(const [side,net,result] of networks){
  for(const route of net.routes){const edge=result.edges.get(route.id);if(!edge)continue;const size=edge.name;add('pipe|'+size,'配管 '+size,'m',route.len);
   for(const part of route.parts){if(lossOnly.has(part.type))continue;const name=N.types[part.type]?.[0]||'その他部品',catalog=part.catalog||'未指定',count=part.count;add(['part',part.type,size,catalog].join('|'),name+' '+size+' '+catalog,'個',count);if(part.mating==='jis10k_sop_ff'){add('flange|'+size,'相手フランジ JIS10K '+size,'枚',count*2);add('gasket|'+size,'ガスケット '+size,'枚',count*2)}}
  }
  const plan=K.plan(net,result);if(plan.errors.length)issues.push(side+'：継手の選択・配置に確認事項があります。');
  for(const e of plan.elbows)add('elbow|'+(e.angle||90)+'|'+e.name,(e.angle||90)+'°エルボ '+e.name,'個',1);
  for(const e of plan.tees)add('tee|'+e.run+'|'+e.branch,'チーズ '+e.run+'×'+e.branch,'個',1);
  for(const e of plan.reducers)add('reducer|'+e.size.large+'|'+e.size.small,'同心レデューサ '+e.size.large+'×'+e.size.small,'個',1);
 }
 add('pump','ポンプ（能力・型式は別途選定）','台',1);
 for(const e of s.equipment||[])add('equipment|'+e.id+'|'+e.name,'設備 EQ'+e.id+' '+e.name,'台',1);
 if(system==='closed'){
  for(const d of s.commonDevices||[])add('device|'+d.id+'|'+d.name,'共通機器 '+d.name,'台',1);
  for(const e of s.equipment||[])if(e.balanceValve?.enabled)add('balance|'+e.id+'|'+e.balanceValve.name,'調整弁 EQ'+e.id+' '+e.balanceValve.name,'台',1);
 }
 const manual=Array.isArray(data.items)?data.items:[];
 manual.forEach((x,i)=>{if(!x||typeof x!=='object'){issues.push('追加項目 '+(i+1)+' の内容が不正です。');return}const name=typeof x.name==='string'?x.name.trim():'',unit=typeof x.unit==='string'?x.unit.trim():'',q=x.qty;if(!name||!unit||!validNumber(q)){issues.push('追加項目 '+(i+1)+' の名称・単位・数量を確認してください。');return}add('manual|'+x.id,'追加：'+name,unit,q)});
 const list=[...rows.values()].map(row=>{const record=Object.prototype.hasOwnProperty.call(rates,row.key)&&rates[row.key]&&typeof rates[row.key]==='object'?rates[row.key]:{},include=record.include!==false,material=record.material,labour=record.labour,missing=include&&(!validNumber(material)||!validNumber(labour));return {...row,include,material:validNumber(material)?material:null,labour:validNumber(labour)?labour:null,missing,materialCost:include&&validNumber(material)?row.qty*material:0,labourCost:include&&validNumber(labour)?row.qty*labour:0}});
 if(list.some(x=>!Number.isFinite(x.materialCost)||!Number.isFinite(x.labourCost)))return {error:'数量または単価が大きすぎます。'};
 const material=list.reduce((n,x)=>n+x.materialCost,0),labour=list.reduce((n,x)=>n+x.labourCost,0),missing=list.filter(x=>x.missing).length;
 if(!Number.isFinite(material+labour)||material+labour>Number.MAX_SAFE_INTEGER)return {error:'金額が計算可能な範囲を超えています。'};
 return {rows:list,material,labour,total:material+labour,missing,issues,reference:typeof data.reference==='string'?data.reference:''};
}
function pdf(s,r,system){
 const result=calculate(s,r,system);if(result.error)throw Error(result.error);
 const rows=[`単価根拠：${result.reference||'未入力'}`,`入力済み材料費 ${money(result.material)} 円　入力済み施工費 ${money(result.labour)} 円`,`${result.missing||result.issues.length?'未完成・入力済み小計':'入力範囲の合計'} ${money(result.total)} 円（税抜）　未入力 ${result.missing} 行`,...result.issues,...result.rows.flatMap(x=>[`${x.include?'対象':'対象外'} ${x.name}　数量 ${quantity(x.qty)} ${x.unit}`,`　材料単価 ${x.material===null?'未入力':unitPrice(x.material)+' 円/'+x.unit}　施工単価 ${x.labour===null?'未入力':unitPrice(x.labour)+' 円/'+x.unit}　入力済額 ${money(x.materialCost+x.labourCost)} 円${x.missing?'（単価未入力）':''}`]),'【集計の前提と対象外】','配管数量は中心線長の合計。継手控除、切断長、定尺・歩留まりは未反映。','選択した継手と入力した部品のみ集計。損失計算だけの継手は数量に含めない。','ボルト、溶接材、支持、保温、塗装、試験、運搬、諸経費などは自動集計しない。','設備・ポンプ等の除外、単価の根拠・適用範囲、数量の妥当性は設計者が確認。','計算は入力された端数を保持。表示金額は円未満四捨五入。'];
 const wrapped=rows.flatMap(row=>{const chars=Array.from(row),out=[];for(let i=0;i<chars.length;i+=65)out.push((i?'　':'')+chars.slice(i,i+65).join(''));return out});const pages=P.listPages('概算金額（税抜）','入力された単価による参考値。未入力・対象外・未集計を確認してください。',wrapped,'対象なし');return P.buildPdf(pages,'金額は概算・要確認','概算金額・税抜');
}
const api={calculate,pdf,money,quantity,validNumber};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CostEstimate=api;
})(typeof globalThis!=='undefined'?globalThis:this);
