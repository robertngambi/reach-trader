import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { ChevronDown, Search } from 'lucide-react';

interface AssetSelectorProps {
  selectedAssetId?: string;
  onSelectAssetId?: (id: string) => void;
  title?: string;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  selectedAssetId,
  onSelectAssetId,
  title = 'Choose Asset',
}) => {
  const { markets, selectedMarket, setSelectedMarketId } = useTrading();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentAsset = selectedAssetId
    ? markets.find(m => m.id === selectedAssetId) || selectedMarket
    : selectedMarket;

  const handleSelect = (id: string) => {
    if (onSelectAssetId) {
      onSelectAssetId(id);
    } else {
      setSelectedMarketId(id);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredMarkets = markets.filter(
    m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      <span className="text-xs font-bold text-slate-300 mb-1.5">{title}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-sm font-bold text-slate-100 transition-all cursor-pointer shadow-sm text-left"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="truncate">{currentAsset.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 font-mono-numbers shrink-0">
              {currentAsset.volatilityRate}x Vol
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 right-0 mt-2 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 max-h-80 overflow-y-auto">
              <div className="px-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search asset or category..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-slate-200 outline-none text-xs"
                    autoFocus
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-800/60 pt-1">
                {filteredMarkets.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelect(m.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-800 transition-colors cursor-pointer ${
                      currentAsset.id === m.id ? 'bg-slate-800/80 text-emerald-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-100">{m.name}</div>
                      <div className="text-[10px] text-slate-500">{m.category}</div>
                    </div>
                    <div className="text-right font-mono-numbers">
                      <div className="text-slate-200">{m.currentPrice.toFixed(m.id === 'forex-eurusd' ? 4 : 2)}</div>
                      <div
                        className={`text-[10px] ${
                          m.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {m.change24h >= 0 ? '+' : ''}
                        {m.change24h}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
