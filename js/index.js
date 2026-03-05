let gameState;
let gameRenderer;
let gameInitializer;
let combatSystem;
let aiController;

function initGameSystems() {
  gameState = new GameState();
  gameState.initCanvas();
  gameState.soundSystem = new SoundSystem();
  gameState.inputHandler = new InputHandler(gameState);
  aiController = new AIController(gameState);
  gameState.aiController = aiController;
  combatSystem = new CombatSystem(gameState);
  gameState.combatSystem = combatSystem;
  gameRenderer = new GameRenderer(gameState);
  gameState.renderer = gameRenderer;
  gameInitializer = new GameInitializer(gameState);
  
  window.gameState = gameState;
  console.log('Game systems initialized successfully');
}

function startRound() {
  if (!gameState || !gameState.player || !gameState.enemy) return;

  if (gameState.animationId) {
    cancelAnimationFrame(gameState.animationId);
    gameState.animationId = null;
  }

  const baseHP = 300;
  gameState.player.health = baseHP + (gameState.activeItems.player.healthBoost ? 50 : 0);
  gameState.enemy.health = baseHP + (gameState.activeItems.enemy.healthBoost ? 50 : 0);
  gameState.player.dead = false;
  gameState.enemy.dead = false;
  gameState.player.position.x = 0;
  gameState.player.position.y = 0;
  gameState.enemy.position.x = 400;
  gameState.enemy.position.y = 100;
  gameState.player.velocity = { x: 0, y: 0 };
  gameState.enemy.velocity = { x: 0, y: 0 };
  gameState.player.specialCharge = 0;
  gameState.enemy.specialCharge = 0;
  gameState.player.combo = 0;
  gameState.enemy.combo = 0;
  
  const resetSprite = (fighter, spriteName) => {
    const sp = fighter.sprites && fighter.sprites[spriteName];
    if (sp) {
      fighter.image = sp.image;
      fighter.framesMax = sp.framesMax;
      fighter.framesCurrent = 0;
      fighter.framesElapsed = 0;
    }
    fighter.isAttacking = false;
    fighter.isBlocking = false;
    fighter.isSpecialAttack = false;
  };
  
  resetSprite(gameState.player, 'idle');
  resetSprite(gameState.enemy, 'idle');

  document.querySelector('#playerHealth').style.width = '100%';
  document.querySelector('#enemyHealth').style.width = '100%';

  timer = 30;
  document.querySelector('#timer').innerHTML = '30';
  if (timerId) { clearTimeout(timerId); timerId = null; }

  gameState.gameEnding = false;
  gameState.isPaused = false;
  gameState.bloodParticles = [];
  gameState.floatingNumbers = [];
  gameState.screenShake = { magnitude: 0, duration: 0 };
  gameState.invincibleTimers = { player: 0, enemy: 0 };
  gameState.timerFrozen = false;
  gameState.activeItems = {
    player: { shield: false, healthBoost: false, damageBoost: false, speedBoost: false, invincible: false },
    enemy:  { shield: false, healthBoost: false, damageBoost: false, speedBoost: false, invincible: false }
  };
  gameState.matchStats = {
    player: { hitsLanded: 0, hitsMissed: 0, damageDealt: 0, blockedHits: 0 },
    enemy:  { hitsLanded: 0, hitsMissed: 0, damageDealt: 0, blockedHits: 0 }
  };
  
  gameInitializer.startFightCountdown();
}

function returnToMenu() {   
  if (gameState && gameState.animationId) {   
    cancelAnimationFrame(gameState.animationId);
    gameState.animationId = null;
  }
  
  if (gameState && gameState.soundSystem) gameState.soundSystem.playBgMusic();
  if (timerId) { clearTimeout(timerId); timerId = null; }
  if (gameState) gameState.gameStarted = false;
  
  document.getElementById('gameContainer').style.display = 'none';
  document.getElementById('startScreen').style.display = 'flex';
  document.querySelector('#displayText').style.display = 'none';
  document.querySelector('#gameOverButtons').style.display = 'none';
  document.querySelector('#displayTextMsg').innerHTML = 'Tie';
  document.querySelector('#timer').innerHTML = '30';
  document.querySelector('#playerHealth').style.width = '100%';
  document.querySelector('#enemyHealth').style.width = '100%';
  
  if (typeof selectMode === 'function') selectMode('2p');
  if (typeof updateShopDisplay === 'function') updateShopDisplay();
}

function showMatchStats() {
  if (!gameState) return;
  
  const { ctx, canvas, matchStats, player, enemy } = gameState;
  const player1Name = localStorage.getItem('player1Name') || 'Player 1';
  const player2Name = localStorage.getItem('player2Name') || 'Player 2';
  const p1Wins = parseInt(localStorage.getItem('fighterWinsP1')) || 0;
  const p2Wins = parseInt(localStorage.getItem('fighterWinsP2')) || 0;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const panelWidth = Math.min(900, canvas.width - 120);
  const panelHeight = 420;
  const cx = canvas.width / 2; 
  const panelX = cx - panelWidth / 2;
  const panelY = 80;
  
  ctx.fillStyle = '#111217'; 
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 4;
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
  
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'center';
  ctx.fillText('MATCH STATISTICS', cx, panelY + 42);
  
  const leftX = panelX + 40;
  const rightX = panelX + panelWidth - 40;
  const startY = panelY + 90;
  const lineHeight = 36;
  
  ctx.font = 'bold 26px Arial';
  ctx.fillStyle = '#4169E1';
  ctx.textAlign = 'left';
  ctx.fillText(player1Name, leftX, startY);
  
  ctx.font = '20px Arial';
  ctx.fillStyle = '#FFFFFF';
  
  const accuracy1 = matchStats.player.hitsLanded + matchStats.player.hitsMissed > 0
    ? ((matchStats.player.hitsLanded / (matchStats.player.hitsLanded + matchStats.player.hitsMissed)) * 100).toFixed(1)
    : '0.0';
    
  const leftStats = [
    `Wins: ${p1Wins}`,
    `Hits Landed: ${matchStats.player.hitsLanded}`,
    `Hits Missed: ${matchStats.player.hitsMissed}`,
    `Damage Dealt: ${matchStats.player.damageDealt}`,
    `Hits Blocked: ${matchStats.player.blockedHits}`,
    `Max Combo: ${player.maxCombo}x`,
    `Accuracy: ${accuracy1}%`
  ];
  
  leftStats.forEach((text, i) => {  
    ctx.fillText(text, leftX, startY + (i + 1) * lineHeight);
  });
  
  ctx.font = 'bold 26px Arial';
  ctx.fillStyle = '#E51111';
  ctx.textAlign = 'right';
  ctx.fillText(player2Name, rightX, startY);
  
  ctx.font = '20px Arial';  
  ctx.fillStyle = '#FFFFFF';
  
  const accuracy2 = matchStats.enemy.hitsLanded + matchStats.enemy.hitsMissed > 0
    ? ((matchStats.enemy.hitsLanded / (matchStats.enemy.hitsLanded + matchStats.enemy.hitsMissed)) * 100).toFixed(1)
    : '0.0';
    
  const rightStats = [
    `Wins: ${p2Wins}`,    
    `Hits Landed: ${matchStats.enemy.hitsLanded}`,  
    `Hits Missed: ${matchStats.enemy.hitsMissed}`,
    `Damage Dealt: ${matchStats.enemy.damageDealt}`,
    `Hits Blocked: ${matchStats.enemy.blockedHits}`,
    `Max Combo: ${enemy.maxCombo}x`, 
    `Accuracy: ${accuracy2}%`
  ];
  
  rightStats.forEach((text, i) => {
    ctx.fillText(text, rightX, startY + (i + 1) * lineHeight);
  });
  
  ctx.textAlign = 'center';
  ctx.font = '18px Arial';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('Press ESC to close', cx, panelY + panelHeight - 20);
  ctx.textAlign = 'left';
}

function startGame() {
  const p1Input = document.getElementById('player1NameInput');
  const p2Input = document.getElementById('player2NameInput');
  const isCOOP = window.selectedMode === 'co-op';
  const player1Name = (p1Input ? p1Input.value.trim() : '') || 'Player 1';
  const player2Name = isCOOP ? 'CO-Op' : ((p2Input ? p2Input.value.trim() : '') || 'Player 2');
  
  localStorage.setItem('player1Name', player1Name);
  localStorage.setItem('player2Name', player2Name);
  
  const p1Label = document.getElementById('player1NameLabel');
  const p2Label = document.getElementById('player2NameLabel');
  if (p1Label) p1Label.textContent = player1Name;
  if (p2Label) p2Label.textContent = isCOOP ? 'CO-Op' : player2Name;
  
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';
  
  const loadEl = document.getElementById('loadingScreen');
  if (loadEl) loadEl.style.display = 'block';
  
  setTimeout(() => {
    if (loadEl) loadEl.style.display = 'none';
    startNewGame();
    if (gameState && gameState.soundSystem) gameState.soundSystem.playBgMusic();
    gameState.aiEnabled = isCOOP;
    if (isCOOP && gameState.aiController) {
      const diffEl = document.getElementById('aiDifficulty');
      gameState.aiController.difficulty = diffEl ? diffEl.value : 'normal';
    }
    const hudEl = document.getElementById('powerupHUD');
    if (hudEl) hudEl.style.display = isCOOP ? 'flex' : 'none';
    if (isCOOP && window.updatePowerupHUD) window.updatePowerupHUD();
  }, 120);
}

function startNewGame() {
  if (!gameState) {   
    initGameSystems();
  }
  gameInitializer.initGame();
}

function restartGame() {
  if (gameState && gameState.animationId) {
    cancelAnimationFrame(gameState.animationId);
  }
  if (timerId) {  
    clearTimeout(timerId);    
  }
  document.querySelector('#displayText').style.display = 'none';
  document.querySelector('#gameOverButtons').style.display = 'none';
  startNewGame();
}

function showHowToPlay() {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('howToPlayScreen').style.display = 'flex';
}

function backToMenu() {
  document.getElementById('howToPlayScreen').style.display = 'none';
  document.getElementById('startScreen').style.display = 'flex';
  updateShopDisplay(); 
}

function showShop() {
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('shopScreen').style.display = 'flex';
  updateShopDisplay();
}

function closeShop() { 
  document.getElementById('shopScreen').style.display = 'none';
  document.getElementById('startScreen').style.display = 'flex';
}

function updateShopDisplay() {  
  if (!gameState) return;
  document.getElementById('coinDisplay').textContent = gameState.coins;
  document.getElementById('startScreenCoins').textContent = gameState.coins;
  document.getElementById('shieldCount').textContent = gameState.inventory.shields;
  document.getElementById('healthBoostCount').textContent = gameState.inventory.healthBoosts;
  document.getElementById('damageBoostCount').textContent = gameState.inventory.damageBoosts;
  document.getElementById('speedBoostCount').textContent = gameState.inventory.speedBoosts || 0;
  document.getElementById('timeFreezeCount').textContent = gameState.inventory.timeFreezes || 0;
  document.getElementById('invincibilityCount').textContent = gameState.inventory.invincibilities || 0;
  
  const p1Wins = parseInt(localStorage.getItem('fighterWinsP1')) || 0;
  const p2Wins = parseInt(localStorage.getItem('fighterWinsP2')) || 0;
  const w1 = document.getElementById('winsP1');
  const w2 = document.getElementById('winsP2');
  if (w1) w1.textContent = p1Wins;
  if (w2) w2.textContent = p2Wins;
}

function buyItem(itemType, price) {
  if (!gameState) { showNotification('game not loaded yet!', 2000); return; }
  if (gameState.coins < price) { showNotification('not enough coins!', 2000); return; }
  if (gameState.spendCoins(price)) { 
    gameState.addToInventory(itemType, 1);
    updateShopDisplay();
    showNotification('purchased: ' + (itemType || 'item'));
  }
}

function showNotification(message, timeout = 1800) {
  const overlay = document.getElementById('modalOverlay');
  const msg = document.getElementById('modalMessage');
  const btns = document.getElementById('modalButtons');
  msg.textContent = message;
  btns.innerHTML = '';
  overlay.style.display = 'flex';
  if (timeout > 0) {
    setTimeout(() => { overlay.style.display = 'none'; }, timeout);
  }
}

function hideModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

function showItemChoice(title, message, yesLabel = 'Use', noLabel = 'Skip') {
  return new Promise((resolve) => {
    const overlay = document.getElementById('modalOverlay');
    const msg = document.getElementById('modalMessage');
    const btns = document.getElementById('modalButtons');
    msg.innerHTML = '<div style="font-size:14px; margin-bottom:10px;">' + title + '</div><div style="font-size:13px;">' + message + '</div>';
    btns.innerHTML = '';

    const yes = document.createElement('button');
    yes.className = 'btn';
    yes.style.padding = '8px 14px';
    yes.textContent = yesLabel;
    yes.onclick = () => { overlay.style.display = 'none'; resolve(true); };

    const no = document.createElement('button');
    no.className = 'btn';
    no.style.padding = '8px 14px';
    no.textContent = noLabel;
    no.onclick = () => { overlay.style.display = 'none'; resolve(false); };

    btns.appendChild(yes);
    btns.appendChild(no);
    overlay.style.display = 'flex';
  });
}

function updatePowerupHUD() {
  if (!gameState) return;
  const inv = gameState.inventory;
  const active = (gameState.activeItems && gameState.activeItems.player) || {};
  
  const defs = [
    ['pu-shield', 'shields', 'pu-shield-n', active.shield],
    ['pu-health', 'healthBoosts', 'pu-health-n', active.healthBoost],
    ['pu-damage', 'damageBoosts', 'pu-damage-n', active.damageBoost],
    ['pu-speed', 'speedBoosts', 'pu-speed-n', active.speedBoost],
    ['pu-freeze', 'timeFreezes', 'pu-freeze-n', false],
    ['pu-invinc', 'invincibilities', 'pu-invinc-n', active.invincible],
  ];
  
  defs.forEach(([id, key, nid, isActive]) => {
    const el = document.getElementById(id);
    const cn = document.getElementById(nid);
    if (!el || !cn) return;
    const count = inv[key] || 0;
    el.style.display = count > 0 ? 'flex' : 'none';
    cn.textContent = count;
    if (isActive) {
      el.classList.add('pu-active');
    } else {
      el.classList.remove('pu-active');
    }
  });
}

let selectedMode = '2p';

function selectMode(mode) {
  selectedMode = mode;
  const card2P = document.getElementById('mode2P');
  const cardCOOP = document.getElementById('modeCOOP');
  const p2Input = document.getElementById('player2NameInput');
  const diffDiv = document.getElementById('difficultySelector');
  const p2Label = document.getElementById('p2SlotLabel');
  
  if (mode === 'co-op') {
    card2P.classList.remove('active');
    cardCOOP.classList.add('active');
    diffDiv.classList.add('visible');
    p2Input.value = 'CO-Op';
    p2Input.disabled = true;
    p2Input.style.opacity = '0.4';
    if (p2Label) p2Label.textContent = 'CO-Op BOT';
  } else {
    cardCOOP.classList.remove('active');
    card2P.classList.add('active');
    diffDiv.classList.remove('visible');
    if (p2Input.value === 'CO-Op') p2Input.value = '';
    p2Input.disabled = false;
    p2Input.style.opacity = '1';
    if (p2Label) p2Label.textContent = 'PLAYER 2';
  }
}

window.onload = function() {
  const savedPlayer1Name = localStorage.getItem('player1Name');
  const savedPlayer2Name = localStorage.getItem('player2Name');
  
  if (savedPlayer1Name) {
    document.getElementById('player1NameInput').value = savedPlayer1Name;
  }
  if (savedPlayer2Name && savedPlayer2Name !== 'CO-Op') {
    document.getElementById('player2NameInput').value = savedPlayer2Name;
  }
  
  timer = 30;
  timerId = null;
  
  localStorage.setItem('fighterCoins', '500');
  localStorage.setItem('fighterInventory', JSON.stringify({ shields: 0, healthBoosts: 0, damageBoosts: 0, speedBoosts: 0, timeFreezes: 0, invincibilities: 0 }));
  localStorage.setItem('fighterWinsP1', '0');
  localStorage.setItem('fighterWinsP2', '0');
  
  initGameSystems();
  
  gameState.preloadImages(() => {
    console.log('All images loaded successfully');
  });

  const idToType = {
    'pu-shield': 'shields',
    'pu-health': 'healthBoosts',
    'pu-damage': 'damageBoosts',
    'pu-speed': 'speedBoosts',
    'pu-freeze': 'timeFreezes',
    'pu-invinc': 'invincibilities'
  };
  
  setTimeout(() => {
    Object.keys(idToType).forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.style.cursor = 'pointer';
      el.onclick = function() {
        if (!window.gameState || !window.gameState.aiEnabled) return;
        var type = idToType[id];
        if (window.gameState.useInventoryItem && window.gameState.useInventoryItem(type)) {
          switch(type) {
            case 'shields': window.gameState.activeItems.player.shield = true; break;
            case 'healthBoosts':
              window.gameState.activeItems.player.healthBoost = true;
              window.gameState.player.health = Math.min((window.gameState.player.health || 300) + 50, 1000);
              break;
            case 'damageBoosts': window.gameState.activeItems.player.damageBoost = true; break;
            case 'speedBoosts': window.gameState.activeItems.player.speedBoost = true; break;
            case 'timeFreezes':
              window.gameState.timerFrozen = true;
              setTimeout(function() { if (window.gameState) window.gameState.timerFrozen = false; }, 5000);
              break;
            case 'invincibilities':
              window.gameState.activeItems.player.invincible = true;
              window.gameState.invincibleTimers.player = 240;
              break;
          }
          if (window.showNotification) window.showNotification('Powerup used!');
          if (window.updatePowerupHUD) window.updatePowerupHUD();
        }
      };
    });
  }, 800);
};

window.startGame = startGame;
window.startNewGame = startNewGame;
window.restartGame = restartGame;
window.decreaseTimer = decreaseTimer;
window.determineWinner = determineWinner;
window.returnToMenu = returnToMenu;
window.showMatchStats = showMatchStats;
window.rectangularCollision = rectangularCollision;
window.showHowToPlay = showHowToPlay;
window.backToMenu = backToMenu;
window.showShop = showShop;
window.closeShop = closeShop;
window.buyItem = buyItem;
window.showNotification = showNotification;
window.showItemChoice = showItemChoice;
window.updatePowerupHUD = updatePowerupHUD;
window.launchConfetti = launchConfetti;
window.selectMode = selectMode;
window.startRound = startRound;