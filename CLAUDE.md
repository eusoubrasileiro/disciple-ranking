# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Royal Ambassadors Ranking (Embaixadores do Rei) - A leaderboard application for tracking participant points in a youth program. The application displays a ranking with a podium for top 3 participants and a searchable leaderboard table.

**Stack**: Vite + React + TypeScript + shadcn/ui + Tailwind CSS + TanStack Query

## Commands

### Development
```bash
npm run dev          # Start dev server on http://[::]:8080
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Development server
- Default port: 8080
- Host: `::` (IPv6 compatible)

## Architecture

### Data Flow
1. **Data Source**: Static JSON file at `public/data/leaderboard.json` containing season info, rules, and participant data
2. **Data Hook**: `useLeaderboardData` hook fetches and processes the JSON, sorting participants by points (descending) then alphabetically
3. **Page**: Index page (`src/pages/Index.tsx`) orchestrates all components with loading and error states
4. **Components**: Modular components (Header, Hero, RulesSection, Podium, Leaderboard, Footer) receive processed data as props

### Component Structure
- `src/pages/Index.tsx` - Main page with data loading orchestration
- `src/components/` - Feature components (Header, Hero, Podium, Leaderboard, RulesSection, Footer)
- `src/components/ui/` - shadcn/ui components (pre-built, avoid editing directly)
- `src/hooks/` - Custom React hooks including `useLeaderboardData`
- `src/lib/utils.ts` - Utility functions (currently only `cn` for className merging)

### State Management
- TanStack Query (`QueryClient`) configured in `App.tsx` for future API calls
- Local state in components (useState)
- No global state management library (Redux/Zustand) currently used

### Routing
- React Router DOM configured in `App.tsx`
- Current routes: `/` (Index), `*` (NotFound)
- Add custom routes ABOVE the catch-all `*` route in `App.tsx`

### Styling System
The application uses a custom "Royal Theme" design system with:
- **Primary colors**: Royal blue (`--primary: 220 82% 24%`) and gold (`--accent: 45 70% 52%`)
- **Fonts**: Inter (sans) and Cinzel (display/serif) from Google Fonts
- **Custom utilities**: `.card-royal`, `.card-gold` (defined in CSS)
- **Custom animations**: `fade-in`, `scale-in` keyframes available
- Color tokens use HSL format via CSS variables (e.g., `hsl(var(--primary))`)

### TypeScript Configuration
- Path alias: `@/*` maps to `./src/*`
- Relaxed settings: `noImplicitAny: false`, `strictNullChecks: false`, `noUnusedParameters: false`
- Two config files: `tsconfig.app.json` (app) and `tsconfig.node.json` (build tools)

## Data Schema

The `public/data/leaderboard.json` structure:
```typescript
{
  season: string;           // e.g., "2025"
  updatedAt: string;        // ISO date string
  rules: Array<{
    id: number;
    description: string;
    points: number;
  }>;
  participants: Array<{
    id: number;
    name: string;
    points: number;
  }>;
}
```

## Development Notes

### Adding/Modifying Components
- Use shadcn/ui components from `src/components/ui/` when possible
- Import the `cn` utility from `@/lib/utils` for conditional className merging
- Follow the royal theme color scheme (royal blue + gold)
- Component props should include TypeScript interfaces

### Updating Leaderboard Data
Modify `public/data/leaderboard.json` directly. The sorting logic is in `useLeaderboardData.ts:46-51`:
- Primary sort: Points (descending)
- Secondary sort: Name (alphabetical, locale-aware)

### Adding New Routes
Insert routes in `src/App.tsx` BEFORE the `<Route path="*" element={<NotFound />} />` catch-all.

### Styling Guidelines
- Use Tailwind utility classes
- Custom royal theme classes: `.card-royal`, `.card-gold`
- Animations: `animate-fade-in`, `animate-scale-in`
- Access theme colors via Tailwind (e.g., `bg-primary`, `text-accent`)
- Gold shadows available: `shadow-gold`, `shadow-card`, `shadow-elevated`
