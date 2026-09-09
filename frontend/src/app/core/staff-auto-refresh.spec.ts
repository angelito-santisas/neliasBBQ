import { TestBed } from '@angular/core/testing';
import { staffAutoRefresh } from './staff-auto-refresh';

describe('staffAutoRefresh', () => {
  afterEach(() => { TestBed.resetTestingModule(); vi.restoreAllMocks(); vi.useRealTimers(); });
  it('refreshes visible views and reconnects, skips hidden tabs, and cleans up', () => {
    vi.useFakeTimers();
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    const refresh = vi.fn();
    TestBed.runInInjectionContext(() => staffAutoRefresh(refresh));
    vi.advanceTimersByTime(15000);
    expect(refresh).toHaveBeenCalledTimes(1);
    hidden.mockReturnValue(true);
    vi.advanceTimersByTime(15000);
    expect(refresh).toHaveBeenCalledTimes(1);
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('online'));
    window.dispatchEvent(new Event('focus'));
    expect(refresh).toHaveBeenCalledTimes(4);
    TestBed.resetTestingModule();
    vi.advanceTimersByTime(15000);
    window.dispatchEvent(new Event('online'));
    expect(refresh).toHaveBeenCalledTimes(4);
  });
});
