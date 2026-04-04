// Web Audio API ile bip sesi
let audioContext: AudioContext | null = null;

export function initAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

export function playBeep(frequency: number = 800, duration: number = 0.15): void {
  try {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Ses çalınamadı:', error);
  }
}

export function playCountdownBeeps(): void {
  // Son 3 saniye için 3 bip sesi
  playBeep(1000, 0.1);
  setTimeout(() => playBeep(1000, 0.1), 1000);
  setTimeout(() => playBeep(1200, 0.2), 2000);
}
