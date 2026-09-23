"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  usePhoneInput,
  defaultCountries,
  parseCountry,
} from "react-international-phone";

// ISO2 ülke kodunu Bayrak Emoji'sine dönüştürür
function getFlagEmoji(iso2) {
  if (!iso2) return "🌐";
  return iso2
      .toUpperCase()
      .replace(/./g, (char) =>
          String.fromCodePoint(127397 + char.charCodeAt(0))
      );
}

export function normalizePhoneToE164(phone) {
  if (!phone) return "";
  const trimmed = String(phone).trim();
  if (trimmed.startsWith("+")) return trimmed.replace(/[^\d+]/g, "");
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+90${digits.slice(1)}`;
  }
  return digits ? `+${digits}` : "";
}

export function PhoneInput({
                             value = "",
                             onChange,
                             id,
                             className,
                             selectClassName,
                             inputClassName,
                             autoComplete = "tel",
                             defaultCountry = "tr",
                             ...props
                           }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // react-international-phone hook'u
  const {
    inputValue,
    handlePhoneValueChange,
    inputRef,
    country,
    setCountry,
  } = usePhoneInput({
    defaultCountry,
    value,
    onChange: (data) => {
      onChange?.(data.phone);
    },
    // Input alanında ülke kodunun düzenlenebilmesini sağlar (+90, +1 vs.)
    disableDialCodeAndPrefix: false,
  });

  // Ülke listesini parse ediyoruz
  const parsedCountries = useMemo(() => {
    return defaultCountries.map((c) => parseCountry(c));
  }, []);

  // Arama filtresi (Ülke adı, ISO kodu veya alan kodu)
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return parsedCountries;
    const q = searchQuery.toLowerCase().trim();
    return parsedCountries.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(q);
      const isoMatch = c.iso2.toLowerCase().includes(q);
      const dialMatch = c.dialCode.includes(q.replace("+", ""));
      return nameMatch || isoMatch || dialMatch;
    });
  }, [parsedCountries, searchQuery]);

  // Menü dışına tıklandığında menüyü kapat
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Menü açıldığında otomatik arama girdisine odaklan
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleSelectCountry = (iso2) => {
    setCountry(iso2);
    setIsOpen(false);
  };

  return (
      <div className={cn("relative flex w-full items-stretch gap-1.5", className)}>
        {/* Arama Yapılabilir Ülke Seçim Butonu ve Menüsü */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm h-full outline-none hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
                  selectClassName
              )}
              aria-label="Ülke seç"
              aria-expanded={isOpen}
          >
            <span className="text-base leading-none">{getFlagEmoji(country.iso2)}</span>
            <span className="font-medium text-foreground">+{country.dialCode}</span>
            <svg
                className={cn(
                    "h-3.5 w-3.5 opacity-50 transition-transform duration-200",
                    isOpen && "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Açılır Arama Penceresi */}
          {isOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-popover p-1.5 shadow-md text-popover-foreground">
                <div className="p-1">
                  <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Ülke veya kod ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 text-xs"
                  />
                </div>
                <div className="mt-1 max-h-56 overflow-y-auto rounded-md border-t border-border/50 pt-1">
                  {filteredCountries.length === 0 ? (
                      <div className="p-3 text-center text-xs text-muted-foreground">
                        Ülke bulunamadı.
                      </div>
                  ) : (
                      filteredCountries.map((c) => {
                        const isSelected = c.iso2 === country.iso2;
                        return (
                            <button
                                key={c.iso2}
                                type="button"
                                onClick={() => handleSelectCountry(c.iso2)}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isSelected && "bg-accent/80 font-semibold text-accent-foreground"
                                )}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span>{getFlagEmoji(c.iso2)}</span>
                                <span className="truncate">{c.name}</span>
                              </div>
                              <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                        +{c.dialCode}
                      </span>
                            </button>
                        );
                      })
                  )}
                </div>
              </div>
          )}
        </div>

        {/* Telefon Numarası Alanı */}
        <Input
            id={id}
            type="tel"
            inputMode="tel"
            autoComplete={autoComplete}
            placeholder={props.placeholder || country.format}
            value={inputValue}
            onChange={handlePhoneValueChange}
            ref={inputRef}
            className={cn("flex-1", inputClassName)}
            {...props}
        />
      </div>
  );
}