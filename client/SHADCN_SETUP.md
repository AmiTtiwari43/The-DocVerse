# Shadcn/UI Setup Guide

This project is configured to use **shadcn/ui** components. The setup is complete and ready to use!

## ✅ Current Setup

- ✅ `components.json` - Configuration file for shadcn CLI
- ✅ Path aliases configured (`@/` imports)
- ✅ Tailwind CSS configured with shadcn variables
- ✅ All existing components are compatible

## 📦 Currently Installed Components

The following shadcn components are already installed in `src/components/ui/`:

- ✅ Alert
- ✅ Avatar
- ✅ Badge
- ✅ Button
- ✅ Card
- ✅ Dialog
- ✅ Dropdown Menu
- ✅ Input
- ✅ Select
- ✅ Separator
- ✅ Skeleton
- ✅ Tabs
- ✅ Textarea
- ✅ Toast

## 🚀 Adding New Components

You can now easily add new shadcn components using the CLI:

### Using npx (Recommended)

```bash
cd client
npx shadcn@latest add [component-name]
```

### Examples

```bash
# Add a progress bar
npx shadcn@latest add progress

# Add a tooltip
npx shadcn@latest add tooltip

# Add a popover
npx shadcn@latest add popover

# Add a calendar/date picker
npx shadcn@latest add calendar

# Add a form component
npx shadcn@latest add form

# Add a slider
npx shadcn@latest add slider

# Add a switch
npx shadcn@latest add switch

# Add a checkbox
npx shadcn@latest add checkbox

# Add a radio group
npx shadcn@latest add radio-group

# Add a label
npx shadcn@latest add label
```

## 📋 Useful Components to Consider

Based on your project, here are some components that could enhance the UI:

### Form Components
- **form** - For better form validation with react-hook-form
- **label** - Already have @radix-ui/react-label, but shadcn label is better styled
- **checkbox** - For filter options
- **radio-group** - For selection options
- **switch** - For toggle settings

### Display Components
- **progress** - Show loading states, appointment progress
- **tooltip** - Helpful hints and information
- **popover** - Additional information panels
- **accordion** - Collapsible sections
- **sheet** - Slide-out panels (mobile-friendly)

### Data Display
- **table** - For admin dashboards
- **pagination** - For large lists
- **calendar** - Better date selection for appointments

### Feedback
- **alert-dialog** - Confirmation dialogs
- **command** - Command palette/search
- **hover-card** - Quick info on hover

## 🔧 Configuration Details

### Path Aliases

The project uses `@/` as an alias for `src/`:

- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/components/ui` → `src/components/ui`

### Import Example

```jsx
// Instead of:
import { Button } from '../components/ui/button'

// You can use:
import { Button } from '@/components/ui/button'
```

### Components Location

All shadcn components are installed in:
```
client/src/components/ui/
```

## 🎨 Styling

The project uses:
- **CSS Variables** for theming (light/dark mode)
- **Tailwind CSS** for styling
- **Custom color scheme** (purple/teal gradient)

All components automatically respect the theme configuration in `src/index.css`.

## 🔍 Verifying Setup

To verify everything is working:

1. Check that `components.json` exists in the `client/` directory
2. Try adding a component: `npx shadcn@latest add tooltip`
3. Import and use it in your code

## 📚 Resources

- [Shadcn/UI Documentation](https://ui.shadcn.com)
- [Component Examples](https://ui.shadcn.com/docs/components)
- [Installation Guide](https://ui.shadcn.com/docs/installation)

## 💡 Tips

1. **Always run commands from the `client/` directory**
2. **Components are copied to your project** (not installed as npm packages)
3. **You can customize components** directly in `src/components/ui/`
4. **Use TypeScript?** Update `components.json` to set `"tsx": true`

## 🐛 Troubleshooting

### Component not found
- Make sure you're in the `client/` directory
- Check that `components.json` exists
- Verify path aliases in `vite.config.js` and `jsconfig.json`

### Import errors
- Restart your dev server after adding components
- Check that the component file exists in `src/components/ui/`
- Verify path aliases are configured correctly

### Styling issues
- Ensure Tailwind CSS is properly configured
- Check that CSS variables are defined in `src/index.css`
- Verify the component uses the `cn()` utility for class merging

