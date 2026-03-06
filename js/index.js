let gameState;
let gameRenderer;
let gameInitializer;
let combactSystem;
function initGameSystems(){
    gameState = new GameState();
    gameState.initCanvas();  
    gameState.inputHandler=new InputHandler(gameState);
    combactSystem=new CombactSystem(gameState);
    gameState.combactSystem=combactSystem;
    const renderer=new GameRenderer(gameState);
    gameState.renderer=renderer;
    gameInitalizer=new GameInitalizer(gameState);
    window.gameState=gameState;
    // console.log('Game systems initialized successfully');
}

function startGame(){
    const player1Name ='Player 1';
    const player2Name ='Player 2';
    localStorage.setItem('player1Name',player1Name);
    localStorage.setItem('player2Name',player2Name);
    const p1Label=document.getElementById('player1NameLabel');
    const p2Label=document.getElementById('player2NameLabel');
    if(p1Label) p1Label.textContent=player1Name;
    if(p2Label) p2Label.textContent=player2Name;
      
    document.getElementById('startScreen').style.display='none';
    document.getElementById('gameContainer').style.display='block';

    const loadEl = document.getElementById('loadingScreen');
    if(loadEl) loadEl.style.display = 'block';

    setTimeout(()=>{
        if(loadEl) loadEl.style.display = 'none';
        startNewGame();
    },120);
}
function startNewGame(){
    if(!gameState){
        initGameSystems();
    }
    gameInitalizer.initGame();
}

function showHowToPlay(){
    document.getElementById('startScreen').style.display='none';
    document.getElementById('howToPlayScreen').style.display='flex';
}
  
function backToMenu(){
    document.getElementById('howToPlayScreen').style.display='none';
    document.getElementById('startScreen').style.display='flex';
}
window.startGame=startGame;
window.startNewGame=startNewGame;
window.showHowToPlay=showHowToPlay;
window.backToMenu=backToMenu;