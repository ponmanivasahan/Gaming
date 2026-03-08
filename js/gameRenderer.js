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


    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    if (gs.background && gs.background.image && gs.background.image.complete && gs.background.image.naturalWidth > 0) {
      ctx.drawImage(gs.background.image, 0, 0, canvas.width, canvas.height);
    }
    if (gs.isPaused) {
      if (gs.player) gs.player.draw();
      if (gs.enemy)  gs.enemy.draw();
      this._drawPauseMenu(ctx, canvas);
      return;
    }
    if (gs.player) gs.player.update();
    if (gs.enemy) gs.enemy.update();

    if (gs.gameStarted && gs.player && gs.enemy) {
      const keys = gs.inputHandler ? gs.inputHandler.keys : null;
      const player = gs.player;
      const enemy = gs.enemy;
      
      if (player && !player.dead && keys) {
        player.velocity.x = 0;
        
        if (keys.d.pressed && player.lastKey === 'd') { 
          player.velocity.x = player.speedBoostActive ? 8.5 : 5; 
          player.switchSprite('run'); 
        } else if (keys.a.pressed && player.lastKey === 'a') { 
          player.velocity.x = player.speedBoostActive ? -8.5 : -5; 
          player.switchSprite('run'); 
        } else { 
          player.switchSprite('idle'); 
        }


        if (player.velocity.y < 0) {
          player.switchSprite('jump');
        } else if (player.velocity.y > 0) {
          player.switchSprite('fall');
        }
        

        player.facing = player.position.x < enemy.position.x ? 1 : -1;
        player.isBlocking = keys.Shift?.pressed || false;
      }

      if (enemy && !enemy.dead && keys) {
        enemy.velocity.x = 0;
        
        if (keys.ArrowRight?.pressed && enemy.lastKey === 'ArrowRight') { 
          enemy.velocity.x = 5; 
          enemy.switchSprite('run'); 
        } else if (keys.ArrowLeft?.pressed && enemy.lastKey === 'ArrowLeft') { 
          enemy.velocity.x = -5; 
          enemy.switchSprite('run'); 
        } else { 
          enemy.switchSprite('idle'); 
        }

        if (enemy.velocity.y < 0) {
          enemy.switchSprite('jump');
        } else if (enemy.velocity.y > 0) {
          enemy.switchSprite('fall');
        }
        
        enemy.facing = enemy.position.x > player.position.x ? 1 : -1;
        enemy.isBlocking = keys.Control?.pressed || false;
      }

      if (gs.combatSystem) {
        gs.combatSystem.detectCollisions();
      }

      this._updateHealthUI(player, enemy);
      
      this._drawBlockIndicators(ctx, player, enemy);
    

      if (!gs.gameEnding && ((player && player.dead) || (enemy && enemy.dead))) {
        gs.gameEnding = true;
        setTimeout(() => {
          if (typeof window.determineWinner === 'function') {
            window.determineWinner({ player, enemy });
          }
        }, 1000);
      }
    }   
  }

  _updateHealthUI(player, enemy) {
    if (player) {
      const el = document.getElementById('playerHealth');
      if (el) {
        const percent = (player.health / player.maxHealth) * 100;
        el.style.width = Math.max(0, percent) + '%';
      }
    }
    if (enemy) {
      const el = document.getElementById('enemyHealth');
      if (el) {
        const percent = (enemy.health / enemy.maxHealth) * 100;
        el.style.width = Math.max(0, percent) + '%';
      }
    }
  }

  _drawBlockIndicators(ctx, player, enemy) {
    if (!player || !enemy) return;
    
    ctx.font = 'bold 20px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 10;
    
    if (player.isBlocking) {
      ctx.fillStyle = '#4d79ff';
      ctx.fillText('BLOCK', player.position.x + player.width / 2, player.position.y - 30);
    }
    if (enemy.isBlocking) {
      ctx.fillStyle = '#ff5555';
      ctx.fillText('BLOCK', enemy.position.x + enemy.width / 2, enemy.position.y - 30);
    }
    
    ctx.shadowBlur = 0;
  }


  _drawPauseMenu(ctx, canvas) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white'; 
    ctx.textAlign = 'center';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 64px Rajdhani, sans-serif';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 80);
    
    ctx.shadowBlur = 0;
    ctx.font = '24px Rajdhani, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    
    const lines = [
      'ESC - Resume',
      'M - Match Stats',
      'Q - Quit to Menu'
    ];
    
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, canvas.height / 2 + i * 40);
    });
  }
}