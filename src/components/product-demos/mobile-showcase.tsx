"use client";

import { useState } from "react";
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

const channels = [
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
            <div className="mobile-phone__notch" />
            <div className="mobile-phone__status-bar">
              <span className="mobile-phone__time">9:41</span>
              <div className="mobile-phone__status-icons">
                <Wifi size={11} />
                <span className="mobile-phone__battery" />
              </div>
            </div>
            <div className="mobile-phone__header">
              <div className="mobile-phone__avatar">
                <img
                  src="/stella-logo.svg"
                  alt=""
                  width={22}
                  height={22}
                />
              </div>
              <div className="mobile-phone__contact">
                <span className="mobile-phone__name">Stella</span>
                <span className="mobile-phone__status-text">
                  <span className="mobile-phone__dot" />
                  Connected to your PC
                </span>
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

/* ── Compact platform icons (16×16 viewBox) ──────────── */

function TelegramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.59 5.89c-1.23-.57-2.54-.99-3.92-1.23-.17.3-.37.71-.5 1.03a14.9 14.9 0 0 0-4.34 0c-.14-.32-.34-.73-.51-1.03-1.38.24-2.69.66-3.92 1.23C2.4 10.4 1.56 14.78 1.97 19.1a15.2 15.2 0 0 0 4.6 2.32c.37-.5.7-1.04.98-1.6a9.8 9.8 0 0 1-1.55-.74l.38-.3a10.9 10.9 0 0 0 9.24 0l.37.3c-.5.29-1.02.54-1.55.74.28.56.6 1.1.98 1.6a15.2 15.2 0 0 0 4.6-2.32c.46-4.88-.78-9.22-3.43-13.21zM8.35 16.35c-1.13 0-2.07-1.04-2.07-2.32s.91-2.32 2.07-2.32 2.09 1.04 2.07 2.32c0 1.28-.92 2.32-2.07 2.32zm7.3 0c-1.14 0-2.07-1.04-2.07-2.32s.91-2.32 2.07-2.32 2.08 1.04 2.07 2.32c0 1.28-.91 2.32-2.07 2.32z" />
    </svg>
  );
}

function TeamsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <rect x="9" y="9" width="12" height="10" rx="2" />
      <circle cx="16" cy="3.5" r="1.5" />
      <circle cx="20.5" cy="5.5" r="1.5" />
    </svg>
  );
}

function SlackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="13" y="2" width="3" height="8" rx="1.5" />
      <path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5" />
      <rect x="8" y="14" width="3" height="8" rx="1.5" />
      <path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5" />
      <rect x="14" y="13" width="8" height="3" rx="1.5" />
      <path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5" />
      <rect x="2" y="8" width="8" height="3" rx="1.5" />
      <path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5" />
    </svg>
  );
}
