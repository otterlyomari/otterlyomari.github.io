![Omari Tidemere logo](/public/logo.png)

> the cute motherfluffer your mom warned you about
>> Everyone you meet is fighting a battle you know nothing about. Be kind. Always. - Robin Williams

![Build Status](https://img.shields.io/endpoint?url=https://otterlyomari-website.sa-sweat04.pages.dev/badge.json)

## Introduction
Hello, and welcome to my little experiment in web design! This started out as a small project in 2024, aimed at simply being an alternative to carrd specifically tailed to my socials and such, but since then, it has evolved substantially, its basically a media center pertaining to my fursona, and my own creative written works, it's very much my way of teaching myself broader concepts of web design and exploring UX in a fun and intuitive way.

This is just a fun way for me to display my favorite things ultimately, but I'll be updating this fairly actively, here's what you can expect from this project:

### Existing Features
* Mobile-first design, optimized for all screens, yes, desktop too!
    * Responsive layout and consistent scaling across all pages
    * Scroll to Top / Scroll to Bottom button for easy navigation of lengthy pages
* Splash screen, which plays the first time you load the page in a new tab
    * Post-animation, it sets a flag "hasSeenSplash" in your session storage to true, this way, you don't have to see it again until the tab is closed and re-opened!
* Quick links on the home page to various social media profies, ways to financially support my work, as well as different pages of the website
* Accessible design language and choices across the board
    * Full screen reader support for those who are vision impaired or blind
    * General ease of use for colorblind people
    * Relatively large buttons designed to be easy for people to activate, regardless of hand/finger size
* Dynamic gallery system that is easily maintainable and configurable
    * Pintrest-inspired masonry layout that allows images to display at full width and height, and fill the full available space of the viewport
    * Images are dynamically loaded from galleryData in gallery-core.js and can be added/removed at any time without errors or other issues
    * Custom fullscreen "lightbox" implementation with zooming with the wheel, or cursor-anchored zoom,as well as panning, these features also are supported on mobile via touch gestures!
    * Optimized for quick load times and little to no performance bottle neck on the users end
* Dynamic content & data driven collection of written works, ditto to the previous point regarding the gallery- is easily maintainable configurable
    * Custom landing page for the collection with special UI, search bar, and filters for easily viewing specific types of content 
    * Slug page that loads data from the clicked card, can be altered as needed too
    * Dynamic ArchiveCard component, created at run time using data from the "library" collection

## Potential Future Additions
* Quality-of-Life additions to the Gallery "Lightbox" user interface
    * Arrow buttons left and right (for going to previous image or the next)
    * Improved media player for .webm files
    * Minor adjustments to the CSS styles in gallery.astro
* Quality-of-Life additions to the library landing page
    * Improved search responsiveness
    * Small adjustments to the layout (specifically the filter row and search bar)

#### Note
The list of potential future additions is subject to change and can be altered at any point in time


## Credits
This website was built using the [Astro v6.3](https://astro.build/blog/astro-630/) a web framework designed for content-driven websites, as such, it was the perfect fit from the very beginning, it has highly detailed documentation thoroughly explaining its usage, functionality, etc. I highly recommend this over other frameworks (e.g Next.js, Vue, Angular)

### Libraries used
* [Fuse .js](https://www.fusejs.io/)
* Hah, you were expecting some CSS libraries, weren't ya? well, too bad! all custom css here, baby >:3

### Fonts used
* [Whisper by Robert Leushcke](https://fonts.google.com/specimen/Whisper)
* [Source Serif 4 by Frank Grießhammer](https://fonts.google.com/specimen/Source+Serif+4)
* [Pulang by Khurasan](https://www.dafont.com/pulang.font)

### Inspirations
* [Archive of Our Own(Ao3)](https://archiveofourown.org/) was a key inspiration for the core of the library page
* [Pintrest](https://www.pinterest.com/) inspired the layout for my gallery page


