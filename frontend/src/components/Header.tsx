import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowLeftRight, Box } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/produtos', icon: Package, label: 'Produtos' },
  { to: '/movimentacoes', icon: ArrowLeftRight, label: 'Movimentações' },
];

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Box size={18} className="text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-gray-900">
            Stock<span className="text-indigo-600">ly</span>
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
