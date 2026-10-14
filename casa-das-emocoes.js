"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const nav = Array.from(document.querySelectorAll("[data-room-open]"));
  const panels = Array.from(document.querySelectorAll("[data-room-panel]"));
  const start = Array.from(document.querySelectorAll("[data-room-start]"));
  if (!nav.length || !panels.length) return;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const speechReady = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
  const guide = $("guide-message");
  const roomPhrases = {
    espelho: "Vamos descobrir os sentimentos? Você pode escolher um rostinho e brincar comigo!",
    calma: "Esse cantinho é para encontrar conforto. Você escolhe o que faz bem para você.",
    historias: "Trouxe histórias dos nossos amigos! Você pode escolher caminhos diferentes para cada uma."
  };
  const stampKey = "soulkids-mundo-ritinha-v1";

  function rememberVisit() {
    try {
      const data = JSON.parse(localStorage.getItem(stampKey) || "{}");
      const existing = Array.isArray(data.zones) ? data.zones.filter(x => typeof x === "string") : [];
      const zones = [...new Set([...existing, "emocoes"])].slice(-6);
      localStorage.setItem(stampKey, JSON.stringify({
        zones,
        completed: Array.isArray(data.completed) ? data.completed : []
      }));
    } catch (_) {
      // O jogo funciona mesmo sem armazenamento local.
    }
  }

  function cancelSpeech() {
    if (!speechReady) return;
    try { window.speechSynthesis.cancel(); } catch (_) {}
  }
  function speak(content) {
    if (!speechReady || !content) return;
    cancelSpeech();
    try {
      const phrase = new window.SpeechSynthesisUtterance(content);
      phrase.lang = "pt-BR";
      phrase.rate = 0.88;
      phrase.pitch = 1.02;
      window.speechSynthesis.speak(phrase);
    } catch (_) {}
  }
  if (!speechReady) {
    ["mirror-listen", "story-listen"].forEach(id => { if ($(id)) $(id).hidden = true; });
  }

  function openRoom(room, focus = false) {
    if (!roomPhrases[room]) return;
    nav.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.roomOpen === room)));
    panels.forEach(panel => { panel.hidden = panel.dataset.roomPanel !== room; });
    guide.textContent = roomPhrases[room];
    rememberVisit();
    cancelSpeech();
    const panel = $("painel-" + room);
    panel.scrollIntoView?.({behavior: reducedMotion ? "auto" : "smooth", block: "start"});
    if (focus) {
      const title = panel.querySelector("h3");
      if (title) {
        title.tabIndex = -1;
        title.focus?.({preventScroll: true});
      }
    }
  }
  nav.forEach(b => b.addEventListener("click", () => openRoom(b.dataset.roomOpen, true)));
  start.forEach(b => b.addEventListener("click", () => openRoom("espelho", true)));

  const emotions = {
    feliz: {
      icon: "😊", title: "Feliz",
      situations: [
        ["A Ritinha descobriu uma brincadeira nova e deu um sorriso.", "O que costuma trazer alegria para você?"],
        ["Luca terminou uma construção e quis mostrar para a turma.", "De que jeito você gosta de comemorar uma descoberta?"],
        ["Um amigo chamou a turma para brincar junto.", "Como podemos dividir um momento alegre com alguém?"]
      ]
    },
    triste: {
      icon: "😢", title: "Triste",
      situations: [
        ["A brincadeira terminou antes de a Ritinha querer parar.", "O que pode ajudar quando algo de que gostamos termina?"],
        ["Um desenho de Luca rasgou sem querer.", "Você prefere companhia ou um tempinho quando fica triste?"],
        ["Um amigo sentiu saudade de alguém importante.", "O que podemos dizer ou fazer para acolher esse sentimento?"]
      ]
    },
    bravo: {
      icon: "😠", title: "Bravo",
      situations: [
        ["Lia ficou irritada quando outra pessoa pegou seu brinquedo.", "Como ela pode mostrar que não gostou sem machucar ninguém?"],
        ["Uma torre caiu e Luca precisou começar de novo.", "O que você gostaria de fazer antes de tentar novamente?"],
        ["O jogo não aconteceu como a Ritinha imaginou.", "Como podemos pedir ajuda quando a frustração aparece?"]
      ]
    },
    medo: {
      icon: "😟", title: "Com medo",
      situations: [
        ["Ritinha viu uma sala diferente e ficou insegura na porta.", "O que você gostaria de conhecer antes de entrar?"],
        ["Tonico ouviu um som alto e se assustou.", "Como podemos deixar o ambiente mais confortável?"],
        ["Uma criança ficou receosa de começar uma atividade nova.", "É possível observar primeiro e participar depois?"]
      ]
    },
    calmo: {
      icon: "😌", title: "Calmo",
      situations: [
        ["A Ritinha encontrou um cantinho aconchegante com almofadas.", "Que lugares fazem você se sentir confortável?"],
        ["O grupo fez uma pausa entre duas brincadeiras.", "Como seu corpo mostra que precisa descansar?"],
        ["Tonico ficou olhando calmamente para as estrelas da janela.", "O que você gosta de observar quando quer tranquilidade?"]
      ]
    }
  };
  const counters = Object.fromEntries(Object.keys(emotions).map(k => [k, 0]));
  let feeling = null;
  let lastMirrorMessage = "";

  function showFeeling(id, next = false) {
    const entry = emotions[id];
    if (!entry) return;
    if (next || (id === feeling && feeling !== null)) counters[id] += 1;
    feeling = id;
    const [example, question] = entry.situations[counters[id] % entry.situations.length];
    $("mirror-face").textContent = entry.icon;
    $("mirror-name").textContent = entry.title;
    $("mirror-example").textContent = example;
    $("mirror-question").textContent = question;
    $("mirror-another").disabled = false;
    lastMirrorMessage = entry.title + ". " + example + " " + question;
    document.querySelectorAll("[data-feeling]").forEach(b => {
      b.setAttribute("aria-pressed", String(b.dataset.feeling === id));
    });
    rememberVisit();
  }
  document.querySelectorAll("[data-feeling]").forEach(b =>
    b.addEventListener("click", () => showFeeling(b.dataset.feeling))
  );
  $("mirror-another").addEventListener("click", () => { if (feeling) showFeeling(feeling, true); });
  $("mirror-listen").addEventListener("click", () => speak(lastMirrorMessage || "Escolha um rostinho para descobrir uma emoção."));

  const calm = [
    ["Um instante só seu", "Você pode escolher um lugar tranquilo, uma almofada ou a companhia de alguém de confiança."],
    ["Olhar e descobrir", "Se quiser, procure três coisas de que gosta ao seu redor. Pode apontar, olhar ou imaginar."],
    ["Seu corpo tem um ritmo", "Se for confortável, respire devagar. Se não quiser, podemos apenas observar nossa flor brilhante."],
    ["Uma pausa sensorial", "Você prefere menos barulho, uma luz mais suave, um objeto macio ou ficar perto de alguém?"],
    ["Pedir o que precisa", "Você pode dizer, apontar ou mostrar: quero ajuda, quero companhia, quero descansar ou quero continuar."]
  ];
  let calmIndex = 0;
  function showCalm() {
    $("calm-step-title").textContent = calm[calmIndex][0];
    $("calm-step-text").textContent = calm[calmIndex][1];
    rememberVisit();
  }
  $("calm-next").addEventListener("click", () => {
    calmIndex = (calmIndex + 1) % calm.length;
    showCalm();
  });
  const glow = $("calm-glow");
  const pause = $("calm-pause");
  if (reducedMotion) {
    glow.classList.add("is-paused");
    pause.disabled = true;
    pause.textContent = "Movimento reduzido";
  } else {
    pause.addEventListener("click", () => {
      const paused = pause.getAttribute("aria-pressed") !== "true";
      pause.setAttribute("aria-pressed", String(paused));
      pause.textContent = paused ? "▶️ Retomar movimento" : "⏸ Pausar movimento";
      glow.classList.toggle("is-paused", paused);
    });
  }

  const stories = [
    {
      character: "Ritinha · A chegada",
      title: "Uma porta diferente",
      text: "A Ritinha chegou a um lugar novo, mas ficou insegura para entrar. Ela apertou a mão do adulto que estava com ela.",
      choices: [
        ["Observar a sala primeiro", "Boa ideia! A Ritinha pode conhecer o lugar aos poucos, sem pressa."],
        ["Entrar acompanhada", "Ter alguém de confiança por perto também pode ajudar a Ritinha a se sentir segura."]
      ]
    },
    {
      character: "Lia · O meu espaço",
      title: "Agora eu não quero!",
      text: "Lia estava brincando e um amigo pediu para participar. Ela respondeu: “Não!”. O amigo ficou surpreso.",
      choices: [
        ["Perguntar se ela prefere brincar depois", "Respeitar o momento de Lia ajuda a turma a combinar outra oportunidade."],
        ["Oferecer uma brincadeira lado a lado", "Uma proposta sem obrigação pode criar espaço para brincarem juntos, se Lia quiser."]
      ]
    },
    {
      character: "Tonico · Um jeito de participar",
      title: "O convite do Tonico",
      text: "Tonico chegou e ficou olhando um jogo. Ele não disse muitas palavras, mas se aproximou e apontou para uma peça.",
      choices: [
        ["Mostrar duas peças para ele escolher", "Dar opções ajuda a turma a entender o que Tonico está comunicando."],
        ["Esperar e observar seu gesto", "Dar tempo também é uma forma de escutar e respeitar a comunicação do Tonico."]
      ]
    },
    {
      character: "Luca · A torre caiu",
      title: "Um castelo de blocos",
      text: "Luca construiu uma torre bem alta. Ela caiu de repente. Luca ficou chateado e afastou os blocos.",
      choices: [
        ["Perguntar se ele quer ajuda", "Oferecer ajuda sem obrigar Luca permite que ele escolha como continuar."],
        ["Dar um tempinho antes de voltar", "Fazer uma pausa é uma possibilidade quando a frustração aparece."]
      ]
    },
    {
      character: "Maya · Vamos brincar juntos?",
      title: "A mesa da turma",
      text: "Maya chegou com seu andador para uma brincadeira na mesa. Alguns materiais estavam longe do alcance dela.",
      choices: [
        ["Perguntar onde ela prefere os materiais", "Ouvir Maya ajuda a organizar a brincadeira para que ela participe com autonomia."],
        ["Aproximar uma mesa acessível", "Pensar no espaço e nas adaptações permite que mais pessoas brinquem juntas."]
      ]
    }
  ];
  let storyIndex = 0;
  let selectedStory = null;
  function renderStory() {
    const data = stories[storyIndex];
    $("story-character").textContent = data.character;
    $("story-title").textContent = data.title;
    $("story-text").textContent = data.text;
    document.querySelectorAll("[data-story-choice]").forEach(button => {
      const index = Number(button.dataset.storyChoice);
      button.textContent = data.choices[index][0];
      button.setAttribute("aria-pressed", "false");
    });
    const fb = $("story-feedback");
    fb.textContent = "";
    fb.hidden = true;
    selectedStory = null;
  }
  document.querySelectorAll("[data-story-choice]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.storyChoice);
      const data = stories[storyIndex];
      if (!data.choices[index]) return;
      selectedStory = index;
      $("story-feedback").textContent = data.choices[index][1];
      $("story-feedback").hidden = false;
      document.querySelectorAll("[data-story-choice]").forEach(b =>
        b.setAttribute("aria-pressed", String(Number(b.dataset.storyChoice) === index))
      );
      rememberVisit();
    });
  });
  $("story-next").addEventListener("click", () => {
    storyIndex = (storyIndex + 1) % stories.length;
    renderStory();
    rememberVisit();
  });
  $("story-listen").addEventListener("click", () => {
    const data = stories[storyIndex];
    speak(data.title + ". " + data.text + (selectedStory === null ? "" : " " + data.choices[selectedStory][1]));
  });

  renderStory();
  const hash = window.location?.hash?.replace("#", "");
  if (roomPhrases[hash]) openRoom(hash);
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelSpeech(); });
  window.addEventListener("pagehide", cancelSpeech);
})();
