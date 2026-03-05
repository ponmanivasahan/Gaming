class GameInitalizer{
    constructor(gameState){
        this.gameState=gameState;

    }

    startFightCountdown(){
        const countdown=document.getElementById('fightCountdown');
        countdown.style.display='block';
        countdown.innerHTML='Ready';

        setTimeout(()=>{
            countdown.innerHTML='3';
            setTimeout(()=>{
                countdown.innerHTML='2';
                setTimeout(()=>{
                    countdown.innerHTML='1';
                    setTimeout(()=>{
                        countdown.innerHTML='Fight!';
                        setTimeout(()=>{
                            countdown.style.display='none';
                            this.gameState.gameStarted=true;
                            if(window.decreaseTimer) decreaseTimer();
                            if(this.gameState.renderer) this.gameState.renderer.animate();
                        },500)
                    },1000);
                },1000);
            },1000);
        },1000);
    }

    async initGame(){
        this.gameState.reset();
        if(!this.gameState.canvas || ! this.gameState.ctx){
            this.gameState.initCanvas();
        }
        this.gameState.background=new Sprite({
            position:{x:0,y:0},
            imageSrc:'./images/background1.png'
        });

        this.gameState.player=new Fighter({
            position:{x:0,y:0},
            velocity:{x:0,y:0},
            offset:{x:0,y:0},
            imageSrc:'./images/samuraiMack/Idle.png',
            framesMax:8,
            scale:2.5,
            offset:{x:215,y:157},
            sprites:{
                idle:{
                    imageSrc:'./images/samuraiMack/Idle.png',
                    framesMax:8
                },
                run:{
                    imageSrc:'./images/samuraiMack/Run.png',
                    framesMax:8
                },
                jump:{
                    imageSrc:'./images/samuraiMack/Jump.png',
                    framesMax:2
                },
                fall:{
                    imageSrc:'./images/samuraiMack/Fall.png',
                    framesMax:2
                },
                attack1:{
                     imageSrc:'./images/samuraiMack/Attack1.png',
                     framesMax:6
                },
                 takeHit:{
                    imageSrc:'.images/samuraiMack/Take Hit- white silhouette.png',
                    framesMax:4
                },
                death:{
                    imageSrc:'./images/samuraiMack/Death.png',
                    framesMax:6
                }
            },
            attackBox:{
                offset:{x:100,y:50},
                width:160,
                height:50
            }
        });

        this.gameState.enemy=new Fighter({
            position:{x:400,y:100},
            velocity:{x:0,y:0},
            color:'blue',
            facing:1,
            offset:{x:-50,y:0},
            imageSrc:'./images/kenji/Idle.png',
            framesMax:4,
            scale:2.5,
            offset:{x:215,y:167},
            sprites:{
                idle:{
                    imageSrc:'./images/kenji/Idle.png',
                    framesMax:4
                },
                run: {
                   imageSrc: './images/kenji/Run.png',
                    framesMax: 8
              },   
               jump: {
                   imageSrc: './images/kenji/Jump.png',          
                    framesMax: 2
             },            
              fall: {      
                  imageSrc: './images/kenji/Fall.png',
                   framesMax: 2
               },
              attack1: {
                 imageSrc: './images/kenji/Attack1.png',
                 framesMax: 4
              },
              takeHit: {
                 imageSrc: './images/kenji/Take hit.png',
                 framesMax: 3
             },
              death: {
                  imageSrc: './images/kenji/Death.png',
                  framesMax: 7
               }         
             },       
            attackBox: {    
                offset: { x: -170, y: 50 },
               width: 170,
               height: 50
      },           
});
    }
}    