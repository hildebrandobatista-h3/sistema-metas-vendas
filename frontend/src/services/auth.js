import { api } from "./api";

export async function login(email, senha) {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", senha);
  const { data } = await api.post("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data; // { access_token, token_type }
}

export async function buscarUsuarioLogado() {
  const { data } = await api.get("/auth/me");
  return data;
}
