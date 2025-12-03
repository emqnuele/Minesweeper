# 💣 Minesweeper with Cheats

A modern, feature-rich Minesweeper game built with **Vite**, **React**, **TypeScript**, and **Tailwind CSS**. Includes classic game modes, smooth animations, and a secret cheat mode for those who want to play with an unfair advantage!

## 🎮 Features

- **Multiple Difficulty Levels**
  - Beginner: 9×9 grid with 10 mines
  - Intermediate: 16×16 grid with 40 mines
  - Expert: 30×16 grid with 99 mines
  - Custom: Create your own board configuration

- **Classic Minesweeper Mechanics**
  - Left-click to reveal cells
  - Right-click or Shift+click to flag/unflag cells
  - Double-click for chording (reveal adjacent cells if all adjacent mines are flagged)
  - Safe first move guaranteed
  - Question mark support for uncertain flagging

- **Smooth Animations & UI**
  - Framer Motion for elegant transitions
  - Modern gradient backdrop
  - Responsive design for all screen sizes
  - Lucide icons for visual polish

- **Game Statistics**
  - Real-time timer
  - Flags remaining counter
  - Mistake tracking
  - Hints system (limited per game)
  - Game status indicators

- **🤫 Secret Cheat Mode (OP Mode)**
  - Press `Alt+C`, `Alt+I`, `Alt+A`, `Alt+O` to unlock the cheat mode
  - Hold `Tab` while in cheat mode to peek at all mines on the board
  - Perfect for learning mine patterns or just having fun!

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Code Quality**: ESLint with Prettier

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Minesweeper
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🚀 Build & Deploy

Build the project for production:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## 📝 Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build TypeScript and bundle with Vite
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint on TypeScript files

## 🎯 How to Play

1. **Start a Game**: Select your difficulty level and click "Start Game"
2. **Reveal Cells**: Left-click any cell to reveal it
3. **Flag Mines**: Right-click or Shift+click to place/remove flags
4. **Chord**: Double-click on a numbered cell with all adjacent mines flagged to reveal remaining adjacent cells
5. **Win**: Reveal all non-mine cells to win the game
6. **Lose**: Click on a mine and it's game over

## 🤐 Cheat Mode (Secret!)

To unlock the OP (Overpowered) mode:
1. While in-game, press: `Alt+C` → `Alt+I` → `Alt+A` → `Alt+O` (in sequence, within 1.2 seconds between each key)
2. Once activated, you'll see a status indicator
3. Hold `Tab` to peek at all mines on the board
4. Perfect for learning strategies or just having fun!

## 🎨 Customization

You can create custom board configurations with:
- Custom grid size (4×4 to 30×30)
- Custom mine count
- Toggle safe first move
- Enable/disable chording
- Enable/disable question marks

## 📱 Responsive Design

The game is fully responsive and works great on:
- Desktop browsers
- Tablets
- Mobile devices (though classic Minesweeper is best enjoyed on larger screens)

## 🔧 Project Structure

```
src/
├── App.tsx                 # Main application component
├── main.tsx               # React entry point
├── types.ts               # TypeScript type definitions
├── constants.ts           # Game constants and difficulty presets
├── components/            # React components
│   ├── GameBoard.tsx      # Main game grid
│   ├── ControlPanel.tsx   # Difficulty selection panel
│   ├── StatsPanel.tsx     # Game stats display
│   └── ...
└── hooks/                 # Custom React hooks
    └── useMinesweeper.ts  # Core game logic hook
```

## 🎓 Game Rules

- A mine-free cell shows the number of adjacent mines (0-8)
- If a cell has 0 adjacent mines, adjacent cells are automatically revealed
- Flagged cells cannot be revealed (prevents accidental clicks)
- If all non-mine cells are revealed, you win!
- If you reveal a mine, you lose

## 🚨 Known Features

- Safe first move ensures you never lose on your first click
- Chording allows quick gameplay once you've mastered the rules
- Question marks help when you're uncertain about a mine location
- Hints are limited to encourage strategic thinking

## 📄 License

This project is open source and available under the MIT License.

## 🎉 Enjoy!

Have fun sweeping those mines! And remember, when you get stuck... you know the cheat code! 😉

---

**Built with ❤️ using React + Vite**
