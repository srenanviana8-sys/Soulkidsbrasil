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
  const countButtons=[1,2,3,4].map(count=>{const n=new Node();n.dataset.playerCount=String(count);return n});
  const document={
    body:new Node(),hidden:false,
    getElementById:name=>elements[name]||null,
    querySelectorAll:selector=>selector==="[data-character]"?playerChoices:selector==="[data-player-count]"?countButtons:[],
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
    elements,choices:playerChoices,counts:countButtons,document,advance,
    randomsUsed:()=>index,oscillators:()=>oscillators,printed:()=>printed,
    click:id=>elements[id].click(),
    choose:name=>playerChoices.find(x=>x.dataset.character===name).click(),
    count:n=>countButtons.find(x=>Number(x.dataset.playerCount)===n).click(),
    slot:n=>elements["slot-picker"].children[n].click()
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
assert.match(a.elements["card-text"].textContent,/Pule|Estátua|Alto|animal|palmas|movimentos|figuras/i);
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
  d.click(d.elements["card-done"].disabled?"card-help":"card-done");d.advance(3000);
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
// Multiplayer local: escalação, personagens únicos, turnos, animação e recompensas individuais.
const m=createGame([0,0,.5,0,0,0]);
m.click("arcade-quiet-start");
m.count(3);
assert.equal(m.elements["play-silent"].disabled,true,"Sem escalação completa não pode iniciar");
assert.equal(m.elements["slot-picker"].children.length,3);
m.choose("ritinha");
assert.match(m.elements["selection-prompt"].textContent,/Jogador 2/);
m.choose("luca");
assert.equal(m.choices.find(x=>x.dataset.character==="ritinha").disabled,true,"Personagem já escolhido não pode ser repetido");
m.choose("maya");
assert.equal(m.elements["play-silent"].disabled,false,"Turma completa libera início");
m.click("play-silent");
assert.equal(m.elements["player-scoreboard"].children.length,3,"Cada jogador tem seu placar");
assert.equal(m.elements["other-tokens"].children.length,2,"Todos os peões aparecem no tabuleiro");
assert.match(m.elements["chosen-name"].textContent,/Ritinha/);
m.click("dice-button");
m.advance(170);
assert.match(m.elements["player-token"].className,/is-walking/,"Ritinha caminha com sprite animado");
m.advance(2200);
assert.equal(m.elements["card-modal"].hidden,false);
m.click("card-help");
assert.equal(m.elements["position-total"].textContent,"0/30","Vez alterna e o jogador seguinte começa da largada");
assert.equal(m.elements["chosen-name"].textContent,"Luca");
assert.equal(m.elements["stars-total"].textContent,"0","As estrelas são individuais");
assert.match(m.elements["turn-label"].textContent,/Jogador 2/);
m.click("dice-button");m.advance(2600);
assert.equal(m.elements["position-total"].textContent,"4/30");
assert.equal(m.elements["card-modal"].hidden,false);
m.click("card-done");m.advance(2200);
assert.equal(m.elements["chosen-name"].textContent,"Maya");
assert.equal(m.elements["stars-total"].textContent,"0");
assert.equal(m.elements["position-total"].textContent,"0/30");
m.click("dice-button");m.advance(2200);m.click("card-done");
assert.equal(m.elements["chosen-name"].textContent,"Ritinha","Terceiro jogador devolve vez ao primeiro");
assert.equal(m.elements["position-total"].textContent,"1/30","O progresso da Ritinha foi preservado");
assert.equal(m.elements["stars-total"].textContent,"1","Ritinha mantém recompensa obtida");
assert.match(m.elements["player-scoreboard"].children[1].attributes["aria-label"],/casa 2/);

// Trocar uma vaga depois de escolhida sem permitir duplicidade.
const f4=createGame([]);
f4.click("arcade-quiet-start");f4.count(4);
for(const ch of ["ritinha","luca","maya","lia"])f4.choose(ch);
assert.equal(f4.elements["slot-picker"].children.length,4);
f4.slot(1);f4.choose("tonico");
f4.click("play-silent");
assert.equal(f4.elements["player-scoreboard"].children.length,4);
assert.match(f4.elements["player-scoreboard"].children[1].attributes["aria-label"],/Tonico/);

// Rodada extra: repete jogador em vez de alternar.
const extraRoll=createGame([.99,.7,.2,0]);
extraRoll.click("arcade-quiet-start");extraRoll.count(2);
extraRoll.choose("ritinha");extraRoll.choose("luca");extraRoll.click("play-silent");
extraRoll.click("dice-button");extraRoll.advance(2600);
assert.match(extraRoll.elements["card-title"].textContent,/Bilhete especial/);
extraRoll.click("card-done");
assert.equal(extraRoll.elements["chosen-name"].textContent,"Ritinha","Rodada extra mantém o jogador atual");
extraRoll.click("dice-button");extraRoll.advance(2600);extraRoll.click("card-done");
assert.equal(extraRoll.elements["chosen-name"].textContent,"Luca","Após a extra, vez passa ao próximo");

// Partida de dois jogadores: primeira pessoa a chegar encerra, demais permanecem no placar.
const race=createGame([]);
race.click("arcade-quiet-start");race.count(2);
race.choose("ritinha");race.choose("maya");race.click("play-silent");
let rounds=0;
while(race.elements["finish-modal"].hidden&&rounds<160){
  assert.equal(race.elements["dice-button"].disabled,false,"Dado pronto na rodada "+rounds);
  race.click("dice-button");race.advance(3500);
  assert.equal(race.elements["card-modal"].hidden,false,"Carta por rodada no multiplayer");
  race.click(race.elements["card-done"].disabled?"card-help":"card-done");race.advance(3500);rounds++;
}
assert.equal(race.elements["finish-modal"].hidden,false,"A partida local termina com o primeiro a chegar");
assert.equal(race.elements["finish-players"].children.length,2);
assert.match(race.elements["finish-title"].textContent,/chegou ao Espaço da Conquista/);
assert.equal(race.elements["finish-players"].children.filter(x=>x.classList.contains("is-finisher")).length,1);
race.click("replay");
assert.equal(race.elements["character-selection"].hidden,false,"Após a partida a seleção retorna");
assert.equal(race.elements["slot-picker"].children.length,2,"Recomeçar preserva a quantidade de jogadores");


// Minijogos de toque: sequências, alternativas, erros recuperáveis e ajuda.
const rhythm=createGame([0,0]);
rhythm.click("arcade-quiet-start");rhythm.click("play-silent");
rhythm.click("dice-button");rhythm.advance(2400);
assert.equal(rhythm.elements["card-mini"].hidden,false,"Carta Corpo interativa aparece");
assert.equal(rhythm.elements["card-done"].disabled,true,"Concluir depende de interagir ou pedir ajuda");
assert.equal(rhythm.elements["mini-options"].children.length,3);
rhythm.elements["mini-options"].children[1].click();
assert.match(rhythm.elements["mini-feedback"].textContent,/não era/);
for(let i=0;i<3;i++)rhythm.elements["mini-options"].children[0].click();
assert.equal(rhythm.elements["card-done"].disabled,false,"Sequência correta desbloqueia a carta");
rhythm.click("card-done");
assert.equal(rhythm.elements["stars-total"].textContent,"1");

const imagination=createGame([.2,.25]);
imagination.click("arcade-quiet-start");imagination.click("play-silent");
imagination.click("dice-button");imagination.advance(2400);
assert.match(imagination.elements["card-title"].textContent,/Objeto mágico/);
assert.equal(imagination.elements["card-done"].disabled,true);
imagination.elements["mini-options"].children[2].click();
assert.equal(imagination.elements["card-done"].disabled,false,"Imaginação aceita diferentes soluções criativas");
imagination.click("card-done");

const emotions=createGame([.4,.99]);
emotions.click("arcade-quiet-start");emotions.click("play-silent");
emotions.click("dice-button");emotions.advance(2400);
assert.match(emotions.elements["card-title"].textContent,/Amigo do lado/);
emotions.elements["mini-options"].children[1].click();
assert.equal(emotions.elements["card-done"].disabled,true);
emotions.elements["mini-options"].children[0].click();
assert.equal(emotions.elements["card-done"].disabled,false);

const teamwork=createGame([.52,.62]);
teamwork.click("arcade-quiet-start");teamwork.click("play-silent");
teamwork.click("dice-button");teamwork.advance(2400);
assert.match(teamwork.elements["card-title"].textContent,/Trabalho em equipe/);
for(const index of [1,0,2])teamwork.elements["mini-options"].children[index].click();
assert.equal(teamwork.elements["card-done"].disabled,false);
teamwork.click("card-done");teamwork.advance(2000);
assert.equal(teamwork.elements["position-total"].textContent,"6/30","Desafio resolvido garante avanço");

const withSupport=createGame([0,0]);
withSupport.click("arcade-quiet-start");withSupport.click("play-silent");
withSupport.click("dice-button");withSupport.advance(2400);
assert.equal(withSupport.elements["card-mini"].hidden,false,"Carta Corpo avançada exige sequência");
withSupport.click("card-help");
assert.equal(withSupport.elements["card-modal"].hidden,true,"Participação assistida continua possível");
assert.equal(withSupport.elements["stars-total"].textContent,"1");

assert.ok(html.includes('id="card-mini"'));
assert.ok(script.includes('function chooseMini(index)'));
assert.equal((script.match(/mini:\{type:/g)||[]).length,8,"Oito cartas interativas na versão");

console.log("PASSOU — SoulKids Play: seleção arcade, multiplayer 1–4, caminhada da Ritinha e 8 cartas interativas.");
