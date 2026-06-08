# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.3.1] - 2026-06-08

### Added

  - (QOL) Horizontal thumbnail strip in `gallery.astro` 
  - (QOL) Improved data filter stability
  - Added a "DMCA" button for Artist Takedown/Removal requests via `legal@otterlyomari.com`
  - Added contact information to `about.astro` improved about page structure, and linked to `omari@otterlyomari.com` for general purpose inquiries.

### Changed

  - Restructured gallery for ease of maintainace long-term
    - Logic was split into `gallery-core.js` for init and pool creation, `gallery-render.js` for rendering, the worker remained the same, and observers were moved to `gallery-observers.js` all of which for clarity and ease of modification.
    - Furthermore for the prior point, `gesture-engine.js` was created to cleanly manage gesture events in a clean and abstracted manner for ease of understanding and use
    - To reduce initial lag and load times, images were changed from all being stored into a `galleryData` constant, to being loaded as asynchornous modules exported as default via `index.js`, which can be found in `src/data/gallery` 
    
## [3.3.0] - 2026-06-04

### Added

  - Video audio unmute in lightbox with audio track detection
  - Size constraints for video elements on desktop (max 560x420)

### Fixed

  - Fixed lightbox close to properly pause and cleanup video elements
  - Fixed SVG sprite sheet cross-browser rendering (zero-sized container)

### Removed
  - Removed `test.astro` (unused page from early version)
  - Removed unused import from Footer.astro

### Updated
  - Updated ROADMAP.md to reflect progress and current interests
  - Updated inconsistent formatting and indenting across the codebase
  - Updated import ordering for cleanliness

## [3.2.0] - 2026-05-28

### Added

- Dynamic build status badge endpoint powered by Cloudflare API
- Improved deployment configuration for Cloudflare Pages integration

### Fixed

- Resolved multiple badge endpoint iteration issues
- Fixed Astro runtime environment variable access issues

### Removed

- IDE configuration files removed from repository (`.vscode`, `.idea`)

---

## [3.1.0] - 2026-05-27

### Added

- Performance optimizations for gallery rendering system
- Improved DOM handling and load efficiency
- Font preload caching improvements

### Changed

- Refactored gallery core logic for stability
- Updated deployment workflow configuration (Node version adjustments)

### Fixed

- Fixed import-related runtime issues
- Resolved mobile viewport scaling issues
- Fixed navigation/button labeling inconsistencies

---

## [3.0.0] - 2026-05-27

### Added

- Major architecture update for site structure
- Improved responsive layout system
- Enhanced gallery system stability

### Changed

- Significant refactor of core frontend systems
- Updated Astro configuration and build pipeline

---

## [2.4.0] - 2026-05-25

### Added

- Improved homepage layout and navigation structure

### Fixed

- Fixed layout inconsistencies introduced in previous updates

---

## [2.3.0] - 2026-05-24

### Added

- Expanded gallery system functionality
- Improved gallery rendering pipeline
- Early archive/library system structure

### Fixed

- Mobile scaling issues
- Blog slug cleanup and routing fixes

---

## [2.1.0] - 2026-05-23

### Added

- Initial version of gallery system
- Archive/library system foundation
- Multi-page Astro site structure

### Changed

- Iterative improvements to UI layout and navigation

---

## [2.0.x] - 2025-02 to 2025-07

### Added

- Core site foundation (Astro-based rebuild)
- Basic navigation and homepage layout
- Social link integration
- Initial asset and media support

### Fixed

- Mobile scaling issues across early versions
- Metadata and SEO improvements
- Navigation and routing stability

---

## [1.0.0] - 2024-02 to 2024-03

### Added

- Initial project setup
- Basic static HTML site structure
- Early navigation and layout experiments
- First iterations of content pages

---

## Notes

- Early commits were heavily iterative and experimental
- Version numbers were applied retroactively for clarity
- Future releases will follow semantic versioning more strictly
