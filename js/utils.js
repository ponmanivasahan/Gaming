function rectangularCollision({rectangle1,rectangle2}){
  return(
    rectangle1.attackBox.position.x + rectangle1.attackBox.width>=rectangle2.position.x && rectangle1.attackBox.position.x <=rectangle2.position.x+rectangle2.width
    && rectangle1.attackBox.position.y+rectangle1.attackBox.height>=rectangle2.position.y && rectangle1.attackBox.position.y<=rectangle2.position.y+rectangle2.height
  );
}

let timer=30;
let timerId;

function decreaseTimer(){
  if(timer>0 && window.gameState && window.gameState.gameStarted && !window.gameState.isPaused){
    timerId=setTimeout(decreaseTimer,1000);
    if(!window.gameState.timerFrozen){
      timer--;
      document.querySelector('#timer').innerHTML=timer;
    }
    if(timer===0){
      determineWinner({player:window.gameState.player,enemy:window.gameState.enemy,timerId});
    }
  }
}

function determineWinner({player,enemy,timerId}){
  clearTimeout(timerId);
  if(!window.gameState) return;
  window.gameState.gameStarted=false;
  window.gameState.isPaused=false;

  if(window.gameState.animationId){
    cancelAnimationFrame(window.gameState.animationId);
    window.gameState.animationId=null;
  }

  const player1Name=localStorage.getItem('player1Name') || 'Player1';
  const player2Name=localStorage.getItem('player2Name') || 'Player 2';
  const roundsNeeded=2;
  const roundNum=window.gameState.sounds.current;

  let roundWinner='tie';
  if(player.health>enemy.health){
    roundWinner='player';
    window.gameState.rounds.player++;
    const earned=Math.max(1,Math.floor(player.health));
    // window.gameState.addCoins(earned);
    window.gameState.coinsEarned=earned;

    // if(typeof updateShopDisplay==='function')updateShopDisplay();
  }
  else if(enemy.health > player.health){
    roundWinner='enemy';
    window.gameState.rounds.enemy++;
    // if(typeof updateShopDisplay=='function') updateShopDisplay()
  }
  window.gameState.rounds.current++;

  const matchOver=window.gameState.rounds.player>=roundsNeeded ||
  window.gameState.enemy >=roundsNeeded || window.gameState.rounds.current > window.gameState.rounds.max;
  document.querySelector('#displayText').style.display='flex';
  if(matchOver){
    document.querySelector('#gameOverButtons').style.display='flex';
    if(window.gameState.rounds.player > window.gameState.rounds.enemy){
      document.querySelector('#displayTextMsg').innerHTML=`${player1Name} wins <br><span style="font-size:0.38em;color:#FFD700;">Best of 3 Champion </span> `;
      const p1W=parseInt(localStorage.getItem('fighterWinsP1')) || 0;
      localStorage.setItem('fighterWinsP1',(p1W+1).toString());
      if(window.gameState.rounds.enemy>window.gameState.rounds.player){
        document.querySelector('#displayTextMsg').innerHTML=`${player2Name} wins <br> <span style="font-size:0.38em; color:#FFD700;">Best of 3 Champion </span>`;
        const p2W=parseInt(localStorage.getItem('fighterWinsP2')) || 0;
        localStorage.setItem('fighterWinsP2',(p2W+1).toString());
      }
      else{
        document.querySelector('#displayTextMsg').innerHTML=`Draw`;
      }
    }
    else{
      let msg;
      if(roundWinner==='player'){
        msg=`${player1Name} wins Round ${roundNum}`;

      }
      else if(roundWinner==='enemy'){
        msg=`${player2Name} wins Round ${roundNum}`;
      }
      else{
        msg=`Round ${roundNum} is a Tie`;
      }
      document.querySelector('#displayTextMsg').innerHTML=msg;
      setTimeout(()=>{
        document.querySelector('displayText').style.display='none';
        if(window.startRound) window.startRound();
      },2200);
    }
  }
   function launchConfetti(){
    const COLORS=['#ff4444','#ff8800','#ffdd00','#44ff66','#44aaff','#aa44ff','#ff44cc','#ffffff','#ff6699','#00ffcc'];
    const SHAPES=['rect','circle'];
    const canvas=document.getElementById('confettiCanvas');
    if(!canvas) return;
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    canvas.style.display='block';
    const ctx=canvas.getContext('2d');
    const particles=[];
    const count=220;
    for(let i=0;i<count;i++){
      const fromLeft=i<count/2;
      particles.push({
        x:fromLeft?0:canvas.width,
        y:canvas.height*(0.3+Math.random()*0.45),
        vx:fromLeft?(6+Math.random()*10):-(6+Math.random()*10),
        vy: -(4+Math.random()*9),
        rot:Math.random()*Math.PI*2,
        rotV:(Math.random()-0.5)*0.18,
        w:6+Math.random()*10,
        h:4+Math.random()*7,
        color:COLORS[Math.floor(Math.random()*COLORS.Length)],
        shape:SHAPES[Math.floor(Math.random()*SHAPES.Length)],
        gravity:0.22+Math.random()*0.12,
        alpha:1,
        fade:0.008 + Math.random()*0.12,
        alpha:1,
        fade: 0.008 + Math.random()*0.006
    
      });
    }
    let frame;
    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      let alive = false;
      particles.forEach(p=>{
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.985;
        p.rot += p.rotV;
        p.alpha -= p.fade;
        if(p.alpha <=0) return;
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.rotate(p.rot);
        if(p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0,0,p.w/2,0, Math.PI * 2);
          ctx.fill();
        }
        else{
          ctx.fillReact(-p.w/2,-p.h/2,p.w,p.h);
        }
        ctx.restore();
      });
      if(alive){
        frame=requestAnimationFrame(draw);
      }
      else{
        canvas.style.display='none';
        ctx.clearRect(0,0,canvas.width,canvas.height);
      }
    }
    if(frame) cancelAnimationFrame(frame);
    draw();
   }
}