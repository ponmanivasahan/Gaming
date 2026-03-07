// js/gameState.js

class GameState {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.background = null;
    this.player = null;
    this.enemy = null;
    this.inputHandler = null;
    this.combactSystem = null;
    this.renderer = null;
    this.gameStarted = false;
    this.isPaused = false;
    this.isReplaying = false;
    this.replayIndex = 0;
    this.gameEnding = false;
    this.showMatchStats = false;
    this.animationId = null;
    this.coins = parseInt(localStorage.getItem('fighterCoins') || '500');
    this.timerFrozen = false;
    this.gravity = 0.7;
    this.rounds = { player: 0, enemy: 0, current: 1, max: 3 };

    // BUG FIX: key mismatch — was "timerFreezes" and "invinciblities" (typos)
    // Unified to match localStorage keys used in buyItem and updateShopDisplay
    this.items = {
      shields:        parseInt(localStorage.getItem('shields')        || '0'),
      healthBoosts:   parseInt(localStorage.getItem('healthBoosts')   || '0'),
      damageBoosts:   parseInt(localStorage.getItem('damageBoosts')   || '0'),
      speedBoosts:    parseInt(localStorage.getItem('speedBoosts')    || '0'),
      timeFreezes:    parseInt(localStorage.getItem('timeFreezes')    || '0'),
      invincibilities:parseInt(localStorage.getItem('invincibilities')|| '0')
    };

    this.activeItems = { player: {}, enemy: {} };
    this.coinsEarned = 0;
  }

  initCanvas() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    window.canvas  = this.canvas;
    window.c       = this.ctx;
    window.gravity = this.gravity;
    return this;
  }

  reset() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.gameStarted  = false;
    this.isPaused     = false;
    this.isReplaying  = false;
    this.replayIndex  = 0;
    this.gameEnding   = false;
    this.showMatchStats = false;
    this.animationId  = null;
    this.coinsEarned  = 0;
    this.rounds = { player: 0, enemy: 0, current: 1, max: 3 };
  }

  addCoins(amount) {
    this.coins += amount;
    localStorage.setItem('fighterCoins', this.coins.toString());
    this.updateCoinDisplays();
  }

  updateCoinDisplays() {
    const startScreenCoins = document.getElementById('startScreenCoins');
    const coinDisplay = document.getElementById('coinDisplay');
    if (startScreenCoins) startScreenCoins.textContent = this.coins;
    if (coinDisplay) coinDisplay.textContent = this.coins;
  }
}