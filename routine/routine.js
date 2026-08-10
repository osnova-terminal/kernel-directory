/*

ROUTINE — CHAIN ASSEMBLY TERMINAL

MODULES holds every issued module: code, full name, call sign,
category, Unit Size, and ports. Ports use "F" (receives signal),
"M" (outputs signal), and "P" (passive — attaches to a chain but
does not participate in signal flow).

ROUTINES holds every IO-authorized combination as an ordered
array of module codes. The active chain is compared against this
table on every change: an exact ordered match reveals the
routine's name. Anything else reads ROUTINE UNKNOWN.

To add a new module or routine, add an entry to the relevant
array below following the existing shape. Nothing else needs to
change — the directory, chain rail, and matcher all read from
these two arrays.

*/

const ROUTINE_KEY = "routineCards";

const MODULES = [
    { code: "CCM-01", name: "Core Control Module", callsign: "Mainframe Node", category: "CORE", size: 2, ports: ["F","F","F"] },
    { code: "ESP-D01", name: "Extrasensory Proximity Detector", callsign: "Sonde", category: "DETECTION — ESP", size: 1, ports: ["M"] },
    { code: "ESP-D02", name: "Wide-Field Emission Scanner", callsign: "Sweep Head", category: "DETECTION — ESP", size: 2, ports: ["M","M"] },
    { code: "ESP-D03", name: "Signature Lock Retainer", callsign: "Anchor Block", category: "DETECTION — ESP", size: 2, ports: ["F","M"] },
    { code: "ESP-D04", name: "Extended Range Amplification Crown", callsign: "Tall Crown", category: "DETECTION — ESP", size: 3, ports: ["P"] },
    { code: "HFN-N01", name: "Higgs Field Null Spike", callsign: "Spike", category: "NULLIFICATION — HFN", size: 1, ports: ["M"] },
    { code: "HFN-N02", name: "Localized Null Zone Projector", callsign: "Pixel Void", category: "NULLIFICATION — HFN", size: 3, ports: ["F","M"] },
    { code: "HFN-N03", name: "Perimeter Null Field Stake", callsign: "Ground Stake", category: "NULLIFICATION — HFN", size: 4, ports: ["F"] },
    { code: "HFN-N04", name: "Null Pulse Emitter", callsign: "Pulse", category: "NULLIFICATION — HFN", size: 2, ports: ["M"] },
    { code: "HFN-N05", name: "Cognitive Spike", callsign: "Spike-II", category: "NULLIFICATION — HFN", size: 1, ports: ["M"] },
    { code: "HFN-N06", name: "Signal Shear", callsign: "Shear", category: "NULLIFICATION — HFN", size: 2, ports: ["F","M"] },
    { code: "HFN-N07", name: "Pattern Fracture", callsign: "Fracture", category: "NULLIFICATION — HFN", size: 3, ports: ["F","F"] },
    { code: "HFN-N08", name: "Null Lance", callsign: "Lance", category: "NULLIFICATION — HFN", size: 2, ports: ["M"] },
    { code: "HFN-N09", name: "Echo Breaker", callsign: "Echo", category: "NULLIFICATION — HFN", size: 2, ports: ["F","M"] },
    { code: "HFS-S01", name: "Higgs Field Shield Plate", callsign: "Screen", category: "SHIELDING — HFS", size: 1, ports: ["P"] },
    { code: "HFS-S02", name: "Radial Suppression Mantle", callsign: "Mantle", category: "SHIELDING — HFS", size: 2, ports: ["P"] },
    { code: "SIG-C01", name: "Signal Retention Coil", callsign: "Coil", category: "SIGNAL — SIG", size: 1, ports: ["F"] },
    { code: "SIG-C02", name: "Dual-Input Signal Processor", callsign: "Drum", category: "SIGNAL — SIG", size: 3, ports: ["F","F","M"] },
    { code: "SIG-C03", name: "Directional Signal Lens", callsign: "Lens", category: "SIGNAL — SIG", size: 2, ports: ["F","M"] },
    { code: "SIG-C04", name: "Twin-Port Stabilization Frame", callsign: "Frame", category: "SIGNAL — SIG", size: 2, ports: ["F","F"] }
];

const ROUTINES = [
    { code: "DSB-01", name: "Direct Signal Break", callsign: "Precision Lance", size: 6, sequence: ["ESP-D03","SIG-C01","SIG-C03","HFN-N05"] },
    { code: "ADS-01", name: "Amplified Direct Strike", callsign: "Long Needle", size: 11, sequence: ["ESP-D03","SIG-C04","SIG-C02","SIG-C01","SIG-C03","HFN-N05"] },
    { code: "CSB-01", name: "Cone Signal Break", callsign: "Wide Break", size: 4, sequence: ["SIG-C03","HFN-N05"] },
    { code: "LNC-01", name: "Direct Null Lance", callsign: "Pierce", size: 3, sequence: ["SIG-C03","HFN-N08"] },
    { code: "RPS-01", name: "Radial Pulse System", callsign: "Shock Ring", size: 2, sequence: ["HFN-N04"] },
    { code: "FRC-01", name: "Fractured Output Chain", callsign: "Split Strike", size: 5, sequence: ["SIG-C01","HFN-N07"] },
    { code: "ECH-01", name: "Echoed Strike Loop", callsign: "Aftershock", size: 4, sequence: ["SIG-C01","HFN-N09"] },
    { code: "PSF-01", name: "Proximity Sweep Field", callsign: "Wide Net", size: 3, sequence: ["ESP-D01","SIG-C03"] },
    { code: "ASF-01", name: "Anchored Sweep Field", callsign: "Tracking Arc", size: 4, sequence: ["ESP-D03","SIG-C03"] },
    { code: "MSF-01", name: "Multi-Sweep Filter", callsign: "Noise Map", size: 5, sequence: ["ESP-D02","SIG-C02","SIG-C03"] },
    { code: "LNZ-01", name: "Local Null Zone", callsign: "Void Field", size: 3, sequence: ["HFN-N02"] },
    { code: "SPF-01", name: "Static Perimeter Field", callsign: "Iron Curtain", size: 9, sequence: ["ESP-D02","SIG-C02","HFN-N03"] }
];

const CATEGORY_ORDER = ["CORE", "DETECTION — ESP", "NULLIFICATION — HFN", "SHIELDING — HFS", "SIGNAL — SIG"];

const moduleByCode = {};
MODULES.forEach(m => moduleByCode[m.code] = m);

let chain = [];
let dragIndex = null;

// ===== CARD SAVING =====

function loadRoutineCards(){
    try{
        const raw = window.localStorage.getItem(ROUTINE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch(err){
        console.error("Failed to load routine cards", err);
        return [];
    }
}

function saveRoutineCards(cards){
    try{
        window.localStorage.setItem(ROUTINE_KEY, JSON.stringify(cards));
    } catch(err){
        console.error("Failed to save routine cards", err);
    }
}

function isPassive(mod){
    return mod.ports.length === 1 && mod.ports[0] === "P";
}

function portsLabel(ports){
    return ports.join("+");
}

// ---------- rendering: directory ----------

function renderDirectory(){
    const root = document.getElementById("directory");
    root.innerHTML = "";
    CATEGORY_ORDER.forEach((cat, catIndex) => {
        const head = document.createElement("div");
        head.className = "category-head" + (catIndex === 0 ? " category-head-first" : "");
        head.textContent = cat;
        root.appendChild(head);
        const grid = document.createElement("div");
        grid.className = "module-grid";
        MODULES.filter(m => m.category === cat).forEach(mod => {
            const card = document.createElement("div");
            card.className = "module-card";
            card.dataset.code = mod.code;
            const count = chain.filter(c => c === mod.code).length;
            card.innerHTML = `
                ${count > 0 ? `<span class="mc-count">×${count}</span>` : ""}
                <div class="mcode">${mod.code}</div>
                <h3>${mod.callsign}</h3>
                <div class="mmeta mc-dim">${mod.size}U · ${portsLabel(mod.ports)}</div>
            `;
            card.addEventListener("click", () => {
                chain.push(mod.code);
                update();
            });
            grid.appendChild(card);
        });
        root.appendChild(grid);
    });
}

// ---------- rendering: chain rail ----------

function renderRail(){
    const rail = document.getElementById("rail");
    rail.innerHTML = "";
    if(chain.length === 0){
        rail.innerHTML = '<div class="rail-empty">NO MODULES ATTACHED</div>';
        return;
    }
    chain.forEach((code, i) => {
        const mod = moduleByCode[code];
        const node = document.createElement("div");
        node.className = "chain-node";
        node.draggable = true;
        node.dataset.index = i;
        node.innerHTML = `
            <div>
                <div class="cn-code">${mod.code}</div>
                <div class="cn-name">${mod.callsign}</div>
                <div class="cn-meta">${mod.size}U · ${portsLabel(mod.ports)}</div>
            </div>
            <div class="cn-controls">
                <button type="button" data-act="left" title="Move left">◂</button>
                <button type="button" data-act="remove" title="Remove">✕</button>
                <button type="button" data-act="right" title="Move right">▸</button>
            </div>
        `;
        node.addEventListener("dragstart", () => {
            dragIndex = i;
            node.classList.add("dragging");
        });
        node.addEventListener("dragend", () => {
            node.classList.remove("dragging");
            dragIndex = null;
        });
        node.addEventListener("dragover", (e) => e.preventDefault());
        node.addEventListener("drop", (e) => {
            e.preventDefault();
            if(dragIndex === null || dragIndex === i) return;
            const moved = chain.splice(dragIndex, 1)[0];
            chain.splice(i, 0, moved);
            update();
        });
        node.querySelector('[data-act="remove"]').addEventListener("click", () => {
            chain.splice(i, 1);
            update();
        });
        node.querySelector('[data-act="left"]').addEventListener("click", () => {
            if(i === 0) return;
            [chain[i - 1], chain[i]] = [chain[i], chain[i - 1]];
            update();
        });
        node.querySelector('[data-act="right"]').addEventListener("click", () => {
            if(i === chain.length - 1) return;
            [chain[i + 1], chain[i]] = [chain[i], chain[i + 1]];
            update();
        });
        rail.appendChild(node);
        if(i < chain.length - 1){
            const nextMod = moduleByCode[chain[i + 1]];
            const connector = document.createElement("div");
            if(isPassive(mod) || isPassive(nextMod)){
                connector.className = "connector attached";
            } else if(mod.ports.includes("M") && nextMod.ports.includes("F")){
                connector.className = "connector ok";
            } else {
                connector.className = "connector mismatch";
            }
            rail.appendChild(connector);
        }
    });
}

// ---------- stats + matching ----------

function computeIntegrity(){
    if(chain.length < 2) return "NOMINAL";
    for(let i = 0; i < chain.length - 1; i++){
        const cur = moduleByCode[chain[i]];
        const next = moduleByCode[chain[i + 1]];
        if(isPassive(cur) || isPassive(next)) continue;
        if(!(cur.ports.includes("M") && next.ports.includes("F"))){
            return "BREACH AT NODE " + (i + 1);
        }
    }
    return "NOMINAL";
}

function matchRoutine(){
    return ROUTINES.find(r =>
        r.sequence.length === chain.length &&
        r.sequence.every((code, i) => code === chain[i])
    ) || null;
}

const glitchAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-—";

function scramble(text){
    return text
        .split("")
        .map(c => (c === " " ? c : (Math.random() < 0.55 ? glitchAlphabet[Math.floor(Math.random() * glitchAlphabet.length)] : c)))
        .join("");
}

let glitchTimer = null;

function revealResult(finalText){
    const el = document.getElementById("resultName");
    if(glitchTimer) clearTimeout(glitchTimer);
    el.classList.add("shake");
    let frame = 0;
    function step(){
        if(frame < 3){
            el.textContent = scramble(finalText);
            frame++;
            glitchTimer = setTimeout(step, 40);
        } else {
            el.textContent = finalText;
            el.classList.remove("shake");
        }
    }
    step();
}

function updateResultPanel(){
    const statusEl = document.getElementById("resultStatus");
    const subEl = document.getElementById("resultSub");
    if(chain.length === 0){
        statusEl.textContent = "STATUS: IDLE — AWAITING MODULE INPUT";
        revealResult("");
        subEl.textContent = "";
        return;
    }
    const match = matchRoutine();
    if(match){
        statusEl.textContent = "STATUS: ROUTINE MATCHED";
        revealResult(match.name.toUpperCase());
        subEl.textContent = `${match.code} · "${match.callsign}" · REGISTERED SIZE ${match.size}U`;
        const cards = loadRoutineCards();
        const exists = cards.find(c => c.code === match.code);
        if(!exists){
            cards.push({
                id: match.code,
                code: match.code,
                name: match.name,
                callsign: match.callsign,
                size: match.size,
                sequence: match.sequence
            });
            saveRoutineCards(cards);
        }
    } else {
        statusEl.textContent = "STATUS: UNSANCTIONED CONFIGURATION";
        revealResult("ROUTINE UNKNOWN");
        subEl.textContent = "NO MATCH IN THE IO AUTHORIZED ROUTINE TABLE";
    }
}

function update(){
    renderRail();
    renderDirectory();
    const totalSize = chain.reduce((sum, code) => sum + moduleByCode[code].size, 0);
    document.getElementById("statSize").textContent = totalSize + "U";
    document.getElementById("statCount").textContent = chain.length;
    document.getElementById("statIntegrity").textContent = computeIntegrity();
    updateResultPanel();
}

// ---------- manual input ----------

function parseManualInput(raw){
    return raw
        .split(/→|,/)
        .map(s => s.trim().toUpperCase())
        .filter(s => s.length > 0);
}

// ---------- init ----------

document.addEventListener("DOMContentLoaded", () => {
    update();
    document.getElementById("clearBtn").addEventListener("click", () => {
        chain = [];
        update();
    });
    document.getElementById("buildBtn").addEventListener("click", () => {
        const raw = document.getElementById("manualInput").value;
        const codes = parseManualInput(raw);
        chain = codes.filter(code => moduleByCode[code] !== undefined);
        update();
    });
    document.getElementById("manualInput").addEventListener("keydown", (e) => {
        if(e.key === "Enter"){
            e.preventDefault();
            document.getElementById("buildBtn").click();
        }
    });
});

console.log("ROUTINE TERMINAL ONLINE");
console.log("ASSEMBLE THE CHAIN. THE SYSTEM WILL TELL YOU WHAT IT IS.");
