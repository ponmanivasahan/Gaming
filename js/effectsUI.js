// js/effectsUI.js

class EffectsUI {
  constructor() {
    this.x = 10;
    this.y = 80;
    this.iconSize = 32;
    this.spacing = 40;
  }

  draw(ctx, scale) {
    if (!window.gameState || !window.gameState.powerupManager) return;
    const activeEffects = window.gameState.powerupManager.getActiveEffects();
    if (!activeEffects || activeEffects.length === 0) return;

    ctx.save();
    ctx.scale(scale, scale);

    // BUG FIX: was "activeaeffects" (typo) → "activeEffects"
    activeEffects.forEach((effect, index) => {
      const x = this.x;
      const y = this.y + (index * this.spacing);

      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(x, y, 100, this.iconSize);

      this.drawEffectIcon(ctx, x + 2, y + 2, this.iconSize - 4, effect.type);

      const maxDuration = this.getMaxDuration(effect.type);
      const percent = effect.timeRemaining / maxDuration;

      ctx.fillStyle = this.getEffectColor(effect.type);
      ctx.fillRect(x + this.iconSize + 4, y + 4, (100 - this.iconSize - 8) * percent, this.iconSize - 8);

      ctx.strokeStyle = this.getEffectColor(effect.type);
      ctx.lineWidth = 2;
      ctx.strokeRect(x + this.iconSize + 4, y + 4, 100 - this.iconSize - 8, this.iconSize - 8);

      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      const timeText = Math.ceil(effect.timeRemaining) + 's';
      ctx.fillText(timeText, x + this.iconSize + 4 + (100 - this.iconSize - 8) / 2, y + this.iconSize / 2 + 4);
    });

    ctx.restore();
  }

  drawEffectIcon(ctx, x, y, size, type) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;

    switch (type) {
      case 'speed':
        ctx.fillStyle = '#44ff44';
        ctx.beginPath();
        // BUG FIX: "ctx.moveto" → "ctx.moveTo" (case-sensitive)
        ctx.moveTo(centerX, centerY - size * 0.4);
        ctx.lineTo(centerX - size * 0.15, centerY);
        ctx.lineTo(centerX + size * 0.05, centerY);
        ctx.lineTo(centerX - size * 0.05, centerY + size * 0.4);
        ctx.lineTo(centerX + size * 0.15, centerY + size * 0.05);
        ctx.lineTo(centerX - size * 0.05, centerY + size * 0.05);
        ctx.closePath();
        ctx.fill();
        break;

      case 'damage':
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(centerX - 1, centerY - size * 0.4, 2, size * 0.6);
        ctx.fillRect(centerX - size * 0.15, centerY + size * 0.2, size * 0.3, 2);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size * 0.4);
        ctx.lineTo(centerX - size * 0.1, centerY - size * 0.3);
        ctx.lineTo(centerX + size * 0.1, centerY - size * 0.3);
        ctx.closePath();
        ctx.fill();
        break;

      case 'shield':
        ctx.fillStyle = '#4444ff';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size * 0.4);
        ctx.lineTo(centerX + size * 0.35, centerY - size * 0.1);
        ctx.lineTo(centerX + size * 0.35, centerY + size * 0.15);
        ctx.quadraticCurveTo(centerX, centerY + size * 0.45, centerX, centerY + size * 0.45);
        ctx.quadraticCurveTo(centerX, centerY + size * 0.45, centerX - size * 0.35, centerY + size * 0.15);
        ctx.lineTo(centerX - size * 0.35, centerY - size * 0.1);
        ctx.closePath();
        ctx.fill();
        break;

      case 'invincibility':
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'timeFreeze':
        ctx.strokeStyle = '#64c8ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.38, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX, centerY - size * 0.25);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + size * 0.15, centerY);
        ctx.stroke();
        break;
    }
  }

  getEffectColor(type) {
    switch (type) {
      case 'speed':        return '#44ff44';
      case 'damage':       return '#ff8800';
      case 'shield':       return '#4444ff';
      case 'invincibility':return '#FFD700';
      case 'timeFreeze':   return '#64c8ff';
      default:             return '#ffffff';
    }
  }

  getMaxDuration(type) {
    switch (type) {
      case 'speed':        return 10;
      case 'damage':       return 5;
      case 'invincibility':return 4;
      case 'timeFreeze':   return 5;
      default:             return 5;
    }
  }
}