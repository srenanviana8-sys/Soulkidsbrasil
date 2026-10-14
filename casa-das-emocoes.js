"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const nav = Array.from(document.querySelectorAll("[data-room-open]"));
  const panels = Array.from(document.querySelectorAll("[data-room-panel]"));
  const start = Array.from(document.querySelectorAll("[data-room-start]"));
  if (!nav.length || !panels.length) return;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const guide = $("guide-message");
  const voicePlayer = window.SoulKidsVozRitinha;
  const voiceButton = $("ritinha-ouvir");
  let currentRoom = null;
  const voiceClip = () => "casa-" + (currentRoom || "entrada");

  if (voiceButton && voicePlayer) {
    voicePlayer.subscribe(() => {
      const active = voicePlayer.isPlaying(voiceClip());
      voiceButton.setAttribute("aria-pressed", String(active));
      voiceButton.textContent = active ? "⏹ Parar a Ritinha" : "🔊 Ouvir a Ritinha";
      voiceButton.setAttribute("aria-label", active ? "Parar voz da Ritinha" : "Ouvir o convite da Ritinha");
    });
    voiceButton.addEventListener("click", () => {
      voicePlayer.toggle(voiceClip());
    });
  } else if (voiceButton) {
    voiceButton.hidden = true;
  }

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

  function openRoom(room, focus = false) {
    if (!roomPhrases[room]) return;
    voicePlayer?.stop();
    currentRoom = room;
    nav.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.roomOpen === room)));
    panels.forEach(panel => { panel.hidden = panel.dataset.roomPanel !== room; });
    guide.textContent = roomPhrases[room];
    rememberVisit();
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
      image: "/ritinha-feliz.webp?v=20261014-oficial", alt: "Ritinha sorrindo com alegria", title: "Feliz",
      situations: [
        ["A Ritinha sorriu na brincadeira.", "O que costuma trazer alegria para você?"],
        ["Luca terminou sua construção!", "De que jeito você gosta de comemorar uma descoberta?"],
        ["Maya chamou a turma para brincar.", "Como podemos dividir um momento alegre com alguém?"]
      ]
    },
    triste: {
      image: "/ritinha-triste.webp?v=20261014-oficial", alt: "Ritinha com expressão triste", title: "Triste",
      situations: [
        ["A Ritinha queria brincar mais.", "O que pode ajudar quando algo de que gostamos termina?"],
        ["O desenho de Luca rasgou.", "Você prefere companhia ou um tempinho quando fica triste?"],
        ["Lia está com saudade.", "O que podemos dizer ou fazer para acolher esse sentimento?"]
      ]
    },
    bravo: {
      image: "/ritinha-bravo.webp?v=20261014-oficial", alt: "Ritinha contrariada, com os braços cruzados", title: "Bravo",
      situations: [
        ["Pegaram o brinquedo de Lia.", "Como ela pode mostrar que não gostou sem machucar ninguém?"],
        ["A torre de Luca caiu.", "O que você gostaria de fazer antes de tentar novamente?"],
        ["A Ritinha ficou frustrada.", "Como podemos pedir ajuda quando a frustração aparece?"]
      ]
    },
    medo: {
      image: "/ritinha-medo.webp?v=20261014-oficial", alt: "Ritinha demonstrando receio", title: "Com medo",
      situations: [
        ["A Ritinha ficou insegura na porta.", "O que você gostaria de conhecer antes de entrar?"],
        ["Tonico se assustou com um som.", "Como podemos deixar o ambiente mais confortável?"],
        ["Lia não conhece esta brincadeira.", "É possível observar primeiro e participar depois?"]
      ]
    },
    calmo: {
      image: "/ritinha-calmo.webp?v=20261014-oficial", alt: "Ritinha tranquila, de olhos fechados", title: "Calmo",
      situations: [
        ["Ritinha encontrou seu cantinho.", "Que lugares fazem você se sentir confortável?"],
        ["Maya fez uma pausa.", "Como seu corpo mostra que precisa descansar?"],
        ["Tonico observou as estrelas.", "O que você gosta de observar quando quer tranquilidade?"]
      ]
    }
  };
  // As imagens aprovadas nesta etapa representam a Ritinha. Os exemplos podem incluir toda a turma.
  const counters = Object.fromEntries(Object.keys(emotions).map(k => [k, 0]));
  let feeling = null;
  let lastMirrorMessage = "";
  $("mirror-listen").disabled = true;
  if (!voicePlayer) {
    $("mirror-listen").hidden = true;
    $("story-listen").hidden = true;
  }

  function showFeeling(id, next = false) {
    const entry = emotions[id];
    if (!entry) return;
    voicePlayer?.stop();
    if (next || (id === feeling && feeling !== null)) counters[id] += 1;
    feeling = id;
    const [example, question] = entry.situations[counters[id] % entry.situations.length];
    const portrait = $("mirror-face");
    portrait.src = entry.image;
    portrait.alt = entry.alt;
    $("mirror-name").textContent = "Ritinha · " + entry.title;
    $("mirror-example").textContent = example;
    $("mirror-question").textContent = question;
    $("mirror-another").disabled = false;
    $("mirror-listen").disabled = false;
    lastMirrorMessage = example;
    document.querySelectorAll("[data-feeling]").forEach(b => {
      b.setAttribute("aria-pressed", String(b.dataset.feeling === id));
    });
    rememberVisit();
  }
  document.querySelectorAll("[data-feeling]").forEach(b =>
    b.addEventListener("click", () => showFeeling(b.dataset.feeling))
  );
  $("mirror-another").addEventListener("click", () => { if (feeling) showFeeling(feeling, true); });
  $("mirror-listen").addEventListener("click", () => {
    if (!voicePlayer || !feeling) return;
    voicePlayer.toggle("casa-espelho-" + feeling + "-" + (counters[feeling] % emotions[feeling].situations.length));
  });

  const calm = [
    ["Um instante só seu", "Vamos achar um lugar gostoso para descansar?"],
    ["Olhar e descobrir", "Encontre uma coisa de que você gosta."],
    ["Seu corpo tem um ritmo", "Olhe a flor. Ela se mexe devagar."],
    ["Uma pausa sensorial", "Qual cantinho faz você se sentir bem?"],
    ["Pedir o que precisa", "Você pode pedir uma pausa ou companhia."]
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
      text: "Ritinha ficou com medo de entrar numa sala nova.",
      choices: [
        ["Observar a sala primeiro", "Ritinha pode conhecer a sala aos poucos."],
        ["Entrar acompanhada", "Entrar acompanhada pode trazer segurança."]
      ]
    },
    {
      character: "Lia · O meu espaço",
      title: "Agora eu não quero!",
      text: "Lia disse não, e a turma respeitou a escolha!",
      choices: [
        ["Perguntar se ela prefere brincar depois", "Respeitar o tempo da Lia faz bem à turma."],
        ["Oferecer uma brincadeira lado a lado", "Brincar ao lado da Lia, sem forçar, também vale!"]
      ]
    },
    {
      character: "Tonico · Um jeito de participar",
      title: "O convite do Tonico",
      text: "Tonico apontou para uma peça do jogo.",
      choices: [
        ["Mostrar duas peças para ele escolher", "Dar duas opções ajuda Tonico a escolher."],
        ["Esperar e observar seu gesto", "Esperar o gesto do Tonico é escutar."]
      ]
    },
    {
      character: "Luca · A torre caiu",
      title: "Um castelo de blocos",
      text: "A torre de Luca caiu. Ele ficou chateado.",
      choices: [
        ["Perguntar se ele quer ajuda", "Perguntar se Luca quer ajuda é acolher."],
        ["Dar um tempinho antes de voltar", "Uma pausa pode ajudar antes de tentar."]
      ]
    },
    {
      character: "Maya · Vamos brincar juntos?",
      title: "A mesa da turma",
      text: "Maya chegou, mas as peças estão longe dela.",
      choices: [
        ["Perguntar onde ela prefere os materiais", "Pergunte à Maya onde colocar as peças."],
        ["Aproximar uma mesa acessível", "Uma mesa acessível inclui mais amigos!"]
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
      voicePlayer?.stop();
      $("story-feedback").textContent = data.choices[index][1];
      $("story-feedback").hidden = false;
      document.querySelectorAll("[data-story-choice]").forEach(b =>
        b.setAttribute("aria-pressed", String(Number(b.dataset.storyChoice) === index))
      );
      rememberVisit();
    });
  });
  $("story-next").addEventListener("click", () => {
    voicePlayer?.stop();
    storyIndex = (storyIndex + 1) % stories.length;
    renderStory();
    rememberVisit();
  });
  $("story-listen").addEventListener("click", () => {
    if (!voicePlayer) return;
    const clips = ["casa-historia-" + storyIndex];
    if (selectedStory !== null) clips.push("casa-historia-" + storyIndex + "-resposta-" + selectedStory);
    voicePlayer.playSequence(clips);
  });

  renderStory();
  const hash = window.location?.hash?.replace("#", "");
  if (roomPhrases[hash]) openRoom(hash);
})();
