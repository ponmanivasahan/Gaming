// js/gameRenderer.js
class GameRenderer {
  constructor(gameState) {
    this.gameState = gameState;
    this.lastTimestamp=null;
    this.effectsUI=typeof EffectsUI==='function' ? new EffectsUI() : null;
    this.lastHealthPercent = { player: null, enemy: null };
    this.cpuState = {
      lastAttackAt: 0,
      lastSpecialAt: 0,
      lastJumpAt: 0,
      lastStrafeSwitchAt: 0,
      strafeDir: -1,
      blockUntil: 0
    };
  }

  resetCpuState() {
    this.cpuState.lastAttackAt = 0;
    this.cpuState.lastSpecialAt = 0;
    this.cpuState.lastJumpAt = 0;
    this.cpuState.lastStrafeSwitchAt = 0;
    this.cpuState.strafeDir = -1;
    this.cpuState.blockUntil = 0;
  }

  resetRuntimeCaches() {
    this.lastHealthPercent.player = null;
    this.lastHealthPercent.enemy = null;
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

    if (gs.hitFlash > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 20, 20, ${Math.min(gs.hitFlash, 0.28)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      gs.hitFlash = Math.max(0, gs.hitFlash - (delta * 1.8));
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

      if (enemy && !enemy.dead) {
        this._updateCpuEnemy(player, enemy, delta, now);
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

  _updateCpuEnemy(player, enemy, delta, now) {
    if (!player || !enemy) return;

    const levelCpu = this.gameState.getLevelConfig?.().cpu || {};
    const engageDistance = levelCpu.engageDistance || 220;
    const retreatDistance = levelCpu.retreatDistance || 85;
    const attackDistance = levelCpu.attackDistance || 165;
    const attackCooldownMs = levelCpu.attackCooldownMs || 760;
    const jumpChance = levelCpu.jumpChance || 0.003;
    const blockChance = levelCpu.blockChance || 0.24;
    const specialChance = levelCpu.specialChance || 0.38;
    const baseSpeed = levelCpu.moveSpeed || 4.8;
    const moveSpeed = enemy.speedBoostActive ? baseSpeed * 1.45 : baseSpeed;

    const playerCenterX = player.position.x + player.width / 2;
    const enemyCenterX = enemy.position.x + enemy.width / 2;
    const predictedPlayerX = playerCenterX + (player.velocity.x * 8);
    const dx = predictedPlayerX - enemyCenterX;
    const absDx = Math.abs(dx);
    const playerPressure = (player.isAttacking ? 1 : 0) + (Math.abs(player.velocity.x) > 4 ? 0.45 : 0);
    const enemyLosing = enemy.health < player.health;
    const adaptiveEngageDistance = engageDistance + (playerPressure * 18);
    const adaptiveRetreatDistance = retreatDistance + (enemyLosing ? 16 : 0) + (player.isAttacking ? 12 : 0);
    const adaptiveAttackDistance = attackDistance + (playerPressure * 10);
    const adaptiveAttackCooldown = Math.max(420, attackCooldownMs - (playerPressure * 90) - (enemyLosing ? 50 : 0));
    const adaptiveBlockChance = Math.min(0.78, blockChance + (player.isAttacking ? 0.25 : 0) + (player.specialCharge >= player.specialChargeMax ? 0.12 : 0));
    const adaptiveSpecialChance = Math.min(0.85, specialChance + (player.health < 120 ? 0.12 : 0));

    enemy.velocity.x = 0;

    if (absDx > adaptiveEngageDistance) {
      enemy.velocity.x = dx > 0 ? moveSpeed : -moveSpeed;
      enemy.switchSprite('run');
    } else if (absDx < adaptiveRetreatDistance) {
      enemy.velocity.x = dx > 0 ? -moveSpeed * 0.7 : moveSpeed * 0.7;
      enemy.switchSprite('run');
    } else if (player.isBlocking && absDx < adaptiveAttackDistance + 20) {
      if (now - this.cpuState.lastStrafeSwitchAt > 380) {
        this.cpuState.strafeDir = Math.random() < 0.5 ? -1 : 1;
        this.cpuState.lastStrafeSwitchAt = now;
      }
      enemy.velocity.x = this.cpuState.strafeDir * moveSpeed * 0.6;
      enemy.switchSprite('run');
    } else {
      if (now - this.cpuState.lastStrafeSwitchAt > 1200) {
        this.cpuState.strafeDir = Math.random() < 0.55 ? 0 : (Math.random() < 0.5 ? -1 : 1);
        this.cpuState.lastStrafeSwitchAt = now;
      }
      if (this.cpuState.strafeDir === 0) {
        enemy.velocity.x = 0;
        enemy.switchSprite('idle');
      } else {
        enemy.velocity.x = this.cpuState.strafeDir * moveSpeed * 0.25;
        enemy.switchSprite('run');
      }
    }

    if (enemy.velocity.y < 0) {
      enemy.switchSprite('jump');
    } else if (enemy.velocity.y > 0) {
      enemy.switchSprite('fall');
    }

    if (enemy.isGrounded && now - this.cpuState.lastJumpAt > 850 && Math.random() < jumpChance) {
      enemy.velocity.y = -18;
      this.cpuState.lastJumpAt = now;
    }

    if (now < this.cpuState.blockUntil) {
      enemy.isBlocking = true;
    } else {
      enemy.isBlocking = false;
      const shouldBlock = player.isAttacking && absDx < (adaptiveAttackDistance + 35) && Math.random() < adaptiveBlockChance;
      if (shouldBlock) {
        this.cpuState.blockUntil = now + 220 + Math.random() * 280;
        enemy.isBlocking = true;
      }
    }

    if (enemy.isAttacking) enemy.isBlocking = false;

    if (absDx <= adaptiveAttackDistance && enemy.isGrounded && !enemy.isAttacking) {
      if (now - this.cpuState.lastAttackAt >= adaptiveAttackCooldown) {
        enemy.attack();
        this.cpuState.lastAttackAt = now;
      }
    }

    const canSpecial =
      enemy.specialCharge >= enemy.specialChargeMax &&
      absDx <= adaptiveAttackDistance + 25 &&
      !enemy.isAttacking &&
      now - this.cpuState.lastSpecialAt > 2200;
    if (canSpecial && Math.random() < adaptiveSpecialChance) {
      enemy.specialAttack();
      this.cpuState.lastSpecialAt = now;
      this.cpuState.lastAttackAt = now;
    }
  }

  _updateHealthUI(player, enemy) {
    if (player) {
      const el = document.getElementById('playerHealth');
      if (el) {
        const percent = Math.max(0, (player.health / player.maxHealth) * 100);
        if (this.lastHealthPercent.player === null || Math.abs(this.lastHealthPercent.player - percent) >= 0.1) {
          el.style.width = percent + '%';
          this.lastHealthPercent.player = percent;
        }
      }
    }
    if (enemy) {
      const el = document.getElementById('enemyHealth');
      if (el) {
        const percent = Math.max(0, (enemy.health / enemy.maxHealth) * 100);
        if (this.lastHealthPercent.enemy === null || Math.abs(this.lastHealthPercent.enemy - percent) >= 0.1) {
          el.style.width = percent + '%';
          this.lastHealthPercent.enemy = percent;
        }
      }
    }
  }

  _drawBloodEffects(ctx,delta){
    if(!this.gameState || !this.gameState.bloodEffects) return;
    const effects=this.gameState.bloodEffects;
    const canvasW = this.gameState.canvas?.width || 0;
    const canvasH = this.gameState.canvas?.height || 0;
    const floorY = Math.max(0, canvasH - 18);
    for(let i=effects.length-1;i>=0;i--){
      const e=effects[i];
      e.age+=delta;
      const t=Math.min(1,e.age/e.life);
      const alpha = Math.max(0, 1 - t);
      const radius = Math.max(0.8, e.r * (1 - t) * 0.55);

      if (e.kind === 'droplet' || e.kind === 'mist') {
        if (e.kind === 'droplet') {
          e.px = e.x;
          e.py = e.y;
        }
        const drag = e.drag || 0.99;
        e.vx *= Math.pow(drag, Math.max(1, delta * 60));
        e.vy += (e.gravity || 780) * delta;
        e.x += (e.vx || 0) * delta;
        e.y += (e.vy || 0) * delta;
        if (e.kind === 'droplet' && e.y >= floorY && alpha > 0.08 && effects.length < this.gameState.maxBloodEffects) {
          effects.push({
            kind: 'stain',
            x: e.x,
            y: floorY + 0.5,
            r: Math.max(1.8, e.r * (1.2 + Math.random() * 1.2)),
            age: 0,
            life: 1.8 + Math.random() * 1.6,
            alpha: 0.55
          });
          e.age = e.life;
        }
        if (e.y > canvasH + 30 || e.x < -40 || e.x > canvasW + 40) {
          e.age = e.life;
        }
      }

      ctx.save();
      ctx.globalAlpha = alpha;

      if (e.kind === 'droplet') {
        const stretch = Math.max(1, e.elongation || 1);
        const speed = Math.hypot(e.vx || 0, e.vy || 0);
        const angle = Math.atan2(e.vy || 0.0001, e.vx || 0.0001);

        if (Number.isFinite(e.px) && Number.isFinite(e.py)) {
          ctx.strokeStyle = `rgba(95, 0, 0, ${Math.max(0.22, alpha * 0.75)})`;
          ctx.lineWidth = Math.max(1.8, e.r * 1.05);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(e.px, e.py);
          ctx.lineTo(e.x, e.y);
          ctx.stroke();
        }

        ctx.translate(e.x, e.y);
        ctx.rotate(angle);
        ctx.scale(1 + Math.min(1.8, speed / 420) * 0.55, stretch);
        ctx.fillStyle = `rgba(105, 0, 0, ${Math.max(0.34, alpha)})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(1.3, radius * 0.68), Math.max(1.3, radius * 0.98), 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(170, 18, 18, ${Math.max(0.2, alpha * 0.55)})`;
        ctx.beginPath();
        ctx.ellipse(-0.2, -0.2, Math.max(0.9, radius * 0.34), Math.max(0.9, radius * 0.46), 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.kind === 'mist') {
        ctx.fillStyle = `rgba(85, 0, 0, ${Math.max(0.2, alpha * 0.68)})`;
        ctx.beginPath();
        ctx.ellipse(e.x, e.y, radius * 1.9, radius * 1.15, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.kind === 'stain') {
        ctx.fillStyle = `rgba(48, 0, 0, ${Math.max(0.12, alpha * 0.78)})`;
        ctx.beginPath();
        ctx.ellipse(e.x, e.y, Math.max(1.8, e.r * 1.2), Math.max(1.1, e.r * 0.55), 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(90, 0, 0, ${Math.max(0.24, alpha * 0.8)})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, Math.max(1.2, radius * 1.2), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(150, 15, 15, ${Math.max(0.18, alpha * 0.42)})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, Math.max(0.7, radius * 0.65), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      if(e.age>=e.life){
        effects.splice(i,1);
      }
    }
  }

  _drawBlockIndicators(ctx, player, enemy) {
    if (!player || !enemy) return;
    if (!player.isBlocking && !enemy.isBlocking) return;
    
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