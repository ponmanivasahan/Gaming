// js/inputHandler.js
class InputHandler {
  constructor(gameState) {
    this.gameState = gameState;
    this.keys ={
      //player 1
      a:{pressed:false},  
      d:{pressed:false},    
      Shift:{pressed:false},

      ArrowLeft:{pressed:false},
      ArrowRight:{ pressed:false},
      Control:{pressed:false}
    };
    this.setupEventListeners();  
  }

  resetMovementKeys() {
    this.keys.a.pressed = false;
    this.keys.d.pressed = false;
    this.keys.Shift.pressed = false;
  }

  setupEventListeners(){
    window.addEventListener('keydown',(event) =>{
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (key === 'Escape') {
        if (this.gameState.showMatchStats) {
          this.gameState.showMatchStats = false;
          this.gameState.isPaused = false;
          this.resetMovementKeys();
          return;
        }
        if (this.gameState.gameStarted && !this.gameState.isReplaying && !this.gameState.gameEnding) {
          this.gameState.isPaused = !this.gameState.isPaused;
          if (this.gameState.isPaused) this.resetMovementKeys();
        }
        return;
      }

      if (this.gameState.isPaused) {
        if (key === 'r') {
          this.gameState.isPaused = false;
          this.gameState.isReplaying = true;
          this.gameState.replayIndex = 0;
        } else if (key === 'q') {
          this.gameState.isPaused = false;
          if (window.returnToMenu) window.returnToMenu();
        }
        return;
      }

      if (!this.gameState.gameStarted) return;
      if (event.repeat && (key === 'w' || key === ' ' || key === 'e')) return;

      switch (key) {
        case 'd':
          if (this.gameState.player && !this.gameState.player.dead) {
            this.keys.d.pressed = true;
            this.gameState.player.lastKey = 'd';
          }
          break;
        case 'a':
          if (this.gameState.player && !this.gameState.player.dead) {
            this.keys.a.pressed = true;
            this.gameState.player.lastKey = 'a';
          }
          break;
        case 'w':
          event.preventDefault();
          if (this.gameState.player && !this.gameState.player.dead && this.gameState.player.isGrounded) {
            this.gameState.player.velocity.y = -20;
          }
          break;
        case 'Shift':
        case 'shift':
          event.preventDefault();
          if (this.gameState.player && !this.gameState.player.dead) {
            this.keys.Shift.pressed = true;
          }
          break;
        case ' ':
          event.preventDefault(); 
          if (this.gameState.player && !this.gameState.player.dead) {
            this.gameState.player.attack();
          }
          break;
        case 'e':
          if (this.gameState.player && !this.gameState.player.dead && this.gameState.player.specialAttack) {
            this.gameState.player.specialAttack();
          }
          break;
      }
    });

    window.addEventListener('keyup', (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      switch (key) {
        // Player 1
        case 'a':this.keys.a.pressed= false; break;
        case 'd':this.keys.d.pressed = false; break;
        case 'Shift':this.keys.Shift.pressed = false; break;
        case 'shift':this.keys.Shift.pressed = false; break;
      }
    });

    window.addEventListener('blur', () => {
      this.resetMovementKeys();
      if (this.gameState.player) {
        this.gameState.player.velocity.x = 0;
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.resetMovementKeys();
    });
  }
}