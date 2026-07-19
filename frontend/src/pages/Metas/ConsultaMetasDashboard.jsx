import React from 'react';
import { useMetasDashboard } from './hooks/useMetasDashboard';
import KPICard from './components/KPICard';
import MetasComparativoTable from './components/MetasComparativoTable';
import BarChartMetasVsRealizado from './components/charts/BarChartMetasVsRealizado';
import PieChartDistribuicao from './components/charts/PieChartDistribuicao';
import LineChartTendencia from './components/charts/LineChartTendencia';

export default function ConsultaMetasDashboard({ filtros }) {
  const { dados, loading, error, refetch } = useMetasDashboard(filtros);

  const formatarMoeda = (valor) => {
    return 'R$ ' + (valor || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!dados || !dados.produtos || dados.produtos.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#9ca3af'
      }}>
        <p>Nenhum dado disponível para os filtros selecionados.</p>
      </div>
    );
  }

  const { resumo, produtos, historico_30_dias } = dados;

  return (
    <div style={{ padding: '20px' }}>
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
    </div>
  );
}
