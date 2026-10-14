import React, { useState, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { derivService } from '../../services/derivService';
import { formatCurrency } from '../../utils/currencies';
import {
  Globe2,
  X,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Cpu,
  Layers,
  Terminal,
  Server,
  Zap,
  PlayCircle,
  ShieldCheck,
  RefreshCw,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  HelpCircle,
  DollarSign,
  Building,
  CreditCard,
  Smartphone,
  Coins,
  CheckCircle,
} from 'lucide-react';

export const LiveBrokerModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    accountType,
    setAccountType,
    realBalance,
    demoBalance,
    currency,
    liveBrokerStatus,
    syncBrokerBalance,
  } = useTrading();

  const [appId, setAppId] = useState<string>(() => localStorage.getItem('rt_deriv_app_id') || '1089');
  const [apiToken, setApiToken] = useState<string>(() => localStorage.getItem('rt_deriv_api_token') || '');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'authorized' | 'error'>('disconnected');
  const [statusMessage, setStatusMessage] = useState<string>('Ready to connect');
  const [activeTab, setActiveTab] = useState<'connect' | 'transfers' | 'code' | 'vps'>('transfers');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const unsub = derivService.onStatusChange((status, details) => {
      setConnectionStatus(status);
      if (details) setStatusMessage(details);
    });

    const currentStatus = derivService.getStatus();
    if (currentStatus.isAuthorized) {
      setConnectionStatus('authorized');
      setStatusMessage(`Active (${currentStatus.loginId || 'Authorized'})`);
    } else if (currentStatus.isConnected) {
      setConnectionStatus('connected');
      setStatusMessage('Gateway connected. Awaiting token authorization.');
    }

    return () => {
      unsub();
    };
  }, []);

  if (activeModal !== ('liveBroker' as any)) return null;

  const handleSaveAndConnect = () => {
    derivService.setCredentials(appId, apiToken);
    derivService.connect();
  };

  const handleDisconnect = () => {
    derivService.disconnect();
    setConnectionStatus('disconnected');
    setStatusMessage('Disconnected by user');
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    syncBrokerBalance();
    setTimeout(() => setIsSyncing(false), 900);
  };

  const handleCopyCode = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-slate-100">
                Live Broker Integration & Real Funds
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Deriv API Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Transfer funds, withdraw real profits, connect broker accounts, and deploy daemon code
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('transfers')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'transfers'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Real Funds & Payout</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('connect')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'connect'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>Connect Gateway</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Integration Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vps')}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'vps'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <span>VPS Daemon</span>
          </button>
        </div>

        {/* Tab: Real Funds & Cashier Transfers */}
        {activeTab === 'transfers' && (
          <div className="space-y-4 text-xs">
            {/* Direct Answer Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>How Real Account Money & Transfers Work</span>
              </div>
              <div className="text-slate-300 space-y-2 leading-relaxed">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Can Demo / Virtual Money be Transferred to Real Money?</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    <strong>No broker in the world allows demo profits to be converted to real cash.</strong> Demo accounts are loaded with simulated paper money so you can test algorithms, verify win rates, and calibrate the market drawdown filter without risking your savings.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>How Do You Earn and Transfer Real Money with Reach Trader?</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    When you deploy the bot and switch to <strong className="text-white">Real Account</strong> with your live broker credentials (Deriv API token):
                  </p>
                  <ol className="list-decimal pl-4 text-[11px] text-slate-300 space-y-1 pt-1">
                    <li>The bot executes trades using your <span className="text-emerald-400 font-semibold">real broker balance</span>.</li>
                    <li>Every winning trade executed by the bot is <span className="text-emerald-400 font-semibold">immediately real cash credited to your broker account</span>.</li>
                    <li>You can withdraw your earnings directly to your <span className="text-cyan-400 font-semibold">Local Bank, M-Pesa / Mobile Money, or Crypto Wallet (USDT/Bitcoin)</span> at any time.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Live Broker Wallet Status Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Broker Account:</span>
                  <span className="font-mono font-bold text-slate-100">
                    {liveBrokerStatus.loginId || 'Not Connected (Using Local Simulator)'}
                  </span>
                  {liveBrokerStatus.isAuthorized && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {liveBrokerStatus.isRealAccount ? 'Real Account (CR)' : 'Demo Virtual (VRTC)'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Live Ledger Balance:</span>
                  <span className="font-mono font-extrabold text-base text-emerald-400">
                    {formatCurrency(
                      liveBrokerStatus.lastBalance !== null ? liveBrokerStatus.lastBalance : realBalance,
                      currency
                    )}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-time balance synchronization active</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  title="Query Deriv WebSocket for latest balance"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Balance</span>
                </button>

                {accountType === 'demo' ? (
                  <button
                    type="button"
                    onClick={() => setAccountType('real')}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Switch to Real
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAccountType('demo')}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all cursor-pointer"
                  >
                    Switch to Demo
                  </button>
                )}
              </div>
            </div>

            {/* Direct Broker Cashier Actions */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-200 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span>Deposit & Withdrawal Cashier Options</span>
                </div>
                <span className="text-[10px] text-slate-500">Official Deriv Cashier</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <ArrowDownCircle className="w-4 h-4" />
                    <span>Deposit Capital</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Deposit $10 to $50 using Mobile Money (M-Pesa/Airtel/MTN), Visa/MasterCard, or Crypto (USDT TRC20/BTC).
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href="https://app.deriv.com/cashier/deposit"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Deriv Cashier</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveModal('deposit')}
                      className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer transition-colors"
                    >
                      In-App Deposit
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <ArrowUpCircle className="w-4 h-4" />
                    <span>Withdraw Real Profits</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Transfer real winnings directly to your bank account, mobile money line, or external cryptocurrency wallet.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href="https://app.deriv.com/cashier/withdrawal"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-center flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Deriv Withdrawal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveModal('withdraw')}
                      className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold cursor-pointer transition-colors"
                    >
                      In-App Withdraw
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Step Practical Blueprint */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="font-bold text-slate-200">Recommended 4-Step Live Profit Blueprint:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-bold text-cyan-400">Step 1: Test & Calibrate on Demo</div>
                  <p className="text-slate-400 mt-0.5">Run 50+ trades on demo to confirm the market scanner and drawdown avoidance filters are functioning smoothly.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-bold text-emerald-400">Step 2: Deposit Small Pilot Capital</div>
                  <p className="text-slate-400 mt-0.5">Fund $10 – $30 into your Deriv Real Account via M-Pesa, Card, or Crypto to test live execution latency.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-bold text-purple-400">Step 3: Connect Token & Set Target</div>
                  <p className="text-slate-400 mt-0.5">Paste your Deriv API token, set a micro stake ($0.50–$1.00), and enter an appointed target profit ($5–$15) so the bot stops automatically.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-bold text-amber-400">Step 4: Payout to Bank / Wallet</div>
                  <p className="text-slate-400 mt-0.5">Once the target is achieved, open Withdrawal and transfer the real money straight to your bank account or crypto wallet.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Live Connection Setup */}
        {activeTab === 'connect' && (
          <div className="space-y-4 text-xs">
            {/* Live Gateway Status Indicator */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    connectionStatus === 'authorized'
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse'
                      : connectionStatus === 'connected'
                      ? 'bg-amber-400'
                      : connectionStatus === 'connecting'
                      ? 'bg-cyan-400 animate-spin'
                      : 'bg-rose-500'
                  }`}
                />
                <div>
                  <div className="font-bold text-slate-200 capitalize">
                    Status: {connectionStatus}
                  </div>
                  <div className="text-[11px] text-slate-400">{statusMessage}</div>
                </div>
              </div>

              {connectionStatus === 'authorized' ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-600/40 text-rose-300 font-bold hover:bg-rose-900/60 transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveAndConnect}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Connect Now</span>
                </button>
              )}
            </div>

            {/* Input credentials */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200">Deriv API Credentials</label>
                <a
                  href="https://app.deriv.com/account/api-token"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                >
                  <span>Get Free Token</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Deriv App ID (Default is 1089 for public test app)
                </label>
                <input
                  type="text"
                  value={appId}
                  onChange={e => setAppId(e.target.value)}
                  placeholder="1089"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Your API Token (from Deriv Account Settings &rarr; API Token)
                </label>
                <input
                  type="password"
                  value={apiToken}
                  onChange={e => setApiToken(e.target.value)}
                  placeholder="Paste your Deriv API token here..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Stored securely in your local browser storage. Token requires "Read" and "Trade" scopes.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveAndConnect}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save Credentials & Authorize Live Gateway</span>
                </button>
              </div>
            </div>

            {/* Quick explanation */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="font-bold text-slate-300">How Live Mode Works:</div>
              <ul className="list-disc pl-4 space-y-1">
                <li>When authorized, the bot connects to real-time Volatility 75 / 100 WebSocket streams.</li>
                <li>Your selected account ({accountType}) balance syncs directly with Deriv.</li>
                <li>Manual, Bulk, and Autonomous Bot trades will automatically route to Deriv live contracts.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Copy-Paste Code Blocks */}
        {activeTab === 'code' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-400 leading-relaxed">
              These ready-to-copy code blocks implement the complete broker WebSocket gateway and automated contract execution for Volatility Indices, Crash, Boom, and Forex:
            </p>

            {/* Block 1: WebSocket Client */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>1. WebSocket Client & Live Ticks Feed</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyCode(
                      `// Reach Trader - Deriv WebSocket Integration
const WS_URL = 'wss://ws.derivws.com/websockets/v3?app_id=1089&l=EN';
const ws = new WebSocket(WS_URL);

ws.onopen = () => {
  console.log('Connected to Deriv Gateway');
  // Authorize with your API Token
  ws.send(JSON.stringify({ authorize: 'YOUR_DERIV_API_TOKEN' }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.msg_type === 'authorize') {
    console.log('Authorized as:', msg.authorize.loginid, 'Balance:', msg.authorize.balance);
    // Subscribe to live tick stream for Volatility 75 Index
    ws.send(JSON.stringify({ ticks: 'R_75', subscribe: 1 }));
  }

  if (msg.msg_type === 'tick') {
    const quote = msg.tick.quote;
    console.log('Live Tick R_75:', quote);
  }
};`,
                      'block1'
                    )
                  }
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  {copiedSection === 'block1' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono text-cyan-300 leading-normal">
{`// Reach Trader - Deriv WebSocket Integration
const WS_URL = 'wss://ws.derivws.com/websockets/v3?app_id=1089&l=EN';
const ws = new WebSocket(WS_URL);

ws.onopen = () => {
  console.log('Connected to Deriv Gateway');
  // Authorize with your API Token
  ws.send(JSON.stringify({ authorize: 'YOUR_DERIV_API_TOKEN' }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.msg_type === 'authorize') {
    console.log('Authorized as:', msg.authorize.loginid, 'Balance:', msg.authorize.balance);
    // Subscribe to live tick stream for Volatility 75 Index
    ws.send(JSON.stringify({ ticks: 'R_75', subscribe: 1 }));
  }

  if (msg.msg_type === 'tick') {
    const quote = msg.tick.quote;
    console.log('Live Tick R_75:', quote);
  }
};`}
              </pre>
            </div>

            {/* Block 2: Automated Order Execution */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-cyan-400" />
                  <span>2. Contract Execution (Call / Put / Higher / Lower)</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyCode(
                      `// Execute Rise (Call) or Fall (Put) Contract
function executeContract(symbol = 'R_75', type = 'CALL', stake = 1.0, ticks = 5) {
  const request = {
    buy: 1,
    price: stake,
    parameters: {
      amount: stake,
      basis: 'stake',
      contract_type: type, // 'CALL' for BUY, 'PUT' for SELL
      currency: 'USD',
      duration: ticks,
      duration_unit: 't', // ticks
      symbol: symbol
    }
  };

  ws.send(JSON.stringify(request));
  console.log('Trade Dispatched:', type, 'on', symbol, 'Stake:', stake);
}`,
                      'block2'
                    )
                  }
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  {copiedSection === 'block2' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono text-emerald-300 leading-normal">
{`// Execute Rise (Call) or Fall (Put) Contract
function executeContract(symbol = 'R_75', type = 'CALL', stake = 1.0, ticks = 5) {
  const request = {
    buy: 1,
    price: stake,
    parameters: {
      amount: stake,
      basis: 'stake',
      contract_type: type, // 'CALL' for BUY, 'PUT' for SELL
      currency: 'USD',
      duration: ticks,
      duration_unit: 't', // ticks
      symbol: symbol
    }
  };

  ws.send(JSON.stringify(request));
  console.log('Trade Dispatched:', type, 'on', symbol, 'Stake:', stake);
}`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: VPS Cloud Daemon */}
        {activeTab === 'vps' && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Run 24/7 Without Keeping Your Browser Open</span>
              </div>
              <p className="text-[11px] text-purple-300/80 leading-relaxed">
                By deploying Reach Trader onto a cloud server or VPS (DigitalOcean, AWS, Linode, or Hetzner), your bot scans, filters drawdowns, and trades non-stop around the clock.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span>Cloud Server Deployment Commands</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyCode(
`# 1. SSH into VPS
ssh root@your-server-ip

# 2. Clone repo and install
git clone https://github.com/your-username/reach-trader.git
cd reach-trader
npm install

# 3. Build optimized production web app
npm run build

# 4. Install PM2 for 24/7 background process management
npm install -g pm2

# 5. Start background daemon
pm2 start server.ts --name "reach-trader-bot"
pm2 save
pm2 startup`,
                      'block3'
                    )
                  }
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  {copiedSection === 'block3' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Commands</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 overflow-x-auto text-[11px] font-mono text-purple-300 leading-normal">
{`# 1. SSH into VPS
ssh root@your-server-ip

# 2. Clone repo and install
git clone https://github.com/your-username/reach-trader.git
cd reach-trader
npm install

# 3. Build optimized production web app
npm run build

# 4. Install PM2 for 24/7 background process management
npm install -g pm2

# 5. Start background daemon
pm2 start server.ts --name "reach-trader-bot"
pm2 save
pm2 startup`}
              </pre>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Deriv WebSocket API v3 Protocol</span>
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
