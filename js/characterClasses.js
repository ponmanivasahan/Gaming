class CharacterClass{
  constructor({name,stats,color,secondaryColor}){
    this.name =name;
    this.stats =stats;
    this.color =color;
    this.secondaryColor =secondaryColor;
  }

  drawIcon(ctx,x,y,size){
    ctx.save();
    switch(this.name){
      case 'Warrior':
        this.drawWarriorIcon(ctx,x,y,size);
        break;
      case 'Archer':
        this.drawArcherIcon(ctx,x,y,size);
        break;
      case 'Mage':
        this.drawMageIcon(ctx,x,y,size);
        break;
      case 'Tank':
        this.drawTankIcon(ctx,x,y,size);
        break;
    }
    ctx.restore();
  }

  drawWarriorIcon(ctx,x,y,size){
    ctx.fillStyle = this.color;
    ctx.fillRect(x + size * 0.4, y + size * 0.2, size * 0.2, size * 0.6);
    ctx.fillStyle = this.secondaryColor;
    ctx.fillRect(x + size * 0.35, y + size * 0.15, size * 0.3, size * 0.1);
    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y);
    ctx.lineTo(x + size * 0.4, y + size * 0.2);
    ctx.lineTo(x + size * 0.6, y + size * 0.2);
    ctx.closePath();
    ctx.fill();
  }

  drawArcherIcon(ctx,x,y,size){
    ctx.strokeStyle = this.color;
    ctx.lineWidth = size * 0.08;
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.5, size * 0.3, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();
    ctx.fillStyle = this.secondaryColor;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.2, y + size * 0.5);
    ctx.lineTo(x + size * 0.6, y + size * 0.5);
    ctx.lineTo(x + size * 0.55, y + size * 0.45);
    ctx.lineTo(x + size * 0.55, y + size * 0.55);
    ctx.closePath();
    ctx.fill();
  }

  drawMageIcon(ctx,x,y,size){
    ctx.strokeStyle = this.secondaryColor;
    ctx.lineWidth = size * 0.06;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y + size * 0.2);
    ctx.lineTo(x + size * 0.5, y + size * 0.8);
    ctx.stroke();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.color + '44';
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.2, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  drawTankIcon(ctx,x,y,size){
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.5, y);
    ctx.lineTo(x + size * 0.8, y + size * 0.3);
    ctx.lineTo(x + size * 0.8, y + size * 0.7);
    ctx.lineTo(x + size * 0.5, y + size);
    ctx.lineTo(x + size * 0.2, y + size * 0.7);
    ctx.lineTo(x + size * 0.2, y + size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = this.secondaryColor;
    ctx.fillRect(x + size * 0.45, y + size * 0.2, size * 0.1, size * 0.6);
    ctx.fillRect(x + size * 0.3, y + size * 0.45, size * 0.4, size * 0.1);
  }
}

const characterClasses ={
  warrior: new CharacterClass({
    name:'Warrior',
    stats:{
      baseHealth: 100,
      baseDamage: 25,
      attackSpeed: 1.0,
      moveSpeed: 100,
      attackRange: 20,
      description: 'High damage, slow movement'
    },
    color:'#ff4444',
    secondaryColor:'#cc0000'
  }),
  
  archer: new CharacterClass({
    name:'Archer',
    stats:{
      baseHealth: 70,
      baseDamage: 15,
      attackSpeed: 1.5,
      moveSpeed: 180,
      attackRange: 80,
      description:'Ranged attacks,fast movement'
    },
    color:'#44ff44',
    secondaryColor:'#00cc00'
  }),
  
  mage: new CharacterClass({
    name:'Mage',
    stats:{
      baseHealth: 60,
      baseDamage: 30,
      attackSpeed: 0.8,
      moveSpeed: 120,
      attackRange: 60,
      areaOfEffect: 40,
      description: 'Area damage, magic attacks'
    },
    color:'#4444ff',
    secondaryColor:'#0000cc'
  }),
  
  tank: new CharacterClass({
    name:'Tank',
    stats:{
      baseHealth: 150,
      baseDamage: 10,
      attackSpeed: 0.7,
      moveSpeed: 80,
      attackRange: 18,
      shieldAbility: true,
      description: 'High health, shield ability'
    },
    color: '#888888',
    secondaryColor: '#444444'
  })
};

let selectedClass = null;

function getSelectedClass(){
  return selectedClass || characterClasses.warrior;
}

function setPlayerClass(className){
  selectedClass = characterClasses[className];
  localStorage.setItem('selectedClass', className);
  return selectedClass;
}

function loadPlayerClass(){
  const saved = localStorage.getItem('selectedClass');
  if (saved && characterClasses[saved]) {
    selectedClass = characterClasses[saved];
  } else {
    selectedClass = characterClasses.warrior;
  }
  return selectedClass;
}