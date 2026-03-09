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

function launchGame(player1Name, player2Name) {
  const p1 = (player1Name || '').trim() || 'Samurai';
  const p2 = (player2Name || '').trim() || 'Kenji';
  localStorage.setItem('player1Name', p1);
  localStorage.setItem('player2Name', p2);
  const p1Label = document.getElementById('player1NameLabel');
  const p2Label = document.getElementById('player2NameLabel');
  if (p1Label) p1Label.textContent = p1;
  if (p2Label) p2Label.textContent = p2;

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
  if (typeof resetTimer === 'function') {
    resetTimer(30);
  } else {
    window.timer = 30;
    const timerEl = document.querySelector('#timer');
    if (timerEl) timerEl.innerHTML = window.timer;
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
  gameInitializer.startFightCountdown();
}
window.startRound = startRound;

function startNewGame() {
  if (!gameState) initGameSystems();
  gameState.initCanvas();
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
  if (!overlay || !msgEl || !btnsEl) { launchGame('Player 1', 'Player 2'); return; }

  msgEl.innerHTML = `
    <div style="font-family:'Press Start 2P',cursive;font-size:11px;letter-spacing:2px;margin-bottom:22px;color:#fff;">
      ENTER PLAYER NAMES
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
                      color:#ff5555;width:76px;text-align:left;letter-spacing:1px;flex-shrink:0;">P2 NAME</label>
        <input id="nameInput2" type="text" maxlength="14" placeholder="Player 2"
          style="flex:1;min-width:0;background:#0a0a1a;border:2px solid #ff5555;color:#fff;
                 font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:600;
                 padding:8px 12px;border-radius:6px;outline:none;letter-spacing:1px;" />
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
  const n2 = document.getElementById('nameInput2');
  const p1 = (n1 ? n1.value.trim() : '') || 'Player 1';
  const p2 = (n2 ? n2.value.trim() : '') || 'Player 2';
  document.getElementById('modalOverlay').style.display = 'none';
  launchGame(p1, p2);
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
  gameState.coins -= cost;
  gameState.items[itemName] = (gameState.items[itemName] || 0) + 1;
  localStorage.setItem('fighterCoins', gameState.coins.toString());
  localStorage.setItem(itemName, gameState.items[itemName].toString());
  updateShopDisplay();
  gameState.updateCoinDisplays();

  const labels = {
    shields:'Shield', healthBoosts:'Health Boost', damageBoosts:'Damage Boost',
    speedBoosts:'Speed Boost', timeFreezes:'Time Freeze', invincibilities:'Invincibility'
  };
  showShopToast('✓  ' + (labels[itemName] || itemName) + ' purchased!');
}

function updateShopDisplay() {
  if (!gameState) return;
  const panelMap = {
    shieldCount:'shields', healthBoostCount:'healthBoosts',
    damageBoostCount:'damageBoosts', speedBoostCount:'speedBoosts',
    timeFreezeCount:'timeFreezes', invincibilityCount:'invincibilities'
  };
  for (const [elId, itemKey] of Object.entries(panelMap)) {
    const el = document.getElementById(elId);
    if (el) el.textContent = gameState.items[itemKey] || 0;
  }
  const walletEl = document.getElementById('coinDisplay');
  if (walletEl) walletEl.textContent = gameState.coins;

  const hudMap = {
    'pu-shield-n':'shields', 'pu-health-n':'healthBoosts',
    'pu-damage-n':'damageBoosts', 'pu-speed-n':'speedBoosts',
    'pu-freeze-n':'timeFreezes', 'pu-invinc-n':'invincibilities'
  };
  for (const [elId, itemKey] of Object.entries(hudMap)) {
    const el = document.getElementById(elId);
    if (el) el.textContent = gameState.items[itemKey] || 0;
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
  if (numMap[e.key] && typeof activatePowerup === 'function') activatePowerup(numMap[e.key]);
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




document.addEventListener('DOMContentLoaded', () => {
  initGameSystems();
  document.getElementById('startScreen').style.display = 'flex';
});



let loadingInterval;
let loadingComplete=false;

function showInitialLoader(){
  const loader=document.getElementById('initialLoader');
  const loaderImg=document.getElementById('initialLoaderImg');
  const loaderPercent=document.getElementById('loaderPercent');
  const loaderFill=document.querySelector('.loader-fire-fill');
  const loaderFlames=document.getElementById('loaderFireFlames');

  if(!loader) return;

  loader.style.display='flex';
  loader.style.opacity='1';
  if(loaderImg){
    loaderImg.style.opacity='0.4';
    loaderImg.style.filter='blur(0)';
  } 
  if(loaderFlames) loaderFlames.innerHTML='';
   createSideFlames(loaderFlames);
   if(loaderPercent){
       loaderPercent.textContent='0%';
       loaderPercent.style.opacity='1';
  }
  setTimeout(()=>{
    loader.style.opacity='1';
  },100);

  setTimeout(()=>{
    if(loaderImg) loaderImg.style.opacity='0.3';
  },300);

  setTimeout(()=>{
    if(loaderPercent) loaderPercent.style.opacity='1';
  },500);

  let percent=0;
  clearInterval(loadingInterval);

  const totalSteps=80;
  const incrementPerStep=100/totalSteps;

  loadingInterval=setInterval(()=>{
    percent+=incrementPerStep;

    if(percent<=100){
      if(loaderPercent) loaderPercent.textContent=percent+'%';
      if(loaderFill) loaderFill.style.width=percent+'%';
    }

    else{
      clearInterval(loadingInterval);
      loadingComplete=true;

      if(loaderPercent) loaderPercent.textContent='100%';
      if(loaderFill) loaderFill.style.width='100%';

      setTimeout(()=>{
        loader.style.opacity='0';

        setTimeout(()=>{
          loader.style.display='none';

          document.getElementById('startScreen').style.display='flex';

          if(loaderFlames)loaderFlames.innerHTML='';
        },1000);
      },500);
    }
  },100);
}

function createSideFlames(container) {
  if (!container) return;
    const leftFlame = document.createElement('div');
  leftFlame.className = 'flame-side left';
  container.appendChild(leftFlame);
  
  const rightFlame = document.createElement('div');
  rightFlame.className = 'flame-side right';
  container.appendChild(rightFlame);
}

function createFlameStreaks(container) {
  if (!container) return;
    for (let i = 0; i < 3; i++) {
    const leftStreak = document.createElement('div');
    leftStreak.className = 'flame-streak left';
    leftStreak.style.bottom = (5 + i * 8) + 'px';
    leftStreak.style.animationDelay = (i * 0.3) + 's';
    container.appendChild(leftStreak);
    
    const rightStreak = document.createElement('div');
    rightStreak.className = 'flame-streak right';
    rightStreak.style.bottom = (5 + i * 8) + 'px';
    rightStreak.style.animationDelay = (i * 0.3) + 's';
    container.appendChild(rightStreak);
  }
}


function addFlameAnimation() {
  if (!document.querySelector('#flameAnimation')) {
    const style = document.createElement('style');
    style.id = 'flameAnimation';
    style.textContent = `
      @keyframes flameLeft {
        0%, 100% {
          transform: skewX(-15deg) translateX(0);
          opacity: 0.7;
        }
        50% {
          transform: skewX(-15deg) translateX(-10px);
          opacity: 1;
          height: 120%;
        }
      }
      
      @keyframes flameRight {
        0%, 100% {
          transform: skewX(15deg) translateX(0);
          opacity: 0.7;
        }
        50% {
          transform: skewX(15deg) translateX(10px);
          opacity: 1;
          height: 120%;
        }
      }
      
      @keyframes streakLeft {
        0% {
          transform: translateX(0) scaleX(1);
          opacity: 0.5;
        }
        50% {
          transform: translateX(-20px) scaleX(1.5);
          opacity: 1;
        }
        100% {
          transform: translateX(0) scaleX(1);
          opacity: 0.5;
        }
      }
      
      @keyframes streakRight {
        0% {
          transform: translateX(0) scaleX(1);
          opacity: 0.5;
        }
        50% {
          transform: translateX(20px) scaleX(1.5);
          opacity: 1;
        }
        100% {
          transform: translateX(0) scaleX(1);
          opacity: 0.5;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  addFlameAnimation();
  document.getElementById('startScreen').style.display='none';
  showInitialLoader();
  setTimeout(()=>{
    initGameSystems();
  },500)
})