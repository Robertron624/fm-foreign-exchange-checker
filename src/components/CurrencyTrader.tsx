import { useState } from "react";
import { CURRENCY_FLAGS } from "../constants";
import CurrencySelect from "./CurrencyPicker";
import { useConversionLog } from "../hooks/useConversionLog";
import { pairKey, useFavorites } from "../hooks/useFavorites";
import { useLatestRates } from "../hooks/useLatestRates";
import "./CurrencyTrader.scss";
import { FilledStarIcon, OutlineStarIcon } from "./Icons";

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

export default function CurrencyTrader() {
  const { rates, status, retry } = useLatestRates();
  const [amount, setAmount] = useState("1000");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const { favorites, toggle } = useFavorites();
  const isFavorite = favorites.includes(pairKey(from, to));
  const { add: addLog } = useConversionLog();

  const currencies = Object.keys(rates).filter((c) => c in CURRENCY_FLAGS).sort((a, b) => a.localeCompare(b));
  const parsed = Number.parseFloat(amount);
  const receiveParsed = Number.parseFloat(receiveAmount);
  const rateFrom = rates[from];
  const rateTo = rates[to];
  
  const result =
    status === "ready" && Number.isFinite(parsed) && rateFrom > 0 && rateTo > 0
      ? (parsed / rateFrom) * rateTo
      : null;
  
  const reverseResult =
    status === "ready" && Number.isFinite(receiveParsed) && rateFrom > 0 && rateTo > 0
      ? (receiveParsed / rateTo) * rateFrom
      : null;

  const handleSendChange = (value: string) => {
    setAmount(value);
    setReceiveAmount("");
  };

  const handleReceiveChange = (value: string) => {
    setReceiveAmount(value);
    setAmount("");
  };

  let formatted: string;
  if (receiveAmount && Number.isFinite(receiveParsed) && reverseResult !== null) {
    formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(reverseResult);
  } else if (result === null) {
    formatted = "—";
  } else {
    formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(result);
  }

  const handleLogConversion = () => {
    if (receiveAmount && Number.isFinite(reverseResult) && reverseResult !== null) {
      addLog({ from: to, to: from, amount: receiveParsed, result: reverseResult });
    } else if (result === null) {
      return;
    } else {
      addLog({ from, to, amount: parsed, result });
    }
  };

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
                onChange={(e) => handleSendChange(e.target.value)}
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
              <input
                className="currency-trader__amount received"
                type="number"
                inputMode="decimal"
                min="0"
                value={receiveAmount || formatted}
                aria-label="Amount to receive"
                onChange={(e) => handleReceiveChange(e.target.value)}
              />
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
              aria-pressed={isFavorite}
              onClick={() => toggle(pairKey(from, to))}
            >
              {isFavorite ? (
                <FilledStarIcon fillColor="var(--color-neutral-900)" width={16} height={16} />
              ) : (
                <OutlineStarIcon strokeColor="var(--color-lime-500)" width={16} height={16} />
              )}
              {isFavorite ? "FAVORITED" : "FAVORITE"}
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
            onClick={retry}
          >
            Retry
          </button>
        </p>
      )}
    </section>
  );
}
