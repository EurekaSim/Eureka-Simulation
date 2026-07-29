const canvas = document.getElementById('orbitalCanvas');
const ctx = canvas.getContext('2d');

const zSlider = document.getElementById('atomicNumberSlider');
const zValue = document.getElementById('zValue');
const elSymbol = document.getElementById('elementSymbol');
const elName = document.getElementById('elementName');
const configReadout = document.getElementById('configReadout');

// Quantum Number Elements
const qN = document.getElementById('qN');
const qL = document.getElementById('qL');
const qMl = document.getElementById('qMl');
const qMs = document.getElementById('qMs');

// Elements Array mapped with differentiating electron quantum numbers
const elements = [
    { z: 1, sym: 'H', name: 'Hydrogen', conf: '1s¹', n: 1, l: 0, ml: '0', ms: '+½' },
    { z: 2, sym: 'He', name: 'Helium', conf: '1s²', n: 1, l: 0, ml: '0', ms: '-½' },
    { z: 3, sym: 'Li', name: 'Lithium', conf: '1s² 2s¹', n: 2, l: 0, ml: '0', ms: '+½' },
    { z: 4, sym: 'Be', name: 'Beryllium', conf: '1s² 2s²', n: 2, l: 0, ml: '0', ms: '-½' },
    { z: 5, sym: 'B', name: 'Boron', conf: '1s² 2s² 2p¹', n: 2, l: 1, ml: '-1', ms: '+½' },
    { z: 6, sym: 'C', name: 'Carbon', conf: '1s² 2s² 2p²', n: 2, l: 1, ml: '0', ms: '+½' },
    { z: 7, sym: 'N', name: 'Nitrogen', conf: '1s² 2s² 2p³', n: 2, l: 1, ml: '+1', ms: '+½' },
    { z: 8, sym: 'O', name: 'Oxygen', conf: '1s² 2s² 2p⁴', n: 2, l: 1, ml: '-1', ms: '-½' },
    { z: 9, sym: 'F', name: 'Fluorine', conf: '1s² 2s² 2p⁵', n: 2, l: 1, ml: '0', ms: '-½' },
    { z: 10, sym: 'Ne', name: 'Neon', conf: '1s² 2s² 2p⁶', n: 2, l: 1, ml: '+1', ms: '-½' },
    { z: 11, sym: 'Na', name: 'Sodium', conf: '[Ne] 3s¹', n: 3, l: 0, ml: '0', ms: '+½' },
    { z: 12, sym: 'Mg', name: 'Magnesium', conf: '[Ne] 3s²', n: 3, l: 0, ml: '0', ms: '-½' },
    { z: 13, sym: 'Al', name: 'Aluminum', conf: '[Ne] 3s² 3p¹', n: 3, l: 1, ml: '-1', ms: '+½' },
    { z: 14, sym: 'Si', name: 'Silicon', conf: '[Ne] 3s² 3p²', n: 3, l: 1, ml: '0', ms: '+½' },
    { z: 15, sym: 'P', name: 'Phosphorus', conf: '[Ne] 3s² 3p³', n: 3, l: 1, ml: '+1', ms: '+½' },
    { z: 16, sym: 'S', name: 'Sulfur', conf: '[Ne] 3s² 3p⁴', n: 3, l: 1, ml: '-1', ms: '-½' },
    { z: 17, sym: 'Cl', name: 'Chlorine', conf: '[Ne] 3s² 3p⁵', n: 3, l: 1, ml: '0', ms: '-½' },
    { z: 18, sym: 'Ar', name: 'Argon', conf: '[Ne] 3s² 3p⁶', n: 3, l: 1, ml: '+1', ms: '-½' }
];

function resizeCanvas() {
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Render Probability Cloud Particles
function drawProbabilityCloud(z) {
    const originX = canvas.width / 2;
    const originY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 4;
    
    // Clear previous frame to create a trailing particle effect
    ctx.fillStyle = 'rgba(10, 16, 31, 0.35)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Nucleus
    ctx.beginPath();
    ctx.arc(originX, originY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();

    const particles = 1500; 
    
    for (let i = 0; i < particles; i++) {
        let r, theta, x, y;

        if (z <= 2) {
            // 1s orbital
            r = Math.abs(randomGaussian(0, scale * 0.3));
            theta = Math.random() * Math.PI * 2;
            ctx.fillStyle = 'rgba(245, 158, 11, 0.15)'; 
        } else if (z > 2 && z <= 4) {
            // 2s orbital
            if (Math.random() < 0.3) {
                r = Math.abs(randomGaussian(0, scale * 0.2)); 
            } else {
                r = Math.abs(randomGaussian(scale * 0.6, scale * 0.15)); 
            }
            theta = Math.random() * Math.PI * 2;
            ctx.fillStyle = 'rgba(245, 158, 11, 0.2)'; 
        } else {
            // p-orbital distributions
            if (Math.random() < 0.2) {
                r = Math.abs(randomGaussian(0, scale * 0.2)); 
            } else if (Math.random() < 0.4) {
                r = Math.abs(randomGaussian(scale * 0.5, scale * 0.1)); 
            } else {
                theta = Math.random() * Math.PI * 2;
                r = scale * Math.abs(Math.cos(theta) + Math.sin(theta)) * Math.random();
            }
            theta = Math.random() * Math.PI * 2;
            ctx.fillStyle = 'rgba(245, 158, 11, 0.25)'; 
        }

        x = originX + r * Math.cos(theta);
        y = originY + r * Math.sin(theta);

        ctx.fillRect(x, y, 1.5, 1.5);
    }
}

function randomGaussian(mean, stdev) {
    let u = 1 - Math.random();
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}

function animate() {
    const z = parseInt(zSlider.value);
    drawProbabilityCloud(z);
    requestAnimationFrame(animate);
}

// Update UI
zSlider.addEventListener('input', (e) => {
    const z = parseInt(e.target.value);
    const data = elements[z - 1];
    
    zValue.innerText = z;
    elSymbol.innerText = data.sym;
    elName.innerText = data.name;
    configReadout.innerText = data.conf;
    
    // Update Quantum Numbers
    qN.innerText = data.n;
    qL.innerText = data.l;
    qMl.innerText = data.ml;
    qMs.innerText = data.ms;
});

// Start rendering
animate();
