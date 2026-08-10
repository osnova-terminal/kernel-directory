/*

MODULE LATTICE — Complete Module Directory
BUILD: 2026-08-03

Displays every issued module, grouped by category. Click a card
(or its SELECT button) to toggle it into the current selection,
then SAVE SELECTED TO INVENTORY writes each selected module as a
card into localStorage under ROUTINE_KEY ("routineCards") — the
same key the Routine builder reads from, so anything saved here
is immediately available there too.

Selection itself is NOT persisted — only committed cards are.
Refreshing this page clears the in-progress selection but never
touches what's already saved.

*/

const MODULES = [
    // ===== DETECTION — ESP =====
    {
        code: "ESP-D01",
        name: "Extrasensory Proximity Detector",
        callsign: "SONDE",
        category: "DETECTION — ESP",
        size: 1,
        ports: ["M"],
        appearance: "White rectangular puck, matchbox-thick. Dark mesh grille face, single green phosphor LED pulsing like a slow heartbeat.",
        function: "Returns a snapshot of nearby presence as spatial 'shapes.'",
        use: "Check rooms, sense through walls, identify density and rough position.",
        limit: "Snapshot only, becomes unreliable as targets move."
    },
    {
        code: "ESP-D02",
        name: "Wide-Field Emission Scanner",
        callsign: "SWEEP HEAD",
        category: "DETECTION — ESP",
        size: 2,
        ports: ["M","M"],
        appearance: "Wedge unit with brushed metal face and a narrow CRT strip. A scanning line sweeps vertically.",
        function: "Produces continuous wide-area scans.",
        use: "Area awareness, detect movement zones.",
        limit: "Broad and noisy, no precision."
    },
    {
        code: "ESP-D03",
        name: "Signature Lock Retainer",
        callsign: "ANCHOR BLOCK",
        category: "DETECTION — ESP",
        size: 2,
        ports: ["F","M"],
        appearance: "Blocky white brick with a small CRT grid showing a single blinking dot.",
        function: "Locks onto one signature and updates it continuously.",
        use: "Track a specific target, maintain identity through movement.",
        limit: "Only one target; requires initial acquisition."
    },
    {
        code: "ESP-D04",
        name: "Extended Range Amplification Crown",
        callsign: "TALL CROWN",
        category: "DETECTION — ESP",
        size: 3,
        ports: ["P"],
        appearance: "Rigid white headband with a top-mounted vented module, constant green glow.",
        function: "Extends range and sensitivity of detection systems.",
        use: "Amplify detection range.",
        limit: "No standalone output."
    },

    // ===== NULLIFICATION — HFN =====
    {
        code: "HFN-N01",
        name: "Null Spike",
        callsign: "SPIKE",
        category: "NULLIFICATION — HFN",
        size: 1,
        ports: ["M"],
        appearance: "Short white rod with metal tip and single LED.",
        function: "Contact-based nullification.",
        use: "Direct contact nullification.",
        limit: "Requires physical contact."
    },
    {
        code: "HFN-N02",
        name: "Local Null Projector",
        callsign: "PIXEL VOID",
        category: "NULLIFICATION — HFN",
        size: 3,
        ports: ["F","M"],
        appearance: "Brick unit with CRT showing a pixelated circle radius.",
        function: "Creates a localized null field.",
        use: "Area nullification.",
        limit: "Limited radius."
    },
    {
        code: "HFN-N03",
        name: "Perimeter Stake",
        callsign: "GROUND STAKE",
        category: "NULLIFICATION — HFN",
        size: 4,
        ports: ["F"],
        appearance: "White column with metal spike base, CRT radius display.",
        function: "Anchors a persistent null perimeter.",
        use: "Area denial, perimeter defense.",
        limit: "Stationary once placed."
    },
    {
        code: "HFN-N04",
        name: "Null Pulse",
        callsign: "PULSE",
        category: "NULLIFICATION — HFN",
        size: 2,
        ports: ["M"],
        appearance: "Flat circular emitter with radial vent pattern.",
        function: "Emits radial NRV disruption.",
        use: "Area disruption.",
        limit: "Single pulse."
    },
    {
        code: "HFN-N05",
        name: "Cognitive Spike",
        callsign: "SPIKE-II",
        category: "NULLIFICATION — HFN",
        size: 1,
        ports: ["M"],
        appearance: "Compact rectangular emitter, no screen, single green LED.",
        function: "Single-target BRN strike.",
        use: "Targeted cognitive disruption.",
        limit: "Single target only."
    },
    {
        code: "HFN-N06",
        name: "Signal Shear",
        callsign: "SHEAR",
        category: "NULLIFICATION — HFN",
        size: 2,
        ports: ["F","M"],
        appearance: "Split housing with visible internal relays clicking.",
        function: "Interrupts signal flow / disrupts actions.",
        use: "Interrupt ongoing actions.",
        limit: "Requires signal input."
    },
    {
        code: "HFN-N07",
        name: "Pattern Fracture",
        callsign: "FRACTURE",
        category: "NULLIFICATION — HFN",
        size: 3,
        ports: ["F","F"],
        appearance: "Wide chassis with dual input ports and branching circuitry visible.",
        function: "Splits signal across multiple targets.",
        use: "Multi-target disruption.",
        limit: "Reduced effect per target."
    },
    {
        code: "HFN-N08",
        name: "Null Lance",
        callsign: "LANCE",
        category: "NULLIFICATION — HFN",
        size: 2,
        ports: ["M"],
        appearance: "Elongated emitter with narrow aperture front.",
        function: "Directional NRV strike.",
        use: "Precision nullification.",
        limit: "Line of sight required."
    },
    {
        code: "HFN-N09",
        name: "Echo Breaker",
        callsign: "ECHO",
        category: "NULLIFICATION — HFN",
        size: 2,
        ports: ["F","M"],
        appearance: "Box with dual-phase indicator blinking out of sync.",
        function: "Repeats signal next turn at reduced strength.",
        use: "Delayed effect.",
        limit: "Reduced strength on repeat."
    },

    // ===== SHIELDING — HFS =====
    {
        code: "HFS-S01",
        name: "Shield Plate",
        callsign: "SCREEN",
        category: "SHIELDING — HFS",
        size: 1,
        ports: ["P"],
        appearance: "Flat white plate, no display, single LED.",
        function: "Localized protection.",
        use: "Personal shielding.",
        limit: "Localized only."
    },
    {
        code: "HFS-S02",
        name: "Suppression Mantle",
        callsign: "MANTLE",
        category: "SHIELDING — HFS",
        size: 2,
        ports: ["P"],
        appearance: "Heavy white vest with embedded indicator box.",
        function: "Passive suppression field.",
        use: "Area suppression.",
        limit: "No offensive capability."
    },

    // ===== SIGNAL — SIG =====
    {
        code: "SIG-C01",
        name: "Retention Coil",
        callsign: "COIL",
        category: "SIGNAL — SIG",
        size: 1,
        ports: ["F"],
        appearance: "Cylindrical unit with vertical LED charge strip.",
        function: "Triggers instantly when signal changes.",
        use: "Signal detection.",
        limit: "Single input only."
    },
    {
        code: "SIG-C02",
        name: "Signal Processor",
        callsign: "DRUM",
        category: "SIGNAL — SIG",
        size: 3,
        ports: ["F","F","M"],
        appearance: "Wide unit with dual inputs and CRT waveform merge display.",
        function: "Combines and stabilizes signals.",
        use: "Signal merging.",
        limit: "Requires two inputs."
    },
    {
        code: "SIG-C03",
        name: "Signal Lens",
        callsign: "LENS",
        category: "SIGNAL — SIG",
        size: 2,
        ports: ["F","M"],
        appearance: "Projector-like aperture with rotary angle dial.",
        function: "Narrows signal into a direction.",
        use: "Directional signal focusing.",
        limit: "Reduced spread."
    },
    {
        code: "SIG-C04",
        name: "Stabilization Frame",
        callsign: "FRAME",
        category: "SIGNAL — SIG",
        size: 2,
        ports: ["F","F"],
        appearance: "Flat chassis with exposed internal green circuitry.",
        function: "Prevents instability in chains.",
        use: "Chain stabilization.",
        limit: "No output."
    }
];

const ROUTINE_KEY = "routineCards"; // shared with routine.js

let selectedModules = new Set();

// ===== SAVED CARDS (localStorage) =====

function loadRoutineCards(){
    try{
        const raw = window.localStorage.getItem(ROUTINE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch(err){
        console.error("MODULE LATTICE — failed to load saved cards", err);
        return [];
    }
}

function saveRoutineCards(cards){
    try{
        window.localStorage.setItem(ROUTINE_KEY, JSON.stringify(cards));
    } catch(err){
        console.error("MODULE LATTICE — failed to save cards", err);
    }
}

function getSavedCodes(){
    return new Set(loadRoutineCards().map(c => c.code));
}

// ===== STATUS LINE (replaces native alert() popups) =====

let statusTimer = null;

function showStatus(message){

    const el = document.getElementById("statusLine");
    if(!el) return;

    if(statusTimer) clearTimeout(statusTimer);

    el.textContent = message;
    el.classList.add("show");
    el.classList.add("flash");

    setTimeout(() => el.classList.remove("flash"), 300);

    statusTimer = setTimeout(() => {
        el.classList.remove("show");
    }, 5000);

}

// ===== RENDER =====

function renderModules(){

    const container = document.getElementById("moduleContainer");
    if(!container) return;

    const savedCodes = getSavedCodes();
    const categoryOrder = ["DETECTION — ESP", "NULLIFICATION — HFN", "SHIELDING — HFS", "SIGNAL — SIG"];

    let html = "";
    let total = 0;

    categoryOrder.forEach(category => {

        const modulesInCat = MODULES.filter(m => m.category === category);
        if(modulesInCat.length === 0) return;
        total += modulesInCat.length;

        html += `<div class="category-section">
            <div class="category-header">
                ${category}
                <span class="count">${modulesInCat.length} modules</span>
            </div>
            <div class="module-grid">`;

        modulesInCat.forEach(module => {

            const isSelected = selectedModules.has(module.code);
            const isSaved = savedCodes.has(module.code);

            html += `
                <div class="module-card ${isSelected ? 'selected' : ''}" data-code="${module.code}">
                    <div class="module-code">${module.code}</div>
                    <div class="module-name">${module.name}</div>
                    <div class="module-callsign">"${module.callsign}"</div>
                    <div class="module-meta">
                        <span>${module.size}U</span>
                        <span>Ports: ${module.ports.join('+')}</span>
                        ${isSaved ? '<span class="tag" style="border-color:var(--fg);color:var(--fg);">IN INVENTORY</span>' : ''}
                    </div>
                    ${module.appearance ? `<div class="module-appearance">${module.appearance}</div>` : ''}
                    ${module.function ? `<div class="module-function"><strong>Function:</strong> ${module.function}</div>` : ''}
                    ${module.use ? `<div class="module-use">Use: ${module.use}</div>` : ''}
                    ${module.limit ? `<div class="module-limit">Limit: ${module.limit}</div>` : ''}
                    <button class="module-select-btn ${isSelected ? 'selected' : ''}" data-code="${module.code}">
                        ${isSelected ? 'DESELECT' : 'SELECT'}
                    </button>
                </div>
            `;

        });

        html += `</div></div>`;

    });

    container.innerHTML = html;
    document.getElementById("totalCount").textContent = total;
    updateStats();

    container.querySelectorAll(".module-card").forEach(card => {
        card.addEventListener("click", function(e){
            if(e.target.classList.contains("module-select-btn")) return;
            toggleModule(this.dataset.code);
        });
    });

    container.querySelectorAll(".module-select-btn").forEach(btn => {
        btn.addEventListener("click", function(e){
            e.stopPropagation();
            toggleModule(this.dataset.code);
        });
    });

}

function toggleModule(code){
    if(selectedModules.has(code)){
        selectedModules.delete(code);
    } else {
        selectedModules.add(code);
    }
    renderModules();
}

function updateStats(){

    document.getElementById("selectedCount").textContent = selectedModules.size;

    let slots = 0;
    selectedModules.forEach(code => {
        const module = MODULES.find(m => m.code === code);
        if(module) slots += module.size;
    });
    document.getElementById("slotsUsed").textContent = slots;

}

// ===== SAVE SELECTED =====

function saveSelectedToInventory(){

    if(selectedModules.size === 0){
        showStatus("NO MODULES SELECTED — CLICK A CARD FIRST");
        return;
    }

    const existingCards = loadRoutineCards();
    const existingCodes = new Set(existingCards.map(c => c.code));

    let addedCount = 0;
    let skippedCount = 0;

    selectedModules.forEach(code => {

        const module = MODULES.find(m => m.code === code);
        if(!module) return;

        if(existingCodes.has(code)){
            skippedCount++;
            return;
        }

        existingCards.push({
            id: module.code,
            code: module.code,
            name: module.name,
            callsign: module.callsign,
            size: module.size,
            ports: module.ports,
            category: module.category,
            sequence: [module.code],
            appearance: module.appearance,
            function: module.function,
            use: module.use,
            limit: module.limit,
            type: "module"
        });

        addedCount++;

    });

    saveRoutineCards(existingCards);

    if(addedCount === 0 && skippedCount > 0){
        showStatus("ALL SELECTED MODULES ALREADY IN INVENTORY (" + skippedCount + " SKIPPED)");
    } else if(skippedCount > 0){
        showStatus("ADDED " + addedCount + " · SKIPPED " + skippedCount + " (ALREADY IN INVENTORY)");
    } else {
        showStatus("ADDED " + addedCount + " MODULE CARD" + (addedCount > 1 ? "S" : "") + " TO INVENTORY");
    }

    selectedModules.clear();
    renderModules();

}

// ===== SELECT ALL / CLEAR ALL =====

function selectAll(){
    MODULES.forEach(m => selectedModules.add(m.code));
    renderModules();
}

function clearAll(){
    selectedModules.clear();
    renderModules();
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", function(){

    console.log("MODULE LATTICE ONLINE — BUILD 2026-08-03");
    console.log(MODULES.length + " modules available");

    renderModules();

    document.getElementById("selectAllBtn").addEventListener("click", selectAll);
    document.getElementById("clearAllBtn").addEventListener("click", clearAll);
    document.getElementById("saveToInventoryBtn").addEventListener("click", saveSelectedToInventory);

});
