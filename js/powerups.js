//js/powerups.js
class powerupManager{
    constructor(gameState){
        this.gameState=gameState;
        this.activeEffects=[];
    }

    getActiveEffects(owner=null){
        if(owner==='player' || owner==='enemy'){
            return this.activeEffects.filter((effect)=>effect.owner===owner);
        }
        return this.activeEffects;
    }

    activate(type,owner='player'){
        if(!this.gameState) return false;
        if(!this.gameState.items) return false;

        const effectOwner=owner==='enemy' ? 'enemy' : 'player';
        if(this.gameState.isCpuEnemy && effectOwner==='enemy') return false;
        const ownerLabel=effectOwner==='player' ? 'P1' : 'P2';

        const itemCount=typeof this.gameState.getItemCount==='function'
            ? this.gameState.getItemCount(effectOwner,type)
            : (this.gameState.items[effectOwner]?.[type] || 0);

        if(itemCount<=0){
            if(typeof window.showShopToast==='function'){
                window.showShopToast(`${ownerLabel} has no powerups left`);
            }
            return false;
        }

        if(typeof this.gameState.setItemCount==='function'){
            this.gameState.setItemCount(effectOwner,type,itemCount-1);
        }else if(this.gameState.items[effectOwner]){
            this.gameState.items[effectOwner][type]=itemCount-1;
        }

        if(typeof window.updateShopDisplay==='function'){
            window.updateShopDisplay();
        }

        const targetFighter=effectOwner==='player' ? this.gameState.player : this.gameState.enemy;
        if(!targetFighter) return true;

        const showToast=(msg)=>{
            if(typeof window.showShopToast==='function'){
                window.showShopToast(msg);
            }
        }

        const addEffect=(effectType,duration,effectOwnerArg)=>{
            const existing=this.activeEffects.find((e)=>e.type===effectType && e.owner===effectOwnerArg);
            if(existing){
                existing.timeRemaining=duration;
                return;
            }
            this.activeEffects.push({type:effectType,timeRemaining:duration,owner:effectOwnerArg});
        }

        switch(type){
            case 'shields':
                targetFighter.shieldCharges=Math.min(targetFighter.shieldCharges+1,3);
                showToast(`🛡  ${ownerLabel} shield ready!`);
                if(typeof window.showGameMessage==='function') window.showGameMessage(`🛡  ${ownerLabel} shield ready!`,1200);
                break;
            case 'healthBoosts':
                targetFighter.health=Math.min(targetFighter.maxHealth,targetFighter.health+80);
                showToast(`❤️  ${ownerLabel} health boosted!`);
                if(typeof window.showGameMessage==='function') window.showGameMessage(`❤️  ${ownerLabel} health boosted!`,1200);
                break;
            case 'damageBoosts':
                if(this.gameState.damageBoost){
                    this.gameState.damageBoost[effectOwner]=true;
                }
                addEffect('damage',5,effectOwner);
                showToast(`⚡  ${ownerLabel} damage boosted!`);
                if(typeof window.showGameMessage==='function') window.showGameMessage(`⚡  ${ownerLabel} damage boosted!`,1200);
                break;
            case 'speedBoosts':
                targetFighter.speedBoostActive=true;
                addEffect('speed',10,effectOwner);
                showToast(`🏃‍♂️ ${ownerLabel} speed boost active`);
                if(typeof window.showGameMessage==='function') window.showGameMessage(`🏃‍♂️ ${ownerLabel} speed boost active!`,1200);
                break;
            case 'timeFreezes':
                this.gameState.timerFrozen=true;
                addEffect('timeFreeze',5,effectOwner);
                showToast(`⏱  ${ownerLabel} froze timer!`);
                if(typeof window.showGameMessage==='function') window.showGameMessage(`⏱  ${ownerLabel} froze timer!`,1200);
                break;
            case 'invincibilities':      
                targetFighter.invincible=true;
                addEffect('invincibility',4,effectOwner);
                showToast(`✨ ${ownerLabel} invincibility!`);
                if(typeof window.showGameMessage==='function') window.showGameMessage(`✨ ${ownerLabel} invincibility!`,1200);
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
                this.activeEffects.splice(i,1);
                this._endEffect(effect.type,effect.owner);
            }
        }
    }

    _endEffect(type,owner='player'){
        const effectOwner=owner==='enemy' ? 'enemy' : 'player';
        const targetFighter=effectOwner==='player' ? this.gameState.player : this.gameState.enemy;

        switch(type){
            case 'damage':
                if(this.gameState.damageBoost){
                    const hasOwnerEffect=this.activeEffects.some((e)=>e.type==='damage' && e.owner===effectOwner);
                    if(!hasOwnerEffect){
                        this.gameState.damageBoost[effectOwner]=false;
                    }
                }
                break;
            case 'speed':
                if(targetFighter){
                    const hasOwnerEffect=this.activeEffects.some((e)=>e.type==='speed' && e.owner===effectOwner);
                    if(!hasOwnerEffect) targetFighter.speedBoostActive=false;
                }
                break;
            case 'timeFreeze':
                this.gameState.timerFrozen=this.activeEffects.some((e)=>e.type==='timeFreeze');
                break;
            case 'invincibility':
                if(targetFighter){
                    const hasOwnerEffect=this.activeEffects.some((e)=>e.type==='invincibility' && e.owner===effectOwner);
                    if(!hasOwnerEffect) targetFighter.invincible=false;
                }
                break;
        }
    }
}

function activatePowerup(type,owner='player'){
    if(!window.gameState || !window.gameState.powerupManager) return;
    window.gameState.powerupManager.activate(type,owner);
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
        el.title='Click to use';
        el.style.cursor='pointer';
        el.addEventListener('click',()=>{
            activatePowerup(type,'player');
        });
    })
}

window.powerupManager=powerupManager;
window.activatePowerup=activatePowerup;
window.setupPowerupHud=setupPowerupHud;