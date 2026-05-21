# Design System Documentation

This project uses the **"Vibrant Urban Mobility"** design system with **Nativewind v5**, where all design tokens are configured in CSS.

## Setup

The design system is configured through:
- **`global.css`** - Design tokens, typography scale, colors, spacing, and component utilities (single source of truth)
- **`tailwind.config.js`** - Minimal Nativewind preset configuration
- **`constants/theme.ts`** - TypeScript constants for runtime access to design tokens (optional)

## Colors

### Primary - Vibrant Mobility Green (#006e2f)
Used for critical action buttons, active states, and success indicators.
```typescript
import { Colors } from '@/constants/theme';

// In JSX
style={{ color: Colors.primary.DEFAULT }}  // #006e2f
style={{ backgroundColor: Colors.primary.container }}  // #22c55e
```

### Secondary - Deep Navy (#565e74)
Used for high-contrast headers, primary text, and grounding elements.
```typescript
style={{ color: Colors.secondary.DEFAULT }}  // #565e74
```

### Tertiary - Muted Slate (#505f76)
Used for secondary information, icons, and supporting borders.
```typescript
style={{ color: Colors.tertiary.DEFAULT }}  // #505f76
```

### Error (#ba1a1a)
Error states and destructive actions.
```typescript
style={{ color: Colors.error.DEFAULT }}  // #ba1a1a
```

### Surfaces
Multiple surface levels for depth and hierarchy.
```typescript
style={{ backgroundColor: Colors.surface.DEFAULT }}  // #f7f9fb
style={{ backgroundColor: Colors.surface.container }}  // #eceef0
```

## Typography

### Using CSS Classes for Typography Scale

```typescript
import { Text } from 'react-native';

// Display Large - Headlines
<Text className="display-lg">Main Title</Text>

// Display Large Mobile
<Text className="display-lg-mobile">Mobile Title</Text>

// Headline Medium
<Text className="headline-md">Section Heading</Text>

// Body Large
<Text className="body-lg">Large content text</Text>

// Body Medium (default body text)
<Text className="body-md">Standard paragraph text</Text>

// Label Small (for data/labels)
<Text className="label-sm">12:30 PM</Text>
```

**Note**: These classes apply font size, weight, and line height only. Font families must be applied via inline styles (see below).

### Using Typography Constants for Font Families

```typescript
import { Typography, Fonts } from '@/constants/theme';
import { Platform } from 'react-native';

// Apply specific typography with font family
<Text style={Typography.displayLarge}>Main Title</Text>
<Text style={Typography.bodyMd}>Body text</Text>

// Apply only font family (useful with className)
<Text 
  className="display-lg"
  style={{ fontFamily: Fonts.hanken }}
>
  Display Title
</Text>
```

### Font Families
- **Hanken Grotesk** - Headlines and display text (sharp, contemporary)
- **Inter** - Body text (neutral, highly legible)
- **JetBrains Mono** - Data and labels (technical precision)

**React Native Limitation**: Font families cannot be applied via Tailwind utilities on mobile. Use inline styles from `constants/theme.ts` instead.

## Spacing

Based on a 4px baseline grid. Use tailwind classes:

```typescript
import { Spacing } from '@/constants/theme';

// Tailwind classes
<View className="px-md py-lg">  // 16px padding horizontal, 24px vertical
</View>

// Or constants
style={{ padding: Spacing.md }}  // 16px
style={{ margin: Spacing.lg }}   // 24px
```

Spacing scale:
- `xs`: 4px
- `sm`: 8px
- `md`: 16px (most common for card padding)
- `lg`: 24px
- `xl`: 40px (section separators)

## Border Radius

Rounded components with 0.5rem (8px) radius for modern, approachable feel:

```typescript
import { BorderRadius } from '@/constants/theme';

// Tailwind classes
<View className="rounded-sm">  // 4px radius

// Or constants
style={{ borderRadius: BorderRadius.sm }}  // 4px
style={{ borderRadius: BorderRadius.md }}  // 6px
```

Radius scale:
- `xs`: 2px
- `sm`: 4px (standard components)
- `md`: 6px
- `lg`: 8px
- `xl`: 12px
- `full`: 9999px (circles/pills)

## Component Patterns

### Primary Button
```typescript
<Pressable className="btn-primary">
  <Text className="text-white">Action</Text>
</Pressable>
```

### Card
```typescript
<View className="card p-md">
  <Text className="headline-md mb-sm">Card Title</Text>
  <Text className="body-md">Card content</Text>
</View>
```

### Input Field
```typescript
<TextInput 
  className="input-field"
  placeholder="Enter text"
  placeholderTextColor={Colors.onSurfaceVariant}
/>
```

### Chip (Transit Mode Tag)
```typescript
<View className="chip-primary">
  <Text className="label-sm">Bus</Text>
</View>
```

### Live Indicator
```typescript
<Text className="live-indicator">● Live</Text>
```

## Shadows

```typescript
import { Shadows } from '@/constants/theme';

// Ambient shadow (most common)
<View style={Shadows.ambient}>
  {/* content */}
</View>

// Small shadow
<View style={Shadows.sm}>
  {/* content */}
</View>
```

## Dark Mode Considerations

The design system uses a light color palette by default. For dark mode implementation, use the inverse colors:
```typescript
// Dark mode colors
isDarkMode ? Colors.inverseSurface : Colors.surface.DEFAULT
isDarkMode ? Colors.inverseOnSurface : Colors.onSurface
```

## Best Practices

1. **Use semantic color names** - Use `primary`, `secondary`, `error` instead of color hex values
2. **Maintain spacing consistency** - Use the spacing scale (xs, sm, md, lg, xl)
3. **Font hierarchy** - Use appropriate typography levels (display, headline, body, label)
4. **Rounded corners** - Standard components use `rounded-sm` (4px)
5. **Shadows** - Use `Shadows.ambient` for elevated components
6. **Alignment** - Follow the 4px grid baseline for pixel-perfect layouts

## Resources

- Design File: `.github/design.md`
- Theme Constants: `constants/theme.ts`
- Tailwind Config: `tailwind.config.js`
- Global Styles: `global.css`
