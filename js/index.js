// js/index.js

let gameState;
let gameRenderer;
let gameInitalizer;
let combactSystem;

function initGameSystems() {
  gameState = new GameState();
  gameState.initCanvas();
  gameState.inputHandler = new InputHandler(gameState);
  combactSystem = new CombactSystem(gameState);
  gameState.combactSystem = combactSystem;
  const renderer = new GameRenderer(gameState);
  gameState.renderer = renderer;
  gameInitalizer = new GameInitalizer(gameState);
  window.gameState = gameState;
  gameState.updateCoinDisplays();
}

function startGame() {
  const player1Name = 'Player 1';
  const player2Name = 'Player 2';
  localStorage.setItem('player1Name', player1Name);
  localStorage.setItem('player2Name', player2Name);

  const p1Label = document.getElementById('player1NameLabel');
  const p2Label = document.getElementById('player2NameLabel');
  if (p1Label) p1Label.textContent = player1Name;
  if (p2Label) p2Label.textContent = player2Name;

  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';

  const loadEl = document.getElementById('loadingScreen');
  if (loadEl) loadEl.style.display = 'block';

  setTimeout(() => {
    if (loadEl) loadEl.style.display = 'none';
    startNewGame();
  }, 120);
}

function startRound() {
  if (!gameState) return;
  gameState.gameEnding = false;
  gameState.gameStarted = false; // will be flipped to true after countdown

  // Reset timer variable (global, declared in utils.js)
  timer = 30;
  const timerEl = document.querySelector('#timer');
  if (timerEl) timerEl.innerHTML = timer;

  // Reset player
  if (gameState.player) {
    gameState.player.health = 300;
    gameState.player.maxHealth = 300;
    gameState.player.dead = false;
    gameState.player.isAttacking = false;
    gameState.player.specialCharge = 0;
    gameState.player.position.x = 100;
    gameState.player.position.y = 0;
    gameState.player.velocity = { x: 0, y: 0 };
    gameState.player.switchSprite('idle');
  }

  // Reset enemy
  if (gameState.enemy) {
    gameState.enemy.health = 300;
    gameState.enemy.maxHealth = 300;
    gameState.enemy.dead = false;
    gameState.enemy.isAttacking = false;
    gameState.enemy.specialCharge = 0;
    gameState.enemy.position.x = 800;
    gameState.enemy.position.y = 100;
    gameState.enemy.velocity = { x: 0, y: 0 };
    gameState.enemy.switchSprite('idle');
  }

  // Reset health bars
  const playerHealthEl = document.getElementById('playerHealth');
  const enemyHealthEl  = document.getElementById('enemyHealth');
  if (playerHealthEl) playerHealthEl.style.width = '100%';
  if (enemyHealthEl)  enemyHealthEl.style.width  = '100%';

  // Cancel existing animation loop before starting new one
  if (gameState.animationId) {
    cancelAnimationFrame(gameState.animationId);
    gameState.animationId = null;
  }

  gameInitalizer.startFightCountdown();
}
window.startRound = startRound;

function startNewGame() {
  if (!gameState) {
    initGameSystems();
  }
  // Re-init canvas in case the window was resized
  gameState.initCanvas();
  gameInitalizer.initGame();
}

// BUG FIX: returnToMenu was referenced in utils.js (determineWinner) but never defined.
// It's the same as backToMenu, so we expose it here.
function returnToMenu() {
  backToMenu();
}
window.returnToMenu = returnToMenu;

function backToMenu() {
  document.getElementById('howToPlayScreen').style.display = 'none';
  // document.getElementById('shopScreen').style.display = 'none'; // SHOP COMMENTED OUT
  document.getElementById('gameContainer').style.display = 'none';
  document.getElementById('startScreen').style.display = 'flex';

  // Hide any overlay text
  const displayText = document.querySelector('#displayText');
  if (displayText) displayText.style.display = 'none';

  if (gameState) {
    if (gameState.animationId) {
      cancelAnimationFrame(gameState.animationId);
      gameState.animationId = null;
    }
    gameState.reset();
    gameState.updateCoinDisplays();
  }
}

function showHowToPlay() {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('howToPlayScreen').style.display = 'flex';
}

// ===== SHOP FUNCTIONS (COMMENTED OUT) =====
/*
function showShop() {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('shopScreen').style.display = 'flex';
  updateShopDisplay();
}

function closeShop() {
  document.getElementById('shopScreen').style.display = 'none';
  document.getElementById('startScreen').style.display = 'flex';
}

function buyItem(itemName, cost) {
  if (!gameState) return;
  if (gameState.coins >= cost) {
    gameState.coins -= cost;
    gameState.items[itemName] = (gameState.items[itemName] || 0) + 1;

    localStorage.setItem('fighterCoins', gameState.coins.toString());
    localStorage.setItem(itemName, gameState.items[itemName].toString());

    updateShopDisplay();
    gameState.updateCoinDisplays();
  } else {
    showModal('Not enough coins!');
  }
}

function updateShopDisplay() {
  if (!gameState) return;

  const ids = {
    shieldCount:       'shields',
    healthBoostCount:  'healthBoosts',
    damageBoostCount:  'damageBoosts',
    speedBoostCount:   'speedBoosts',
    timeFreezeCount:   'timeFreezes',
    invincibilityCount:'invincibilities'
  };

  for (const [elId, itemKey] of Object.entries(ids)) {
    const el = document.getElementById(elId);
    if (el) el.textContent = gameState.items[itemKey] || 0;
  }

  // Also update in-game HUD counts
  const hudMap = {
    'pu-shield-n':  'shields',
    'pu-health-n':  'healthBoosts',
    'pu-damage-n':  'damageBoosts',
    'pu-speed-n':   'speedBoosts',
    'pu-freeze-n':  'timeFreezes',
    'pu-invinc-n':  'invincibilities'
  };
  for (const [elId, itemKey] of Object.entries(hudMap)) {
    const el = document.getElementById(elId);
    if (el) el.textContent = gameState.items[itemKey] || 0;
  }
}
*/
// ===== END SHOP FUNCTIONS =====

// Stub so any lingering references don't throw errors
function showShop() {}
function closeShop() {}
function buyItem() {}
function updateShopDisplay() {}

// Expose all public functions
window.startGame        = startGame;
window.startNewGame     = startNewGame;
window.showHowToPlay    = showHowToPlay;
window.backToMenu       = backToMenu;
// window.showShop      = showShop;   // SHOP COMMENTED OUT
// window.closeShop     = closeShop;  // SHOP COMMENTED OUT
// window.buyItem       = buyItem;    // SHOP COMMENTED OUT
// window.updateShopDisplay = updateShopDisplay; // SHOP COMMENTED OUT
window.startRound       = startRound;

// Boot
document.addEventListener('DOMContentLoaded', () => {
  initGameSystems();
});