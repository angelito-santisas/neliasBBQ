import { DestroyRef, inject } from '@angular/core';

// Call in the component's injection context; listeners live only as long as its view.
export function staffAutoRefresh(refresh: () => void): void {
  const destroyRef = inject(DestroyRef);
  const onVisible = () => { if (!document.hidden) refresh(); };
  const timer = setInterval(onVisible, 15000);
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', onVisible);
  window.addEventListener('online', onVisible);
  destroyRef.onDestroy(() => {
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisible);
    window.removeEventListener('focus', onVisible);
    window.removeEventListener('online', onVisible);
  });
}
