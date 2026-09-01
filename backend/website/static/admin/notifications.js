(() => {
  let lastSignature = null;
  let audioReady = false;

  const armAudio = () => {
    audioReady = true;
    document.removeEventListener('pointerdown', armAudio);
    document.removeEventListener('keydown', armAudio);
  };

  const playNotificationSound = () => {
    if (!audioReady) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.42);
    gain.connect(context.destination);
    [740, 980].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start(context.currentTime + index * 0.11);
      oscillator.stop(context.currentTime + 0.34 + index * 0.11);
    });
    window.setTimeout(() => context.close(), 700);
  };

  const refreshNotifications = async () => {
    try {
      const response = await fetch('/admin/notifications/feed/', {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!response.ok) return;
      const data = await response.json();
      const badges = document.querySelectorAll('.admin-notification-count');
      badges.forEach((badge) => {
        badge.textContent = String(data.count);
        badge.hidden = data.count === 0;
      });
      const signature = data.items[0]?.url || '';
      if (lastSignature !== null && signature && signature !== lastSignature) {
        playNotificationSound();
      }
      lastSignature = signature;
    } catch {
      // Admin remains fully usable while polling is temporarily unavailable.
    }
  };

  document.addEventListener('pointerdown', armAudio, { once: true });
  document.addEventListener('keydown', armAudio, { once: true });
  document.addEventListener('DOMContentLoaded', () => {
    refreshNotifications();
    window.setInterval(refreshNotifications, 8000);
  });
})();
