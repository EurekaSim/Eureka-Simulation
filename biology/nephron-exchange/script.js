const canvas = document.getElementById('nephronCanvas');
const ctx = canvas.getContext('2d');

const hydSlider = document.getElementById('hydrationSlider');
const sodSlider = document.getElementById('sodiumSlider');
const hydValue = document.getElementById('hydrationValue');
const sodValue = document.getElementById('sodiumValue');

const adhLevel = document.getElementById('adhLevel');
const permValue = document.getElementById('permeability');
const osmolarity = document.getElementById('osmolarity');
const urineVol = document.getElementById('urineVol');
const urineColorBox = document.getElementById('urineColorBox');
const urineState = document.getElementById('urineState');
const conceptSummary = document.getElementById('conceptSummary');

let time = 0;

function resizeCanvas() {
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawAnatomy(h2oPermeability) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 9;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bowmansX = cx - scale * 3.5;
    const bowmansY = cy - scale * 2.5;
    const loopBottomY = cy + scale * 3.5;
    const collectingDuctX = cx + scale * 3.5;

    // 1. Render Nephron Tubule Core
    ctx.beginPath();
    ctx.moveTo(bowmansX, bowmansY);
    ctx.lineTo(bowmansX + scale * 1.5, bowmansY); 
    ctx.lineTo(bowmansX + scale * 1.5, loopBottomY); 
    ctx.arc(bowmansX + scale * 2.25, loopBottomY, scale * 0.75, Math.PI, 0, true); 
    ctx.lineTo(bowmansX + scale * 3, bowmansY); 
    ctx.lineTo(collectingDuctX, bowmansY); 
    ctx.lineTo(collectingDuctX, cy + scale * 4); 
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 2. Render Vasa Recta (Capillary Network)
    const capX1 = bowmansX + scale * 1.9;
    const capX2 = bowmansX + scale * 2.6;
    const capWidth = 16;
    const wallOffset = capWidth / 2;

    ctx.beginPath();
    ctx.moveTo(capX1, bowmansY + scale);
    ctx.lineTo(capX1, loopBottomY + scale * 0.4);
    ctx.arc(bowmansX + scale * 2.25, loopBottomY + scale * 0.4, scale * 0.35, Math.PI, 0, true);
    ctx.lineTo(capX2, bowmansY + scale);
    
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.2)';
    ctx.lineWidth = capWidth;
    ctx.stroke();
    
    // Explicit Biological Detail: Endothelial Wall on BOTH sides of the capillary
    ctx.beginPath();
    // Descending Limb Walls
    ctx.moveTo(capX1 - wallOffset, bowmansY + scale);
    ctx.lineTo(capX1 - wallOffset, loopBottomY + scale * 0.4);
    ctx.moveTo(capX1 + wallOffset, bowmansY + scale);
    ctx.lineTo(capX1 + wallOffset, loopBottomY + scale * 0.4);
    // Ascending Limb Walls
    ctx.moveTo(capX2 - wallOffset, bowmansY + scale);
    ctx.lineTo(capX2 - wallOffset, loopBottomY + scale * 0.4);
    ctx.moveTo(capX2 + wallOffset, bowmansY + scale);
    ctx.lineTo(capX2 + wallOffset, loopBottomY + scale * 0.4);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Render Exchange Gradients
    const pulse = (Math.sin(time * 0.04) + 1) / 2;
    const activeAlpha = 0.2 + (h2oPermeability * 0.8) * pulse;

    // H2O reabsorption (Blue)
    drawExchangeArrow(bowmansX + scale * 1.5, cy, capX1, cy, `rgba(59, 130, 246, ${activeAlpha})`, "H₂O");
    drawExchangeArrow(collectingDuctX, cy + scale, capX2, cy + scale, `rgba(59, 130, 246, ${activeAlpha})`, "H₂O");

    // Na+ reabsorption (Yellowish-Orange)
    drawExchangeArrow(bowmansX + scale * 3, cy + scale * 1.5, capX2, cy + scale * 1.5, `rgba(245, 158, 11, 0.8)`, "Na⁺");
}

function drawExchangeArrow(x1, y1, x2, y2, color, label) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = '600 13px Inter';
    ctx.fillText(label, (x1 + x2)/2 - 12, y1 - 8);
}

function updatePhysiology() {
    const hydration = parseInt(hydSlider.value); 
    const sodium = parseInt(sodSlider.value); 

    // Core Logic Derivations
    let adh = (100 - hydration) + (sodium - 140) * 2; 
    adh = Math.max(0, Math.min(100, adh)); 
    const permeability = adh / 100;
    const currentOsmolarity = 300 + (900 * permeability); 

    let hText = hydration < 30 ? "Dehydrated" : hydration > 70 ? "Overhydrated" : "Normal";
    let aText = adh > 70 ? "High" : adh < 30 ? "Low" : "Moderate";
    let vText = adh > 70 ? "Low (Oliguria)" : adh < 30 ? "High (Polyuria)" : "Standard";
    let sText = currentOsmolarity > 800 ? "Highly Concentrated" : currentOsmolarity < 400 ? "Dilute" : "Isotonic";

    // Dynamic Summary Note Generation
    let note = "";
    if (adh > 70) {
        note = `Because systemic blood indicates ${hText.toLowerCase()} conditions or elevated sodium, the pituitary secretes large amounts of ADH. This increases aquaporin insertion in the collecting duct, maximizing H₂O reabsorption across the endothelial walls into the vasa recta, resulting in a small volume of highly concentrated urine.`;
    } else if (adh < 30) {
        note = `Due to an ${hText.toLowerCase()} state, ADH secretion is suppressed. Without aquaporins, the collecting duct becomes impermeable to H₂O. Water remains trapped in the tubule while Na⁺ is still pumped out, yielding a large volume of heavily diluted urine.`;
    } else {
        note = `Under balanced conditions, moderate ADH levels maintain baseline aquaporin channels. The countercurrent multiplier system steadily reabsorbs required H₂O and Na⁺, producing standard, isotonic urine output.`;
    }

    const r = 255 - (permeability * 43);
    const g = 255 - (permeability * 111);
    const b = 224 - (permeability * 224);
    
    hydValue.innerText = hText;
    sodValue.innerText = `${sodium} mEq/L`;
    adhLevel.innerText = aText;
    permValue.innerText = `${Math.round(permeability * 100)}%`;
    osmolarity.innerText = `${Math.round(currentOsmolarity)} mOsm/L`;
    urineVol.innerText = vText;
    urineState.innerText = sText;
    urineColorBox.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    conceptSummary.innerText = note;

    drawAnatomy(permeability);
}

function animate() {
    time++;
    updatePhysiology();
    requestAnimationFrame(animate);
}

hydSlider.addEventListener('input', updatePhysiology);
sodSlider.addEventListener('input', updatePhysiology);

animate();
