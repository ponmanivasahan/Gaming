// js/gameState.js

class GameState {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.background = null;
    this.player = null;
    this.enemy = null;
    this.inputHandler = null;
    this.combatSystem = null;
    this.renderer = null;
    this.gameStarted = false;
    this.isPaused = false;
    this.isReplaying = false;
    this.replayIndex = 0;
    this.gameEnding = false;
    this.showMatchStats = false;
    this.animationId = null;
    const _storedCoins = parseInt(localStorage.getItem('fighterCoins'));
    this.coins = isNaN(_storedCoins) ? 1000 : _storedCoins;
    this.timerFrozen = false;
    this.gravity = 0.7;
    this.rounds = { player: 0, enemy: 0, current: 1, max: 3 };
    this.damageBoost = { player: false, enemy: false };
    this.isCpuEnemy = true;
    this.roundWinCoinReward = 50;
    this.matchWinCoinReward = 250;

    this.levels = {
      dojo: {
        name: 'Dojo (Easy)',
        enemyName: 'Bot',
        background: './images/background.png',
        cpu: {
          moveSpeed: 3.8,
          engageDistance: 210,
          retreatDistance: 65,
          attackDistance: 145,
          attackCooldownMs: 980,
          jumpChance: 0.0015,
          blockChance: 0.18,
          specialChance: 0.22,
          damageMultiplier: 0.88
        }
      },
      arena: {
        name: 'Arena (Normal)',
        enemyName: 'Bot',
        background: './images/background1.png',
        cpu: {
          moveSpeed: 4.8,
          engageDistance: 220,
          retreatDistance: 85,
          attackDistance: 165,
          attackCooldownMs: 760,
          jumpChance: 0.003,
          blockChance: 0.24,
          specialChance: 0.38,
          damageMultiplier: 1
        }
      },
      citadel: {
        name: 'Citadel (Hard)',
        enemyName: 'Bot',
        background: './images/background_layer_1.png',
        cpu: {
          moveSpeed: 5.8,
          engageDistance: 235,
          retreatDistance: 95,
          attackDistance: 180,
          attackCooldownMs: 600,
          jumpChance: 0.004,
          blockChance: 0.31,
          specialChance: 0.54,
          damageMultiplier: 1.14
        }
      }
    };
    this.selectedLevel = localStorage.getItem('selectedLevel') || 'arena';
    if (!this.levels[this.selectedLevel]) this.selectedLevel = 'arena';

    const itemTypes = [
      'shields',
      'healthBoosts',
      'damageBoosts',
      'speedBoosts',
      'timeFreezes',
      'invincibilities'
    ];
    this.items = {
      player: this._loadItemsForOwner('player', itemTypes),
      enemy: this._loadItemsForOwner('enemy', itemTypes)
    };

    this.activeItems = { player: {}, enemy: {} };
    this.coinsEarned = 0;
    this.bloodEffects = [];
    this.hitFlash = 0;
    this.maxBloodEffects = 420;
  }

  _loadItemsForOwner(owner, itemTypes) {
    const bucket = {};
    itemTypes.forEach((itemType) => {
      const ownerKey = this._itemStorageKey(owner, itemType);
      const ownerValue = parseInt(localStorage.getItem(ownerKey), 10);
      const legacyValue = parseInt(localStorage.getItem(itemType), 10);
      bucket[itemType] = !isNaN(ownerValue)
        ? ownerValue
        : (!isNaN(legacyValue) ? legacyValue : 0);
    });
    return bucket;
  }

  _itemStorageKey(owner, itemType) {
    return `${owner}_${itemType}`;
  }

  getItemCount(owner, itemType) {
    const safeOwner = owner === 'enemy' ? 'enemy' : 'player';
    if (!this.items[safeOwner]) this.items[safeOwner] = {};
    return this.items[safeOwner][itemType] || 0;
  }

  setItemCount(owner, itemType, count) {
    const safeOwner = owner === 'enemy' ? 'enemy' : 'player';
    if (!this.items[safeOwner]) this.items[safeOwner] = {};
    const safeCount = Math.max(0, count | 0);
    this.items[safeOwner][itemType] = safeCount;
    localStorage.setItem(this._itemStorageKey(safeOwner, itemType), safeCount.toString());
  }

  addBloodEffect(x, y, intensity = 1, options = {}) {
    const freeSlots = Math.max(0, this.maxBloodEffects - this.bloodEffects.length);
    if (freeSlots <= 0) {
      this.triggerHitFlash(0.11);
      return;
    }

    const dir = options.dir === -1 ? -1 : 1;
    const spread = Math.max(0.2, Math.min(1.2, options.spread || 0.65));
    const power = Math.max(0.75, Math.min(2.2, options.power || 1));
    const burstScale = Math.max(0.75, Math.min(1.7, intensity));
    const burstRadius = 18 + Math.random() * 14 * burstScale;

    this.bloodEffects.push({
      kind: 'burst',
      x,
      y,
      r: burstRadius,
      alpha: 1,
      age: 0,
      life: 0.35 + Math.random() * 0.2
    });

    const maxMistForHit = Math.round(6 + burstScale * 6);
    const mistCount = Math.max(0, Math.min(maxMistForHit, freeSlots - 1));
    for (let i = 0; i < mistCount; i++) {
      this.bloodEffects.push({
        kind: 'mist',
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 16,
        vx: dir * (70 + Math.random() * 110) * power,
        vy: -45 + Math.random() * 40,
        drag: 0.9,
        r: 7 + Math.random() * 9 * burstScale,
        age: 0,
        life: 0.12 + Math.random() * 0.16,
        alpha: 1
      });
    }

    const remainingSlots = Math.max(0, this.maxBloodEffects - this.bloodEffects.length);
    const maxDropletsForHit = Math.round(18 + burstScale * 16);
    const dropletCount = Math.max(0, Math.min(maxDropletsForHit, remainingSlots));
    for (let i = 0; i < dropletCount; i++) {
      const coneCenter = dir > 0 ? 0 : Math.PI;
      const coneWidth = (0.32 + spread * 0.6) * Math.PI;
      const angle = coneCenter + (Math.random() - 0.5) * coneWidth;
      const speed = (170 + Math.random() * 300) * burstScale * power;
      const size = 1.1 + Math.random() * 2.6;
      this.bloodEffects.push({
        kind: 'droplet',
        x: x + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 14,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (100 + Math.random() * 170),
        gravity: 980,
        drag: 0.992,
        r: size,
        elongation: 1.4 + Math.random() * 1.6,
        px: x,
        py: y,
        age: 0,
        life: 0.45 + Math.random() * 0.42,
        alpha: 1
      });
    }

    if (this.bloodEffects.length > this.maxBloodEffects) {
      this.bloodEffects.splice(0, this.bloodEffects.length - this.maxBloodEffects);
    }

    this.triggerHitFlash(0.16 * burstScale);
  }

  triggerHitFlash(power = 0.16) {
    this.hitFlash = Math.max(this.hitFlash, power);
  }

  setLevel(levelKey) {
    if (!this.levels[levelKey]) return;
    this.selectedLevel = levelKey;
    localStorage.setItem('selectedLevel', levelKey);
  }

  getLevelConfig() {
    return this.levels[this.selectedLevel] || this.levels.arena;
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
    this.timerFrozen = false;
    this.damageBoost = { player: false, enemy: false };
    this.bloodEffects = [];
    this.hitFlash = 0;
    if(this.powerupManager){
      this.powerupManager.activeEffects=[];
    }
  }

  addCoins(amount) {
    if (isNaN(this.coins)) this.coins = 1000;
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