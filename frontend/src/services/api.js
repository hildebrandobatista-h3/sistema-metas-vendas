import axios from "axios";
import { useAuthStore } from "../store/auth.js";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e?.response?.status === 401) {
      useAuthStore.getState().deslogar();
    }
    return Promise.reject(e);
  }
);

export function msgErro(e) {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d) && d[0]?.msg) return d[0].msg;
  return "Ocorreu um erro. Tente novamente.";
}

export const login = (username, senha) =>
  api
    .post("/login", new URLSearchParams({ username, password: senha }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    .then((r) => r.data);

export const listarEmpresas = () => api.get("/empresas").then(r => r.data);
export const criarEmpresa = (nome) => api.post("/empresas", { nome }).then(r => r.data);
export const listarUnidades = (empresaId) =>
  api.get("/unidades", { params: empresaId ? { empresa_id: empresaId } : {} }).then(r => r.data);
export const criarUnidade = (empresa_id, nome) => api.post("/unidades", { empresa_id, nome }).then(r => r.data);
export const listarGerentes = (unidadeId) =>
  api.get("/gerentes", { params: unidadeId ? { unidade_id: unidadeId } : {} }).then(r => r.data);
export const criarGerente = (unidade_id, nome) => api.post("/gerentes", { unidade_id, nome }).then(r => r.data);
export const listarVendedores = (gerenteId) =>
  api.get("/vendedores", { params: gerenteId ? { gerente_id: gerenteId } : {} }).then(r => r.data);
export const criarVendedor = (gerente_id, nome, ref_externa) =>
  api.post("/vendedores", { gerente_id, nome, ref_externa: ref_externa || null }).then(r => r.data);
export const listarProdutos = () => api.get("/produtos").then(r => r.data);
export const criarProduto = (nome) => api.post("/produtos", { nome }).then(r => r.data);

export const cadastrarMetasLote = (vendedor_id, ano, mes, itens) =>
  api.post("/metas/lote", { vendedor_id, ano, mes, itens }).then(r => r.data);
export const listarMetas = (params) => api.get("/metas", { params }).then(r => r.data);

export const lancarRealizado = (payload) => api.post("/realizado", payload).then(r => r.data);
export const listarRealizado = (params) => api.get("/realizado", { params }).then(r => r.data);

export const buscarDashboard = (params) => api.get("/dashboard", { params }).then(r => r.data);

export default api;
