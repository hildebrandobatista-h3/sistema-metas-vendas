import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';

export function useMetasDashboard(filtros) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!filtros.vendedor_id || !filtros.periodo_id) {
        setDados(null);
        setLoading(false);
        return;
      }

      const response = await api.get('/api/metas/dashboard', {
        params: {
          vendedor_id: filtros.vendedor_id,
          periodo_id: filtros.periodo_id,
          empresa_id: filtros.empresa_id,
          unidade_id: filtros.unidade_id
        }
      });

      if (!response.data) {
        throw new Error('Resposta inválida da API');
      }

      setDados(response.data);
    } catch (err) {
      console.error('Erro ao buscar dashboard:', err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Erro ao carregar dashboard'
      );
      setDados(null);
    } finally {
      setLoading(false);
    }
  }, [filtros.vendedor_id, filtros.periodo_id, filtros.empresa_id, filtros.unidade_id]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dados,
    loading,
    error,
    refetch: fetchDashboard
  };
}
