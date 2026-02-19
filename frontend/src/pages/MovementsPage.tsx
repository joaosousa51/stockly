import { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { getMovements, createMovement, getProducts } from '../services/api';
import { formatDateTime } from '../utils/helpers';
import type { Movement, MovementCreate, Product } from '../types';

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const data = await getMovements({ limit: 100 });
      setMovements(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovements(); }, []);

  const handleCreate = async (data: MovementCreate) => {
    await createMovement(data);
    setShowForm(false);
    fetchMovements();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Movimentações</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} /> Nova Movimentação
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Produto</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Quantidade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Observação</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Data</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Carregando...</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">Nenhuma movimentação registrada</td></tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        m.type === 'entrada'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {m.type === 'entrada' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                        {m.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{m.product_name ?? `#${m.product_id}`}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{m.quantity}</td>
                    <td className="px-4 py-3 text-gray-500">{m.notes || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(m.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <MovementForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
    </div>
  );
}

// ====== MOVEMENT FORM ======

interface MovementFormProps {
  onSubmit: (data: MovementCreate) => Promise<void>;
  onClose: () => void;
}

function MovementForm({ onSubmit, onClose }: MovementFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<MovementCreate>({
    product_id: 0,
    type: 'entrada',
    quantity: 1,
    notes: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getProducts({ limit: 100 }).then(data => {
      setProducts(data.data);
      if (data.data.length > 0) setForm(f => ({ ...f, product_id: data.data[0].id }));
    });
  }, []);

  const handleSubmit = async () => {
    if (!form.product_id || form.quantity <= 0) {
      setError('Selecione um produto e informe a quantidade');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await onSubmit(form);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(axiosErr.response?.data?.detail || 'Erro ao registrar');
      } else {
        setError('Erro ao registrar');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Nova Movimentação</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Produto *</label>
            <select value={form.product_id} onChange={e => setForm({...form, product_id: +e.target.value})}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none">
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Tipo *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as 'entrada' | 'saida'})}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none">
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Quantidade *</label>
              <input type="number" min={1} value={form.quantity} onChange={e => setForm({...form, quantity: +e.target.value})}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Observação</label>
            <input value={form.notes ?? ''} onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="Ex: Compra do fornecedor X"
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none" />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Cancelar</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
            {submitting ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
