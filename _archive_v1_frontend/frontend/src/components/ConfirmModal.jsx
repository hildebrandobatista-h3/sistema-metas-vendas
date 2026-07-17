export default function ConfirmModal({ titulo, mensagem, confirmando, onConfirmar, onCancelar }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-surface border border-border rounded-xl p-5 max-w-sm w-full shadow-lg">
        <h3 className="text-sm font-semibold mb-2">{titulo}</h3>
        <p className="text-sm text-ink-2 mb-5">{mensagem}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={confirmando}
            className="border border-border-strong rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={confirmando}
            className="bg-critical text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {confirmando ? "Excluindo..." : "Confirmar exclusão"}
          </button>
        </div>
      </div>
    </div>
  );
}
