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

export const listarUsuarios = (incluirInativos) =>
  api.get("/usuarios", { params: incluirInativos ? { incluir_inativos: true } : {} }).then(r => r.data);
export const criarUsuario = (payload) => api.post("/usuarios", payload).then(r => r.data);
export const redefinirSenhaUsuario = (id, senha) => api.patch(`/usuarios/${id}/senha`, { senha }).then(r => r.data);
export const inativarUsuario = (id) => api.delete(`/usuarios/${id}`).then(r => r.data);


export const editarEmpresa = (id, nome) => api.patch(`/empresas/${id}`, { nome }).then(r => r.data);
export const inativarEmpresa = (id) => api.delete(`/empresas/${id}`);
export const editarUnidade = (id, nome) => api.patch(`/unidades/${id}`, { nome }).then(r => r.data);
export const inativarUnidade = (id) => api.delete(`/unidades/${id}`);
export const editarGerente = (id, nome) => api.patch(`/gerentes/${id}`, { nome }).then(r => r.data);
export const inativarGerente = (id) => api.delete(`/gerentes/${id}`);
export const editarVendedor = (id, nome, ref_externa) => api.patch(`/vendedores/${id}`, { nome, ref_externa: ref_externa || null }).then(r => r.data);
export const inativarVendedor = (id) => api.delete(`/vendedores/${id}`);
export const editarProduto = (id, nome) => api.patch(`/produtos/${id}`, { nome }).then(r => r.data);
export const inativarProduto = (id) => api.delete(`/produtos/${id}`);


export default api;
export async function replicarMetas(vendedorId, periodoOrigemId, periodosDestinoIds, sobrescreverConflitos = false) {
  try {
    const response = await api.post("/metas/replicar", {
      vendedor_id: vendedorId,
      periodo_origem_id: periodoOrigemId,
      periodos_destino_ids: periodosDestinoIds,
      sobrescrever_conflitos: sobrescreverConflitos,
    })
    return { status: response.status, data: response.data }
  } catch (error) {
    if (error.response) {
      return { status: error.response.status, data: error.response.data }
    }
    throw error
  }
}

// Integrações com sistemas externos
export const listarParamIntegracao = () =>
  api.get("/integracao/params").then(r => r.data);

export const obterParamIntegracao = (id) =>
  api.get(`/integracao/params/${id}`).then(r => r.data);

export const criarParamIntegracao = (payload) =>
  api.post("/integracao/params", payload).then(r => r.data);

export const editarParamIntegracao = (id, payload) =>
  api.patch(`/integracao/params/${id}`, payload).then(r => r.data);

export const inativarParamIntegracao = (id) =>
  api.delete(`/integracao/params/${id}`);

export const testarConexaoIntegracao = (payload) =>
  api.post("/integracao/params/testar-conexao", payload).then(r => r.data);
export const editarUsuario = (id, payload) => api.patch(`/usuarios/${id}`, payload).then(r => r.data);

export const buscarBreakdownProdutos = (params) =>
  api.get("/dashboard/breakdown-produtos", { params }).then(r => r.data);
