# CONTRIBUTING.md

# Contributing Guidelines

Thank you for contributing to this project.

This repository follows an incremental development philosophy focused on maintainability, readability, accessibility, and preserving existing architecture whenever possible.

---

# Development Philosophy

When contributing:

* Prefer small, focused changes over large rewrites.
* Reuse existing patterns and utilities whenever possible.
* Avoid redesigning unrelated systems while implementing a feature.
* Preserve project structure and coding conventions.
* Prioritize maintainability and clarity over cleverness.
* Keep accessibility and responsive behavior in mind.

Contributors should avoid introducing unnecessary abstractions, frameworks, or architectural rewrites without discussion.

---

# Branch Workflow

This project uses a multi-branch workflow:

* `main` → stable production-ready code
* `dev` → integration/testing branch
* `feature/*` → isolated feature branches

### Recommended workflow:

1. Create a feature branch from `dev`
2. Implement and test changes
3. Open a Pull Request into `dev`
4. Merge `dev` into `main` once stable

---

### Example workflow

```bash
git switch dev
git pull origin dev
git switch -c feature/gallery-lightbox-navigation

# Commit Guidelines

Use descriptive commit messages.

Examples:

* `Improve gallery lightbox navigation`
* `Fix .webm playback handling on mobile`
* `Refactor gallery gesture utilities`

Avoid vague commits like:

* `fix stuff`
* `changes`
* `update`

---

# Coding Standards

## General

* Keep functions focused and readable.
* Avoid deeply nested logic when possible.
* Prefer explicit naming over abbreviations.
* Do not duplicate existing systems unnecessarily.

## JavaScript / TypeScript

* Preserve existing architecture patterns.
* Avoid rewriting entire modules unless necessary.
* Prefer incremental refactors.
* Keep DOM manipulation performant and minimal.

## Astro Components

* Follow existing component organization.
* Avoid excessive inline logic inside templates.
* Reuse shared utilities where appropriate.

---

# UI / UX Expectations

When making UI changes:

* Maintain keyboard accessibility
* Preserve mobile usability
* Ensure responsive layouts remain functional
* Avoid layout shifts and unnecessary animations
* Test image/video handling carefully

For gallery/lightbox work specifically:

* Preserve touch support
* Ensure `.webm` playback behaves consistently
* Avoid introducing input lag or excessive event listeners

---

# Testing Expectations

Before merging changes:

* Verify the site builds successfully
* Test desktop and mobile behavior
* Check for console errors
* Confirm interactive components still function properly

---

# Roadmap-Driven Development

Tasks may originate from `roadmap.md`.

When implementing roadmap items:

* Complete one task at a time
* Avoid scope expansion
* Preserve unfinished roadmap items
* Document major implementation decisions when necessary

---

# Performance Considerations

This project values responsiveness and lightweight frontend behavior.

Avoid:

* unnecessary dependencies
* oversized client-side bundles
* excessive runtime processing
* redundant event listeners

Optimize media handling where practical.

---

# Final Notes

The goal of this repository is sustainable long-term development with clean, understandable code.

Contributors should strive to improve the project without disrupting existing workflows or architecture.
