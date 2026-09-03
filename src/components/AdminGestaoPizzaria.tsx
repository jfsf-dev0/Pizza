import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PizzaFlavor } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  DollarSign, 
  Bike, 
  Settings, 
  Store, 
  PieChart, 
  Users, 
  Check, 
  X, 
  Save, 
  Sparkles,
  Flame,
  FileText
} from 'lucide-react';

export const AdminGestaoPizzaria: React.FC = () => {
  const { 
    pizzaFlavors, 
    pizzaSizes, 
    storeSettings, 
    setStoreSettings, 
    orders,
    logoutAdmin
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'precificacao' | 'relatorios' | 'motoboys' | 'configuracoes'>('precificacao');
  
  // Custom flavor price editor state
  const [flavorsList, setFlavorsList] = useState<PizzaFlavor[]>(pizzaFlavors);
  const [editingFlavor, setEditingFlavor] = useState<PizzaFlavor | null>(null);
  const [showAddFlavorModal, setShowAddFlavorModal] = useState(false);

  // New Flavor Form
  const [newFlavorName, setNewFlavorName] = useState('');
  const [newFlavorDesc, setNewFlavorDesc] = useState('');
  const [newFlavorPrices, setNewFlavorPrices] = useState({
    'size-broto': 35.00,
    'size-media': 45.00,
    'size-grande': 55.00,
    'size-gigante': 70.00,
  });

  // Drivers List State
  const [drivers, setDrivers] = useState([
    { id: 'drv-1', name: 'Carlos Silva', vehicle: 'Honda CG 160 • ABC-1234', phone: '(11) 98888-1111', active: true, deliveriesToday: 14 },
    { id: 'drv-2', name: 'Lucas Mendes', vehicle: 'Yamaha Factor • DEF-5678', phone: '(11) 97777-2222', active: true, deliveriesToday: 9 },
    { id: 'drv-3', name: 'Roberto Lima', vehicle: 'Shineray Worker • GHI-9012', phone: '(11) 96666-3333', active: false, deliveriesToday: 0 },
  ]);

  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverVehicle, setNewDriverVehicle] = useState('');

  // Handlers
  const handleToggleFlavorActive = (id: string) => {
    setFlavorsList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, is_active: !f.is_active } : f))
    );
  };

  const handleUpdatePrice = (flavorId: string, sizeId: string, price: number) => {
    setFlavorsList((prev) =>
      prev.map((f) => {
        if (f.id === flavorId) {
          return {
            ...f,
            prices: { ...f.prices, [sizeId]: price },
          };
        }
        return f;
      })
    );
  };

  const handleAddFlavor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlavorName) return;

    const newFlavorObj: PizzaFlavor = {
      id: 'flavor-' + Date.now(),
      category_id: 'cat-salgadas',
      name: newFlavorName,
      description: newFlavorDesc || 'Sabor artesanal preparado com ingredientes selecionados.',
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
      ingredients: ['molho de tomate', 'mussarela', 'orégano'],
      prices: newFlavorPrices,
      is_active: true,
      tags: ['Novo Sabor'],
    };

    setFlavorsList([newFlavorObj, ...flavorsList]);
    setNewFlavorName('');
    setNewFlavorDesc('');
    setShowAddFlavorModal(false);
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName) return;
    setDrivers([
      ...drivers,
      {
        id: 'drv-' + Date.now(),
        name: newDriverName,
        vehicle: newDriverVehicle || 'Moto padrão',
        phone: '(11) 99999-0000',
        active: true,
        deliveriesToday: 0,
      },
    ]);
    setNewDriverName('');
    setNewDriverVehicle('');
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-6xl mx-auto space-y-6">
      {/* Top Header Admin Pizzaria */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 text-white rounded-3xl p-6 shadow-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white text-2xl font-black shadow">
            🍕
          </div>
          <div>
            <span className="text-xs text-rose-400 font-extrabold uppercase tracking-wide">
              Módulo `adminpizzaria`
            </span>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              Gestão da Operação & Cardápio
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={logoutAdmin}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition"
          >
            Sair do Admin
          </button>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveSubTab('precificacao')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-2 ${
            activeSubTab === 'precificacao'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <Flame className="w-4 h-4" />
          Cardápio & Tabela de Preços
        </button>

        <button
          onClick={() => setActiveSubTab('relatorios')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-2 ${
            activeSubTab === 'relatorios'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <PieChart className="w-4 h-4" />
          Relatórios & Vendas
        </button>

        <button
          onClick={() => setActiveSubTab('motoboys')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-2 ${
            activeSubTab === 'motoboys'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <Bike className="w-4 h-4" />
          Gestão de Entregadores ({drivers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('configuracoes')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-2 ${
            activeSubTab === 'configuracoes'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          Parâmetros da Loja
        </button>
      </div>

      {/* SUB-TAB 1: CARDÁPIO & PRECIFICADOR */}
      {activeSubTab === 'precificacao' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg text-zinc-900">Preço dos Sabores por Tamanho</h3>
              <p className="text-xs text-zinc-500">Altere o preço de cada tamanho em tempo real</p>
            </div>

            <button
              onClick={() => setShowAddFlavorModal(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Novo Sabor de Pizza
            </button>
          </div>

          {/* Flavors Grid with Price Inputs */}
          <div className="space-y-4">
            {flavorsList.map((flavor) => (
              <div
                key={flavor.id}
                className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-3">
                    <img src={flavor.image_url} alt={flavor.name} className="w-12 h-12 rounded-2xl object-cover" />
                    <div>
                      <h4 className="font-extrabold text-base text-zinc-900">{flavor.name}</h4>
                      <p className="text-xs text-zinc-500 line-clamp-1">{flavor.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFlavorActive(flavor.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      flavor.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {flavor.is_active ? '✅ Ativo no Cardápio' : '⛔ Pausado'}
                  </button>
                </div>

                {/* Price Inputs per Size */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {pizzaSizes.map((size) => {
                    const currentPrice = flavor.prices[size.id] || 0;
                    return (
                      <div key={size.id} className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200/60">
                        <label className="text-[10px] font-extrabold uppercase text-zinc-500 block mb-1">
                          {size.name}
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                            R$
                          </span>
                          <input
                            type="number"
                            step="1.00"
                            value={currentPrice}
                            onChange={(e) =>
                              handleUpdatePrice(flavor.id, size.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-full pl-8 pr-2 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-black text-zinc-900 focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RELATÓRIOS & VENDAS */}
      {activeSubTab === 'relatorios' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-zinc-900 border-b border-zinc-100 pb-2">
              Resumo Operacional do Dia
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center">
                <span className="text-xs text-rose-700 font-bold block">Faturamento Bruto</span>
                <span className="text-2xl font-black text-rose-900 block mt-1">R$ 1.840,90</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
                <span className="text-xs text-emerald-700 font-bold block">Pedidos Pagos via Pix</span>
                <span className="text-2xl font-black text-emerald-900 block mt-1">100%</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
                <span className="text-xs text-amber-700 font-bold block">Tempo Médio de Saída</span>
                <span className="text-2xl font-black text-amber-900 block mt-1">18 min</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: GESTÃO DE MOTOBOYS */}
      {activeSubTab === 'motoboys' && (
        <div className="space-y-6">
          {/* Add Driver Form */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-zinc-900">Cadastrar Novo Entregador</h3>
            <form onSubmit={handleAddDriver} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newDriverName}
                onChange={(e) => setNewDriverName(e.target.value)}
                placeholder="Nome do Entregador"
                className="px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium"
              />
              <input
                type="text"
                value={newDriverVehicle}
                onChange={(e) => setNewDriverVehicle(e.target.value)}
                placeholder="Placa / Veículo (Ex: Honda CG 160)"
                className="px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium"
              />
              <button
                type="submit"
                className="bg-zinc-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-zinc-800 transition"
              >
                Cadastrar Motoboy
              </button>
            </form>
          </div>

          {/* Drivers List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {drivers.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-800 flex items-center justify-center text-xl">
                    🛵
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-zinc-900">{d.name}</h4>
                    <p className="text-xs text-zinc-500">{d.vehicle}</p>
                    <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
                      {d.deliveriesToday} entregas hoje
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setDrivers((prev) =>
                      prev.map((item) => (item.id === d.id ? { ...item, active: !item.active } : item))
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    d.active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {d.active ? 'Em Turno' : 'Fora'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CONFIGURAÇÕES */}
      {activeSubTab === 'configuracoes' && (
        <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-zinc-900 border-b border-zinc-100 pb-2">
            Parâmetros Globais da Pizzaria
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-zinc-700 block mb-1">Endereço da Loja</label>
              <input
                type="text"
                value={storeSettings.storeAddress}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-700 block mb-1">Telefone WhatsApp da Loja</label>
              <input
                type="text"
                value={storeSettings.storePhone}
                onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add New Flavor Modal */}
      {showAddFlavorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-extrabold text-base text-zinc-900">Novo Sabor de Pizza</h3>
              <button onClick={() => setShowAddFlavorModal(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFlavor} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Nome do Sabor</label>
                <input
                  type="text"
                  value={newFlavorName}
                  onChange={(e) => setNewFlavorName(e.target.value)}
                  placeholder="Ex: Pepperoni Especial"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Descrição</label>
                <textarea
                  value={newFlavorDesc}
                  onChange={(e) => setNewFlavorDesc(e.target.value)}
                  placeholder="Ingredientes e detalhes..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3.5 rounded-2xl text-xs transition"
              >
                Cadastrar Sabor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
