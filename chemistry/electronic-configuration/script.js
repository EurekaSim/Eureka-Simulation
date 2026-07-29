const canvas = document.getElementById('orbitalCanvas');
const ctx = canvas.getContext('2d');

const zSlider = document.getElementById('atomicNumberSlider');
const zInput = document.getElementById('atomicNumberInput');
const elSymbol = document.getElementById('elementSymbol');
const elName = document.getElementById('elementName');
const configReadout = document.getElementById('configReadout');

const qN = document.getElementById('qN');
const qL = document.getElementById('qL');
const qMl = document.getElementById('qMl');
const qMs = document.getElementById('qMs');

// Comprehensive compressed data for all 118 Elements
// Format: "Symbol,Name,Config,n,l,ml,ms"
const elementData = [
    "H,Hydrogen,1s¹,1,0,0,+½", "He,Helium,1s²,1,0,0,-½", "Li,Lithium,[He] 2s¹,2,0,0,+½", "Be,Beryllium,[He] 2s²,2,0,0,-½", 
    "B,Boron,[He] 2s² 2p¹,2,1,-1,+½", "C,Carbon,[He] 2s² 2p²,2,1,0,+½", "N,Nitrogen,[He] 2s² 2p³,2,1,+1,+½", 
    "O,Oxygen,[He] 2s² 2p⁴,2,1,-1,-½", "F,Fluorine,[He] 2s² 2p⁵,2,1,0,-½", "Ne,Neon,[He] 2s² 2p⁶,2,1,+1,-½", 
    "Na,Sodium,[Ne] 3s¹,3,0,0,+½", "Mg,Magnesium,[Ne] 3s²,3,0,0,-½", "Al,Aluminum,[Ne] 3s² 3p¹,3,1,-1,+½", 
    "Si,Silicon,[Ne] 3s² 3p²,3,1,0,+½", "P,Phosphorus,[Ne] 3s² 3p³,3,1,+1,+½", "S,Sulfur,[Ne] 3s² 3p⁴,3,1,-1,-½", 
    "Cl,Chlorine,[Ne] 3s² 3p⁵,3,1,0,-½", "Ar,Argon,[Ne] 3s² 3p⁶,3,1,+1,-½", "K,Potassium,[Ar] 4s¹,4,0,0,+½", 
    "Ca,Calcium,[Ar] 4s²,4,0,0,-½", "Sc,Scandium,[Ar] 3d¹ 4s²,3,2,-2,+½", "Ti,Titanium,[Ar] 3d² 4s²,3,2,-1,+½", 
    "V,Vanadium,[Ar] 3d³ 4s²,3,2,0,+½", "Cr,Chromium,[Ar] 3d⁵ 4s¹,3,2,+2,+½", "Mn,Manganese,[Ar] 3d⁵ 4s²,3,2,+2,+½", 
    "Fe,Iron,[Ar] 3d⁶ 4s²,3,2,-2,-½", "Co,Cobalt,[Ar] 3d⁷ 4s²,3,2,-1,-½", "Ni,Nickel,[Ar] 3d⁸ 4s²,3,2,0,-½", 
    "Cu,Copper,[Ar] 3d¹⁰ 4s¹,3,2,+2,-½", "Zn,Zinc,[Ar] 3d¹⁰ 4s²,3,2,+2,-½", "Ga,Gallium,[Ar] 3d¹⁰ 4s² 4p¹,4,1,-1,+½", 
    "Ge,Germanium,[Ar] 3d¹⁰ 4s² 4p²,4,1,0,+½", "As,Arsenic,[Ar] 3d¹⁰ 4s² 4p³,4,1,+1,+½", "Se,Selenium,[Ar] 3d¹⁰ 4s² 4p⁴,4,1,-1,-½", 
    "Br,Bromine,[Ar] 3d¹⁰ 4s² 4p⁵,4,1,0,-½", "Kr,Krypton,[Ar] 3d¹⁰ 4s² 4p⁶,4,1,+1,-½", "Rb,Rubidium,[Kr] 5s¹,5,0,0,+½", 
    "Sr,Strontium,[Kr] 5s²,5,0,0,-½", "Y,Yttrium,[Kr] 4d¹ 5s²,4,2,-2,+½", "Zr,Zirconium,[Kr] 4d² 5s²,4,2,-1,+½", 
    "Nb,Niobium,[Kr] 4d⁴ 5s¹,4,2,+1,+½", "Mo,Molybdenum,[Kr] 4d⁵ 5s¹,4,2,+2,+½", "Tc,Technetium,[Kr] 4d⁵ 5s²,4,2,+2,+½", 
    "Ru,Ruthenium,[Kr] 4d⁷ 5s¹,4,2,-1,-½", "Rh,Rhodium,[Kr] 4d⁸ 5s¹,4,2,0,-½", "Pd,Palladium,[Kr] 4d¹⁰,4,2,+2,-½", 
    "Ag,Silver,[Kr] 4d¹⁰ 5s¹,4,2,+2,-½", "Cd,Cadmium,[Kr] 4d¹⁰ 5s²,4,2,+2,-½", "In,Indium,[Kr] 4d¹⁰ 5s² 5p¹,5,1,-1,+½", 
    "Sn,Tin,[Kr] 4d¹⁰ 5s² 5p²,5,1,0,+½", "Sb,Antimony,[Kr] 4d¹⁰ 5s² 5p³,5,1,+1,+½", "Te,Tellurium,[Kr] 4d¹⁰ 5s² 5p⁴,5,1,-1,-½", 
    "I,Iodine,[Kr] 4d¹⁰ 5s² 5p⁵,5,1,0,-½", "Xe,Xenon,[Kr] 4d¹⁰ 5s² 5p⁶,5,1,+1,-½", "Cs,Cesium,[Xe] 6s¹,6,0,0,+½", 
    "Ba,Barium,[Xe] 6s²,6,0,0,-½", "La,Lanthanum,[Xe] 5d¹ 6s²,5,2,-2,+½", "Ce,Cerium,[Xe] 4f¹ 5d¹ 6s²,4,3,-3,+½", 
    "Pr,Praseodymium,[Xe] 4f³ 6s²,4,3,-1,+½", "Nd,Neodymium,[Xe] 4f⁴ 6s²,4,3,0,+½", "Pm,Promethium,[Xe] 4f⁵ 6s²,4,3,+1,+½", 
    "Sm,Samarium,[Xe] 4f⁶ 6s²,4,3,+2,+½", "Eu,Europium,[Xe] 4f⁷ 6s²,4,3,+3,+½", "Gd,Gadolinium,[Xe] 4f⁷ 5d¹ 6s²,4,3,+3,+½", 
    "Tb,Terbium,[Xe] 4f⁹ 6s²,4,3,-2,-½", "Dy,Dysprosium,[Xe] 4f¹⁰ 6s²,4,3,-1,-½", "Ho,Holmium,[Xe] 4f¹¹ 6s²,4,3,0,-½", 
    "Er,Erbium,[Xe] 4f¹² 6s²,4,3,+1,-½", "Tm,Thulium,[Xe] 4f¹³ 6s²,4,3,+2,-½", "Yb,Ytterbium,[Xe] 4f¹⁴ 6s²,4,3,+3,-½", 
    "Lu,Lutetium,[Xe] 4f¹⁴ 5d¹ 6s²,5,2,-2,+½", "Hf,Hafnium,[Xe] 4f¹⁴ 5d² 6s²,5,2,-1,+½", "Ta,Tantalum,[Xe] 4f¹⁴ 5d³ 6s²,5,2,0,+½", 
    "W,Tungsten,[Xe] 4f¹⁴ 5d⁴ 6s²,5,2,+1,+½", "Re,Rhenium,[Xe] 4f¹⁴ 5d⁵ 6s²,5,2,+2,+½", "Os,Osmium,[Xe] 4f¹⁴ 5d⁶ 6s²,5,2,-2,-½", 
    "Ir,Iridium,[Xe] 4f¹⁴ 5d⁷ 6s²,5,2,-1,-½", "Pt,Platinum,[Xe] 4f¹⁴ 5d⁹ 6s¹,5,2,+1,-½", "Au,Gold,[Xe] 4f¹⁴ 5d¹⁰ 6s¹,5,2,+2,-½", 
    "Hg,Mercury,[Xe] 4f¹⁴ 5d¹⁰ 6s²,5,2,+2,-½", "Tl,Thallium,[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹,6,1,-1,+½", "Pb,Lead,[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²,6,1,0,+½", 
    "Bi,Bismuth,[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³,6,1,+1,+½", "Po,Polonium,[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴,6,1,-1,-½", "At,Astatine,[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵,6,1,0,-½", 
    "Rn,Radon,[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶,6,1,+1,-½", "Fr,Francium,[Rn] 7s¹,7,0,0,+½", "Ra,Radium,[Rn] 7s²,7,0,0,-½", 
    "Ac,Actinium,[Rn] 6d¹ 7s²,6,2,-2,+½", "Th,Thorium,[Rn] 6d² 7s²,6,2,-1,+½", "Pa,Protactinium,[Rn] 5f² 6d¹ 7s²,5,3,-2,+½", 
    "U,Uranium,[Rn] 5f³ 6d¹ 7s²,5,3,-1,+½", "Np,Neptunium,[Rn] 5f⁴ 6d¹ 7s²,5,3,0,+½", "Pu,Plutonium,[Rn] 5f⁶ 7s²,5,3,+2,+½", 
    "Am,Americium,[Rn] 5f⁷ 7s²,5,3,+3,+½", "Cm,Curium,[Rn] 5f⁷ 6d¹ 7s²,5,3,+3,+½", "Bk,Berkelium,[Rn] 5f⁹ 7s²,5,3,-2,-½", 
    "Cf,Californium,[Rn] 5f¹⁰ 7s²,5,3,-1,-½", "Es,Einsteinium,[Rn] 5f¹¹ 7s²,5,3,0,-½", "Fm,Fermium,[Rn] 5f¹² 7s²,5,3,+1,-½", 
    "Md,Mendelevium,[Rn] 5f¹³ 7s²,5,3,+2,-½", "No,Nobelium,[Rn] 5f¹⁴ 7s²,5,3,+3,-½", "Lr,Lawrencium,[Rn] 5f¹⁴ 7p¹ 7s²,7,1,-1,+½", 
    "Rf,Rutherfordium,[Rn] 5f¹⁴ 6d² 7s²,6,2,-1,+½", "Db,Dubnium,[Rn] 5f¹⁴ 6d³ 7s²,6,2,0,+½", "Sg,Seaborgium,[Rn] 5f¹⁴ 6d⁴ 7s²,6,2,+1,+½", 
    "Bh,Bohrium,[Rn] 5f¹⁴ 6d⁵ 7s²,6,2,+2,+½", "Hs,Hassium,[Rn] 5f¹⁴ 6d⁶ 7s²,6,2,-2,-½", "Mt,Meitnerium,[Rn] 5f¹⁴ 6d⁷ 7s²,6,2,-1,-½", 
    "Ds,Darmstadtium,[Rn] 5f¹⁴ 6d⁹ 7s¹,6,2,+1,-½", "Rg,Roentgenium,[Rn] 5f¹⁴ 6d¹⁰ 7s¹,6,2,+2,-½", "Cn,Copernicium,[Rn] 5f¹⁴ 6d¹⁰ 7s²,6,2,+2,-½", 
    "Nh,Nihonium,[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹,7,1,-1,+½", "Fl,Flerovium,[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²,7,1,0,+½", "Mc,Moscovium,[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³,7,1,+1,+½", 
    "Lv,Livermorium,[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴,7,1,-1,-½", "Ts,Tennessine,[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵,7,1,0,-½", "Og,Oganesson,[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶,7,1,+1,-½"
];

let currentZ = 1;

function resizeCanvas() {
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawProbabilityCloud(dataArr) {
    const originX = canvas.width / 2;
    const originY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 4;
    
    // Trailing particle decay effect
    ctx.fillStyle = 'rgba(10, 16, 31, 0.35)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(originX, originY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();

    const l = parseInt(dataArr[4]);
    const particles = 1500; 
    
    for (let i = 0; i < particles; i++) {
        let r, theta, x, y;

        // Visual cloud maps structurally to the azimuthal quantum number (l)
        if (l === 0) { // s-orbital (Spherical)
            r = Math.abs(randomGaussian(scale * 0.4, scale * 0.2));
            theta = Math.random() * Math.PI * 2;
        } else if (l === 1) { // p-orbital (Dumbbell)
            theta = Math.random() * Math.PI * 2;
            r = scale * Math.abs(Math.cos(theta) + Math.sin(theta)) * Math.random();
        } else if (l === 2) { // d-orbital (Clover)
            theta = Math.random() * Math.PI * 2;
            r = scale * 1.5 * Math.abs(Math.cos(2 * theta)) * Math.random();
        } else { // f-orbital (Complex multipole)
            theta = Math.random() * Math.PI * 2;
            r = scale * 1.8 * Math.abs(Math.sin(3 * theta)) * Math.random();
        }

        ctx.fillStyle = 'rgba(245, 158, 11, 0.3)'; 
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
    const dataArr = elementData[currentZ - 1].split(',');
    drawProbabilityCloud(dataArr);
    requestAnimationFrame(animate);
}

// Synchronize inputs and update UI
function updateUI(val) {
    currentZ = Math.min(Math.max(parseInt(val) || 1, 1), 118);
    zSlider.value = currentZ;
    zInput.value = currentZ;

    const dataArr = elementData[currentZ - 1].split(',');
    elSymbol.innerText = dataArr[0];
    elName.innerText = dataArr[1];
    configReadout.innerText = dataArr[2];
    
    qN.innerText = dataArr[3];
    qL.innerText = dataArr[4];
    qMl.innerText = dataArr[5];
    qMs.innerText = dataArr[6];
}

zSlider.addEventListener('input', (e) => updateUI(e.target.value));
zInput.addEventListener('input', (e) => updateUI(e.target.value));

updateUI(1);
animate();
