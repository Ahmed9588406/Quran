# Fatwa Card UI - Visual Guide

## Complete Fatwa Card Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  SECTION 1: ASKER INFORMATION                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Avatar] User Name                                  │   │
│  │          2 hours ago                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  SECTION 2: QUESTION TEXT                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ What is the Islamic ruling on...?                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  SECTION 2.5: PREVIOUS ANSWER (if exists)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✓ Previous Answer                                   │   │
│  │                                                     │   │
│  │ The preacher's previous answer text appears here   │   │
│  │ and can be multiple lines long...                  │   │
│  │                                                     │   │
│  │ Answered 2 hours ago                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  SECTION 3: ACTION BUTTONS                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ⊗ Reject                                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  SECTION 4: ANSWER INPUT                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Avatar] Preacher Name                              │   │
│  │                                                     │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ write here...                                   │ │   │
│  │ │                                                 │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  │ [Submit Answer]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Toast Notifications

### Loading State
```
┌─────────────────────────────────┐
│ 📤 Submitting your answer...    │
│                                 │
│ [spinner animation]             │
└─────────────────────────────────┘
```
- Position: Top-right
- Duration: Until response received
- Dismissible: No

### Success State
```
┌─────────────────────────────────┐
│ ✅ Answer submitted successfully!│
│                                 │
│ [Auto-closes in 3 seconds]      │
│ [Close button available]        │
└─────────────────────────────────┘
```
- Position: Top-right
- Duration: 3 seconds
- Dismissible: Yes (close button)
- Background: Green

### Error State
```
┌─────────────────────────────────┐
│ ❌ Failed to submit answer       │
│                                 │
│ [Stays visible for 4 seconds]   │
│ [Close button available]        │
└─────────────────────────────────┘
```
- Position: Top-right
- Duration: 4 seconds
- Dismissible: Yes (close button)
- Background: Red

## Previous Answer Display

### When Answer Exists
```
┌─────────────────────────────────────────────────────┐
│ ✓ Previous Answer                                   │
│                                                     │
│ The preacher's answer text appears here. It can    │
│ be multiple lines and contains the full response   │
│ to the user's question.                            │
│                                                     │
│ Answered 2 hours ago                               │
└─────────────────────────────────────────────────────┘
```

**Styling:**
- Background: Light green (#F0FDF4)
- Border: Green (#BBF7D0)
- Icon: Green checkmark
- Text: Dark green (#166534)
- Padding: 16px
- Border radius: 8px

### When No Answer Exists
- Section is hidden
- No placeholder shown
- Answer input is ready for new answer

## Color Scheme

### Preacher Branding
- Primary: #8A1538 (Dark red/maroon)
- Secondary: #6B102C (Darker red)
- Accent: #D7BA83 (Gold)
- Background: #FFF9F3 (Light cream)

### Previous Answer Box
- Background: #F0FDF4 (Light green)
- Border: #BBF7D0 (Medium green)
- Text: #166534 (Dark green)
- Icon: #16A34A (Green)

### Toast Notifications
- Success: Green (#10B981)
- Error: Red (#EF4444)
- Loading: Blue (#3B82F6)
- Text: White (#FFFFFF)

## Responsive Behavior

### Desktop (1024px+)
- Full card width: 512px (max-w-2xl)
- Avatar size: 48px (asker), 40px (preacher)
- Font sizes: Normal
- Padding: 20px

### Tablet (768px - 1023px)
- Full card width: 90% of container
- Avatar size: 40px (asker), 36px (preacher)
- Font sizes: Slightly reduced
- Padding: 16px

### Mobile (< 768px)
- Full card width: 100% with margins
- Avatar size: 36px (asker), 32px (preacher)
- Font sizes: Reduced
- Padding: 12px
- Toast position: Bottom-center (adjusted)

## Interaction States

### Button States

#### Submit Answer Button
- **Default:** Hidden (appears when text entered)
- **Hover:** Background darkens (#6B102C)
- **Active:** Pressed effect
- **Disabled:** Opacity 50% (while submitting)
- **Loading:** Shows "Submitting..." text

#### Reject Button
- **Default:** Gray text
- **Hover:** Red text (#EF4444)
- **Active:** Pressed effect
- **Disabled:** Not disabled

### Textarea States
- **Empty:** Placeholder text visible
- **Focused:** Ring effect (#8A1538 color)
- **Filled:** Shows submit button
- **Disabled:** Not disabled during submission

## Animation Effects

### Toast Entrance
- Slide in from right
- Duration: 300ms
- Easing: ease-out

### Toast Exit
- Slide out to right
- Duration: 300ms
- Easing: ease-in

### Button Hover
- Color transition: 200ms
- Smooth color change

### Loading Spinner
- Rotation animation
- Duration: 1s
- Infinite loop

## Accessibility Features

### Keyboard Navigation
- Tab through buttons
- Enter to submit
- Escape to close toast
- Space to toggle buttons

### Screen Reader Support
- Toast announcements
- Button labels
- Form labels
- Status messages

### Color Contrast
- Text on background: WCAG AA compliant
- Icons with text labels
- No color-only indicators

### Focus Indicators
- Visible focus ring on buttons
- Focus ring on textarea
- Focus ring on close button

## User Flow Diagram

```
User Opens Fatwa Card
        ↓
┌─────────────────────────────────┐
│ Check if answer exists          │
└─────────────────────────────────┘
        ↓
    ┌───┴───┐
    │       │
   YES     NO
    │       │
    ↓       ↓
[Show]   [Hide]
Previous  Previous
Answer    Answer
    │       │
    └───┬───┘
        ↓
User Types Answer
        ↓
[Submit Answer Button Appears]
        ↓
User Clicks Submit
        ↓
[Toast: Loading]
        ↓
    ┌───┴───┐
    │       │
Success  Error
    │       │
    ↓       ↓
[Toast:  [Toast:
Success] Error]
    │       │
    ↓       ↓
Remove   Keep
Card     Card
```

## Example Scenarios

### Scenario 1: New Fatwa
```
Card shows:
- Asker info
- Question
- NO previous answer
- Answer input ready
- Reject button
```

### Scenario 2: Previously Answered Fatwa
```
Card shows:
- Asker info
- Question
- ✓ Previous Answer (green box)
- Answer input ready (for new answer)
- Reject button
```

### Scenario 3: Submitting Answer
```
1. User types answer
2. Submit button appears
3. User clicks submit
4. Toast: "📤 Submitting..."
5. Toast: "✅ Success!"
6. Card removed from list
```

### Scenario 4: Submission Error
```
1. User types answer
2. Submit button appears
3. User clicks submit
4. Toast: "📤 Submitting..."
5. Toast: "❌ Failed to submit"
6. Card remains visible
7. Answer text preserved
```

## Performance Considerations

- Toast container: Lightweight
- Previous answer: Only renders if exists
- No animations on scroll
- Smooth transitions (200-300ms)
- Optimized SVG icons

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✓ Full | All features work |
| Firefox | ✓ Full | All features work |
| Safari | ✓ Full | All features work |
| Edge | ✓ Full | All features work |
| IE 11 | ✗ None | Not supported |
| Mobile | ✓ Full | Responsive design |
