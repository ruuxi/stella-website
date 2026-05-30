export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterGroup = {
  title: string;
  items: FooterLink[];
};

export const chromeExtensionLink: FooterLink = {
  label: "Chrome Extension",
  href: "https://chromewebstore.google.com/detail/stella-browser/kfnchfpocpmdblhfgcnpfaaebaioojnl",
  external: true,
};

export const openSourceFooterItems: FooterLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/ruuxi/stella",
    external: true,
  },
  {
    label: "Backend Repo",
    href: "https://github.com/ruuxi/stella-backend",
    external: true,
  },
  {
    label: "Mobile Repo",
    href: "https://github.com/ruuxi/stella-mobile",
    external: true,
  },
  {
    label: "Website Repo",
    href: "https://github.com/ruuxi/stella-website",
    external: true,
  },
  {
    label: "Launcher Repo",
    href: "https://github.com/ruuxi/stella-launcher",
    external: true,
  },
];

export const homeFooterGroups: FooterGroup[] = [
  {
    title: "Product",
    items: [
      { label: "Learn More", href: "/learn-more" },
      { label: "Memory", href: "/memory" },
      { label: "Storage", href: "/storage" },
      { label: "Agents", href: "/agents" },
      { label: "Voice", href: "/voice" },
      { label: "Pricing", href: "/pricing" },
      { label: "Sign In", href: "/sign-in" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "What's New", href: "/learn-more/whats-new" },
      chromeExtensionLink,
      { label: "Install for macOS", href: "/install.sh" },
      { label: "Install for Windows", href: "/install.ps1" },
    ],
  },
  {
    title: "Open Source",
    items: openSourceFooterItems,
  },
  {
    title: "Community",
    items: [
      {
        label: "Discord",
        href: "https://discord.gg/HXVCCeE542",
        external: true,
      },
      { label: "Store", href: "/store" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];
