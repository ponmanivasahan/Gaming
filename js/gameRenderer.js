// js/gameRenderer.js

class GameRenderer {
  constructor(gameState) {
    this.gameState = gameState;
  }       

  animate() {
    const gs = this.gameState;
    const ctx = gs.ctx;
    const canvas = gs.canvas;
    if (!gs || !ctx || !canvas) return;

    gs.animationId = requestAnimationFrame(() => this.animate());

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (gs.background && gs.background.image && gs.background.image.complete && gs.background.image.naturalWidth > 0) {
      ctx.drawImage(gs.background.image, 0, 0, canvas.width, canvas.height);
    }

    // Draw pause overlay
    if (gs.isPaused) {
      // Draw fighters in their current pose
      if (gs.player) gs.player.draw();
      if (gs.enemy)  gs.enemy.draw();
      this._drawPauseMenu(ctx, canvas);
      return;
    }

    if (!gs.gameStarted || !gs.player || !gs.enemy) {
      if (gs.player) gs.player.draw();
      if (gs.enemy)  gs.enemy.draw();
      return;
    }

    const keys   = gs.inputHandler ? gs.inputHandler.keys : null;
    const player = gs.player;
    const enemy  = gs.enemy;

    // --- Player 1 movement & sprite ---
    if (player && !player.dead && keys) {
      player.velocity.x = 0;
      if      (keys.d.pressed && player.lastKey === 'd') { player.velocity.x =  5; player.switchSprite('run'); }
      else if (keys.a.pressed && player.lastKey === 'a') { player.velocity.x = -5; player.switchSprite('run'); }
      else { player.switchSprite('idle'); }

      if (player.velocity.y < 0) player.switchSprite('jump');
      else if (player.velocity.y > 0) player.switchSprite('fall');

      // facing: 1 = face right (normal). Player on left → face right toward enemy.
      player.facing = player.position.x < enemy.position.x ? 1 : -1;
      player.isBlocking = keys.Shift.pressed;
    }

    // --- Player 2 movement & sprite ---
    if (enemy && !enemy.dead && keys) {
      enemy.velocity.x = 0;
      if      (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') { enemy.velocity.x =  5; enemy.switchSprite('run'); }
      else if (keys.ArrowLeft.pressed  && enemy.lastKey === 'ArrowLeft')  { enemy.velocity.x = -5; enemy.switchSprite('run'); }
      else { enemy.switchSprite('idle'); }

      if (enemy.velocity.y < 0) enemy.switchSprite('jump');
      else if (enemy.velocity.y > 0) enemy.switchSprite('fall');

      // facing: -1 mirrors the sprite (faces left). Enemy on right → face left toward player.
      enemy.facing = enemy.position.x > player.position.x ? -1 : 1;
      enemy.isBlocking = keys.Control.pressed;
    }

    // Update physics & draw both fighters
    if (player) player.update();
    if (enemy)  enemy.update();

    // Collision detection
    if (gs.combactSystem) gs.combactSystem.detectCollisions();

    // Update health bars
    this._updateHealthUI(player, enemy);

    // Draw blocking indicators
    this._drawBlockIndicators(ctx, player, enemy);

    // Check for round/match end (fighter dead)
    if (!gs.gameEnding && ((player && player.dead) || (enemy && enemy.dead))) {
      gs.gameEnding = true;
      setTimeout(() => {
        if (typeof determineWinner === 'function') {
          determineWinner({ player, enemy });
        }
      }, 1000);
    }
  }

  _updateHealthUI(player, enemy) {
    if (player) {
      const el = document.getElementById('playerHealth');
      if (el) el.style.width = Math.max(0, (player.health / 300) * 100) + '%';
    }
    if (enemy) {
      const el = document.getElementById('enemyHealth');
      if (el) el.style.width = Math.max(0, (enemy.health / 300) * 100) + '%';
    }
  }

  _drawBlockIndicators(ctx, player, enemy) {
    if (!player || !enemy) return;
    ctx.font = 'bold 14px Rajdhani, sans-serif';
    ctx.textAlign = 'center';

    if (player.isBlocking) {
      ctx.fillStyle = '#4444ff';
      ctx.fillText('🛡 BLOCK', player.position.x + player.width / 2, player.position.y - 20);
    }
    if (enemy.isBlocking) {
      ctx.fillStyle = '#4444ff';
      ctx.fillText('🛡 BLOCK', enemy.position.x + enemy.width / 2, enemy.position.y - 20);
    }
  }

  _drawPauseMenu(ctx, canvas) {
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px Rajdhani, sans-serif';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 60);

    ctx.font = '22px Rajdhani, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    const lines = [
      'ESC — Resume',
      'R   — Replay last 5s',
      'M   — Match Stats',
      'Q   — Quit to Menu'
    ];
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, canvas.height / 2 + i * 32);
    });
  }
}