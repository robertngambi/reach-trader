import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { PaymentMethodType } from '../../types/trading';
import {
  formatCurrency,
  convertFromUSD,
  convertToUSD,
  MIN_DEPOSIT_USD,
} from '../../utils/currencies';
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ArrowUpCircle,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const WithdrawModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    currency,
    realBalance,
    processWithdraw,
    accountType,
  } = useTrading();

  const [method, setMethod] = useState<PaymentMethodType>('card');
  const [amountUSD, setAmountUSD] = useState<number>(Math.min(realBalance, 50) || 10);
  const [cardNumber, setCardNumber] = useState<string>('4532 •••• •••• 8824');
  const [mobileNumber, setMobileNumber] = useState<string>('+265 99 123 4567');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (activeModal !== 'withdraw') return null;

  const currentLocalAmount = convertFromUSD(amountUSD, currency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (amountUSD < MIN_DEPOSIT_USD) {
      setErrorMessage(`Minimum withdrawal is ${formatCurrency(MIN_DEPOSIT_USD, currency)} ($5.00)`);
      return;
    }

    if (realBalance < amountUSD) {
      setErrorMessage(
        `Insufficient real account balance (${formatCurrency(realBalance, currency)} available). Please switch to Real Account or deposit capital.`
      );
      return;
    }

    setIsProcessing(true);
    const details = {
      method,
      amountUSD: amountUSD.toString(),
      account: method === 'card' ? cardNumber : mobileNumber,
    };

    const result = await processWithdraw(amountUSD, method, details);
    setIsProcessing(false);

    if (result.success) {
      setSuccessMessage(
        `Withdrawal of ${formatCurrency(amountUSD, currency)} successfully dispatched via ${
          method === 'card' ? 'Debit Card' : method === 'airtel' ? 'Airtel Money' : 'MTN MoMo'
        }.`
      );
      setTimeout(() => {
        setActiveModal(null);
      }, 1800);
    } else {
      setErrorMessage(result.error || 'Withdrawal could not be completed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-100">
        <button
          type="button"
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <ArrowUpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-100">
              Withdraw Trading Profits
            </h3>
            <p className="text-xs text-slate-400 font-mono-numbers">
              Available Real Balance: {formatCurrency(realBalance, currency)}
            </p>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="mb-5">
          <label className="text-xs font-bold text-slate-300 block mb-2">
            Withdrawal Destination:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMethod('card')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                method === 'card'
                  ? 'bg-slate-800 border-cyan-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-5 h-5 mb-1 text-cyan-400" />
              <span className="text-xs font-bold">Debit Card</span>
              <span className="text-[10px] text-slate-500">Direct Refund</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('airtel')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                method === 'airtel'
                  ? 'bg-slate-800 border-cyan-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-5 h-5 mb-1 text-red-500" />
              <span className="text-xs font-bold">Airtel Money</span>
              <span className="text-[10px] text-slate-500">Mobile Wallet</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('mtn')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                method === 'mtn'
                  ? 'bg-slate-800 border-cyan-500 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-5 h-5 mb-1 text-amber-400" />
              <span className="text-xs font-bold">MTN MoMo</span>
              <span className="text-[10px] text-slate-500">Direct Transfer</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300">
                Amount to Withdraw:
              </label>
              <button
                type="button"
                onClick={() => setAmountUSD(realBalance)}
                className="text-[11px] text-cyan-400 hover:underline font-bold"
              >
                Withdraw All ({formatCurrency(realBalance, currency)})
              </button>
            </div>

            <div className="relative">
              <input
                type="number"
                step="5"
                min={convertFromUSD(MIN_DEPOSIT_USD, currency)}
                required
                value={Math.round(currentLocalAmount)}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    setAmountUSD(convertToUSD(val, currency));
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-base font-bold font-mono-numbers text-slate-100 outline-none"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                {currency} (~${amountUSD.toFixed(0)} USD)
              </span>
            </div>
          </div>

          {method === 'card' ? (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300">
                Linked Card for Payout:
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono-numbers text-slate-100 outline-none"
              />
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300">
                {method === 'airtel' ? 'Airtel Money Phone Number' : 'MTN MoMo Registered Line'}
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono-numbers text-slate-100 outline-none"
              />
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
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
              className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/40 cursor-pointer active:scale-[0.98]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Withdrawal API Transfer...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Withdrawal • {formatCurrency(amountUSD, currency)}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Broker Cashier Link */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Connected to Broker?</span>
          <a
            href="https://app.deriv.com/cashier/withdrawal"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
          >
            <span>Open Deriv Cashier</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
