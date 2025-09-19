import { registerSW } from 'virtual:pwa-register';

const SHOW_RELOAD_INTERVAL = 10_000;

export function enablePWA(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const updateSW = registerSW({ immediate: true });

  let refreshNotified = false;
  const notifyUpdate = () => {
    if (refreshNotified) {
      return;
    }

    refreshNotified = true;
    if (window.confirm('새로운 버전이 준비되었습니다. 지금 새로고침할까요?')) {
      updateSW().catch((error) => {
        console.error('Service worker update failed', error);
      });
    } else {
      setTimeout(() => {
        refreshNotified = false;
      }, SHOW_RELOAD_INTERVAL);
    }
  };

  document.addEventListener('sw.updated', notifyUpdate);
}
