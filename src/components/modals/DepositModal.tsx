import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { PaymentMethodType } from '../../types/trading';
import {
  formatCurrency,
  convertFromUSD,
  convertToUSD,
  MIN_DEPOSIT_USD,
  MAX_DEPOSIT_USD,
} from '../../utils/currencies';
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
  ArrowDownCircle,
} from 'lucide-react';

export const DepositModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    currency,
    processDeposit,
    accountType,
    setAccountType,
  } = useTrading();

  const [method, setMethod] = useState<PaymentMethodType>('card');
  const [amountUSD, setAmountUSD] = useState<number>(50.0);
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8824');
  const [cardExpiry, setCardExpiry] = useState<string>('08/28');
  const [cardCvv, setCardCvv] = useState<string>('342');
  const [cardName, setCardName] = useState<string>('Trader Robert');
  const [mobileNumber, setMobileNumber] = useState<string>('+265 99 123 4567');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (activeModal !== 'deposit') return null;

  const minLocal = convertFromUSD(MIN_DEPOSIT_USD, currency);
  const maxLocal = convertFromUSD(MAX_DEPOSIT_USD, currency);
  const currentLocalAmount = convertFromUSD(amountUSD, currency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountUSD < MIN_DEPOSIT_USD || amountUSD > MAX_DEPOSIT_USD) return;

    setIsProcessing(true);
    setSuccessMessage(null);

    const details: Record<string, string> = {
      method,
      amountUSD: amountUSD.toString(),
      ...(method === 'card'
        ? { cardNumber, cardExpiry, cardCvv, cardName }
        : { mobileNumber }),
    };

    const success = await processDeposit(amountUSD, method, details);
    setIsProcessing(false);

    if (success) {
      setSuccessMessage(
        `Successfully deposited ${formatCurrency(amountUSD, currency)} via ${
          method === 'card' ? 'Debit Card' : method === 'airtel' ? 'Airtel Money' : 'MTN MoMo'
        }!`
      );
      // Auto switch to real account so user sees their new balance
      setAccountType('real');
      setTimeout(() => {
        setActiveModal(null);
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-100">
              Deposit Trading Capital
            </h3>
            <p className="text-xs text-slate-400">
              Instant crediting • Limit: ${MIN_DEPOSIT_USD} - ${MAX_DEPOSIT_USD} USD
            </p>
          </div>
        </div>

        {/* Payment Method Option Buttons */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-300 block mb-2">
            Select Payment Gateway:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* Debit Card Option */}
            <button
              type="button"
              onClick={() => setMethod('card')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                method === 'card'
                  ? 'bg-slate-800 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-5 h-5 mb-1 text-cyan-400" />
              <span className="text-xs font-bold">Debit Card</span>
              <span className="text-[10px] text-slate-500">Visa / Mastercard</span>
            </button>

            {/* Airtel Money Option */}
            <button
              type="button"
              onClick={() => {
                setMethod('airtel');
                if (!mobileNumber) setMobileNumber('+265 99 123 4567');
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                method === 'airtel'
                  ? 'bg-slate-800 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-5 h-5 mb-1 text-red-500" />
              <span className="text-xs font-bold">Airtel Money</span>
              <span className="text-[10px] text-slate-500">Instant USSD API</span>
            </button>

            {/* MTN MoMo Option */}
            <button
              type="button"
              onClick={() => {
                setMethod('mtn');
                if (!mobileNumber) setMobileNumber('+27 83 123 4567');
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                method === 'mtn'
                  ? 'bg-slate-800 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-5 h-5 mb-1 text-amber-400" />
              <span className="text-xs font-bold">MTN MoMo</span>
              <span className="text-[10px] text-slate-500">Push Payment API</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Selection & Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300">
                Deposit Amount:
              </label>
              <span className="text-[11px] text-slate-400 font-mono-numbers">
                Min: {formatCurrency(MIN_DEPOSIT_USD, currency)} • Max: {formatCurrency(MAX_DEPOSIT_USD, currency)}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                step="5"
                min={minLocal}
                max={maxLocal}
                required
                value={Math.round(currentLocalAmount)}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    setAmountUSD(convertToUSD(val, currency));
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-base font-bold font-mono-numbers text-slate-100 outline-none"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                {currency} (~${amountUSD.toFixed(0)} USD)
              </span>
            </div>

            {/* Preset Amount Chips */}
            <div className="flex items-center gap-2 mt-2">
              {[10, 25, 50, 100, 250, 500].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmountUSD(amt)}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    Math.abs(amountUSD - amt) < 0.1
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Method Form Fields */}
          {method === 'card' && (
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Debit Card Information</span>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Card Number (e.g. 4532 8821 9021 8824)"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono-numbers text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={e => setCardExpiry(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono-numbers text-slate-100 outline-none focus:border-cyan-500"
                />
                <input
                  type="password"
                  placeholder="CVV"
                  value={cardCvv}
                  onChange={e => setCardCvv(e.target.value)}
                  required
                  maxLength={4}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono-numbers text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {(method === 'airtel' || method === 'mtn') && (
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{method === 'airtel' ? 'Airtel Money Phone Number' : 'MTN MoMo Registered Line'}</span>
              </div>
              <input
                type="tel"
                placeholder="+265 99 123 4567 or +27 83 123 4567"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono-numbers text-slate-100 outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400">
                A secure USSD push notification will trigger directly to your phone for PIN authentication.
              </p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer active:scale-[0.98]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Real-time API Transaction...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Deposit • {formatCurrency(amountUSD, currency)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
