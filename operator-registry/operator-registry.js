/*
OPERATOR REGISTRY — CHARACTER SHEET LOGIC
BUILD: 2026-08-05
Now with Bale/Dread support (formerly Yoke/Flare)
*/

const REGISTRY_KEY = "operatorRegistry.v1";
const HEX_KEY = "hexGraveCards";
const KNOT_KEY = "linkKnotCards";
const ROUTINE_KEY = "routineCards";
const TELEMETRY_KEY = "afterimageTelemetryCards";

// Bale/Dread keys — these match what the banning-and-kindling page saves
const BALE_KEY = "baleCards";
const DREAD_KEY = "dreadCards";

// Legacy aliases for compatibility
const YOKE_KEY = BALE_KEY;
const FLARE_KEY = DREAD_KEY;

const READING_MIN = 8;
const READING_MAX = 16;
const READING_BUDGET = 36;

const DEFAULT_PROCEDURES = [
    { id: "archive-reading", name: "Archive Reading", desc: "Analysis, decoding.", reading: "BRN", stamped: false, lastResult: "" },
    { id: "signal-trace", name: "Signal Trace", desc: "Tracking, reconstruction.", reading: "BRN", stamped: false, lastResult: "" },
    { id: "anomaly-sense", name: "Anomaly Sense", desc: "Detection of irregularity.", reading: "BRN", stamped: false, lastResult: "" },
    { id: "field-movement", name: "Field Movement", desc: "Traversal, positioning.", reading: "FRM", stamped: false, lastResult: "" },
    { id: "manual-action", name: "Manual Action", desc: "Operation, manipulation.", reading: "FRM", stamped: false, lastResult: "" },
    { id: "static-step", name: "Static Step", desc: "Movement through material-static discontinuities.", reading: "FRM", stamped: false, lastResult: "" },
    { id: "stress-hold", name: "Stress Hold", desc: "Resistance to panic.", reading: "NRV", stamped: false, lastResult: "" },
    { id: "pain-gate", name: "Pain Gate", desc: "Endurance under damage.", reading: "NRV", stamped: false, lastResult: "" },
    { id: "pale-sense", name: "Pale Sense", desc: "Nervous perception of Pale interaction with Static.", reading: "NRV", stamped: false, lastResult: "" }
];

function defaultState(){
    return {
        name: "",
        kind: "",
        readings: { BRN: 12, FRM: 12, NRV: 12 },
        capacity: { baseline: 6, expanded: 0, used: 0 },
        procedures: DEFAULT_PROCEDURES.map(p => ({ ...p }))
    };
}

// ===== LOAD/SAVE FUNCTIONS =====

function loadState(){
    try{
        const raw = window.localStorage.getItem(REGISTRY_KEY);
        if(!raw) return defaultState();
        const parsed = JSON.parse(raw);
        const savedById = {};
        (Array.isArray(parsed.procedures) ? parsed.procedures : []).forEach(p => {
            if(p && p.id) savedById[p.id] = p;
        });
        const procedures = DEFAULT_PROCEDURES.map(p => ({
            ...p,
            stamped: savedById[p.id] ? !!savedById[p.id].stamped : false,
            lastResult: savedById[p.id] ? (savedById[p.id].lastResult || "") : ""
        }));
        return {
            name: parsed.name || "",
            kind: parsed.kind || "",
            readings: Object.assign({ BRN: 12, FRM: 12, NRV: 12 }, parsed.readings || {}),
            capacity: Object.assign({ baseline: 6, expanded: 0, used: 0 }, parsed.capacity || {}),
            procedures: procedures
        };
    } catch(err){
        console.error("OPERATOR REGISTRY — failed to load saved state, using defaults", err);
        return defaultState();
    }
}

function saveState(){
    try{
        window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(state));
    } catch(err){
        console.error("OPERATOR REGISTRY — failed to save state", err);
    }
}

// ===== CARD MANAGEMENT FUNCTIONS =====

function loadCards(key){
    try{
        const raw = window.localStorage.getItem(key);
        if (!raw) {
            console.log(`OPERATOR REGISTRY — No data found for key: ${key}`);
            return [];
        }
        const parsed = JSON.parse(raw);
        console.log(`OPERATOR REGISTRY — Loaded ${parsed.length} cards from ${key}`);
        return parsed;
    } catch(err){
        console.error(`Failed to load cards from ${key}`, err);
        return [];
    }
}

function saveCards(key, cards){
    try{
        window.localStorage.setItem(key, JSON.stringify(cards));
    } catch(err){
        console.error(`Failed to save cards to ${key}`, err);
    }
}

function deleteCard(key, cardId){
    const cards = loadCards(key);
    const filtered = cards.filter(c => c.id !== cardId);
    saveCards(key, filtered);
    return filtered;
}

let state = loadState();

function pale(reading){
    const n = Number(reading) || 0;
    return Math.ceil(n / 2);
}

function byId(id){
    const el = document.getElementById(id);
    if(!el) console.warn("OPERATOR REGISTRY — element #" + id + " not found");
    return el;
}

function on(id, evt, handler){
    const el = byId(id);
    if(el) el.addEventListener(evt, handler);
    return el;
}

// ===== RENDER FUNCTIONS =====

function renderReadings(){
    try{
        let totalUsed = 0;
        ["BRN","FRM","NRV"].forEach(key => {
            const val = state.readings[key] || 0;
            const inputEl = byId("reading" + key);
            const paleEl = byId("pale" + key);
            const flagEl = byId("flag" + key);
            
            if(inputEl) {
                if(document.activeElement !== inputEl){
                    inputEl.value = val;
                }
            }
            
            if(paleEl) {
                const paleVal = pale(val);
                paleEl.textContent = paleVal;
            }
            
            if(flagEl) {
                if(val < READING_MIN){
                    flagEl.textContent = "BELOW MINIMUM (" + READING_MIN + ")";
                    flagEl.classList.add("bad");
                } else if(val > READING_MAX){
                    flagEl.textContent = "ABOVE MAXIMUM (" + READING_MAX + ")";
                    flagEl.classList.add("bad");
                } else {
                    flagEl.textContent = "";
                    flagEl.classList.remove("bad");
                }
            }
            
            totalUsed += val;
        });
        
        const remaining = READING_BUDGET - totalUsed;
        const usedEl = byId("budgetUsed");
        const remainingEl = byId("budgetRemaining");
        const budgetRow = byId("budgetRow");
        
        if(usedEl) usedEl.textContent = totalUsed;
        if(remainingEl) remainingEl.textContent = remaining;
        if(budgetRow) {
            budgetRow.classList.toggle("bad", remaining !== 0);
        }
    } catch(err){
        console.error("OPERATOR REGISTRY — renderReadings failed", err);
    }
}

function renderCapacity(){
    try{
        const baseEl = byId("capBaseline");
        const expEl = byId("capExpanded");
        const usedEl = byId("capUsed");
        const totalEl = byId("capTotal");
        const readout = byId("capacityReadout");
        
        const hexCards = loadCards(HEX_KEY);
        const knotCards = loadCards(KNOT_KEY);
        const routineCards = loadCards(ROUTINE_KEY);
        const telemetryCards = loadCards(TELEMETRY_KEY);
        const baleCards = loadCards(BALE_KEY);
        const dreadCards = loadCards(DREAD_KEY);
        
        // Bales occupy inventory slots; Dreads are trace residue and don't take slots
        const totalSlots = hexCards.length + knotCards.length + routineCards.length + telemetryCards.length + baleCards.length;
        state.capacity.used = totalSlots;
        
        if(baseEl) baseEl.value = state.capacity.baseline;
        if(expEl) expEl.value = state.capacity.expanded;
        if(usedEl) usedEl.value = state.capacity.used;
        
        const total = state.capacity.baseline + state.capacity.expanded;
        const remaining = total - state.capacity.used;
        
        if(totalEl) totalEl.textContent = total;
        if(readout){
            if(remaining < 0){
                readout.innerHTML = 'OVERFLOW DENIED — OVER BY <strong>' + Math.abs(remaining) + '</strong>';
                readout.classList.add("overflow");
            } else {
                readout.innerHTML = 'TOTAL: <strong>' + total + '</strong> · USED: <strong>' + state.capacity.used + '</strong> · REMAINING: <strong>' + remaining + '</strong>';
                readout.classList.remove("overflow");
            }
        }
    } catch(err){
        console.error("OPERATOR REGISTRY — renderCapacity failed", err);
    }
}

function renderInventory(){
    const container = byId("inventoryContainer");
    if(!container) {
        console.warn("OPERATOR REGISTRY — inventoryContainer not found");
        return;
    }
    
    console.log("OPERATOR REGISTRY — Rendering inventory...");
    
    const hexCards = loadCards(HEX_KEY);
    const knotCards = loadCards(KNOT_KEY);
    const routineCards = loadCards(ROUTINE_KEY);
    const telemetryCards = loadCards(TELEMETRY_KEY);
    const baleCards = loadCards(BALE_KEY);
    const dreadCards = loadCards(DREAD_KEY);
    
    console.log(`OPERATOR REGISTRY — Bales: ${baleCards.length}, Dreads: ${dreadCards.length}`);
    
    let html = '';
    
    // Hex Cards
    if(hexCards.length > 0){
        html += `<div class="inventory-section"><h3>Hex Cards (${hexCards.length})</h3><div class="card-grid">`;
        hexCards.forEach(card => {
            const details = card.rolls ? 
                card.rolls.map(r => `${r.label}: ${r.name}`).join(' · ') : 
                (card.description || '');
            html += `
                <div class="card-item" data-type="hex" data-id="${card.id}">
                    <div class="card-header">
                        <span class="card-name">${card.name || 'Unnamed Hex'}</span>
                        <button class="remove-card-btn" data-type="hex" data-id="${card.id}">✕</button>
                    </div>
                    <div class="card-details">
                        ${card.code ? `<div class="card-tag">${card.code}</div>` : ''}
                        ${details ? `<div class="card-desc">${details}</div>` : ''}
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;
    }
    
    // Knot Cards
    if(knotCards.length > 0){
        html += `<div class="inventory-section"><h3>Knot Cards (${knotCards.length})</h3><div class="card-grid">`;
        knotCards.forEach(card => {
            html += `
                <div class="card-item" data-type="knot" data-id="${card.id}">
                    <div class="card-header">
                        <span class="card-name">${card.name || 'Unnamed Knot'}</span>
                        <button class="remove-card-btn" data-type="knot" data-id="${card.id}">✕</button>
                    </div>
                    <div class="card-details">
                        ${card.output ? `<div class="card-desc">${card.output}</div>` : ''}
                        ${card.noise ? `<div class="card-desc noise">${card.noise}</div>` : ''}
                        ${card.type ? `<div class="card-tag">${card.type.toUpperCase()}</div>` : ''}
                        ${card.d ? `<div class="card-tag">D${card.d}</div>` : ''}
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;
    }
    
    // Routine Cards (Modules)
    if(routineCards.length > 0){
        html += `<div class="inventory-section"><h3>Routine Cards (${routineCards.length})</h3><div class="card-grid">`;
        routineCards.forEach(card => {
            const isModule = card.type === "module" || card.ports;
            html += `
                <div class="card-item" data-type="routine" data-id="${card.id}">
                    <div class="card-header">
                        <span class="card-name">${isModule ? (card.callsign || card.name || 'Unnamed Module') : (card.callsign || card.name || 'Unnamed Routine')}</span>
                        <button class="remove-card-btn" data-type="routine" data-id="${card.id}">✕</button>
                    </div>
                    <div class="card-details">
                        ${card.code ? `<div class="card-tag">${card.code}</div>` : ''}
                        ${isModule ? 
                            `<div class="card-desc">${card.size || ''}U · ${card.ports ? card.ports.join('+') : ''}</div>` :
                            (card.sequence ? `<div class="card-desc">${card.sequence.join(' → ')}</div>` : '')
                        }
                        ${card.size && !isModule ? `<div class="card-tag">${card.size}U</div>` : ''}
                        ${card.category ? `<div class="card-tag">${card.category}</div>` : ''}
                        ${isModule && card.function ? `<div class="card-desc">${card.function}</div>` : ''}
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;
    }
    
    // Afterimage Telemetry Cards
    if(telemetryCards.length > 0){
        html += `<div class="inventory-section"><h3>Afterimage Telemetry (${telemetryCards.length})</h3><div class="card-grid">`;
        telemetryCards.forEach(card => {
            html += `
                <div class="card-item" data-type="telemetry" data-id="${card.id}">
                    <div class="card-header">
                        <span class="card-name">${card.name || card.callsign || 'Unnamed Telemetry'}</span>
                        <button class="remove-card-btn" data-type="telemetry" data-id="${card.id}">✕</button>
                    </div>
                    <div class="card-details">
                        ${card.code ? `<div class="card-tag">${card.code}</div>` : ''}
                        ${card.category ? `<div class="card-tag">${card.category}</div>` : ''}
                        ${card.abbr ? `<div class="card-tag">${card.abbr}</div>` : ''}
                        <div class="card-desc"><strong>Acquire:</strong> ${card.acquire || ''}</div>
                        <div class="card-desc"><strong>Fix:</strong> ${card.fix || ''}</div>
                        ${card.acquiredAt ? `<div class="card-desc" style="font-size:10px;color:var(--dim);">Acquired: ${new Date(card.acquiredAt).toLocaleString()}</div>` : ''}
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;
    }
    
    // ===== BALES =====
    if(baleCards.length > 0){
        html += `<div class="inventory-section"><h3>BALES (${baleCards.length})</h3><div class="card-grid">`;
        baleCards.forEach(card => {
            html += `
                <div class="card-item" data-type="bale" data-id="${card.id}">
                    <div class="card-header">
                        <span class="card-name">${card.name || 'Unnamed Bale'}</span>
                        <button class="remove-card-btn" data-type="bale" data-id="${card.id}">✕</button>
                    </div>
                    <div class="card-details">
                        ${card.row && card.category ? `<div class="card-tag">${card.row} / ${card.category}</div>` : ''}
                        ${card.fixed ? `<div class="card-tag" style="background:var(--fg);color:var(--bg);">FIXED — READY TO KINDLE</div>` : `<div class="card-tag">UNFIXED</div>`}
                        ${card.effect ? `<div class="card-desc"><strong>Effect:</strong> ${card.effect}</div>` : ''}
                        ${card.cost ? `<div class="card-desc"><strong>Cost:</strong> ${card.cost}</div>` : ''}
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;
    }
    
    // ===== DREADS =====
    if(dreadCards.length > 0){
        html += `<div class="inventory-section"><h3>DREADS (${dreadCards.length})</h3><div class="card-grid">`;
        dreadCards.forEach(card => {
            html += `
                <div class="card-item" data-type="dread" data-id="${card.id}">
                    <div class="card-header">
                        <span class="card-name">${card.name || 'Unnamed Dread'}</span>
                        <button class="remove-card-btn" data-type="dread" data-id="${card.id}">✕</button>
                    </div>
                    <div class="card-details">
                        ${card.row && card.category ? `<div class="card-tag">${card.row} / ${card.category}</div>` : ''}
                        ${card.effect ? `<div class="card-desc"><strong>Effect:</strong> ${card.effect}</div>` : ''}
                        ${card.cost ? `<div class="card-desc"><strong>Cost:</strong> ${card.cost}</div>` : ''}
                        ${card.fromBaleId ? `<div class="card-desc" style="font-size:10px;color:var(--dim);">From: ${card.fromBaleId}</div>` : ''}
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;
    }
    
    if(!hexCards.length && !knotCards.length && !routineCards.length && !telemetryCards.length && !baleCards.length && !dreadCards.length){
        html = `<div class="empty-inventory">No cards in inventory. Create cards on their respective pages.</div>`;
    }
    
    container.innerHTML = html;
    
    container.querySelectorAll('.remove-card-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const type = this.dataset.type;
            const id = this.dataset.id;
            let key;
            switch(type){
                case 'hex': key = HEX_KEY; break;
                case 'knot': key = KNOT_KEY; break;
                case 'routine': key = ROUTINE_KEY; break;
                case 'telemetry': key = TELEMETRY_KEY; break;
                case 'bale': key = BALE_KEY; break;
                case 'dread': key = DREAD_KEY; break;
                default: return;
            }
            if(confirm(`Remove this ${type} card from inventory?`)){
                deleteCard(key, id);
                renderInventory();
                renderCapacity();
            }
        });
    });
}

function renderProcedures(){
    try{
        const body = byId("procBody");
        if(!body) return;
        body.innerHTML = "";
        
        const table = document.createElement("table");
        table.className = "procedure-table";
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Procedure</th>
                    <th>Description</th>
                    <th>Reading</th>
                    <th>Stamped</th>
                    <th>Result</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody id="procTableBody"></tbody>
        `;
        body.appendChild(table);
        
        const tbody = table.querySelector("#procTableBody");
        
        ["BRN", "FRM", "NRV"].forEach(readingKey => {
            const procs = state.procedures.filter(p => p.reading === readingKey);
            if(procs.length === 0) return;
            
            const headerRow = document.createElement("tr");
            headerRow.className = "proc-group-header";
            headerRow.innerHTML = `
                <td colspan="6">
                    <span class="group-label">${readingKey}</span>
                    <span class="group-reading">Reading: ${state.readings[readingKey] || 0}</span>
                </td>
            `;
            tbody.appendChild(headerRow);
            
            procs.forEach((proc, index) => {
                const row = document.createElement("tr");
                row.className = "proc-row";
                if(index % 2 === 0) row.classList.add("even");
                
                row.innerHTML = `
                    <td class="proc-name-cell">${proc.name}</td>
                    <td class="proc-desc-cell">${proc.desc || ""}</td>
                    <td class="proc-reading-cell">${proc.reading} (${state.readings[proc.reading] || 0})</td>
                    <td class="proc-stamp-cell">
                        <button type="button" class="stamp-dot ${proc.stamped ? "on" : ""}" data-proc-id="${proc.id}"></button>
                    </td>
                    <td class="proc-result-cell">${proc.lastResult || "—"}</td>
                    <td class="proc-action-cell">
                        <button type="button" class="roll-btn" data-proc-id="${proc.id}">ROLL</button>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
        });
        
        tbody.querySelectorAll('.stamp-dot').forEach(btn => {
            btn.addEventListener("click", function() {
                const procId = this.dataset.procId;
                const proc = state.procedures.find(p => p.id === procId);
                if(proc) {
                    proc.stamped = !proc.stamped;
                    saveState();
                    renderProcedures();
                }
            });
        });
        
        tbody.querySelectorAll('.roll-btn').forEach(btn => {
            btn.addEventListener("click", function() {
                const procId = this.dataset.procId;
                const proc = state.procedures.find(p => p.id === procId);
                if(proc) {
                    runProcedure(proc);
                }
            });
        });
        
    } catch(err){
        console.error("OPERATOR REGISTRY — renderProcedures failed", err);
    }
}

function rollDie20(){
    return 1 + Math.floor(Math.random() * 20);
}

function runProcedure(proc){
    const readingValue = state.readings[proc.reading] || 0;
    let rollText, rollTotal;
    if(proc.stamped){
        const a = rollDie20();
        const b = rollDie20();
        const best = Math.max(a, b);
        rollText = "2D20 (" + a + ", " + b + ") → BEST " + best;
        rollTotal = best;
    } else {
        const a = rollDie20();
        rollText = "1D20 → " + a;
        rollTotal = a;
    }
    const total = rollTotal + readingValue;
    proc.lastResult = total + "  —  " + rollText + " + " + proc.reading + " " + readingValue;
    renderProcedures();
    saveState();
}

// ===== BIND FUNCTIONS =====

function bindReadingInputs(){
    ["BRN","FRM","NRV"].forEach(key => {
        const el = byId("reading" + key);
        if(!el) return;
        
        const handler = (e) => {
            let val = Number(e.target.value) || 0;
            if(val < READING_MIN) val = READING_MIN;
            if(val > READING_MAX) val = READING_MAX;
            state.readings[key] = val;
            renderReadings();
            renderProcedures();
            saveState();
        };
        
        el.addEventListener("input", handler);
        el.addEventListener("change", handler);
        
        el.addEventListener("blur", () => {
            let val = Number(el.value) || 0;
            if(val < READING_MIN) {
                el.value = READING_MIN;
                state.readings[key] = READING_MIN;
            } else if(val > READING_MAX) {
                el.value = READING_MAX;
                state.readings[key] = READING_MAX;
            }
            renderReadings();
            renderProcedures();
            saveState();
        });
    });
}

function bindCapacityInputs(){
    [["capBaseline","baseline"],["capExpanded","expanded"]].forEach(([id, key]) => {
        const el = byId(id);
        if(!el) return;
        const handler = (e) => {
            state.capacity[key] = Number(e.target.value) || 0;
            renderCapacity();
            renderInventory();
            saveState();
        };
        el.addEventListener("input", handler);
        el.addEventListener("change", handler);
    });
}

// ===== INIT =====

document.addEventListener("DOMContentLoaded", function() {
    console.log("OPERATOR REGISTRY ONLINE — BUILD 2026-08-05");
    console.log("READINGS HOLD. PALE ABSORBS. THE FIELD DOES NOT.");
    
    // Check what's in localStorage
    console.log("OPERATOR REGISTRY — Checking localStorage keys:");
    console.log("  baleCards:", window.localStorage.getItem("baleCards"));
    console.log("  dreadCards:", window.localStorage.getItem("dreadCards"));
    
    try{
        const nameEl = byId("opName");
        const kindEl = byId("opKind");
        if(nameEl) nameEl.value = state.name;
        if(kindEl) kindEl.value = state.kind;
        if(nameEl) nameEl.addEventListener("input", (e) => { state.name = e.target.value; saveState(); });
        if(kindEl) kindEl.addEventListener("change", (e) => { state.kind = e.target.value; saveState(); });
    } catch(err){
        console.error("OPERATOR REGISTRY — identity init failed", err);
    }
    
    try{
        bindCapacityInputs();
    } catch(err){
        console.error("OPERATOR REGISTRY — capacity binding failed", err);
    }
    
    try{
        bindReadingInputs();
    } catch(err){
        console.error("OPERATOR REGISTRY — reading binding failed", err);
    }
    
    try{
        on("resetBtn", "click", () => {
            const ok = window.confirm("RESET THE ENTIRE SHEET? THIS CANNOT BE UNDONE.");
            if(!ok) return;
            state = defaultState();
            const nameEl = byId("opName");
            const kindEl = byId("opKind");
            if(nameEl) nameEl.value = state.name;
            if(kindEl) kindEl.value = state.kind;
            renderReadings();
            renderCapacity();
            renderInventory();
            renderProcedures();
            saveState();
        });
    } catch(err){
        console.error("OPERATOR REGISTRY — reset binding failed", err);
    }
    
    renderReadings();
    renderCapacity();
    renderInventory();
    renderProcedures();
    
    // Listen for storage changes from other pages
    window.addEventListener('storage', (e) => {
        const affectedKeys = [HEX_KEY, KNOT_KEY, ROUTINE_KEY, TELEMETRY_KEY, BALE_KEY, DREAD_KEY];
        if(affectedKeys.includes(e.key)){
            console.log(`OPERATOR REGISTRY — Storage changed: ${e.key}, refreshing...`);
            renderInventory();
            renderCapacity();
        }
    });
});

console.log("OPERATOR REGISTRY LOADED — BUILD 2026-08-05");
console.log("Looking for keys: baleCards and dreadCards");
