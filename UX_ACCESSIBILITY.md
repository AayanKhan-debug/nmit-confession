# UX & Accessibility Guide

## 1. Responsive Design
- The application layout has been validated across a full matrix of breakpoints: `320px`, `375px`, `390px`, `430px`, `768px`, `1024px`, and `1280px+`.
- A responsive, mobile-first navigation menu was introduced in `Navbar.tsx` that collapses into a hamburger menu for narrow viewports (`md:hidden`) and expands natively on tablets and desktops, eliminating horizontal overflow.
- Grid and flexbox layouts inside administrative dashboards (`ModQueue.tsx`, `AdminReports.tsx`) natively adapt via `grid-cols-2` and `md:grid-cols-3` to prevent forced sideways scrolling.

## 2. Keyboard Accessibility
- Custom focus rings (`focus:ring-2 focus:ring-blue-500 focus:outline-none`) have been enforced on all interactive components including form inputs, select dropdowns, and buttons.
- Tab order organically follows the DOM flow. No hard-coded positive `tabindex` values exist.
- The mobile `Navbar` menu toggles correctly via `Space` and `Enter` keys, and correctly associates its state via `aria-expanded` and `aria-label`.

## 3. Screen Reader Semantics (ARIA)
- **Forms:** All inputs (`Search.tsx`, `Submit.tsx`, `Login.tsx`, `ModQueue.tsx`, `AdminReports.tsx`) have explicit `<label htmlFor="...">` and `<input id="...">` bindings for native screen reader announcements. 
- **Buttons:** Icon-only or implicitly labeled buttons (e.g., reaction buttons in `Home.tsx`, `Search.tsx`, `Trending.tsx`) have been reinforced with `aria-label` attributes (`React with Love`, `React with Funny`, etc.). Svg icons use `aria-hidden="true"`.
- **Alerts:** Success and error states dynamically inject `<div role="alert">` providing immediate feedback without requiring focus management interventions. Character counters correctly use `aria-live="polite"` and `aria-describedby` to safely announce length limitations dynamically.

## 4. Semantic HTML
- `<div>` elements have been strictly avoided for clickable actions. Interactive behaviors are backed by native `<button>` or `<form>` wrappers allowing standard browser submit handling.
- `role` attributes were removed where redundant (e.g. `role="button"` on a `<button>`).

## 5. Security & Privacy Validations
- No tracking or analytics telemetry of any kind was integrated.
- State persists via URL query parameters and local component state. Authentication (`Admin Login`) avoids both `localStorage` and `sessionStorage`.
- `dangerouslySetInnerHTML` is categorically absent. All user content strictly maps to text interpolation to defend against XSS.

## 6. Known Limitations
- The application currently implements a single visual theme (light mode). Dark mode could be introduced in the future utilizing native CSS `prefers-color-scheme` without complex toggles.
- Pagination does not currently inject granular aria attributes declaring the exact "current page" status per button, though the visual counter acts as an implicit indicator.
- Empty states are textual rather than illustrational, deliberately chosen to preserve DOM simplicity and application size.
