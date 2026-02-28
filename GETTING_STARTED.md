# Getting Started with Archive Downloader

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

The app will launch with hot-reloading enabled. Any changes to the code will automatically restart the app.

## First Run

On first launch, the app will:
1. Create a SQLite database in your user data directory
2. Automatically sync 1,344 videos from Archive.org's markpines collection
3. Show a progress bar during sync (takes 2-5 minutes)

## Building Distributables

```bash
# Build for your current platform
npm run build

# Build for specific platforms
npm run package:mac      # macOS (universal binary)
npm run package:win      # Windows (x64)
npm run package:linux    # Linux (AppImage + deb)
```

Built files will be in the `dist/` directory:
- **macOS**: `Archive-Downloader-{version}.dmg`
- **Windows**: `Archive-Downloader-Setup-{version}.exe`
- **Linux**: `Archive-Downloader-{version}.AppImage` and `.deb`

## Creating GitHub Releases

To build binaries for all platforms automatically:

1. **Tag and push:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub Actions will:**
   - Build for Windows, macOS, and Linux
   - Create a draft release
   - Attach all binaries

3. **Publish the release** when ready

## Development

### Project Structure
```
archive_tv_downloader/
├── electron/              # Main process
│   ├── main.ts           # App entry point
│   ├── preload.ts        # IPC bridge
│   ├── video-service.ts  # Archive.org integration
│   ├── download-service.ts # Download manager
│   └── ipc-handlers.ts   # IPC command handlers
├── src/
│   ├── lib/              # Core libraries
│   │   ├── archive-client.ts    # Archive.org API
│   │   ├── download-manager.ts  # Download queue
│   │   ├── database.ts          # SQLite wrapper
│   │   └── types.ts             # TypeScript types
│   ├── components/       # React components
│   │   ├── VideoLibrary/
│   │   ├── DownloadQueue/
│   │   └── Settings/
│   ├── store/            # Zustand state management
│   ├── styles/           # 1980s Mac OS CSS
│   └── utils/            # Helper functions
└── package.json
```

### Key Features

**Video Library**
- Browse and search 1,344 videos
- Thumbnail previews
- Click "Download" to queue

**Download Queue**
- Real-time progress tracking
- Speed, ETA, percentage display
- Pause, resume, cancel controls
- Automatic retry on failure

**Settings**
- Download directory picker
- Max concurrent downloads (1-5)
- Auto-start toggle

### Data Storage

**Database Location:**
- **macOS**: `~/Library/Application Support/archive-downloader/videos.db`
- **Windows**: `%APPDATA%\archive-downloader\videos.db`
- **Linux**: `~/.config/archive-downloader/videos.db`

**Downloads:**
- Default: System Downloads folder
- Configurable via Settings

### Customization

**Change Collection:**
Edit `src/lib/archive-client.ts`:
```typescript
constructor(collection: string = 'your-collection-name') {
  this.collection = collection;
}
```

**Modify Theme:**
Edit `src/styles/system.css` to change colors, fonts, or layout.

**Add Features:**
- **Stores**: `src/store/` for state management
- **Components**: `src/components/` for UI
- **Services**: `electron/` for backend logic

## Troubleshooting

### Build Errors

**TypeScript errors:**
```bash
npm run typecheck
```

**Missing dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database Issues

**Videos not loading:**
Delete the database and restart:
```bash
# macOS
rm ~/Library/Application\ Support/archive-downloader/videos.db

# Linux
rm ~/.config/archive-downloader/videos.db

# Windows
del %APPDATA%\archive-downloader\videos.db
```

### Platform-Specific

**macOS:**
- Install Xcode Command Line Tools: `xcode-select --install`
- On first launch: Right-click → Open (Gatekeeper)

**Windows:**
- No additional requirements

**Linux:**
```bash
sudo apt-get install -y libgtk-3-dev webkit2gtk-4.0 \
  libappindicator3-dev librsvg2-dev patchelf
```

## Architecture Details

### Electron Main Process
- Manages window lifecycle
- Handles IPC communication
- Runs video and download services
- Accesses file system and native APIs

### React Renderer Process
- Sandboxed browser environment
- Renders UI components
- Manages application state (Zustand)
- Communicates with main via IPC

### IPC Communication
```
Renderer → Main: window.electronAPI.downloadVideo(id)
Main → Renderer: mainWindow.webContents.send('download-progress', data)
```

### Download Flow
1. User clicks "Download" button
2. Renderer calls `downloadVideo(id)`
3. Main process queues download
4. Download manager emits progress events
5. Main forwards events to renderer
6. Renderer updates UI with progress
7. On completion, updates database

## Performance

**First Sync:**
- 1,344 videos
- ~2-5 minutes depending on connection
- Only happens once

**Downloads:**
- Default 2 concurrent downloads
- Configurable up to 5
- Automatic retry on network errors
- Progress updates every 500ms

## Security

- **Sandboxed renderer** - No direct Node.js access
- **Context isolation** - IPC only through preload
- **Content Security Policy** - Prevents XSS
- **No eval()** - Safe code execution

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on your platform
5. Submit a pull request

## Support

- **Issues**: https://github.com/yourusername/archive_tv_downloader/issues
- **Docs**: See README.md and this file

## License

MIT - See LICENSE file for details
