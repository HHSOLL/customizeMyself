import { afterEach, describe, expect, it } from 'vitest';
import { useAvatarStore } from '../store/avatar.store';

const resetStore = () => {
  const { resetAll } = useAvatarStore.getState();
  resetAll();
};

describe('Avatar store physics and fit history', () => {
  afterEach(() => {
    resetStore();
  });

  it('toggles physics tier between L0 and L1', () => {
    const initialTier = useAvatarStore.getState().physicsTier;
    expect(initialTier).toBe('L0');

    useAvatarStore.getState().togglePhysicsTier();
    expect(useAvatarStore.getState().physicsTier).toBe('L1');

    useAvatarStore.getState().setPhysicsTier('L0');
    expect(useAvatarStore.getState().physicsTier).toBe('L0');
  });

  it('appends fit history and trims to 50 entries', () => {
    const store = useAvatarStore.getState();
    expect(store.fitHistory).toHaveLength(0);

    for (let i = 0; i < 55; i += 1) {
      store.appendFitHistory({
        timestamp: `2025-09-20T00:00:${String(i).padStart(2, '0')}.000Z`,
        garmentId: `garment_${i}`,
        tier: 'L0',
        message: `entry ${i}`,
      });
    }

    const history = useAvatarStore.getState().fitHistory;
    expect(history).toHaveLength(50);
    expect(history[0].garmentId).toBe('garment_5');
    expect(history.at(-1)?.garmentId).toBe('garment_54');
  });

  it('clears history via clearFitHistory', () => {
    const { appendFitHistory, clearFitHistory } = useAvatarStore.getState();
    appendFitHistory({
      timestamp: new Date().toISOString(),
      garmentId: 'demo',
      tier: 'L1',
      message: 'log',
    });

    expect(useAvatarStore.getState().fitHistory).toHaveLength(1);
    clearFitHistory();
    expect(useAvatarStore.getState().fitHistory).toHaveLength(0);
  });
});
