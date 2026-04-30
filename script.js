const COLORS=['Red', 'Blue', 'Green', 'Yellow','Orange', "Purple"];
const COLOR_HEX = { Red: '#ef4444', Blue: '#3b82f6', Green: '#22c55e', Yellow: '#facc15', Orange: '#f97316', Purple: '#a855f7' };
const ROWS=8,COLS=8;
const TARGET_SCORE=5000;
const START_MOVES=30;

let board=[];
let score=0;
let movesLeft=START_MOVES;
let isAnimating=false;
let selectedCell=null;
let comboCounter=0;
let maxCombo=0;

const boardEl=document.getElementById('game-board');
const scoreEl=document.getElementById('score-val');
const movesEl=document.getElementById('moves-val');
const targetEl=document.getElementById('target-val');
const progressFill=document.getElementById('progress-fill');
const comboBox=document.getElementById('combo-box');
const comboText=document.getElementById('combo-text');
const popupsEl=document.getElementById('score-popups');

function getRandomColor(){
    return COLORS[Math.floor(Math.random()*COLORS.length)]
}

function createCandy(color=null,special=null){
    const candyColor=color || getRandomColor();
    return{
        type:'candy',
        color:candyColor,
        special:special,
        img:`candyimages/${candyColor}.png`
    }
}

function initBoard(){
    board=[];
    for(let r=0;r<ROWS;r++){
        board[r]=[];
        for(let c=0;c<COLS;c++){
            board[r][c]=createCandy();
        }
    }
    let hasMatch=true;
    let safety=0;
    while(hasMatch && safety<50){
        hasMatch=false;
        for(let r=0;r<ROWS;r++){
            for(let c=0;c<COLS;c++){
                if(c>=2 && board[r][c].color===board[r][c-1].color && board[r][c].color===board[r][c-2].color){
                    board[r][c]=createCandy();
                    hasMatch=true;
                }
                if(r>=2 && board[r][c].color===board[r-1][c].color && board[r][c].color===board[r-2][c].color){
                    board[r][c]=createCandy();
                    hasMatch=true;
                }
            }
        }
        safety++;
    }
}

function findAllMatches(){
    const matches=new Set();
    //i am checking horizontal matches here
    for(let r=0;r<ROWS;r++){
        for(let c=0;c<COLS;c++){
            const color=board[r][c].color;
            if(!color) continue;
            let len=1;
            while(c+len<COLS && board[r][c+len].color===color) len++;
            if(len>=3){
                for(let i=0;i<len;i++){
                    matches.add(`${r},${c+i}`);
                }
            }
            c+=len-1;
        }
    }

    //i am checking vertical matches here
    for(let c=0;c<COLS;c++){
        for(let r=0;r<ROWS;r++){
            const color=board[r][c].color;
            if(!color) continue;
            let len=1;
            while(r+len<ROWS && board[r+len][c].color===color) len++;
            if(len>=3){
                for(let i=0;i<len;i++){
                    matches.add(`${r+i},${c}`);
                }
            }
            r+=len-1;
        }
    }
    return Array.from(matches).map(k=>{
        const [r,c]=k.split(',').map(Number);
        return {r,c};
    })
}

function getMatchShapes(matchesArray){
    const shapes=[];
    const used=new Set();
    for(const match of matchesArray){
        const key=`${match.r},${match.c}`;
        if(used.has(key)) continue;
        used.add(key);
        shapes.push({cells:[match],len:1});
    }
    return shapes;
}

function applyGravity(){
    for(let c=0;c<COLS;c++){
        let writeRow=ROWS-1;
        for(let r=ROWS-1;r>=0;r--){
            if(board[r][c]){
                if(writeRow!==r){
                    board[writeRow][c]=board[r][c];
                    board[r][c]=null;
                }
                writeRow--;
            }
        }
    }
}

function fillEmpty(){
    for(let r=0;r<ROWS;r++){
        for(let c=0;c<COLS;c++){
            if(!board[r][c]){
                board[r][c]=createCandy();
            }
        }
    }
}

function renderBoard(){
    boardEl.innerHTML='';
    for(let r=0;r<ROWS;r++){
        for(let c=0;c<COLS;c++){
         const cell=document.createElement('div');
         cell.className='cell';
         cell.dataset.row=r;
         cell.dataset.col=c;
         const candy=board[r][c];
            if(candy && candy.color){
            const img=document.createElement('img');
            img.src=candy.img;
            img.className='candy-img';
            img.draggable=false;
            cell.appendChild(img);
            if(candy.special){
                cell.classList.add('special-glow');
                if(candy.special==='color-bomb'){
                    cell.classList.add('color-bomb-cell')
                }
            }
         }
         if(selectedCell && selectedCell.r===r && selectedCell.c===c){
            cell.classList.add('selected');
         }
         boardEl.appendChild(cell);
        }
    }
}

function updateCellVisual(r, c) {
    const idx = r * COLS + c;
    const cell = boardEl.children[idx];
    if (!cell) return;
    cell.innerHTML = '';
    cell.className = 'cell';
    const candy = board[r][c];
    if (candy && candy.color) {
        const img = document.createElement('img');
        img.src = candy.img;
        img.className = 'candy-img';
        img.draggable = false;
        cell.appendChild(img);
        if (candy.special) {
            cell.classList.add('special-glow');
            if (candy.special === 'color-bomb') cell.classList.add('color-bomb-cell');
        }
    }
    if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
        cell.classList.add('selected');
    }
}

function updateUI() {
    scoreEl.textContent = score;
    movesEl.textContent = movesLeft;
    targetEl.textContent = TARGET_SCORE;
    const pct = Math.min(100, (score / TARGET_SCORE) * 100);
    progressFill.style.width = `${pct}%`;
    
    const star1 = document.getElementById('ps1');
    const star2 = document.getElementById('ps2');
    const star3 = document.getElementById('ps3');
    if (pct >= 33) star1.classList.add('lit');
    if (pct >= 66) star2.classList.add('lit');
    if (pct >= 100) star3.classList.add('lit');
}

function scorePopup(r, c, points, isBig = false) {
    const div = document.createElement('div');
    div.className = 'score-popup' + (isBig ? ' big' : '');
    div.textContent = `+${points}`;
    const cs = 52;
    const gap = 5;
    const pad = 8;
    div.style.left = `${pad + c * (cs + gap) + cs / 2}px`;
    div.style.top = `${pad + r * (cs + gap) + cs / 2}px`;
    popupsEl.appendChild(div);
    setTimeout(() => div.remove(), 1000);
}

function showCombo(combo) {
    const labels = ['', '', 'SWEET!', 'DELICIOUS!', 'SUGAR RUSH!', 'DIVINE!'];
    const label = labels[Math.min(combo, labels.length - 1)] || 'AMAZING!';
    comboText.textContent = `${label} x${combo}`;
    comboBox.classList.remove('hidden');
    setTimeout(() => comboBox.classList.add('hidden'), 1000);
}

async function animateSwap(r1, c1, r2, c2) {
    const idx1 = r1 * COLS + c1;
    const idx2 = r2 * COLS + c2;
    const cell1 = boardEl.children[idx1];
    const cell2 = boardEl.children[idx2];
    if (!cell1 || !cell2) return;
    
    const cs = 52;
    const gap = 5;
    const offset = cs + gap;
    const dr = r2 - r1;
    const dc = c2 - c1;
    
    cell1.style.transition = 'transform 0.2s ease';
    cell2.style.transition = 'transform 0.2s ease';
    cell1.style.transform = `translate(${dc * offset}px, ${dr * offset}px)`;
    cell2.style.transform = `translate(${-dc * offset}px, ${-dr * offset}px)`;
    
    await new Promise(r => setTimeout(r, 200));
    
    cell1.style.transition = '';
    cell2.style.transition = '';
    cell1.style.transform = '';
    cell2.style.transform = '';
    
    updateCellVisual(r1, c1);
    updateCellVisual(r2, c2);
}

async function animateMatches(matches, points) {
    const midR = matches.reduce((s, m) => s + m.r, 0) / matches.length;
    const midC = matches.reduce((s, m) => s + m.c, 0) / matches.length;
    scorePopup(midR, midC, points, points > 100);
    
    for (const m of matches) {
        const cell = boardEl.children[m.r * COLS + m.c];
        if (cell) cell.classList.add('match-pop');
    }
    if (matches.length >= 5) boardEl.classList.add('shake');
    await new Promise(r => setTimeout(r, 350));
    boardEl.classList.remove('shake');
}

async function processCascade() {
    let matches = findAllMatches();
    while (matches.length > 0) {
        comboCounter++;
        if (comboCounter > maxCombo) maxCombo = comboCounter;
        if (comboCounter >= 2) showCombo(comboCounter);
        
        const matchPoints = matches.length * 20;
        const bonus = comboCounter > 1 ? Math.floor(matchPoints * (comboCounter - 1) * 0.3) : 0;
        const totalPoints = matchPoints + bonus;
        score += totalPoints;
        
        await animateMatches(matches, totalPoints);
        
        for (const m of matches) {
            board[m.r][m.c] = null;
        }
        
        applyGravity();
        fillEmpty();
        renderBoard();
        updateUI();
        
        await new Promise(r => setTimeout(r, 100));
        matches = findAllMatches();
    }
}

function swapCells(r1, c1, r2, c2) {
    const temp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = temp;
}

async function trySwap(r1, c1, r2, c2) {
    if (isAnimating) return;
    isAnimating = true;
    selectedCell = null;
    
    swapCells(r1, c1, r2, c2);
    await animateSwap(r1, c1, r2, c2);
    
    const matches = findAllMatches();
    if (matches.length === 0) {
        // Invalid swap - revert
        swapCells(r1, c1, r2, c2);
        await animateSwap(r1, c1, r2, c2);
        isAnimating = false;
        return;
    }
    
    // Valid swap
    movesLeft--;
    comboCounter = 0;
    updateUI();
    
    await processCascade();
    
    isAnimating = false;
    renderBoard();
    
    // Check game end
    if (movesLeft <= 0 || score >= TARGET_SCORE) {
        checkGameEnd();
    }
}

function checkGameEnd() {
    if (score >= TARGET_SCORE) {
        showVictory();
    } else if (movesLeft <= 0) {
        showGameOver();
    }
}

function showVictory() {
    document.getElementById('v-score').textContent = score;
    document.getElementById('v-moves').textContent = movesLeft;
    document.getElementById('v-combo').textContent = `x${maxCombo}`;
    
    const pct = score / TARGET_SCORE;
    let stars = 0;
    if (pct >= 0.33) stars = 1;
    if (pct >= 0.66) stars = 2;
    if (pct >= 1.0) stars = 3;
    
    const starContainer = document.getElementById('victory-stars');
    starContainer.innerHTML = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    
    document.getElementById('victory-screen').classList.remove('hidden');
    startConfetti();
}

function showGameOver() {
    document.getElementById('go-score').textContent = score;
    document.getElementById('go-target').textContent = TARGET_SCORE;
    document.getElementById('gameover-screen').classList.remove('hidden');
}

function startGame() {
    score = 0;
    movesLeft = START_MOVES;
    comboCounter = 0;
    maxCombo = 0;
    selectedCell = null;
    isAnimating = false;
    
    initBoard();
    renderBoard();
    updateUI();
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('victory-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
}

function goToStart() {
    stopConfetti();
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('victory-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('htp-screen').classList.add('hidden');
}

// Confetti
let confettiFrame = null;
function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const colors = ['#ff6b9d', '#4ecdc4', '#ffb347', '#a855f7', '#3b82f6', '#22c55e', '#ef4444', '#facc15'];
    const particles = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2,
        rot: Math.random() * Math.PI * 2,
        rs: (Math.random() - 0.5) * 0.2,
        opacity: 1
    }));
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.rs;
            p.vy += 0.05;
            if (p.y > canvas.height) p.opacity -= 0.02;
            if (p.opacity <= 0) return;
            alive = true;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });
        if (alive) confettiFrame = requestAnimationFrame(draw);
    }
    if (confettiFrame) cancelAnimationFrame(confettiFrame);
    draw();
}

function stopConfetti() {
    if (confettiFrame) {
        cancelAnimationFrame(confettiFrame);
        confettiFrame = null;
    }
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Event handlers
function onCellClick(r, c) {
    if (isAnimating) return;
    if (!board[r][c] || !board[r][c].color) return;
    
    if (!selectedCell) {
        selectedCell = { r, c };
        renderBoard();
        return;
    }
    
    const r1 = selectedCell.r, c1 = selectedCell.c;
    const isAdjacent = (Math.abs(r - r1) + Math.abs(c - c1)) === 1;
    
    if (isAdjacent) {
        selectedCell = null;
        trySwap(r1, c1, r, c);
    } else {
        selectedCell = { r, c };
        renderBoard();
    }
}

// Board click delegation
boardEl.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    onCellClick(r, c);
});

document.getElementById('start-btn').addEventListener('click',startGame);
document.getElementById('back-btn').addEventListener('click',goToStart);
document.getElementById('replay-btn').addEventListener('click',()=>{
    stopConfetti();
    startGame();
})
document.getElementById('v-menu-btn').addEventListener('click',()=>{
    stopConfetti();
    goToStart();
})
document.getElementById('retry-btn').addEventListener('click',startGame);
document.getElementById('go-menu-btn').addEventListener('click',goToStart);
document.getElementById('htp-open-btn').addEventListener('click',()=>{
    document.getElementById('htp-screen').classList.remove('hidden');
})
document.getElementById('htp-close').addEventListener('click',()=>{
    document.getElementById('htp-screen').classList.add('hidden');
})

window.addEventListener('resize',()=>{
    const canvas=document.getElementById('confetti-canvas');
    if(canvas){
        canvas.width=window.innerWidth;
        canvas.height=window.innerHeight;
    }
})