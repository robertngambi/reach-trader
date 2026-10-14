import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { EditableNumberDropdown } from '../common/EditableNumberDropdown';
import { EditableNumberInput } from '../common/EditableNumberInput';
import { TradingActivityBox } from '../common/TradingActivityBox';
import { formatCurrency, convertFromUSD, convertToUSD, MIN_STAKE_USD } from '../../utils/currencies';
import { BotDuration } from '../../types/trading';
import {
  Play,
  Square,
  Clock,
  ChevronDown,
  Activity,
  History,
  Radar,
  ShieldCheck,
  Zap,
  Target,
  ShieldAlert,
} from 'lucide-react';

const DURATION_OPTIONS: { id: BotDuration; label: string }[] = [
  { id: '1m', label: '1 Minute' },
  { id: '5m', label: '5 Minutes' },
  { id: '10m', label: '10 Minutes' },
  { id: '30m', label: '30 Minutes' },
  { id: '1h', label: '1 Hour' },
  { id: '6h', label: '6 Hours' },
  { id: '12h', label: '12 Hours' },
  { id: '24h', label: '24 Hours' },
  { id: '48h', label: '48 Hours' },
  { id: '72h', label: '72 Hours' },
];

export const BotTrader: React.FC = () => {
  const {
    currency,
    botConfig,
    startBotTrader,
    stopBotTrader,
    botTotalPnL,
    botStatusText,
    activeTrades,
    tradeHistory,
  } = useTrading();

  const [stakeUSD, setStakeUSD] = useState<number>(5.0);
  const [selectedDuration, setSelectedDuration] = useState<BotDuration>('1h');
  const [durationDropdownOpen, setDurationDropdownOpen] = useState<boolean>(false);
  const [includeBulkTrading, setIncludeBulkTrading] = useState<boolean>(false);
  const [bulkTradesCount, setBulkTradesCount] = useState<number>(3);
  const [targetProfitUSD, setTargetProfitUSD] = useState<number>(50.0);
  const [stopLossUSD, setStopLossUSD] = useState<number>(25.0);
  const [maxTradesLimit, setMaxTradesLimit] = useState<number>(15);

  const stakeLocal = convertFromUSD(stakeUSD, currency);
  const targetProfitLocal = convertFromUSD(targetProfitUSD, currency);
  const stopLossLocal = convertFromUSD(stopLossUSD, currency);
  const botActiveTrades = activeTrades.filter(t => t.mode === 'bot_auto');

  const handleToggleBot = () => {
    if (botConfig.isRunning) {
      stopBotTrader();
    } else {
      startBotTrader(
        stakeUSD,
        selectedDuration,
        includeBulkTrading,
        bulkTradesCount || 3,
        targetProfitUSD,
        stopLossUSD,
        maxTradesLimit
      );
    }
  };

  const selectedDurationObj = DURATION_OPTIONS.find(d => d.id === selectedDuration) || DURATION_OPTIONS[4];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Autonomous Multi-Market Scanning Engine Status (Asset selector removed as requested) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Radar className={`w-5 h-5 ${botConfig.isRunning ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-100">
                  Autonomous Multi-Market Scanner
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Auto Loss Avoidance
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically scans for the best market at every moment and shifts away if a loss is anticipated.
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono-numbers text-xs text-cyan-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="font-bold truncate max-w-xs">{botStatusText}</span>
          </div>
        </div>
      </div>

      {/* Wins & Losses Activity Box - Directly below introductory box; appears during active trading and disappears when stopped */}
      {botConfig.isRunning && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
              <span className="font-extrabold text-[11px] text-slate-100 tracking-tight">
                Live Wins & Losses Activity
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono-numbers">
                {botActiveTrades.length} Active
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono-numbers text-[10px]">
              <span className="text-slate-400">
                Wins: <span className="text-emerald-400 font-bold">{tradeHistory.filter(t => t.mode === 'bot_auto' && t.status === 'CLOSED_WIN').length}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">
                Losses: <span className="text-rose-400 font-bold">{tradeHistory.filter(t => t.mode === 'bot_auto' && t.status === 'CLOSED_LOSS').length}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className={`font-black ${botTotalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {botTotalPnL >= 0 ? '+' : ''}{formatCurrency(botTotalPnL, currency)}
              </span>
            </div>
          </div>

          {botActiveTrades.length === 0 ? (
            <div className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between font-mono-numbers">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                Scanning for highest probability entry • AI variance filter active
              </span>
              <span className="text-slate-500 text-[9px]">0 Open</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
              {botActiveTrades.map(trade => {
                const isProfit = trade.pnlUSD >= 0;
                return (
                  <div
                    key={trade.id}
                    className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono-numbers flex items-center justify-between text-[10px]"
                  >
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span
                          className={`text-[8px] font-bold px-1 py-0.2 rounded shrink-0 ${
                            trade.type === 'BUY'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {trade.type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-200 truncate">
                          {trade.assetName}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {formatCurrency(trade.stakeUSD, currency)} • {trade.ticksRemaining}t left
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-[10px] font-black ${
                          isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isProfit ? '+' : ''}
                        {formatCurrency(trade.pnlUSD, currency)}
                      </div>
                      <span className="text-[8px] text-slate-500 block leading-none mt-0.5">
                        floating
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Parameters Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* 1. Trading Stake Input */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <EditableNumberInput
            label="Trading Stake"
            value={stakeLocal}
            onChange={(val) => {
              setStakeUSD(convertToUSD(val, currency));
            }}
            min={1}
            allowDecimals={true}
            disabled={botConfig.isRunning}
            suffix={currency}
            subtitle={`Min: ${formatCurrency(MIN_STAKE_USD, currency)}`}
            accentColor="emerald"
            quickOptions={[1, 5, 10, 25]}
            quickOptionPrefix={currency === 'USD' ? '$' : ''}
          />
        </div>

        {/* 2. Period Dropdown with Radio Option Buttons */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <label className="text-xs font-bold text-slate-200 mb-1.5 block">
            Trading Period
          </label>

          <div className="relative">
            <button
              type="button"
              disabled={botConfig.isRunning}
              onClick={() => setDurationDropdownOpen(prev => !prev)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-slate-600 text-xs font-bold text-slate-100 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{selectedDurationObj.label}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {durationDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDurationDropdownOpen(false)}
                />
                <div className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50 divide-y divide-slate-800">
                  {DURATION_OPTIONS.map(opt => (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between px-3.5 py-2 hover:bg-slate-800 cursor-pointer transition-colors ${
                        selectedDuration === opt.id ? 'bg-emerald-950/40 text-emerald-300 font-bold' : 'text-slate-300'
                      }`}
                      onClick={() => {
                        setSelectedDuration(opt.id);
                        setDurationDropdownOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="bot_period"
                          checked={selectedDuration === opt.id}
                          onChange={() => {}}
                          className="accent-emerald-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className="text-xs">{opt.label}</span>
                      </div>
                      <span className="text-[10px] font-mono-numbers text-slate-500 uppercase">
                        {opt.id}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="text-[11px] text-slate-400 mt-2 font-mono-numbers">
            Selected: <span className="text-emerald-400 font-bold">{selectedDurationObj.label}</span>
          </div>
        </div>

        {/* 3. Appointed Target Profit & Stop Loss (Loss Boxes) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Target Profit & Loss
            </label>
            <span className="text-[10px] text-slate-400 font-mono-numbers">
              Auto-Stop
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <EditableNumberInput
                label="Profit Target"
                value={targetProfitLocal}
                onChange={(val) => {
                  setTargetProfitUSD(convertToUSD(val, currency));
                }}
                min={1}
                allowDecimals={true}
                disabled={botConfig.isRunning}
                suffix={currency}
                accentColor="emerald"
              />
            </div>
            <div>
              <EditableNumberInput
                label="Stop Loss"
                value={stopLossLocal}
                onChange={(val) => {
                  setStopLossUSD(convertToUSD(val, currency));
                }}
                min={1}
                allowDecimals={true}
                disabled={botConfig.isRunning}
                suffix={currency}
                accentColor="rose"
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 mt-2 font-mono-numbers">
            Auto-halts when profit or loss limit is hit
          </div>
        </div>

        {/* 4. Appointed Trades Limit & Bulk Execution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-200">
              Selected Trades Limit
            </label>
            <button
              type="button"
              disabled={botConfig.isRunning}
              onClick={() => setIncludeBulkTrading(prev => !prev)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                includeBulkTrading
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {includeBulkTrading ? 'Bulk: ACTIVE' : 'Single Trade'}
            </button>
          </div>

          <div className="space-y-2">
            <EditableNumberDropdown
              label="Appointed Trades to Stop"
              value={maxTradesLimit}
              onChange={setMaxTradesLimit}
              options={[5, 10, 15, 20, 30, 50]}
              min={1}
              max={10000}
              disabled={botConfig.isRunning}
            />

            {includeBulkTrading && (
              <EditableNumberDropdown
                label="Bulk Trades At Once"
                value={bulkTradesCount}
                onChange={setBulkTradesCount}
                options={[1, 2, 3, 5, 10]}
                min={1}
                max={50}
                disabled={botConfig.isRunning}
              />
            )}
          </div>

          <div className="text-[10px] text-slate-400 mt-2 font-mono-numbers flex items-center justify-between">
            <span>Stops at: {maxTradesLimit} trades</span>
            {includeBulkTrading && <span className="text-cyan-400 font-bold">{bulkTradesCount} at once</span>}
          </div>
        </div>
      </div>

      {/* Start / Stop Master Button Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1">
            <button
              type="button"
              onClick={handleToggleBot}
              className={`w-full py-3.5 rounded-xl font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-[0.98] ${
                botConfig.isRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-950/50'
              }`}
            >
              {botConfig.isRunning ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  <span>STOP BOT TRADER</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>START BOT TRADER</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2.5 font-mono-numbers flex-wrap">
            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-right">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">
                Session Net P&L
              </span>
              <span
                className={`text-sm font-black ${
                  botTotalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {botTotalPnL >= 0 ? '+' : ''}
                {formatCurrency(botTotalPnL, currency)}
              </span>
            </div>

            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-right">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">
                Target / Stop
              </span>
              <span className="text-xs font-bold text-slate-200 block">
                <span className="text-emerald-400">+{formatCurrency(targetProfitUSD, currency)}</span> / <span className="text-rose-400">-{formatCurrency(stopLossUSD, currency)}</span>
              </span>
            </div>

            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-right">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">
                Appointed Trades
              </span>
              <span className="text-xs font-bold text-cyan-400 block">
                {botConfig.tradesExecuted || 0} / {botConfig.maxTrades || maxTradesLimit}
              </span>
            </div>

            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-right">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">
                Status
              </span>
              <span className="text-[11px] font-bold text-slate-300 block truncate max-w-[150px]">
                {botStatusText}
              </span>
            </div>
          </div>
        </div>
      </div>



      {/* Complete Trade History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-md">
        <div className="flex items-center justify-between mb-2.5 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-100">
              Trading History
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono-numbers">
              {tradeHistory.length}
            </span>
          </div>
        </div>

        {tradeHistory.length === 0 ? (
          <div className="py-5 text-center text-slate-500 text-[11px]">
            No trade history recorded yet. Completed trades will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left font-mono-numbers text-[10px] sm:text-[11px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[9px] uppercase tracking-wider">
                  <th className="pb-1.5 px-1.5 whitespace-nowrap">Time</th>
                  <th className="pb-1.5 px-1.5 whitespace-nowrap">Market</th>
                  <th className="pb-1.5 px-1.5 whitespace-nowrap">Type</th>
                  <th className="pb-1.5 px-1.5 whitespace-nowrap">Mode</th>
                  <th className="pb-1.5 px-1.5 whitespace-nowrap">Stake</th>
                  <th className="pb-1.5 px-1.5 whitespace-nowrap">Entry</th>
                  <th className="pb-1.5 px-1.5 whitespace-nowrap">Exit</th>
                  <th className="pb-1.5 px-1.5 text-right whitespace-nowrap">Net P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tradeHistory.map(trade => {
                  const isWin = trade.status === 'CLOSED_WIN';
                  return (
                    <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-1.5 px-1.5 text-slate-400 whitespace-nowrap">
                        {new Date(trade.closeTime || trade.openTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-1.5 px-1.5 font-bold text-slate-200 whitespace-nowrap">{trade.assetName}</td>
                      <td className="py-1.5 px-1.5 whitespace-nowrap">
                        <span
                          className={`px-1 py-0.2 rounded text-[8px] font-extrabold uppercase ${
                            trade.type === 'BUY'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {trade.type}
                        </span>
                      </td>
                      <td className="py-1.5 px-1.5 text-slate-400 capitalize whitespace-nowrap text-[9px]">
                        {trade.mode.replace('_', ' ')}
                      </td>
                      <td className="py-1.5 px-1.5 text-slate-300 font-medium whitespace-nowrap">
                        {formatCurrency(trade.stakeUSD, currency)}
                      </td>
                      <td className="py-1.5 px-1.5 text-slate-400 whitespace-nowrap">{trade.entryPrice.toFixed(2)}</td>
                      <td className="py-1.5 px-1.5 text-slate-300 font-semibold whitespace-nowrap">
                        {(trade.exitPrice || trade.currentPrice).toFixed(2)}
                      </td>
                      <td className="py-1.5 px-1.5 text-right font-bold whitespace-nowrap">
                        <span className={isWin ? 'text-emerald-400' : 'text-rose-400'}>
                          {isWin ? '+' : ''}
                          {formatCurrency(trade.pnlUSD, currency)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Step-by-Step Pop-up Trading Activity Box */}
      <TradingActivityBox
        mode="bot_auto"
        title="Bot Autonomous Activity"
        isRunning={botConfig.isRunning}
      />
    </div>
  );
};
