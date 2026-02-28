# Kirana Billing

## Current State
The project has the React frontend scaffolding (shadcn UI components, Tailwind, Vite) but is missing the main App.tsx and all feature components. The app previously existed but the draft expired. The backend has no Motoko code -- this app runs entirely off localStorage (offline-first PWA for small Kirana/grocery shops).

## Requested Changes (Diff)

### Add
- App.tsx with PIN-based login (default PIN: 1234)
- BillingTab: item search by number or name (English/Kannada), quantity input, discount, cart, thermal print receipt (58mm)
- ItemsTab: add/edit/delete grocery items with price and optional Kannada name
- ReportsTab: today's sales total, monthly totals, expenses list, net profit
- UdhaarTab: customer credit (Udhaar) tracking -- add credit entries, mark as paid
- SettingsTab: store name (English + Kannada), phone number, PIN change, print language toggle
- Sample items pre-loaded on first launch (8 common Kirana items)
- All data persisted in localStorage for full offline operation

### Modify
- main.tsx already exists and is fine

### Remove
- Nothing

## Implementation Plan
1. Create App.tsx with tab navigation (Billing, Items, Reports, Udhaar, Settings) and PIN login screen
2. Create hooks/useStore.ts for localStorage-based state management
3. Create components/BillingTab.tsx with smart search, cart, discount, print
4. Create components/ItemsTab.tsx with CRUD for items
5. Create components/ReportsTab.tsx with daily/monthly stats and expenses
6. Create components/UdhaarTab.tsx with credit ledger
7. Create components/SettingsTab.tsx with store config and PIN change
8. Create utils/print.ts for 58mm thermal receipt HTML generation
