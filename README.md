# Samurai Fighter: Battle Arena

Please everyone, this is an interesting game. I have put a lot of effort into this project, and it would make me really happy if you love  this game and support it.

A full-screen browser fighting game built with vanilla JavaScript, HTML5 Canvas, and CSS. You play as Samurai Mack against an adaptive CPU Bot across multiple levels with round-based combat, powerups, coins, and animated effects.

I might have not designed that perfect but i have put a lot of efforts in this game days of hardwork.

## Project Overview

This project was built to practice real game programming fundamentals:

- animation loop and delta-time rendering
- collision and hit detection
- sprite state switching
- CPU behavior tuning
- game-state management
- UI and UX integration (shop, HUD, overlays)

The game is currently single-player (Player vs CPU), with level-based difficulty and an in-game shop economy.

## Current Features

- Player vs CPU combat (Bot opponent)
- 3 selectable levels with different CPU behavior:
	- Dojo (Easy)
	- Arena (Normal)
	- Citadel (Hard)
- Best-of-3 match system
- 30-second round timer
- Health, blocking, critical hits, special attacks
- Coins system:
	- round win reward (player only)
	- match win reward (player only)
- Shop + inventory persistence via localStorage
- 6 powerups:
	- Shield
	- Health Boost
	- Damage Boost
	- Speed Boost
	- Time Freeze
	- Invincibility
- In-game powerup HUD (click or keys 1-6)
- Animated start loader and polished menu UI
- Enhanced blood hit effects with impact direction and splatter variation
- Pause menu and in-game controls hint panel

## Controls

### Player Controls

- A: Move left
- D: Move right
- W: Jump
- Space: Attack
- Shift: Block
- E: Special attack (when charge is full)
- 1-6: Activate powerups

### System Controls

- Esc: Pause / Resume
- Q: Quit to main menu (from pause)

## Gameplay Notes

- Block reduces incoming damage heavily.
- Critical hits can increase damage output.
- Special charge builds through successful hits.
- CPU adapts movement and aggression based on distance, pressure, and health.

## Tech Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- HTML5 Canvas API

## Project Structure

- index.html: UI screens, HUD, overlays, and canvas mount
- style.css: full visual styling (menus, HUD, shop, loader)
- js/gameState.js: shared state, levels, coins, blood effect pooling
- js/gameRenderer.js: render loop, CPU, visual effects drawing
- js/combatSystem.js: collision + damage + hit resolution
- js/inputHandler.js: keyboard handling and control safety reset
- js/powerups.js: powerup activation, timers, and HUD wiring
- js/gameInitalizer.js: fighter setup and round countdown flow
- js/index.js: app/game bootstrap and UI orchestration
- js/utils.js: timer logic, winner resolution, confetti

## How To Run

1. Clone this repository.
2. Open the project folder.
3. Launch index.html in a browser.

For smoother asset loading during development, you can use a local static server.

## What I Learned

- Designing a responsive game loop with clear state transitions
- Balancing gameplay while keeping controls responsive
- Managing UI and gameplay logic together without frameworks
- Building reusable systems (powerups, effects, round flow)

## Roadmap

- Add sound effects and background music
- Expand fighters/arenas
- Better CPU personality profiles per level
- Optional online multiplayer mode in future

## Feedback

If you play the game, feedback is always welcome. If you enjoyed it, starring the repo would mean a lot.

## Author

Built with passion by PONMANI VASHAN.