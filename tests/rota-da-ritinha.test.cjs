"use strict";
// Executar da raiz do repositório: node tests/rota-da-ritinha.test.cjs
// Sem bibliotecas externas. Testa a interface com um DOM simulado.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "jogo-rota-ritinha.html"), "utf8");
const script = fs.readFileSync(path.join(root, "jogo-rota-ritinha.js"), "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const levels = [...html.matchAll(/data-level="(\d+)"/g)].map(m => m[1]);
const directions = [...html.matchAll(/data-dir="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, "IDs não podem se repetir");
assert.equal(levels.length, 3, "O jogo deve ter três níveis");
assert.equal(directions.length, 4, "O jogo deve ter quatro controles de direção");

class MockElement {
  constructor(){
    this.textContent = ""; this.hidden = false; this.disabled = false;
    this.dataset = {}; this.attributes = {}; this.events = {};
    this.children = []; this.styles = {}; this.style = {setProperty:(k,v)=>this.styles[k]=v};
    this.classes = new Set();
    this.classList = {
      add:(...args)=>args.forEach(x=>this.classes.add(x)),
      remove:(...args)=>args.forEach(x=>this.classes.delete(x)),
      contains:x=>this.classes.has(x),
      toggle:(x,force)=>{
        const enabled = force ?? !this.classes.has(x);
        if(enabled)this.classes.add(x);else this.classes.delete(x);
        return enabled;
      }
    };
  }
  setAttribute(key,value){this.attributes[key]=String(value)}
  getAttribute(key){return this.attributes[key]}
  addEventListener(type,fn){(this.events[type]??=[]).push(fn)}
  appendChild(item){this.children.push(item);return item}
  replaceChildren(...items){this.children=items}
  click(){for(const fn of this.events.click||[])fn({target:this})}
}
function boot(){
  const elements = Object.fromEntries(ids.map(id=>[id,new MockElement()]));
  const tabs = levels.map(value=>{const n=new MockElement();n.dataset.level=value;return n});
  const arrows = directions.map(value=>{const n=new MockElement();n.dataset.dir=value;return n});
  const listeners = {};
  const document = {
    body:new MockElement(),
    getElementById:id=>elements[id]||null,
    querySelectorAll:selector=>selector==="[data-level]"?tabs:selector==="[data-dir]"?arrows:[],
    createElement:()=>new MockElement(),
    createDocumentFragment:()=>new MockElement(),
    addEventListener:(type,fn)=>(listeners[type]??=[]).push(fn)
  };
  let printed=0;
  const window={matchMedia:()=>({matches:false}),print:()=>{printed++}};
  vm.runInNewContext(script,{document,window},{filename:"jogo-rota-ritinha.js",timeout:1500});
  return {
    elements,document,
    click:id=>elements[id].click(),
    tab:index=>tabs[index].click(),
    arrow:name=>arrows.find(n=>n.dataset.dir===name).click(),
    key:key=>{const event={key,preventDefault(){this.prevented=true},target:{closest(){return false}}};for(const fn of listeners.keydown||[])fn(event);return event},
    printed:()=>printed
  };
}
const t=boot(), e=t.elements;
assert.equal(e["level-name"].textContent,"1 · Explorar");
assert.equal(e["plan-tools"].hidden,true);
t.arrow("left");
assert.equal(e["move-count"].textContent,"0 movimentos");
assert.match(e["game-feedback"].textContent,/obstáculo/);
t.click("hint-route");
assert.match(e["game-feedback"].textContent,/possibilidade/);
for(const dir of ["up","up","up","right","right","right"])t.arrow(dir);
assert.equal(e["finish-panel"].hidden,false);
assert.equal(e["move-count"].textContent,"6 movimentos");
t.click("next-level");
assert.equal(e["level-name"].textContent,"2 · Planejar");
assert.equal(e["plan-tools"].hidden,false);
t.arrow("left");
assert.match(e["plan-preview"].textContent,/obstáculo/);
t.click("undo-plan");
assert.match(e["plan-preview"].textContent,/Nenhum comando/);
t.arrow("up");
t.click("clear-plan");
assert.equal(e["plan-sequence"].children.length,0);
for(const dir of [...Array(4).fill("up"),...Array(4).fill("right")])t.arrow(dir);
assert.equal(e["move-count"].textContent,"0 movimentos","Planejamento não deve mover antes de executar");
assert.equal(e["plan-sequence"].children.length,8);
t.click("execute-plan");
assert.equal(e["finish-panel"].hidden,false);
assert.equal(e["move-count"].textContent,"8 movimentos");
t.click("next-level");
assert.equal(e["level-name"].textContent,"3 · Sequenciar");
for(const dir of ["up","up","right","right"])t.arrow(dir);
t.click("execute-plan");
assert.equal(e["goal-label"].textContent,"Destino: Chegada 2","O ponto 1 libera o segundo destino");
assert.equal(e["finish-panel"].hidden,true);
for(const dir of ["up","up","up","right","right","right"])t.arrow(dir);
t.click("execute-plan");
assert.equal(e["finish-panel"].hidden,false);
assert.equal(e["move-count"].textContent,"10 movimentos");
assert.match(e["finish-text"].textContent,/10 movimento/);
t.click("quiet-toggle");
assert.equal(t.document.body.classList.contains("calm"),true);
t.click("print-guide");
assert.equal(t.printed(),1);
t.tab(0);
const event=t.key("ArrowUp");
assert.equal(event.prevented,true);
assert.equal(e["move-count"].textContent,"1 movimento");
t.click("restart-level");
assert.equal(e["move-count"].textContent,"0 movimentos");
console.log("PASSOU — Rota da Ritinha: 30 verificações dos 3 níveis, controles e acessibilidade.");
