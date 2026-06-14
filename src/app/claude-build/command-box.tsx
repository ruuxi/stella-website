"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CommandBox({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; the command is selectable as a fallback.
    }
  };

  return (
    <div className="cb-command">
      <span className="cb-command__prompt" aria-hidden="true">
        $
      </span>
      <code className="cb-command__text">{command}</code>
      <button
        type="button"
        className="cb-command__copy"
        onClick={copy}
        aria-label="Copy command"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

/** A multi-line, copy-pasteable block — used for the instructions you hand to Claude. */
export function CopyBox({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; the text is selectable as a fallback.
    }
  };

  return (
    <div className="cb-copybox">
      <button
        type="button"
        className="cb-copybox__copy"
        onClick={copy}
        aria-label="Copy instructions for Claude"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="cb-copybox__text">{text}</pre>
    </div>
  );
}
