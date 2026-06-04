![Omari Tidemere logo](/public/logo.png)

> the cute motherfluffer your mom warned you about

> “Everyone you meet is fighting a battle you know nothing about. Be kind. Always.” — Robin Williams

![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)
![Build Status](https://img.shields.io/endpoint?url=https%3A%2F%2Fotterlyomari-website.sa-sweat04.workers.dev%2Fbadge.json)

---

## Introduction

Hello, and welcome to my little experiment in web design.

This project started in 2024 as a small attempt to build an alternative to Carrd, specifically tailored to my socials. Since then, it has evolved into a media center for my fursona and my creative writing.

More importantly, it’s been my way of learning broader web development concepts and exploring UX design in a hands-on, experimental way.

This is ultimately just a space for me to showcase things I enjoy, but I actively maintain and improve it. Here’s what you can expect:

---

## Existing Features

- Mobile-first design, optimized for all screen sizes (including desktop)
  - Responsive layout with consistent scaling across pages
  - Scroll-to-top / scroll-to-bottom navigation for long pages

- Splash screen shown on first visit per session
  - After the animation plays, a `hasSeenSplash` flag is stored in session storage so it won’t replay until the tab is closed

- Quick links on the homepage
  - Social media profiles
  - Ways to support my work
  - Navigation to key sections of the site

- Accessible design principles applied throughout
  - Full screen reader support
  - Consideration for colorblind users
  - Large, easy-to-use interactive elements

- Dynamic gallery system (fully data-driven and maintainable)
  - Pinterest-inspired masonry layout
  - Images loaded dynamically from `galleryData` in `gallery-core.js`
  - Custom fullscreen lightbox with zoom (mouse wheel and cursor anchoring) and panning
  - Touch gesture support on mobile devices
  - Optimized for performance and fast load times

- Dynamic content system for written works (data-driven architecture)
  - Dedicated landing page with search and filtering
  - Dynamic slug pages generated from selected entries
  - Reusable `ArchiveCard` component generated from the library dataset

---

## Potential Future Additions

See `ROADMAP.md` for further details

---

### Note

This list of potential future additions is subject to change at any time.

---

## Licensing & Usage Notes

![Educational Use Only](https://img.shields.io/badge/License-Educational_Use_Only-orange)

This project is source-available for educational and reference purposes only.

It may be used to learn about web development, JavaScript, and the Astro framework. However, modification, redistribution, or commercial use of this project or its assets is not permitted without explicit permission.

Please refer to `LICENSE.md` for full details.

---

## Credits

This website was built using [Astro v6.3](https://astro.build/blog/astro-630/), a web framework designed for content-driven sites. Its documentation and structure made it a strong fit for this project from the beginning.

I recommend it for similar projects over alternatives such as Next.js, Vue, or Angular.

---

### Libraries Used

- [Fuse.js](https://www.fusejs.io/)
- No CSS frameworks were used — all styling was written from scratch.

---

## Tech Stack

![Astro](https://img.shields.io/badge/Astro-v6.3-FF5D01?logo=astro)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?logo=javascript&logoColor=black)

- Cloudflare Workers
- Cloudflare Pages

---

### Fonts Used

- Whisper by Robert Leuschke
- Source Serif 4 by Frank Grießhammer
- Pulang by Khurasan

---

### Inspirations

- [Archive of Our Own (AO3)](https://archiveofourown.org/) — core inspiration for the library system
- [Pinterest](https://www.pinterest.com/) — inspiration for the gallery layout
