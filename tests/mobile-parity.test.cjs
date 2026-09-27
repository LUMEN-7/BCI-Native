const { test }=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),babel=require('@babel/core');
function load(relative,stubs={}){
 const filename=path.resolve(__dirname,'..',relative);
 const {code}=babel.transformSync(fs.readFileSync(filename,'utf8'),{filename,configFile:false,babelrc:false,plugins:['@babel/plugin-transform-modules-commonjs']});
 const module={exports:{}};
 new Function('require','module','exports',code)(name=>{
  if(Object.hasOwn(stubs,name))return stubs[name];
  if(name.startsWith('.'))return load(path.relative(path.resolve(__dirname,'..'),path.resolve(path.dirname(filename),name+'.js')),stubs);
  throw Error('Unexpected dependency '+name);
 },module,module.exports);
 return module.exports;
}
const compare=load('src/utils/comparison.js');
test('comparison uses version IDs and keeps all saved multi-selection references',()=>{
 assert.deepEqual(compare.comparisonIds([{id:'20',comparisonId:101},{id:'30',comparisonId:102}]),[101,102]);
 assert.deepEqual(compare.savedComparisonCars({RequestPayload:'{"CarrosIds":[1,2,3,4]}'}).map(c=>c.comparisonId),[1,2,3,4]);
 assert.throws(()=>compare.savedComparisonCars({requestPayload:'invalid'}));
 assert.throws(()=>compare.comparisonIds([{id:2},{id:2}]));
 assert.throws(()=>compare.comparisonIds([1]));
});
test('missing vehicle data never matches a similarity filter',()=>{
 for(const {id} of compare.SIMILARITY_FILTERS)assert.equal(compare.matchesSimilarity({engine:'Não informado',type:'Não informado'},{engine:'Não informado',type:'Não informado'},id),false,id);
 assert.equal(compare.matchesSimilarity({powerValue:200},{powerValue:210},'performance'),true);
 assert.equal(compare.matchesSimilarity({type:'SUV'},{type:'Sedã'},'category'),false);
});
test('selection DTO preserves backend ID, casing and real dimensions',()=>{
 const car=compare.selectionCar({Id:12,LinhagemId:2,Modelo:'Exemplo',Dimensoes:[{EntreEixos:{Fontes:[{Valor:'2700 mm'}]}}],Especificacoes:[{Potencia:{Fontes:[{Valor:170}]}}]});
 assert.equal(car.id,'2');assert.equal(car.comparisonId,12);assert.equal(car.dimensions.wheelbase,2700);assert.equal(car.powerValue,170);assert.equal(car.price,null);
});
test('comparison table retains columns for all cars and optional differences',()=>{
 const cars=[{specs:{Motor:'2.0',Potência:'170 cv'}},{specs:{Motor:'2.0',Potência:'180 cv'}},{specs:{Motor:'2.0'}}];
 assert.deepEqual(compare.comparisonRows(cars,true),[{key:'Potência',values:['170 cv','180 cv','Não informado']}]);
});
test('catalog pagination deduplicates and stops when server repeats a page',async()=>{
 let calls=0;const page=Array.from({length:100},(_,i)=>({id:i+1,linhagemId:i+1}));
 const {getCatalog}=load('src/services/catalogService.js',{'./carsService':{getCars:async()=>{calls++;return page;}}});
 assert.equal((await getCatalog()).length,100);assert.equal(calls,2);
});
test('catalog loads subsequent pages and rejects invalid envelope',async()=>{
 const page=Array.from({length:100},(_,i)=>({id:i+1}));
 let service=load('src/services/catalogService.js',{'./carsService':{getCars:async n=>n===1?page:{Items:[{id:101}]}}});
 assert.equal((await service.getCatalog()).length,101);
 service=load('src/services/catalogService.js',{'./carsService':{getCars:async()=>({error:'bad'})}});
 await assert.rejects(service.getCatalog(),/formato/);
});
test('note editing retains rich blocks and all paragraphs when unchanged',()=>{
 const notes=load('src/services/noteService.js',{'./api':()=>{}});
 const raw={Id:3,Titulo:'Minha nota',Blocos:[{Id:'h',Tipo:'Titulo',Texto:'Título'},{Id:'p1',Tipo:'Paragrafo',Texto:'A'},{Id:'p2',Tipo:'Paragrafo',Texto:'B'},{Id:'image',Tipo:'Imagem',Texto:'https://example.com/image.png'},{Id:'comparison',Tipo:'CardComparacao',CardComparacao:{ComparacaoId:7}},{Tipo:'CardCarro',CardCarro:{LinhagemId:9,Marca:'Marca',Modelo:'Modelo'}}]};
 const original=notes.fromBackend(raw);assert.equal(original.content,'A\n\nB');assert.equal(original.attachedCars[0].id,9);
 const unchanged=notes.toBlocks(original,original);assert.equal(unchanged.filter(b=>b.tipo==='Paragrafo').length,2);
 const edited=notes.toBlocks({...original,content:'Novo conteúdo'},original);
 assert.equal(edited.filter(b=>b.tipo==='Paragrafo').length,1);assert.ok(edited.some(b=>b.tipo==='Imagem'&&b.texto==='https://example.com/image.png'));assert.ok(edited.some(b=>b.tipo==='CardComparacao'&&b.comparacaoIdReferenciada===7));
});
test('failed note block save returns created ID for retry, and emits update',async()=>{
 let updates=0;
 const service=load('src/services/noteService.js',{'./api':async(p,o)=>{if(p==='/Anotacao')return {id:42};throw Error('offline');}});
 service.subscribeNotes(()=>updates++);
 await assert.rejects(service.saveNote({title:'Nota',content:'Texto',attachedCars:[]}),e=>e.noteId===42);
 assert.equal(updates,1);
});
test('workspace create payload uses actual enums and nullable references',()=>{
 const w=load('src/services/workspaceService.js',{'./api':()=>{}});
 assert.deepEqual(w.postPayload({type:'review',content:'Revisar',tags:['motor'],responsibleId:'u1',status:'progress',linkedType:'vehicle',linkedId:'8',linkedTitle:'Modelo'}),{tipo:'Revisao',conteudo:'Revisar',tags:['motor'],responsavelUserId:'u1',status:'EmAnalise',tipoConteudoVinculado:'Veiculo',conteudoVinculadoId:8,conteudoVinculadoTitulo:'Modelo'});
 const post=w.adaptPost({Id:1,Autor:{UserId:'u',Nome:'Nome'},Status:'Resolvido',Tipo:'Decisao',Comentarios:[{Id:5,Autor:{Nome:'Autor'},Conteudo:'Comentário'}],Responsavel:{UserId:'r',Nome:'Resp'}});
 assert.equal(post.authorId,'u');assert.equal(post.responsibleId,'r');assert.equal(post.status,'resolved');assert.equal(post.comments[0].content,'Comentário');
});
test('workspace comments, pin, status and activities use real endpoints',async()=>{
 const calls=[];const w=load('src/services/workspaceService.js',{'./api':async(p,o)=>{calls.push([p,o]);return {};}});
 await w.commentPost(2,'Oi');await w.togglePin(2);await w.updatePostStatus(2,'resolved');await w.listActivities(4);
 assert.deepEqual(calls.map(c=>c[0]),['/Workspace/posts/2/comentarios','/Workspace/posts/2/fixar','/Workspace/posts/2/status','/Workspace/4/atividades']);
 assert.deepEqual(JSON.parse(calls[2][1].body),{status:'Resolvido'});
});


test('comparison export sends every lineage through the real export endpoint',async()=>{
 let payload;
 class File{constructor(){this.uri='file:///cache/export.csv';}create(){}write(){}}
 const e=load('src/services/exportService.js',{'expo-file-system':{File,Paths:{cache:'cache'}},'expo-sharing':{isAvailableAsync:async()=>true,shareAsync:async()=>{}},'./api':{apiRequest:async(path,options)=>{assert.equal(path,'/Exportacao');payload=JSON.parse(options.body);return {headers:{get:()=>null},arrayBuffer:async()=>new Uint8Array([65]).buffer};}}});
 await e.exportCar([2,3,2],'csv',';');
 assert.deepEqual(payload,{itens:[{linhagemId:2},{linhagemId:3}],formato:'csv',separador:';'});
});
test('remote resource ignores late responses after losing focus',async()=>{
 let effect,resolve;const state=[];let index=0;
 const react={useCallback:fn=>fn,useRef:v=>({current:v}),useState:v=>{const i=index++;state[i]=v;return [v,value=>{state[i]=typeof value==='function'?value(state[i]):value;}];}};
 const {default:useResource}=load('src/hooks/useRemoteResource.js',{react,'@react-navigation/native':{useFocusEffect:fn=>{effect=fn;}}});
 useResource(()=>new Promise(r=>resolve=r));const cleanup=effect();await Promise.resolve();cleanup();resolve('stale');await new Promise(r=>setImmediate(r));
 assert.equal(state[0],null);
});


test('native views never contain raw text nodes outside Text',()=>{
 function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
 const failures=[];
 for(const filename of walk(path.resolve(__dirname,'../src')).filter(f=>f.endsWith('.js'))){
  const ast=babel.parseSync(fs.readFileSync(filename,'utf8'),{filename,configFile:false,babelrc:false,parserOpts:{plugins:['jsx']}});
  babel.traverse(ast,{JSXElement(p){if(p.node.openingElement.name.name!=='View')return;for(const child of babel.types.react.buildChildren(p.node))if(child.type==='StringLiteral'&&child.value.length)failures.push(path.relative(__dirname,filename)+':'+p.node.loc.start.line);}});
 }
 assert.deepEqual(failures,[]);
});
