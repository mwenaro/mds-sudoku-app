# MDS Sudoku App

A full-stack Sudoku application with both web and mobile implementations, featuring user authentication, game statistics, and a comprehensive leaderboard system.

## 🏗️ Project Structure

```
mds-sudoku-app/
├── web-app/                    # Next.js 15 Web Application
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── api/           # API Routes
│   │   │   │   └── records/   # Game records API
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── page.tsx       # Home page
│   │   ├── components/        # React Components
│   │   │   ├── ui/           # UI Components (Button, Card, Select)
│   │   │   ├── AuthNav.tsx   # Authentication navigation
│   │   │   ├── DifficultySelector.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   └── SudokuBoard.tsx
│   │   ├── lib/              # Utilities and configurations
│   │   │   ├── clerk.tsx     # Clerk authentication
│   │   │   ├── db.ts         # MongoDB database
│   │   │   ├── motion.tsx    # Framer Motion config
│   │   │   └── types.ts      # TypeScript types
│   │   ├── store/            # State Management
│   │   │   └── gameStore.ts  # Zustand game state
│   │   └── utils/            # Utility functions
│   │       └── sudoku.ts     # Sudoku game logic
│   ├── public/               # Static assets
│   ├── package.json
│   └── next.config.ts
│
├── mobile-app/                 # React Native Mobile Application
│   ├── src/
│   │   ├── components/        # React Native Components
│   │   │   └── SudokuBoard.tsx
│   │   ├── screens/           # Navigation screens
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── GameScreen.tsx
│   │   │   └── index.ts
│   │   ├── store/            # State Management
│   │   │   └── gameStore.ts  # Shared Zustand store
│   │   └── utils/            # Utility functions
│   │       └── sudoku.ts     # Shared Sudoku logic
│   ├── assets/               # Mobile app assets
│   ├── App.tsx              # Main app component
│   ├── index.ts             # App entry point
│   ├── app.json             # Expo configuration
│   └── package.json
│
├── .gitignore
└── README.md
```

## ✨ Features

### 🎮 Game Features
- **5 Difficulty Levels**: Easy, Medium, Difficult, Expert, Nightmare
- **Smart Puzzle Generation**: Unique solution guaranteed for every puzzle
- **Timer System**: Track your solving time with start/pause/resume functionality
- **Mistake Tracking**: Monitor errors with visual feedback
- **Pencil Mode**: Add notes to cells for advanced solving techniques
- **Hint System**: Get strategic tips when stuck
- **Auto-Save**: Game state persists across sessions

### 🌐 Web Application (Next.js 15)
- **Modern UI**: Responsive design with Tailwind CSS
- **User Authentication**: Secure login/signup via Clerk
- **Game Statistics**: Personal performance tracking
- **Global Leaderboard**: Compare scores with other players
- **Real-time Updates**: Live leaderboard updates
- **Progressive Web App**: Works offline

### 📱 Mobile Application (React Native + Expo)
- **Native Performance**: Optimized for iOS and Android
- **Touch-First Design**: Intuitive mobile interactions
- **Responsive Layout**: Adapts to different screen sizes
- **Cross-Platform**: Single codebase for both platforms
- **Native Feel**: Platform-specific UI patterns

### 🔧 Technical Features
- **Shared Game Logic**: Consistent experience across platforms
- **State Management**: Zustand for efficient state handling
- **Type Safety**: Full TypeScript implementation
- **Database Integration**: MongoDB for data persistence
- **API Routes**: RESTful API for game data
- **Error Handling**: Comprehensive error management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB database
- Clerk account (for web app authentication)
- Expo CLI (for mobile development)

### Web Application Setup

1. **Navigate to web app directory**
   ```bash
   cd web-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env.local` file:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # URLs
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000)

### Mobile Application Setup

1. **Navigate to mobile app directory**
   ```bash
   cd mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Expo development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## 🎯 Game Rules

### Objective
Fill a 9×9 grid with digits 1-9 such that:
- Each row contains all digits 1-9
- Each column contains all digits 1-9  
- Each 3×3 box contains all digits 1-9

### Difficulty Levels

| Level | Empty Cells | Description |
|-------|-------------|-------------|
| **Easy** | 40 | Perfect for beginners |
| **Medium** | 48 | Moderate challenge |
| **Difficult** | 54 | Advanced players |
| **Expert** | 58 | Master level |
| **Nightmare** | 62 | Ultimate challenge |

### Controls

#### Web Application
- **Click** cell to select
- **Number keys (1-9)** to input
- **Delete/Backspace** to clear
- **Space** to toggle pencil mode
- **H** for hint

#### Mobile Application
- **Tap** cell to select
- **Number buttons** to input
- **Clear button** to remove
- **Pencil toggle** for notes mode

## 🏆 Scoring System

- **Time Bonus**: Faster completion = higher score
- **Mistake Penalty**: Each error reduces final score
- **Difficulty Multiplier**: Harder puzzles worth more points
- **Leaderboard Ranking**: Global and personal best tracking

## 🔧 Technology Stack

### Web Application
- **Framework**: Next.js 15 with App Router
- **UI**: React 19 + Tailwind CSS
- **Animation**: Framer Motion
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose
- **State Management**: Zustand
- **Language**: TypeScript
- **Deployment**: Vercel ready

### Mobile Application  
- **Framework**: React Native with Expo 54
- **Navigation**: React Navigation 7
- **State Management**: Zustand (shared)
- **UI**: React Native components
- **Language**: TypeScript
- **Platform**: iOS, Android, Web

### Shared
- **Game Engine**: Custom Sudoku generator/solver
- **State Management**: Zustand stores
- **Type Safety**: TypeScript throughout
- **Code Quality**: ESLint + Prettier

## 📈 Performance Features

- **Optimized Rendering**: Efficient component updates
- **Lazy Loading**: Components loaded on demand  
- **Memory Management**: Proper cleanup and garbage collection
- **Bundle Optimization**: Tree shaking and code splitting
- **Caching**: Strategic caching for better performance

## 🛡️ Security Features

- **Authentication**: Secure user sessions
- **Input Validation**: Server-side validation
- **CORS Protection**: Proper cross-origin handling
- **Environment Variables**: Secure configuration management
- **Type Safety**: Runtime type checking

## 🧪 Development

### Available Scripts

#### Web App
```bash
npm run dev      # Development server
npm run build    # Production build  
npm run start    # Production server
npm run lint     # Code linting
```

#### Mobile App
```bash
npm start        # Expo development server
npm run android  # Run on Android
npm run ios      # Run on iOS  
npm run web      # Run in web browser
```

### Project Commands
```bash
# Install all dependencies
npm install

# Start both applications
npm run dev:all    # If configured

# Clean build artifacts
npm run clean      # If configured
```

## 🚀 Deployment

### Web Application (Vercel)
1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Mobile Application
1. **Expo Application Services (EAS)**
   ```bash
   eas build --platform all
   eas submit --platform all
   ```

2. **App Store Connect** (iOS)
3. **Google Play Console** (Android)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**mwenaro**
- GitHub: [@mwenaro](https://github.com/mwenaro)
- Repository: [mds-sudoku-app](https://github.com/mwenaro/mds-sudoku-app)

## 🙏 Acknowledgments

- Sudoku algorithm inspiration from classical solving techniques
- UI/UX patterns from modern gaming applications
- Community feedback and testing
- Open source libraries and frameworks

---

**Happy Puzzling! 🧩**