/**
 * Sound synthesis and browser notification manager
 * Uses Web Audio API for crisp, reliable audio cues without external file dependencies
 */

class NotificationService {
  constructor() {
    this.audioCtx = null;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Crisp motivational sound alerts
  playChime(type = 'focus') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'focus_start') {
        // Ascending alert
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'focus_complete') {
        // Dual chord tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'break_complete') {
        // Attention alert
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        // Standard click / toggle
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      console.warn('Audio playback not allowed or failed:', e);
    }
  }

  // Real Browser Notification Support Check & Request
  isNotificationSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermissionState() {
    if (!this.isNotificationSupported()) return 'unsupported';
    return Notification.permission;
  }

  async requestPermission() {
    if (!this.isNotificationSupported()) {
      return { supported: false, status: 'unsupported', message: 'Browser does not support the Web Notifications API.' };
    }
    try {
      const permission = await Notification.requestPermission();
      return { supported: true, status: permission };
    } catch (e) {
      return { supported: true, status: 'denied', error: e.message };
    }
  }

  sendNotification(title, body, tag = 'general') {
    if (!this.isNotificationSupported()) return false;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          tag,
          icon: '/favicon.ico'
        });
        return true;
      } catch (e) {
        console.warn('Notification error:', e);
        return false;
      }
    }
    return false;
  }
}

export const notificationService = new NotificationService();
