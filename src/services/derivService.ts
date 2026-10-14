/**
 * Deriv Real-World Broker Integration Service
 * Connects Reach Trader to the official Deriv WebSocket API (wss://ws.derivws.com/websockets/v3)
 * Supports live ticks, balance sync, and real or virtual contract execution.
 */

export interface DerivConfig {
  appId: string;
  apiToken: string;
  endpoint?: string;
  accountType?: 'demo' | 'real';
}

export interface DerivTick {
  symbol: string;
  quote: number;
  epoch: number;
}

export interface DerivProposalOpenContract {
  contract_id: number;
  barrier: string;
  buy_price: number;
  currency: string;
  date_start: number;
  is_sold: number;
  profit: number;
  status: 'open' | 'won' | 'lost';
}

type TickCallback = (tick: DerivTick) => void;
type StatusCallback = (status: 'disconnected' | 'connecting' | 'connected' | 'authorized' | 'error', details?: string) => void;
export type BalanceCallback = (balance: number, currency: string, loginId: string) => void;

class DerivWebSocketService {
  private ws: WebSocket | null = null;
  private config: DerivConfig = {
    appId: localStorage.getItem('rt_deriv_app_id') || '1089',
    apiToken: localStorage.getItem('rt_deriv_api_token') || '',
    endpoint: 'wss://ws.derivws.com/websockets/v3',
    accountType: (localStorage.getItem('at_account_type') as 'demo' | 'real') || 'demo',
  };

  private tickSubscribers: Map<string, Set<TickCallback>> = new Map();
  private statusSubscribers: Set<StatusCallback> = new Set();
  private balanceSubscribers: Set<BalanceCallback> = new Set();
  private isAuthorized: boolean = false;
  private authorizedAccount: string | null = null;
  private lastBalance: number | null = null;
  private lastCurrency: string = 'USD';
  private pingInterval: any = null;
  private reconnectTimeout: any = null;

  // Map internal market IDs to Deriv broker symbols
  public readonly symbolMap: Record<string, string> = {
    'vol-10': 'R_10',
    'vol-25': 'R_25',
    'vol-50': 'R_50',
    'vol-75': 'R_75',
    'vol-100': 'R_100',
    'step-index': 'stpRNG',
    'crash-500': 'CRASH500',
    'boom-500': 'BOOM500',
    'jump-75': 'JD75',
    'eur-usd': 'frxEURUSD',
    'gbp-usd': 'frxGBPUSD',
    'btc-usd': 'cryBTCUSD',
  };

  // Reverse mapping from Deriv symbol to local ID
  public readonly reverseSymbolMap: Record<string, string> = {
    'R_10': 'vol-10',
    'R_25': 'vol-25',
    'R_50': 'vol-50',
    'R_75': 'vol-75',
    'R_100': 'vol-100',
    'stpRNG': 'step-index',
    'CRASH500': 'crash-500',
    'BOOM500': 'boom-500',
    'JD75': 'jump-75',
    'frxEURUSD': 'eur-usd',
    'frxGBPUSD': 'gbp-usd',
    'cryBTCUSD': 'btc-usd',
  };

  constructor() {
    // Attempt automatic connection if token or app id is present in localStorage
    if (this.config.apiToken && this.config.apiToken.trim().length > 0) {
      this.connect();
    }
  }

  public getConfig(): DerivConfig {
    return { ...this.config };
  }

  public setCredentials(appId: string, apiToken: string) {
    this.config.appId = appId || '1089';
    this.config.apiToken = apiToken.trim();
    localStorage.setItem('rt_deriv_app_id', this.config.appId);
    localStorage.setItem('rt_deriv_api_token', this.config.apiToken);
    
    // Reconnect with new credentials
    this.disconnect();
    if (this.config.apiToken) {
      this.connect();
    }
  }

  public onStatusChange(callback: StatusCallback) {
    this.statusSubscribers.add(callback);
    return () => this.statusSubscribers.delete(callback);
  }

  public onBalanceChange(callback: BalanceCallback) {
    this.balanceSubscribers.add(callback);
    if (this.lastBalance !== null && this.authorizedAccount) {
      callback(this.lastBalance, this.lastCurrency, this.authorizedAccount);
    }
    return () => this.balanceSubscribers.delete(callback);
  }

  private notifyStatus(status: 'disconnected' | 'connecting' | 'connected' | 'authorized' | 'error', details?: string) {
    this.statusSubscribers.forEach(cb => cb(status, details));
  }

  private notifyBalance(balance: number, currency: string, loginId: string) {
    this.balanceSubscribers.forEach(cb => cb(balance, currency, loginId));
  }

  public fetchBalance() {
    if (this.isAuthorized && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({ balance: 1 });
    }
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const endpoint = `${this.config.endpoint}?app_id=${encodeURIComponent(this.config.appId)}&l=EN`;
    this.notifyStatus('connecting', 'Connecting to Deriv WebSocket gateway...');

    try {
      this.ws = new WebSocket(endpoint);

      this.ws.onopen = () => {
        this.notifyStatus('connected', 'Gateway connected. Authorizing session...');
        this.startKeepAlive();
        if (this.config.apiToken) {
          this.authorize(this.config.apiToken);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingMessage(data);
        } catch (e) {
          console.error('[DerivWS] Failed to parse message', e);
        }
      };

      this.ws.onerror = (err) => {
        console.error('[DerivWS] Error', err);
        this.notifyStatus('error', 'WebSocket connection error');
      };

      this.ws.onclose = () => {
        this.isAuthorized = false;
        this.stopKeepAlive();
        this.notifyStatus('disconnected', 'Disconnected from Deriv');
      };
    } catch (err: any) {
      this.notifyStatus('error', err?.message || 'Failed to initialize WebSocket');
    }
  }

  public disconnect() {
    this.stopKeepAlive();
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.isAuthorized = false;
    this.notifyStatus('disconnected');
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ ping: 1 });
      }
    }, 30000);
  }

  private stopKeepAlive() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public send(payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }

  public authorize(token: string) {
    return this.send({ authorize: token });
  }

  private handleIncomingMessage(msg: any) {
    // 1. Authorization Response
    if (msg.msg_type === 'authorize') {
      if (msg.error) {
        this.isAuthorized = false;
        this.notifyStatus('error', msg.error.message || 'Authorization failed');
      } else {
        this.isAuthorized = true;
        this.authorizedAccount = msg.authorize.loginid;
        const bal = msg.authorize.balance !== undefined ? Number(msg.authorize.balance) : 0;
        const cur = msg.authorize.currency || 'USD';
        this.lastBalance = bal;
        this.lastCurrency = cur;
        
        this.notifyStatus('authorized', `Connected as ${msg.authorize.loginid} (${cur} ${bal.toFixed(2)})`);
        this.notifyBalance(bal, cur, msg.authorize.loginid);
        
        // Subscribe to live balance stream
        this.send({ balance: 1, subscribe: 1 });

        // Resubscribe to needed tick streams
        this.tickSubscribers.forEach((_, symbol) => {
          this.send({ ticks: symbol, subscribe: 1 });
        });
      }
      return;
    }

    // 2. Real-time Broker Balance Stream
    if ((msg.msg_type === 'balance' || msg.balance) && msg.balance) {
      const bal = Number(msg.balance.balance);
      const cur = msg.balance.currency || this.lastCurrency || 'USD';
      const loginId = msg.balance.loginid || this.authorizedAccount || '';
      this.lastBalance = bal;
      this.lastCurrency = cur;
      this.notifyBalance(bal, cur, loginId);
      return;
    }

    // 3. Ticks Stream
    if (msg.msg_type === 'tick' && msg.tick) {
      const derivSymbol = msg.tick.symbol;
      const tickData: DerivTick = {
        symbol: derivSymbol,
        quote: Number(msg.tick.quote),
        epoch: Number(msg.tick.epoch),
      };

      const callbacks = this.tickSubscribers.get(derivSymbol);
      if (callbacks) {
        callbacks.forEach(cb => cb(tickData));
      }
      return;
    }

    // 4. Trade Purchase / Execution response
    if (msg.msg_type === 'buy') {
      if (msg.error) {
        console.error('[DerivWS] Buy contract error:', msg.error);
      } else {
        console.log('[DerivWS] Buy contract executed:', msg.buy);
        // Request updated live ledger balance after contract purchase
        setTimeout(() => this.fetchBalance(), 1000);
      }
      return;
    }
  }

  /**
   * Subscribe to live tick feeds for a specific symbol
   */
  public subscribeTicks(localMarketId: string, callback: TickCallback): () => void {
    const derivSymbol = this.symbolMap[localMarketId] || 'R_75';

    if (!this.tickSubscribers.has(derivSymbol)) {
      this.tickSubscribers.set(derivSymbol, new Set());
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ ticks: derivSymbol, subscribe: 1 });
      }
    }

    this.tickSubscribers.get(derivSymbol)!.add(callback);

    // Return un-subscriber
    return () => {
      const set = this.tickSubscribers.get(derivSymbol);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.tickSubscribers.delete(derivSymbol);
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.send({ forget: derivSymbol });
          }
        }
      }
    };
  }

  /**
   * Buy a Rise/Fall (Call/Put) Contract in Deriv
   */
  public buyContract(
    localMarketId: string,
    type: 'BUY' | 'SELL',
    stakeUSD: number,
    ticks: number = 5
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isAuthorized) {
        return reject(new Error('Deriv live account is not authorized. Enter API Token in Settings.'));
      }

      const derivSymbol = this.symbolMap[localMarketId] || 'R_75';
      const contractType = type === 'BUY' ? 'CALL' : 'PUT';

      const payload = {
        buy: 1,
        price: stakeUSD,
        parameters: {
          amount: stakeUSD,
          basis: 'stake',
          contract_type: contractType,
          currency: 'USD',
          duration: Math.max(1, Math.min(ticks, 10)),
          duration_unit: 't', // ticks
          symbol: derivSymbol,
        },
      };

      const success = this.send(payload);
      if (!success) {
        return reject(new Error('WebSocket connection is not ready.'));
      }

      resolve({ status: 'sent', payload });
    });
  }

  public getStatus() {
    return {
      isConnected: this.ws?.readyState === WebSocket.OPEN,
      isAuthorized: this.isAuthorized,
      loginId: this.authorizedAccount,
      appId: this.config.appId,
      hasToken: Boolean(this.config.apiToken && this.config.apiToken.length > 5),
      lastBalance: this.lastBalance,
      lastCurrency: this.lastCurrency,
      isRealAccount: this.authorizedAccount ? !this.authorizedAccount.toUpperCase().startsWith('VRTC') : false,
    };
  }
}

export const derivService = new DerivWebSocketService();
