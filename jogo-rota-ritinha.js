"use strict";
(() => {
  // História original para este jogo, sem inventar novos bordões ou vozes dos personagens.
  // Referência: docs/BIBLIA_PERSONAGENS_SOULKIDS.md
  const stages = [
    {
      name:"Cadê o Tonico?", size:4, start:[3,0], mode:"walk",
      walls:[{at:[2,1],icon:"💧",label:"poça de água"},{at:[1,2],icon:"🧸",label:"brinquedo no caminho"}],
      goals:[{at:[0,3],name:"Tonico",character:"tonico"}],
      speaker:"ritinha",story:"Cadê o Tonico? Vamos procurar!",
      rewardSpeaker:"ravi",reward:"Boa, jovem!",rewardDetail:"Tonico encontrou a Ritinha: toc, toc!",
      star:[1,0],dialogue:[{who:"Ritinha",say:"Tonico! Te achei!"},{who:"Tonico",say:"Toc, toc!"},{who:"Ravi",say:"Boa, jovem!"}],
      focus:"Explorar direções e reconhecer obstáculos"
    },
    {
      name:"O ovo do Luca!", size:5, start:[4,0], mode:"plan",
      walls:[{at:[1,1],icon:"🪵",label:"tronco"},{at:[2,1],icon:"🥚",label:"ovo de dinossauro"},{at:[3,3],icon:"🚧",label:"cones no caminho"}],
      goals:[{at:[0,4],name:"Luca",character:"luca"}],
      speaker:"ritinha",story:"Vamos achar o Luca! Pense no caminho.",
      rewardSpeaker:"luca",reward:"Meu ovo de dinossauro!",rewardDetail:"A Ritinha chegou até o Luca!",
      star:[2,0],dialogue:[{who:"Ritinha",say:"Luca! Vamos juntos?"},{who:"Luca",say:"Meu ovo de dinossauro!"}],
      focus:"Planejar uma sequência de movimentos"
    },
    {
      name:"A turma toda!", size:6, start:[5,0], mode:"plan",
      walls:[
        {at:[4,1],icon:"🟤",label:"lama"},
        {at:[4,3],icon:"🪵",label:"tronco caído"},
        {at:[3,3],icon:"🌧️",label:"chuva no caminho"},
        {at:[2,1],icon:"💧",label:"poça de água"},
        {at:[1,1],icon:"🌳",label:"árvore bloqueando o caminho"},
        {at:[1,4],icon:"⚽",label:"bola no caminho"}
      ],
      goals:[{at:[3,2],name:"Maya",character:"maya"},{at:[0,5],name:"Lia",character:"lia"}],
      speaker:"maya",story:"Primeiro eu, depois a Lia. Vamos juntos!",
      rewardSpeaker:"ritinha",reward:"A turma está reunida!",rewardDetail:"Cada um participou do seu jeito.",
      star:[4,0],dialogue:[{who:"Lia",say:"NÃO! Quero olhar primeiro."},{who:"Ritinha",say:"Tudo bem. A gente espera."},{who:"Lia",say:"Agora eu quero tentar."}],
      focus:"Sequenciar destinos e ajustar estratégias"
    }
  ];

  const directions = {
    up:{r:-1,c:0,label:"cima",arrow:"↑"},right:{r:0,c:1,label:"direita",arrow:"→"},
    down:{r:1,c:0,label:"baixo",arrow:"↓"},left:{r:0,c:-1,label:"esquerda",arrow:"←"}
  };
  const $ = id => document.getElementById(id);
  const ui={
    intro:$("intro-screen"),game:$("game-screen"),startSound:$("start-sound"),startQuiet:$("start-quiet"),
    board:$("adventure-board"),stageCount:$("stage-count"),stageTitle:$("stage-title"),
    speaker:$("speaker-name"),portrait:$("speaker-avatar"),line:$("story-line"),
    progress:$("story-progress"),target:$("target-label"),feedback:$("game-feedback"),
    controls:$("move-controls"),planArea:$("plan-area"),chips:$("plan-chips"),
    execute:$("execute-plan"),undo:$("undo-plan"),clear:$("clear-plan"),restart:$("restart-stage"),
    hint:$("hint-step"),sound:$("sound-toggle"),calm:$("calm-toggle"),
    finish:$("finish-overlay"),finishAvatar:$("finish-avatar"),finishTitle:$("finish-title"),
    finishQuote:$("finish-quote"),finishDetail:$("finish-detail"),next:$("continue-button"),
    hold:$("hold-next"),startOver:$("start-over"),print:$("print-guide"),
    music:$("music-toggle"),dialogue:$("meeting-dialogue"),meetingNote:$("meeting-note"),
    starBadge:$("star-badge"),starCount:$("star-count")
  };
  if(Object.values(ui).some(node=>!node))return;

  const coord = p => p[0]+","+p[1];
  const equal = (a,b) => a[0]===b[0]&&a[1]===b[1];
  const obstacleAt = (stage,r,c) => stage.walls.find(w=>equal(w.at,[r,c]));
  const inside = (stage,r,c) => r>=0&&c>=0&&r<stage.size&&c<stage.size;
  function shortestDirection(stage,start,goal){
    const queue=[{p:start,first:null}],seen=new Set([coord(start)]);
    for(let i=0;i<queue.length;i++){
      const here=queue[i];
      if(equal(here.p,goal))return here.first;
      for(const [name,d] of Object.entries(directions)){
        const next=[here.p[0]+d.r,here.p[1]+d.c],key=coord(next);
        if(!inside(stage,...next)||obstacleAt(stage,...next)||seen.has(key))continue;
        seen.add(key);
        queue.push({p:next,first:here.first||name});
      }
    }
    return null;
  }

  let state=null;
  let activeStage=0;
  let soundOn=false;
  let musicOn=false;
  let musicTimer=null;
  let musicStep=0;
  let audioContext=null;
  let footstepBuffer=null;
  let introVoice=null;
  let quietMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false;
  let transitionHold=false;
  let winningTimer=null;
  let timers=new Set();
  let runId=0;
  const playTime=310;
  // Trilha original da SoulKids, sintetizada no navegador. Não usa músicas de terceiros.
  const melodies=[
    [67,71,74,71,69,67,64,67,71,74,79,74,72,71,69,67],
    [62,66,69,74,73,69,66,64,62,69,74,78,76,73,69,66],
    [65,69,72,76,74,72,69,67,69,72,77,76,74,72,69,65]
  ];
  const bass=[48,50,53];

  const display = (name,text) => {
    ui.speaker.textContent=name;
    ui.line.textContent=text;
    const id=name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    ui.portrait.className="character-avatar speaker-avatar char-"+id;
  };
  const inform = text => {ui.feedback.textContent=text;};
  const current = () => stages[activeStage];

  function stopTimers(){
    for(const id of timers)clearTimeout(id);
    timers.clear();
    if(winningTimer!==null){clearTimeout(winningTimer);winningTimer=null;}
    runId++;
  }
  function later(ms,fn){
    const id=setTimeout(()=>{timers.delete(id);fn();},ms);
    timers.add(id);
    return id;
  }
  function stopVoice(){
    if(!introVoice)return;
    introVoice.pause();
    introVoice.currentTime=0;
  }
  function playApprovedIntro(){
    if(!soundOn||typeof Audio==="undefined")return;
    try{
      stopVoice();
      if(!introVoice){introVoice=new Audio("/audios/ritinha-jardim-trilha-2.mp3");introVoice.preload="none";}
      introVoice.currentTime=0;
      const promise=introVoice.play();
      promise?.catch?.(()=>{});
    }catch(_){}
  }
  function audioReady(){
    const API=window.AudioContext||window.webkitAudioContext;
    if(!API)return false;
    try{
      if(!audioContext)audioContext=new API();
      audioContext.resume?.().catch?.(()=>{});
      return true;
    }catch(_){return false;}
  }
  function tone(frequency,at,duration,volume=0.028,type="sine"){
    if(!soundOn||!audioContext)return;
    try{
      const osc=audioContext.createOscillator(),gain=audioContext.createGain();
      osc.type=type;osc.frequency.setValueAtTime(frequency,at);
      gain.gain.setValueAtTime(0.0001,at);
      gain.gain.exponentialRampToValueAtTime(volume,at+0.021);
      gain.gain.exponentialRampToValueAtTime(0.0001,at+duration);
      osc.connect(gain);gain.connect(audioContext.destination);
      osc.start(at);osc.stop(at+duration+0.025);
    }catch(_){}
  }
  function noteFrequency(midi){return 440*Math.pow(2,(midi-69)/12);}
  function stopMusic(){
    if(musicTimer!==null){clearTimeout(musicTimer);musicTimer=null;}
  }
  function musicBeat(){
    musicTimer=null;
    if(!soundOn||!musicOn||ui.game.hidden||document.hidden)return;
    if(!audioReady())return;
    const at=audioContext.currentTime;
    const sequence=melodies[activeStage]||melodies[0];
    const n=musicStep%sequence.length;
    // Timbre leve de xilofone e notas graves esparsas, sem música comercial.
    tone(noteFrequency(sequence[n]),at,.235,.009,"triangle");
    if(n%4===0)tone(noteFrequency(bass[activeStage]),at,.38,.006,"sine");
    if(n%8===4)tone(noteFrequency(sequence[n]-12),at,.16,.004,"sine");
    musicStep++;
    musicTimer=setTimeout(musicBeat,325);
  }
  function setMusic(value){
    musicOn=Boolean(value);
    ui.music.setAttribute("aria-pressed",String(musicOn));
    ui.music.textContent=musicOn?"🎵 Música ligada":"🎵 Música desligada";
    stopMusic();
    if(musicOn&&soundOn&&!ui.game.hidden){musicStep=0;musicBeat();}
  }
  function shoeStep(direction){
    if(!soundOn||!audioReady())return;
    const at=audioContext.currentTime;
    try{
      if(!footstepBuffer && audioContext.createBuffer){
        const sampleRate=audioContext.sampleRate||44100;
        footstepBuffer=audioContext.createBuffer(1,Math.floor(sampleRate*.095),sampleRate);
        const samples=footstepBuffer.getChannelData(0);
        for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*(1-i/samples.length);
      }
      if(footstepBuffer&&audioContext.createBufferSource){
        const src=audioContext.createBufferSource(),gain=audioContext.createGain();
        src.buffer=footstepBuffer;
        const filter=audioContext.createBiquadFilter?.();
        if(filter){filter.type="lowpass";filter.frequency.value=direction==="up"?730:direction==="down"?390:530;src.connect(filter);filter.connect(gain);}
        else src.connect(gain);
        gain.gain.setValueAtTime(0.0001,at);
        gain.gain.exponentialRampToValueAtTime(.032,at+.012);
        gain.gain.exponentialRampToValueAtTime(0.0001,at+.088);
        gain.connect(audioContext.destination);src.start(at);src.stop(at+.095);
      }
    }catch(_){}
    // O som do calçado tem um toque grave que acompanha cada casa,
    // incluindo cada passo de um percurso planejado.
    tone(direction==="up"?205:direction==="down"?132:165,at,.10,.014,"triangle");
  }
  function effect(kind,direction){
    if(!soundOn||!audioReady())return;
    const t=audioContext.currentTime;
    if(kind==="step")shoeStep(direction);
    else if(kind==="select")tone(510,t,.08,.016);
    else if(kind==="error"){tone(320,t,.14,.025,"triangle");tone(240,t+.11,.17,.021,"triangle");}
    else if(kind==="checkpoint"){tone(520,t,.13,.025);tone(650,t+.10,.17,.026);}
    else if(kind==="star"){tone(620,t,.12,.022);tone(830,t+.1,.22,.022);}
    else if(kind==="win"){tone(523,t,.14,.03);tone(659,t+.13,.14,.03);tone(784,t+.26,.22,.03);}
  }
  function setSound(value){
    soundOn=Boolean(value);
    ui.sound.setAttribute("aria-pressed",String(soundOn));
    ui.sound.textContent=soundOn?"🔊 Som ligado":"🔇 Som desligado";
    if(soundOn){
      audioReady();effect("select");
      setMusic(musicOn);
    }else{
      setMusic(false);stopVoice();
    }
  }
  function setInitialSound(enabled){
    // Entrar com som ativa trilha e efeitos; entrar sem som não carrega áudio.
    musicOn=Boolean(enabled);
    setSound(enabled);
  }

  function progress(){
    ui.progress.replaceChildren();
    for(let i=0;i<stages.length;i++){
      const step=document.createElement("span");
      step.className="progress-dot"+(i<activeStage?" is-complete":i===activeStage?" is-current":"");
      step.textContent=String(i+1);
      step.setAttribute("aria-label","Fase "+(i+1)+(i===activeStage?" atual":i<activeStage?" concluída":""));
      ui.progress.appendChild(step);
    }
  }
  function draw(){
    if(!state)return;
    const stage=current();
    ui.board.style.setProperty("--cells",String(stage.size));
    ui.board.setAttribute("aria-label","Mapa "+stage.size+" por "+stage.size+". Ritinha na linha "+(state.pos[0]+1)+", coluna "+(state.pos[1]+1)+". "+ui.target.textContent);
    const frag=document.createDocumentFragment();
    for(let r=0;r<stage.size;r++){
      for(let c=0;c<stage.size;c++){
        const cell=document.createElement("div");
        const pos=[r,c],obs=obstacleAt(stage,r,c),goalIdx=stage.goals.findIndex(g=>equal(g.at,pos));
        const person=equal(state.pos,pos);
        cell.className="board-tile";
        if(obs){
          cell.classList.add("obstacle");
          const icon=document.createElement("span");
          icon.className="obstacle-icon";icon.textContent=obs.icon;icon.setAttribute("aria-hidden","true");
          cell.appendChild(icon);
        }else if(person){
          cell.classList.add("player");
          const avatar=document.createElement("span");
          avatar.className="ritinha-token";avatar.setAttribute("aria-hidden","true");
          cell.appendChild(avatar);
        }else if(goalIdx>=0 && goalIdx>=state.goalIndex){
          cell.classList.add("goal");
          const avatar=document.createElement("span");
          avatar.className="character-avatar goal-avatar char-"+stage.goals[goalIdx].character;
          avatar.setAttribute("aria-hidden","true");
          cell.appendChild(avatar);
          if(stage.goals.length>1){
            const num=document.createElement("span");
            num.className="goal-index";num.textContent=String(goalIdx+1);
            cell.appendChild(num);
          }
        }else if(equal(stage.star,pos)&&!state.collected){
          cell.classList.add("star-tile");
          const shine=document.createElement("span");
          shine.className="star-token";shine.textContent="⭐";shine.setAttribute("aria-hidden","true");
          cell.appendChild(shine);
        }else if(state.visited.has(coord(pos))){
          cell.classList.add("visited");
          const steps=document.createElement("span");
          steps.className="footprints";steps.textContent="••";
          steps.setAttribute("aria-hidden","true");cell.appendChild(steps);
        }else if((r+c)%3===0){
          cell.classList.add("decorated");
        }
        const label="Linha "+(r+1)+", coluna "+(c+1)
          +(obs?", obstáculo: "+obs.label:"")
          +(person?", Ritinha":"")
          +(equal(stage.star,pos)&&!state.collected?", estrela para descobrir":"")
          +(goalIdx>=0?", "+stage.goals[goalIdx].name:"");
        cell.setAttribute("role","img");cell.setAttribute("aria-label",label);
        frag.appendChild(cell);
      }
    }
    ui.board.replaceChildren(frag);
  }
  function planDisplay(){
    ui.chips.replaceChildren();
    for(const name of state?.plan||[]){
      const chip=document.createElement("span");
      chip.className="command-chip";chip.textContent=directions[name].arrow;
      chip.setAttribute("aria-label",directions[name].label);
      ui.chips.appendChild(chip);
    }
    ui.execute.disabled=!state||state.locked||state.plan.length===0;
    ui.undo.disabled=!state||state.locked||state.plan.length===0;
    ui.clear.disabled=!state||state.locked||state.plan.length===0;
    for(const button of document.querySelectorAll("[data-dir]"))button.disabled=!state||state.locked;
  }
  function update(){
    if(!state)return;
    const stage=current(),goal=stage.goals[state.goalIndex];
    ui.target.textContent=goal?"🎯 "+goal.name:"✔ Amigos encontrados";
    ui.starCount.textContent=state.collected?"⭐ Achou!":"☆ Encontre a estrela";
    planDisplay();draw();
  }
  function startStage(index,retry=false){
    stopTimers();
    if(index>=stages.length)index=0;
    activeStage=index;document.body.dataset.stage=String(index+1);transitionHold=false;
    const stage=current();
    state={pos:[...stage.start],goalIndex:0,plan:[],locked:false,collected:false,visited:new Set([coord(stage.start)])};
    ui.meetingNote.hidden=true;
    musicStep=0;
    ui.game.hidden=false;ui.intro.hidden=true;ui.finish.hidden=true;
    ui.stageCount.textContent="FASE "+(index+1)+" / "+stages.length;
    ui.stageTitle.textContent=stage.name;
    ui.planArea.hidden=stage.mode!=="plan";
    display(stage.speaker==="ritinha"?"Ritinha":stage.speaker==="maya"?"Maya":stage.speaker,stage.story);
    progress();update();
    inform(retry?"Ops! Voltamos ao começo. Tente outro caminho.":"Vamos lá! Escolha uma seta.");
    if(!retry){effect("select");ui.board.focus?.({preventScroll:true});}
  }
  function fail(obstacle){
    if(!state||state.locked)return;
    state.locked=true;state.plan=[];stopVoice();effect("error");
    const where=obstacle?obstacle.label:"limite do caminho";
    display("Ritinha","Ops! "+where+". Vamos de novo?");
    inform("O caminho não deu certo. A fase vai recomeçar.");
    ui.board.classList.add("has-error");
    planDisplay();
    const index=activeStage;
    later(1050,()=>{
      ui.board.classList.remove("has-error");
      startStage(index,true);
    });
  }
  function win(){
    if(!state||state.locked)return;
    state.locked=true;state.plan=[];effect("win");planDisplay();
    const stage=current();
    ui.finish.hidden=false;
    ui.dialogue.replaceChildren();
    for(const item of stage.dialogue){
      const row=document.createElement("div");
      row.className="meeting-line";
      const avatar=document.createElement("span");
      avatar.className="character-avatar meeting-avatar char-"+item.who.toLowerCase();
      avatar.setAttribute("aria-hidden","true");
      const sentence=document.createElement("p");
      const who=document.createElement("strong");
      who.textContent=item.who+": ";
      sentence.appendChild(who);
      const words=document.createElement("span");words.textContent=item.say;
      sentence.appendChild(words);
      row.appendChild(avatar);row.appendChild(sentence);
      ui.dialogue.appendChild(row);
    }
    ui.starBadge.textContent=state.collected?"⭐ Estrela encontrada!":"✨ Você encontrou um amigo!";
    ui.finishAvatar.className="character-avatar finish-avatar char-"+stage.rewardSpeaker;
    ui.finishTitle.textContent=activeStage===2?"A turma está junta!":"Amigo encontrado!";
    ui.finishQuote.textContent=stage.reward;
    ui.finishDetail.textContent=stage.rewardDetail;
    ui.next.textContent=activeStage<stages.length-1?"Continuar agora →":"Jogar outra vez ↻";
    ui.hold.hidden=activeStage===stages.length-1;
    ui.hold.setAttribute("aria-pressed","false");
    ui.hold.textContent="⏸ Pausar avanço";
    inform("Fase concluída! "+stage.rewardDetail);
    ui.next.focus?.({preventScroll:true});
    if(activeStage<stages.length-1)scheduleWinNext();
  }
  function scheduleWinNext(){
    if(winningTimer!==null){clearTimeout(winningTimer);winningTimer=null;}
    if(transitionHold||!state?.locked||activeStage>=stages.length-1)return;
    winningTimer=setTimeout(()=>{winningTimer=null;nextStage();},quietMotion?4800:5500);
  }
  function nextStage(){
    if(winningTimer!==null){clearTimeout(winningTimer);winningTimer=null;}
    if(activeStage===stages.length-1){ui.intro.hidden=false;ui.game.hidden=true;ui.finish.hidden=true;stopTimers();stopVoice();ui.startSound.focus?.({preventScroll:true});return;}
    startStage(activeStage+1);
  }
  function move(name){
    const d=directions[name],stage=current();
    if(!d||!state||state.locked)return {ignored:true};
    const next=[state.pos[0]+d.r,state.pos[1]+d.c],obs=obstacleAt(stage,...next);
    if(!inside(stage,...next)||obs){fail(obs);return {error:true};}
    state.pos=next;state.visited.add(coord(next));effect("step",name);
    if(!state.collected&&equal(next,stage.star)){
      state.collected=true;effect("star");
      inform("⭐ Você encontrou uma estrela!");
    }
    const goal=stage.goals[state.goalIndex];
    if(equal(next,goal.at)){
      state.goalIndex++;
      if(state.goalIndex>=stage.goals.length){
        update();win();return {done:true};
      }
      display("Maya","Encontrei um caminho para todos!");
      ui.meetingNote.hidden=false;
      ui.meetingNote.textContent="Ritinha: Obrigada, Maya! Agora vamos procurar a Lia.";
      effect("checkpoint");inform("Maya encontrada! Agora encontre a Lia.");
      update();return {checkpoint:true};
    }
    update();
    if(!state.collected)inform("Ritinha avançou para "+d.label+".");
    return {moved:true};
  }
  function pressDirection(name){
    if(!state||state.locked||!directions[name])return;
    if(current().mode==="plan"){
      if(state.plan.length>=18){inform("O caminho já tem muitas setas. Toque em IR para testar.");return;}
      state.plan.push(name);effect("select");planDisplay();
    }else move(name);
  }
  function executePlan(){
    if(!state||state.locked||!state.plan.length)return;
    const commands=[...state.plan];state.plan=[];
    state.locked=true;planDisplay();
    const token=++runId;
    let i=0;
    const walk=()=>{
      if(token!==runId||!state)return;
      if(i>=commands.length){
        state.locked=false;planDisplay();inform("Agora escolha o próximo caminho.");return;
      }
      state.locked=false;
      const result=move(commands[i++]);
      if(result.error||result.done)return;
      if(i>=commands.length){
        state.locked=false;
        planDisplay();
        if(!result.checkpoint)inform("Agora escolha o próximo trecho.");
        return;
      }
      state.locked=true;planDisplay();
      later(quietMotion||document.body.classList.contains("calm")?50:playTime,walk);
    };
    walk();
  }
  function start(activateSound){
    setInitialSound(activateSound);
    startStage(0);
    if(activateSound&&musicOn)musicBeat();
    if(activateSound)playApprovedIntro();
  }
  ui.startSound.addEventListener("click",()=>start(true));
  ui.startQuiet.addEventListener("click",()=>start(false));
  ui.sound.addEventListener("click",()=>setSound(!soundOn));
  ui.music.addEventListener("click",()=>{
    if(!soundOn)setSound(true);
    setMusic(!musicOn);
  });
  ui.calm.addEventListener("click",()=>{
    const on=document.body.classList.toggle("calm");
    ui.calm.setAttribute("aria-pressed",String(on));
    ui.calm.textContent=on?"✓ Visual tranquilo":"🌿 Modo tranquilo";
  });
  if(quietMotion){
    document.body.classList.add("calm");ui.calm.setAttribute("aria-pressed","true");
    ui.calm.textContent="✓ Visual tranquilo";
  }
  document.querySelectorAll("[data-dir]").forEach(button=>{
    button.addEventListener("click",()=>pressDirection(button.dataset.dir));
  });
  ui.execute.addEventListener("click",executePlan);
  ui.undo.addEventListener("click",()=>{if(!state||state.locked)return;state.plan.pop();planDisplay();});
  ui.clear.addEventListener("click",()=>{if(!state||state.locked)return;state.plan=[];planDisplay();});
  ui.restart.addEventListener("click",()=>startStage(activeStage,true));
  ui.hint.addEventListener("click",()=>{
    if(!state||state.locked)return;
    const direction=shortestDirection(current(),state.pos,current().goals[state.goalIndex].at);
    if(direction){inform("Uma pista: tente ir para "+directions[direction].label+".");}
  });
  ui.next.addEventListener("click",nextStage);
  ui.hold.addEventListener("click",()=>{
    transitionHold=!transitionHold;
    ui.hold.setAttribute("aria-pressed",String(transitionHold));
    ui.hold.textContent=transitionHold?"▶ Retomar avanço":"⏸ Pausar avanço";
    scheduleWinNext();
  });
  ui.startOver.addEventListener("click",()=>{stopTimers();stopVoice();stopMusic();ui.game.hidden=true;ui.finish.hidden=true;ui.intro.hidden=false;ui.startSound.focus?.({preventScroll:true});});
  ui.print.addEventListener("click",()=>window.print());
  const keyNames={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};
  document.addEventListener("keydown",e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||e.target?.closest?.("input,textarea,select,[contenteditable='true']"))return;
    if(!e.target?.closest?.("#game-screen"))return;
    const d=keyNames[e.key];if(d){e.preventDefault();pressDirection(d);}
  });
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){
      stopVoice();stopMusic();
      if(winningTimer!==null){clearTimeout(winningTimer);winningTimer=null;transitionHold=true;ui.hold.textContent="▶ Retomar avanço";ui.hold.setAttribute("aria-pressed","true");}
    }else if(soundOn&&musicOn&&!ui.game.hidden){
      musicBeat();
    }
  });
  window.addEventListener("pagehide",()=>{stopTimers();stopVoice();stopMusic();});
})();