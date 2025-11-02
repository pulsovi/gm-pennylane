import { sleep } from "./time.js";

export const beep = (() => {
  const queue: { duration: number; frequency: number; volume: number }[] = [];

  let handled = false;
  const handle = async () => {
    if (handled) return;
    handled = true;
    while (true) {
      if (queue.length) {
        const { duration, frequency, volume } = queue.shift()!;
        await _beep(duration, frequency, volume);
      }
      await sleep(500);
    }
  };
  ["click", "mousedown", "mouseup", "touchstart", "touchend", "keydown"].forEach((event) =>
    document.addEventListener(event, handle, { once: true })
  );

  return function beep(duration = 200, frequency = 600, volume = 0.5) {
    queue.push({ duration, frequency, volume });
  };

  async function _beep(duration = 200, frequency = 1000, volume = 0.5) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Volume initial à 0 pour le fondu d’entrée
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);

    // Fondu d’entrée sur 10 ms
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);

    // Maintient le volume pendant presque toute la durée
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime + (duration - 20) / 1000);

    // Fondu de sortie sur les 10 dernières ms
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration / 1000);

    await sleep(duration);
  }
})();
