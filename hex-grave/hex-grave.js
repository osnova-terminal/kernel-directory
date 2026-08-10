/*

HEX GRAVE — PARAMETER COLLAPSE TERMINAL

PARAMETERS mirrors the Focal Phase Hex Grave table: six categories
(Shape, Origin, Behavior, Duration, Reach, Impact), each with six
d6 results carrying a short name and its full interpretive text.

Graving a Hex rolls all six Parameters in sequence. Each roll
flickers across its column in the matrix before locking onto the
result, and the Current Hex readout fills in one row at a time.
Once all six have collapsed, the Hex can be named and committed to
the Intake Brief — a running inventory of graved Hexes. Each entry
holds one slot; Regraving a slot re-rolls all six Parameters and
overrides that slot in place, matching the source rule that a Hex
is not removed on use, only replaced by deliberate Regraving.

*/

const HEX_KEY = "hexGraveCards";

const PARAMETERS = [
    {
        key: "shape", label: "Shape",
        options: [
            { name: "Beam",   desc: "Narrow, linear, directional. Precise. Hits what it points at and nothing else." },
            { name: "Cloud",  desc: "Diffuse volumetric mass. Fills a space rather than crossing it. Hard to avoid, hard to aim." },
            { name: "Pulse",  desc: "Radial expansion from a single point. Hits everything within radius simultaneously." },
            { name: "Shell",  desc: "Enclosing surface. Wraps around a target or area rather than striking from outside." },
            { name: "Thread", desc: "Thin filamental connection between two designated points. What travels along it depends on Impact." },
            { name: "Shard",  desc: "Multiple discrete fragments deployed simultaneously. Each piece weaker, coverage wider." }
        ]
    },
    {
        key: "origin", label: "Origin",
        options: [
            { name: "Self",      desc: "Emanates directly from the ESPer's body. They are always inside it." },
            { name: "Touch",     desc: "Initiates through physical contact between ESPer and target. Requires proximity." },
            { name: "Thrown",    desc: "Launched from the ESPer toward a designated point. Travels through intervening space." },
            { name: "Planted",   desc: "Placed at a location during Fixing. Activates when a condition the ESPer specifies is met." },
            { name: "Reflected", desc: "Originates from a surface the ESPer designates. ESPer need not be near it at activation." },
            { name: "Ambient",   desc: "Draws from environmental conditions. No identifiable source point. Harder to trace back." }
        ]
    },
    {
        key: "behavior", label: "Behavior",
        options: [
            { name: "Seeking",     desc: "Adjusts trajectory toward a designated target after deployment. Obstacles and distance still matter." },
            { name: "Anchored",    desc: "Anchors in space after deployment. Does not move regardless of what moves around it." },
            { name: "Spreading",   desc: "Expands gradually outward from origin or impact point. Coverage increases over time." },
            { name: "Retracting",  desc: "Extends outward then pulls back toward the ESPer, dragging whatever it caught." },
            { name: "Oscillating", desc: "Pulses on and off at regular intervals set during Fixing. Effect is intermittent." },
            { name: "Mirroring",   desc: "Copies and echoes the movement of a designated target. Follows without seeking." }
        ]
    },
    {
        key: "duration", label: "Duration",
        options: [
            { name: "Instant",   desc: "Occurs and ends in a single moment. No maintenance required. No residue." },
            { name: "Brief",     desc: "Persists until the end of the current round. Fades cleanly." },
            { name: "Sustained", desc: "Persists as long as the ESPer actively maintains the Fixing. Ends if the Fixing breaks." },
            { name: "Delayed",   desc: "Set during Fixing but does not resolve until a condition the ESPer specifies is met." },
            { name: "Residual",  desc: "Fades gradually over several rounds, weakening incrementally. Final moments unpredictable." },
            { name: "Permanent", desc: "Does not end without deliberate reversal. The IO flags permanent Hexes in Operator Files." }
        ]
    },
    {
        key: "reach", label: "Reach",
        options: [
            { name: "Contact",   desc: "Origin and target must be physically touching at activation. No gap tolerated." },
            { name: "Close",     desc: "Within arm's reach of the origin point." },
            { name: "Near",      desc: "Within the same room or immediate enclosed space." },
            { name: "Far",       desc: "Across a significant distance within line of sight." },
            { name: "Remote",    desc: "Beyond the line of sight. Requires a link, a belonging, a name or a prior Touch to function." },
            { name: "Boundless", desc: "No distance constraint. Only Taboo limits it." }
        ]
    },
    {
        key: "impact", label: "Impact",
        options: [
            { name: "Damage",   desc: "HAZE HIT to linked Reading through the Pale. The Pale absorbs first." },
            { name: "Drain",    desc: "HAZE HIT directly to linked reading. Bypasses the Pale entirely." },
            { name: "Displace", desc: "Moves the target physically without dealing damage. Direction and force set during Fixing." },
            { name: "Suppress", desc: "Prevents a specific action, ESP use, or sense. ESPer specifies what is suppressed during Fixing." },
            { name: "Read",     desc: "Extracts information from the target or environment. No physical effect." },
            { name: "Warp",     desc: "Alters a persistent property of target or environment. ESPer specifies the property during Fixing." }
        ]
    }
];

let rolling = false;
let currentHex = null;
let pendingTargetSlot = null;
let intake = [];
let logEntries = [];
let graveCounter = 0;
let slotCounter = 0;

const glitchAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-—";
const matrixNoiseChars = [
    "░","▒","▓","█","▀","▄","▌","▐","▖","▗","▘","▝","▚","▞",
    "■","□","▪","▫","◆","◇","▲","△","▼","▽","●","○",
    "─","│","┼","┤","├","┬","┴","╬","╫","╪",
    "⠿","⠶","⠛","⠹","⠭","⠽","⠾","⠷",
    "#","%","&","*","/","\\","~","^"
];
let ambientTimer = null;

// ===== CARD SAVING =====

function loadHexCards(){
    try{
        const raw = window.localStorage.getItem(HEX_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch(err){
        console.error("Failed to load hex cards", err);
        return [];
    }
}

function saveHexCards(cards){
    try{
        window.localStorage.setItem(HEX_KEY, JSON.stringify(cards));
    } catch(err){
        console.error("Failed to save hex cards", err);
    }
}

function noiseGlyph(){
    return matrixNoiseChars[Math.floor(Math.random() * matrixNoiseChars.length)];
}

function noiseGlyphs(len){
    let html = "";
    for(let i = 0; i < len; i++){
        const opacity = (0.25 + Math.random() * 0.75).toFixed(2);
        html += `<span style="opacity:${opacity}">${noiseGlyph()}</span>`;
    }
    return html;
}

function randNoiseLen(){
    return 3 + Math.floor(Math.random() * 6);
}

function startAmbientNoise(){
    if(ambientTimer) return;
    ambientTimer = setInterval(() => {
        document.querySelectorAll("table.matrix td.cell-noise .cell-name").forEach(el => {
            el.innerHTML = noiseGlyphs(randNoiseLen());
        });
    }, 160);
}

function scramble(text){
    return text
        .split("")
        .map(c => (c === " " ? c : (Math.random() < 0.55 ? glitchAlphabet[Math.floor(Math.random() * glitchAlphabet.length)] : c)))
        .join("");
}

function revealText(el, finalText, done){
    let frame = 0;
    function step(){
        if(frame < 3){
            el.textContent = scramble(finalText);
            frame++;
            setTimeout(step, 35);
        } else {
            el.textContent = finalText;
            if(done) done();
        }
    }
    step();
}

// ---------- static rendering ----------

function renderMatrix(){
    const table = document.getElementById("matrixTable");
    let html = "<thead><tr><th>D6</th>";
    PARAMETERS.forEach(p => html += `<th>${p.label}</th>`);
    html += "</tr></thead><tbody>";
    for(let d = 1; d <= 6; d++){
        html += `<tr><td>${d}</td>`;
        PARAMETERS.forEach(p => {
            const opt = p.options[d - 1];
            html += `<td id="cell-${p.key}-${d}" class="cell-noise" data-name="${opt.name}"><span class="cell-d">${d}</span><span class="cell-name">${noiseGlyphs(randNoiseLen())}</span></td>`;
        });
        html += "</tr>";
    }
    html += "</tbody>";
    table.innerHTML = html;
    startAmbientNoise();
}

function renderHexReadoutSkeleton(){
    const wrap = document.getElementById("hexReadout");
    wrap.innerHTML = PARAMETERS.map(p => `
        <div class="hex-row pending" id="row-${p.key}">
            <span class="hr-label">${p.label}</span>
            <span class="hr-value" id="rowval-${p.key}">— PENDING —</span>
            <span class="hr-desc" id="rowdesc-${p.key}"></span>
        </div>
    `).join("");
}

function renderReferenceTable(){
    const body = document.getElementById("refBody");
    let rows = "";
    for(let d = 1; d <= 6; d++){
        rows += `<tr><td>${d}</td>`;
        PARAMETERS.forEach(p => rows += `<td>${p.options[d - 1].name}</td>`);
        rows += "</tr>";
    }
    body.innerHTML = rows;
}

function renderLog(){
    const panel = document.getElementById("logPanel");
    if(logEntries.length === 0){
        panel.innerHTML = '<div class="log-empty">NO ACTIVITY LOGGED</div>';
        return;
    }
    let html = "";
    for(let i = logEntries.length - 1; i >= 0; i--){
        html += `<div class="log-entry"><span class="le-tag">[${String(i + 1).padStart(2, "0")}]</span>${logEntries[i]}</div>`;
    }
    panel.innerHTML = html;
}

function addLog(text){
    logEntries.push(text);
    renderLog();
}

function renderIntake(){
    const grid = document.getElementById("intakeGrid");
    document.getElementById("statHeld").textContent = intake.length;
    document.getElementById("statGraved").textContent = graveCounter;
    if(intake.length === 0){
        grid.innerHTML = '<div class="intake-empty">NO HEXES ON FILE</div>';
        return;
    }
    grid.innerHTML = "";
    intake.forEach(hex => {
        const card = document.createElement("div");
        card.className = "hex-card";
        const summary = hex.rolls.map(r => `<strong>${r.label}:</strong> ${r.name}`).join(" · ");
        card.innerHTML = `
            <div class="hc-code">${hex.code}</div>
            <div class="hc-name">${hex.name}</div>
            <div class="hc-summary">${summary}</div>
            <div class="hc-controls">
                <button class="btn small" data-act="regrave">REGRAVE</button>
                <button class="btn small ghost" data-act="discard">DISCARD</button>
            </div>
        `;
        card.querySelector('[data-act="regrave"]').addEventListener("click", () => startRoll(hex.id));
        card.querySelector('[data-act="discard"]').addEventListener("click", () => {
            intake = intake.filter(h => h.id !== hex.id);
            saveHexCards(intake);
            addLog(`DISCARDED — ${hex.code} "${hex.name.toUpperCase()}" REMOVED FROM INTAKE BRIEF.`);
            renderIntake();
        });
        grid.appendChild(card);
    });
}

// ---------- roll sequence ----------

function setStatus(text){
    document.getElementById("statusLine").textContent = text;
}

function clearMatrixLocks(){
    PARAMETERS.forEach(p => {
        for(let d = 1; d <= 6; d++){
            const cell = document.getElementById(`cell-${p.key}-${d}`);
            cell.classList.remove("cell-active", "cell-locked", "cell-collapsed");
            cell.classList.add("cell-noise");
            cell.querySelector(".cell-name").innerHTML = noiseGlyphs(randNoiseLen());
        }
    });
}

function rollParameter(param, onSettled){
    const cells = [];
    for(let d = 1; d <= 6; d++) cells.push(document.getElementById(`cell-${param.key}-${d}`));
    cells.forEach(cell => {
        cell.classList.remove("cell-noise", "cell-collapsed", "cell-locked");
        cell.classList.add("cell-active");
    });
    const finalD = Math.floor(Math.random() * 6) + 1;
    const flickerInterval = setInterval(() => {
        cells.forEach(cell => {
            cell.querySelector(".cell-name").innerHTML = noiseGlyphs(randNoiseLen());
        });
    }, 55);
    setTimeout(() => {
        clearInterval(flickerInterval);
        cells.forEach((cell, i) => {
            const d = i + 1;
            const opt = param.options[d - 1];
            cell.classList.remove("cell-active");
            cell.classList.add(d === finalD ? "cell-locked" : "cell-collapsed");
            revealText(cell.querySelector(".cell-name"), opt.name);
        });
        const opt = param.options[finalD - 1];
        const valEl = document.getElementById(`rowval-${param.key}`);
        const rowEl = document.getElementById(`row-${param.key}`);
        rowEl.classList.remove("pending");
        revealText(valEl, `${opt.name} (D6:${finalD})`, () => {
            document.getElementById(`rowdesc-${param.key}`).textContent = opt.desc;
        });
        onSettled({ key: param.key, label: param.label, d: finalD, name: opt.name, desc: opt.desc });
    }, 620);
}

function startRoll(targetSlotId){
    if(rolling) return;
    rolling = true;
    pendingTargetSlot = targetSlotId || null;
    document.getElementById("graveBtn").disabled = true;
    document.getElementById("commitPanel").classList.remove("active");
    clearMatrixLocks();
    renderHexReadoutSkeleton();
    currentHex = { rolls: [] };
    const nameInput = document.getElementById("hexNameInput");
    if(pendingTargetSlot){
        const slot = intake.find(h => h.id === pendingTargetSlot);
        nameInput.value = slot ? slot.name : "";
        setStatus(`REGRAVING ${slot ? slot.code : ""} — 0/6 PARAMETERS COLLAPSED`);
    } else {
        nameInput.value = "";
        setStatus("GRAVING — 0/6 PARAMETERS COLLAPSED");
    }
    let index = 0;
    function next(){
        if(index >= PARAMETERS.length){
            rolling = false;
            document.getElementById("graveBtn").disabled = false;
            setStatus(pendingTargetSlot ? "REGRAVE COMPLETE — REVIEW AND OVERRIDE" : "HEX GRAVE COMPLETE — NAME AND COMMIT");
            const commitPanel = document.getElementById("commitPanel");
            commitPanel.classList.add("active");
            document.getElementById("commitBtn").textContent = pendingTargetSlot ? "OVERRIDE SLOT" : "COMMIT TO INTAKE BRIEF";
            addLog(pendingTargetSlot
                ? `REGRAVE ROLLED — AWAITING OVERRIDE CONFIRMATION.`
                : `HEX GRAVED — AWAITING NAME AND COMMIT.`);
            return;
        }
        const param = PARAMETERS[index];
        setStatus(`${pendingTargetSlot ? "REGRAVING" : "GRAVING"} — ${param.label.toUpperCase()} · ${index}/6 COLLAPSED`);
        rollParameter(param, (result) => {
            currentHex.rolls.push(result);
            index++;
            next();
        });
    }
    next();
}

function commitHex(){
    if(!currentHex || currentHex.rolls.length < PARAMETERS.length) return;
    const nameInput = document.getElementById("hexNameInput");
    const name = nameInput.value.trim() || `UNNAMED HEX ${graveCounter + 1}`;
    if(pendingTargetSlot){
        const slot = intake.find(h => h.id === pendingTargetSlot);
        if(slot){
            slot.name = name;
            slot.rolls = currentHex.rolls;
            saveHexCards(intake);
            addLog(`OVERRIDDEN — ${slot.code} REGRAVED AS "${name.toUpperCase()}".`);
        }
    } else {
        graveCounter++;
        const code = "GRV-" + String(graveCounter).padStart(3, "0");
        slotCounter++;
        const newHex = { id: "slot" + slotCounter, code, name, rolls: currentHex.rolls };
        intake.push(newHex);
        saveHexCards(intake);
        addLog(`COMMITTED — ${code} "${name.toUpperCase()}" ADDED TO INTAKE BRIEF.`);
    }
    pendingTargetSlot = null;
    currentHex = null;
    document.getElementById("commitPanel").classList.remove("active");
    setStatus("AWAITING INPUT — 0/6 PARAMETERS COLLAPSED");
    clearMatrixLocks();
    renderHexReadoutSkeleton();
    renderIntake();
}

// ---------- init ----------

document.addEventListener("DOMContentLoaded", () => {
    intake = loadHexCards();
    graveCounter = intake.length;
    slotCounter = intake.length;
    
    renderMatrix();
    renderHexReadoutSkeleton();
    renderReferenceTable();
    renderLog();
    renderIntake();
    
    document.getElementById("graveBtn").addEventListener("click", () => startRoll(null));
    document.getElementById("commitBtn").addEventListener("click", commitHex);
});

console.log("HEX GRAVE TERMINAL ONLINE");
console.log("COLLAPSE THE PARAMETERS. FILE THE HEX.");
