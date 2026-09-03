import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { 
  CheckCircle2, 
  ChefHat, 
  Flame, 
  Bike, 
  PackageCheck, 
  Clock, 
  Phone, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  MapPin,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

export const OrderTrackingScreen: React.FC = () => {
  const { activeOrder, updateOrderStatus, setCurrentScreen, orders } = useApp();
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  const order = activeOrder || orders[0];

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Clock className="w-12 h-12 text-zinc-400 animate-pulse" />
        <h2 className="text-xl font-extrabold text-zinc-900">Nenhum pedido ativo no momento</h2>
        <button
          onClick={() => setCurrentScreen('cardapio')}
          className="bg-rose-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
        >
          Fazer um Pedido
        </button>
      </div>
    );
  }

  // Steps definition
  const steps: { id: OrderStatus; label: string; icon: React.FC<{ className?: string }>; description: string }[] = [
    { id: 'pending', label: 'Pedido Recebido', icon: Clock, description: 'Aguardando confirmação da cozinha' },
    { id: 'confirmed', label: 'Confirmado', icon: ChefHat, description: 'Pedido aceito e em fila de produção' },
    { id: 'preparing', label: 'Em Preparação', icon: Flame, description: 'Sua pizza está no forno a lenha' },
    { id: 'out_for_delivery', label: 'Saiu p/ Entrega', icon: Bike, description: 'Motoboy a caminho do seu endereço' },
    { id: 'delivered', label: 'Entregue', icon: PackageCheck, description: 'Bom apetite!' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === order.status);

  // Status Simulator for testing UI transitions
  const handleAdvanceStatus = () => {
    const nextStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const nextIndex = (currentStepIndex + 1) % nextStatuses.length;
    updateOrderStatus(order.id, nextStatuses[nextIndex]);
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-zinc-500 font-bold block">Status do Pedido</span>
          <h2 className="text-xl font-extrabold text-zinc-900 flex items-center gap-2">
            Pedido #{order.orderNumber}
            <span className="text-xs bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded-full uppercase">
              {order.paymentStatus === 'paid' ? 'Pago via Pix' : 'Pendente'}
            </span>
          </h2>
        </div>

        {/* Demo Advance Button */}
        <button
          onClick={handleAdvanceStatus}
          className="inline-flex items-center gap-1 text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold px-3 py-1.5 rounded-xl border border-zinc-200"
        >
          <RefreshCw className="w-3 h-3" />
          Avançar Status (Demo)
        </button>
      </div>

      {/* Hero Estimation Banner */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-3xl p-6 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">Estimativa de Entrega</span>
          <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-extrabold">
            {order.orderType === 'delivery' ? 'Delivery' : 'Retirada'}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-rose-400">{order.estimatedMinutes} min</span>
          <span className="text-xs text-zinc-400">Previsão: 20:45 - 20:55</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-700 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-rose-500 to-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(15, ((currentStepIndex + 1) / steps.length) * 100))}%` }}
          />
        </div>
      </div>

      {/* Vertical Status Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-6">
        <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wide">Progresso do Pedido</h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIndex || order.status === 'delivered';
            const isCurrent = idx === currentStepIndex && order.status !== 'delivered';

            return (
              <div key={step.id} className="relative flex items-start gap-4">
                {/* Circle Icon */}
                <div
                  className={`absolute -left-[31px] w-6 h-6 rounded-full flex items-center justify-center transition ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-md'
                      : isCurrent
                      ? 'bg-rose-600 text-white ring-4 ring-rose-100 animate-pulse'
                      : 'bg-zinc-100 text-zinc-400 border border-zinc-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h4 className={`font-extrabold text-sm ${isCurrent ? 'text-rose-600' : isDone ? 'text-zinc-900' : 'text-zinc-400'}`}>
                    {step.label}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Card (if out for delivery) */}
      {(order.status === 'out_for_delivery' || order.status === 'preparing') && (
        <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xl">
              🛵
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-extrabold uppercase">Seu Motoboy</span>
              <h4 className="font-extrabold text-sm text-zinc-900">Carlos Silva</h4>
              <p className="text-xs text-zinc-500">Honda CG 160 • ABC-1234 (⭐️ 4.9)</p>
            </div>
          </div>

          <a
            href="tel:11999999999"
            className="p-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-2xl transition"
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>
      )}

      {/* Order Details Accordion */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <button
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="w-full p-5 text-left font-extrabold text-sm text-zinc-900 flex items-center justify-between bg-zinc-50/50"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-rose-600" />
            Detalhes dos Itens ({order.items.length})
          </span>
          {isAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isAccordionOpen && (
          <div className="p-5 border-t border-zinc-100 space-y-4 text-xs">
            {/* Items */}
            <div className="space-y-3 divide-y divide-zinc-100">
              {order.items.map((item, i) => (
                <div key={i} className="pt-2 first:pt-0 flex justify-between items-start">
                  <div>
                    <span className="font-bold text-zinc-900">
                      {item.quantity}x {item.type === 'pizza' ? `Pizza ${item.pizzaSize?.name}` : item.product?.name}
                    </span>
                    {item.type === 'pizza' && (
                      <p className="text-zinc-500">
                        {item.pizzaFlavors?.map((f) => f.name).join(' + ')} ({item.pizzaCrust?.name})
                      </p>
                    )}
                  </div>
                  <span className="font-extrabold text-zinc-900">
                    R$ {item.subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            {/* Address */}
            {order.deliveryAddress && (
              <div className="pt-3 border-t border-zinc-100 flex items-start gap-2 text-zinc-600">
                <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-900 block">Endereço de Entrega:</span>
                  <p>
                    {order.deliveryAddress.street}, {order.deliveryAddress.number} ({order.deliveryAddress.neighborhood})
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Support Action */}
      <div className="text-center">
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-2xl text-xs shadow-md transition"
        >
          <MessageCircle className="w-4 h-4" />
          Falar com a Cozinha no WhatsApp
        </a>
      </div>
    </div>
  );
};
