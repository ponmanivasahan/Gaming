// js/combatSystem.js
class CombatSystem {
  constructor(gameState) {
    this.gameState = gameState;
  }

  rectangularCollision(rect1, rect2) {
    return (
      rect1.attackBox.position.x + rect1.attackBox.width >= rect2.position.x &&
      rect1.attackBox.position.x <= rect2.position.x + rect2.width &&
      rect1.attackBox.position.y + rect1.attackBox.height >= rect2.position.y &&
      rect1.attackBox.position.y <= rect2.position.y + rect2.height
    );
  }

  detectCollisions() {
    const { player, enemy } = this.gameState;
    if (!player || !enemy || player.dead || enemy.dead) return;

    if (player.isAttacking) {
      if (player.framesCurrent >= 2 && player.framesCurrent <= 4) {
        if (this.rectangularCollision(player, enemy)) {
          console.log("Player hit enemy!"); 
          
          if (!player.hasHit) {
            player.hasHit = true;
            
            const isCrit = Math.random() < 0.2;
            let damage = player.isSpecialAttack ? (isCrit ? 120 : 60) : (isCrit ? 40 : 20);

            if (this.gameState.activeDamageBoost) damage = Math.round(damage * 1.5);
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
              
              console.log(`Enemy took ${damage} damage, health: ${enemy.health}`);
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
      if (enemy.framesCurrent >= 1 && enemy.framesCurrent <= 3) {
        if (this.rectangularCollision(enemy, player)) {
          console.log("Enemy hit player!");
          
          if (!enemy.hasHit) {
            enemy.hasHit = true;
            
            const isCrit = Math.random() < 0.2;
            let damage = enemy.isSpecialAttack ? (isCrit ? 120 : 60) : (isCrit ? 40 : 20);

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
              
              console.log(`Player took ${damage} damage, health: ${player.health}`); 
            }
          }
        }
      }
      
      if (enemy.framesCurrent === enemy.framesMax - 1) {
        enemy.hasHit = false;
        enemy.isAttacking = false;
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