import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, AlertTriangle, X } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import type { Product, ProductCreate, ProductUpdate, ProductListResponse } from '../types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data: ProductListResponse = await getProducts({ search: search || undefined });
      setProducts(data.data);
      setTotal(data.total);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async (data: ProductCreate) => {
    await createProduct(data);
    setShowForm(false);
    fetchProducts();
  };

  const handleUpdate = async (id: number, data: ProductUpdate) => {
    await updateProduct(id, data);
    setEditProduct(null);
    setShowForm(false);
    fetchProducts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este produto?')) return;
    await deleteProduct(id);
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-sm text-gray-500">{total} produtos cadastrados</p>
        </div>
        <button
          onClick={() => { setEditProduct(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou SKU..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Produto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">SKU</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Categoria</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Preço</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Qtd.</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Carregando...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Nenhum produto encontrado</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {product.is_low_stock && <AlertTriangle size={14} className="text-red-500" />}
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{product.sku}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">{product.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${product.is_low_stock ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditProduct(product); setShowForm(true); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <ProductForm
          product={editProduct}
          onSubmit={editProduct
            ? (data) => handleUpdate(editProduct.id, data as ProductUpdate)
            : handleCreate
          }
          onClose={() => { setShowForm(false); setEditProduct(null); }}
        />
      )}
    </div>
  );
}

// ====== PRODUCT FORM MODAL ======

interface ProductFormProps {
  product: Product | null;
  onSubmit: (data: ProductCreate | ProductUpdate) => Promise<void>;
  onClose: () => void;
}

function ProductForm({ product, onSubmit, onClose }: ProductFormProps) {
  const [form, setForm] = useState<ProductCreate>({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    description: product?.description ?? '',
    category: product?.category ?? '',
    price: product?.price ?? 0,
    quantity: product?.quantity ?? 0,
    min_stock: product?.min_stock ?? 5,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.sku || !form.category) {
      setError('Preencha os campos obrigatórios');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await onSubmit(form);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } };
        setError(axiosErr.response?.data?.detail || 'Erro ao salvar');
      } else {
        setError('Erro ao salvar');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Nome *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">SKU *</label>
              <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} disabled={!!product}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none disabled:bg-gray-100" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Descrição</label>
            <input value={form.description ?? ''} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Categoria *</label>
              <input value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Preço</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: +e.target.value})}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Qtd. Inicial</label>
              <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: +e.target.value})}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Estoque Mínimo</label>
            <input type="number" value={form.min_stock} onChange={e => setForm({...form, min_stock: +e.target.value})}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none" />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Cancelar</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
            {submitting ? 'Salvando...' : product ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
}
