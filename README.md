# 🎬 Spacefeel - Cinema Streaming Platform

**🌐 Live Demo: [spacefeel-dev-uao6.vercel.app](https://spacefeel-dev-uao6.vercel.app/)**

A modern, production-ready cinema streaming platform built with Next.js 14, featuring a beautiful Apple TV-inspired design.

## ✨ Features

- **Multi-language Support**: Full support for English, Russian, and Ukrainian
- **TMDB Integration**: Real-time data from The Movie Database API
- **Smart Categorization**: Movies, TV Series, Anime, and Cartoons
- **User Authentication**: Mock auth system with login/register/Google OAuth simulation
- **Personal Watchlist**: Save movies and shows for later viewing
- **Detailed Pages**: Rich media details with trailers, cast, and similar content
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark Theme**: Apple TV aesthetic with glassmorphism effects
- **Smooth Animations**: Framer Motion powered transitions

## 🚀 Quick Start

### 1. Get TMDB API Key (2 minutes)

1. Go to https://www.themoviedb.org/signup
2. Create a free account
3. Navigate to Settings → API
4. Request an API Key (choose "Developer")
5. Copy your API Key

### 2. Install Dependencies
```bash
npm install
```

### 3. Add API Key

Open `.env.local` and add:
```bash
NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
```

### 4. Run the App
```bash
npm run dev
```

### 5. Open Browser

Go to http://localhost:3000

## 📁 Project Structure
```
spacefeel/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Utility libraries
├── store/                  # State management
├── types/                  # TypeScript definitions
└── public/                 # Static assets
```

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **API Client**: Axios
- **Icons**: Lucide React

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add `NEXT_PUBLIC_TMDB_API_KEY` environment variable
4. Deploy!

## 📝 License

MIT License

## 🙏 Acknowledgments

- TMDB: Movie data
- Next.js: Framework by Vercel
- Tailwind CSS: Utility-first CSS

---

**⭐ Star this project if you like it!**
