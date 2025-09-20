const TTSService = {
  async warmup() {
    try {
      // Try a lightweight backend TTS warmup call (ignored result)
      await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Hello', voice: 'default' }),
      });
    } catch (e) {
      // ignore errors; backend may not support warmup
      console.debug('TTS warmup failed', e);
    }
  },

  async speak(text) {
    // Primary: request backend TTS which returns audio blob
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('TTS request failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
      // revoke object URL after playback (best-effort)
      audio.addEventListener('ended', () => URL.revokeObjectURL(url));
      return;
    } catch (e) {
      // fallback: use Web Speech API if available
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utter = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
        return;
      }
      throw e;
    }
  },
};

export default TTSService;
