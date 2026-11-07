"use strict";
// Executar na raiz: node tests/rota-da-ritinha.test.cjs
// Bateria sem dependências: cenário, lógica das fases, erros, avanço e som opcional.
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"jogo-rota-ritinha.html"),"utf8");
const source=fs.readFileSync(path.join(root,"jogo-rota-ritinha.js"),"utf8");
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dirNames=[...html.matchAll(/data-dir="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,"IDs de HTML duplicados");
assert.deepEqual([...dirNames].sort(),["down","left","right","up"]);
class El{
  constructor(){
    this.hidden=false;this.disabled=false;this.textContent="";this.dataset={};
    this.events={};this.children=[];this.attributes={};this.names=new Set();
    this.style={setProperty:(k,v)=>{this.styles[k]=v}};this.styles={};
    this.classList={
      add:(...xs)=>xs.forEach(x=>this.names.add(x)),
      remove:(...xs)=>xs.forEach(x=>this.names.delete(x)),
      contains:x=>this.names.has(x),
      toggle:(x,forced)=>{const flag=forced??!this.names.has(x);if(flag)this.names.add(x);else this.names.delete(x);return flag}
    };
  }
  set className(value){this.classValue=value;this.names=new Set(String(value).split(/\s+/).filter(Boolean))}
  get className(){return this.classValue||""}
  setAttribute(k,v){this.attributes[k]=String(v)}
  getAttribute(k){return this.attributes[k]}
  addEventListener(type,listener){(this.events[type]??=[]).push(listener)}
  appendChild(node){this.children.push(node)}
  replaceChildren(fragment){this.children=fragment?.fragment?[...fragment.children]:fragment?[fragment]:[]}
  click(){let result;for(const fn of this.events.click||[])result=fn({target:this});return result}
  focus(){this.focused=true}
}
function build(){
  const elements=Object.fromEntries(ids.map(id=>[id,new El()]));
  // The initial HTML state: game and victory dialog hidden.
  elements["game-screen"].hidden=true;
  elements["finish-overlay"].hidden=true;
  elements["intro-screen"].hidden=false;
  const controls=dirNames.map(dir=>{const el=new El();el.dataset.dir=dir;return el});
  const events={};let time=0,nextId=0;const tasks=new Map();
  const setTimeout=(callback,delay=0)=>{const id=++nextId;tasks.set(id,{at:time+delay,callback});return id};
  const clearTimeout=id=>tasks.delete(id);
  function tick(delta){
    const end=time+delta;let count=0;
    for(;;){
      const pending=[...tasks].filter(([id,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at);
      if(!pending.length)break;
      const [id,task]=pending[0];tasks.delete(id);time=task.at;task.callback();
      if(++count>300)throw new Error("Timer possivelmente infinito");
    }
    time=end;
  }
  const document={
    body:new El(),hidden:false,
    getElementById:id=>elements[id]||null,
    querySelectorAll:q=>q==="[data-dir]"?controls:[],
    createElement:()=>new El(),createDocumentFragment:()=>{const e=new El();e.fragment=true;return e},
    addEventListener:(type,fn)=>(events[type]??=[]).push(fn)
  };
  let prints=0,createdVoice=0,oscillators=0,footsteps=0;
  const filteredSteps=[];
  class FakeAudio{constructor(src){createdVoice++;this.src=src;this.preload="auto";this.currentTime=0}
    play(){return Promise.resolve()}pause(){}}
  class FakeAudioContext{
    constructor(){this.currentTime=0;this.destination={}}
    resume(){return Promise.resolve()}
    createOscillator(){oscillators++;return {type:"",frequency:{setValueAtTime(){}},connect(){},start(){},stop(){}}}
    createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}
    createBuffer(_ch,length){return {getChannelData:()=>new Float32Array(length)}}
    createBufferSource(){footsteps++;return {buffer:null,connect(){},start(){},stop(){}}}
    createBiquadFilter(){const filter={type:"lowpass",frequency:{value:0},connect(){}};filteredSteps.push(filter);return filter}
    get sampleRate(){return 8000}
  }
  const window={matchMedia:()=>({matches:false}),AudioContext:FakeAudioContext,addEventListener(){},print(){prints++}};
  vm.runInNewContext(source,{window,document,setTimeout,clearTimeout,Audio:FakeAudio},{filename:"jogo-rota-ritinha.js",timeout:2000});
  return {
    elements,document,tick,printCount:()=>prints,voiceCount:()=>createdVoice,oscCount:()=>oscillators,
    footCount:()=>footsteps,filteredSteps:()=>filteredSteps.map(x=>x.frequency.value),
    dir:name=>controls.find(x=>x.dataset.dir===name).click(),
    click:id=>elements[id].click(),
    key:(key,inGame=true)=>{
      const e={key,target:{closest:query=>query==="#game-screen"&&inGame},preventDefault(){this.prevented=true}};
      for(const fn of events.keydown||[])fn(e);return e;
    },
    pending:()=>tasks.size,
    obstacleCount:()=>elements["adventure-board"].children.filter(x=>x.classList.contains("obstacle")).length,
    targetNames:()=>elements["adventure-board"].children.filter(x=>x.classList.contains("goal")).map(x=>x.attributes["aria-label"])
  };
}
const e=build(),u=e.elements;
assert.equal(e.voiceCount(),0,"Áudio nunca deve carregar antes do consentimento");
assert.equal(e.oscCount(),0,"Sem efeitos antes de iniciar");
e.click("start-quiet");
assert.equal(e.voiceCount(),0,"Jogar sem som não deve criar áudio");
assert.equal(u["game-screen"].hidden,false);
assert.match(u["stage-title"].textContent,/Tonico/);
assert.equal(u["adventure-board"].children.length,16);
assert.equal(e.obstacleCount(),2);
assert.ok(e.targetNames().some(x=>x.includes("Tonico")));
assert.equal(u["star-count"].textContent,"☆ Encontre a estrela");
e.dir("right");e.dir("up");
assert.match(u["story-line"].textContent,/Ops!/);
assert.equal(u["execute-plan"].disabled,true);
e.tick(1050);
assert.match(u["story-line"].textContent,/Tonico/,"Erro reinicia apenas a fase atual");
assert.equal(e.oscCount(),0,"Modo sem som permanece silencioso");
for(const dir of ["up","up","up","right","right","right"])e.dir(dir);
assert.equal(u["finish-overlay"].hidden,false);
assert.equal(u["finish-quote"].textContent,"Boa, jovem!","Bordão do Ravi aprovado");
assert.equal(u["star-badge"].textContent,"⭐ Estrela encontrada!","A estrela foi encontrada no caminho");
assert.equal(u["meeting-dialogue"].children.length,3,"O encontro com Tonico tem conversa da turma");
assert.equal(u["meeting-dialogue"].children[1].children[1].children[1].textContent,"Toc, toc!");
e.click("hold-next");
e.tick(5000);
assert.match(u["stage-title"].textContent,/Tonico/,"Avanço pode ser pausado");
e.click("hold-next");
e.tick(5500);
assert.match(u["stage-title"].textContent,/Luca/,"Fase 2 inicia automaticamente");
assert.equal(e.obstacleCount(),3);
for(const dir of ["right","right","right","up"])e.dir(dir);
e.click("execute-plan");e.tick(1200);
assert.match(u["story-line"].textContent,/Ops!/,"Plano errado gera reinício");
e.tick(1050);
assert.match(u["stage-title"].textContent,/Luca/);
for(const dir of [...Array(4).fill("up"),...Array(4).fill("right")])e.dir(dir);
assert.equal(u["plan-chips"].children.length,8);
e.click("execute-plan");e.tick(2500);
assert.equal(u["finish-overlay"].hidden,false);
assert.equal(u["finish-quote"].textContent,"Meu ovo de dinossauro!");
assert.equal(u["meeting-dialogue"].children.length,2,"Ritinha e Luca conversam ao se encontrar");
e.tick(5500);
assert.match(u["stage-title"].textContent,/turma/);
assert.equal(u["adventure-board"].children.length,36);
assert.equal(e.obstacleCount(),6);
assert.ok(e.targetNames().some(x=>x.includes("Maya")));
assert.ok(e.targetNames().some(x=>x.includes("Lia")));
for(const dir of ["up","up","right","right"])e.dir(dir);
e.click("execute-plan");e.tick(1100);
assert.match(u["meeting-note"].textContent,/Obrigado|Obrigada/,"Maya conversa com a Ritinha no checkpoint");
assert.equal(u["meeting-note"].hidden,false,"Diálogo de checkpoint visível");
for(const dir of ["up","up","up","right","right","right"])e.dir(dir);
e.click("execute-plan");e.tick(1800);
assert.equal(u["finish-overlay"].hidden,false);
assert.match(u["finish-quote"].textContent,/turma/);
assert.equal(u["meeting-dialogue"].children.length,3,"Lia tem tempo para escolher voltar");
assert.match(u["meeting-dialogue"].children[0].children[1].children[1].textContent,/NÃO!/);
e.tick(9000);
assert.equal(u["finish-overlay"].hidden,false,"Fase final não reinicia automaticamente");
e.click("continue-button");
assert.equal(u["intro-screen"].hidden,false,"Recomeço é escolha do usuário");
e.click("start-sound");
assert.equal(e.voiceCount(),1,"Áudio aprovado carrega apenas depois de opção com som");
assert.ok(e.oscCount()>0,"Efeitos musicais de baixo volume são ativados");
assert.equal(u["music-toggle"].getAttribute("aria-pressed"),"true","Trilha ligada ao iniciar com som");
const musicBefore=e.oscCount();
e.tick(700);
assert.ok(e.oscCount()>musicBefore,"Trilha musical executa várias notas, não apenas efeitos");
const stepsBefore=e.footCount();
e.dir("up");
assert.equal(e.footCount(),stepsBefore+1,"Um passo é emitido ao mover para cima");
assert.ok(e.filteredSteps().includes(730),"Passo de subida tem timbre próprio");
e.click("music-toggle");
assert.equal(u["music-toggle"].getAttribute("aria-pressed"),"false","Trilha pode ser desligada sem silenciar passos");
const noMusic=e.oscCount();
e.tick(800);
assert.equal(e.oscCount(),noMusic,"Notas da trilha cessam ao desligar música");
e.click("sound-toggle");const prev=e.oscCount();const stepOff=e.footCount();
e.dir("up");assert.equal(e.oscCount(),prev,"Botão som desligado realmente silencia");
assert.equal(e.footCount(),stepOff,"Passos também ficam silenciosos quando mutados");
e.click("calm-toggle");assert.equal(e.document.body.classList.contains("calm"),true);
e.click("print-guide");assert.equal(e.printCount(),1);
const outside=e.key("ArrowLeft",false);assert.equal(outside.prevented,undefined);
const inside=e.key("ArrowUp",true);assert.equal(inside.prevented,true);
assert.ok(html.includes('<details class="parent-details"'),"Orientações técnicas devem ficar recolhidas");
assert.ok(html.includes('gibi1-capa.webp'),"Imagens derivadas da capa oficial");
assert.ok(!source.includes("localStorage")&&!source.includes("fetch("),"Jogo não coleta dados");
console.log("PASSOU — Rota da Ritinha 4.0: trilha original, passos com direções, falas ao encontrar, estrela, reinício e avanços.");
