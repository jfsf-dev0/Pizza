import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Phone, 
  Bike, 
  Store, 
  ArrowRight, 
  CheckCircle,
  FileText,
  Building
} from 'lucide-react';

export const IdentificationScreen: React.FC = () => {
  const { 
    customer, 
    setCustomer, 
    deliveryAddress, 
    setDeliveryAddress, 
    orderType, 
    setOrderType,
    totalAmount,
    setCurrentScreen 
  } = useApp();

  const [deliveryInstruction, setDeliveryInstruction] = useState('Entregar em mãos');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!customer.name.trim()) newErrors.name = 'Por favor, informe seu nome completo.';
    if (!customer.phone.trim()) newErrors.phone = 'Por favor, informe seu telefone com DDD.';

    if (orderType === 'delivery') {
      if (!deliveryAddress.street.trim()) newErrors.street = 'Rua / Avenida é obrigatória.';
      if (!deliveryAddress.number.trim()) newErrors.number = 'Número é obrigatório.';
      if (!deliveryAddress.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setCurrentScreen('pix');
  };

  return (
    <div className="pb-32 pt-4 px-4 max-w-2xl mx-auto space-y-6">
      {/* Header & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentScreen('cart')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 px-3 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Carrinho
        </button>
        <h2 className="text-base font-extrabold text-zinc-900">Checkout - Etapa 1 de 2</h2>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-rose-600 font-extrabold text-xs">
          <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold">1</span>
          <span>Identificação & Endereço</span>
        </div>
        <div className="h-0.5 w-12 bg-zinc-200" />
        <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs">
          <span className="w-6 h-6 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center font-bold">2</span>
          <span>Pagamento Pix</span>
        </div>
      </div>

      {/* Order Type Toggle */}
      <div className="space-y-2">
        <label className="font-extrabold text-xs text-zinc-700 uppercase tracking-wide block">
          Modalidade do Pedido
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOrderType('delivery')}
            className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
              orderType === 'delivery'
                ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20 font-bold'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${orderType === 'delivery' ? 'bg-rose-600 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-zinc-900 block">Entrega Delivery</span>
              <span className="text-[11px] text-zinc-500 block">Receba em casa em 35-45 min</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setOrderType('takeaway')}
            className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
              orderType === 'takeaway'
                ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20 font-bold'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${orderType === 'takeaway' ? 'bg-rose-600 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-zinc-900 block">Retirar no Balcão</span>
              <span className="text-[11px] text-zinc-500 block">Pronto em 15-20 min</span>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={validateAndProceed} className="space-y-6">
        {/* Customer Data */}
        <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
            <User className="w-4 h-4 text-rose-600" />
            Seus Dados de Contato
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Nome Completo</label>
              <input
                type="text"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="Ex: Maria Oliveira"
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              {errors.name && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">CPF (Opcional - p/ Nota)</label>
                <input
                  type="text"
                  value={customer.cpf || ''}
                  onChange={(e) => setCustomer({ ...customer, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Form (if Delivery) */}
        {orderType === 'delivery' && (
          <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              Endereço de Entrega
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">CEP</label>
                  <input
                    type="text"
                    value={deliveryAddress.zipCode}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                    placeholder="01310-100"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="col-span-1 flex items-end">
                  <button
                    type="button"
                    className="w-full bg-zinc-900 text-white font-bold py-3 px-2 rounded-xl text-[11px] hover:bg-zinc-800 transition"
                  >
                    Buscar CEP
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Rua / Avenida</label>
                  <input
                    type="text"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                    placeholder="Av. Paulista"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  {errors.street && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.street}</p>}
                </div>

                <div className="col-span-1">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Número</label>
                  <input
                    type="text"
                    value={deliveryAddress.number}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, number: e.target.value })}
                    placeholder="1500"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  {errors.number && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.number}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Complemento</label>
                  <input
                    type="text"
                    value={deliveryAddress.complement || ''}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, complement: e.target.value })}
                    placeholder="Apto 42, Bloco B"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Bairro</label>
                  <input
                    type="text"
                    value={deliveryAddress.neighborhood}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, neighborhood: e.target.value })}
                    placeholder="Bela Vista"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  {errors.neighborhood && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.neighborhood}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Ponto de Referência</label>
                <input
                  type="text"
                  value={deliveryAddress.referencePoint || ''}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, referencePoint: e.target.value })}
                  placeholder="Em frente ao MASP"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Instrução para o Entregador</label>
                <div className="flex flex-wrap gap-2">
                  {['Deixar na portaria', 'Tocar campainha', 'Entregar em mãos', 'Ligar ao chegar'].map((inst) => (
                    <button
                      key={inst}
                      type="button"
                      onClick={() => setDeliveryInstruction(inst)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        deliveryInstruction === inst
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button CTA */}
        <div className="fixed bottom-16 md:bottom-6 left-4 right-4 max-w-xl mx-auto z-40">
          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-4 px-6 rounded-2xl shadow-2xl transition flex items-center justify-between text-sm group"
          >
            <span>Ir para Pagamento Pix</span>
            <div className="flex items-center gap-2">
              <span className="font-black text-rose-100">
                R$ {totalAmount.toFixed(2).replace('.', ',')}
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};
