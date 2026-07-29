const canvas = document.getElementById('vectorCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const magSlider = document.getElementById('magnitudeSlider');
const angleSlider = document.getElementById('angleSlider');
const magValue = document.getElementById('magValue');
const angleValue = document.getElementById('angleValue');
const xReadout = document.getElementById('xReadout');
const yReadout = document.getElementById('yReadout');

// Resize canvas to fit wrapper
function resizeCanvas() {
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
    draw();
}
window.addEventListener('resize', resizeCanvas);

// Draw an arrow shape
function drawArrow(x0, y0, x1, y1, color) {
    const headlen = 12;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const angle = Math.atan2(dy, dx);
    
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 - headlen * Math.cos(angle - Math.PI / 6), y1 - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - headlen * Math.cos(angle + Math.PI / 6), y1 - headlen * Math.sin(angle + Math.PI / 6));
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
}

// Main render loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set origin to bottom-left area, simulating a Cartesian quadrant
    const originX = canvas.width * 0.15;
    const originY = canvas.height * 0.85;
    
    // Get parameters
    const magnitude = parseFloat(magSlider.value);
    const angleDegrees = parseFloat(angleSlider.value);
    const angleRadians = angleDegrees * (Math.PI / 180);
    
    // Core Derivation: Axis components mapping
    // X-axis mapped using Cosine function
    const xComponent = magnitude * Math.cos(angleRadians);
    // Y-axis mapped using Sine function
    const yComponent = magnitude * Math.sin(angleRadians);
    
    // Update UI Readouts
    magValue.innerText = magnitude;
    angleValue.innerText = angleDegrees;
    xReadout.innerText = xComponent.toFixed(2);
    yReadout.innerText = yComponent.toFixed(2);

    // Draw Coordinate Axes
    ctx.beginPath();
    ctx.moveTo(originX - 20, originY);
    ctx.lineTo(canvas.width - 50, originY);
    ctx.moveTo(originX, originY + 20);
    ctx.lineTo(originX, 50);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Scale up for visual clarity on canvas
    const scale = 2.5; 
    const endX = originX + (xComponent * scale);
    const endY = originY - (yComponent * scale); // Minus because Y goes down on HTML canvas

    // Draw dotted projection lines
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(endX, originY);
    ctx.lineTo(endX, endY);
    ctx.moveTo(originX, endY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw X Component (Cosine mapped - Blue)
    drawArrow(originX, originY, endX, originY, '#3b82f6');
    
    // Draw Y Component (Sine mapped - Yellowish/Orange)
    drawArrow(originX, originY, originX, endY, '#f59e0b');

    // Draw Main Resultant Vector (White)
    drawArrow(originX, originY, endX, endY, '#ffffff');

    // Draw Arc for Theta
    ctx.beginPath();
    ctx.arc(originX, originY, 40, 0, -angleRadians, true);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Label Theta
    ctx.fillStyle = '#888';
    ctx.font = '14px Inter';
    ctx.fillText('θ', originX + 50 * Math.cos(-angleRadians/2), originY + 50 * Math.sin(-angleRadians/2));
}

// Event Listeners for Sliders
magSlider.addEventListener('input', draw);
angleSlider.addEventListener('input', draw);

// Initial Draw
resizeCanvas();
