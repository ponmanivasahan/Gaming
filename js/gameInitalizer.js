class GameInitalizer {
  constructor(gameState) {
    this.gameState = gameState;
  }

  startFightCountdown() {
    const countdown = document.getElementById('fightCountdown');
    if (!countdown) return;
    if (typeof timerId !== 'undefined') clearTimeout(timerId);

    const show = (text, color) => {
      countdown.style.display = 'block';
      countdown.style.color = color;
      countdown.textContent = text;
      countdown.classList.remove('countdown-pop');
      void countdown.offsetWidth;
      countdown.classList.add('countdown-pop');
    };

    show('READY', '#00d4ff');
    setTimeout(() => show('3', '#ff4444'), 1000);
    setTimeout(() => show('2', '#ffaa00'), 2000);
    setTimeout(() => show('1', '#44ff88'), 3000);
    setTimeout(() => show('FIGHT!', '#FFD700'), 4000);
    setTimeout(() => {
      countdown.style.display = 'none';
      countdown.classList.remove('countdown-pop');
      this.gameState.gameStarted = true;

      if (typeof resetTimer === 'function') {
        resetTimer(30);
      } else {
        window.timer = 30;
        const timerEl = document.getElementById('timer');
        if (timerEl) timerEl.innerHTML = window.timer;
      }

      if (typeof decreaseTimer === 'function') decreaseTimer();
      if (this.gameState.renderer) this.gameState.renderer.animate();
    }, 4900);
  }

  async initGame() {
    this.gameState.reset();
    if (!this.gameState.canvas || !this.gameState.ctx) {
      this.gameState.initCanvas();
    }

    this.gameState.background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: './images/background1.png'
    });

    this.gameState.player = new Fighter({
      position: { x: 100, y: 0 },
      velocity: { x: 0, y: 0 },
      imageSrc: './images/samuraiMack/Idle.png',
      framesMax: 8,
      scale: 2.5,
      offset: { x: 215, y: 157 },
      sprites: {
        idle: { 
          imageSrc: './images/samuraiMack/Idle.png',
          framesMax: 8 
        },
        run: { 
          imageSrc: './images/samuraiMack/Run.png',
          framesMax: 8 
        },
        jump: { 
          imageSrc: './images/samuraiMack/Jump.png',
          framesMax: 2 
        },
        fall: { 
          imageSrc: './images/samuraiMack/Fall.png',
          framesMax: 2 
        },
        attack1: { 
          imageSrc: './images/samuraiMack/Attack1.png',
          framesMax: 6 
        },
        takeHit: { 
          imageSrc: './images/samuraiMack/TakeHitwhite.png',
          framesMax: 4 
        },
        death: { 
          imageSrc: './images/samuraiMack/Death.png',
          framesMax: 6 
        }
      },
      attackBox: { 
        offset: { x: 100, y: 50 }, 
        width: 180, 
        height: 50 
      }
    });

    const startX=Math.max(280,(this.gameState.canvas?.width || 800)-260);

    this.gameState.enemy = new Fighter({
      position: { x: startX, y: 100 },
      velocity: { x: 0, y: 0 },
      color: 'blue',
      facing: -1, 
      flipSprite: true, 
      imageSrc: './images/kenji/Idle.png',
      framesMax: 4,
      scale: 2.5,
      offset: { x: 215, y: 167 },
      sprites: {
        idle: { 
          imageSrc: './images/kenji/Idle.png',
          framesMax: 4 
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
        offset: { x: 150, y: 50 },
        width: 180,
        height: 50
      }
    });

    this.startFightCountdown();
  } 
} 