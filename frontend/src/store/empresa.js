import { create } from "zustand";

export const useEmpresaStore = create((set) => ({
  empresaId: null,
  setEmpresaId: (id) => set({ empresaId: id }),
}));
