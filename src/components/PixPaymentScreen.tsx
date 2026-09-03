import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Copy, 
  Check, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  MessageCircle, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export const PixPaymentScreen: React.FC = () => {
  const { 
    totalAmount, 
    createOrderFromCart, 
    activeOrder, 
    setActiveOrder, 
    updateOrderStatus,
    setCurrentScreen,
    cart
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [isPaid, setIsPaid] = useState(false);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  // Generate order if needed
  useEffect(() => {
    if (!activeOrder && cart.length > 0) {
      createOrderFromCart();
    }
  }, []);

  // 15-min Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const pixCode = "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540580.705802BR5925BELLA PIZZA E DELIVERY LTD6009SAO PAULO62070503***6304E2CA";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Simulate instant Pix confirmation
  const handleSimulateInstantPayment = () => {
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setIsPaid(true);
      if (activeOrder) {
        updateOrderStatus(activeOrder.id, 'confirmed');
      }
      setTimeout(() => {
        setCurrentScreen('tracking');
      }, 1800);
    }, 1500);
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentScreen('checkout')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 px-3 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <h2 className="text-base font-extrabold text-zinc-900">Pagamento Pix</h2>
      </div>

      {/* Countdown Banner */}
      <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>Expira em: <strong className="font-mono text-sm">{formattedTime}</strong></span>
        </div>
        <span className="bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-extrabold">
          Aguardando
        </span>
      </div>

      {/* QR Code Card */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-lg text-center space-y-4 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-extrabold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Pagamento 100% Seguro via Banco Central
        </div>

        <div className="space-y-1">
          <span className="text-xs text-zinc-500 font-medium block">Valor Total do Pedido</span>
          <span className="text-3xl font-black text-zinc-900 block">
            R$ {(activeOrder?.totalAmount || totalAmount).toFixed(2).replace('.', ',')}
          </span>
          <span className="text-xs text-zinc-400 font-medium block">
            Pedido #{activeOrder?.orderNumber || 1004}
          </span>
        </div>

        {/* QR Code Box */}
        <div className="relative w-48 h-48 mx-auto bg-zinc-900 rounded-2xl p-3 shadow-inner flex items-center justify-center border-4 border-emerald-500/30">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`}
            alt="QR Code Pix"
            className="w-full h-full object-contain rounded-lg bg-white p-1"
          />
        </div>

        <p className="text-xs text-zinc-500 max-w-xs mx-auto">
          Abra o aplicativo do seu banco, escolha <strong>Pix</strong> e escaneie o código acima.
        </p>

        {/* Pix Copia e Cola Code Box */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-zinc-700 block">Ou copie o código Pix abaixo:</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={pixCode}
              className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-[11px] font-mono text-zinc-600 truncate"
            />
            <button
              onClick={handleCopyPix}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Status Card (Polling / Simulation) */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm space-y-3 text-center">
        {isPaid ? (
          <div className="space-y-2 animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-extrabold text-base text-emerald-700">Pagamento Confirmado com Sucesso!</h4>
            <p className="text-xs text-zinc-500">Redirecionando para a cozinha em instantes...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-amber-600 text-xs font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Aguardando a confirmação do pagamento...</span>
            </div>

            {/* Test Simulation Button */}
            <button
              onClick={handleSimulateInstantPayment}
              disabled={isSimulatingPayment}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-4 rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              {isSimulatingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Simulando Aprovação no Banco...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Simular Pagamento Aprovado (Demonstração)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Support Button */}
      <div className="text-center">
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:underline"
        >
          <MessageCircle className="w-4 h-4" />
          Precisa de ajuda com seu pagamento Pix?
        </a>
      </div>
    </div>
  );
};
