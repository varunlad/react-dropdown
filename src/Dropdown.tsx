import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

export type Option = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type DropdownProps = {
  options: Option[];
  value: string[];                 // always an array, even in single mode
  onChange: (value: string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  placeholder?: string;
  accentColor?: string;            // e.g. "#ec4899" or "tomato"
};

const styles = `
.dd {
  --dd-accent: #6366f1;
  --dd-soft: color-mix(in srgb, var(--dd-accent) 14%, white);
  position: relative;
  width: min(260px, 100%);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: #1f2937;
  color-scheme: light;
  text-align: left;
}

.dd-trigger {
  box-sizing: border-box;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: transform .15s ease;
  min-width: 0;
}
.dd-trigger:active { transform: scale(.98); }
.dd-trigger:focus,
.dd-trigger:focus-visible { outline: none; }

.dd-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
.dd-text.placeholder { color: #9ca3af; font-weight: 400; }

.dd-arrow {
  color: var(--dd-accent);
  transition: transform .25s ease;
  flex-shrink: 0;
}
.dd-trigger[aria-expanded="true"] .dd-arrow { transform: rotate(180deg); }

.dd-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  box-shadow: 0 10px 25px -8px rgba(0, 0, 0, .25);
  overflow: hidden;
  transform-origin: top center;
  animation: dd-pop .22s cubic-bezier(.34, 1.56, .64, 1);
}
@keyframes dd-pop {
  from { opacity: 0; transform: translateY(-6px) scale(.96); }
  to   { opacity: 1; transform: none; }
}

.dd-search {
  box-sizing: border-box;
  width: calc(100% - 12px);
  margin: 6px;
  padding: 5px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  color: #1f2937;
  font: inherit;
  font-size: 14px;
}
.dd-search:focus { outline: none; }
.dd-search:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.dd-list {
  list-style: none;
  margin: 0;
  padding: 4px;
  max-height: 220px;
  overflow-y: auto;
}

.dd-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  min-width: 0;
  transition: background .15s ease, color .15s ease, transform .15s ease;
}
.dd-option:active { transform: scale(.98); }
.dd-option.active { background: var(--dd-soft); }
.dd-option.selected { color: var(--dd-accent); font-weight: 600; }
.dd-option.disabled { opacity: .45; cursor: not-allowed; }

.dd-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dd-box {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border: 1.5px solid #cbd5e1;
  border-radius: 4px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 11px;
  line-height: 1;
  transition: background .2s ease, border-color .2s ease;
}
.dd-option.selected .dd-box {
  background: var(--dd-accent);
  border-color: var(--dd-accent);
  animation: dd-bounce .3s ease;
}
@keyframes dd-bounce {
  0%   { transform: scale(.6); }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.dd-tick {
  flex-shrink: 0;
  color: var(--dd-accent);
  font-weight: 700;
}

.dd-empty {
  padding: 10px;
  text-align: left;
  color: #9ca3af;
  font-size: 14px;
}

@media (prefers-reduced-motion: reduce) {
  .dd *, .dd *::before, .dd *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

export function Dropdown({
  options,
  value,
  onChange,
  multiple = false,
  searchable = false,
  placeholder = "Select...",
  accentColor,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const noData = !options || options.length === 0;

  const filtered = useMemo(
    () =>
      (options ?? []).filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
      ),
    [options, query]
  );

  const selectedOptions = (options ?? []).filter((o) => value.includes(o.value));

  // Trigger text: placeholder, "N selected" for multi with 2+, or the label
  let triggerText: string;
  if (selectedOptions.length === 0) {
    triggerText = placeholder;
  } else if (multiple && selectedOptions.length > 1) {
    triggerText = `${selectedOptions.length} selected`;
  } else {
    triggerText = selectedOptions.map((o) => o.label).join(", ");
  }

  // Close when clicking outside the dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function select(optionValue: string) {
    if (multiple) {
      onChange(
        value.includes(optionValue)
          ? value.filter((v) => v !== optionValue)
          : [...value, optionValue]
      );
    } else {
      onChange([optionValue]);
      setOpen(false);
      setQuery("");
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter": {
        e.preventDefault();
        const item = filtered[activeIndex];
        if (item && !item.disabled) select(item.value);
        break;
      }
      case "Escape":
        setOpen(false);
        break;
    }
  }

  const rootStyle = accentColor
    ? ({ "--dd-accent": accentColor } as CSSProperties)
    : undefined;

  return (
    <div className="dd" ref={rootRef} onKeyDown={handleKeyDown} style={rootStyle}>
      <style>{styles}</style>

      <button
        type="button"
        className="dd-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        title={triggerText}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`dd-text${selectedOptions.length === 0 ? " placeholder" : ""}`}
          title={triggerText}
        >
          {triggerText}
        </span>
        <span className="dd-arrow" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="dd-panel">
          {searchable && (
            <input
              className="dd-search"
              autoFocus
              disabled={noData}
              placeholder="Search..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
            />
          )}

          <ul role="listbox" aria-multiselectable={multiple} className="dd-list">
            {filtered.length === 0 && !noData && (
              <li className="dd-empty">No results</li>
            )}

            {noData && <li className="dd-empty">No data</li>}

            {filtered.map((o, i) => {
              const selected = value.includes(o.value);
              const classes = [
                "dd-option",
                i === activeIndex ? "active" : "",
                selected ? "selected" : "",
                o.disabled ? "disabled" : "",
              ].join(" ").trim();

              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={o.disabled}
                  className={classes}
                  title={o.label}
                  onMouseEnter={() => setActiveIndex(i)}
                  // mousedown + preventDefault keeps focus in the search box
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!o.disabled) select(o.value);
                  }}
                >
                  {multiple ? (
                    <span className="dd-box">{selected ? "✓" : ""}</span>
                  ) : null}
                  <span className="dd-label">{o.label}</span>
                  {!multiple && selected && <span className="dd-tick">✓</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}