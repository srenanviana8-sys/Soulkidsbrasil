"use strict";
// Executar na raiz: node tests/soulkids-play.test.cjs
// Bateria sem dependências externas, com DOM e temporizadores simulados.
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"soulkids-play.html"),"utf8");
const script=fs.readFileSync(path.join(root,"soulkids-play.js"),"utf8");
const allIds=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const choices=[...html.matchAll(/data-character="([^"]+)"/g)].map(m=>m[1]);
assert.equal(allIds.length,new Set(allIds).size,"Ids duplicados no HTML");
assert.deepEqual([...choices].sort(),["lia","luca","maya","ritinha","tonico"]);

class Node {
  constructor(){
    this.hidden=false;this.disabled=false;this.textContent="";this.title="";
    this.dataset={};this.events={};this.attributes={};
    this.style={};this.children=[];this._className="";this._classes=new Set();
    this.classList={
      add:(...names)=>names.forEach(n=>this._classes.add(n)),
      remove:(...names)=>names.forEach(n=>this._classes.delete(n)),
      contains:n=>this._classes.has(n),
      toggle:(name,forced)=>{
        const on=forced??!this._classes.has(name);
        if(on)this._classes.add(name);else this._classes.delete(name);
        return on;
      }
    };
  }
  set className(value){this._className=String(value);this._classes=new Set(this._className.split(/\s+/).filter(Boolean))}
  get className(){return [...this._classes].join(" ")}
  setAttribute(k,v){this.attributes[k]=String(v)}
  getAttribute(k){return this.attributes[k]}
  appendChild(child){if(child?.fragment)this.children.push(...child.children);else this.children.push(child);return child}
  replaceChildren(...children){
    this.children=children.length===1&&children[0]?.fragment?[...children[0].children]:children;
  }
  addEventListener(name,listener){(this.events[name]??=[]).push(listener)}
  click(){if(this.disabled)return;let value;for(const fn of this.events.click||[])value=fn({target:this});return value}
  focus(){this.focused=true}
}
function createGame(randoms=[]){
  let now=0,id=0,oscillators=0,printed=0;
  const events=new Map(),timers=new Map();
  const setTimeout=(fn,delay=0)=>{const key=++id;timers.set(key,{when:now+delay,fn});return key};
  const clearTimeout=key=>timers.delete(key);
  function advance(delta){
    const end=now+delta;let count=0;
    while(true){
      const next=[...timers].filter(([_,v])=>v.when<=end)
        .sort((a,b)=>a[1].when-b[1].when||a[0]-b[0])[0];
      if(!next)break;
      const [key,job]=next;timers.delete(key);
      now=job.when;job.fn();if(++count>2000)throw Error("Loop de temporizadores");
    }
    now=end;
  }
  const elements=Object.fromEntries(allIds.map(id=>[id,new Node()]));
  elements["board-game"].hidden=true;
  elements["card-modal"].hidden=true;
  elements["finish-modal"].hidden=true;
  elements["setup-screen"].hidden=false;
  elements["opening-screen"].hidden=false;
  elements["character-selection"].hidden=true;
  const playerChoices=choices.map(name=>{const n=new Node();n.dataset.character=name;return n});
  const document={
    body:new Node(),hidden:false,
    getElementById:name=>elements[name]||null,
    querySelectorAll:selector=>selector==="[data-character]"?playerChoices:[],
    querySelector:selector=>{
      const match=String(selector).match(/^\[data-character="([^"]+)"\]$/);
      return match?playerChoices.find(x=>x.dataset.character===match[1]):null;
    },
    createElement:()=>new Node(),
    createDocumentFragment:()=>{const f=new Node();f.fragment=true;return f},
    addEventListener:(name,fn)=>(events.get(name)||events.set(name,[]).get(name)).push(fn)
  };
  class FakeAudioContext{
    constructor(){this.currentTime=0;this.destination={}}
    resume(){return Promise.resolve()}
    createOscillator(){oscillators++;return {type:"",frequency:{setValueAtTime(){}},connect(){},start(){},stop(){}}}
    createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}
  }
  let index=0;const seeded=Object.create(Math);
  seeded.random=()=>randoms[index++]??.66;
  const window={
    matchMedia:()=>({matches:false}),
    AudioContext:FakeAudioContext,
    addEventListener(){},
    print(){printed++}
  };
  vm.runInNewContext(script,{document,window,setTimeout,clearTimeout,Math:seeded},{filename:"soulkids-play.js",timeout:3000});
  return {
    elements,choices:playerChoices,document,advance,
    randomsUsed:()=>index,oscillators:()=>oscillators,printed:()=>printed,
    click:id=>elements[id].click(),
    choose:name=>playerChoices.find(x=>x.dataset.character===name).click()
  };
}
const a=createGame([0,0]);
assert.equal(a.elements["track-tiles"].children.length,30);
assert.equal(a.elements["legend-list"].children.length,6);
assert.equal(a.elements["route-path"].getAttribute("d"),a.elements["route-shadow"].getAttribute("d"));
assert.equal(a.elements["route-path"].getAttribute("d"),a.elements["route-dashes"].getAttribute("d"));
assert.equal(a.elements["dice-cube"].classList.contains("is-spinning"),false,"Dado não gira antes do começo");
assert.equal(a.elements["character-selection"].hidden,true,"Personagens não aparecem antes de entrar na seleção");
assert.equal(a.oscillators(),0,"Não deve tocar música sem toque");
a.click("arcade-quiet-start");
assert.equal(a.elements["character-selection"].hidden,false,"Seleção abre após o toque inicial");
assert.equal(a.oscillators(),0,"Entrar sem som não ativa a trilha");
a.choose("maya");
assert.equal(a.elements["chosen-name"].textContent,"Maya");
assert.match(a.elements["player-token"].className,/char-maya/);
a.click("play-silent");
assert.equal(a.elements["board-game"].hidden,false);
assert.equal(a.oscillators(),0,"Sem som não deve iniciar áudio");
assert.equal(a.elements["dice-cube"].classList.contains("is-spinning"),true,"Dado gira até o toque");
a.click("dice-button"); // Dado = 1
assert.equal(a.elements["dice-cube"].dataset.value,"1");
assert.equal(a.elements["dice-cube"].classList.contains("is-spinning"),false);
assert.equal(a.elements["dice-button"].disabled,true);
a.advance(2000);
assert.equal(a.elements["position-total"].textContent,"1/30");
assert.equal(a.elements["card-modal"].hidden,false,"A carta abre automaticamente ao pousar");
assert.equal(a.elements["card-category"].textContent,"💪 Corpo");
assert.match(a.elements["card-text"].textContent,/Pule|Estátua|Alto|animal|palmas/i);
a.click("card-help");
assert.equal(a.elements["card-modal"].hidden,true);
assert.equal(a.elements["stars-total"].textContent,"1","Participar com ajuda também pontua");
assert.equal(a.elements["badge-grid"].children.filter(x=>x.classList.contains("is-earned")).length,1);
assert.equal(a.elements["dice-cube"].classList.contains("is-spinning"),true,"O dado volta a girar para o próximo turno");

// Em uma carta Surpresa recebe-se passe; depois, numa carta Desafio, ele pode ser usado.
const b=createGame([.99,.21,.99,0]);
b.click("arcade-quiet-start");
b.click("play-silent");
b.click("dice-button");b.advance(2500);
assert.equal(b.elements["position-total"].textContent,"6/30");
assert.match(b.elements["card-category"].textContent,/Surpresa/);
assert.match(b.elements["card-title"].textContent,/Ray/);
b.click("card-done");
assert.equal(b.elements["shields-total"].textContent,"1");
b.click("dice-button");b.advance(2500);
assert.equal(b.elements["position-total"].textContent,"12/30");
assert.match(b.elements["card-title"].textContent,/Poça/);
assert.equal(b.elements["card-shield"].hidden,false);
b.click("card-shield");
assert.equal(b.elements["position-total"].textContent,"12/30","Passe evita retrocesso");
assert.equal(b.elements["shields-total"].textContent,"0");
assert.equal(b.elements["card-modal"].hidden,true);

// Retrocesso sem passe é animado, sem abrir nova carta durante o deslocamento.
const c=createGame([.52,0]);
c.click("arcade-quiet-start");
c.click("play-silent");
c.click("dice-button");c.advance(2500);
assert.equal(c.elements["position-total"].textContent,"4/30");
assert.match(c.elements["card-category"].textContent,/Desafio/);
c.click("card-done");
c.advance(2500);
assert.equal(c.elements["position-total"].textContent,"2/30");
assert.equal(c.elements["card-modal"].hidden,true);
assert.equal(c.elements["dice-cube"].classList.contains("is-spinning"),true);

// Chegada após múltiplas rodadas; a última casa também produz carta.
const d=createGame([]);
d.click("arcade-quiet-start");
d.click("play-silent");
let turns=0,lastCard=false;
while(d.elements["finish-modal"].hidden&&turns<50){
  assert.equal(d.elements["dice-button"].disabled,false,"O dado deveria estar pronto no início da rodada "+turns);
  d.click("dice-button");d.advance(3000);
  assert.equal(d.elements["card-modal"].hidden,false,"Carta automática obrigatória, rodada "+turns);
  lastCard=true;
  d.click("card-done");d.advance(3000);
  turns++;
}
assert.equal(d.elements["finish-modal"].hidden,false,"Partida deve alcançar a chegada");
assert.equal(d.elements["position-total"].textContent,"30/30");
assert.equal(lastCard,true);
assert.match(d.elements["finish-stars"].textContent,/estrelas/);
d.click("replay");
assert.equal(d.elements["setup-screen"].hidden,false,"Reiniciar devolve à seleção");
assert.equal(d.elements["character-selection"].hidden,false,"A seleção é restaurada depois da partida");
assert.equal(d.elements["board-game"].hidden,true);

// Antes da escolha, a música retro começa com toque explícito.
const e=createGame([0,.2]);
assert.equal(e.oscillators(),0,"Sem autoplay audível antes de gesto");
assert.equal(e.elements["opening-screen"].hidden,false);
e.click("arcade-music-start");
assert.equal(e.elements["opening-screen"].hidden,true);
assert.equal(e.elements["character-selection"].hidden,false);
assert.equal(e.elements["setup-sound-toggle"].getAttribute("aria-pressed"),"true");
assert.ok(e.oscillators()>0,"A trilha deve começar antes da seleção de personagens");
const afterFirstChord=e.oscillators();
e.advance(625);
assert.ok(e.oscillators()>afterFirstChord,"A música de seleção deve continuar em loop");
const beforeSelect=e.oscillators();
e.choose("tonico");
assert.ok(e.oscillators()>beforeSelect,"Trocar personagem produz efeito retrô próprio");
assert.match(e.elements["selection-announcement"].textContent,/Tonico/);
e.click("setup-sound-toggle");
assert.equal(e.elements["setup-sound-toggle"].getAttribute("aria-pressed"),"false");
const beforeQuiet=e.oscillators();
e.advance(1500);
assert.equal(e.oscillators(),beforeQuiet,"Música da seleção para quando desligada");
e.click("setup-sound-toggle");
assert.equal(e.elements["setup-sound-toggle"].getAttribute("aria-pressed"),"true");
e.click("play-sound");
assert.equal(e.elements["board-game"].hidden,false,"Começar partida preserva som ativado na seleção");
assert.ok(e.oscillators()>beforeQuiet);
const before=e.oscillators();
e.click("sound-toggle");
e.advance(1500);
assert.equal(e.oscillators(),before,"Ao silenciar durante a partida, música não produz novas notas");
assert.ok(html.includes("dice-face face-6"),"Dado deve ter seis faces");
assert.ok(html.includes('id="card-modal"'),"Cartas devem ter diálogo acessível");
assert.ok(html.includes('id="badge-grid"'),"Álbum de recompensas deve existir");
assert.ok(!script.includes("localStorage")&&!script.includes("fetch("),"Não coletar dados");
console.log("PASSOU — SoulKids Play: seleção arcade com trilha original opt-in, som por personagem, dado 3D, cartas, seis categorias e chegada.");
