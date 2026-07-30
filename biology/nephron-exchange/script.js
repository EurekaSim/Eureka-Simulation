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
    const scale = Math.min(canvas.width, canvas.height) / 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Schematic Coordinates
    const bowmansX = cx - scale * 3;
    const bowmansY = cy - scale * 3;
    const loopBottomY = cy + scale * 3.5;
    const collectingDuctX = cx + scale * 3;

    // 1. Draw Nephron Tubule (Yellowish-white)
    ctx.beginPath();
    ctx.moveTo(bowmansX, bowmansY);
    ctx.lineTo(bowmansX + scale, bowmansY); // PCT
    ctx.lineTo(bowmansX + scale, loopBottomY); // Descending Limb
    ctx.arc(bowmansX + scale * 1.5, loopBottomY, scale * 0.5, Math.PI, 0, true); // Loop of Henle
    ctx.lineTo(bowmansX + scale * 2, bowmansY); // Ascending Limb
    ctx.lineTo(collectingDuctX, bowmansY); // DCT
    ctx.lineTo(collectingDuctX, cy + scale * 4); // Collecting Duct
    
    ctx.strokeStyle = 'rgba(255, 255, 220, 0.4)';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 2. Draw Vasa Recta (Capillary Network)
    const capX1 = bowmansX + scale * 1.3;
    const capX2 = bowmansX + scale * 1.7;
    const capWidth = 14;
    const wallOffset = capWidth / 2;

    ctx.beginPath();
    ctx.moveTo(capX1, bowmansY + scale);
    ctx.lineTo(capX1, loopBottomY + scale * 0.2);
    ctx.arc(bowmansX + scale * 1.5, loopBottomY + scale * 0.2, scale * 0.2, Math.PI, 0, true);
    ctx.lineTo(capX2, bowmansY + scale);
    
    // Fill capillary with blood color
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.25)';
    ctx.lineWidth = capWidth;
    ctx.stroke();
    
    // Explicitly draw Endothelial Walls on BOTH sides of the capillary pipes
    ctx.beginPath();
    // Descending Capillary Walls
    ctx.moveTo(capX1 - wallOffset, bowmansY + scale);
    ctx.lineTo(capX1 - wallOffset, loopBottomY + scale * 0.2);
    ctx.moveTo(capX1 + wallOffset, bowmansY + scale);
    ctx.lineTo(capX1 + wallOffset, loopBottomY + scale * 0.2);
    // Ascending Capillary Walls
    ctx.moveTo(capX2 - wallOffset, bowmansY + scale);
    ctx.lineTo(capX2 - wallOffset, loopBottomY + scale * 0.2);
    ctx.moveTo(capX2 + wallOffset, bowmansY + scale);
    ctx.lineTo(capX2 + wallOffset, loopBottomY + scale * 0.2);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. Render Exchange Arrows (H2O and Na+) based on permeability
    const pulse = (Math.sin(time * 0.05) + 1) / 2;
    const activeAlpha = 0.2 + (h2oPermeability * 0.8) * pulse;

    // Water leaving descending limb -> entering capillary
    drawExchangeArrow(bowmansX + scale, cy, capX1, cy, `rgba(59, 130, 246, ${activeAlpha})`, "H₂O");
    
    // Water leaving collecting duct -> entering capillary
    drawExchangeArrow(collectingDuctX, cy + scale, capX2, cy + scale, `rgba(59, 130, 246, ${activeAlpha})`, "H₂O");

    // Sodium (Na+) leaving ascending limb
    drawExchangeArrow(bowmansX + scale * 2, cy + scale * 1.5, capX2, cy + scale * 1.5, `rgba(245, 158, 11, 0.7)`, "Na⁺");
}

function drawExchangeArrow(x1, y1, x2, y2, color, label) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = color;
    ctx.font = '12px Inter';
    ctx.fillText(label, (x1 + x2)/2 - 10, y1 - 5);
}

function updatePhysiology() {
    const hydration = parseInt(hydSlider.value); 
    const sodium = parseInt(sodSlider.value); 

    // Logic Derivations
    let adh = (100 - hydration) + (sodium - 140) * 2; 
    adh = Math.max(0, Math.min(100, adh)); 
    
    const permeability = adh / 100;
    const currentOsmolarity = 300 + (900 * permeability); 

    let hText = hydration < 30 ? "Dehydrated" : hydration > 70 ? "Overhydrated" : "Normal";
    let aText = adh > 70 ? "High (Conserving Water)" : adh < 30 ? "Low (Expelling Water)" : "Moderate";
    let vText = adh > 70 ? "Low (Oliguria)" : adh < 30 ? "High (Polyuria)" : "Normal";
    let sText = currentOsmolarity > 800 ? "Highly Concentrated" : currentOsmolarity < 400 ? "Dilute" : "Standard";

    // Map Osmolarity to Urine Color 
    const r = 255 - (permeability * 43);
    const g = 255 - (permeability * 111);
    const b = 224 - (permeability * 224);
    const uColor = `rgb(${r}, ${g}, ${b})`;

    hydValue.innerText = hText;
    sodValue.innerText = `${sodium} mEq/L`;
    adhLevel.innerText = aText;
    permValue.innerText = `${Math.round(permeability * 100)}%`;
    osmolarity.innerText = `${Math.round(currentOsmolarity)} mOsm/L`;
    urineVol.innerText = vText;
    urineState.innerText = sText;
    urineColorBox.style.backgroundColor = uColor;

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
