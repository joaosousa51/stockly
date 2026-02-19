import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import MovementsPage from './pages/MovementsPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/produtos" element={<ProductsPage />} />
        <Route path="/movimentacoes" element={<MovementsPage />} />
      </Routes>
    </div>
  );
}
