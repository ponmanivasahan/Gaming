class CombactSystem{
    constructor(gameState){
        this.gameState=gameState;
    }
    rectangularCollision(rect1,rect2){
        return(rect1.attackBox.position.x+rect1.attackBox.width >=rect2.position.x &&
            rect1.attackBox.position.x<=rect2.position.x+rect2.width &&
            rect1.attackBox.position.y+rect1.attackBox.height>=rect2.position.y &&
            rect1.attackBox.position.y<=rect2.position.y+rect2.height
        );
    }
    detectCollisions(){
        const {player,enemy}=this.gameState;
        if(!player || !enemy) return;

        if(player.isAttacking && player.framesCurrent===4 && this.rectangularCollision(player,enemy)){
            player.isAttacking=false;
            const isCrit=Math.random()<0.2;
            let   damage    = player.isSpecialAttack ? (isCrit ? 120 : 60) : (isCrit ? 40 : 20);
            if(enemy.isBlocking) damage=5;
            enemy.takeHit(isCrit,damage);
            player.specialCharge=Math.min(player.specialChargeMax,player.specialCharge+(isCrit ?30 :15));
        }

       if (
            enemy.isAttacking &&
            enemy.framesCurrent === 2 &&
            this.rectangularCollision(enemy, player)
        ){
            enemy.isAttacking=false;
            const isCrit=Math.random()<0.2;
            let   damage    = enemy.isSpecialAttack ? (isCrit ? 120 : 60) : (isCrit ? 40 : 20);
            if(player.isBlocking) damage=5;
            player.takeHit(isCrit,damage);
            enemy.specialCharge=Math.min(enemy.specialChargeMax,enemy.specialCharge+(isCrit ?30 :15));

         }

         if(player.isAttacking  && player.framesCurrent===player.framesMax-1)player.isAttacking=false;
         if(enemy.isAttacking && enemy.framesCurrent===enemy.framesMax-1)enemy.isAttacking=false;
     }
}