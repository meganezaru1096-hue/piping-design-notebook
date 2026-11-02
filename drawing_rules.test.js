const assert=require('node:assert/strict'),fs=require('fs'),N=require('./network'),P=require('./pdf');
const s=JSON.parse(fs.readFileSync('サンプル/複雑配管_評価用.json','utf8')).data;
const dxf=N.dxf(s,['iso']);
assert(dxf.includes('AC1021'));
assert(dxf.includes('要確認：P1：接続の入力・構成が要確認です。'));
function layerRecord(name){const record=dxf.split('0\r\nLAYER\r\n').find(x=>x.includes('2\r\n'+name+'\r\n'));assert(record,`missing layer ${name}`);return record.split('0\r\nENDTAB')[0]}
assert(layerRecord('CENTER').includes('6\r\nCENTER_JIS\r\n370\r\n18'));
assert(layerRecord('PIPE_OUTLINE').includes('6\r\nCONTINUOUS\r\n370\r\n35'));
assert(layerRecord('DIMENSIONS').includes('6\r\nCONTINUOUS\r\n370\r\n18'));
assert(dxf.includes('0\r\nLWPOLYLINE\r\n100\r\nAcDbEntity\r\n8\r\nCENTER'));
const data=P.pdf(s),hex=x=>Buffer.from(x,'utf16le').swap16().toString('hex').toUpperCase();
assert(data.includes('/FontFile2'));assert(data.includes('/ToUnicode'));assert(data.includes(hex('アイソメ図')));assert(data.includes(hex('継手の拡大図')));assert(data.includes('[8 2 1 2] 0 d'));assert(data.includes('.51 w'));assert(data.includes('.99 w'));
console.log('日本語・フォント埋め込み・線種・線幅・曲線中心線: OK');
