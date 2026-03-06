class Sprite{
  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset ={ x: 0, y: 0 },
    facing = 1
  }){
    this.position = position;
    this.width = 50;
    this.height = 150;
    this.image = new Image();
    this.image.src = imageSrc; 
    this.scale = scale;
    this.framesMax = framesMax;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 5;
    this.offset = offset;
    this.facing = facing;
  }  

draw(){
    if (!window.c) return;

    let img = this.image;
    let framesMax = this.framesMax;

    // If image is broken/not loaded, fall back to idle sprite
    if (!img || !img.complete || img.naturalWidth === 0){
        const idleSprite = this.sprites && this.sprites.idle;
        if (!idleSprite || !idleSprite.image || !idleSprite.image.complete || idleSprite.image.naturalWidth === 0) return;
        img = idleSprite.image;
        framesMax = idleSprite.framesMax;  // ← use idle's OWN framesMax, not the broken sprite's
    }

    const ctx = window.c;
    const frameWidth  = img.width / framesMax;   // ← uses correct framesMax
    const frameHeight = img.height;
    const drawWidth   = frameWidth  * this.scale;
    const drawHeight  = frameHeight * this.scale;
    const drawX = this.position.x - this.offset.x;  
    const drawY = this.position.y - this.offset.y;

    if (this.facing === -1){
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
            img,
            this.framesCurrent * frameWidth, 0,
            frameWidth, frameHeight,
            -(drawX + drawWidth), drawY,
            drawWidth, drawHeight
        );
        ctx.restore();
        return;
    }

    ctx.drawImage(
        img,
        this.framesCurrent * frameWidth, 0,
        frameWidth, frameHeight,
        drawX, drawY,
        drawWidth, drawHeight
    );
}

  animateFrames(){
    this.framesElapsed++;
    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++;
      } else {
        this.framesCurrent = 0;
      }
    } 
  }

  update(){
    this.draw();
    this.animateFrames();
  }
}

class Fighter extends Sprite{
  constructor({
    position,
    velocity,
    color = 'red',
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    sprites,
    facing = 1,
    attackBox ={ offset: {}, width: undefined, height: undefined }
  }){
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      offset,
      facing
    });
    this.velocity = velocity;
    this.width = 50;
    this.height = 150;
    this.lastKey;
    this.attackBox ={
      position:{x: this.position.x, y: this.position.y},
      offset: attackBox.offset,
      width: attackBox.width,
      height: attackBox.height
    };
    this.color = color;
    this.isAttacking = false;
    this.health = 300;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 5;
    this.sprites = sprites;
    this.dead = false;
    this.combo = 0;
    this.maxCombo = 0;
    this.isBlocking = false;
    this.specialCharge = 0;
    this.specialChargeMax = 100;
    this.isSpecialAttack = false;
    
    for(const sprite in this.sprites){
    if(this.sprites[sprite]){
        this.sprites[sprite].image = new Image();
        this.sprites[sprite].image.src = this.sprites[sprite].imageSrc;
    }
}
  }

  update(){
    this.draw();
    if (!this.dead) this.animateFrames();
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    if(this.position.x < 0){
      this.position.x = 0;
      this.velocity.x = 0;
    }
    if(this.position.x + this.width > window.canvas.width){
      this.position.x = window.canvas.width - this.width;
      this.velocity.x = 0;
    }
    if(this.position.y < 50){
      this.position.y = 50;
      this.velocity.y = 0;
    }
    
    // NEW — always calculates correct floor for any canvas height
const floorY = window.canvas.height - 96;
if(this.position.y + this.height + this.velocity.y >= floorY){
    this.velocity.y = 0;
    this.position.y = floorY - this.height;   // snaps exactly to floor
} else {
    this.velocity.y += window.gravity;
}
  }

  attack(){
    this.switchSprite('attack1');
    this.isAttacking = true;
  }

  takeHit(isCritical = false, damage = null){
    const dmg = damage !== null ? damage : (isCritical ? 40 : 20);
    this.health -= dmg;
    this.combo = 0;

    if (this.health <= 0){
      this.switchSprite('death');
    } else this.switchSprite('takeHit');
  }

  specialAttack(){
    if (this.specialCharge < this.specialChargeMax || this.isAttacking || this.dead) return false;
    this.isAttacking = true;
    this.isSpecialAttack = true;
    this.specialCharge = 0;
    this.switchSprite('attack1');
    setTimeout(() => {
      this.isSpecialAttack = false;
    }, 600);
    return true;
  }

  switchSprite(sprite){
    if(this.image === this.sprites.death.image){
      if(this.framesCurrent === this.sprites.death.framesMax - 1)
        this.dead = true;
      return;
    }
    
    if(
      this.image === this.sprites.attack1.image &&
      this.framesCurrent < this.sprites.attack1.framesMax - 1
    )
      return;
      
    if(
      this.image === this.sprites.takeHit.image &&
      this.framesCurrent < this.sprites.takeHit.framesMax - 1
    )
      return;
      
    switch (sprite){
      case 'idle':
        if (this.image !== this.sprites.idle.image){
          this.image = this.sprites.idle.image;
          this.framesMax = this.sprites.idle.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case 'run':
        if(this.image !== this.sprites.run.image){
          this.image = this.sprites.run.image;
          this.framesMax = this.sprites.run.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case 'jump':
        if(this.image !== this.sprites.jump.image){
          this.image = this.sprites.jump.image;
          this.framesMax = this.sprites.jump.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case 'fall':
        if(this.image !== this.sprites.fall.image){
          this.image = this.sprites.fall.image;
          this.framesMax = this.sprites.fall.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case 'attack1':
        if(this.image !== this.sprites.attack1.image){
          this.image = this.sprites.attack1.image;
          this.framesMax = this.sprites.attack1.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case 'takeHit':
        if(this.image !== this.sprites.takeHit.image){
          this.image = this.sprites.takeHit.image;
          this.framesMax = this.sprites.takeHit.framesMax;
          this.framesCurrent = 0;
        }
        break;
      case 'death':
        if(this.image !== this.sprites.death.image){
          this.image = this.sprites.death.image;
          this.framesMax = this.sprites.death.framesMax;
          this.framesCurrent = 0;
        }     
        break;
    }
  }
}   