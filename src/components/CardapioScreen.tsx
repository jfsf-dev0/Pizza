import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PizzaFlavor, Product } from '../types';
import { 
  Search, 
  X, 
  Plus, 
  ShoppingBag, 
  ChevronRight, 
  Flame, 
  Sparkles, 
  Info, 
  Clock, 
  MapPin, 
  Star,
  Check
} from 'lucide-react';

export const CardapioScreen: React.FC = () => {
  const { 
    categories, 
    pizzaFlavors, 
    products, 
    cart, 
    totalAmount, 
    setCurrentScreen,
    setIsPizzaBuilderOpen,
    setSelectedProductForDetail,
    addToCart
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('cat-salgadas');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemFeedback, setAddedItemFeedback] = useState<string | null>(null);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Quick Add Product (Beverages / Desserts)
  const handleQuickAddProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      type: 'product',
      product,
      quantity: 1,
      unitPrice: product.price,
    });
    setAddedItemFeedback(product.id);
    setTimeout(() => setAddedItemFeedback(null), 1200);
  };

  // Filter items based on search query
  const filteredFlavors = pizzaFlavors.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-28 pt-4 px-4 max-w-5xl mx-auto space-y-6">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar pizzas salgadas, doces, bebidas..."
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hero Promo Banners (Horizontal Scroll) */}
      {!searchQuery && (
        <div className="flex gap-4 overflow-x-auto snap-x scrollbar-none pb-2">
          {/* Banner 1 */}
          <div className="snap-start min-w-[280px] md:min-w-[340px] bg-gradient-to-r from-rose-600 to-amber-500 text-white rounded-3xl p-5 shadow-lg flex justify-between items-center relative overflow-hidden">
            <div className="space-y-1 z-10">
              <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                Combo Família
              </span>
              <h3 className="font-extrabold text-lg leading-tight">1 Pizza Grande + 1 Guaraná 2L</h3>
              <p className="text-xs text-rose-100 font-medium">De R$ 79,00 por apenas R$ 64,90</p>
              <button 
                onClick={() => setIsPizzaBuilderOpen(true)}
                className="mt-2 inline-flex items-center gap-1 bg-white text-rose-600 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow hover:bg-rose-50 transition"
              >
                Pedir Combo agora
              </button>
            </div>
            <div className="text-5xl opacity-80 z-0">🍕</div>
          </div>

          {/* Banner 2 */}
          <div className="snap-start min-w-[280px] md:min-w-[340px] bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-lg flex justify-between items-center relative overflow-hidden">
            <div className="space-y-1 z-10">
              <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                Cupom Especial
              </span>
              <h3 className="font-extrabold text-lg leading-tight">R$ 10,00 OFF na Primeira Compra</h3>
              <p className="text-xs text-emerald-100 font-medium">Use o código: <strong className="underline">PIZZA10</strong></p>
            </div>
            <div className="text-5xl opacity-80 z-0">🎁</div>
          </div>
        </div>
      )}

      {/* Main Pizza Customization Launcher Card */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white rounded-3xl p-6 shadow-xl border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Monte sua Pizza do seu Jeito
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Até 3 Sabores + Borda Recheada!</h2>
          <p className="text-xs text-zinc-400 max-w-md">
            Escolha entre tamanho Broto, Média, Grande ou Gigante. Preço calculado automaticamente pelo valor do maior sabor.
          </p>
        </div>
        <button
          onClick={() => setIsPizzaBuilderOpen(true)}
          className="w-full md:w-auto bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-rose-600/30 transition flex items-center justify-center gap-2 group"
        >
          <span>Montar Minha Pizza</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
        </button>
      </div>

      {/* Category Tabs (Sticky) */}
      <div className="sticky top-[110px] md:top-[68px] z-30 bg-zinc-50/95 backdrop-blur-md py-2 border-b border-zinc-200">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Section: Pizzas Salgadas e Doces */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xl text-zinc-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-600" />
            Cardápio de Sabores
          </h3>
          <span className="text-xs text-zinc-500 font-medium">
            {filteredFlavors.length} opções disponíveis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFlavors.map((flavor) => (
            <div
              key={flavor.id}
              onClick={() => setIsPizzaBuilderOpen(true)}
              className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-sm hover:shadow-md hover:border-rose-200 transition cursor-pointer flex gap-4 group"
            >
              {/* Product Image */}
              <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                <img
                  src={flavor.image_url}
                  alt={flavor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                {flavor.tags && flavor.tags.length > 0 && (
                  <span className="absolute top-1 left-1 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow">
                    {flavor.tags[0]}
                  </span>
                )}
              </div>

              {/* Product Content */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-zinc-900 group-hover:text-rose-600 transition">
                    {flavor.name}
                  </h4>
                  <p className="text-xs text-zinc-500 line-clamp-2 mt-1 font-medium">
                    {flavor.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-bold block">A partir de</span>
                    <span className="font-extrabold text-sm text-zinc-900">
                      R$ {flavor.prices['size-broto'].toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <button className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    Escolher
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Bebidas & Sobremesas (Produtos Prontos) */}
      <div className="space-y-6 pt-4">
        <h3 className="font-extrabold text-xl text-zinc-900 flex items-center gap-2">
          🥤 Bebidas & Sobremesas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((prod) => {
            const isJustAdded = addedItemFeedback === prod.id;
            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-16 h-16 rounded-xl object-cover bg-zinc-100"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900">{prod.name}</h4>
                    <p className="text-xs text-zinc-500">{prod.description}</p>
                    <span className="font-extrabold text-sm text-emerald-600 block mt-1">
                      R$ {prod.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleQuickAddProduct(prod, e)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isJustAdded
                      ? 'bg-emerald-500 text-white shadow'
                      : 'bg-zinc-900 hover:bg-rose-600 text-white'
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      Adicionado
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-4 right-4 max-w-xl mx-auto z-40">
          <button
            onClick={() => setCurrentScreen('cart')}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-rose-500/30 transition transform hover:scale-[1.01] active:scale-[0.99] animate-in slide-in-from-bottom duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span className="text-xs text-rose-100 font-medium block">
                  {totalCartCount} {totalCartCount === 1 ? 'item no carrinho' : 'itens no carrinho'}
                </span>
                <span className="text-lg font-black tracking-tight">
                  Total: R$ {totalAmount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white text-rose-600 px-4 py-2 rounded-xl font-extrabold text-xs shadow">
              <span>Ver Carrinho</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
