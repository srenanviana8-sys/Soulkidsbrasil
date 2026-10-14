"use strict";
/* Convites curtos, pré-gravados na voz da Ritinha aprovada. Nenhuma reprodução automática. */
(() => {
  const approved = new Set([
    "casa-entrada","casa-espelho","casa-calma","casa-historias",
    "jardim-entrada","jardim-trilha","jardim-espelho","jardim-ritmo"
  ]);
  let player = null;
  let active = null;
  // Impede que uma promessa antiga interrompa um novo toque no mesmo áudio.
  let playbackVersion = 0;
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
    playbackVersion++;
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
    player.addEventListener("ended", stop);
    player.addEventListener("error", stop);
    return player;
  }
  function toggle(key) {
    if (!approved.has(key)) return false;
    // Mesmo durante o carregamento, tocar novamente deve cancelar o áudio atual.
    if (active === key) {
      stop();
      return false;
    }
    stop();
    try {
      const audio = ensurePlayer();
      active = key;
      const version = playbackVersion;
      audio.src = "/audios/ritinha-" + key + ".mp3";
      const promise = audio.play();
      notify();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          if (playbackVersion === version && active === key) stop();
        });
      }
      return true;
    } catch (_) {
      stop();
      return false;
    }
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
  window.SoulKidsVozRitinha = { toggle, stop, isPlaying, subscribe };
})();