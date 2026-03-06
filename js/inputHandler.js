class InputHandler{
    constructor(gameState){
        this.gameState =gameState;
        this.keys ={
            //Player 1
            a:{pressed:false},
            d:{pressed:false},
            Shift:{pressed:false },  
            //Player 2
            ArrowLeft:{pressed:false},
            ArrowRight:{pressed:false},
            Control:{pressed:false}
        };     
        this.setupEventListeners();    
    } 
    setupEventListeners(){
        window.addEventListener('keydown',(event)=>{
 
            if (event.key === 'Escape'){
                if(this.gameState.showMatchStats){
                    this.gameState.showMatchStats =false;
                    this.gameState.isPaused =false;
                    return;
                }
                if(this.gameState.gameStarted && !this.gameState.isReplaying && !this.gameState.gameEnding){
                    this.gameState.isPaused = !this.gameState.isPaused;
                }
                return;
            }
            if (event.ctrlKey && event.key.toLowerCase() === 'm'){
                if (this.gameState.gameStarted && !this.gameState.isReplaying && !this.gameState.gameEnding) {
                    this.gameState.isPaused = true;
                    this.gameState.showMatchStats = true;
                    if (window.showMatchStats) window.showMatchStats();
                }
                return;
            }
            if (this.gameState.isPaused){
                if (event.key.toLowerCase() ==='r'){
                    this.gameState.isPaused = false;
                    this.gameState.isReplaying = true;
                    this.gameState.replayIndex = 0;
                }
                else if (event.key.toLowerCase() ==='m'){
                    this.gameState.showMatchStats = true;
                    if (window.showMatchStats) window.showMatchStats();
                }
                else if (event.key.toLowerCase() ==='q'){
                    this.gameState.isPaused = false;
                    if (window.returnToMenu) window.returnToMenu();
                }
                return;
            }

            if (!this.gameState.gameStarted) return;
    //player1
               if(!this.gameState.player || this.gameState.player.dead) return;

            switch (event.key){
                case 'd':
                    this.keys.d.pressed = true;
                    this.gameState.player.lastKey = 'd';
                    break;
                case 'a':
                    this.keys.a.pressed = true;
                    this.gameState.player.lastKey = 'a';
                    break;
                case 'w':
                    this.gameState.player.velocity.y = -20;
                    break;
                case 'Shift':
                    this.keys.Shift.pressed = true;
                    break;
                case ' ':
                    this.gameState.player.attack();
                    break;
                case 'e':
                case 'E':
                    if (this.gameState.player.specialAttack) {
                        this.gameState.player.specialAttack();
                    }
                    break;

                //Player 2 
                case 'ArrowRight':
                    if (this.gameState.enemy && !this.gameState.enemy.dead) {
                        this.keys.ArrowRight.pressed = true;
                        this.gameState.enemy.lastKey = 'ArrowRight';
                    }
                    break;
                case 'ArrowLeft':
                    if (this.gameState.enemy && !this.gameState.enemy.dead) {
                        this.keys.ArrowLeft.pressed = true;
                        this.gameState.enemy.lastKey = 'ArrowLeft';
                    }
                    break;
                case 'ArrowUp':
                    if (this.gameState.enemy && !this.gameState.enemy.dead) {
                        this.gameState.enemy.velocity.y = -20;
                    }
                    break;
                case 'ArrowDown':
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
                    if (this.gameState.enemy && this.gameState.enemy.specialAttack) {
                        this.gameState.enemy.specialAttack();
                    }
                    break;
            }
        });
        window.addEventListener('keyup',(event)=>{
            switch (event.key){
                //player 1
                case 'a':this.keys.a.pressed =false;break;
                case 'd':this.keys.d.pressed =false;break;
                case 'Shift':this.keys.Shift.pressed =false;break;
                //player 2
                case 'ArrowLeft':this.keys.ArrowLeft.pressed =false;break;
                case 'ArrowRight':this.keys.ArrowRight.pressed=false;break;
                case 'Control':this.keys.Control.pressed=false;break;
            }
        });
    }
}