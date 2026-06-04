# CONTRIBUTING.md

# Contributing Guidelines

Thank you for contributing to this project.

This repository follows an incremental development philosophy focused on maintainability, readability, accessibility, and preserving existing architecture whenever possible.

---

# Development Philosophy

When contributing:

- Prefer small, focused changes over large rewrites.
- Reuse existing patterns and utilities whenever possible.
- Avoid redesigning unrelated systems while implementing a feature.
- Preserve project structure and coding conventions.
- Prioritize maintainability and clarity over cleverness.
- Keep accessibility and responsive behavior in mind.

Contributors should avoid introducing unnecessary abstractions, frameworks, or architectural rewrites without discussion.

---

# Branch Workflow

This project uses a structured multi-branch workflow:

- `main` → stable production-ready code
- `dev` → integration and staging branch for active development
- `feature/*` → isolated feature branches created from `dev`

---

### Recommended workflow

1. Create a feature branch from `dev`
2. Implement and test changes locally
3. Merge the feature branch into `dev`
4. Once `dev` is stable, open a Pull Request from `dev` → `main`

---

### Example workflow

```bash
# Start from dev
git switch dev
git pull origin dev

# Create feature branch
git switch -c feature/gallery-lightbox-navigation

# Work on changes
git add .
git commit -m "Improve gallery lightbox navigation"

# Merge feature into dev
git switch dev
git merge feature/gallery-lightbox-navigation

# Push updated dev branch
git push origin dev

# (Later) when dev is stable:
git switch main
git pull origin main
git merge dev
git push origin main
```
