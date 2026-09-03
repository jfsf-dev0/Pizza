import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PizzaSize, PizzaCrust, PizzaFlavor } from '../types';
import { X, Check, Info, Plus, Minus, Flame, Sparkles } from 'lucide-react';

export const ProductDetailSheet: React.FC = () => {
  const { 
    isPizzaBuilderOpen, 
    setIsPizzaBuilderOpen, 
    pizzaSizes, 
    pizzaCrusts, 
    pizzaFlavors,
    addToCart 
  } = useApp();

  const [selectedSize, setSelectedSize] = useState<PizzaSize>(pizzaSizes[2]); // Default Grande (8 Fatias)
  const [selectedCrust, setSelectedCrust] = useState<PizzaCrust>(pizzaCrusts[0]); // Sem Borda
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<string[]>([pizzaFlavors[0].id]); // Calabresa
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // When size changes, clamp selected flavors to size.max_flavors
  useEffect(() => {
    if (selectedFlavorIds.length > selectedSize.max_flavors) {
      setSelectedFlavorIds(selectedFlavorIds.slice(0, selectedSize.max_flavors));
    }
  }, [selectedSize]);

  if (!isPizzaBuilderOpen) return null;

  // Toggle flavor selection
  const handleToggleFlavor = (flavorId: string) => {
    if (selectedFlavorIds.includes(flavorId)) {
      if (selectedFlavorIds.length === 1) return; // Must have at least 1 flavor
      setSelectedFlavorIds(selectedFlavorIds.filter((id) => id !== flavorId));
    } else {
      if (selectedFlavorIds.length >= selectedSize.max_flavors) return;
      setSelectedFlavorIds([...selectedFlavorIds, flavorId]);
    }
  };

  // Rule of Maximum Flavor Price Calculation
  const chosenFlavors = pizzaFlavors.filter((f) => selectedFlavorIds.includes(f.id));
  const maxFlavorPrice = chosenFlavors.reduce((max, flavor) => {
    const price = flavor.prices[selectedSize.id] || 0;
    return price > max ? price : max;
  }, 0);

  const unitPrice = maxFlavorPrice + selectedCrust.price;
  const totalPrice = unitPrice * quantity;

  const handleAddPizzaToCart = () => {
    addToCart({
      type: 'pizza',
      pizzaSize: selectedSize,
      pizzaCrust: selectedCrust,
      pizzaFlavors: chosenFlavors,
      quantity,
      unitPrice,
      notes: notes.trim() || undefined,
    });
    setIsPizzaBuilderOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Sheet Modal Container */}
      <div className="bg-white w-full sm:max-w-2xl max-h-[90vh] sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="relative bg-zinc-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            <div>
              <h2 className="font-extrabold text-lg leading-none">Monte sua Pizza</h2>
              <p className="text-xs text-zinc-400 mt-1">Personalize tamanho, sabores e borda recheada</p>
            </div>
          </div>
          <button
            onClick={() => setIsPizzaBuilderOpen(false)}
            className="p-2 rounded-full bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Step 1: Escolha o Tamanho */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                Escolha o Tamanho (Obrigatório)
              </h3>
              <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-md">Obrigatório</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {pizzaSizes.map((size) => {
                const isSelected = selectedSize.id === size.id;
                return (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-xs text-zinc-900 block">{size.name}</span>
                      <span className="text-[11px] text-zinc-500 block mt-0.5">{size.slices} fatias</span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-600 mt-2 block">
                      Até {size.max_flavors} {size.max_flavors === 1 ? 'sabor' : 'sabores'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Escolha os Sabores */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                  Escolha os Sabores (Até {selectedSize.max_flavors})
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  💡 Regra da casa: O valor cobrado é referente ao <strong>sabor de maior valor</strong>.
                </p>
              </div>
              <span className="text-xs bg-zinc-100 text-zinc-700 font-bold px-2.5 py-1 rounded-full">
                {selectedFlavorIds.length} / {selectedSize.max_flavors}
              </span>
            </div>

            <div className="space-y-2.5">
              {pizzaFlavors.map((flavor) => {
                const isSelected = selectedFlavorIds.includes(flavor.id);
                const flavorPrice = flavor.prices[selectedSize.id] || 0;
                return (
                  <div
                    key={flavor.id}
                    onClick={() => handleToggleFlavor(flavor.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/40 ring-1 ring-rose-500/20'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={flavor.image_url}
                        alt={flavor.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900">{flavor.name}</h4>
                        <p className="text-xs text-zinc-500 line-clamp-1">{flavor.description}</p>
                        <span className="text-xs font-extrabold text-zinc-900 mt-1 block">
                          R$ {flavorPrice.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition border ${
                        isSelected
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : 'border-zinc-300 bg-zinc-50'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Escolha a Borda */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
              Borda Recheada (Opcional)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pizzaCrusts.map((crust) => {
                const isSelected = selectedCrust.id === crust.id;
                return (
                  <button
                    key={crust.id}
                    onClick={() => setSelectedCrust(crust)}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/50 font-bold text-rose-900'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                    }`}
                  >
                    <span className="text-xs">{crust.name}</span>
                    <span className="text-xs font-extrabold text-zinc-900">
                      {crust.price > 0 ? `+ R$ ${crust.price.toFixed(2).replace('.', ',')}` : 'Grátis'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Observações */}
          <div className="space-y-2">
            <label className="font-extrabold text-xs text-zinc-700 uppercase tracking-wide block">
              Observações do Pedido
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Tirar cebola de metade da pizza, massa fina..."
              rows={2}
              className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-4">
          {/* Stepper */}
          <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-2xl p-1.5 shadow-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-700 font-bold"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-extrabold text-sm text-zinc-900">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-700 font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button CTA */}
          <button
            onClick={handleAddPizzaToCart}
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg hover:shadow-rose-600/30 transition flex items-center justify-between text-sm"
          >
            <span>Adicionar ao Pedido</span>
            <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
