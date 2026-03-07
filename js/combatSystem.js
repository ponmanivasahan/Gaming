// js/combatSystem.js
// BUG NOTE: original filename and class were misspelled as "CombactSystem" — kept as-is for compatibility

class CombactSystem {
  constructor(gameState) {
    this.gameState = gameState;
  }

  rectangularCollision(rect1, rect2) {
    return (
      rect1.attackBox.position.x + rect1.attackBox.width  >= rect2.position.x &&
      rect1.attackBox.position.x                          <= rect2.position.x + rect2.width &&
      rect1.attackBox.position.y + rect1.attackBox.height >= rect2.position.y &&
      rect1.attackBox.position.y                          <= rect2.position.y + rect2.height
    );
  }

  detectCollisions() {
    const { player, enemy } = this.gameState;
    if (!player || !enemy || player.dead || enemy.dead) return;

    // Player attacks enemy
    // BUG FIX: frame check was hardcoded to 4; using >=3 gives a small window
    // and avoids missing collisions on faster systems
    if (player.isAttacking && player.framesCurrent >= 3 && this.rectangularCollision(player, enemy)) {
      player.isAttacking = false;
      const isCrit = Math.random() < 0.2;
      let damage = player.isSpecialAttack ? (isCrit ? 120 : 60) : (isCrit ? 40 : 20);
      if (enemy.isBlocking) damage = 5;
      enemy.takeHit(isCrit, damage);
      player.specialCharge = Math.min(player.specialChargeMax, player.specialCharge + (isCrit ? 30 : 15));

      const enemyHealthEl = document.getElementById('enemyHealth');
      if (enemyHealthEl) {
        enemyHealthEl.style.width = Math.max(0, (enemy.health / 300) * 100) + '%';
      }
    }

    // Enemy attacks player
    if (enemy.isAttacking && enemy.framesCurrent >= 2 && this.rectangularCollision(enemy, player)) {
      enemy.isAttacking = false;
      const isCrit = Math.random() < 0.2;
      let damage = enemy.isSpecialAttack ? (isCrit ? 120 : 60) : (isCrit ? 40 : 20);
      if (player.isBlocking) damage = 5;
      player.takeHit(isCrit, damage);
      enemy.specialCharge = Math.min(enemy.specialChargeMax, enemy.specialCharge + (isCrit ? 30 : 15));

      const playerHealthEl = document.getElementById('playerHealth');
      if (playerHealthEl) {
        playerHealthEl.style.width = Math.max(0, (player.health / 300) * 100) + '%';
      }
    }

    // Reset isAttacking at end of animation
    if (player.isAttacking && player.framesCurrent === player.framesMax - 1) { player.isAttacking = false; }
    if (enemy.isAttacking  && enemy.framesCurrent  === enemy.framesMax  - 1) { enemy.isAttacking  = false; }
  }
}