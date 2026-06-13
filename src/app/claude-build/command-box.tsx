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
