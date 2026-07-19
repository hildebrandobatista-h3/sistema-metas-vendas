import React, { useState, useEffect } from 'react';
import { useLancamentoRealizado } from './hooks/useLancamentoRealizado';
import api from '../../services/api';
import { Campo, Select, Botao } from '../../components/ui.jsx';

export default function LancarRealizadoPage({ filtros, onFiltroChange }) {
  const { realizados, loading, error, fetchRealizados, createRealizado, updateRealizado, deleteRealizado } = useLancamentoRealizado(filtros);

  const [formData, setFormData] = useState({
    produto_id: '',
    data_venda: new Date().toISOString().split('T')[0],
    valor: '',
    numero_oportunidade: '',
    numero_proposta: '',
    codigo_cliente: '',
    cnpj: '',
    razao_social: '',
    nome_fantasia: '',
    descricao: ''
  });

  const [produtos, setProdutos] = useState([]);
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Carregar produtos
  useEffect(() => {
    const loadProdutos = async () => {
      try {
        const response = await api.get('/produtos/');
        setProdutos(response.data);
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
      }
    };
    loadProdutos();
  }, []);

  // Carregar realizados ao montar
  useEffect(() => {
    fetchRealizados();
  }, [fetchRealizados]);

  const parseCurrency = (str) => {
    if (!str) return 0;
    const numeric = str.replace(/\D/g, '');
    return numeric ? parseInt(numeric, 10) / 100 : 0;
  };

  const formatarMoedaDisplay = (valor) => {
    if (!valor) return '';
    const numValue = typeof valor === 'string' ? parseCurrency(valor) : parseFloat(valor);
    return numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleValorChange = (e) => {
    setFormData({ ...formData, valor: formatarMoedaDisplay(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.produto_id || !formData.valor || !formData.data_venda) {
      showToast('❌ Preencha os campos obrigatórios (Produto, Data, Valor)', 'error');
      return;
    }

    if (!filtros.vendedor_id) {
      showToast('❌ Selecione um vendedor nos filtros', 'error');
      return;
    }

    const valoeNum = parseCurrency(formData.valor);

    const payload = {
      vendedor_id: parseInt(filtros.vendedor_id),
      produto_id: parseInt(formData.produto_id),
      empresa_id: parseInt(filtros.empresa_id) || 1,
      unidade_id: parseInt(filtros.unidade_id) || 1,
      gerente_id: parseInt(filtros.gerente_id) || 1,
      data_venda: formData.data_venda,
      valor: valoeNum,
      numero_oportunidade: formData.numero_oportunidade || null,
      numero_proposta: formData.numero_proposta || null,
      codigo_cliente: formData.codigo_cliente || null,
      cnpj: formData.cnpj || null,
      razao_social: formData.razao_social || null,
      nome_fantasia: formData.nome_fantasia || null,
      descricao: formData.descricao || null,
      periodo_id: filtros.mes ? parseInt(filtros.mes) : null
    };

    if (editingId) {
      const result = await updateRealizado(editingId, payload);
      if (result.success) {
        showToast('✅ Lançamento atualizado com sucesso', 'success');
        resetForm();
        setEditingId(null);
      } else {
        showToast(`❌ ${result.error}`, 'error');
      }
    } else {
      const result = await createRealizado(payload);
      if (result.success) {
        showToast('✅ Lançamento cadastrado com sucesso', 'success');
        resetForm();
      } else {
        showToast(`❌ ${result.error}`, 'error');
      }
    }
  };

  const handleEdit = (realizado) => {
    setFormData({
      produto_id: realizado.produto_id,
      data_venda: realizado.data_venda,
      valor: realizado.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      numero_oportunidade: realizado.numero_oportunidade || '',
      numero_proposta: realizado.numero_proposta || '',
      codigo_cliente: realizado.codigo_cliente || '',
      cnpj: realizado.cnpj || '',
      razao_social: realizado.razao_social || '',
      nome_fantasia: realizado.nome_fantasia || '',
      descricao: realizado.descricao || ''
    });
    setEditingId(realizado.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja deletar este lançamento?')) {
      const result = await deleteRealizado(id);
      if (result.success) {
        showToast('✅ Lançamento deletado com sucesso', 'success');
      } else {
        showToast(`❌ ${result.error}`, 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      produto_id: '',
      data_venda: new Date().toISOString().split('T')[0],
      valor: '',
      numero_oportunidade: '',
      numero_proposta: '',
      codigo_cliente: '',
      cnpj: '',
      razao_social: '',
      nome_fantasia: '',
      descricao: ''
    });
    setEditingId(null);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatarMoedaExibicao = (valor) => {
    return 'R$ ' + (valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  const getProdutoNome = (produtoId) => {
    const p = produtos.find(x => x.id === produtoId);
    return p ? p.nome : '-';
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: '6px',
          background: toast.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: toast.type === 'success' ? '#065f46' : '#991b1b',
          fontWeight: '600',
          fontSize: '14px'
        }}>
          {toast.message}
        </div>
      )}

      {/* FORMULÁRIO */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
          {editingId ? '✏️ Editar Lançamento' : '📊 Lançar Realizado'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Grid de Campos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <Campo label="Produto *">
              <Select
                value={formData.produto_id}
                onChange={(e) => setFormData({ ...formData, produto_id: e.target.value })}
              >
                <option value="">Selecione...</option>
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </Select>
            </Campo>

            <Campo label="Data da venda *">
              <input
                type="date"
                value={formData.data_venda}
                onChange={(e) => setFormData({ ...formData, data_venda: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </Campo>

            <Campo label="Valor *">
              <input
                type="text"
                placeholder="0,00"
                value={formData.valor}
                onChange={handleValorChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </Campo>

            <Campo label="N. da Oportunidade">
              <input
                type="text"
                placeholder="OPT-2026-001"
                value={formData.numero_oportunidade}
                onChange={(e) => setFormData({ ...formData, numero_oportunidade: e.target.value })}
                maxLength="10"
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </Campo>

            <Campo label="N. da Proposta">
              <input
                type="text"
                placeholder="PROP-2026-001"
                value={formData.numero_proposta}
                onChange={(e) => setFormData({ ...formData, numero_proposta: e.target.value })}
                maxLength="10"
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </Campo>

            <Campo label="Cód. do Cliente">
              <input
                type="text"
                placeholder="CLI-001"
                value={formData.codigo_cliente}
                onChange={(e) => setFormData({ ...formData, codigo_cliente: e.target.value })}
                maxLength="10"
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </Campo>

            <Campo label="CNPJ">
              <input
                type="text"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                maxLength="18"
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </Campo>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontWeight: '600', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '6px' }}>Razão Social</label>
              <input
                type="text"
                placeholder="Nome oficial da empresa"
                value={formData.razao_social}
                onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                maxLength="255"
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontWeight: '600', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '6px' }}>Nome Fantasia</label>
              <input
                type="text"
                placeholder="Nome comercial da empresa"
                value={formData.nome_fantasia}
                onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                maxLength="255"
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontWeight: '600', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '6px' }}>Descrição da Oportunidade</label>
              <textarea
                placeholder="Contrato mensal, renovação anual, sistema integrado..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                maxLength="255"
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', minHeight: '70px' }}
              />
            </div>
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <Botao type="submit" style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              {editingId ? '✏️ Atualizar' : '✅ Salvar lançamento'}
            </Botao>
            <Botao type="button" onClick={resetForm} style={{
              padding: '10px 20px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              🗑️ Limpar
            </Botao>
          </div>
        </form>
      </div>

      {/* TABELA GRID */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>📋 Lançamentos Cadastrados</h2>

        {loading && <p>⏳ Carregando...</p>}
        {error && <p style={{ color: '#991b1b' }}>❌ Erro: {error}</p>}

        {realizados.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>Nenhum lançamento cadastrado.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Data</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>N. Oportunidade</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>N. Proposta</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Cliente (CNPJ)</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Razão Social</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Produto</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Valor</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {realizados.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6', hover: { background: '#f9fafb' } }}>
                    <td style={{ padding: '12px' }}>{new Date(r.data_venda).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '12px' }}>{r.numero_oportunidade || '-'}</td>
                    <td style={{ padding: '12px' }}>{r.numero_proposta || '-'}</td>
                    <td style={{ padding: '12px' }}>{r.cnpj || '-'}</td>
                    <td style={{ padding: '12px' }}>{r.razao_social || '-'}</td>
                    <td style={{ padding: '12px' }}>{getProdutoNome(r.produto_id)}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'Monaco, monospace', fontWeight: '500' }}>
                      {formatarMoedaExibicao(r.valor)}
                    </td>
                    <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(r)}
                        style={{ padding: '4px 8px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        style={{ padding: '4px 8px', background: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {realizados.length > 0 && (
          <p style={{ marginTop: '16px', fontSize: '12px', color: '#9ca3af' }}>
            Total de lançamentos: <strong>{realizados.length}</strong> |
            Valor total: <strong>{formatarMoedaExibicao(realizados.reduce((sum, r) => sum + (parseFloat(r.valor) || 0), 0))}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
