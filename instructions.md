# Project Specification: Mobile Wedding Invitation

**Version:** 1.0
**Author:** graviton94
**Target Audience:** Wedding guests (Mobile users primarily)

## 1. Project Overview
Build a high-performance, aesthetic, single-page wedding invitation web application. The design must be "Mobile-First," optimized for screens like iPhone 14/15 Pro, but responsive on desktop (centered layout).

## 2. Tech Stack & Environment
- **Framework:** React 18+ (Vite)
- **Language:** JavaScript (ES6+)
- **Styling:** Tailwind CSS (Utility-first)
- **Animation:** Framer Motion (Scroll reveals, fade-ins)
- **Maps:** react-kakao-maps-sdk
- **Hosting:** GitHub Pages

## 3. Design System (The "Vibe")
- **Theme:** Minimalist, Romantic, Warm.
- **Color Palette:**
  - Background: `#FDFCF0` (Cream/Beige)
  - Text Primary: `#333333` (Soft Black)
  - Text Accent: `#D4AF37` (Champagne Gold)
- **Typography:**
  - Headings: Serif font (e.g., 'Playfair Display' or similar Google Font).
  - Body: Sans-serif (e.g., 'Noto Sans KR').
- **Layout Constraint:** All content must be inside a container with `max-width: 430px` and `mx-auto` (centered horizontally).

## 4. Core Features & Sections
The app consists of a single vertical scrolling page with these sections:

### A. Hero Section
- Full-screen background image of the couple.
- Text overlay: "We are getting married" (Fade-in effect).
- Names: Groom & Bride.
- Date & Time.

### B. Invitation (Greeting)
- Emotional text inviting guests.
- Use `framer-motion` to fade in text paragraphs as the user scrolls.

### C. Gallery (Photo Album)
- Grid layout (2 columns or 3 columns).
- **Interaction:** Clicking an image opens a full-screen Modal/Lightbox with swipe support.

### D. Location (Map)
- **Kakao Map:** Interactive map centered on the wedding hall.
- **Action Buttons:** "Open in Naver Map", "Open in T-Map", "Copy Address".
- Address text display.

### E. Money Gift (Account)
- Accordion UI (Expandable lists).
- "Groom's Side" and "Bride's Side" sections.
- **Feature:** Clicking an account number copies it to the clipboard and shows a "Copied!" toast message.

### F. Share
- "Share on KakaoTalk" button using Kakao JavaScript SDK.
- "Copy Link" button.

## 5. File Structure Requirement
```text
src/
├── assets/          # Images, Icons
├── components/
│   ├── layout/      # Container, Footer
│   ├── sections/    # Hero, Greeting, Gallery, Map, Money, Share
│   └── ui/          # Modal, Button, Accordion
├── data/            # JSON files for text content and config
├── hooks/           # useScrollAnimation, useCopyToClipboard
└── App.jsx
