# Instagram Clone

A full-stack Instagram clone with web and mobile applications.

## Project Structure

```
instagram/
├── apps/
│   ├── web/          # React web application (React Router + Vite)
│   └── mobile/       # React Native mobile app (Expo)
├── .gitignore        # Git ignore configuration
└── README.md         # This file
```

## Applications

### Web App (`apps/web`)
- **Framework**: React with React Router v7
- **Build Tool**: Vite
- **UI**: Chakra UI + Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query

### Mobile App (`apps/mobile`)
- **Framework**: React Native with Expo
- **Router**: Expo Router
- **UI**: Custom components
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query

## Getting Started

### Prerequisites
- Node.js (v20 or higher)
- Bun or npm for web app
- Expo CLI for mobile app

### Web App Setup
```bash
cd apps/web
bun install  # or npm install
bun run dev  # or npm run dev
```

### Mobile App Setup
```bash
cd apps/mobile
npm install
npx expo start
```

## Features

- User authentication
- Photo/video sharing
- Stories
- Direct messaging
- User profiles
- Feed
- Search
- Notifications

## Development

Each app can be developed independently. Check the README files in each app directory for specific instructions.

## License

Private project