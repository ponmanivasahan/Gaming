// js/gameRenderer.js
class GameRenderer {
  constructor(gameState) {
    this.gameState = gameState;
    this.lastTimestamp=null;
    this.effectsUI=typeof EffectsUI==='function' ? new EffectsUI() : null;
  }

  animate() {
    const gs = this.gameState;
    const ctx = gs.ctx;
    const canvas = gs.canvas;
    
    if (!gs || !ctx || !canvas) return;
    const now=performance.now();
    const rawDelta=this.lastTimestamp ?(now-this.lastTimestamp)/1000:0;
    const delta=Math.min(rawDelta,0.05);
    this.lastTimestamp=now;
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

    if (!gs.gameStarted) {
      if (gs.player) gs.player.draw();
      if (gs.enemy) gs.enemy.draw();
      if (gs.bloodEffects && gs.bloodEffects.length) {
        this._drawBloodEffects(ctx,delta);
      }
      return;
    }

    if (gs.player) gs.player.update();
    if (gs.enemy) gs.enemy.update();

    if (gs.bloodEffects && gs.bloodEffects.length) {
      this._drawBloodEffects(ctx,delta);
    }

    if (gs.player && gs.enemy) {
      const keys = gs.inputHandler ? gs.inputHandler.keys : null;
      const player = gs.player;
      const enemy = gs.enemy;
      if (gs.powerupManager) {
        gs.powerupManager.update(delta);
      }

      const direction = Math.sign(enemy.position.x - player.position.x) || 1;
      player.facing = direction;
      enemy.facing  = -direction;

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
        
        player.isBlocking = keys.Shift?.pressed || false;
      }

      if (enemy && !enemy.dead && keys) {
        enemy.velocity.x = 0;
        
        if (keys.ArrowRight?.pressed && enemy.lastKey === 'ArrowRight') { 
          enemy.velocity.x = enemy.speedBoostActive ? 8.5 : 5; 
          enemy.switchSprite('run'); 
        } else if (keys.ArrowLeft?.pressed && enemy.lastKey === 'ArrowLeft') { 
          enemy.velocity.x = enemy.speedBoostActive ? -8.5 : -5; 
          enemy.switchSprite('run'); 
        } else { 
          enemy.switchSprite('idle'); 
        }   

        if (enemy.velocity.y < 0) {
          enemy.switchSprite('jump');
        } else if (enemy.velocity.y > 0) {
          enemy.switchSprite('fall');
        }
        
        enemy.isBlocking = keys.Control?.pressed || false;
      }

      if (gs.combatSystem) {
        gs.combatSystem.detectCollisions();
      }

      this._updateHealthUI(player, enemy);
      
      this._drawBlockIndicators(ctx, player, enemy);
      if(this.effectsUI){
        this.effectsUI.draw(ctx,1);
      }
    

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

  _drawBloodEffects(ctx,delta){
    if(!this.gameState || !this.gameState.bloodEffects) return;
    const effects=this.gameState.bloodEffects;
    for(let i=effects.length-1;i>=0;i--){
      const e=effects[i];
      e.age+=delta;
      const t=Math.min(1,e.age/e.life);
      const alpha = Math.max(0, 1 - t);
      const radius = e.r * (1 - t) * 0.55;

      ctx.save();
      ctx.globalAlpha = alpha;
      const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, radius);
      grad.addColorStop(0, 'rgba(255, 80, 80, 0.95)');
      grad.addColorStop(0.35, 'rgba(255, 40, 40, 0.65)');
      grad.addColorStop(0.65, 'rgba(220, 20, 20, 0.35)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = `rgba(255, 100, 100, ${Math.max(0, alpha - 0.2)})`;
      ctx.beginPath();
      ctx.arc(e.x, e.y, radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      if(e.age>=e.life){
        effects.splice(i,1);
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
      'Q - Quit to Menu'
    ];
    
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, canvas.height / 2 + i * 40);
    });
  }
}