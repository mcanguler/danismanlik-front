"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  {
    code: "TR",
    dial: "90",
    pattern: "XXX XXX XX XX",
    max: 10,
    placeholder: "500 000 00 00",
  },
  {
    code: "US",
    dial: "1",
    pattern: "(XXX) XXX-XXXX",
    max: 10,
    placeholder: "(555) 000-0000",
  },
  {
    code: "GB",
    dial: "44",
    pattern: "XXXX XXX XXX",
    max: 10,
    placeholder: "7700 900 123",
  },
  {
    code: "DE",
    dial: "49",
    pattern: "XXX XXXXXXX",
    max: 10,
    placeholder: "151 1234567",
  },
  {
    code: "FR",
    dial: "33",
    pattern: "X XX XX XX XX",
    max: 9,
    placeholder: "6 12 34 56 78",
  },
  {
    code: "ES",
    dial: "34",
    pattern: "XXX XX XX XX",
    max: 9,
    placeholder: "600 12 34 56",
  },
  {
    code: "IT",
    dial: "39",
    pattern: "XXX XXX XXXX",
    max: 10,
    placeholder: "312 345 6789",
  },
  {
    code: "NL",
    dial: "31",
    pattern: "6 XXXXXXXX",
    max: 9,
    placeholder: "6 12345678",
  },
  {
    code: "RU",
    dial: "7",
    pattern: "XXX XXX-XX-XX",
    max: 10,
    placeholder: "900 123-45-67",
  },
  {
    code: "AE",
    dial: "971",
    pattern: "5X XXX XXXX",
    max: 9,
    placeholder: "50 123 4567",
  },
  {
    code: "SA",
    dial: "966",
    pattern: "5X XXX XXXX",
    max: 9,
    placeholder: "50 123 4567",
  },
  {
    code: "AZ",
    dial: "994",
    pattern: "XX XXX XX XX",
    max: 9,
    placeholder: "50 123 45 67",
  },
];

function getCountry(code) {
  return COUNTRIES.find((country) => country.code === code) ?? COUNTRIES[0];
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

function cleanDigits(value) {
  return value ? String(value).replace(/\D/g, "") : "";
}

function findCountry(cleaned) {
  return (
    COUNTRIES.filter((country) => cleaned.startsWith(country.dial)).sort(
      (a, b) => b.dial.length - a.dial.length
    )[0] ?? null
  );
}

function formatNational(digits, pattern) {
  let output = "";
  let index = 0;
  for (const char of pattern) {
    if (index >= digits.length) break;
    if (char === "X") output += digits[index++];
    else output += char;
  }
  return output;
}

function extractNationalDigits(value, country) {
  const cleaned = cleanDigits(value);
  if (!cleaned) return "";
  if (cleaned.startsWith(country.dial)) {
    return cleaned.slice(country.dial.length).slice(0, country.max);
  }
  const matched = findCountry(cleaned);
  if (matched && matched.code !== country.code) {
    return cleaned.slice(matched.dial.length).slice(0, matched.max);
  }
  return cleaned.replace(/^0+/, "").slice(0, country.max);
}

export function PhoneInput({
  value = "",
  onChange,
  id,
  className,
  selectClassName,
  inputClassName,
  autoComplete = "tel",
  ...props
}) {
  const [countryCode, setCountryCode] = useState(() => {
    const matched = findCountry(cleanDigits(value));
    return matched?.code ?? "TR";
  });
  const country = getCountry(countryCode);
  const digits = extractNationalDigits(value, country);

  const handleDigitsChange = (event) => {
    const next = event.target.value.replace(/\D/g, "").slice(0, country.max);
    onChange(`+${country.dial}${next}`);
  };

  const handleCountryChange = (event) => {
    const nextCode = event.target.value;
    setCountryCode(nextCode);
    onChange(`+${getCountry(nextCode).dial}`);
  };

  return (
    <div className={cn("flex w-full items-stretch gap-1.5", className)}>
      <select
        aria-label="Ülke kodu"
        value={countryCode}
        onChange={handleCountryChange}
        className={cn(
          "h-8 shrink-0 rounded-lg border border-input bg-transparent px-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
          selectClassName
        )}
      >
        {COUNTRIES.map((country) => (
          <option key={country.code} value={country.code}>
            +{country.dial}
          </option>
        ))}
      </select>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        placeholder={country.placeholder}
        value={formatNational(digits, country.pattern)}
        onChange={handleDigitsChange}
        className={cn("flex-1", inputClassName)}
        {...props}
      />
    </div>
  );
}