import { Package, Boxes, AlertTriangle, DollarSign, ArrowDown, ArrowUp } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getDashboardStats, getLowStockProducts, getRecentMovements } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import type { DashboardStats, Product, Movement } from '../types';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

function StatCard({ label, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-fadeIn">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon size={20} className={color} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats } = useApi<DashboardStats>(getDashboardStats);
  const { data: lowStock } = useApi<Product[]>(getLowStockProducts);
  const { data: recent } = useApi<Movement[]>(getRecentMovements);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Produtos" value={stats?.total_products ?? '—'} icon={Package} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard label="Itens em Estoque" value={stats?.total_quantity ?? '—'} icon={Boxes} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Estoque Baixo" value={stats?.low_stock_count ?? '—'} icon={AlertTriangle} color="text-red-600" bg="bg-red-50" />
        <StatCard label="Valor Total" value={stats ? formatCurrency(stats.total_value) : '—'} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Entradas Hoje" value={stats?.entries_today ?? '—'} icon={ArrowDown} color="text-green-600" bg="bg-green-50" />
        <StatCard label="Saídas Hoje" value={stats?.exits_today ?? '—'} icon={ArrowUp} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" /> Estoque Baixo
          </h2>
          {lowStock && lowStock.length > 0 ? (
            <div className="space-y-3">
              {lowStock.map((p: Product) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.sku} · {p.category}</p>
                  </div>
                  <span className="text-sm font-bold text-red-600">{p.quantity} un.</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Nenhum produto com estoque baixo</p>
          )}
        </div>

        {/* Recent Movements */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Movimentações Recentes</h2>
          {recent && recent.length > 0 ? (
            <div className="space-y-3">
              {recent.map((m: Movement) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      m.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {m.type === 'entrada'
                        ? <ArrowDown size={16} className="text-green-600" />
                        : <ArrowUp size={16} className="text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.product_name}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(m.created_at)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${m.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                    {m.type === 'entrada' ? '+' : '-'}{m.quantity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Nenhuma movimentação registrada</p>
          )}
        </div>
      </div>
    </div>
  );
}
