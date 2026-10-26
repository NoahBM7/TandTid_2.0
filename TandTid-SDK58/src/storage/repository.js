import { isValidState } from "../domain/appointments.js";
export const STORAGE_KEY = "@tandtid/state/v2";

// Adapteren er AsyncStorage i appen. Testene kan bruge en hukommelsesadapter.
export function createRepository(adapter) {
  return {
    async load() {
      const raw = await adapter.getItem(STORAGE_KEY);
      if (raw === null) return null;
      const state = JSON.parse(raw);
      if (!isValidState(state)) throw new Error("Ugyldige gemte TandTid-data");
      return state;
    },
    async save(state) {
      if (!isValidState(state)) throw new Error("Ugyldig tilstand");
      await adapter.setItem(STORAGE_KEY, JSON.stringify(state));
    },
  };
}
