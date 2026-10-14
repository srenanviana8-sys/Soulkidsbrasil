"use strict";
/* Reprodução sob demanda, com 56 áudios locais: 8 convites + 48 falas das atividades.
   Sem voz sintetizada pelo navegador, sem reprodução automática, sem APIs pagas durante o uso. */
(() => {
  const invitations = new Set([
    "casa-entrada","casa-espelho","casa-calma","casa-historias",
    "jardim-entrada","jardim-trilha","jardim-espelho","jardim-ritmo"
  ]);
  const validKey = key => typeof key === "string" && (
    invitations.has(key) ||
    /^jardim-(trilha|espelho|ritmo)-[0-5]$/.test(key) ||
    /^casa-espelho-(feliz|triste|bravo|medo|calmo)-[0-2]$/.test(key) ||
    /^casa-historia-[0-4](?:-resposta-[01])?$/.test(key)
  );
  let player = null;
  let active = null;
  let signature = null;
  let queue = [];
  const listeners = new Set();

  function isPlaying(key) {
    return Boolean(player && active && !player.paused && (!key || active === key));
  }
  function notify() {
    for (const callback of listeners) {
      try { callback(active, isPlaying()); } catch (_) {}
    }
  }
  function stop() {
    queue = [];
    signature = null;
    if (player) {
      try { player.pause(); player.currentTime = 0; } catch (_) {}
    }
    active = null;
    notify();
  }
  function ensurePlayer() {
    if (player) return player;
    player = document.createElement("audio");
    player.preload = "none";
    player.setAttribute("aria-hidden", "true");
    player.addEventListener("ended", () => {
      if (queue.length) {
        const next = queue.shift();
        start(next);
      } else {
        stop();
      }
    });
    player.addEventListener("error", stop);
    return player;
  }
  function start(key) {
    try {
      const audio = ensurePlayer();
      active = key;
      audio.src = "/audios/ritinha-" + key + ".mp3";
      const result = audio.play();
      notify();
      if (result && typeof result.catch === "function") {
        result.catch(() => { if (active === key) stop(); });
      }
    } catch (_) {
      stop();
    }
  }
  function playSequence(keys) {
    const selected = Array.isArray(keys) ? keys : [keys];
    if (!selected.length || selected.length > 3 || !selected.every(validKey)) return false;
    const newSignature = selected.join("|");
    if (signature === newSignature && isPlaying()) {
      stop();
      return false;
    }
    stop();
    signature = newSignature;
    queue = selected.slice(1);
    start(selected[0]);
    return true;
  }
  function toggle(key) {
    return playSequence([key]);
  }
  function subscribe(callback) {
    listeners.add(callback);
    notify();
    return () => listeners.delete(callback);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
  window.addEventListener("pagehide", stop);
  window.SoulKidsVozRitinha = { toggle, playSequence, stop, isPlaying, subscribe };
})();