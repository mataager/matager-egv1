# Matager Visual Identity Guide

This document defines the visual system used across the Matager product experience. It captures the brand tone, typography, color palette, UI primitives, and button styles used in the interface.

## 1. Brand direction

Matager uses a premium SaaS aesthetic with:
- modern dark surfaces and glassmorphism panels
- vibrant blue accents for interactivity and signifying trust
- clean, high-contrast typography for clarity and product confidence
- soft gradients and rounded forms for a polished commerce experience

The overall tone is professional, sleek, and minimal, designed to feel modern and conversion-oriented without becoming overly decorative.

## 2. Core brand colors

### Primary palette

| Token | Hex | Usage |
|---|---:|---|
| `--brand-blue` | `#3B82F6` | primary CTA, links, emphasis |
| `--brand-sky` | `#38BDF8` | gradient accent / hover lift |
| `--void` | `#0A0A0A` | near-black base |
| `--ink` | `#080A12` | deep surface / dark card background |
| `--paper` | `#FFFFFF` | main text on dark surfaces, white cards |
| `--ash` | `#8A8A8A` | muted secondary text |
| `--dim` | `#5C5C5C` | tertiary text / labels |
| `--ghost` | `#4A4A4A` | subtle UI utility color |

### Gradient system

```css
--brand-gradient: linear-gradient(90deg, #3B82F6, #38BDF8);
--brand-gradient-135: linear-gradient(135deg, #3B82F6, #38BDF8);
```

Use gradients for:
- hero accents
- CTA highlights
- badge and brand emphasis
- premium feature blocks

### Surface / border tokens

| Token | Value | Purpose |
|---|---|---|
| `--surface-1` | `rgba(255, 255, 255, 0.02)` | subtle backgrounds |
| `--surface-2` | `rgba(255, 255, 255, 0.035)` | elevated surfaces |
| `--surface-3` | `rgba(255, 255, 255, 0.06)` | active panels |
| `--border-1` | `rgba(255, 255, 255, 0.06)` | standard borders |
| `--border-2` | `rgba(255, 255, 255, 0.09)` | stronger separation |
| `--border-3` | `rgba(255, 255, 255, 0.14)` | prominent UI outlines |

### Semantic accents

| Token | Hex | Usage |
|---|---:|---|
| `--live` | `#4ADE80` | success / positive status |
| `--alert` | `#F87171` | error / danger |
| `--warm` | `#F472B6` | highlight / soft promotional accent |

## 3. Typography system

### Font families

```css
--font-latin: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
--font-arabic: 'IBM Plex Sans Arabic', 'Plus Jakarta Sans', sans-serif;
```

### Type style principles

- modern geometric sans-serif for a clean SaaS identity
- strong letter spacing on headings to create premium structure
- high readability on neutral backgrounds for product and action clarity
- Arabic support included for RTL language adaptation

### Heading treatment

- Headings use a strong, condensed modern sans-serif feel
- large display headings are paired with a gradient text effect
- text emphasis uses subtle clipping and transparent fills for a premium hero style

Example gradient heading style:

```css
.grad-text {
  background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.55) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 4. Buttons

The product uses a simple, consistent button system built around a clear hierarchy.

### Default button primitive

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  white-space: nowrap;
  border: 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  border-radius: 999px;
  transition: all 0.2s ease;
}
```

### Button variants

#### Primary button

```css
.btn-primary {
  background: #FFFFFF;
  color: #000000;
  padding: 10px 20px;
}
```

Behavior:
- default primary action color is white with black text
- hover reduces scale slightly and softens the background tone
- this creates a clean, premium default CTA pattern

#### Secondary button

```css
.btn-secondary {
  background: rgba(255, 255, 255, 0.02);
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.09);
  padding: 12px 24px;
  backdrop-filter: blur(10px);
}
```

Use for:
- supporting CTAs
- secondary actions in forms and dashboard cards
- subtle glass actions

#### Ghost button

```css
.btn-ghost {
  background: transparent;
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.14);
  padding: 14px 28px;
}
```

Use for:
- utility actions
- outlined navigation controls
- low-emphasis actions

#### Login text button

```css
.btn-login {
  color: #8A8A8A;
  background: transparent;
  padding: 10px 16px;
}
```

Use for:
- account navigation
- tertiary actions
- header micro-interactions

## 5. Language / utility controls

### Language floating button

```css
.lang-fab {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(8, 10, 18, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #FFFFFF;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

This is used for multilingual switching and keeps the floating control above content with glass treatment.

## 6. Badge system

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.10);
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  color: #CCCCCC;
}
```

Badges are used for labels, tags, and feature tags that should feel lightweight but elevated.

## 7. Cards and surfaces

Card styling follows a reusable pattern:

```css
.card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 32px;
}
```

This creates a soft glass effect suitable for dashboards, products, pricing cards, and information modules.

## 8. Border radius and spacing

### Radius tokens

```css
--r-pill: 999px;
--r-lg: 24px;
--r-md: 16px;
--r-sm: 8px;
```

### Motion tokens

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
--ease-in-quad: cubic-bezier(0.4, 0, 1, 1);
--dur-fast: 200ms;
--dur-base: 300ms;
--dur-slow: 500ms;
```

These values support soft transitions, hover feedback, and motion consistent with premium SaaS interfaces.

## 9. Visual identity summary

The Matager system is built on a premium dark theme with a blue-first brand language. It is intended to feel:
- clean and confident
- modern and trustworthy
- easy to scan and navigate
- polished for commerce and operations flows

The system balances deep black surfaces with bright blue accents, white content, and minimal glass borders to create a refined UI without visual noise.

## 10. Recommended usage

- Use white background primary buttons for the main user action
- Use blue gradients only for oriented emphasis, not for every UI block
- Keep borders subtle and low-contrast to preserve a premium polished look
- Use large headings with gradient text sparingly for hero moments
- Maintain high contrast for accessibility and readability

This visual identity is intentionally modular and scalable, so it can be reused across landing pages, dashboard surfaces, and product modules without breaking brand consistency.
