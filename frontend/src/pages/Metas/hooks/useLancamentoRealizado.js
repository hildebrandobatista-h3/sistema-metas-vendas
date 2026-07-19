import { useState, useCallback } from 'react';
import api from '../../../services/api';

export function useLancamentoRealizado(filtros) {
  const [realizados, setRealizados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRealizados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!filtros.vendedor_id) {
        setRealizados([]);
        setLoading(false);
        return;
      }

      const params = { vendedor_id: filtros.vendedor_id };
      if (filtros.periodo_id) {
        params.periodo_id = filtros.periodo_id;
      }

      const response = await api.get('/realizados/', { params });
      setRealizados(response.data);
    } catch (err) {
      console.error('Erro ao buscar realizados:', err);
      setError(err.response?.data?.detail || err.message || 'Erro ao carregar realizados');
    } finally {
      setLoading(false);
    }
  }, [filtros.vendedor_id, filtros.periodo_id]);

  const createRealizado = useCallback(async (dados) => {
    try {
      const response = await api.post('/realizados/', dados);

      if (response.data.success) {
        await fetchRealizados();
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      return { success: false, error: errorMsg };
    }
  }, [fetchRealizados]);

  const updateRealizado = useCallback(async (id, dados) => {
    try {
      const response = await api.patch(`/realizados/${id}`, dados);

      if (response.data.success) {
        await fetchRealizados();
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      return { success: false, error: errorMsg };
    }
  }, [fetchRealizados]);

  const deleteRealizado = useCallback(async (id) => {
    try {
      const response = await api.delete(`/realizados/${id}`);

      if (response.data.success) {
        await fetchRealizados();
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      return { success: false, error: errorMsg };
    }
  }, [fetchRealizados]);

  return {
    realizados,
    loading,
    error,
    fetchRealizados,
    createRealizado,
    updateRealizado,
    deleteRealizado
  };
}
