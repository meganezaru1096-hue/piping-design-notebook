'use strict';
// Jw_cad compatibility: DXF 2000 declares the Windows Japanese code page.
// TextDecoder's Shift_JIS mapping follows the browser's Windows-compatible mapping.
(function(root){
 let reverse;
 function table(){
  if(reverse)return reverse;
  const dec=new TextDecoder('shift_jis',{fatal:true}), m=new Map();
  const add=bytes=>{try{const c=dec.decode(new Uint8Array(bytes));if([...c].length===1&&!m.has(c))m.set(c,bytes)}catch{}};
  for(let b=0;b<=0x7f;b++)add([b]);
  for(let b=0xa1;b<=0xdf;b++)add([b]);
  for(let a=0x81;a<=0xfc;a++)if(a<=0x9f||a>=0xe0)for(let b=0x40;b<=0xfc;b++)if(b!==0x7f)add([a,b]);
  return reverse=m;
 }
 function jwcad(dxf){
  if(!/^0\r?\nSECTION\r?\n2\r?\nHEADER\r?\n9\r?\n\$ACADVER\r?\n1\r?\nAC1021\r?\n9\r?\n\$DWGCODEPAGE\r?\n3\r?\nUTF-8\r?\n/.test(dxf))throw Error('対応するDXFヘッダーではありません。');
  const s=dxf.replace('AC1021','AC1015').replace('UTF-8','ANSI_932').replace(/m³/g,'m3').replace(/[↗↖↘↙]/g,c=>({'↗':'右上','↖':'左上','↘':'右下','↙':'左下'}[c]));
  const map=table(), out=[];
  for(const c of s){const bytes=map.get(c);if(!bytes)throw Error(`Jw_cad用の文字コードで表せない文字「${c}」（U+${c.codePointAt(0).toString(16).toUpperCase()}）があります。設備名などを変更するか、標準DXFをお使いください。`);out.push(...bytes)}
  return new Uint8Array(out);
 }
 const api={jwcad};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DxfEncoding=api;
})(globalThis);
