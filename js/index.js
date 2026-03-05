let gameState;
let gameRenderer;
let gameInitializer;
let combactSystem;

function initGameSystems(){
    gameState=new GameState();
    gameState=initCanvas();
    gameState.inputHandler=new InputHandler(gameState);
    combactSystem=new CombactSystem(gameState);
    gameState.combactSystem=combactSystem;
    gameRenderer=new gameRenderer(gameState);
    gameState.renderer=gameRenderer;
    gameInitalizer=new GameInitalizer(gameState);

    window.gameState=gameState;
    console.log('Game systeme initalized successfully');
}

function startGame(){
    const p1Input=doocument.getElementById('player1NameInput');
    const p2Input=document.getElementById('player2NameInput');
    const isCOOP=window.selectMode=='co-op';
    const player1Name=(p1Input ? p1Input.value.trim() : '') || 'Player 1';
    const player2Name=isCOOP ? 'CO-op' : ((p2Input ? p2Input.value.trim() : '') || 'Player2');
    localStorage.setItem('player1Name',player1Name);
    localStorage.setItem('player2Name',player2Name);

    const p1Label=document.getElementById('player1NameLabel');
    const p2Label=document.getElementById('player2NameLabel');
    if(p1Label) p1Label.textContent=player1Name;
    if(p2Label) p2Label.textContent=player2Name;

    document.getElementById('startScreen').style.display='none';
    document.getElementById('gameContainer').style.display='block';

    const loadEl=document.getElementById('loadingScreen');
    if(loadEl) loadEl.style.display='block';

    setTimeout(()=>{
        if(loadEl) loadEl.style.display='none';
        startNewGame();
    },120);
}
function startNewGame(){
    if(!gameState){
        initGameSystems();
    }
    gameInitalizer.initGame();
}

// function restartGame(){
//     if(gameState && gameState.animationId){
//         cancelAnimationFrame(gameState.animationId);
//     }
// }

function showHowToPlay(){
    document.getElementById('startScreen').style.display='none';
    document.getElementById('howToPlayScreen').style.display='flex';
}

window.startGame=startGame;
window.startNewGame=startNewGame;
window.showHowToPlay=showHowToPlay;