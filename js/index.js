// js/index.js
let gameState;
let gameRenderer;
let gameInitializer; 
let combatSystem;

function initGameSystems() {
  if (gameState) return;
  
  gameState = new GameState();
  gameState.initCanvas();  
  gameState.inputHandler = new InputHandler(gameState);
  combatSystem = new CombatSystem(gameState);
  gameState.combatSystem = combatSystem;
  const renderer = new GameRenderer(gameState);      
  gameState.renderer = renderer;
  gameInitializer = new GameInitalizer(gameState);
  window.gameState = gameState;
  if (typeof window.powerupManager === 'function') {
    gameState.powerupManager = new window.powerupManager(gameState);
  }
  if (typeof window.setupPowerupHud === 'function') {
    window.setupPowerupHud();
  }

  gameState.updateCoinDisplays(); 
}

function startGame() {
  showNameEntryModal();
}

function showGameHub() {
  const startScreen = document.getElementById('startScreen');
  const howToScreen = document.getElementById('howToPlayScreen');
  const gameContainer = document.getElementById('gameContainer');
  const displayText = document.getElementById('displayText');
  const hubScreen = document.getElementById('gameHubScreen');

  if (startScreen) startScreen.style.display = 'none';
  if (howToScreen) howToScreen.style.display = 'none';
  if (gameContainer) gameContainer.style.display = 'none';
  if (displayText) displayText.style.display = 'none';
  if (hubScreen) hubScreen.style.display = 'flex';

  closeShop();
}

function openGameFromHub(gameKey) {
  const hubScreen = document.getElementById('gameHubScreen');
  if (hubScreen) hubScreen.style.display = 'none';

  if (gameKey === 'candy') {
    window.location.href = 'candy.html';
    return;
  }

  document.getElementById('startScreen').style.display = 'flex';
}

function launchGame(player1Name, levelKey = 'arena') {
  localStorage.setItem('selectedLevel', levelKey);
  const p1 = (player1Name || '').trim() || 'Samurai';
  if (gameState && typeof gameState.setLevel === 'function') {
    gameState.setLevel(levelKey);
  }
  const cpuName = gameState?.getLevelConfig?.().enemyName || 'Kenji CPU';

  localStorage.setItem('player1Name', p1);
  localStorage.setItem('player2Name', cpuName);

  const p1Label = document.getElementById('player1NameLabel');
  const p2Label = document.getElementById('player2NameLabel');
  if (p1Label) p1Label.textContent = p1;
  if (p2Label) p2Label.textContent = cpuName;

  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';
  // const loadEl = document.getElementById('loadingScreen');
  // if (loadEl) loadEl.style.display = 'block';
  // setTimeout(() => {
  //   if (loadEl) loadEl.style.display = 'none';
  //   startNewGame();
  // }, 120);
  startNewGame();
}

function startRound() {
  if (!gameState) return;
  gameState.gameEnding = false;
  gameState.gameStarted = false;
  gameState.isPaused = false;
  gameState.isReplaying = false;

  if (typeof resetTimer === 'function') {
    resetTimer(30);
  } else {
    window.timer = 30;
    const timerEl = document.querySelector('#timer');
    if (timerEl) timerEl.innerHTML = window.timer;
  }

  if (gameState.powerupManager) {
    gameState.powerupManager.activeEffects = [];
  }
  gameState.timerFrozen = false;
  gameState.damageBoost = { player: false, enemy: false };
  gameState.bloodEffects = [];
  gameState.hitFlash = 0;

  if (typeof updateShopDisplay === 'function') {
    updateShopDisplay();
  }

  const canvasWidth = gameState.canvas ? gameState.canvas.width : 0;
  const leftStartX = 100;
  const rightStartX = Math.max(280, canvasWidth - 260);

  if (gameState.player) {
    gameState.player.health = 300;
    gameState.player.maxHealth = 300;
    gameState.player.dead = false;
    gameState.player.isAttacking = false;
    gameState.player.specialCharge = 0;
    gameState.player.speedBoostActive = false;
    gameState.player.invincible = false;
    gameState.player.shieldCharges = 0;
    gameState.player.isBlocking = false;
    gameState.player.lastKey = null;
    gameState.player.position.x = leftStartX;
    gameState.player.position.y = 0;
    gameState.player.velocity = { x: 0, y: 0 };
    gameState.player.switchSprite('idle');
  }
  if (gameState.enemy) {
    gameState.enemy.health = 300;
    gameState.enemy.maxHealth = 300;
    gameState.enemy.dead = false;
    gameState.enemy.isAttacking = false;
    gameState.enemy.specialCharge = 0;
    gameState.enemy.speedBoostActive = false;
    gameState.enemy.invincible = false;
    gameState.enemy.shieldCharges = 0;
    gameState.enemy.isBlocking = false;
    gameState.enemy.lastKey = null;
    gameState.enemy.position.x = rightStartX;
    gameState.enemy.position.y = 0;
    gameState.enemy.velocity = { x: 0, y: 0 };
    gameState.enemy.switchSprite('idle');
  }
  const playerHealthEl = document.getElementById('playerHealth');
  const enemyHealthEl  = document.getElementById('enemyHealth');
  if (playerHealthEl) playerHealthEl.style.width = '100%';
  if (enemyHealthEl)  enemyHealthEl.style.width  = '100%';

  if (gameState.animationId) {
    cancelAnimationFrame(gameState.animationId);
    gameState.animationId = null;
  }

  if (gameState.renderer && typeof gameState.renderer.resetCpuState === 'function') {
    gameState.renderer.resetCpuState();
  }
  if (gameState.renderer && typeof gameState.renderer.resetRuntimeCaches === 'function') {
    gameState.renderer.resetRuntimeCaches();
  }

  if (typeof updateShopDisplay === 'function') {
    updateShopDisplay();
  }

  gameInitializer.startFightCountdown();
}
window.startRound = startRound;

function startNewGame() {
  if (!gameState) initGameSystems();

  gameState.initCanvas();
  if (typeof updateShopDisplay === 'function') {
    updateShopDisplay();
  }
  if (typeof window.setupPowerupHud === 'function') {
    window.setupPowerupHud();
  }
  gameInitializer.initGame();
}

function returnToMenu() { backToMenu(); }
window.returnToMenu = returnToMenu;

function backToMenu() {
  const howTo = document.getElementById('howToPlayScreen');
  const gameC = document.getElementById('gameContainer');
  const dispT = document.getElementById('displayText');
  if (howTo) howTo.style.display = 'none';
  if (gameC) gameC.style.display = 'none';
  if (dispT) dispT.style.display = 'none';
  document.getElementById('startScreen').style.display = 'flex';
  closeShop();

  if (gameState) {
    if (gameState.animationId) {
      cancelAnimationFrame(gameState.animationId);
      gameState.animationId = null;
    }
    if (typeof resetTimer === 'function') resetTimer();
    gameState.reset();
    gameState.updateCoinDisplays();
  }
}

function showHowToPlay() {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('howToPlayScreen').style.display = 'flex';
}

function showNameEntryModal() {
  const overlay = document.getElementById('modalOverlay');
  const msgEl   = document.getElementById('modalMessage');
  const btnsEl  = document.getElementById('modalButtons');
  if (!overlay || !msgEl || !btnsEl) { launchGame('Player 1', 'arena'); return; }

  const savedLevel = localStorage.getItem('selectedLevel') || 'arena';

  msgEl.innerHTML = `
    <div style="font-family:'Press Start 2P',cursive;font-size:11px;letter-spacing:2px;margin-bottom:22px;color:#fff;">
      PLAYER VS CPU
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <label style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;
                      color:#4d79ff;width:76px;text-align:left;letter-spacing:1px;flex-shrink:0;">P1 NAME</label>
        <input id="nameInput1" type="text" maxlength="14" placeholder="Player 1"
          style="flex:1;min-width:0;background:#0a0a1a;border:2px solid #4d79ff;color:#fff;
                 font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:600;
                 padding:8px 12px;border-radius:6px;outline:none;letter-spacing:1px;" />
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <label style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;
                      color:#ffb347;width:76px;text-align:left;letter-spacing:1px;flex-shrink:0;">LEVEL</label>
        <select id="levelSelect"
          style="flex:1;min-width:0;background:#0a0a1a;border:2px solid #ffb347;color:#fff;
                 font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;
                 padding:8px 12px;border-radius:6px;outline:none;letter-spacing:1px;">
          <option value="dojo" ${savedLevel === 'dojo' ? 'selected' : ''}>DOJO (EASY)</option>
          <option value="arena" ${savedLevel === 'arena' ? 'selected' : ''}>ARENA (NORMAL)</option>
          <option value="citadel" ${savedLevel === 'citadel' ? 'selected' : ''}>CITADEL (HARD)</option>
        </select>
      </div>
    </div>`;

  btnsEl.innerHTML = `
    <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
      <button class="btn" style="font-size:9px;padding:11px 24px;letter-spacing:2px;"
        onclick="window._confirmNames()">⚔ FIGHT!</button>
      <button class="btn"
        style="font-size:9px;padding:11px 18px;letter-spacing:2px;
               background:rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.3);box-shadow:none;"
        onclick="document.getElementById('modalOverlay').style.display='none'">CANCEL</button>
    </div>`;

  overlay.style.display = 'flex';
  setTimeout(() => { const i = document.getElementById('nameInput1'); if (i) i.focus(); }, 40);
}

window._confirmNames = function () {
  const n1 = document.getElementById('nameInput1');
  const levelSelect = document.getElementById('levelSelect');
  const p1 = (n1 ? n1.value.trim() : '') || 'Player 1';
  const selectedLevel = (levelSelect && levelSelect.value) ? levelSelect.value : 'arena';
  document.getElementById('modalOverlay').style.display = 'none';
  launchGame(p1, selectedLevel);
};

let _shopToastTimer = null;
function showShopToast(msg) {
  const el = document.getElementById('shopToast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(_shopToastTimer);
  _shopToastTimer = setTimeout(() => el.classList.remove('visible'), 2200);
}

let _gameMessageTimer = null;
function showGameMessage(msg, duration = 1200) {
  const el = document.getElementById('gameMessage');
  if (!el) return;
  el.textContent = msg;
  el.style.animation = 'none';
    void el.offsetWidth;
  el.style.animation = 'messagePop 1.0s ease';

  clearTimeout(_gameMessageTimer);
  _gameMessageTimer = setTimeout(() => {
    el.style.animation = 'none';
  }, duration);
}

function showShop() {
  updateShopDisplay();
  const panel    = document.getElementById('shopPanel');
  const backdrop = document.getElementById('shopBackdrop');
  if (panel)    panel.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
}

function closeShop() {
  const panel = document.getElementById('shopPanel');
  const backdrop = document.getElementById('shopBackdrop');
  if (panel) panel.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
}

function buyItem(itemName, cost) {
  if (!gameState) return;
  if (gameState.coins < cost) {
    showShopToast('⚠  Not enough coins!');
    return;
  }  

  const currentCount = typeof gameState.getItemCount === 'function'
    ? gameState.getItemCount('player', itemName)
    : (gameState.items?.player?.[itemName] || 0);

  gameState.coins -= cost;
  if (isNaN(gameState.coins)) gameState.coins = 0;
  localStorage.setItem('fighterCoins', gameState.coins.toString());

  if (typeof gameState.setItemCount === 'function') {
    gameState.setItemCount('player', itemName, currentCount + 1);
  } else {
    if (!gameState.items.player) gameState.items.player = {};
    gameState.items.player[itemName] = currentCount + 1;
  }

  updateShopDisplay();
  if (typeof gameState.updateCoinDisplays === 'function') {
    gameState.updateCoinDisplays();
  }

  const labels = {
    shields:'Shield', healthBoosts:'Health Boost', damageBoosts:'Damage Boost',
    speedBoosts:'Speed Boost', timeFreezes:'Time Freeze', invincibilities:'Invincibility'
  };
  showShopToast('✓  ' + (labels[itemName] || itemName) + ' purchased!');
}

function updateShopDisplay() {
  if (!gameState) return;

  const getCount = (itemKey) => {
    if (typeof gameState.getItemCount === 'function') {
      return gameState.getItemCount('player', itemKey);
    }
    return gameState.items?.player?.[itemKey] || 0;
  };

  const panelMap = {
    shieldCount:'shields', healthBoostCount:'healthBoosts',
    damageBoostCount:'damageBoosts', speedBoostCount:'speedBoosts',
    timeFreezeCount:'timeFreezes', invincibilityCount:'invincibilities'
  };
  for (const [elId, itemKey] of Object.entries(panelMap)) {
    const el = document.getElementById(elId);
    if (el) {
      const count = getCount(itemKey);
      el.textContent = count;
    }
  }

  const walletEl = document.getElementById('coinDisplay');
  const coinDisplaySS = document.getElementById('startScreenCoins');
  if (walletEl) walletEl.textContent = gameState.coins;
  if (coinDisplaySS) coinDisplaySS.textContent = gameState.coins;

  const hudMap = {
    'pu-shield-n':'shields', 'pu-health-n':'healthBoosts',
    'pu-damage-n':'damageBoosts', 'pu-speed-n':'speedBoosts',
    'pu-freeze-n':'timeFreezes', 'pu-invinc-n':'invincibilities'
  };
  for (const [elId, itemKey] of Object.entries(hudMap)) {
    const el = document.getElementById(elId);
    if (el) {
      const count = getCount(itemKey);
      el.textContent = count;
    }
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const overlay = document.getElementById('modalOverlay');
    const n1 = document.getElementById('nameInput1');
    if (overlay && overlay.style.display !== 'none' && n1) { window._confirmNames(); return; }
  }
  if (e.key === 'Escape') { closeShop(); return; }
  if (!gameState || !gameState.gameStarted) return;
  const numMap = { '1':'shields','2':'healthBoosts','3':'damageBoosts','4':'speedBoosts','5':'timeFreezes','6':'invincibilities' };
  if (numMap[e.key] && typeof activatePowerup === 'function') activatePowerup(numMap[e.key], 'player');
});

window.startGame = startGame;
window.launchGame = launchGame;
window.startNewGame = startNewGame;  
window.startRound = startRound;
window.returnToMenu = returnToMenu;
window.backToMenu = backToMenu;
window.showHowToPlay = showHowToPlay;
window.showShop = showShop;
window.closeShop = closeShop;
window.buyItem = buyItem;
window.updateShopDisplay = updateShopDisplay;
window.showShopToast = showShopToast;
window.showGameHub = showGameHub;
window.openGameFromHub = openGameFromHub;

let loadingInterval;
let loadingComplete=false;

function showInitialLoader(){
  const loader=document.getElementById('initialLoader');
  const loaderImg=document.getElementById('initialLoaderImg');
  const loaderOverlay=document.getElementById('loaderOverlay');
  const loaderStatus=document.getElementById('loaderStatus');
  const loaderPercent=document.getElementById('loaderPercent');
  const loaderFill=document.querySelector('.loader-fire-fill');

  if(!loader) return;

  loader.style.display='flex';
  loader.style.opacity='1';
  if(loaderImg){
    loaderImg.style.opacity='0.08';
    loaderImg.style.filter='blur(28px)';
    loaderImg.style.transform='scale(1.08)';
  } 
  if (loaderOverlay) {
    loaderOverlay.style.background='rgba(0,0,0,0.72)';
  }
  if(loaderPercent){
    loaderPercent.textContent='0%';
    loaderPercent.style.opacity='1';
  }
  if (loaderStatus) loaderStatus.textContent = 'Preparing game assets...';

  setTimeout(()=>{
    loader.style.opacity='1';
  },100);

  let percent=0;
  clearInterval(loadingInterval);

  const totalDurationMs=2200;
  const tickMs=40;
  const totalSteps=Math.ceil(totalDurationMs/tickMs);
  const incrementPerStep=100/totalSteps;

  loadingInterval=setInterval(()=>{
    percent=Math.min(100,percent+incrementPerStep);

    if(loaderPercent) loaderPercent.textContent=Math.round(percent)+'%';
    if(loaderFill) loaderFill.style.width=percent+'%';
    updateLoaderStatus(loaderStatus, percent);

    if (loaderImg) {
      let opacity = 0;
      let blurVal = 28;
      let scale = 1.08;

      if (percent <= 25) {
        const t = percent / 25;
        opacity = 0.08 + (0.16 * t);
        blurVal = 28 - (8 * t);
        scale = 1.08;
      } else if (percent <= 50) {
        const t = (percent - 25) / 25;
        opacity = 0.24 + (0.30 * t);
        blurVal = 20 - (8 * t);
        scale = 1.08 - (0.02 * t);
      } else if (percent <= 75) {
        const t = (percent - 50) / 25;
        opacity = 0.54 + (0.40 * t);
        blurVal = 12 - (10.5 * t);
        scale = 1.06 - (0.035 * t);
      } else {
        const t = (percent - 75) / 25;
        opacity = 0.94 + (0.04 * t);
        blurVal = 1.5 - (1.5 * t);
        scale = 1.025 - (0.025 * t);
      }

      loaderImg.style.opacity = opacity.toFixed(3);
      loaderImg.style.filter = `blur(${Math.max(0, blurVal).toFixed(1)}px)`;
      loaderImg.style.transform = `scale(${scale.toFixed(3)})`;
    }

    if (loaderOverlay) {
      let darkness = 0.72;
      if (percent <= 25) {
        const t = percent / 25;
        darkness = 0.72 - (0.08 * t);
      } else if (percent <= 50) {
        const t = (percent - 25) / 25;
        darkness = 0.64 - (0.16 * t);
      } else if (percent <= 75) {
        const t = (percent - 50) / 25;
        darkness = 0.48 - (0.20 * t);
      } else {
        const t = (percent - 75) / 25;
        darkness = 0.28 - (0.10 * t);
      }
      loaderOverlay.style.background = `rgba(0,0,0,${Math.max(0.14, darkness).toFixed(3)})`;
    }

    if(percent>=100){
      clearInterval(loadingInterval);
      loadingComplete=true;

      if(loaderPercent) loaderPercent.textContent='100%';
      if(loaderFill) loaderFill.style.width=percent+'%';
      if(loaderStatus) loaderStatus.textContent='Games ready!';
      if(loaderImg){
        loaderImg.style.opacity='0.94';
        loaderImg.style.filter='blur(0px)';
        loaderImg.style.transform='scale(1)';
      }
      if (loaderOverlay) loaderOverlay.style.background='rgba(0,0,0,0.2)';

      setTimeout(()=>{
        loader.style.opacity='0';

        setTimeout(()=>{
          loader.style.display='none';

          showGameHub();
        },120);
      },120);
    }
  },tickMs);
}

function updateLoaderStatus(statusEl, percent) {
  if (!statusEl) return;
  if (percent < 22) statusEl.textContent = 'Loading game framework...';
  else if (percent < 55) statusEl.textContent = 'Streaming game assets...';
  else if (percent < 90) statusEl.textContent = 'Building game menu...';
  else statusEl.textContent = 'Finalizing game library...';
}

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('startScreen').style.display='none';
  const hubScreen = document.getElementById('gameHubScreen');
  if (hubScreen) hubScreen.style.display = 'none';
  showInitialLoader();
  requestAnimationFrame(()=>{
    initGameSystems();
  });
})