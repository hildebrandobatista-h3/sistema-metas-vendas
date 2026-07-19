import { useState, useRef, useEffect } from "react";

const formatCurrency = (value) => {
  if (!value && value !== 0) return "";
  const num = Number(value);
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const parseCurrency = (formatted) => {
  if (!formatted) return 0;
  const numStr = formatted.replace(/\D/g, "");
  return numStr ? parseInt(numStr, 10) / 100 : 0;
};

export default function CurrencyInput({
  value,
  onChange,
  onKeyDown,
  onBlur,
  disabled = false,
  placeholder = "—",
  autoFocus = false,
}) {
  const [displayValue, setDisplayValue] = useState(formatCurrency(value));
  const inputRef = useRef(null);

  useEffect(() => {
    setDisplayValue(formatCurrency(value));
  }, [value]);

  const handleChange = (e) => {
    const input = e.target.value;
    const numeric = input.replace(/\D/g, "");
    const numValue = numeric ? parseInt(numeric, 10) : 0;

    setDisplayValue(formatCurrency(numValue));
    onChange(numValue);
  };

  const handleKeyDown = (e) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const handleFocus = (e) => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="w-40 px-3 py-2 border border-gray-300 rounded text-right text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
      inputMode="numeric"
    />
  );
}
