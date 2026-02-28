# Archive Downloader

A beautiful desktop app for downloading videos from Archive.org, featuring an authentic 1980s Macintosh aesthetic. Built with Electron and React.

![1980s Mac OS Interface](screenshot.png)

## ✨ Features

### Video Management
- 📺 **Browse Collections** - Sync entire Archive.org collections
- 🎬 **Single Videos** - Add individual videos or multi-video items (TV shows, etc.)
- 🔍 **Search** - Find videos by title or description
- 📊 **Smart Detection** - Automatically handles collections, single videos, and multi-part items

### Download Control
- ⬇️ **Download All** - Queue entire collections with one click
- 📥 **Individual Downloads** - Download specific videos
- 📊 **Real-time Progress** - See speed, ETA, and percentage for each download
- ⏸️ **Queue Management** - Pause, resume, or cancel downloads
- 🔄 **Auto-retry** - Automatic retry on network errors

### File Organization
- ✏️ **Rename Files** - Rename downloaded files from within the app
- 🗑️ **Remove Videos** - Clean up your library (individual or bulk)
- 📁 **Custom Download Location** - Choose where files are saved
- 🎯 **Curate Collections** - Remove unwanted episodes/videos before downloading

### User Experience
- 🎨 **1980s Mac OS Aesthetic** - Monochrome design, Chicago font, classic UI
- ⚙️ **Configurable Settings** - Adjust concurrent downloads, paths, and behavior
- 💾 **Persistent Library** - Videos stay in your library across sessions
- 🖥️ **Cross-platform** - Works on Windows, macOS, and Linux

---

## 📥 Installation

### macOS

1. Download `Archive-Downloader-{version}.dmg` from [Releases](https://github.com/yourusername/archive_tv_downloader/releases)
2. Open the DMG file
3. Drag **Archive Downloader** to your Applications folder
4. **First launch:** Right-click the app → "Open" (required for unsigned apps)

### Windows

1. Download `Archive-Downloader-Setup-{version}.exe` from [Releases](https://github.com/yourusername/archive_tv_downloader/releases)
2. Run the installer
3. Launch from Start Menu or Desktop shortcut

### Linux

**AppImage (Universal):**
```bash
chmod +x Archive-Downloader-{version}.AppImage
./Archive-Downloader-{version}.AppImage
```

**Debian/Ubuntu (.deb):**
```bash
sudo dpkg -i Archive-Downloader-{version}.deb
```

---

## 🚀 Getting Started

### First Launch

1. **Collection Input Dialog** will appear
2. Paste an Archive.org URL or collection name
3. Click **"Sync Collection"** to fetch video metadata

**Supported URL formats:**
- Full collection URL: `https://archive.org/details/markpines`
- Collection name only: `markpines`
- Single video: `https://archive.org/details/video_id`
- Multi-video item: `https://archive.org/details/tv_show_season_1`

### What Gets Downloaded

**Important:** The sync process downloads **metadata only** (titles, descriptions, thumbnails) - not the actual video files. This is fast and lets you browse the collection.

Actual video files are downloaded only when you click **"Download"**.

---

## 📖 Complete Usage Guide

### 1. Syncing Videos

#### Sync a Collection
1. Click **"New Collection"** in the menu bar (or use first-run dialog)
2. Enter collection URL: `https://archive.org/details/markpines`
3. Wait for sync to complete (shows progress)
4. Videos appear in the Library view

#### Sync a Single Video
1. Enter a video URL: `https://archive.org/details/video_id`
2. One video will be added to your library

#### Sync Multi-Video Items (TV Shows)
1. Enter a TV show or multi-part video URL
2. App detects multiple video files automatically
3. Creates separate entries for each episode/part
4. Example: A 14-episode season becomes 14 downloadable videos

### 2. Browsing Your Library

**Search:**
- Use the search bar to filter by title or description
- Search is instant and local (no network needed)

**Video Cards Show:**
- Thumbnail preview
- Title and description
- Publication date
- Duration (if available)
- Download status

**View Count:**
- Bottom right shows how many videos match your search

### 3. Downloading Videos

#### Download Single Video
1. Click **"Download"** on any video card
2. Video is queued and downloads automatically
3. Button changes to "Downloading..." then "Downloaded"

#### Download All Videos
1. Click **"Download All (X)"** button in the header
2. Confirm the action
3. All visible videos are queued
4. Works with search - download only filtered results!

**Download Settings:**
- Default: 2 concurrent downloads
- Adjustable in Settings (1-5 concurrent)
- Downloads continue in background
- Automatic retry on network errors

### 4. Managing Downloads

**Queue View (Downloads Tab):**
- See all active, queued, and completed downloads
- Real-time progress: percentage, speed (MB/s), ETA
- **Pause All** - Stop all downloads temporarily
- **Resume All** - Continue paused downloads
- **Cancel** - Remove individual downloads from queue
- **Clear Completed** - Remove finished downloads from view

**Download Statuses:**
- **Queued** - Waiting to start (shows position in queue)
- **Downloading** - In progress (shows progress bar)
- **Completed** - Successfully downloaded
- **Failed** - Error occurred (shows error message)

### 5. File Management

#### Rename Downloaded Files
1. Find a video with **"Downloaded"** status
2. Click **"Rename"** button (appears next to "Downloaded")
3. Enter new filename (extension is kept automatically)
4. File is renamed on disk and database updated

**Notes:**
- Only works for completed downloads
- Checks if filename already exists
- Updates library automatically

#### Remove Videos from Library

**Remove Single Video:**
1. Click **"Remove"** button on any video card
2. Confirm the action
3. Video is removed from library

**Remove All Videos:**
1. Click **"Remove All (X)"** button in header
2. Confirm the action
3. All visible videos are removed (respects search filter!)

**Important:** Removing videos from the library does **NOT** delete downloaded files from disk - only removes them from the app's database.

### 6. Settings

Click **"File"** in the menu bar to open Settings:

**Download Directory:**
- Default: System Downloads folder
- Click **"Browse..."** to change location
- All future downloads go to this folder

**Max Concurrent Downloads:**
- Slider: 1 to 5 downloads at once
- Default: 2 concurrent downloads
- Higher = faster but more bandwidth

**Auto-start Downloads:**
- When enabled: Downloads start immediately when queued
- When disabled: Downloads must be manually started

### 7. Curating Collections

**Workflow for TV Shows:**
1. Sync a TV show (e.g., 26 episodes)
2. Search for specific episodes you want
3. Click **"Remove All"** to delete the rest
4. Or: Click **"Download All"** to get only searched episodes

**Workflow for Large Collections:**
1. Sync the collection (e.g., 1,000 videos)
2. Browse and search for what you want
3. Remove unwanted videos individually or in bulk
4. Download your curated selection

---

## 🎨 The 1980s Mac OS Experience

### Design Philosophy
Authentic recreation of classic Macintosh System 1-7 interface:
- **Monochrome color scheme** - Black, white, and grays only
- **Chicago font** - Classic Mac system font for titles
- **Geneva font** - Mac UI font for body text
- **Simple borders** - 1-2px solid black lines
- **Minimal effects** - No gradients, shadows, or fades
- **Classic controls** - Rectangular buttons with subtle inset on click
- **Striped progress bars** - Animated diagonal stripes
- **Window chrome** - Title bars with close buttons

### UI Elements
- Menu bar at top (File, Library, Downloads, New Collection)
- Clean window layouts with borders
- Retro-styled buttons and dialogs
- Classic Mac scroll bars
- Grid view for video browsing

---

## 🛠️ Development

### Prerequisites
- **Node.js** 20+
- **npm** 10+

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/archive_tv_downloader.git
cd archive_tv_downloader

# Install dependencies
npm install

# Rebuild native modules for Electron
npx electron-rebuild

# Run in development mode
npm run dev
```

### Development Features
- Hot-reload for React components
- DevTools enabled in development
- Console logging for debugging
- TypeScript type checking

### Building for Distribution

**Build for current platform:**
```bash
npm run build
```

**Build for specific platforms:**
```bash
npm run package:mac      # macOS (Universal: Intel + Apple Silicon)
npm run package:win      # Windows (x64)
npm run package:linux    # Linux (AppImage + .deb)
```

**Output:**
- **macOS:** `dist/Archive-Downloader-{version}.dmg`
- **Windows:** `dist/Archive-Downloader-Setup-{version}.exe`
- **Linux:** `dist/Archive-Downloader-{version}.AppImage` and `.deb`

### Automated Builds with GitHub Actions

Push a tag to trigger cross-platform builds:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will:
1. Build for Windows, macOS (Intel + ARM), and Linux
2. Create a draft release
3. Attach all installers to the release
4. Generate release notes

Review and publish the draft release when ready.

---

## 📁 Project Structure

```
archive_tv_downloader/
├── electron/                    # Main process (Node.js)
│   ├── main.ts                  # App entry point, window management
│   ├── preload.ts               # IPC bridge (contextBridge)
│   ├── ipc-handlers.ts          # IPC command handlers
│   ├── video-service.ts         # Archive.org integration
│   ├── download-service.ts      # Download queue management
│   └── store.ts                 # Settings persistence
│
├── src/                         # Renderer process (React)
│   ├── lib/                     # Core libraries
│   │   ├── archive-client.ts    # Archive.org API client
│   │   ├── download-manager.ts  # Download queue engine
│   │   ├── database.ts          # SQLite wrapper
│   │   └── types.ts             # TypeScript definitions
│   │
│   ├── components/              # React components
│   │   ├── VideoLibrary/        # Browse and search
│   │   ├── DownloadQueue/       # Queue management
│   │   └── Settings/            # Settings dialog
│   │
│   ├── store/                   # Zustand state management
│   │   ├── videoStore.ts
│   │   ├── downloadStore.ts
│   │   └── settingsStore.ts
│   │
│   ├── styles/                  # 1980s Mac OS CSS
│   │   └── system.css
│   │
│   └── utils/                   # Helper functions
│       └── format.ts
│
├── public/                      # Static assets
├── .github/workflows/           # CI/CD
│   └── release.yml
│
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🗄️ Data Storage

### Database Location

**macOS:**
```
~/Library/Application Support/archive-downloader/videos.db
```

**Windows:**
```
%APPDATA%\archive-downloader\videos.db
```

**Linux:**
```
~/.config/archive-downloader/videos.db
```

### What's Stored

- **Video metadata** (title, description, thumbnails, URLs)
- **Download status** (not_downloaded, queued, downloading, completed, failed)
- **Local file paths** (for downloaded videos)
- **Collection information**

### Downloaded Files

- Stored in configured download directory (default: system Downloads folder)
- Filenames: `{sanitized_title}_{video_id}.{ext}`
- NOT deleted when removing from library

---

## 🔧 Troubleshooting

### App Won't Launch

**macOS:**
- Right-click → "Open" instead of double-clicking (Gatekeeper)
- Check System Preferences → Security & Privacy if blocked

**Windows:**
- Run as Administrator if installer fails
- Check Windows Defender / antivirus

**Linux:**
- Make sure AppImage is executable: `chmod +x Archive-Downloader-*.AppImage`
- Install missing dependencies if needed

### Videos Not Syncing

- Check internet connection
- Archive.org might be rate-limiting (wait a few minutes)
- Try syncing a different collection to verify connection

### Downloads Failing

- Check available disk space
- Verify download directory is writable (Settings → Browse)
- Try reducing concurrent downloads (Settings → Max Concurrent)
- Check network connection and firewall settings

### Database Issues

If the app shows no videos or behaves oddly, delete the database:

**macOS:**
```bash
rm -rf ~/Library/Application\ Support/archive-downloader/
```

**Linux:**
```bash
rm -rf ~/.config/archive-downloader/
```

**Windows:**
```cmd
rmdir /s %APPDATA%\archive-downloader
```

Restart the app to create a fresh database.

### Build Errors (Development)

**Native module errors:**
```bash
npx electron-rebuild
```

**TypeScript errors:**
```bash
npm run typecheck
```

**Clean install:**
```bash
rm -rf node_modules package-lock.json
npm install
npx electron-rebuild
```

---

## 🏗️ Tech Stack

- **Electron 32** - Desktop app framework
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **SQLite** (better-sqlite3) - Local database
- **electron-store** - Settings persistence
- **electron-builder** - App packaging

**No external dependencies for:**
- HTTP requests (uses native `fetch`)
- File operations (uses Node.js `fs`)
- Archive.org API (custom client)

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

- **Video content** from [Archive.org](https://archive.org)
- **UI design** inspired by classic Macintosh System 1-7
- Built with ❤️ for retro computing enthusiasts and Archive.org fans

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📮 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/archive_tv_downloader/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/archive_tv_downloader/discussions)

---

## 🗺️ Roadmap

Future enhancements under consideration:

- [ ] Video preview/playback in app
- [ ] Multiple download directories per collection
- [ ] Bandwidth limiting
- [ ] Scheduled downloads
- [ ] Playlist import/export
- [ ] More retro themes (System 6, System 7 variants)
- [ ] Auto-update support

---

**Made with 🖥️ in the spirit of 1984**
