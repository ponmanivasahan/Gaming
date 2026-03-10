// js/inputHandler.js
class InputHandler {
  constructor(gameState) {
    this.gameState = gameState;
    this.keys ={
      //player 1
      a:{pressed:false},  
      d:{pressed:false},    
      Shift:{pressed:false},
      //player 2
      ArrowLeft:{pressed:false},
      ArrowRight:{ pressed:false},
      Control:{pressed:false}
    };
    this.setupEventListeners();  
  }

  setupEventListeners(){
    window.addEventListener('keydown',(event) =>{
      if (event.key === 'Escape') {
        if (this.gameState.showMatchStats) {
          this.gameState.showMatchStats = false;
          this.gameState.isPaused = false;
          return;
        }
        if (this.gameState.gameStarted && !this.gameState.isReplaying && !this.gameState.gameEnding) {
          this.gameState.isPaused = !this.gameState.isPaused;
        }
        return;
      }

      if (this.gameState.isPaused) {
        if (event.key.toLowerCase() === 'r') {
          this.gameState.isPaused = false;
          this.gameState.isReplaying = true;
          this.gameState.replayIndex = 0;
        } else if (event.key.toLowerCase() === 'q') {
          this.gameState.isPaused = false;
          if (window.returnToMenu) window.returnToMenu();
        }
        return;
      }

      if (!this.gameState.gameStarted) return;
      switch (event.key) {
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
          if (this.gameState.player && !this.gameState.player.dead && this.gameState.player.isGrounded) {
            this.gameState.player.velocity.y = -20;
          }
          break;
        case 'Shift':
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
        case 'E':
          if (this.gameState.player && !this.gameState.player.dead && this.gameState.player.specialAttack) {
            this.gameState.player.specialAttack();
          }
          break;

        //player2
        case 'ArrowRight':
          event.preventDefault();
          if (this.gameState.enemy && !this.gameState.enemy.dead) {
            this.keys.ArrowRight.pressed = true;
            this.gameState.enemy.lastKey = 'ArrowRight';
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (this.gameState.enemy && !this.gameState.enemy.dead) {
            this.keys.ArrowLeft.pressed = true;
            this.gameState.enemy.lastKey = 'ArrowLeft';
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (this.gameState.enemy && !this.gameState.enemy.dead && this.gameState.enemy.isGrounded) {
            this.gameState.enemy.velocity.y = -20;
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (this.gameState.enemy && !this.gameState.enemy.dead) {
            this.gameState.enemy.attack();
          }
          break;
        case 'Control':
          if (this.gameState.enemy && !this.gameState.enemy.dead) {
            this.keys.Control.pressed = true;
          }
          break;
        case 'Enter':
          event.preventDefault();
          if (this.gameState.enemy && !this.gameState.enemy.dead && this.gameState.enemy.specialAttack) {
            this.gameState.enemy.specialAttack();
          }
          break;
      }
    });

    window.addEventListener('keyup', (event) => {
      switch (event.key) {
        // Player 1
        case 'a':this.keys.a.pressed= false; break;
        case 'd':this.keys.d.pressed = false; break;
        case 'Shift':this.keys.Shift.pressed = false; break;
        // Player 2
        case 'ArrowLeft': this.keys.ArrowLeft.pressed  = false; break;
        case 'ArrowRight':this.keys.ArrowRight.pressed = false; break;
        case 'Control': this.keys.Control.pressed    = false; break;
      }
    });
  }
}