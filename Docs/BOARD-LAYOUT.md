# Flutter — Board Layout (32 Rows)

*Source: https://github.com/Capitalmind/Flutter-AI-Game-Public/blob/main/BoardLayout.md*

## Company Names (Columns)

1. Saudi Aramco
2. ExxonMobil
3. Shell
4. Chevron
5. TotalEnergies
6. BP

## Board Structure (Top to Bottom)

### Special Action Zone (Rows 1–11)

| Row | Centre Column | Action |
|-----|---------------|--------|
| 1 | Company Names | Header |
| 2 | 20% | Highest dividend payout |
| 3 | SLUMP | Fall back 6 spaces |
| 4 | 10% | Dividend |
| 5 | 10% | Dividend |
| 6 | SLUMP | Fall back 6 spaces |
| 7 | 10% | Dividend |
| 8 | 5% | Dividend |
| 9 | 5% | Dividend |
| 10 | 5% | Dividend |
| 11 | M | Market News trigger |

### Price Zone (Rows 12–32)

| Row | Price |
|-----|-------|
| 12 | £200 (top — triggers round end) |
| 13 | £190 |
| 14 | £180 |
| 15 | £170 |
| 16 | £160 |
| 17 | £150 |
| 18 | £140 |
| 19 | £130 |
| 20 | £120 |
| 21 | £110 |
| 22 | £100 PAR (starting position) |
| 23 | £90 |
| 24 | £80 |
| 25 | £70 |
| 26 | £60 |
| 27 | £50 |
| 28 | £40 |
| 29 | £30 |
| 30 | £20 |
| 31 | £10 |
| 32 | BANKRUPT (company eliminated) |

## Key Mechanics

- **Traveller pegs** move UP through the action zone (rows 11→2→top)
- **Parent pegs** sit in the price zone and indicate share price
- When a traveller reaches/passes row 2 (top), the round ends
- At round end, parent peg moves up/down based on traveller position (see Rule 11)
- Traveller returns to parent peg after each round
- If parent peg reaches row 32 → company bankrupt and removed
- If parent peg reaches row 12 (£200) → bonus shares issued, parent returns to PAR 100
