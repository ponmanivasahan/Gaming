class GameState{
    constructor(){
        this.canvas=null;
        this.ctx=null;
        this.background=null;
        this.player=null;
        this.enemy=null;
        this.inputHandler=null;
        this.combactSystem=null;
        this.renderer=null;
        this.gameStarted=false;
        this.isPaused=false;
        this.isReplaying=false;
        this.replayIndex=0;
        this.gameEnding=false;
        this.showMatchStats=false;
        this.animationId=null;
        this.coinsEarned=0;
        this.powerupManager=null;
        this.activeItems={player:{},enemy:{}};
        this.gravity=0.7;
        this.rounds={player:0,enemy:0,current:1,max:3};

    }
    
   initCanvas() {
    this.canvas= document.getElementById('gameCanvas');
    this.ctx= this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;   
    this.canvas.height= window.innerHeight;
    window.canvas = this.canvas;
    window.c = this.ctx;
    window.gravity = this.gravity;
    return this;
}

    reset(){
    if(this.animationId){
        cancelAnimationFrame(this.animationId);
    }
    this.gameStarted=false;
    this.isPaused=false;
    this.isReplaying=false;
    this.replayIndex=0;
    this.gameEnding=false;
    this.showMatchStats=false;
    this.animationId=null;
    this.coinsEarned = 0;
    this.rounds ={player:0,enemy:0,current:1,max:3};
}
}