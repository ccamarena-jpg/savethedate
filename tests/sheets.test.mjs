import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
let rows=[],locked=false,available=true;
const sheet={
 getLastRow:()=>rows.length,
 appendRow:r=>rows.push(r),setFrozenRows:()=>{},
 getRange:(row,col,count)=>({
  getValues:()=>rows.slice(row-1,row-1+count),
  createTextFinder:id=>({matchEntireCell:()=>({findNext:()=>rows.some(r=>r[0]===id)})}),
  setNumberFormat:()=>({setValues:values=>{rows.push(...values)}})
 })
};
const context=vm.createContext({
 ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})},
 PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'secret'})},
 LockService:{getScriptLock:()=>({tryLock:()=>{locked=available;return available},hasLock:()=>locked,releaseLock:()=>{locked=false}})},
 SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush:()=>{}},
 Utilities:{formatDate:()=> '2026-09-12 12:00:00'}
});
vm.runInContext(readFileSync('google-sheets/Code.gs','utf8'),context);
const data={secret:'secret',id:'12345678-1234-1234-1234-123456789012',name:'=formula',attendance:'yes',message:'=1+1'};
const post=value=>context.doPost({postData:{contents:JSON.stringify(value)}});
assert.equal(post({...data,secret:'wrong'}).saved,false);assert.equal(rows.length,0);
assert.equal(post(data).saved,true);assert.equal(rows.length,2);assert.equal(locked,false);
assert.equal(rows[1][2],"'=formula");assert.equal(rows[1][4],"'=1+1");
assert.equal(post(data).saved,true);assert.equal(rows.length,2);
available=false;assert.equal(post({...data,id:'22345678-1234-1234-1234-123456789012'}).saved,false);
assert.equal(rows.length,2);
console.log('PASS: authentication, literal text, save, duplicate retry, lock contention');
