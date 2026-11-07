"use strict";
(() => {
  // Jogo local, sem login, armazenamento, rastreamento ou envio de dados.
  const levels = [
    {name:"Explorar",size:4,mode:"move",start:[3,0],walls:[[2,1]],goals:[{at:[0,3],label:"Chegada"}],instruction:"Encontre a chegada. Use as setas para mover o marcador R, uma casa de cada vez.",focus:"Direções espaciais e exploração de trajetos."},
    {name:"Planejar",size:5,mode:"plan",start:[4,0],walls:[[1,1],[2,1],[3,3]],goals:[{at:[0,4],label:"Chegada"}],instruction:"Antes de andar, escolha uma sequência de setas. Confira a rota prevista e toque em Executar plano.",focus:"Antecipação, organização de sequência e ajuste de estratégia."},
    {name:"Sequenciar",size:6,mode:"plan",start:[5,0],walls:[[4,1],[4,3],[3,3],[2,1],[1,1],[1,4]],goals:[{at:[3,2],label:"Ponto 1"},{at:[0,5],label:"Chegada 2"}],instruction:"Planeje uma rota até o ponto 1 e depois até a chegada 2. Você pode executar o percurso em partes.",focus:"Sequenciamento de objetivos, orientação e flexibilidade no planejamento."}
  ];
  const dirs = {
    up:{dr:-1,dc:0,word:"cima",sign:"↑"},
    right:{dr:0,dc:1,word:"direita",sign:"→"},
    down:{dr:1,dc:0,word:"baixo",sign:"↓"},
    left:{dr:0,dc:-1,word:"esquerda",sign:"←"}
  };
  const $ = id => document.getElementById(id);
  const dom = {
    board:$("rota-board"),levelName:$("level-name"),levelIntro:$("level-intro"),
    goal:$("goal-label"),position:$("position-label"),count:$("move-count"),
    mode:$("control-mode"),feedback:$("game-feedback"),plan:$("plan-tools"),
    sequence:$("plan-sequence"),preview:$("plan-preview"),execute:$("execute-plan"),
    undo:$("undo-plan"),clear:$("clear-plan"),hint:$("hint-route"),restart:$("restart-level"),
    finish:$("finish-panel"),finishTitle:$("finish-title"),finishText:$("finish-text"),
    next:$("next-level"),focus:$("stage-focus"),calm:$("quiet-toggle")
  };
  if (Object.values(dom).some(node => !node)) return;
  const key = (r,c) => r+","+c;
  const same = (a,b) => a[0]===b[0] && a[1]===b[1];
  const inside = (cfg,r,c) => r>=0&&c>=0&&r<cfg.size&&c<cfg.size;
  const wallSet = cfg => new Set(cfg.walls.map(cell=>key(...cell)));
  const blocked = (cfg,r,c) => !inside(cfg,r,c)||wallSet(cfg).has(key(r,c));
  const neighbors = (cfg,pos) => Object.entries(dirs)
    .map(([name,d])=>({name,at:[pos[0]+d.dr,pos[1]+d.dc]}))
    .filter(item=>!blocked(cfg,...item.at));
  const shortest = (cfg,from,to) => {
    const startKey=key(...from), targetKey=key(...to);
    if(startKey===targetKey)return [];
    const queue=[{at:from,path:[]}],seen=new Set([startKey]);
    for(let i=0;i<queue.length;i++){
      const cur=queue[i];
      for(const nxt of neighbors(cfg,cur.at)){
        const k=key(...nxt.at);
        if(seen.has(k))continue;
        const path=[...cur.path,nxt.name];
        if(k===targetKey)return path;
        seen.add(k);queue.push({at:nxt.at,path});
      }
    }
    return null;
  };
  let state;
  function announce(msg){dom.feedback.textContent=msg;}
  function current(){return levels[state.level];}
  function target(){return current().goals[state.targetIndex];}
  function newLevel(index){
    const cfg=levels[index];
    state={level:index,pos:[...cfg.start],targetIndex:0,steps:0,checks:0,done:false,plan:[],visited:new Set([key(...cfg.start)])};
    document.querySelectorAll("[data-level]").forEach(btn=>{
      const active=Number(btn.dataset.level)===index;
      btn.setAttribute("aria-pressed",String(active));
    });
    dom.levelName.textContent=(index+1)+" · "+cfg.name;
    dom.levelIntro.textContent=cfg.instruction;
    dom.focus.textContent=cfg.focus;
    dom.mode.textContent=cfg.mode==="move"
      ?"Cada seta move o marcador imediatamente. Você também pode usar as setas do teclado."
      :"Monte o percurso com as setas. Depois toque em Executar plano. Você pode fazer quantas etapas precisar.";
    dom.plan.hidden=cfg.mode!=="plan";
    dom.finish.hidden=true;
    announce("Nível "+(index+1)+" iniciado. "+cfg.instruction);
    render();
  }
  function visit(dirName){
    const d=dirs[dirName],cfg=current();
    if(!d||state.done)return {stopped:true};
    const next=[state.pos[0]+d.dr,state.pos[1]+d.dc];
    if(blocked(cfg,...next)){state.checks++;return {blocked:true};}
    state.pos=next;
    state.steps++;
    state.visited.add(key(...next));
    if(same(next,target().at)){
      state.targetIndex++;
      if(state.targetIndex>=cfg.goals.length){
        state.done=true;
        return {done:true};
      }
      return {checkpoint:true};
    }
    return {moved:true};
  }
  function predicted(){
    const cfg=current();
    const path=[],pos=[...state.pos];
    let collision=null;
    for(let i=0;i<state.plan.length;i++){
      const d=dirs[state.plan[i]];
      const next=[pos[0]+d.dr,pos[1]+d.dc];
      if(blocked(cfg,...next)){collision=i+1;break;}
      pos.splice(0,2,...next);
      path.push(key(...pos));
    }
    return {cells:new Set(path),last:pos,collision};
  }
  function renderBoard(){
    const cfg=current(),walls=wallSet(cfg),planned=predicted();
    dom.board.style.setProperty("--cells",String(cfg.size));
    dom.board.setAttribute("aria-label","Tabuleiro de "+cfg.size+" por "+cfg.size+". "+dom.position.textContent);
    const fragment=document.createDocumentFragment();
    for(let r=0;r<cfg.size;r++){
      for(let c=0;c<cfg.size;c++){
        const cell=document.createElement("div"),k=key(r,c);
        cell.className="tile";
        const isWall=walls.has(k),isPlayer=same(state.pos,[r,c]);
        const goalIndex=cfg.goals.findIndex(g=>same(g.at,[r,c]));
        const isCurrent=goalIndex===state.targetIndex;
        if(isWall)cell.classList.add("is-wall");
        else if(state.visited.has(k))cell.classList.add("is-visited");
        if(planned.cells.has(k)&&cfg.mode==="plan")cell.classList.add("is-planned");
        if(goalIndex>=0&&goalIndex>=state.targetIndex)cell.classList.add("is-goal");
        if(goalIndex>=0&&goalIndex<state.targetIndex)cell.classList.add("is-passed");
        if(isPlayer){cell.classList.add("is-player");cell.textContent="R";}
        else if(goalIndex>=0&&!isWall){cell.textContent=String(goalIndex+1);cell.classList.add("goal-number");}
        else if(isWall){const stripe=document.createElement("span");stripe.className="wall-mark";stripe.setAttribute("aria-hidden","true");cell.appendChild(stripe);}
        let label="Linha "+(r+1)+", coluna "+(c+1);
        if(isWall)label+=": obstáculo";
        if(goalIndex>=0)label+=": "+cfg.goals[goalIndex].label;
        if(isPlayer)label+=": marcador atual";
        if(isCurrent&&goalIndex>=0)label+=": próximo objetivo";
        cell.setAttribute("aria-label",label);
        cell.setAttribute("role","img");
        fragment.appendChild(cell);
      }
    }
    dom.board.replaceChildren(fragment);
  }
  function renderPlan(){
    dom.sequence.replaceChildren();
    for(const move of state.plan){
      const chip=document.createElement("span");
      chip.className="plan-chip";chip.textContent=dirs[move].sign;
      chip.setAttribute("aria-label","Para "+dirs[move].word);
      dom.sequence.appendChild(chip);
    }
    if(!state.plan.length){
      dom.preview.textContent="Nenhum comando adicionado. Escolha uma seta.";
    }else{
      const pred=predicted();
      dom.preview.textContent=pred.collision
        ?"Atenção: o comando "+pred.collision+" encontra um limite ou obstáculo. Retire ou ajuste a sequência."
        :state.plan.length+" comando(s) preparados. A rota aparece marcada no tabuleiro.";
    }
    dom.execute.disabled=state.plan.length===0;
    dom.undo.disabled=state.plan.length===0;
    dom.clear.disabled=state.plan.length===0;
  }
  function render(){
    const cfg=current();
    dom.position.textContent="Posição: linha "+(state.pos[0]+1)+", coluna "+(state.pos[1]+1);
    dom.goal.textContent=state.done?"Concluído":"Destino: "+target().label;
    dom.count.textContent=state.steps+" movimento"+(state.steps===1?"":"s");
    renderBoard();
    renderPlan();
    if(state.done)finish();
  }
  function finish(){
    const cfg=current();
    let optimum=0,pos=cfg.start;
    for(const g of cfg.goals){
      const route=shortest(cfg,pos,g.at);
      if(!route)break;
      optimum+=route.length;pos=g.at;
    }
    dom.finish.hidden=false;
    dom.finishTitle.textContent="Caminho concluído!";
    dom.finishText.textContent="Você percorreu "+state.steps+" casa(s). Um percurso possível usa "+optimum+" movimento(s). Há diferentes maneiras de explorar o caminho.";
    dom.next.textContent=state.level<levels.length-1?"Explorar o próximo nível →":"Recomeçar a trilha ↺";
    announce("Caminho concluído! Se quiser, conte a alguém como escolheu seu trajeto.");
  }
  function direction(name){
    if(!dirs[name]||state.done)return;
    if(current().mode==="plan"){
      if(state.plan.length>=20){announce("O plano tem até 20 comandos. Execute uma parte e depois continue.");return;}
      state.plan.push(name);
      render();
      announce("Adicionado: "+dirs[name].word+". "+dom.preview.textContent);
      return;
    }
    const result=visit(name);
    render();
    if(result.blocked)announce("Há um limite ou obstáculo para "+dirs[name].word+". Tente outra direção.");
    else if(result.done)announce("Caminho concluído! Você chegou ao destino.");
    else announce("Movimento para "+dirs[name].word+". "+dom.position.textContent+".");
  }
  function runPlan(){
    if(!state.plan.length||state.done)return;
    const commands=[...state.plan];state.plan=[];
    let result,executed=0,checkpoint=false;
    for(const cmd of commands){
      result=visit(cmd);
      if(result.blocked||result.done)break;
      executed++;if(result.checkpoint)checkpoint=true;
    }
    render();
    if(result?.blocked)announce("O percurso parou em um obstáculo ou limite. Revise o próximo trecho.");
    else if(result?.done)announce("Caminho concluído! Você percorreu os destinos na ordem.");
    else if(checkpoint)announce("Ponto 1 encontrado! Agora planeje até a chegada 2.");
    else announce("Plano executado. "+dom.position.textContent+". Prepare o próximo trecho.");
  }
  document.querySelectorAll("[data-level]").forEach(btn=>btn.addEventListener("click",()=>newLevel(Number(btn.dataset.level))));
  document.querySelectorAll("[data-dir]").forEach(btn=>btn.addEventListener("click",()=>direction(btn.dataset.dir)));
  const keyboard={ArrowUp:"up",ArrowRight:"right",ArrowDown:"down",ArrowLeft:"left",w:"up",d:"right",s:"down",a:"left",W:"up",D:"right",S:"down",A:"left"};
  document.addEventListener("keydown",event=>{
    if(event.altKey||event.ctrlKey||event.metaKey||event.target?.closest?.("input,textarea,select,[contenteditable='true']"))return;
    const dir=keyboard[event.key];
    if(dir){event.preventDefault();direction(dir);}
  });
  dom.execute.addEventListener("click",runPlan);
  dom.undo.addEventListener("click",()=>{
    if(!state.plan.length)return;
    state.plan.pop();render();announce("Último comando retirado do plano.");
  });
  dom.clear.addEventListener("click",()=>{
    state.plan=[];render();announce("Plano apagado. Escolha novas direções.");
  });
  dom.hint.addEventListener("click",()=>{
    if(state.done)return;
    const route=shortest(current(),state.pos,target().at);
    if(!route){announce("Não foi possível encontrar uma rota.");return;}
    if(!route.length){announce("Você já está no destino.");return;}
    announce("Uma possibilidade é seguir para "+dirs[route[0]].word+". Você pode escolher outro caminho.");
  });
  dom.restart.addEventListener("click",()=>newLevel(state.level));
  dom.next.addEventListener("click",()=>newLevel((state.level+1)%levels.length));
  dom.calm.addEventListener("click",()=>{
    const on=document.body.classList.toggle("calm");
    dom.calm.setAttribute("aria-pressed",String(on));
    dom.calm.textContent=on?"✓ Modo tranquilo ativado":"Modo tranquilo";
  });
  if(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches){
    document.body.classList.add("calm");
    dom.calm.setAttribute("aria-pressed","true");
    dom.calm.textContent="✓ Modo tranquilo ativado";
  }
  newLevel(0);
})();