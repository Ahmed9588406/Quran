# Admin Dashboard - Design Guide

## 🎨 Design System

### Color Palette

#### Background Colors
```css
Primary Background: #0a0a0f (Deep dark navy)
Card Background: #12121a (Slightly lighter dark)
Card Hover: rgba(255, 255, 255, 0.05)
Border: rgba(255, 255, 255, 0.1)
```

#### Accent Colors
```css
Emerald (Mosques): #10b981
Cyan (Rooms): #06b6d4
Violet (Preachers): #8b5cf6
Red (Danger): #ef4444
Amber (Warning): #f59e0b
```

#### Text Colors
```css
Primary Text: #ffffff
Secondary Text: #9ca3af
Tertiary Text: #6b7280
```

### Typography

#### Font Sizes
- **Headings**: 
  - H1: 2xl (1.5rem)
  - H2: xl (1.25rem)
  - H3: lg (1.125rem)
- **Body**: sm (0.875rem) to base (1rem)
- **Small**: xs (0.75rem)

#### Font Weights
- **Bold**: 700 (Headings, important text)
- **Semibold**: 600 (Subheadings, labels)
- **Medium**: 500 (Buttons, badges)
- **Normal**: 400 (Body text)

### Spacing

#### Padding
- **Cards**: p-5 (1.25rem)
- **Modals**: p-6 (1.5rem)
- **Buttons**: px-4 py-2 (1rem x 0.5rem)
- **Large Buttons**: px-6 py-3 (1.5rem x 0.75rem)

#### Gaps
- **Grid**: gap-4 (1rem)
- **Flex Items**: gap-2 to gap-4 (0.5rem to 1rem)

#### Margins
- **Section Spacing**: mb-6 (1.5rem)
- **Element Spacing**: mb-4 (1rem)

### Border Radius

```css
Small: rounded-lg (0.5rem)
Medium: rounded-xl (0.75rem)
Large: rounded-2xl (1rem)
Extra Large: rounded-3xl (1.5rem)
Full: rounded-full
```

### Shadows

```css
Card Hover: shadow-lg
Button Hover: shadow-lg shadow-emerald-500/25
Modal: shadow-2xl
```

## 🧩 Component Patterns

### Cards

#### Basic Card Structure
```tsx
<div className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-{color}-500/30 rounded-2xl p-5 transition-all duration-300">
  {/* Card Header */}
  <div className="flex justify-between items-start mb-4">
    {/* Icon + Title */}
    {/* Status Badge */}
  </div>
  
  {/* Card Body */}
  <div className="space-y-2 text-sm mb-4">
    {/* Info rows */}
  </div>
  
  {/* Card Footer */}
  <div className="flex gap-2 pt-4 border-t border-white/5">
    {/* Action buttons */}
  </div>
</div>
```

### Buttons

#### Primary Button (Gradient)
```tsx
<button className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300">
  Create
</button>
```

#### Secondary Button
```tsx
<button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-lg transition-colors">
  Cancel
</button>
```

#### Danger Button
```tsx
<button className="px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
  Delete
</button>
```

### Badges

#### Status Badge
```tsx
<span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  Active
</span>
```

#### Animated Status Badge
```tsx
<span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
  ACTIVE
</span>
```

### Icons

#### Icon Container
```tsx
<div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
  <svg className="w-5 h-5 text-emerald-400" />
</div>
```

#### Large Icon Container (Empty States)
```tsx
<div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center">
  <span className="text-4xl">🕌</span>
</div>
```

### Modals

#### Modal Structure
```tsx
<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
  
  {/* Modal Content */}
  <div className="relative w-full max-w-lg bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl">
    {/* Header */}
    <div className="px-6 py-4 border-b border-white/5">
      <h3 className="text-lg font-semibold text-white">Title</h3>
    </div>
    
    {/* Body */}
    <div className="p-6">
      {/* Content */}
    </div>
    
    {/* Footer */}
    <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
      {/* Buttons */}
    </div>
  </div>
</div>
```

### Forms

#### Input Field
```tsx
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Label <span className="text-red-400">*</span>
  </label>
  <input 
    type="text"
    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
    placeholder="Enter value..."
  />
</div>
```

#### Select Field
```tsx
<select className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors">
  <option value="" className="bg-[#12121a]">Select option</option>
  <option value="1" className="bg-[#12121a]">Option 1</option>
</select>
```

#### Textarea
```tsx
<textarea 
  rows={3}
  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
  placeholder="Enter description..."
/>
```

## 🎭 Animations

### Transitions
```css
transition-all duration-300
transition-colors
```

### Hover Effects
```css
hover:bg-white/10
hover:shadow-lg
hover:border-emerald-500/30
hover:scale-105
```

### Loading States
```css
animate-spin (spinners)
animate-pulse (loading text, status dots)
```

### Enter/Exit Animations
```tsx
// Fade in
opacity-0 → opacity-100

// Slide in
translate-x-full → translate-x-0

// Scale in
scale-95 → scale-100
```

## 🌈 Ambient Effects

### Background Gradients
```tsx
<div className="fixed inset-0 overflow-hidden pointer-events-none">
  <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[150px] animate-pulse" />
</div>
```

### Grid Pattern
```tsx
<div 
  className="fixed inset-0 opacity-[0.015] pointer-events-none"
  style={{
    backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
    backgroundSize: "50px 50px"
  }}
/>
```

## 📱 Responsive Design

### Breakpoints
```css
sm: 640px   (Small devices)
md: 768px   (Medium devices)
lg: 1024px  (Large devices)
xl: 1280px  (Extra large devices)
```

### Grid Layouts
```tsx
// Cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Stats
<div className="hidden md:flex items-center gap-3">
```

### Text Visibility
```tsx
<span className="hidden sm:inline">Logout</span>
```

## ♿ Accessibility

### Focus States
```css
focus:outline-none
focus:border-emerald-500/50
focus:ring-2 focus:ring-emerald-500/50
```

### Disabled States
```css
disabled:opacity-50
disabled:cursor-not-allowed
```

### ARIA Labels
```tsx
<button aria-label="Close modal">
<input aria-required="true">
```

## 🎯 Best Practices

### Do's ✅
- Use consistent spacing (multiples of 4px)
- Apply smooth transitions (300ms)
- Use semantic color coding
- Maintain visual hierarchy
- Provide loading states
- Show confirmation dialogs for destructive actions
- Use descriptive labels and placeholders

### Don'ts ❌
- Don't mix different border radius sizes in the same component
- Don't use pure white (#ffffff) for backgrounds
- Don't forget hover states on interactive elements
- Don't use animations longer than 500ms
- Don't skip loading states
- Don't use more than 3 accent colors in one view

## 🔄 State Indicators

### Loading
```tsx
<div className="animate-pulse">Loading...</div>
```

### Success
```tsx
<div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  Success message
</div>
```

### Error
```tsx
<div className="bg-red-500/10 text-red-400 border border-red-500/20">
  Error message
</div>
```

### Warning
```tsx
<div className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
  Warning message
</div>
```

### Info
```tsx
<div className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
  Info message
</div>
```

---

**Consistency is key! Follow these patterns for a cohesive user experience.**
