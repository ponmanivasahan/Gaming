class GameRenderer{
    constructor(gameState){
        this.gameState=gameState;
    }

    animate() {
        const gs=this.gameState;
        const ctx=gs.ctx;
        const canvas=gs.canvas;

        gs.animationId = requestAnimationFrame(() => this.animate());
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0,canvas.width,canvas.height);
if (gs.background && gs.background.image){
    ctx.drawImage(gs.background.image,0,0,canvas.width,canvas.height);
}
        if (!gs.gameStarted || gs.isPaused) return;

        const keys=gs.inputHandler.keys;
        const player=gs.player;
        const enemy=gs.enemy;
        // player1 movement and sprite switching
        if (player && !player.dead) {
            player.velocity.x = 0;
            if(keys.d.pressed && player.lastKey ==='d'){ player.velocity.x =  5; player.switchSprite('run'); }
            else if(keys.a.pressed && player.lastKey ==='a'){ player.velocity.x = -5; player.switchSprite('run'); }
            else{player.switchSprite('idle');}

            if (player.velocity.y < 0)player.switchSprite('jump');
            else if (player.velocity.y > 0)player.switchSprite('fall');

            player.facing =player.position.x < enemy.position.x ? 1 : -1;
            player.isBlocking =keys.Shift.pressed;
        }

       
      //Player 2 movement and sprite switching    
if (enemy && !enemy.dead){
    enemy.velocity.x = 0;
    if(keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight'){ enemy.velocity.x =  5; enemy.switchSprite('run'); }
    else if(keys.ArrowLeft.pressed  && enemy.lastKey === 'ArrowLeft'){ enemy.velocity.x = -5; enemy.switchSprite('run'); }
    else{ enemy.switchSprite('idle'); }

    if(enemy.velocity.y < 0) enemy.switchSprite('jump');
    else if(enemy.velocity.y > 0) enemy.switchSprite('fall');
    enemy.facing     = enemy.position.x > player.position.x ? 1 : -1;
    enemy.isBlocking = keys.Control.pressed;
}        if (player) player.update();
        if (enemy)  enemy.update();

        //collision detection
        if (gs.combactSystem) gs.combactSystem.detectCollisions();
      // update health bars
        this._updateHealthUI(player, enemy);

        // check round/match end
        if (!gs.gameEnding && ((player && player.dead) || (enemy && enemy.dead))){
            gs.gameEnding = true;   
            setTimeout(() =>{
                if (typeof determineWinner === 'function'){
                    determineWinner({ player, enemy });
                }
            },1000);
        }
    }

    _updateHealthUI(player,enemy){
        if (player) {
            const el = document.getElementById('playerHealth');
            if (el) el.style.width = Math.max(0, (player.health / 300) * 100) + '%';
        }
        if (enemy) {
            const el = document.getElementById('enemyHealth');
            if (el) el.style.width = Math.max(0, (enemy.health / 300) * 100) + '%';
        }
    }
}