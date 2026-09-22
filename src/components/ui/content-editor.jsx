"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Eraser,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Underline,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLBAR_BUTTON_CLASS =
  "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50";

const TOOLBAR_DIVIDER_CLASS = "mx-1 h-5 w-px shrink-0 bg-border";

function runCommand(command, commandValue = null) {
  document.execCommand(command, false, commandValue);
}

function normalizeHtml(html) {
  return html === "<br>" || html === "<div><br></div>" ? "" : html;
}

export function ContentEditor({
  value,
  onChange,
  disabled = false,
  error,
  id,
  placeholder,
  minHeight = "10rem",
}) {
  const editorRef = useRef(null);
  const lastEmittedRef = useRef(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const incoming = value ?? "";
    if (incoming !== lastEmittedRef.current) {
      editor.innerHTML = incoming;
      lastEmittedRef.current = incoming;
    }
  }, [value]);

  const emit = () => {
    if (!editorRef.current || disabled) return;
    const html = normalizeHtml(editorRef.current.innerHTML);
    lastEmittedRef.current = html;
    onChange?.(html);
  };

  const handleCommand = (command, commandValue = null) => {
    if (disabled) return;
    editorRef.current?.focus();
    runCommand(command, commandValue);
    emit();
  };

  const toolbarItems = [
    { icon: Bold, label: "Kalın", command: "bold" },
    { icon: Italic, label: "İtalik", command: "italic" },
    { icon: Underline, label: "Altı Çizili", command: "underline" },
  ];

  const blockItems = [
    {
      icon: Heading2,
      label: "Başlık 2",
      command: "formatBlock",
      value: "<h2>",
    },
    {
      icon: Heading3,
      label: "Başlık 3",
      command: "formatBlock",
      value: "<h3>",
    },
    {
      icon: Pilcrow,
      label: "Paragraf",
      command: "formatBlock",
      value: "<p>",
    },
  ];

  const listItems = [
    { icon: List, label: "Madde Listesi", command: "insertUnorderedList" },
    { icon: ListOrdered, label: "Numaralı Liste", command: "insertOrderedList" },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-transparent",
          disabled && "cursor-not-allowed opacity-50",
          error ? "border-destructive" : "border-input"
        )}
      >
        <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 p-1">
          {toolbarItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={TOOLBAR_BUTTON_CLASS}
              disabled={disabled}
              aria-label={item.label}
              title={item.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleCommand(item.command)}
            >
              <item.icon className="size-4" />
            </button>
          ))}
          <span className={TOOLBAR_DIVIDER_CLASS} />
          {blockItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={TOOLBAR_BUTTON_CLASS}
              disabled={disabled}
              aria-label={item.label}
              title={item.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleCommand(item.command, item.value)}
            >
              <item.icon className="size-4" />
            </button>
          ))}
          <span className={TOOLBAR_DIVIDER_CLASS} />
          {listItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={TOOLBAR_BUTTON_CLASS}
              disabled={disabled}
              aria-label={item.label}
              title={item.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleCommand(item.command)}
            >
              <item.icon className="size-4" />
            </button>
          ))}
          <span className={TOOLBAR_DIVIDER_CLASS} />
          <button
            type="button"
            className={TOOLBAR_BUTTON_CLASS}
            disabled={disabled}
            aria-label="Biçimi temizle"
            title="Biçimi temizle"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => handleCommand("removeFormat")}
          >
            <Eraser className="size-4" />
          </button>
        </div>
        <div
          ref={editorRef}
          id={id}
          role="textbox"
          aria-multiline="true"
          aria-invalid={Boolean(error)}
          className="relative w-full bg-transparent px-3 py-2.5 text-sm outline-none [&_a]:text-primary [&_a]:underline [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
          style={{ minHeight }}
          contentEditable={!disabled}
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={emit}
          onBlur={emit}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
