/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const vm=require('node:vm');
function moduleUnderTest(path,mocks={}) {
 const exports={};
 const code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require:name=>name in mocks?mocks[name]:require(name),Buffer,Date,Map,process,console});
 return exports;
}
test('password hashing uses unique salts and rejects wrong passwords',()=>{
 const auth=moduleUnderTest('src/lib/customer-auth.ts',{'./mongodb':{},'@/models/AccountSession':{},'next/server':{}});
 const one=auth.hashPassword('test-password');const two=auth.hashPassword('test-password');
 assert.notEqual(one,two);assert.equal(auth.checkPassword('test-password',one),true);assert.equal(auth.checkPassword('wrong-password',one),false);
 assert.notEqual(auth.tokenHash('token-a'),auth.tokenHash('token-b'));
});
test('callbacks reject forged secrets, partial payments, duplicates and wrong currencies',async()=>{
 process.env.QPAY_CALLBACK_SECRET='test-callback-secret';
 let rows=[];let updates=0;let checks=0;
 const order={invoiceId:'invoice-1',amount:100,paymentStatus:'pending',status:'new'};
 const callback=moduleUnderTest('src/app/api/payments/qpay/callback/route.ts',{
 'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status||200})}},
 mongoose:{__esModule:true,default:{isValidObjectId:()=>true}},
 '@/lib/mongodb':{__esModule:true,default:async()=>{}},
 '@/models/Order':{__esModule:true,default:{findById:async()=>order,updateOne:async()=>{updates++;}}},
 '@/lib/qpay':{qpay:async(path,body)=>{checks++;assert.equal(body.object_id,'invoice-1');return {rows};}},
 '@/lib/api':{errorResponse:()=>({status:500})}
 });
 const request=secret=>({nextUrl:new URL('https://example.mn/callback?order=abc&secret='+secret)});
 assert.equal((await callback.GET(request('forged'))).status,401);assert.equal(checks,0);
 const paid=(id,amount,currency='MNT')=>({payment_id:id,payment_status:'PAID',payment_amount:amount,payment_currency:currency});
 rows=[paid('one',60),paid('one',60),paid('foreign',100,'USD')];await callback.GET(request('test-callback-secret'));assert.equal(updates,0);
 rows=[paid('one',60),paid('two',40)];await callback.GET(request('test-callback-secret'));assert.equal(updates,1);
 order.paymentStatus='paid';const before=checks;await callback.GET(request('test-callback-secret'));assert.equal(checks,before);assert.equal(updates,1);
});
test('checkout order details require a session and scope lookup to its owner',async()=>{
 let accountId=null;let found=null;let query;
 const route=moduleUnderTest('src/app/api/customer/orders/[id]/route.ts',{
  'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status||200})}},
  mongoose:{__esModule:true,default:{isValidObjectId:id=>id==='valid-order'}},
  '@/lib/customer-auth':{customerId:async()=>accountId},
  '@/models/Order':{__esModule:true,default:{findOne:filter=>{query=filter;return {select:()=>({lean:async()=>found})};}}},
  '@/lib/api':{errorResponse:()=>({status:500})}
 });
 const get=id=>route.GET({}, {params:Promise.resolve({id})});
 assert.equal((await get('valid-order')).status,401);assert.equal(query,undefined);
 accountId='owner-a';assert.equal((await get('invalid')).status,404);assert.equal(query,undefined);
 assert.equal((await get('valid-order')).status,404);assert.equal(query.accountId,'owner-a');assert.equal(query._id,'valid-order');
 found={productName:'Filter',paymentStatus:'pending'};const result=await get('valid-order');assert.equal(result.status,200);assert.equal(result.body.order,found);
});
