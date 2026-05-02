# Frontend Structure

## Framework: Next.js 14 (App Router)

All pages and layouts use the App Router convention. There is no `src/` directory — all source lives under `app/`.

---

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing page — hero, features, how-it-works, stats, CTA |
| `/audit` | `app/audit/page.tsx` | AI contract audit — upload PDF or paste text |
| `/create` | `app/create/page.tsx` | Multi-step form to deploy contract on Solana |
| `/dashboard` | `app/dashboard/page.tsx` | List of all user contracts |
| `/dashboard/[id]` | `app/dashboard/[id]/page.tsx` | Contract detail, milestone management |
| `/pricing` | `app/pricing/page.tsx` | Pricing tiers (Free / Pro / Enterprise) |

---

## Components

### Layout Components

| Component | Path | Purpose |
|-----------|------|---------|
| `Navbar` | `components/Navbar.tsx` | Top nav: logo, links, language toggle, wallet button |
| `Footer` | `components/Footer.tsx` | Bottom footer with links and branding |

### Provider Components

| Component | Path | Purpose |
|-----------|------|---------|
| `ThemeProvider` | `components/ThemeProvider.tsx` | Injects CSS variables for dark/light theme; wraps entire app |
| `LanguageProvider` | `components/LanguageProvider.tsx` | EN/ID language context; exposes `useLanguage()` hook |
| `WalletProvider` | `components/WalletProvider.tsx` | Wraps `@solana/wallet-adapter-react` providers |

### Wallet Components

| Component | Path | Purpose |
|-----------|------|---------|
| `WalletButton` | `components/WalletButton.tsx` | Connect button or connected state (address pill + claim button) |
| `WalletModal` | `components/WalletModal.tsx` | Wallet selection modal (Phantom, etc.) |
| `ClaimUsdcButton` | `components/ClaimUsdcButton.tsx` | Standalone claim button (used internally) |

### UI Components

| Component | Path | Purpose |
|-----------|------|---------|
| `Toast` | `components/Toast.tsx` | Toast notifications (success/error/info); renders in portal |
| `Icons` | `components/Icons.tsx` | SVG icon components (`IconDollar`, `IconShield`, `IconFile`, etc.) |
| `LogoMark` | `components/LogoMark.tsx` | Brand logo SVG component |

---

## Root Layout (`app/layout.tsx`)

The root layout wraps all pages with the required providers in this order:

```tsx
<ThemeProvider>
  <LanguageProvider>
    <WalletProvider>
      <Navbar />
      {children}
      <Footer />
    </WalletProvider>
  </LanguageProvider>
</ThemeProvider>
```

---

## Lib Utilities (`app/lib/`)

| File | Purpose |
|------|---------|
| `useContractProgram.ts` | React hook returning `{ program, wallet, connection }` + PDA helpers |
| `contractAgent.ts` | All AI logic: analyze contract, review checkpoint, chat Q&A, price fetching |
| `idl.ts` | Anchor Program IDL — defines on-chain instruction types |
| `contract.json` | Contract metadata / sample schema |

---

## Styling

### Tailwind CSS

Configured in `tailwind.config.ts`. Custom colors:
```typescript
colors: {
  purple: { DEFAULT: "#9945FF", dark: "#7B2FE0" },
  green:  { solana: "#14F195" },
  blue:   { accent: "#38BDF8" }
}
```

Custom animations: `pulse-slow`, `float`, `spin-slow`

### CSS Custom Properties

All theme colors are exposed as CSS variables in `app/globals.css`, allowing dark/light switching without class toggling. See [Theming System](../development/theming.md) for the full variable reference.
