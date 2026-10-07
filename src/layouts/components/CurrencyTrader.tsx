import { useEffect, useRef, useState } from "react";
import { CURRENCY_FLAGS, REFRESH_INTERVAL } from "../../constants";
import type { LoadStatus } from "../../types";
import "./CurrencyTrader.scss";
import { FilledStarIcon } from "../../components/Icons";

type Rates = Record<string, number>;

function Flag({ code }: Readonly<{ code: string }>) {
  const flag = CURRENCY_FLAGS[code];
  if (!flag)
    return <span className="currency-trader__flag" aria-hidden="true" />;
  return (
    <img
      className="currency-trader__flag"
      src={`/images/flags/${flag}.webp`}
      alt=""
      width={20}
      height={20}
    />
  );
}

function DashedBorder() {
  const dashLength = 10;
  const gapLength = 6;
  const dashColor = "var(--color-neutral-400)";
  const borderHeight = 1;

  return (
    <div
      style={{
        height: `${borderHeight}px`,
        backgroundImage: `linear-gradient(to right, ${dashColor} 50%, transparent 50%)`,
        backgroundPosition: "bottom",
        backgroundSize: `${dashLength + gapLength}px ${borderHeight}px`,
        backgroundRepeat: "repeat-x",
      }}
    ></div>
  );
}

function CurrencySelect({
  value,
  options,
  label,
  onChange,
}: Readonly<{
  value: string;
  options: string[];
  label: string;
  onChange: (c: string) => void;
}>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="currency-trader__select" ref={ref}>
      <button
        type="button"
        className="currency-trader__select-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label} currency: ${value}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      >
        <Flag code={value} />
        <span className="currency-trader__currency">{value}</span>
        <img
          src="/images/icon-chevron-down.svg"
          alt=""
          width={12}
          height={12}
        />
      </button>
      {open && (
        <ul
          className="currency-trader__options"
          role="listbox"
          aria-label={`${label} currency`}
        >
          {options.map((c) => (
            <li key={c} role="option" aria-selected={c === value}>
              <button
                type="button"
                className="currency-trader__option"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
              >
                <Flag code={c} />
                <span className="currency-trader__currency">{c}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CurrencyTrader() {
  const [rates, setRates] = useState<Rates>({});
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [retry, setRetry] = useState(0);
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");

  function handleAddToFavorites() {
    // Implement the logic to add the current currency pair to favorites
  }

  function handleLogConversion() {
    // Implement the logic to log the current conversion
  }

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch(
          "https://api.frankfurter.dev/v1/latest?base=USD",
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setRates({ USD: 1, ...data.rates });
        setStatus("ready");
      } catch (err) {
        console.error(err);
        if (!controller.signal.aborted)
          setStatus((s) => (s === "ready" ? s : "error"));
      }
    };
    load();
    const timer = setInterval(load, REFRESH_INTERVAL);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [retry]);

  const currencies = Object.keys(rates).sort((a, b) => a.localeCompare(b));
  const parsed = Number.parseFloat(amount);
  const rateFrom = rates[from];
  const rateTo = rates[to];
  const result =
    status === "ready" && Number.isFinite(parsed) && rateFrom > 0 && rateTo > 0
      ? (parsed / rateFrom) * rateTo
      : null;
  const formatted =
    result === null
      ? "—"
      : new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
          result,
        );

  const swap = () => {
    setFrom(to);
    setTo(from);
  };
  const options = currencies.length ? currencies : [from, to];

  return (
    <section className="currency-trader">
      <h2 className="currency-trader__title">CHECK THE RATE</h2>

      <div className="currency-trader__column">
        <div className="currency-trader__rows">
          <div className="currency-trader__row">
            <div className="currency-trader__field">
              <span className="currency-trader__label">SEND</span>
              <input
                className="currency-trader__amount"
                type="number"
                inputMode="decimal"
                min="0"
                value={amount}
                aria-label="Amount to send"
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <CurrencySelect
              value={from}
              options={options}
              label="Send"
              onChange={setFrom}
            />
          </div>

          <button
            type="button"
            className="currency-trader__swap"
            aria-label="Swap currencies"
            onClick={swap}
          >
            <img
              src="/images/icon-exchange-vertical.svg"
              alt=""
              width={20}
              height={20}
            />
          </button>

          <div className="currency-trader__row">
            <div className="currency-trader__field">
              <span className="currency-trader__label">RECEIVE</span>
              <output
                className="currency-trader__amount received"
                aria-live="polite"
              >
                {formatted}
              </output>
            </div>
            <CurrencySelect
              value={to}
              options={options}
              label="Receive"
              onChange={setTo}
            />
          </div>
        </div>
        <DashedBorder />

        <div className="currency-trader__current-rate">
          {status === "ready" && rateFrom > 0 && rateTo > 0 && (
            <p>
              1 {from} = {(rateTo / rateFrom).toFixed(4)} {to}
            </p>
          )}
          <div className="buttons">
            <button
              className="currency-trader__add-to-favorites"
              type="button"
              onClick={handleAddToFavorites}
            >
              <FilledStarIcon fillColor="var(--color-neutral-900)" width={16} height={16} />
              FAVORITED
            </button>
            <button
              className="currency-trader__log-conversion"
              type="button"
              onClick={handleLogConversion}
            >
              LOG CONVERSION
            </button>
          </div>
        </div>
      </div>
      {status === "error" && (
        <p className="currency-trader__error" role="alert">
          Couldn't load rates.{" "}
          <button
            type="button"
            onClick={() => {
              setStatus("loading");
              setRetry((r) => r + 1);
            }}
          >
            Retry
          </button>
        </p>
      )}
    </section>
  );
}
