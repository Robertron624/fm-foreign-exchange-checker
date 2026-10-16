import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { POPULAR_CURRENCIES } from "../constants";
import { useClickOutside } from "../hooks/useClickOutside";
import { Flag } from "./Icons";

const displayNames =
  typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "currency" })
    : null;

const NAME_OVERRIDES: Record<string, string> = {
  AED: "UAE Dirham",
  USD: "US Dollar",
};

export function currencyName(code: string) {
  return NAME_OVERRIDES[code] ?? displayNames?.of(code) ?? code;
}

function Option({
  code,
  selected,
  onPick,
}: Readonly<{ code: string; selected: boolean; onPick: (c: string) => void }>) {
  return (
    <li role="option" aria-selected={selected}>
      <button
        type="button"
        className="currency-trader__option"
        onClick={() => onPick(code)}
      >
        <Flag code={code} />
        <span className="currency-trader__currency">{code}</span>
        <span className="currency-trader__currency-name">
          {currencyName(code)}
        </span>
        {selected && (
          <img
            className="currency-trader__check"
            src="/images/icon-check.svg"
            alt=""
            width={14}
            height={14}
          />
        )}
      </button>
    </li>
  );
}

function Section({
  title,
  codes,
  value,
  onPick,
}: Readonly<{
  title: string;
  codes: string[];
  value: string;
  onPick: (c: string) => void;
}>) {
  return (
    <>
      <li role="presentation" className="currency-trader__section">
        <span>{title}</span>
        <span>{codes.length}</span>
      </li>
      {codes.map((c) => (
        <Option key={c} code={c} selected={c === value} onPick={onPick} />
      ))}
    </>
  );
}

export default function CurrencyPicker({
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
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);
  useClickOutside(ref, open, close);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const { popular, other, results } = useMemo(() => {
    const popular = POPULAR_CURRENCIES.filter((c) => options.includes(c));
    const other = options.filter(
      (c) => !(POPULAR_CURRENCIES as readonly string[]).includes(c),
    );
    const q = query.trim().toLowerCase();
    const results = q
      ? options.filter(
          (c) =>
            c.toLowerCase().includes(q) ||
            currencyName(c).toLowerCase().includes(q),
        )
      : null;
    return { popular, other, results };
  }, [options, query]);

  const pick = (c: string) => {
    onChange(c);
    close();
  };

  let optionsContent;
  if (results === null) {
    optionsContent = (
      <>
        <Section
          title="POPULAR"
          codes={popular}
          value={value}
          onPick={pick}
        />
        <Section
          title="OTHER CURRENCIES"
          codes={other}
          value={value}
          onPick={pick}
        />
      </>
    );
  } else if (results.length > 0) {
    optionsContent = results.map((c) => (
      <Option key={c} code={c} selected={c === value} onPick={pick} />
    ));
  } else {
    optionsContent = (
      <li aria-live="polite" className="currency-trader__empty">
        No currencies found
      </li>
    );
  }

  return (
    <div className="currency-trader__select" ref={ref}>
      <button
        type="button"
        className="currency-trader__select-button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label} currency: ${value}`}
        onClick={() => (open ? close() : setOpen(true))}
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
        <div
          className="currency-trader__menu"
          role="dialog"
          aria-label={`${label} currency picker`}
          onKeyDown={(e) => e.key === "Escape" && close()}
        >
          <label className="currency-trader__search">
            <img src="/images/icon-search.svg" alt="" width={14} height={20} />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search currencies ..."
              aria-label="Search currencies"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <ul
            className="currency-trader__options"
            role="listbox"
            aria-label={`${label} currency`}
          >
            {optionsContent}
          </ul>
        </div>
      )}
    </div>
  );
}
