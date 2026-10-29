import { useStore } from './useStore.js';
import type { AppStoreState } from '../types/store';

/**
 * Type-safe selector hook for openGym's main Zustand store.
 * Provides autocompletion and static type inference for React components.
 */
export function useTypedStore<T>(selector: (state: AppStoreState) => T): T {
  return (useStore as any)(selector);
}

/**
 * Type-safe accessor for reading the current store snapshot outside React components.
 */
export function getTypedStore(): AppStoreState {
  return (useStore as any).getState();
}

/**
 * Type-safe state updater for the main store.
 */
export function setTypedStore(
  partial: Partial<AppStoreState> | ((state: AppStoreState) => Partial<AppStoreState>)
): void {
  (useStore as any).setState(partial);
}

export { useStore };

