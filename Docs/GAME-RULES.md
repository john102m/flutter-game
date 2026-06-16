# Flutter — Complete Game Rules (1966 J.W. Spear & Sons)

*Source: https://github.com/Capitalmind/Flutter-AI-Game-Public/blob/main/GameRules.md*

## THE IDEA OF THE GAME

Each player starts with £300. The player tries to make a further profit by drawing dividends and by buying and selling shares in trading companies. There are six companies irrespective of the number of players. Players do not choose a company (or peg). The only way a player can obtain an interest in a company is by buying its shares. Players may invest heavily in one company or spread it over several companies if they wish.

---

## RULES OF THE GAME

### 1. Broker

The players first choose someone to act as broker. If there are more than four players he will usually be too busy to play as well. For a simulation, this will be the computer/server.

### 2. The Pegs

Each company has a composite peg consisting of:

- **Parent Peg** — indicates the current market price of 100 shares by its position on the board. Also serves as the starting point from which the traveller peg operates and to which it returns after each round.
- **Traveller Peg** — moves up the board according to the throw of the dice. Its position after each round determines the dividend paid (see Rule 11).

Each pair of pegs represents a trading company with the same colour as its lane on the board.

### 3. Money Tokens

The broker issues £300 to each player at the start: two £100, one £50, one £20, one £10, two £5. He keeps the rest for paying dividends.

### 4. Market News Cards

Shuffled and placed face down near the board at game start.

### 5. Share Certificates

The broker holds for each company as many share certificates as there are players. Each certificate = 100 shares at PAR value.

Example: 4 players = 4 certificates per company (24 total).

### 6. Market Price of Shares

The price shown in the centre column of the board, level with a company's parent peg, is the current market price of 100 shares in that company.

### 7. Starting the Game

1. Parent pegs (with traveller pegs on top) placed at PAR 100.
2. Players throw numbered die — highest starts, then clockwise.
3. On each turn: throw both dice.
   - **Colour die** → which company is affected
   - **Numbered die** → how many spaces that company's TRAVELLER peg moves up

### 8. Buying and Selling of Shares

- (a) A player may ONLY buy or sell shares IMMEDIATELY BEFORE he throws the dice.
- (b) Shares may only be bought/sold in hundreds (one certificate = 100 shares).
- (c) Broker sells available shares at market price + £5 brokerage per certificate.
- (d) Broker buys shares at market price, no fees.
- (e) All trades go through the broker only.

### 9. Market News

- (a) When a traveller peg lands on "MARKET NEWS" — turn up top card, carry out instructions for that company only, then replace card at bottom of pile.
- (b) When a traveller peg lands on "M" — it moves up to "MARKET NEWS" and a card is drawn.

### 10. Slump

When a traveller peg lands on "SLUMP" it drops back 6 holes automatically.

### 11. Dividends and Fluctuations in Share Prices

As soon as a traveller peg reaches or exceeds the top of the board, the round ends. The game halts while the broker processes ALL companies:

| Position of Traveller Peg | Dividend per 100 shares | Parent Peg Movement |
|---|---|---|
| Top of board (20%) | £20 | 2 spaces up |
| Opposite 10% | £10 | 1 space up |
| Opposite 5% | £5 | 1 space up |
| Opposite Slump (with anti-slump card) | £10 | 1 space up |
| Opposite Market News | — | Not at all |
| Below Market News | — | 1 space down |
| Still on Parent Peg | — | 2 spaces down |

**Dividends are payable on £100 PAR value, NOT on market price.**

After processing each company: return traveller peg to parent peg, then move both up/down as directed. Shuffle Market News cards. Next round begins with the player after the one who threw last.

### 12. Bonus Shares

When a PARENT peg reaches £200: the company issues bonus shares 1-for-1 free. Parent peg moves back to PAR 100. (If insufficient certificates, broker pays £100 cash per 100 shares instead.)

### 13. Bankruptcy

When a parent peg reaches the bottom of the board — company is removed from the game. Its shares have no value.

### 14. Winner

The game is won by the player who first increases total capital (money + shares at market price) to **£600** or an agreed upper limit.

- Claims can ONLY be made after the broker has completed dividend processing.
- If multiple claims, highest total wins.
- Broker checks all claims and declares winner.

---

*© MCMLXVI J.W. Spear & Sons Ltd*
