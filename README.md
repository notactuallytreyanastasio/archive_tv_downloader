# Archive Downloader

A desktop app for downloading videos from Archive.org's markpines collection, featuring an authentic 1980s Mac OS aesthetic.

![1980s Mac OS Interface](screenshot.png)

## Features

- 📺 **Browse Videos** - Search and browse 1,344 videos from the markpines collection
- ⬇️ **Download Manager** - Queue downloads with real-time progress tracking
- 📊 **Progress Tracking** - See download speed, ETA, and percentage
- ⚙️ **Configurable Settings** - Set download directory, concurrent downloads
- 🎨 **Retro Aesthetic** - Authentic 1980s Mac OS interface (monochrome, Chicago font)

## Installation

Download the appropriate installer for your platform from the [Releases page](https://github.com/yourusername/archive_tv_downloader/releases):

### macOS
- Download `Archive-Downloader-{version}.dmg`
- Open the DMG and drag to Applications
- **Important**: Right-click → Open on first launch (Gatekeeper security)

### Windows
- Download `Archive-Downloader-Setup-{version}.exe`
- Run the installer
- Launch from Start Menu

### Linux
- **AppImage**: `chmod +x Archive-Downloader-{version}.AppImage && ./Archive-Downloader-{version}.AppImage`
- **Debian/Ubuntu**: `sudo dpkg -i Archive-Downloader-{version}.deb`

## Usage

### First Launch
On first run, the app automatically syncs 1,344 videos from Archive.org (takes 2-5 minutes).

### Browsing
- Use the search bar to find videos
- Click "Download" on any video card

### Downloading
- Switch to "Downloads" tab to see progress
- Use "Pause All" / "Resume All" controls
- Cancel individual downloads
- Videos save to your Downloads folder (configurable in Settings)

## Development

### Prerequisites
- Node.js 20+
- npm 10+

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/archive_tv_downloader.git
cd archive_tv_downloader

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Building
```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run package:mac
npm run package:win
npm run package:linux
```

## Architecture

```
┌─────────────────────────────────────┐
│     Electron Desktop App            │
├─────────────────────────────────────┤
│  React UI (Renderer)                │
│  - Video Library                    │
│  - Download Queue                   │
│  - Settings                         │
│           ↕ IPC                     │
│  Electron Main Process              │
│  - Archive.org API Client           │
│  - Download Manager                 │
│  - SQLite Database                  │
└─────────────────────────────────────┘
```

## Tech Stack

- **Electron 32** - Desktop framework
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **SQLite** - Local database
- **Vite** - Build tooling

## Project Structure

```
archive_tv_downloader/
├── electron/          # Main process
│   ├── main.ts
│   ├── preload.ts
│   ├── video-service.ts
│   ├── download-service.ts
│   └── ipc-handlers.ts
├── src/
│   ├── lib/          # Core libraries
│   │   ├── archive-client.ts
│   │   ├── download-manager.ts
│   │   ├── database.ts
│   │   └── types.ts
│   ├── components/   # React components
│   ├── store/        # Zustand stores
│   ├── styles/       # 1980s Mac OS CSS
│   └── utils/        # Helper functions
└── package.json
```

## License

MIT

## Credits

- Video content from [Archive.org markpines collection](https://archive.org/details/markpines)
- UI inspired by classic Mac OS System 1-7
- Built with ❤️ for retro computing enthusiasts
