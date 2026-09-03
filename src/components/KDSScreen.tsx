import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { 
  Clock, 
  ChefHat, 
  Flame, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  Bike, 
  Store,
  Check
} from 'lucide-react';

export const KDSScreen: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString('pt-BR'));
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleItemDone = (key: string) => {
    setCompletedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const newOrders = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'out_for_delivery');

  return (
    <div className="pb-28 pt-4 px-4 max-w-7xl mx-auto space-y-6">
      {/* Top KDS Header */}
      <div className="bg-zinc-900 text-white rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4 border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white text-2xl font-black shadow">
            🍳
          </div>
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              KDS - Painel da Cozinha
              <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Ao Vivo
              </span>
            </h2>
            <p className="text-xs text-zinc-400">Monitoramento e Expedição de Pedidos</p>
          </div>
        </div>

        {/* Metrics & Clock */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 font-extrabold uppercase block">Hora Atual</span>
            <span className="text-xl font-mono font-black text-amber-400">{time}</span>
          </div>

          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-3 rounded-2xl border transition ${
              isAudioMuted
                ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                : 'bg-rose-600 text-white border-rose-500 shadow-md'
            }`}
          >
            {isAudioMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Kanban Layout - 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: NOVOS PEDIDOS */}
        <div className="space-y-4">
          <div className="bg-amber-500 text-zinc-950 px-4 py-3 rounded-2xl font-black text-sm flex items-center justify-between shadow-md">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              NOVOS PEDIDOS ({newOrders.length})
            </span>
            <span className="bg-zinc-950 text-amber-400 text-xs px-2 py-0.5 rounded-full font-mono">
              ENTRADA
            </span>
          </div>

          <div className="space-y-4">
            {newOrders.map((order) => (
              <KDSTicketCard
                key={order.id}
                order={order}
                columnColor="border-amber-400"
                actionLabel="Iniciar Preparo ➔"
                onAction={() => updateOrderStatus(order.id, 'preparing')}
                completedItems={completedItems}
                onToggleItem={toggleItemDone}
              />
            ))}
            {newOrders.length === 0 && <EmptyColumnText text="Nenhum novo pedido na fila." />}
          </div>
        </div>

        {/* Column 2: EM PREPARAÇÃO */}
        <div className="space-y-4">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl font-black text-sm flex items-center justify-between shadow-md">
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 animate-pulse" />
              EM PREPARAÇÃO ({preparingOrders.length})
            </span>
            <span className="bg-white text-blue-700 text-xs px-2 py-0.5 rounded-full font-mono">
              NO FORNO
            </span>
          </div>

          <div className="space-y-4">
            {preparingOrders.map((order) => (
              <KDSTicketCard
                key={order.id}
                order={order}
                columnColor="border-blue-500"
                actionLabel="Marcar como Pronto ✅"
                onAction={() => updateOrderStatus(order.id, 'out_for_delivery')}
                completedItems={completedItems}
                onToggleItem={toggleItemDone}
              />
            ))}
            {preparingOrders.length === 0 && <EmptyColumnText text="Nenhuma pizza no forno no momento." />}
          </div>
        </div>

        {/* Column 3: PRONTOS PARA EXPEDIÇÃO */}
        <div className="space-y-4">
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl font-black text-sm flex items-center justify-between shadow-md">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              PRONTOS / EXPEDIÇÃO ({readyOrders.length})
            </span>
            <span className="bg-white text-emerald-700 text-xs px-2 py-0.5 rounded-full font-mono">
              EXPEDIÇÃO
            </span>
          </div>

          <div className="space-y-4">
            {readyOrders.map((order) => (
              <KDSTicketCard
                key={order.id}
                order={order}
                columnColor="border-emerald-500"
                actionLabel="Finalizar / Entregue"
                onAction={() => updateOrderStatus(order.id, 'delivered')}
                completedItems={completedItems}
                onToggleItem={toggleItemDone}
              />
            ))}
            {readyOrders.length === 0 && <EmptyColumnText text="Nenhum pedido aguardando retirada." />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Ticket Component for KDS
interface KDSTicketCardProps {
  order: Order;
  columnColor: string;
  actionLabel: string;
  onAction: () => void;
  completedItems: Record<string, boolean>;
  onToggleItem: (key: string) => void;
}

const KDSTicketCard: React.FC<KDSTicketCardProps> = ({
  order,
  columnColor,
  actionLabel,
  onAction,
  completedItems,
  onToggleItem,
}) => {
  // Elapsed time calculation
  const elapsedMinutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);

  // Badge color based on urgency
  let timerBadge = 'bg-emerald-100 text-emerald-800';
  if (elapsedMinutes > 25) {
    timerBadge = 'bg-rose-600 text-white animate-bounce';
  } else if (elapsedMinutes > 15) {
    timerBadge = 'bg-amber-100 text-amber-800';
  }

  return (
    <div className={`bg-white rounded-3xl p-5 border-2 ${columnColor} shadow-md space-y-4 transition hover:shadow-lg`}>
      {/* Ticket Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div>
          <span className="text-3xl font-black text-zinc-900 block leading-none">#{order.orderNumber}</span>
          <span className="text-xs text-zinc-500 font-bold mt-1 block">{order.customer.name}</span>
        </div>

        <div className="text-right space-y-1">
          <span className={`inline-block text-xs font-mono font-black px-2.5 py-1 rounded-full ${timerBadge}`}>
            ⏱ {elapsedMinutes} min
          </span>
          <div className="flex justify-end">
            <span className="text-[10px] bg-zinc-100 text-zinc-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              {order.orderType === 'delivery' ? <Bike className="w-3 h-3" /> : <Store className="w-3 h-3" />}
              {order.orderType === 'delivery' ? 'Delivery' : 'Balcão'}
            </span>
          </div>
        </div>
      </div>

      {/* Items Checklist */}
      <div className="space-y-2.5">
        {order.items.map((item, idx) => {
          const itemKey = `${order.id}-item-${idx}`;
          const isDone = !!completedItems[itemKey];

          return (
            <div
              key={idx}
              onClick={() => onToggleItem(itemKey)}
              className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                isDone ? 'bg-zinc-100 border-zinc-200 text-zinc-400 line-through' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                  isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-zinc-300'
                }`}
              >
                {isDone && <Check className="w-3.5 h-3.5" />}
              </div>

              <div className="flex-1 text-xs">
                <span className="font-black text-sm">
                  {item.quantity}x {item.type === 'pizza' ? `Pizza ${item.pizzaSize?.name}` : item.product?.name}
                </span>

                {item.type === 'pizza' && (
                  <div className="mt-1 font-semibold space-y-0.5 text-zinc-700">
                    <p>Sabores: {item.pizzaFlavors?.map((f) => f.name).join(' / ')}</p>
                    <p>Borda: {item.pizzaCrust?.name}</p>
                  </div>
                )}

                {item.notes && (
                  <p className="mt-1 bg-amber-100 text-amber-900 p-1.5 rounded-lg font-black text-[11px] uppercase">
                    ⚠️ OBS: {item.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button CTA */}
      <button
        onClick={onAction}
        className="w-full bg-zinc-900 hover:bg-rose-600 text-white font-extrabold py-3 px-4 rounded-2xl text-xs shadow transition flex items-center justify-center gap-2"
      >
        <span>{actionLabel}</span>
      </button>
    </div>
  );
};

const EmptyColumnText: React.FC<{ text: string }> = ({ text }) => (
  <div className="p-8 text-center bg-zinc-100/50 rounded-3xl border border-dashed border-zinc-300 text-zinc-400 text-xs font-bold">
    {text}
  </div>
);
