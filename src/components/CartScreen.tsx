import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Tag, 
  ArrowRight, 
  Sparkles, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export const CartScreen: React.FC = () => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    deliveryFee, 
    totalAmount, 
    couponCode, 
    couponDiscount, 
    applyCoupon, 
    setCurrentScreen,
    products,
    addToCart,
    orderType
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const success = applyCoupon(couponInput);
    if (!success) {
      setCouponError(true);
      setTimeout(() => setCouponError(false), 2500);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="w-24 h-24 rounded-full bg-rose-50 border-2 border-rose-100 flex items-center justify-center text-rose-500 shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-zinc-900">Seu carrinho está vazio</h2>
        <p className="text-xs text-zinc-500">
          Você ainda não adicionou nenhuma pizza ou bebida ao seu pedido. Que tal explorar nosso cardápio?
        </p>
        <button
          onClick={() => setCurrentScreen('cardapio')}
          className="mt-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-rose-600/30 transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Cardápio</span>
        </button>
      </div>
    );
  }

  // Cross-selling suggestions (beverages/desserts not in cart)
  const suggestions = products.slice(0, 3);

  return (
    <div className="pb-32 pt-4 px-4 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentScreen('cardapio')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 px-3 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Cardápio
        </button>
        <h2 className="text-lg font-extrabold text-zinc-900">Seu Carrinho ({cart.length})</h2>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:underline font-bold"
        >
          Esvaziar
        </button>
      </div>

      {/* Cart Items List */}
      <div className="bg-white rounded-3xl p-4 border border-zinc-200/80 shadow-sm divide-y divide-zinc-100">
        {cart.map((item) => (
          <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start">
            {/* Image / Icon */}
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-2xl flex-shrink-0 border border-zinc-200/50">
              {item.type === 'pizza' ? '🍕' : '🥤'}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
              <h4 className="font-extrabold text-sm text-zinc-900 leading-tight">
                {item.type === 'pizza'
                  ? `Pizza ${item.pizzaSize?.name} (${item.pizzaFlavors?.map((f) => f.name).join(' + ')})`
                  : item.product?.name}
              </h4>

              {item.type === 'pizza' && (
                <div className="text-xs text-zinc-500 space-y-0.5">
                  <p>Borda: <span className="font-semibold text-zinc-700">{item.pizzaCrust?.name}</span></p>
                  {item.notes && <p className="italic text-amber-700">Obs: "{item.notes}"</p>}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                {/* Stepper */}
                <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl p-1">
                  <button
                    onClick={() => updateCartQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center text-zinc-700 hover:bg-zinc-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-4 text-center font-extrabold text-xs text-zinc-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center text-zinc-700 hover:bg-zinc-100"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-zinc-900">
                    R$ {item.subtotal.toFixed(2).replace('.', ',')}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-zinc-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cross-selling Section */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-xs uppercase tracking-wide text-zinc-500 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Que tal adicionar ao pedido?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {suggestions.map((p) => (
            <div
              key={p.id}
              className="bg-white p-3 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5">
                <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <h5 className="font-bold text-xs text-zinc-900 leading-tight line-clamp-1">{p.name}</h5>
                  <span className="text-[11px] font-black text-emerald-600">R$ {p.price.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              <button
                onClick={() => addToCart({ type: 'product', product: p, quantity: 1, unitPrice: p.price })}
                className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white p-1.5 rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon Code Section */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-sm space-y-3">
        <label className="font-extrabold text-xs text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-rose-600" />
          Cupom de Desconto
        </label>

        {couponCode ? (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Cupom <strong className="underline">{couponCode}</strong> aplicado! (-R$ {couponDiscount.toFixed(2)})
            </span>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Digite PIZZA10"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500 uppercase"
            />
            <button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition"
            >
              Aplicar
            </button>
          </form>
        )}

        {couponError && (
          <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Cupom inválido. Experimente usar "PIZZA10".
          </p>
        )}
      </div>

      {/* Pricing Summary Breakdown */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-3 text-xs">
        <h3 className="font-extrabold text-sm text-zinc-900 border-b border-zinc-100 pb-2">
          Resumo dos Valores
        </h3>

        <div className="flex justify-between text-zinc-600 font-medium">
          <span>Subtotal dos Itens</span>
          <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
        </div>

        <div className="flex justify-between text-zinc-600 font-medium">
          <span>Taxa de Entrega ({orderType === 'delivery' ? 'Delivery' : 'Retirada'})</span>
          <span>{deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2).replace('.', ',')}` : 'GRÁTIS'}</span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 font-bold">
            <span>Desconto do Cupom</span>
            <span>- R$ {couponDiscount.toFixed(2).replace('.', ',')}</span>
          </div>
        )}

        <div className="pt-3 border-t border-zinc-100 flex justify-between items-center text-zinc-900 font-black text-base">
          <span>Total a Pagar</span>
          <span className="text-xl text-rose-600">
            R$ {totalAmount.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      {/* Bottom Fixed Action CTA */}
      <div className="fixed bottom-16 md:bottom-6 left-4 right-4 max-w-xl mx-auto z-40">
        <button
          onClick={() => setCurrentScreen('checkout')}
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-4 px-6 rounded-2xl shadow-2xl transition flex items-center justify-between text-sm group"
        >
          <span className="flex items-center gap-2">
            <span>Continuar para Identificação</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="font-black text-rose-100">
              R$ {totalAmount.toFixed(2).replace('.', ',')}
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </div>
        </button>
      </div>
    </div>
  );
};
