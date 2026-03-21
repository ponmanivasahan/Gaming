// js/combatSystem.js
class CombatSystem {
  constructor(gameState) {
    this.gameState = gameState;
  }

  rectangularCollision(rect1, rect2) {
    // console.log('Attack Box:',{
    //   x:rect1.attackBox.position.x,
    //   y:rect1.attackBox.position.y,
    //   width:rect1.attackBox.width,
    //   height:rect1.attackBox.height,
    //   rightEdge:rect1.attackBox.position.x+rect1.attackBox.width,
    // });
    // console.log('Target:',{
    //   x:rect2.position.x,      
    //   y:rect2.position.y,
    //   width:rect2.width,
    //   height:rect2.height,
    //   rightEdge:rect2.position.x+rect2.width
    // });
    return (
      rect1.attackBox.position.x + rect1.attackBox.width >= rect2.position.x &&
      rect1.attackBox.position.x <= rect2.position.x + rect2.width &&
      rect1.attackBox.position.y + rect1.attackBox.height >= rect2.position.y &&
      rect1.attackBox.position.y <= rect2.position.y + rect2.height
    );
  }

  _spawnBloodOnHit(attacker, target, isSpecialAttack, isCrit, damage) {
    if (!target || typeof this.gameState.addBloodEffect !== 'function') return;
    const enemyIsAttacker = attacker === this.gameState.enemy;

    const targetCenterX = target.position.x + target.width * 0.5;
    const targetCenterY = target.position.y + target.height * 0.45;
    const attackerCenterX = attacker ? (attacker.position.x + attacker.width * 0.5) : targetCenterX;
    const dir = attackerCenterX <= targetCenterX ? 1 : -1;
    const hitFromLeft = dir > 0;

    let impactX = target.position.x + (hitFromLeft ? target.width * 0.34 : target.width * 0.66);
    let impactY = target.position.y + target.height * (0.34 + Math.random() * 0.22);

    if (attacker && attacker.attackBox && attacker.attackBox.position) {
      const ab = attacker.attackBox;
      const overlapLeft = Math.max(ab.position.x, target.position.x);
      const overlapRight = Math.min(ab.position.x + ab.width, target.position.x + target.width);
      const overlapTop = Math.max(ab.position.y, target.position.y);
      const overlapBottom = Math.min(ab.position.y + ab.height, target.position.y + target.height);
      if (overlapRight > overlapLeft && overlapBottom > overlapTop) {
        impactX = overlapLeft + (overlapRight - overlapLeft) * (0.35 + Math.random() * 0.3);
        impactY = overlapTop + (overlapBottom - overlapTop) * (0.25 + Math.random() * 0.45);
      }
    }

    const attackerBoost = enemyIsAttacker ? 1.25 : 1;
    const baseIntensity = (isSpecialAttack ? 1.65 : (isCrit ? 1.3 : 1)) * attackerBoost;
    const splashCount = (isSpecialAttack ? 3 : (isCrit ? 2 : 1)) + (enemyIsAttacker ? 1 : 0);
    const damageScale = Math.min(1.35, 0.9 + (damage / 80));

    for (let i = 0; i < splashCount; i++) {
      const offsetX = (Math.random() - 0.5) * 26;
      const offsetY = (Math.random() - 0.5) * 22;
      const intensity = baseIntensity * damageScale * (0.85 + Math.random() * 0.35);
      this.gameState.addBloodEffect(impactX + offsetX, impactY + offsetY, intensity, {
        dir,
        spread: isSpecialAttack ? 1.05 : (isCrit ? 0.85 : 0.7),
        power: (isSpecialAttack ? 1.55 : (isCrit ? 1.3 : 1)) * attackerBoost
      });
    }
  }

  detectCollisions() {
    const { player, enemy } = this.gameState;
    if (!player || !enemy || player.dead || enemy.dead) return;
    if (player.isAttacking) {
      if (player.framesCurrent >= 2 && player.framesCurrent <= 4) {
        if (this.rectangularCollision(player, enemy)) {
          // console.log("Player hit enemy!");
          
          if (!player.hasHit) {
            player.hasHit = true;
            
            const isCrit = Math.random() < 0.2;
            let damage = player.isSpecialAttack ? (isCrit ? 120 : 60) : (isCrit ? 40 : 20);

            if (this.gameState.damageBoost?.player) damage = Math.round(damage * 1.5);
            if (enemy.isBlocking) damage = 5;
            if (enemy.shieldCharges > 0) {
              enemy.shieldCharges--;
              damage = 0;
              if (typeof window.showShopToast === 'function') window.showShopToast('🛡  Enemy shield absorbed hit!');
            }
            if (enemy.invincible) damage = 0;

            if (damage > 0) {
              enemy.health = Math.max(0, enemy.health - damage);
              enemy.takeHit(isCrit, damage);
              player.specialCharge = Math.min(player.specialChargeMax, player.specialCharge + (isCrit ? 30 : 15));

              this._spawnBloodOnHit(player, enemy, player.isSpecialAttack, isCrit, damage);
              if (typeof this.gameState.triggerHitFlash === 'function') {
                this.gameState.triggerHitFlash(player.isSpecialAttack ? 0.24 : 0.16);
              }
              
              // console.log(`Enemy took ${damage} damage, health: ${enemy.health}`);
            }         
          }
        }
      }
      
      if (player.framesCurrent === player.framesMax - 1) {
        player.hasHit = false;
        player.isAttacking = false;
      }
    }
    if (enemy.isAttacking) {
      // console.log('Enemy attacking, frame:', enemy.framesCurrent);
      if (enemy.framesCurrent >= 2 && enemy.framesCurrent <= 4) {
        if (this.rectangularCollision(enemy, player)) {
          // console.log(" Enemy hit player!");
          
          if (!enemy.hasHit) {
            enemy.hasHit = true;
            
            const isCrit = Math.random() < 0.2;
            let damage = enemy.isSpecialAttack ? (isCrit ? 120 : 60) : (isCrit ? 40 : 20);
            const cpuDamageMultiplier = this.gameState.getLevelConfig?.().cpu?.damageMultiplier || 1;
            damage = Math.round(damage * cpuDamageMultiplier);

            if (this.gameState.damageBoost?.enemy) damage = Math.round(damage * 1.5);
            if (player.isBlocking) damage = 5;
            if (player.shieldCharges > 0) {
              player.shieldCharges--;
              damage = 0;
              if (typeof window.showShopToast === 'function') window.showShopToast('🛡  Shield absorbed hit!');
            }
            if (player.invincible) damage = 0;

            if (damage > 0) {
              player.health = Math.max(0, player.health - damage);
              player.takeHit(isCrit, damage);
              enemy.specialCharge = Math.min(enemy.specialChargeMax, enemy.specialCharge + (isCrit ? 30 : 15));
              this._spawnBloodOnHit(enemy, player, enemy.isSpecialAttack, isCrit, damage);
              if (typeof this.gameState.triggerHitFlash === 'function') {
                this.gameState.triggerHitFlash(enemy.isSpecialAttack ? 0.24 : 0.16);
              }
              
              const playerHealthEl = document.getElementById('playerHealth');
              if (playerHealthEl) {
                const percent = (player.health / player.maxHealth) * 100;
                playerHealthEl.style.width = Math.max(0, percent) + '%';
              }
            }
          }
        } else {
          // console.log(' No collision detected');
        }
      }
      
      if (enemy.framesCurrent === enemy.framesMax - 1) {
        enemy.hasHit = false;
        enemy.isAttacking = false;
        // console.log('Enemy attack ended');
      }
    }

    if (player.isSpecialAttack && !player.isAttacking) {
      player.isSpecialAttack = false;
    }
    if (enemy.isSpecialAttack && !enemy.isAttacking) {
      enemy.isSpecialAttack = false;
    }
  }
}