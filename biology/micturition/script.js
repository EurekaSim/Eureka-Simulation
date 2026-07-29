// System Elements
const slider = document.getElementById('fillSlider');
const liquidGroup = document.getElementById('liquidGroup');
const sphincter = document.getElementById('sphincter');
const voidBtn = document.getElementById('voidBtn');

// Telemetry Elements
const valVol = document.getElementById('valVol'), valPres = document.getElementById('valPres');
const valUrge = document.getElementById('valUrge'), valSphincter = document.getElementById('valSphincter');
const valHR = document.getElementById('valHR'), sysStatus = document.getElementById('sysStatus');
const overlayVol = document.getElementById('overlayVol'), postureText = document.getElementById('postureText');
const ecgPath = document.getElementById('ecgPath'), personSimulator = document.getElementById('personSimulator');

// Holographic Person Elements
const pHead = document.getElementById('pHead'), pTorso = document.getElementById('pTorso');
const pArmL = document.getElementById('pArmL'), pArmR = document.getElementById('pArmR');
const pLegL = document.getElementById('pLegL'), pLegR = document.getElementById('pLegR');
const jHndL = document.getElementById('jHndL'), jHndR = document.getElementById('jHndR');

// Constants
const MAX_VOL = 600;
const BLADDER_BTM_Y = 110;

function calculatePressure(vol) {
    if(vol < 150) return 5 + (vol / 50); 
    if(vol < 400) return 8 + ((vol - 150) / 30); 
    return 16 + Math.pow((vol - 400) / 30, 2);
}

// Morph the holographic person based on state
function updatePosture(state) {
    if(state === 1) { // Relaxed
        pHead.setAttribute('cx', '100'); pHead.setAttribute('cy', '70');
        pTorso.setAttribute('d', 'M 100 92 Q 100 170 100 240');
        pArmL.setAttribute('d', 'M 100 110 Q 60 170 60 250');
        pArmR.setAttribute('d', 'M 100 110 Q 140 170 140 250');
        pLegL.setAttribute('d', 'M 100 240 Q 80 340 80 430');
        pLegR.setAttribute('d', 'M 100 240 Q 120 340 120 430');
        jHndL.setAttribute('cx', '60'); jHndL.setAttribute('cy', '250');
        jHndR.setAttribute('cx', '140'); jHndR.setAttribute('cy', '250');
    } 
    else if (state === 2) { // Guarding (Slight Hunch)
        pHead.setAttribute('cx', '97'); pHead.setAttribute('cy', '75');
        pTorso.setAttribute('d', 'M 100 92 Q 90 170 100 240');
        pArmL.setAttribute('d', 'M 100 110 Q 55 180 80 245');
        pArmR.setAttribute('d', 'M 100 110 Q 145 180 120 245');
        pLegL.setAttribute('d', 'M 100 240 Q 85 340 85 430');
        pLegR.setAttribute('d', 'M 100 240 Q 115 340 115 430');
        jHndL.setAttribute('cx', '80'); jHndL.setAttribute('cy', '245');
        jHndR.setAttribute('cx', '120'); jHndR.setAttribute('cy', '245');
    }
    else if (state === 3) { // High Stress
        pHead.setAttribute('cx', '92'); pHead.setAttribute('cy', '80');
        pTorso.setAttribute('d', 'M 100 92 Q 85 170 100 240');
        pArmL.setAttribute('d', 'M 100 110 Q 50 190 90 240');
        pArmR.setAttribute('d', 'M 100 110 Q 150 190 110 240');
        pLegL.setAttribute('d', 'M 100 240 Q 95 340 90 430');
        pLegR.setAttribute('d', 'M 100 240 Q 105 340 110 430');
        jHndL.setAttribute('cx', '90'); jHndL.setAttribute('cy', '240');
        jHndR.setAttribute('cx', '110'); jHndR.setAttribute('cy', '240');
    }
    else if (state === 4) { // Critical Panic
        pHead.setAttribute('cx', '88'); pHead.setAttribute('cy', '85');
        pTorso.setAttribute('d', 'M 100 92 Q 75 170 100 240');
        pArmL.setAttribute('d', 'M 100 110 Q 40 210 95 245');
        pArmR.setAttribute('d', 'M 100 110 Q 160 210 105 245');
        pLegL.setAttribute('d', 'M 100 240 Q 130 340 80 430'); 
        pLegR.setAttribute('d', 'M 100 240 Q 70 340 120 430');
        jHndL.setAttribute('cx', '95'); jHndL.setAttribute('cy', '245');
        jHndR.setAttribute('cx', '105'); jHndR.setAttribute('cy', '245');
    }
}

function updateSimulation() {
    const volume = parseInt(slider.value);
    const fillPercentage = volume / MAX_VOL;
    
    // Liquid transform scales cleanly with SVG viewBox
    liquidGroup.style.transform = `translate(0, ${BLADDER_BTM_Y - (fillPercentage * BLADDER_BTM_Y)}px)`;
    
    const pressure = calculatePressure(volume).toFixed(1);
    
    let color = '#00d2ff', status = 'System Normal', urgeText = 'None', sphincterState = 'Resting', poseText = 'RELAXED';
    let hr = 72, poseState = 1;

    if (volume <= 150) {
        color = '#00d2ff'; status = 'Filling Phase'; hr = 70 + Math.floor(Math.random() * 5);
        personSimulator.classList.remove('is-critical'); voidBtn.classList.remove('active');
    }
    else if (volume > 150 && volume <= 350) {
        color = '#10b981'; status = 'First Sensation'; urgeText = 'Mild'; poseText = 'TENSE';
        hr = 75 + Math.floor(Math.random() * 5); poseState = 2;
        personSimulator.classList.remove('is-critical'); voidBtn.classList.remove('active');
    }
    else if (volume > 350 && volume <= 500) {
        color = '#f59e0b'; status = 'Strong Desire'; urgeText = 'High (Guarding)'; 
        sphincterState = 'Active Guarding'; poseText = 'GUARDING';
        hr = 85 + Math.floor(Math.random() * 10); poseState = 3;
        personSimulator.classList.remove('is-critical'); voidBtn.classList.add('active');
    }
    else if (volume > 500) {
        color = '#ef4444'; status = 'CRITICAL URGENCY'; urgeText = 'OVERWHELMING'; 
        sphincterState = 'Max Contraction (Strain)'; poseText = 'CRITICAL / PANIC';
        hr = 110 + Math.floor(Math.random() * 20); poseState = 4;
        personSimulator.classList.add('is-critical'); voidBtn.classList.add('active');
    }

    // Apply visual updates
    document.documentElement.style.setProperty('--accent-normal', color);
    sysStatus.style.borderColor = color; sysStatus.style.color = color;
    sysStatus.style.boxShadow = `0 0 10px ${color}33`;
    sphincter.setAttribute('fill', color);
    
    valVol.innerText = volume; overlayVol.innerText = `${volume} mL`;
    valPres.innerText = pressure; sysStatus.innerText = status;
    valUrge.innerText = urgeText; valUrge.style.color = color;
    valSphincter.innerText = sphincterState;
    valHR.innerText = hr; valHR.style.color = color;
    postureText.innerText = `STANCE: ${poseText}`;

    updatePosture(poseState);

    ecgPath.style.animationDuration = `${(60 / hr) * 2}s`;
    const encodedColor = color.replace('#', '%23');
    ecgPath.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30"><path d="M0,15 L20,15 L25,5 L30,25 L35,15 L100,15" fill="none" stroke="${encodedColor}" stroke-width="1.5"/></svg>')`;
}

slider.addEventListener('input', updateSimulation);

voidBtn.addEventListener('click', () => {
    voidBtn.innerText = "Voiding...";
    voidBtn.style.pointerEvents = "none";
    sphincter.setAttribute('fill', '#10b981');
    valSphincter.innerText = "Relaxed (Micturition)";
    postureText.innerText = "STANCE: RELIEVED";
    updatePosture(1); 
    pHead.setAttribute('cy', '65'); // Head tilts up in relief
    personSimulator.classList.remove('is-critical');
    
    let currentVol = parseInt(slider.value);
    const voidInterval = setInterval(() => {
        currentVol -= 12; 
        if (currentVol <= 0) {
            currentVol = 0;
            clearInterval(voidInterval);
            voidBtn.innerText = "Initiate Micturition (Void)";
            sysStatus.innerText = "Relief / Resting Phase";
        }
        slider.value = currentVol;
        updateSimulation();
    }, 50);
});

// Handle touch scrolling vs slider manipulation on mobile
slider.addEventListener('touchmove', (e) => {
    // Prevents the page from scrolling when dragging the slider
    e.stopPropagation();
});

// Initialize simulation on load
updateSimulation();
