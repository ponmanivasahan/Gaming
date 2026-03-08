// js/utils.js

function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
    rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
    rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
  );
}

let timerId;
 
function resetTimer(value = 30) {
  if (typeof timerId !== 'undefined') {
    clearTimeout(timerId);
    timerId = undefined;
  }

  window.timer = Math.max(0, value);
  const timerEl = document.querySelector('#timer');
  if (timerEl) timerEl.innerHTML = window.timer;
}

function decreaseTimer() {
  if (!window.gameState || !window.gameState.gameStarted || window.gameState.isPaused) {
    return;
  }

  if (typeof window.timer !== 'number' || isNaN(window.timer)) {
    window.timer = 30;
  }

  if (window.timer > 0) {
    if (typeof timerId !== 'undefined') {
      clearTimeout(timerId);
      timerId = undefined;
    }

    timerId = setTimeout(decreaseTimer, 1000);

    if (!window.gameState.timerFrozen) {
      window.timer = Math.max(0, window.timer - 1);
      const timerEl = document.querySelector('#timer');
      if (timerEl) timerEl.innerHTML = window.timer;
    }

    if (window.timer === 0) {
      if (typeof timerId !== 'undefined') {
        clearTimeout(timerId);
        timerId = undefined;
      }
      determineWinner({ player: window.gameState.player, enemy: window.gameState.enemy });
    }
  } else {
        if (typeof timerId !== 'undefined') {
      clearTimeout(timerId);
      timerId = undefined;
    }
  }
}


window.resetTimer = resetTimer;

function determineWinner({ player, enemy }) {
  if (!window.gameState) return;
  window.gameState.gameStarted = false;
  window.gameState.isPaused = false;

  if (typeof timerId !== 'undefined') {
    clearTimeout(timerId);
    timerId = undefined;
  }

  if (window.gameState.animationId) {
    cancelAnimationFrame(window.gameState.animationId);
    window.gameState.animationId = null;
  }

  const player1Name = localStorage.getItem('player1Name') || 'SAMURAI';
  const player2Name = localStorage.getItem('player2Name') || 'KENJI';
  const roundsNeeded = 2;

  let roundWinner = 'tie';

  if (player && enemy) {
    if (player.health > enemy.health) {
      roundWinner = 'player';
      window.gameState.rounds.player++;
      window.gameState.coins += 50;
      localStorage.setItem('fighterCoins', window.gameState.coins.toString());
    } else if (enemy.health > player.health) {
      roundWinner = 'enemy';
      window.gameState.rounds.enemy++;
    }
  }
  window.gameState.rounds.current++;

  const matchOver =
    window.gameState.rounds.player >= roundsNeeded ||
    window.gameState.rounds.enemy >= roundsNeeded ||
    window.gameState.rounds.current > window.gameState.rounds.max;

  const displayText = document.querySelector('#displayText');
  const displayMsg = document.querySelector('#displayTextMsg');

  if (displayText && displayMsg) {
    displayText.style.display = 'flex';

    if (matchOver) {
      if (window.gameState.rounds.player > window.gameState.rounds.enemy) {
        displayMsg.innerHTML = `${player1Name} wins<br><span style="font-size:0.38em;color:#FFD700;font-family:'Cinzel Decorative','Cinzel',serif;letter-spacing:4px;text-shadow:0 0 20px rgba(255,200,0,0.9);">⚔ Match Champion ⚔</span>`;
        window.gameState.coins += 250;
        localStorage.setItem('fighterCoins', window.gameState.coins.toString());
        if (typeof launchConfetti === 'function') launchConfetti();
      } else if (window.gameState.rounds.enemy > window.gameState.rounds.player) {
        displayMsg.innerHTML = `${player2Name} wins<br><span style="font-size:0.38em;color:#FFD700;font-family:'Cinzel Decorative','Cinzel',serif;letter-spacing:4px;text-shadow:0 0 20px rgba(255,200,0,0.9);">⚔ Match Champion ⚔</span>`;
        if (typeof launchConfetti === 'function') launchConfetti();
      } else {
        displayMsg.innerHTML = `Draw<br><span style="font-size:0.5em;color:#aaddff;font-family:'Cinzel Decorative','Cinzel',serif;letter-spacing:4px;">~ Match Tied ~</span>`;
      }

      setTimeout(() => {
        if (window.returnToMenu) {
          window.returnToMenu();
        }
      }, 3000);
    } else {
      if (roundWinner === 'player') {
        displayMsg.innerHTML = `${player1Name}<br><span style="font-size:0.5em;color:#FFD700;font-family:'Cinzel Decorative','Cinzel',serif;letter-spacing:3px;">Wins Round ${window.gameState.rounds.current - 1}</span>`;
      } else if (roundWinner === 'enemy') {
        displayMsg.innerHTML = `${player2Name}<br><span style="font-size:0.5em;color:#FFD700;font-family:'Cinzel Decorative','Cinzel',serif;letter-spacing:3px;">Wins Round ${window.gameState.rounds.current - 1}</span>`;
      } else {
        displayMsg.innerHTML = `Round ${window.gameState.rounds.current - 1}<br><span style="font-size:0.5em;color:#aaddff;font-family:'Cinzel Decorative','Cinzel',serif;letter-spacing:3px;">~ A Tie ~</span>`;
      }

      setTimeout(() => {
        if (displayText) displayText.style.display = 'none';
        if (window.startRound) {
          window.startRound();
        }
      }, 2000);
    }
  }

  if (typeof updateShopDisplay === 'function') updateShopDisplay();
}

function launchConfetti() {
  const COLORS = ['#ff4444','#ff8800','#ffdd00','#44ff66','#44aaff','#aa44ff','#ff44cc','#ffffff','#ff6699','#00ffcc'];
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '2000';

  const ctx = canvas.getContext('2d');
  const particles = [];
  const count = 150;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 8,
      vy: 2 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.1,
      w: 8 + Math.random() * 10,
      h: 4 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.8 + Math.random() * 0.2,
      gravity: 0.1,
      fade: 0.005 + Math.random() * 0.005
    });
  }

  let frame;
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rot += p.rotV;
      p.alpha -= p.fade;
      if (p.alpha <= 0) return;
      if (p.y < canvas.height + 50) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (alive) {
      frame = requestAnimationFrame(drawConfetti);
    } else {
      canvas.style.display = 'none';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  if (frame) cancelAnimationFrame(frame);
  drawConfetti();
}