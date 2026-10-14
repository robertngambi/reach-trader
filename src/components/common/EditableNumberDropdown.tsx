import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface EditableNumberDropdownProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  options: number[];
  min?: number;
  max?: number;
  disabled?: boolean;
  allowDecimals?: boolean;
  suffix?: string;
}

export const EditableNumberDropdown: React.FC<EditableNumberDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  min = 1,
  max = 10000,
  disabled = false,
  allowDecimals = false,
  suffix,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState<string>(() => {
    if (value === undefined || value === null || isNaN(value)) return min.toString();
    return value.toString();
  });
  const isFocusedRef = useRef(false);

  // Sync external value changes into local input string when not actively typing
  useEffect(() => {
    const parsed = parseFloat(text);
    if (isNaN(parsed) || Math.abs(parsed - value) > 0.0001) {
      setText(value > 0 ? (allowDecimals ? value.toString() : Math.round(value).toString()) : '');
    }
  }, [value, allowDecimals]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow user to empty input so they can type freely from 1
    if (raw === '') {
      setText('');
      return;
    }

    if (allowDecimals) {
      if (!/^\d*\.?\d*$/.test(raw)) return;
    } else {
      if (!/^\d*$/.test(raw)) return;
    }

    setText(raw);

    if (!raw.endsWith('.')) {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed >= min) {
        onChange(parsed);
      }
    }
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
    if (text === '' || text === '.') {
      const fallback = min;
      setText(fallback.toString());
      onChange(fallback);
      return;
    }

    const parsed = parseFloat(text);
    if (isNaN(parsed) || parsed < min) {
      const fallback = min;
      setText(fallback.toString());
      onChange(fallback);
    } else if (max !== undefined && parsed > max) {
      setText(max.toString());
      onChange(max);
    } else {
      const formatted = allowDecimals ? parsed.toString() : Math.round(parsed).toString();
      setText(formatted);
      onChange(parsed);
    }
  };

  return (
    <div className="flex flex-col justify-between">
      <label className="text-xs font-bold text-slate-200 mb-1.5 block">
        {label}
      </label>

      <div className="relative">
        <div className="flex items-center bg-slate-950 border border-slate-700 focus-within:border-emerald-500 rounded-xl overflow-hidden">
          <input
            type="text"
            inputMode={allowDecimals ? 'decimal' : 'numeric'}
            disabled={disabled}
            value={text}
            onChange={handleInputChange}
            onFocus={() => {
              isFocusedRef.current = true;
            }}
            onBlur={handleBlur}
            placeholder={min.toString()}
            className="w-full bg-transparent px-3 py-2 text-sm font-bold font-mono-numbers text-slate-100 outline-none"
          />
          {suffix && (
            <span className="text-xs text-slate-400 font-mono-numbers pr-2 select-none">
              {suffix}
            </span>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(prev => !prev)}
            className="px-2.5 py-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-l border-slate-800 transition-colors cursor-pointer"
            title="Choose from list"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {isOpen && !disabled && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 shadow-2xl rounded-xl py-1 z-50 max-h-48 overflow-y-auto">
              {options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setText(opt.toString());
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-xs text-left font-mono-numbers hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between ${
                    value === opt ? 'bg-emerald-950/40 text-emerald-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  <span>{opt}</span>
                  {value === opt && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
