import { useCallback } from 'react';

export function useAudioChime(soundUrl: string = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg') {
  const playChime = useCallback(() => {
    try {
      const audio = new Audio(soundUrl);
      audio.volume = 0.5;
      audio.play().catch(e => console.warn('Audio play blocked:', e));
    } catch (e) {
      console.warn('Audio creation failed:', e);
    }
  }, [soundUrl]);

  return { playChime };
}
