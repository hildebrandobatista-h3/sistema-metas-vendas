import React, { useState, useEffect } from 'react';
import { useMetasDashboard } from './hooks/useMetasDashboard';
import KPICard from './components/KPICard';
import MetasComparativoTable from './components/MetasComparativoTable';
import BarChartMetasVsRealizado from './components/charts/BarChartMetasVsRealizado';
import PieChartDistribuicao from './components/charts/PieChartDistribuicao';
import LineChartTendencia from './components/charts/LineChartTendencia';
import { Campo, Select } from '../../components/ui.jsx';
import { listarEmpresas, listarUnidades, listarGerentes, listarVendedores } from '../../services/api.js';

const MESES = [["1","Jan"],["2","Fev"],["3","Mar"],["4","Abr"],["5","Mai"],["6","Jun"],["7","Jul"],["8","Ago"],["9","Set"],["10","Out"],["11","Nov"],["12","Dez"]];

export default function ConsultaMetasDashboard({ filtros, onFiltroChange }) {
  const [empresas, setEmpresas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [gerentes, setGerentes] = useState([]);
  const [vendedores, setVendedores] = useState([]);

  const { dados, loading, error, refetch } = useMetasDashboard(filtros);

  useEffect(() => {
    listarEmpresas().then(setEmpresas).catch(() => {});
  }, []);

  useEffect(() => {
    setUnidades([]);
    if (filtros.empresa_id) {
      listarUnidades(filtros.empresa_id).then(setUnidades).catch(() => {});
    }
  }, [filtros.empresa_id]);

  useEffect(() => {
    setGerentes([]);
    if (filtros.unidade_id) {
      listarGerentes(filtros.unidade_id).then(setGerentes).catch(() => {});
    }
  }, [filtros.unidade_id]);

  useEffect(() => {
    setVendedores([]);
    if (filtros.gerente_id) {
      listarVendedores(filtros.gerente_id).then(setVendedores).catch(() => {});
    }
  }, [filtros.gerente_id]);

  const formatarMoeda = (valor) => {
    return 'R$ ' + (valor || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div>
      {/* Filtros */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <Campo label="Empresa">
          <Select
            value={filtros.empresa_id}
            onChange={(e) => onFiltroChange({ empresa_id: e.target.value, unidade_id: "", gerente_id: "", vendedor_id: "" })}
          >
            <option value="">Selecione...</option>
            {empresas.map((x) => (
              <option key={x.id} value={x.id}>{x.nome}</option>
            ))}
          </Select>
        </Campo>
        <Campo label="Unidade">
          <Select
            value={filtros.unidade_id}
            disabled={!filtros.empresa_id}
            onChange={(e) => onFiltroChange({ unidade_id: e.target.value, gerente_id: "", vendedor_id: "" })}
          >
            <option value="">Selecione...</option>
            {unidades.map((x) => (
              <option key={x.id} value={x.id}>{x.nome}</option>
            ))}
          </Select>
        </Campo>
        <Campo label="Gerente">
          <Select
            value={filtros.gerente_id}
            disabled={!filtros.unidade_id}
            onChange={(e) => onFiltroChange({ gerente_id: e.target.value, vendedor_id: "" })}
          >
            <option value="">Selecione...</option>
            {gerentes.map((x) => (
              <option key={x.id} value={x.id}>{x.nome}</option>
            ))}
          </Select>
        </Campo>
        <Campo label="Vendedor">
          <Select
            value={filtros.vendedor_id}
            disabled={!filtros.gerente_id}
            onChange={(e) => onFiltroChange({ vendedor_id: e.target.value })}
          >
            <option value="">Selecione...</option>
            {vendedores.map((x) => (
              <option key={x.id} value={x.id}>{x.nome}</option>
            ))}
          </Select>
        </Campo>
        <Campo label="Período">
          <div style={{ display: 'flex', gap: '8px' }}>
            <Select value={filtros.mes} onChange={(e) => onFiltroChange({ mes: e.target.value })} style={{ flex: 1 }}>
              {MESES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
            <input
              type="number"
              style={{ width: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
              value={filtros.ano}
              onChange={(e) => onFiltroChange({ ano: e.target.value })}
            />
          </div>
        </Campo>
      </div>

      {/* Dashboard Content */}
      {loading && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Carregando dashboard...</p>
        </div>
      )}

      {error && (
        <div style={{
          padding: '20px',
          background: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#991b1b'
        }}>
          <strong>❌ Erro:</strong> {error}
          <br />
          <button
            onClick={refetch}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔄 Tentar Novamente
          </button>
        </div>
      )}

      {!loading && !error && (!dados || !dados.produtos || dados.produtos.length === 0) && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#9ca3af'
        }}>
          <p>Nenhum dado disponível para os filtros selecionados.</p>
        </div>
      )}

      {!loading && !error && dados && dados.produtos && dados.produtos.length > 0 && (
        <div style={{ padding: '20px' }}>
          {(() => {
            const { resumo, produtos, historico_30_dias } = dados;
            return (
              <>
                {produtos.some(p => p.nome === 'NREC' && p.percentual < 80) && (
        <div style={{
          background: '#fef2f2',
          borderLeft: '4px solid #ef4444',
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#7f1d1d'
        }}>
          <strong>⚠️ Alerta Crítico:</strong> NREC está {(100 - (produtos.find(p => p.nome === 'NREC')?.percentual || 0)).toFixed(0)}% abaixo da meta.
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <KPICard
          label="💰 Meta Total"
          value={formatarMoeda(resumo.meta_total)}
          meta={`${produtos.length} produtos`}
          trend="↔️ 0%"
          status="neutral"
        />
        <KPICard
          label="✅ Realizado"
          value={formatarMoeda(resumo.realizado_total)}
          meta="Até agora"
          trend={resumo.trend}
          status={resumo.percentual_atingimento >= 95 ? 'success' : resumo.percentual_atingimento >= 80 ? 'warning' : 'danger'}
        />
        <KPICard
          label="📊 % Atingimento"
          value={`${resumo.percentual_atingimento.toFixed(1)}%`}
          meta="Meta parcial"
          trend={resumo.percentual_atingimento >= 95 ? '✅ OK' : '⚠️ Atenção'}
          status={resumo.percentual_atingimento >= 95 ? 'success' : resumo.percentual_atingimento >= 80 ? 'warning' : 'danger'}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Comparação Meta vs Realizado</h3>
          <BarChartMetasVsRealizado dados={{ produtos }} />
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Distribuição do Realizado</h3>
          <PieChartDistribuicao dados={{ produtos }} />
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Tendência ao Longo do Mês</h3>
        <div style={{ height: '300px' }}>
          <LineChartTendencia dados={{ historico_30_dias }} />
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase' }}>Detalhe por Produto</h3>
        <MetasComparativoTable dados={{ produtos }} />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={refetch} style={{ padding: '8px 12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
          🔄 Atualizar
        </button>
        <button style={{ padding: '8px 12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
          📥 Exportar CSV
        </button>
        <button style={{ padding: '8px 12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
          📧 Enviar Email
        </button>
      </div>

              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
