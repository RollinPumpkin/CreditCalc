# CreditCalculator Component

This component is structured with separation of concerns between client and server components.

## Structure

- `page.tsx` - Server component wrapper (default export)
- `client.tsx` - Client component with all the interactive logic
- `index.ts` - Export file for clean imports

## Usage

```tsx
import CreditCalculator from '@/components/CreditCalculator'

// Or import specific components
import { CreditCalculatorClient } from '@/components/CreditCalculator'
```

## Features

- Interactive credit calculation form
- Real-time input validation
- Payment schedule display
- Save calculations to backend
- Responsive design with Tailwind CSS
- Professional BPR Adiarta branding
