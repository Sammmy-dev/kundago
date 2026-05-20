# Design System Document
 
## 1. Overview & Creative North Star: "The Architectural Editorial"
This design system moves away from the generic "tech-startup" aesthetic to embrace a high-end, editorial feel specifically tailored for a premium HR staffing agency. The Creative North Star is **The Architectural Editorial**.
 
In this system, we treat digital space like the layout of a luxury print magazine or a modern gallery. We reject the "boxed-in" nature of traditional web design. Instead of confining talent and opportunities within rigid borders, we use **intentional asymmetry**, **extreme whitespace**, and **typographic dominance** to create a sense of authority and prestige. The goal is to make every candidate profile and job posting feel like a featured article in an industry-leading publication.
 
## 2. Colors & Surface Philosophy
The palette is built on a foundation of stark whites and high-contrast crimsons, creating a visual rhythm that is both energetic and disciplined.
 
### Palette Highlights
*   **Primary (#9e0000):** Used for "Brand Moments"—the core identity markers.
*   **Primary Container (#cc0000):** A vibrant, high-action red for primary calls to action.
*   **Secondary (#b52619):** A deeper tone for interactive states and secondary focus.
*   **Surface Tiers:** We utilize `surface-container-lowest` (#ffffff) through `surface-dim` (#dadada) to create structure without lines.
 
### The "No-Line" Rule
Traditional 1px borders are prohibited for sectioning content. To separate a "Job Search" section from a "Featured Talent" section, transition the background from `surface` (#f9f9f9) to `surface-container-low` (#f3f3f3). Boundaries are felt through tonal shifts, not seen through strokes.
 
### Glass & Gradient Rule
To prevent the design from feeling "flat" or "cheap," use **Glassmorphism** for floating elements (like navigation bars or sticky filters). Apply `surface-container-lowest` at 80% opacity with a `24px` backdrop blur. For primary CTAs, apply a subtle linear gradient from `primary` (#9e0000) to `primary_container` (#cc0000) at a 135-degree angle to add depth and "soul."
 
## 3. Typography: The Voice of Authority
We utilize **Inter** across the entire scale. The luxury feel is achieved through exaggerated scale contrasts—very large displays paired with generous letter spacing in labels.
 
*   **Display (lg/md/sm):** These are your "Editorial Statements." Use them for hero sections and key value propositions. (3.5rem to 2.25rem).
*   **Headline (lg/md/sm):** Used for section titles. Ensure headlines have at least 48px of top margin to allow the typography to breathe.
*   **Body (lg/md):** Set to `on-surface-variant` (#5e3f3a) to reduce harsh contrast and improve long-form readability.
*   **Labels (md/sm):** Always uppercase with `0.05em` letter-spacing to denote professional categorization.
 
## 4. Elevation & Depth
In this system, depth is a product of light and layering, not artificial outlines.
 
*   **The Layering Principle:** Stack surfaces to create focus. Place a `surface-container-lowest` card (the "Paper") on top of a `surface-container-low` background (the "Table"). This 1-step shift in hex value provides all the visual affordance needed for a high-end UI.
*   **Ambient Shadows:** For floating elements (Modals, Hovered Cards), use an extra-diffused shadow: `0px 20px 40px rgba(158, 0, 0, 0.05)`. Note the use of a primary-tinted shadow rather than black; this mimics the way red light reflects off a premium surface.
*   **The "Ghost Border" Fallback:** If a container (like an input field) requires a boundary, use `outline-variant` (#e8bdb6) at **15% opacity**. It should be a whisper, not a shout.
 
## 5. Components
 
### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `on-primary` text, `0.25rem` (sm) corner radius. High-end design favors the subtle "sm" radius over fully rounded "pills."
*   **Secondary:** Ghost style. No background, `0.25rem` radius, `outline-variant` at 20% opacity. Text in `primary`.
 
### Cards & Lists
*   **The "No-Divider" Rule:** Vertical lists of candidates or jobs must not use horizontal lines. Use 24px of `body-md` spacing and a background shift on hover (`surface-container-high`) to define rows.
*   **Candidate Cards:** Use `surface-container-lowest` with a "Ghost Border." Apply an asymmetrical layout: Image on the left, name in `headline-sm` at the top right, and tags (Chips) tucked into the bottom right.
 
### Input Fields
*   **Styling:** Minimalist bottom-border only, or a subtle `surface-container-highest` background fill. Avoid the "four-sided box" look. 
*   **States:** On focus, the bottom border transitions to `primary` (#9e0000) with a 2px weight.
 
### Signature Component: The "Talent Spotlight"
A large-scale carousel component using `display-md` typography that overlaps a high-quality, desaturated portrait. The text should use a `backdrop-blur` "Glass" pane to ensure legibility where it overlaps the image.
 
## 6. Do's and Don'ts
 
### Do
*   **Do** use asymmetrical margins (e.g., 10% left margin, 20% right margin) for editorial layouts.
*   **Do** embrace "dead space." If a section feels empty, it’s likely working.
*   **Do** use the `primary` red sparingly. It should be a surgical strike of color, not a wash.
 
### Don't
*   **Don't** use 1px solid black or grey borders. This immediately destroys the premium feel.
*   **Don't** use "Pill" shapes for buttons unless they are secondary filter chips. Use the `0.25rem` (DEFAULT) roundedness for a more architectural, stable look.
*   **Don't** use standard "Drop Shadows" (e.g., `0 2 4 black`). Always tint and diffuse your shadows to maintain a soft, ambient environment.