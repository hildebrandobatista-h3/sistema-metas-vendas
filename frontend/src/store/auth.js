import { create } from "zustand";

const CHAVE = "metas_auth";

function carregar() {
  try {
    const raw = localStorage.getItem(CHAVE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const salvo = carregar();

export const useAuthStore = create((set) => ({
  token: salvo?.token || null,
  perfil: salvo?.perfil || null,
  nome: salvo?.nome || null,

  logar: (token, perfil, nome) => {
    localStorage.setItem(CHAVE, JSON.stringify({ token, perfil, nome }));
    set({ token, perfil, nome });
  },

  deslogar: () => {
    localStorage.removeItem(CHAVE);
    set({ token: null, perfil: null, nome: null });
  },
}));
