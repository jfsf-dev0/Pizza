import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  Power, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  Store,
  Layers
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    orders, 
    pizzaFlavors, 
    products, 
    storeSettings, 
    setStoreSettings, 
    updateOrderStatus,
    setCurrentScreen,
    setActiveOrder 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu'>('overview');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [flavorList, setFlavorList] = useState(pizzaFlavors);

  // Financial Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const averageTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  const toggleFlavorStock = (id: string) => {
    setFlavorList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, is_active: !f.is_active } : f))
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilterStatus === 'all') return true;
    return o.status === orderFilterStatus;
  });

  return (
    <div className="pb-28 pt-4 px-4 max-w-6xl mx-auto space-y-6">
      {/* Top Admin Bar */}
      <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4 border border-zinc-800">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            📊 Painel de Gestão & Admin
          </h2>
          <p className="text-xs text-zinc-400">Visão Geral de Vendas e Controle de Operação</p>
        </div>

        {/* Store Open/Close Toggle */}
        <div className="flex items-center gap-3 bg-zinc-800 p-2.5 rounded-2xl border border-zinc-700">
          <span className="text-xs font-bold text-zinc-300">Status da Loja:</span>
          <button
            onClick={() => setStoreSettings((prev) => ({ ...prev, isOpen: !prev.isOpen }))}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              storeSettings.isOpen
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-rose-600 text-white shadow-md'
            }`}
          >
            <Power className="w-4 h-4" />
            {storeSettings.isOpen ? 'LOJA ABERTA' : 'LOJA FECHADA'}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'overview'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          Visão Geral (KPIs)
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'orders'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          Gestão de Pedidos ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'menu'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          Estoque & Cardápio
        </button>
      </div>

      {/* TAB 1: OVERVIEW KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold uppercase">Faturamento Hoje</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <span className="text-2xl font-black text-zinc-900 block">
                R$ {totalRevenue.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold">
                +14% em relação a ontem
              </span>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold uppercase">Total de Pedidos</span>
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <span className="text-2xl font-black text-zinc-900 block">{totalOrdersCount}</span>
              <span className="text-[11px] text-zinc-500 font-medium">100% Pix Aprovado</span>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold uppercase">Ticket Médio</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <span className="text-2xl font-black text-zinc-900 block">
                R$ {averageTicket.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-[11px] text-amber-700 font-medium">Ótima conversão</span>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold uppercase">Tempo Médio</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <span className="text-2xl font-black text-zinc-900 block">
                {storeSettings.deliveryTimeMinutes} min
              </span>
              <span className="text-[11px] text-blue-600 font-bold">Meta mantida</span>
            </div>
          </div>

          {/* Operational Controls Form */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-zinc-900 border-b border-zinc-100 pb-2">
              Configurações Operacionais Rápidas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Tempo Estimado Padrão de Entrega (Minutos)
                </label>
                <input
                  type="number"
                  value={storeSettings.deliveryTimeMinutes}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, deliveryTimeMinutes: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Taxa de Entrega (BRL)</label>
                <input
                  type="number"
                  step="0.50"
                  value={storeSettings.deliveryFee}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, deliveryFee: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT TABLE */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-extrabold text-sm text-zinc-900">Lista Geral de Pedidos</h3>

            {/* Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto">
              {['all', 'pending', 'preparing', 'out_for_delivery', 'delivered'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilterStatus(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition ${
                    orderFilterStatus === st
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {st === 'all' ? 'Todos' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 font-extrabold uppercase border-b border-zinc-100">
                <tr>
                  <th className="py-3 px-4">Pedido</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Valor Total</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-50/50">
                    <td className="py-3.5 px-4 font-black text-zinc-900">#{ord.orderNumber}</td>
                    <td className="py-3.5 px-4 font-medium text-zinc-700">{ord.customer.name}</td>
                    <td className="py-3.5 px-4 font-black text-rose-600">
                      R$ {ord.totalAmount.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                        Pix Pago
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-700 uppercase">{ord.status}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveOrder(ord);
                          setCurrentScreen('tracking');
                        }}
                        className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition inline-flex items-center gap-1 font-bold text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MENU & STOCK MANAGER */}
      {activeTab === 'menu' && (
        <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-zinc-900 border-b border-zinc-100 pb-2">
            Disponibilidade de Sabores (Pausa de Estoque)
          </h3>

          <div className="space-y-3">
            {flavorList.map((flavor) => (
              <div
                key={flavor.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80"
              >
                <div className="flex items-center gap-3">
                  <img src={flavor.image_url} alt={flavor.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h5 className="font-extrabold text-sm text-zinc-900">{flavor.name}</h5>
                    <span className="text-xs text-zinc-500">
                      A partir de R$ {flavor.prices['size-broto'].toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleFlavorStock(flavor.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    flavor.is_active
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-300 text-zinc-600'
                  }`}
                >
                  {flavor.is_active ? 'DISPONÍVEL' : 'PAUSADO/ESGOTADO'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
