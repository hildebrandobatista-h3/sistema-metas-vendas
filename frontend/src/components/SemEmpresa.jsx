import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function SemEmpresa() {
  const usuario = useAuthStore((s) => s.usuario);
  return (
    <div className="bg-surface border border-border rounded-xl p-6 max-w-md">
      <h2 className="text-lg mb-2">Nenhuma empresa cadastrada</h2>
      {usuario?.papel === "ADMIN" ? (
        <p className="text-sm text-ink-2">
          Cadastre a primeira empresa em{" "}
          <Link to="/admin" className="text-accent underline">
            Administração
          </Link>{" "}
          para começar.
        </p>
      ) : (
        <p className="text-sm text-ink-2">
          Peça para um administrador cadastrar a empresa antes de continuar.
        </p>
      )}
    </div>
  );
}
