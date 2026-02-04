# UBG: Untitled Bird-breeding Game

An educational web game that teaches Mendelian genetics through bird breeding. Designed for 8th grade science students to learn about Punnett squares, genotypes, and phenotypes in an engaging, hands-on way.

## The Game

Players breed birds to achieve a target phenotype. Each breeding decision shows Punnett squares that predict offspring outcomes, reinforcing the connection between genetic probability and observable traits.

**Core loop:**
1. View your flock of birds with their traits (phenotypes) and genetics (genotypes)
2. Select two parent birds to breed
3. See Punnett squares showing possible offspring outcomes
4. Receive an offspring and add it to your flock
5. Repeat until you breed the goal bird

## Genetics Model

The game uses **incomplete dominance** to create three distinct phenotypes per trait:

**Wing Size** (W/w alleles)
| Genotype | Phenotype |
|----------|-----------|
| WW | Large wings |
| Ww | Medium wings |
| ww | Small wings |

**Tail Type** (T/t alleles)
| Genotype | Phenotype |
|----------|-----------|
| TT | Fan tail |
| Tt | Standard tail |
| tt | Pointed tail |

This creates 9 possible phenotype combinations, teaching students that multiple traits segregate independently.

## Tech Stack

- **Angular 21** - Component framework
- **NgRx** - State management
- **Vitest** - Unit testing
- **TypeScript** - Type safety

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app reloads automatically on file changes.

### Testing

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

### Build

```bash
npm run build
```

Build artifacts are output to `dist/`.

## Project Structure

```
src/app/
├── 1. features/        # Feature modules (game screens)
│   └── game/
│       ├── components/ # Presentational components
│       └── screens/    # Screen-level components
├── 2. store/           # NgRx state management
│   └── game/           # Game state, actions, reducer, selectors, effects
└── 3. shared/          # Shared utilities
    └── genetics/       # Pure functions for genetics calculations
```

## Accessibility

The game is fully keyboard-navigable and screen-reader friendly:
- Skip link to main content
- Semantic HTML tables for Punnett squares
- ARIA labels and live regions
- Focus management on screen transitions
- Visible focus indicators

## License

MIT
