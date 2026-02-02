# Pigeon Punnett POC — Angular + NgRx (single-run)

## Primer: What This Project Is and Why It Exists

This project is a **proof-of-concept educational game** for **8th grade science students**.  
The goal is to teach **basic genetics and Punnett squares** by embedding them inside a **game loop that feels fun and rewarding**, not like homework.

This is *not* a simulation-heavy biology app and *not* a full roguelike.  
It is intentionally small, opinionated, and designed to prove one thing:

> **If students understand Punnett squares, they perform better in the game.**

The game teaches genetics by:
- letting players **breed pigeons** with visible genetic traits
- showing **Punnett squares visually** during breeding
- tying **probability and outcomes** directly to what appears in the square
- using correct **scientific terminology** (allele, genotype, phenotype)

Players do *not* need prior genetics knowledge to start.  
They *will* start picking it up naturally as they try to win.

---

## Intended Audience (Important for UX Decisions)

Primary:
- 8th grade students
- mixed gamer / non-gamer audience
- some students will click impulsively
- some will min/max and optimize

Secondary:
- teachers evaluating whether the game reinforces curriculum concepts

Design implications:
- there must always be an obvious “what do I click next?”
- there must be no single cheesy strategy that bypasses genetics
- the game must remain playable even if the player ignores theory
- the **best outcomes require understanding Punnett squares**

---

## What “Success” Looks Like for the POC

By the end of this POC, we should be able to say:

- A student can complete a full run in ~10–15 minutes
- Punnett squares are clearly visible and understandable
- The game produces **correct genetic probabilities**
- A motivated player can reason about outcomes using the squares
- The codebase is clean enough to extend into a full game later

This POC intentionally:
- uses a **single fixed run**
- uses **simple traits**
- avoids meta-progression and randomness explosions
- prioritizes correctness and clarity over content volume

---

## Reference Project (Gold Standard)

Use this repo as the architectural and stylistic reference:

https://github.com/tarrball/palabritas

Specifically, follow it for:
- Angular feature/module structure
- NgRx patterns (actions, reducer, selectors, tests)
- container vs presentational components
- preference for pure functions + selectors
- testing philosophy for NgRx-heavy apps

**Claude:**
1. Skim Palabritas before writing new code.
2. Mimic its structure and testing style.
3. Keep this POC small, readable, and boringly correct.

---

## POC Scope and Constraints

### What this POC *is*
A **single fixed run** web-only game where players:
1. see a small deck of pigeons
2. select two parents
3. view Punnett squares for each trait
4. see outcome probabilities
5. receive an offspring
6. repeat a few times to try to reach a goal pigeon

### What this POC *is not*
- no backend
- no persistence required
- no art pipeline
- no procedural generation across runs
- no advanced roguelike systems
- no Playwright / E2E (NgRx tests are sufficient)

---

## Genetics Model (Teachable and Minimal)

We need **Wing Size (3 types)** and **Tail Type (3 types)**.

To get 3 phenotypes from a single gene while staying Punnett-square friendly, we use **incomplete dominance**.

### Trait A: Wing Size (alleles W and w)
- WW → Large wings
- Ww → Medium wings
- ww → Small wings

### Trait B: Tail Type (alleles T and t)
- TT → Fan tail
- Tt → Standard tail
- tt → Pointed tail

This yields:
- 3 wing phenotypes × 3 tail phenotypes = **9 phenotype combinations**

Use correct terminology consistently:
- **allele** = gene variant (W, w, T, t)
- **genotype** = allele pair (Ww)
- **phenotype** = observable trait (Medium wings)

---

## Goal Bird (Win Condition)

Goal genotype:
- Wing: WW
- Tail: TT

Goal phenotype:
- Large wings
- Fan tail

The player wins immediately when this pigeon is produced.

---

## Single-Run Setup (Fixed)

Starting pigeons (designed so genetics matters):

- A: WWtt (Large wings, Pointed tail)
- B: wwTT (Small wings, Fan tail)
- C: WwTt (Medium wings, Standard tail)
- D: Wwtt (Medium wings, Pointed tail)

Run length:
- 3 breeding steps (4 if playtesting shows it’s too tight)

Offspring selection:
- Prefer **deterministic** selection for the POC
- Choose the highest-probability outcome
- Use stable tie-breaking so tests remain deterministic

---

## UI Overview (Minimum Viable)

### Intro Screen
- Title
- Start button
- Short explanation of the loop

### Deck Screen
- List of pigeon cards:
  - phenotype
  - genotype
- Goal pigeon shown clearly
- CTA: “Breed”

### Breed Screen
- Select Parent A and Parent B
- Once selected:
  - show **Punnett square (2×2)** for wings
  - show **Punnett square (2×2)** for tails
  - show outcome probabilities (combined)
- Breed button

### Result Screen
- Show offspring pigeon
- Brief explanation (“Based on the Punnett squares…”)
- Continue or Win

### Win / Lose
- Win: success message + reset
- Lose: out-of-steps message + reset

Punnett squares must be **visually obvious** and labeled with parent alleles.

---

## State and NgRx Expectations

Follow Palabritas patterns.

High-level state should cover:
- current phase/screen
- pigeon collection
- selected parents
- last breeding result (squares + probabilities)
- step count
- goal definition

Guidelines:
- genetics logic lives in **pure functions**
- reducers orchestrate flow
- selectors derive UI-ready data
- effects are optional and likely unnecessary

Testing expectations:
- reducer tests for flow
- selector tests for derived data
- pure-function tests for genetics correctness

---

## Implementation Tasks (Claude: Do These in Order)

### 0) Orientation
- Review Palabritas repo
- Decide which patterns to follow
- Write short notes explaining the chosen structure

### 1) Scaffold the POC feature
- Create feature module/route
- Placeholder screen renders

### 2) Implement genetics utilities
- genotype → phenotype
- single-trait Punnett square
- combined outcome probabilities

### 3) Add NgRx state and reducer
- actions for start, select parents, breed, continue, reset
- selectors for UI needs

### 4) Build core UI components
- pigeon card
- punnett square view
- outcome probability list

### 5) Wire screens and flow
- intro → deck → breed → result → win/lose

### 6) Add scientific language affordances
- labels and light tooltips
- no long explanations

### 7) Final polish
- reset always works
- deterministic behavior
- tests passing

---

## Guardrails (Please Don’t Drift)

- No extra traits
- No meta progression
- No backend
- No premature optimization
- No overengineering

Correctness, clarity, and testability come first.
