"use client";

import { memo } from "react";
import {
  Streamdown,
  defaultRehypePlugins,
  defaultRemarkPlugins,
} from "streamdown";

const REMARK_PLUGINS = Object.values(defaultRemarkPlugins);
const REHYPE_PLUGINS = Object.values(defaultRehypePlugins);

type StoreMarkdownProps = {
  text: string;
  className?: string;
};

/** Renders store blueprint / release copy with the same Streamdown stack as desktop chat. */
export const StoreMarkdown = memo(function StoreMarkdown({
  text,
  className,
}: StoreMarkdownProps) {
  return (
    <Streamdown
      className={className ? `markdown ${className}` : "markdown"}
      remarkPlugins={REMARK_PLUGINS}
      rehypePlugins={REHYPE_PLUGINS}
      linkSafety={{ enabled: false }}
    >
      {text}
    </Streamdown>
  );
});
