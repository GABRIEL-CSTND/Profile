# Profile Page

A creative, animated developer profile page built with pure HTML, CSS, and vanilla JavaScript — deployed via GitHub Pages.

## ✨ Features

- **Animated particle canvas** — interactive star field that reacts to mouse movement
- **Custom cursor glow** — follows the mouse with a soft radial glow
- **Glassmorphism UI** — frosted-glass cards throughout
- **Hero section** — animated title, floating avatar with orbital rings, rotating float tags
- **Typewriter terminal** — auto-plays a fake terminal session
- **Scroll reveal animations** — sections fade in as you scroll
- **Animated stat counters** — numbers count up when in view
- **3D tilt on project cards** — perspective tilt effect following cursor
- **Contact form** — with simulated submission feedback
- **Fully responsive** — works on mobile, tablet, desktop

## 🚀 Deploy to GitHub Pages

1. Push this repo to GitHub (`main` branch)
2. Go to **Settings → Pages**
3. Set Source to **GitHub Actions**
4. The included workflow (`.github/workflows/deploy.yml`) handles everything automatically!

## 📁 Structure

```
Profile/
├── index.html              ← Main page
├── style.css               ← All styles
├── script.js               ← All interactions
├── assets/
│   ├── hero-bg.jpg         ← Hero background
│   └── avatar.jpg          ← Profile photo
└── .github/
    └── workflows/
        └── deploy.yml      ← Auto-deploy workflow
```

## 🎨 Customization

Edit these things to make it yours:

| What | Where |
|------|--------|
| Your name | `index.html` — hero title |
| Avatar photo | Replace `assets/avatar.jpg` |
| Background | Replace `assets/hero-bg.jpg` |
| Skills & projects | `index.html` — skills/projects sections |
| Social links | `index.html` — contact section `href` attributes |
| Color scheme | `style.css` — `:root` CSS variables |
| Terminal messages | `script.js` — `lines` array |
| Float tag texts | `script.js` — `tagTexts` object |
