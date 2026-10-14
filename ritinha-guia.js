"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const message = $("guia-message");
  const action = $("guia-go");
  const mood = $("guia-mood");
  const avatar = $("guia-avatar");
  const voice = $("guia-voice");
  const motion = $("guia-motion");
  if (![message, action, mood, avatar, voice, motion].every(Boolean)) return;

  const choices = {
    jogos: {
      mood: "Bora explorar!",
      text: "Oba! O Mundo da Ritinha tem cinco lugares e seis jogos. Você pode começar por onde tiver mais vontade!",
      cta: "Escolher um lugar →",
      href: "#lugares"
    },
    missao: {
      mood: "Missão especial!",
      text: "Tenho uma ideia para a gente brincar fora da tela! Chame alguém para fazer a missão com você.",
      cta: "Descobrir a missão →",
      href: "#missao"
    },
    familias: {
      mood: "Vamos juntos!",
      text: "Os adultos também têm um cantinho especial com ideias para brincar, conversar e adaptar as atividades.",
      cta: "Ver espaço das famílias →",
      href: "/familias-soulkids.html"
    }
  };
  const characterPhrases = [
    "Oi! Eu sou a Ritinha. Às vezes fico tímida com novidades, mas gosto de descobrir as coisas no meu tempo. Quer explorar comigo?",
    "Cada pessoa brinca de um jeito. Você pode escolher, observar ou pedir ajuda. Aqui todo mundo participa!",
    "Tenho amigos que adoram aventuras. Que tal conhecer as brincadeiras da turma?",
    "Se alguma atividade parecer difícil, podemos tentar de outro jeito ou escolher outra. O importante é brincar!"
  ];
  let phraseIndex = 0;
  let voiceEnabled = false;
  let currentPhrase = characterPhrases[0];
  const supportedVoice = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
  function cancelVoice() {
    if (!supportedVoice) return;
    try { window.speechSynthesis.cancel(); } catch (_) { /* Texto permanece disponível */ }
  }
  function speak(text) {
    if (!supportedVoice || !voiceEnabled) return;
    cancelVoice();
    try {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 0.88;
      utterance.pitch = 1.06;
      window.speechSynthesis.speak(utterance);
    } catch (_) {
      voiceEnabled = false;
      syncVoice();
    }
  }
  function syncVoice() {
    voice.setAttribute("aria-pressed", String(voiceEnabled));
    voice.textContent = voiceEnabled ? "🔇 Desligar voz" : "🔊 Ativar voz";
  }
  function update({text, mood: tag, href, cta}) {
    currentPhrase = text;
    message.textContent = text;
    mood.textContent = tag;
    action.href = href;
    action.textContent = cta;
    speak(currentPhrase);
  }
  document.querySelectorAll("[data-guide-choice]").forEach(button => {
    button.addEventListener("click", () => {
      const choice = choices[button.dataset.guideChoice];
      if (!choice) return;
      document.querySelectorAll("[data-guide-choice]").forEach(other => {
        const active = other === button;
        other.classList.toggle("selected", active);
        other.setAttribute("aria-pressed", String(active));
      });
      update(choice);
    });
  });
  avatar.addEventListener("click", () => {
    phraseIndex = (phraseIndex + 1) % characterPhrases.length;
    document.querySelectorAll("[data-guide-choice]").forEach(button => {
      button.classList.remove("selected");
      button.setAttribute("aria-pressed", "false");
    });
    update({
      mood: "Uma ideia da Ritinha",
      text: characterPhrases[phraseIndex],
      cta: "Explorar meu mundo →",
      href: "#lugares"
    });
  });
  if (!supportedVoice) {
    voice.hidden = true;
  } else {
    syncVoice();
    voice.addEventListener("click", () => {
      voiceEnabled = !voiceEnabled;
      syncVoice();
      if (voiceEnabled) speak(currentPhrase);
      else cancelVoice();
    });
    window.addEventListener("pagehide", cancelVoice);
    document.addEventListener("visibilitychange", () => { if (document.hidden) cancelVoice(); });
  }
  let paused = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  function syncMotion() {
    $("guia-container").classList.toggle("motion-paused", paused);
    motion.setAttribute("aria-pressed", String(paused));
    motion.textContent = paused ? "▶️ Ativar animação" : "⏸️ Pausar animação";
  }
  motion.addEventListener("click", () => { paused = !paused; syncMotion(); });
  syncMotion();
})();
