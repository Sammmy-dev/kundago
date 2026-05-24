---
name: Vibrant E-commerce
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3d4a3d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6d7b6c'
  outline-variant: '#bccbb9'
  surface-tint: '#006e2f'
  primary: '#006e2f'
  on-primary: '#ffffff'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#4ae176'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#505f76'
  on-tertiary: '#ffffff'
  tertiary-container: '#9dadc6'
  on-tertiary-container: '#314156'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system is engineered for the fast-paced world of mobile e-commerce. It evokes a sense of trust, convenience, and modern shopping. The brand personality is energetic yet organized, catering to shoppers who value speed, clarity, and a seamless experience.

The aesthetic follows a **Corporate / Modern** approach with a high-energy twist. It utilizes expansive whitespace, precise grid alignment, and purposeful motion to guide users through browsing, discovery, and checkout. The interface is designed to feel like a premium storefront: functional, conversion-oriented, and unmistakably contemporary.

## Colors
The color palette is anchored by a **Vibrant Commerce Green**, symbolizing growth, trust, and positive action.

- **Primary (#22C55E):** Used for critical action buttons (Add to Cart, Buy Now), active states, and success indicators.
- **Secondary (#0F172A):** A deep midnight navy used for high-contrast headers, primary text, and grounding elements.
- **Tertiary (#64748B):** A muted slate for secondary information, icons, and supporting borders.
- **Neutral (#F8FAFC):** A clean, cool off-white background to maintain high legibility and a spacious feel.

All primary color tokens across the system must utilize the Commerce Green to ensure a consistent visual "pulse" throughout the user journey.

## Typography
The typography strategy prioritizes rapid scannability and a premium feel.

- **Headlines:** Uses **Interf** for a sharp, contemporary look that feels modern and confident.
- **Body:** **Inter** provides a highly functional, neutral foundation for product descriptions and UI copy, ensuring legibility at all sizes.
- **Data & Labels:** **JetBrains Mono** is used for prices, discounts, and technical data points, reinforcing precision and trust.

Use tight letter-spacing on display headings to maintain a compact, high-impact feel.

## Layout & Spacing
This design system utilizes a **Fluid Grid** based on a 4px baseline shift. 

- **Mobile:** 4-column grid with 16px margins.
- **Tablet:** 8-column grid with 24px margins.
- **Desktop:** 12-column grid with 64px margins and a maximum content container of 1280px.

Spacing is aggressive and structured. Use "md" (16px) for internal card padding and "xl" (40px) to separate major sections. This creates a rhythmic, organized flow that guides the user naturally from browsing to checkout.

## Elevation & Depth
Visual hierarchy is achieved through **Tonal Layers** and subtle **Ambient Shadows**. 

- **Surface Levels:** The base background is the neutral hex. Elevated elements (cards, menus) use a pure white surface.
- **Shadows:** Use a single, very soft shadow style for floating elements: `0px 4px 20px rgba(15, 23, 42, 0.08)`. 
- **Interaction:** On hover, buttons do not gain elevation but instead shift in color brightness. Only "active" overlays like modals should use a backdrop blur (8px) to isolate the user's focus and minimize distractions.

## Shapes
The shape language is **Rounded**, striking a balance between approachability and modern sophistication.

Standard components (inputs, cards, buttons) use a 0.5rem (8px) radius. This provides an approachable, modern feel without being overly "bubbly" or playful, maintaining the professional integrity of the e-commerce platform.

## Borders
**Borders should not be used on components or elements.** The design favors clean, borderless surfaces with spacing and shadows to create hierarchy. This applies to cards, buttons, chips, and all other UI elements.

## Components
- **Buttons:** Primary buttons feature the Commerce Green background with white text. Use "Hanken Grotesk" Bold for button labels to ensure they stand out as the primary call to action.
- **Chips:** Used for product categories and filters (Electronics, Fashion, Home). These should have a light tint of the primary color or secondary color without any border.
- **Input Fields:** Borderless by default. On focus, the background shifts to indicate active state instead of a border change.
- **Cards:** White background, 8px radius, and ambient shadow for elevation. No borders.
- **Navigation Bar:** Fixed at the bottom for mobile, top for desktop. Uses the Secondary Navy background with high-contrast icons for easy thumb-reach usability.
- **Cart Badge:** A numbered badge on the cart icon should use the Commerce Green background to draw attention to pending items.