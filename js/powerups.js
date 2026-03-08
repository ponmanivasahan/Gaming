//js/powerups.js
class powerupManager{
    constructor(gameState){
        this.gameState=gameState;
        this.activeEffects=[];
    }

    getActiveEffects(){
        return this.activeEffects;
    }
    activate(type){
        if(!this.gameState) return false;
        if(!this.gameState.items) return false;

        const itemCount=this.gameState.items[type] || 0;
        if(itemCount<=0){
            if(typeof window.showShopToast==='function'){
                window.showShopToast('No powerups left');      
            }
            return false;
        }
        this.gameState.items[type]=itemCount-1;
        localStorage.setItem(type,this.gameState.items[type].toString());
        if(typeof window.updateShopDisplay==='function'){
            window.updateShopDisplay();
        }

        const player=this.gameState.player;
        if(!player) return true;
        const showToast=(msg)=>{
            if(typeof window.showShopToast==='function'){
                window.showShopToast(msg);
            }
        }

        const addEffect=(effectType,duration)=>{
            const existing=this.activeEffects.find((e)=>e.type===effectType);
            if(existing){
                existing.timeRemaining=duration;
                return;
            }
            this.activeEffects.push({type:effectType,timeRemaining:duration});
        }

        switch(type){
            case 'shields':
                player.shieldCharges=Math.min(player.shieldCharges+1,3);
                showToast('🛡  Shield ready!');
                if(typeof window.showGameMessage==='function') window.showGameMessage('🛡  Shield ready!',1200);
                break;
            case 'healthBoosts':
                player.health=Math.min(player.maxHealth,player.health+80);
                showToast('❤️  Health boosted!');
                if(typeof window.showGameMessage==='function') window.showGameMessage('❤️  Health boosted!',1200);
                break;
            case 'damageBoosts':
                this.gameState.activeDamageBoost=true;
                addEffect('damage',5);
                showToast('⚡  Damage boosted!');
                if(typeof window.showGameMessage==='function') window.showGameMessage('⚡  Damage boosted!',1200);
                break;
            case 'speedBoosts':
                player.speedBoostActive=true;
                addEffect('speed',10);
                showToast('🏃‍♂️ Speed Boost active');
                if(typeof window.showGameMessage==='function') window.showGameMessage('🏃‍♂️ Speed Boost active!',1200);
                break;
            case 'timeFreezes':
                this.gameState.timerFrozen=true;
                addEffect('timeFreeze',5);
                showToast('⏱  Time Frozen!');
                if(typeof window.showGameMessage==='function') window.showGameMessage('⏱  Time Frozen!',1200);
                break;
            case 'invincibilities':      
                player.invincible=true;
                addEffect('invincibility',4);
                showToast('✨ Invincibility!');
                if(typeof window.showGameMessage==='function') window.showGameMessage('✨ Invincibility!',1200);
                break;
            default:
                return false;
        }
        return true;
    }
    update(deltaSeconds){
        if(!this.activeEffects.length) return;
        for(let i=this.activeEffects.length-1;i>=0;i--){
            const effect=this.activeEffects[i];
            effect.timeRemaining-=deltaSeconds;
            if(effect.timeRemaining<=0){
                this._endEffect(effect.type);
                this.activeEffects.splice(i,1);
            }
        }
    }
    _endEffect(type){
        const player=this.gameState.player;
        if(!player) return;
    switch(type){
        case 'damage':
            this.gameState.activeDamageBoost=false;
            break;
        case 'speed':
            player.speedBoostActive=false;
            break;
        case 'timeFreeze':
            this.gameState.timerFrozen=false;
            break;
        case 'invincibility':
            player.invincible=false;
            break;
    }
    }
}

function activatePowerup(type){
    if(!window.gameState || !window.gameState.powerupManager) return;
    window.gameState.powerupManager.activate(type);
}

function setupPowerupHud(){
    const idToType={
        'pu-shield':'shields',
        'pu-health':'healthBoosts',
        'pu-damage':'damageBoosts',
        'pu-speed':'speedBoosts',
        'pu-freeze':'timeFreezes',
        'pu-invinc':'invincibilities'
    };

    Object.entries(idToType).forEach(([id,type])=>{
        const el=document.getElementById(id);
        if(!el) return;
        el.style.cursor='pointer';
        el.addEventListener('click',()=>{
            activatePowerup(type);
        });
    })
}

window.powerupManager=powerupManager;
window.activatePowerup=activatePowerup;
window.setupPowerupHud=setupPowerupHud;