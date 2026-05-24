"use client";

import { useState } from "react";
import Image from "next/image";
import { Smartphone, Monitor, ArrowUpRight, Wifi, MessageCircle } from "lucide-react";

const conversations = [
  {
    id: "organize",
    label: "Organize",
    messages: [
      { role: "user" as const, text: "move my presentation to the second monitor and make it fullscreen" },
      { role: "stella" as const, text: "Done — Q4 Report.pptx is now fullscreen on Display 2." },
      { role: "user" as const, text: "also close all the chrome tabs I left open" },
      { role: "stella" as const, text: "Closed 14 tabs across 2 windows. Your desktop is clear." },
    ],
    desktopAction: "Q4 Report.pptx moved to Display 2",
    desktopDetail: "14 Chrome tabs closed",
  },
  {
    id: "create",
    label: "Create",
    messages: [
      { role: "user" as const, text: "make a playlist folder on my desktop called 'focus' and add my lo-fi bookmarks" },
      { role: "stella" as const, text: "Created the folder and added 8 bookmarks from your lo-fi collection." },
      { role: "user" as const, text: "now play the first one on spotify" },
      { role: "stella" as const, text: "Playing \"midnight rain lofi\" on Spotify. Volume at 35%." },
    ],
    desktopAction: "Spotify — Now Playing",
    desktopDetail: "\"midnight rain lofi\" · Volume 35%",
  },
  {
    id: "research",
    label: "Research",
    messages: [
      { role: "user" as const, text: "find the pdf I downloaded yesterday about neural networks" },
      { role: "stella" as const, text: "Found it — \"Intro_to_Neural_Nets_2024.pdf\" in your Downloads folder. Want me to open it?" },
      { role: "user" as const, text: "yeah and summarize the first 10 pages for me" },
      { role: "stella" as const, text: "Opened the PDF. Here's the summary: The paper covers 3 core architectures…" },
    ],
    desktopAction: "PDF opened in reader",
    desktopDetail: "Summarizing pages 1–10…",
  },
];

export const channels = [
  { name: "Stella", icon: <StellaAppIcon /> },
  { name: "Text Message", icon: <MessageCircle size={15} /> },
  { name: "Telegram", icon: <TelegramIcon /> },
  { name: "Discord", icon: <DiscordIcon /> },
  { name: "Teams", icon: <TeamsIcon /> },
  { name: "Slack", icon: <SlackIcon /> },
];

export function MobileShowcase() {
  const [activeConvo, setActiveConvo] = useState(0);
  const convo = conversations[activeConvo];

  return (
    <div className="demo-panel mobile-demo-panel">
      <div className="mobile-showcase">
        {/* Left column: all info */}
        <div className="mobile-showcase__left">
          <div className="mobile-showcase__header">
            <div className="section-kicker--compact">
              <span className="demo-eyebrow">Mobile</span>
              <h3>Text Stella from your phone — she handles it on your computer</h3>
            </div>
            <p className="demo-panel__lede">
              Away from your desk? Message Stella from anywhere and she&apos;ll take action on your computer in real time.
            </p>
            <ul className="demo-chip-list">
              {conversations.map((c, i) => (
                <li
                  key={c.id}
                  data-active={i === activeConvo ? "" : undefined}
                  onClick={() => setActiveConvo(i)}
                  style={{ cursor: "pointer" }}
                >
                  {c.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop action card */}
          <div className="mobile-desktop-card">
            <div className="mobile-desktop-card__header">
              <Monitor size={14} />
              <span>Your Computer</span>
            </div>
            <div className="mobile-desktop-card__screen">
              <div className="mobile-desktop-card__content">
                <div className="mobile-desktop-card__action">
                  <Smartphone size={13} />
                  <span>{convo.desktopAction}</span>
                </div>
                <p className="mobile-desktop-card__detail">{convo.desktopDetail}</p>
              </div>
            </div>
            <div className="mobile-desktop-card__footer">
              <div className="mobile-desktop-card__pulse" />
              <span>Receiving commands from your phone</span>
            </div>
          </div>

          {/* Messaging channels */}
          <div className="mobile-channels">
            <span className="mobile-channels__label">Message Stella from</span>
            <div className="mobile-channels__list">
              {channels.map((ch) => (
                <div key={ch.name} className="mobile-channel">
                  <span className="mobile-channel__icon">{ch.icon}</span>
                  <span className="mobile-channel__name">{ch.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: phone mockup (full height) */}
        <div className="mobile-showcase__phone-wrap">
          <div className="mobile-phone">
            <div className="mobile-phone__status-bar">
              <span className="mobile-phone__time">9:41</span>
              <div className="mobile-phone__status-icons">
                <Wifi size={11} />
                <span className="mobile-phone__battery" />
              </div>
            </div>
            <div className="mobile-phone__header">
              <div className="mobile-phone__avatar">
                <Image src="/stella-logo.svg" alt="" width={22} height={22} />
              </div>
              <div className="mobile-phone__contact">
                <span className="mobile-phone__name">Stella</span>
              </div>
            </div>
            <div className="mobile-phone__chat">
              {convo.messages.map((msg, i) => (
                <div
                  key={`${convo.id}-${i}`}
                  className={`mobile-msg mobile-msg--${msg.role}`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="mobile-phone__composer">
              <span>Message Stella…</span>
              <button type="button" aria-label="Send">
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Phone-only visual for section layout ──────────── */

export type Platform = "stella" | "imessage" | "discord" | "slack" | "telegram" | "teams";

export const PLATFORMS: Platform[] = ["stella", "imessage", "discord", "slack", "telegram", "teams"];

export const PLATFORM_LABELS: Record<Platform, string> = {
  stella: "Stella",
  imessage: "iMessage",
  discord: "Discord",
  slack: "Slack",
  telegram: "Telegram",
  teams: "Teams",
};

export function MobilePhoneVisual({
  activeConvo,
  platform = "imessage",
}: {
  activeConvo: number;
  platform?: Platform;
}) {
  const convo = conversations[activeConvo];

  if (platform === "stella") {
    return (
      <div className="mobile-phone-visual">
        <div className="mobile-phone mobile-phone--stella-app">
          <div className="mobile-phone__status-bar">
            <span className="mobile-phone__time">9:41</span>
            <div className="mobile-phone__status-icons">
              <Wifi size={11} />
              <span className="mobile-phone__battery" />
            </div>
          </div>
          <div className="stella-app-chat">
            <div className="stella-app-chat__gradient" />
            {convo.messages.map((msg, i) => (
              <div
                key={`${convo.id}-${i}`}
                className={`stella-app-msg stella-app-msg--${msg.role}`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="stella-app-composer">
            <span className="stella-app-composer__add">
              <StellaAddIcon />
            </span>
            <span className="stella-app-composer__input">Message Stella</span>
            <span className="stella-app-composer__send">
              <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "discord") {
    /* Group consecutive messages from the same role */
    const grouped = convo.messages.map((msg, i) => ({
      ...msg,
      isGrouped: i > 0 && convo.messages[i - 1].role === msg.role,
    }));

    return (
      <div className="mobile-phone-visual">
        <div className="mobile-phone mobile-phone--discord">
          <div className="mobile-phone__status-bar">
            <span className="mobile-phone__time">9:41</span>
            <div className="mobile-phone__status-icons">
              <Wifi size={11} />
              <span className="mobile-phone__battery" />
            </div>
          </div>
          {/* Server sidebar + content area */}
          <div className="discord-layout">
            <div className="discord-sidebar">
              <span className="discord-sidebar__icon discord-sidebar__icon--home">
                <DiscordIcon />
              </span>
              <span className="discord-sidebar__divider" />
              <span className="discord-sidebar__icon discord-sidebar__icon--active" />
              <span className="discord-sidebar__icon" />
              <span className="discord-sidebar__icon" />
            </div>
            <div className="discord-main">
              <div className="discord-header">
                <span className="discord-header__back">&lsaquo;</span>
                <span className="discord-header__hash">#</span>
                <span className="discord-header__channel">stella</span>
              </div>
              <div className="discord-chat">
                <span className="discord-date-divider">
                  <span>Today</span>
                </span>
                {grouped.map((msg, i) => (
                  <div
                    key={`${convo.id}-${i}`}
                    className={`discord-msg${msg.isGrouped ? " discord-msg--grouped" : ""}`}
                  >
                    {!msg.isGrouped && (
                      <div className="discord-msg__avatar">
                        {msg.role === "stella" ? (
                          <Image src="/stella-logo.svg" alt="" width={18} height={18} />
                        ) : (
                          <span className="discord-msg__user-avatar">Y</span>
                        )}
                      </div>
                    )}
                    <div className="discord-msg__body">
                      {!msg.isGrouped && (
                        <span className="discord-msg__meta">
                          <span className="discord-msg__name" data-role={msg.role}>
                            {msg.role === "stella" ? "Stella" : "you"}
                          </span>
                          {msg.role === "stella" && (
                            <span className="discord-msg__badge">BOT</span>
                          )}
                          <span className="discord-msg__time">
                            Today at 3:4{i}
                          </span>
                        </span>
                      )}
                      <span className="discord-msg__text">{msg.text}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="discord-composer">
                <span className="discord-composer__plus">+</span>
                <span>Message #stella</span>
              </div>
            </div>
          </div>
          {/* Bottom tab bar */}
          <div className="discord-tabbar">
            <span className="discord-tabbar__item discord-tabbar__item--active">
              <MessageCircle size={16} />
            </span>
            <span className="discord-tabbar__item">
              <DiscordSearchIcon />
            </span>
            <span className="discord-tabbar__item">
              <DiscordNotifIcon />
            </span>
            <span className="discord-tabbar__item">
              <DiscordProfileIcon />
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "slack") {
    const grouped = convo.messages.map((msg, i) => ({
      ...msg,
      isGrouped: i > 0 && convo.messages[i - 1].role === msg.role,
    }));

    return (
      <div className="mobile-phone-visual">
        <div className="mobile-phone mobile-phone--slack">
          <div className="mobile-phone__status-bar">
            <span className="mobile-phone__time">9:41</span>
            <div className="mobile-phone__status-icons">
              <Wifi size={11} />
              <span className="mobile-phone__battery" />
            </div>
          </div>
          <div className="slack-header">
            <span className="slack-header__back">&lsaquo;</span>
            <div className="slack-header__info">
              <span className="slack-header__channel"># stella</span>
              <span className="slack-header__detail">2 members</span>
            </div>
          </div>
          <div className="slack-chat">
            {grouped.map((msg, i) => (
              <div
                key={`${convo.id}-${i}`}
                className={`slack-msg${msg.isGrouped ? " slack-msg--grouped" : ""}`}
              >
                {!msg.isGrouped && (
                  <div className="slack-msg__avatar">
                    {msg.role === "stella" ? (
                      <>
                        <Image src="/stella-logo.svg" alt="" width={18} height={18} />
                        <span className="slack-msg__online" />
                      </>
                    ) : (
                      <span className="slack-msg__user-avatar">Y</span>
                    )}
                  </div>
                )}
                <div className="slack-msg__body">
                  {!msg.isGrouped && (
                    <span className="slack-msg__meta">
                      <span className="slack-msg__name">
                        {msg.role === "stella" ? "Stella" : "You"}
                      </span>
                      {msg.role === "stella" && (
                        <span className="slack-msg__app">APP</span>
                      )}
                      <span className="slack-msg__time">3:4{i} PM</span>
                    </span>
                  )}
                  <span className="slack-msg__text">{msg.text}</span>
                  {/* Add emoji reaction to Stella's last response */}
                  {msg.role === "stella" && i === convo.messages.length - 1 && (
                    <div className="slack-reactions">
                      <span className="slack-reaction">✅ 1</span>
                      <span className="slack-reaction">👍 1</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="slack-composer">
            <span className="slack-composer__attach">+</span>
            <span>Message #stella</span>
          </div>
          {/* Bottom tab bar */}
          <div className="slack-tabbar">
            <span className="slack-tabbar__item slack-tabbar__item--active">
              <SlackHomeIcon />
              <span>Home</span>
            </span>
            <span className="slack-tabbar__item">
              <SlackDMIcon />
              <span>DMs</span>
            </span>
            <span className="slack-tabbar__item">
              <SlackMentionIcon />
              <span>Activity</span>
            </span>
            <span className="slack-tabbar__item">
              <SlackSearchTabIcon />
              <span>Search</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "telegram") {
    return (
      <div className="mobile-phone-visual">
        <div className="mobile-phone mobile-phone--telegram">
          <div className="mobile-phone__status-bar">
            <span className="mobile-phone__time">9:41</span>
            <div className="mobile-phone__status-icons">
              <Wifi size={11} />
              <span className="mobile-phone__battery" />
            </div>
          </div>
          <div className="telegram-header">
            <span className="telegram-header__back">&lsaquo;</span>
            <div className="telegram-header__center">
              <div className="telegram-header__avatar">
                <Image src="/stella-logo.svg" alt="" width={18} height={18} />
              </div>
              <div className="telegram-header__info">
                <span className="telegram-header__name">Stella</span>
                <span className="telegram-header__status">bot</span>
              </div>
            </div>
            <div className="telegram-header__actions">
              <TelegramCallIcon />
              <TelegramMoreIcon />
            </div>
          </div>
          <div className="telegram-chat">
            {convo.messages.map((msg, i) => (
              <div
                key={`${convo.id}-${i}`}
                className={`telegram-msg telegram-msg--${msg.role}`}
              >
                {msg.role === "stella" && i === 0 && (
                  <span className="telegram-msg__sender">Stella</span>
                )}
                <span className="telegram-msg__text">{msg.text}</span>
                <span className="telegram-msg__meta-row">
                  <span className="telegram-msg__time">3:4{i}</span>
                  {msg.role === "user" && (
                    <span className="telegram-msg__checks">✓✓</span>
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="telegram-composer">
            <span className="telegram-composer__emoji">
              <TelegramEmojiIcon />
            </span>
            <span className="telegram-composer__input">Message</span>
            <span className="telegram-composer__attach">
              <TelegramAttachIcon />
            </span>
            <span className="telegram-composer__mic">
              <TelegramMicIcon />
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "teams") {
    const grouped = convo.messages.map((msg, i) => ({
      ...msg,
      isGrouped: i > 0 && convo.messages[i - 1].role === msg.role,
    }));

    return (
      <div className="mobile-phone-visual">
        <div className="mobile-phone mobile-phone--teams">
          <div className="mobile-phone__status-bar">
            <span className="mobile-phone__time">9:41</span>
            <div className="mobile-phone__status-icons">
              <Wifi size={11} />
              <span className="mobile-phone__battery" />
            </div>
          </div>
          <div className="teams-header">
            <span className="teams-header__back">&lsaquo;</span>
            <div className="teams-header__avatar">
              <Image src="/stella-logo.svg" alt="" width={16} height={16} />
            </div>
            <div className="teams-header__info">
              <span className="teams-header__name">Stella</span>
              <span className="teams-header__status">Active now</span>
            </div>
          </div>
          <div className="teams-chat">
            {grouped.map((msg, i) => (
              <div
                key={`${convo.id}-${i}`}
                className={`teams-msg${msg.isGrouped ? " teams-msg--grouped" : ""}`}
              >
                {!msg.isGrouped && (
                  <div className="teams-msg__avatar">
                    {msg.role === "stella" ? (
                      <Image src="/stella-logo.svg" alt="" width={16} height={16} />
                    ) : (
                      <span className="teams-msg__user-avatar">Y</span>
                    )}
                  </div>
                )}
                <div className="teams-msg__body">
                  {!msg.isGrouped && (
                    <span className="teams-msg__meta">
                      <span className="teams-msg__name">
                        {msg.role === "stella" ? "Stella" : "You"}
                      </span>
                      <span className="teams-msg__time">3:4{i} PM</span>
                    </span>
                  )}
                  <span className="teams-msg__text">{msg.text}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="teams-composer">
            <span>Type a message</span>
          </div>
          <div className="teams-tabbar">
            <span className="teams-tabbar__item">
              <TeamsActivityIcon />
              <span>Activity</span>
            </span>
            <span className="teams-tabbar__item teams-tabbar__item--active">
              <TeamsChatIcon />
              <span>Chat</span>
            </span>
            <span className="teams-tabbar__item">
              <TeamsTeamsIcon />
              <span>Teams</span>
            </span>
            <span className="teams-tabbar__item">
              <TeamsMoreIcon />
              <span>More</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* iMessage (default) */
  return (
    <div className="mobile-phone-visual">
      <div className="mobile-phone mobile-phone--imessage">
        <div className="mobile-phone__status-bar">
          <span className="mobile-phone__time">9:41</span>
          <div className="mobile-phone__status-icons">
            <Wifi size={11} />
            <span className="mobile-phone__battery" />
          </div>
        </div>
        <div className="mobile-phone__header">
          <div className="mobile-phone__avatar">
            <Image src="/stella-logo.svg" alt="" width={22} height={22} />
          </div>
          <div className="mobile-phone__contact">
            <span className="mobile-phone__name">Stella</span>
          </div>
        </div>
        <div className="mobile-phone__chat">
          {convo.messages.map((msg, i) => (
            <div
              key={`${convo.id}-${i}`}
              className={`mobile-msg mobile-msg--${msg.role}`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="mobile-phone__composer">
          <span>iMessage</span>
          <button type="button" aria-label="Send">
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Compact platform icons (16×16 viewBox) ──────────── */

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="tg-grad" x1=".667" y1=".167" x2=".417" y2=".75">
          <stop offset="0" stopColor="#37aee2" />
          <stop offset="1" stopColor="#1e96c8" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="120" fill="url(#tg-grad)" />
      <path fill="#c8daea" d="M98 175c-3.9 0-3.2-1.5-4.6-5.2L82 132.2 170 80z" />
      <path fill="#a9c9dd" d="M98 175c3 0 4.3-1.4 6-3l24-23-30-18z" />
      <path fill="#fff" d="M100 144l53.5 39.5c6.1 3.4 10.5 1.6 12-5.6L186.5 75c2.2-8.8-3.4-12.8-9.2-10.2L57 111.4c-8.2 3.3-8.1 7.9-1.5 9.9l30.8 9.6L156.7 86c3.3-2 6.4-.9 3.9 1.3z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#5865F2" d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3.18a.075.075 0 0 0-.079.037c-.34.598-.717 1.378-.98 1.99a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-1-1.99.077.077 0 0 0-.078-.037A19.736 19.736 0 0 0 5.18 4.369a.07.07 0 0 0-.032.027C2.443 8.396 1.685 12.32 2.06 16.196a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.027 14.09 14.09 0 0 0 1.226-1.994.075.075 0 0 0-.041-.105 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.127c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.099.246.198.372.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.106c.36.7.772 1.366 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-4.484-.838-8.376-3.549-11.8a.061.061 0 0 0-.031-.028zM8.02 14.835c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.956 2.42-2.157 2.42zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.094 2.157 2.418 0 1.334-.946 2.42-2.157 2.42z" />
    </svg>
  );
}

function TeamsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#5059C9" d="M19 10h8.4c.9 0 1.6.7 1.6 1.6v7.7c0 2.9-2.4 5.3-5.3 5.3a5.3 5.3 0 0 1-5.3-5.3V11c0-.6.3-1 .6-1z" />
      <circle cx="24.5" cy="6.5" r="3.5" fill="#5059C9" />
      <circle cx="14" cy="6" r="5" fill="#7B83EB" />
      <path fill="#7B83EB" d="M17.6 10H7.5c-.8 0-1.5.7-1.5 1.6v9.6c0 4 3.3 7.3 7.3 7.3h.4c4 0 7.3-3.3 7.3-7.3v-9.6c0-1-.7-1.6-1.5-1.6z" />
      <rect width="12" height="12" x="2" y="10" fill="#4B53BC" rx="1.5" />
      <path fill="#fff" d="M11 13.7H8.6V20.5H6.7v-6.8H4.3V12h6.7v1.7z" />
    </svg>
  );
}

/* ── Tiny Discord tab bar icons ──────────────────── */

function DiscordSearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function DiscordNotifIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function DiscordProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

/* ── Tiny Slack tab bar icons ───────────────────── */

function SlackHomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function SlackDMIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SlackMentionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}

function SlackSearchTabIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/* ── Stella channel icon ────────────────────────── */

function StellaAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  );
}

/* ── Stella app icon ────────────────────────────── */

function StellaAddIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  );
}

/* ── Tiny Telegram icons ────────────────────────── */

function TelegramAttachIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function TelegramMicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function TelegramEmojiIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
    </svg>
  );
}

function TelegramCallIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function TelegramMoreIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

/* ── Tiny Teams tab bar icons ──────────────────── */

function TeamsActivityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function TeamsChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TeamsTeamsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TeamsMoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function SlackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" />
      <path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.527 2.527 0 0 1 2.521 2.521 2.527 2.527 0 0 1-2.521 2.521H2.522A2.527 2.527 0 0 1 0 8.834a2.527 2.527 0 0 1 2.522-2.521h6.312z" />
      <path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.272 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.161 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" />
      <path fill="#ECB22E" d="M15.161 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.161 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.272a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.317A2.527 2.527 0 0 1 24 15.161a2.528 2.528 0 0 1-2.522 2.523h-6.317z" />
    </svg>
  );
}
