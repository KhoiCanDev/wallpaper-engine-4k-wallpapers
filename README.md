# Bing & Wallhaven 4K Wallpaper with Quotes

A high-performance, dynamic 4K web wallpaper for **Wallpaper Engine** featuring a digital clock, customizable typography, random quotes, smooth dominant-color transitions, and a countdown timer/weather display.

[**Steam Workshop Page**](https://steamcommunity.com/sharedfiles/filedetails/?id=3481003621)

This repository features an automated build pipeline that bundles and minifies assets into a production-ready `dist/` directory, ready to be deployed directly to the Steam Workshop.

---

## 🚀 Features

* **Dual Wallpaper Sources**: Switch between **Bing Daily** (national landscapes) and **Wallhaven Popular 4K** (top-rated community images) directly inside the settings.
* **Dominant Color Transitions & Preloading**: Wallpapers preload 100% in the background, fading smoothly from the image's dominant color to prevent layout stuttering or scan-line loads.
* **Interactive Randomizer**: Click the dice icon (`🎲`) on the bottom right to instantly swap wallpapers and fetch a new quote with active spinning animations.
* **Smart Quote Filtering**: Automatically fetches quotes from Goodreads, filtering out quotes longer than 50 words to prevent layout overflow.
* **Independently Configurable Typography**: Customize the font style independently for the clock, quotes, and countdown timer. Select from 10 popular monospace fonts (Fira Code, JetBrains Mono, Roboto Mono, VT323, etc.) to eliminate layout jitter.
* **Countdown Timer & Weather Display**: Toggle the bottom-left display between a visual countdown timer or live weather info (fetched via `Open-Meteo` based on customizable coordinates/city names or auto-IP geolocation).
* **Background Panels & Glow Shadows**: Switch between a semi-transparent glassmorphic background card or a clean text shadow. Customize the panel/shadow color to fit your desktop theme.
* **Adjustable Rotation Intervals**: Set the wallpaper swap timer to 10, 20, or 30 minutes in the settings.
* **Minified & Optimized**: Bundles and minifies all styles, scripts, and libraries into a single file structure for zero-lag rendering.

---

## 🛠️ Getting Started

### Prerequisites

You need **Node.js** (v18+) and **npm** installed on your system.

### Installation

1. Clone or download this repository.
2. Open your terminal in the project directory and install development dependencies:
   ```bash
   npm install
   ```

### Building the Project

To bundle, minify, and generate the deployable folder, run the build command:
```bash
npm run build
```

This compiles the codebase and outputs the final assets into the `dist/` directory:
* `dist/index.html` — Statically links to the single minified bundle.
* `dist/bundle.js` — Combined and minified scripts (jQuery, TypeIt, services, and script logic).
* `dist/style.css` — Minified styling rules.
* `dist/project.json` — Wallpaper Engine configuration schema.
* `dist/preview.jpg` — Workshop preview image.

---

## 📦 How to Deploy to Wallpaper Engine

1. Open **Wallpaper Engine** and click **Create Wallpaper**.
2. Select **Open Offline Wallpaper (HTML)**.
3. Browse to this directory and point it to the compiled file: `dist/index.html`.
4. Wallpaper Engine will import the project. You can now tweak the options in the user settings panel.
5. Publish it to the Steam Workshop via the Steam tab in the creator tool!

---

## 📁 Directory Structure

```
├── services/
│   ├── clock-service.js       # Formats system time
│   ├── quote-service.js       # Goodreads fetcher & word-count filter
│   └── wallpaper-service.js   # Bing and Wallhaven API integrations
├── dist/                      # COMPILED BUILD OUTPUT (Do not edit directly)
├── index.html                 # Main HTML layout
├── style.css                  # Core design stylesheet
├── script.js                  # Typewriter, countdown, and settings listener loop
├── build.js                   # Node compilation script using esbuild
├── project.json               # Wallpaper Engine metadata and settings schema
├── package.json               # Dependency and script configuration
└── README.md                  # Project documentation
```
