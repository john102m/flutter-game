# Manual Test Script

## Prerequisites
- Server running: `cd server/Flutter.Server && dotnet run`
- Handset running: `cd handset && npm run dev`
- Open browser dev console (F12) to see SignalR errors

---

## Test 1: Create Game

1. Open `http://localhost:3000` in Tab 1
2. Enter name "John"
3. Click **Create Game**

**Expected:**
- Game code (4 digits) displayed
- Player list shows "John"
- "Waiting for players..." message shown

---

## Test 2: Join Game

1. Open `http://localhost:3000` in Tab 2
2. Enter name "Bob"
3. Enter the game code from Tab 1
4. Click **Join**

**Expected:**
- Tab 2 moves to lobby screen showing the game code
- Both tabs show player list: "John", "Bob"
- Tab 1 shows "Start Game" button (host, 2+ players)

---

## Test 3: Start Game

1. In Tab 1 (host), click **Start Game**

**Expected:**
- Both tabs switch to "Game On!" screen

---

## Test 4: Invalid Join

1. Refresh both tabs (restart from scratch)
2. In Tab 1, create a game
3. In Tab 2, enter a wrong code and click Join

**Expected:**
- Tab 2 shows error "Unable to join game"
- Tab 2 stays on connect screen

---

## Test 5: Start Requires 2+ Players

1. Create a game in Tab 1 (only player)

**Expected:**
- "Waiting for players..." shown
- No "Start Game" button visible

---

## Test 6: Only Host Can Start

1. Create game in Tab 1, join in Tab 2
2. In browser console on Tab 2, run:
   ```js
   // Tab 2's connection should reject this
   ```
   (Verify "Start Game" button only appears in Tab 1)

**Expected:**
- Tab 2 has no start button
