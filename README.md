# Samurai Fighter: Battle Arena - A Retro Style Game

A full-screen 2-player fighting game built with vanilla JavaScript to demonstrate core game physics, canvas rendering, and game-loop architecture.

This project started as a personal challenge to apply everything I learned about JavaScript. I wanted to push beyond simple scripts and build something interactive - a game that includes physics, player mechanics, and combat systems.

After careful planning, I built the entire game in about one week, working 8+ hours a day. The goal was simple: turn my learning into a playable experience.

## Game Overview
Samurai Fighter: Battle Arena is a local multiplayer fighting game where two warriors battle in a fast-paced arena.

Each player starts with 300 health points and must defeat their opponent before the 30-second timer runs out. The game includes movement, jumping, attacks, blocking, special moves, and a shop system for power-ups.

## Features
- 2-Player Local Multiplayer (same keyboard)
- 300 Health Point Combat System
- 30-Second Battle Timer
- Blocking Mechanic (reduces damage to 5)
- Special Attacks (3× damage when bar is full)
- Critical Hit System (20% chance for 2× damage)
- Power-up Shop with 6 items
- Best of 3 Rounds format
- Coin System (earn coins, buy power-ups)

## Controls

### Player 1 (Left Fighter)
- **A** - Move Left
- **D** - Move Right
- **W** - Jump
- **SPACE** - Attack
- **SHIFT** - Block (reduces damage to 5)
- **E** - Special Attack (when bar is full)

### Player 2 (Right Fighter)
- **←** - Move Left
- **→** - Move Right
- **↑** - Jump
- **↓** - Attack
- **CTRL** - Block (reduces damage to 5)
- **ENTER** - Special Attack (when bar is full)

### Other Controls
- **ESC** - Pause/Resume game
- **Q** - Quit to main menu
- **1-6** - Use power-ups (when purchased)

## The Challenge
The most challenging part of this project was handling collisions and bringing sprite images into the game. Figuring out this logic helped me deeply understand:
- Game Loops
- State Management
- Collision Detection

## Tech Stack
- JavaScript (Vanilla JS)
- HTML5 CANVAS
- CSS3
- Free game assets from YouTube

## What I Learned
Building this game strengthened my understanding of:
- Game loop architecture
- Physics Simulation
- Canvas rendering
- Keyboard input handling
- Collision detection
- State Management

## Future Improvements
- Write custom SVG icons instead of emojis
- Room Code System to play with friends (online multiplayer)
- More Characters
- Sound effects
- CPU opponent

## Feedback
If you try the game, I would truly appreciate your feedback. Suggestions, improvements, or collaboration ideas are always welcome.

If you enjoyed the project, please consider:
- Starring the repository
- Sharing your thoughts
- Connecting with me

## Author
Built with passion and curiosity by PONMANI VASAN

This project represents my journey of learning JavaScript and experimenting with game development.