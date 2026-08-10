/*

AFTERIMAGE TELEMETRY — HORIZOGRAPH TERMINAL

Raw sensor contacts, seven sensor classes (Optical, Thermal, Radar,
Atmospheric, Spatial, Cognitive, Formation), four contacts each.
Every contact renders as static until clicked — clicking runs a lock
sequence (a short glitch, then a scramble-to-reveal of its Acquire
condition and FIX effect) and files the decoded contact to this
browser's telemetry log permanently, under AFTERIMAGE_KEY.

Storage shape: an array of the full acquired contact objects (id,
code, category, name, acquire, fix, acquiredAt) — not just ids — so
any other terminal on this site (Operator Registry) can read the key
directly and render them without re-importing this file's dataset.

*/

const AFTERIMAGE_KEY = "afterimageTelemetryCards";

const CATEGORIES = [
    {
        label: "Optical", abbr: "OPT",
        items: [
            { name: "Gimbal", acquire: "Observe an anomaly rotate independently of its direction of travel while maintaining uninterrupted visual contact for an entire scene.", fix: "Until the end of the scene, attacks made against you never gain bonuses for flanking, rear attacks, or superior positioning." },
            { name: "Green Pyramid", acquire: "Observe the same impossible geometric form from three different viewpoints.", fix: "Until the end of the scene, ignore cover, concealment, and line-of-sight penalties imposed by physical obstacles." },
            { name: "Jellyfish", acquire: "Observe an anomaly remaining completely stationary despite environmental forces.", fix: "Until your next turn, you cannot be knocked prone, pushed, pulled, or forcibly moved." },
            { name: "Halo", acquire: "Observe a luminous ring or corona persisting around an anomaly despite changes in angle or lighting.", fix: "The next time you would lose Pale this scene, reduce that loss by 2." }
        ]
    },
    {
        label: "Thermal", abbr: "THM",
        items: [
            { name: "Tic Tac", acquire: "Observe an anomaly accelerate, stop, or change altitude instantaneously while at least one other witness confirms the event.", fix: "Immediately gain an additional Movement after completing any Procedure." },
            { name: "Cold Core", acquire: "Observe an anomaly displaying total thermal absence despite active manifestation.", fix: "Restore one Pale to its maximum value." },
            { name: "White Ember", acquire: "Observe residual heat that remains after the anomaly itself has vanished.", fix: "Your next successful attack ignores Pale and damages the Reading directly." },
            { name: "Blackbody", acquire: "Observe a heat source whose thermal signature cannot be classified by any known system.", fix: "Your next attack cannot be reduced by armor, resistance, or similar damage reduction." }
        ]
    },
    {
        label: "Radar", abbr: "RDR",
        items: [
            { name: "Ghost Return", acquire: "Confirm the same anomaly as both present and absent across different detection methods.", fix: "One attack against you automatically misses." },
            { name: "Split Echo", acquire: "Observe one anomaly appearing in multiple locations at once through sensor interference or anomalous duplication.", fix: "Resolve your next Procedure against two different targets." },
            { name: "False Horizon", acquire: "Observe an anomaly whose distance cannot be consistently determined.", fix: "Until your next turn, creatures farther than Adjacent cannot target you." },
            { name: "Coast Track", acquire: "Maintain sensor contact with an anomaly after it has completely disappeared from view.", fix: "Your next Procedure ignores penalties caused by invisibility, darkness, concealment, or loss of vision." }
        ]
    },
    {
        label: "Atmospheric", abbr: "ATM",
        items: [
            { name: "Gofast", acquire: "Maintain continuous observation of a rapidly moving anomaly until it exits observation.", fix: "Double your Movement for one turn." },
            { name: "Plasma Wake", acquire: "Observe visible atmospheric distortion that remains after an anomaly disappears.", fix: "Leave behind a false position. Until your next turn, attacks target your previous location unless the attacker is Adjacent." },
            { name: "Pressure Scar", acquire: "Observe physical displacement occurring without visible cause.", fix: "Push every adjacent creature one space directly away from you." },
            { name: "Shear Front", acquire: "Observe wind, rain, dust, or debris dividing sharply around an anomaly without affecting it.", fix: "Difficult terrain does not affect you until the end of your next turn." }
        ]
    },
    {
        label: "Spatial", abbr: "SPT",
        items: [
            { name: "Fastwalker", acquire: "Observe an anomaly entering or leaving an inaccessible location without traversing the intervening space.", fix: "Instantly reposition anywhere within your normal Movement range." },
            { name: "Negative Parallax", acquire: "Observe an object whose apparent position changes depending on the observer.", fix: "Swap positions with any visible creature." },
            { name: "Dead Vector", acquire: "Observe an anomaly moving without any identifiable vector.", fix: "Your next attack or Procedure cannot be reacted to." },
            { name: "Blind Angle", acquire: "Observe an anomaly disappear only when viewed from a specific direction.", fix: "Move through one occupied space or solid obstacle no thicker than a doorway during your next Movement." }
        ]
    },
    {
        label: "Cognitive", abbr: "COG",
        items: [
            { name: "Missing Frame", acquire: "Discover an unexplained lapse in memory experienced by multiple witnesses.", fix: "Repeat your last successful Procedure without spending an Action." },
            { name: "Observer Drift", acquire: "Record mutually incompatible accounts of the same anomalous event.", fix: "One creature immediately loses its next Reaction." },
            { name: "Static Memory", acquire: "Recall verifiable details erased or altered by anomalous activity.", fix: "Ask the GM one yes-or-no question about the current scene. The answer must be truthful." },
            { name: "Signal Bleed", acquire: "Two independent observers unknowingly describe the exact same impossible detail.", fix: "Reroll one failed Procedure." }
        ]
    },
    {
        label: "Formation", abbr: "FRM",
        items: [
            { name: "Black Triangle", acquire: "Observe three anomalous phenomena acting in synchronized formation during the same encounter.", fix: "The next Procedure performed by you or an ally is automatically treated as Stamped." },
            { name: "Mosul Orb", acquire: "Observe a luminous spherical anomaly maintaining a perfectly stable position for at least one minute while exhibiting no visible means of propulsion.", fix: "Until the end of the scene, you may FIX one additional Afterimage without discarding it." },
            { name: "Echelon", acquire: "Observe four or more anomalies maintaining precise geometric spacing while changing direction simultaneously.", fix: "Up to three allies within sight may each immediately move one space without provoking reactions." },
            { name: "Angel Flight", acquire: "Observe a formation separating into multiple independent contacts before recombining into a single track.", fix: "The next Procedure performed by every ally who can see you gains Stamped." }
        ]
    }
];

const glitchAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,-—";

// ---------- flatten dataset ----------

function slug(name){
    return name.toLowerCase().replace(/\s+/g, "-");
}

const AFTERIMAGES = [];
(function flatten(){
    let n = 0;
    CATEGORIES.forEach(cat => {
        cat.items.forEach(item => {
            n++;
            AFTERIMAGES.push({
                id: slug(item.name),
                code: "AF-" + String(n).padStart(2, "0"),
                category: cat.label,
                abbr: cat.abbr,
                name: item.name,
                acquire: item.acquire,
                fix: item.fix
            });
        });
    });
})();

let acquiredMap = {};
let logEntries = [];
let clockSeconds = 0;

// ---------- helpers ----------

function scramble(text){
    return text
        .split("")
        .map(c => (c === " " ? c : (Math.random() < 0.5 ? glitchAlphabet[Math.floor(Math.random() * glitchAlphabet.length)] : c)))
        .join("");
}

function revealText(el, finalText, done){
    let frame = 0;
    function step(){
        if(frame < 4){
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

// deterministic per-name "telemetry" readout — cosmetic only, stable across reloads
function pseudoTelemetry(seedStr){
    let h = 0;
    for(let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
    const brg = h % 360;
    const alt = 1200 + (h % 41000);
    return `BRG ${String(brg).padStart(3, "0")} · ALT ${alt.toLocaleString()}FT`;
}

// deterministic per-card hop path + phase, seeded from the card's id. Picks one
// of six directional variants (different quadrant order = different direction
// of travel) plus a duration and a NEGATIVE animation-delay, so every card
// starts already mid-cycle at a different point instead of all beginning in
// lockstep at t=0. Different hash multiplier than pseudoTelemetry so the two
// don't correlate.
function hopParams(seedStr){
    let h = 0;
    for(let i = 0; i < seedStr.length; i++) h = (h * 131 + seedStr.charCodeAt(i)) >>> 0;
    const variant = (h % 6) + 1;
    const duration = (3.8 + (h % 190) / 100).toFixed(2);
    const delay = -((h % 460) / 100).toFixed(2); // negative = starts mid-cycle
    const bracketDelay = (parseFloat(delay) + 0.4).toFixed(2);
    return {
        name: `noiseHop${variant}`,
        duration: `${duration}s`,
        delay: `${delay}s`,
        bracketDelay: `${bracketDelay}s`
    };
}

// ---------- persistence ----------

function loadAcquired(){
    try {
        const raw = window.localStorage.getItem(AFTERIMAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        acquiredMap = {};
        list.forEach(card => { acquiredMap[card.id] = card; });
    } catch(err){
        console.error("Failed to load afterimage telemetry", err);
        acquiredMap = {};
    }
}

function saveAcquired(){
    try {
        window.localStorage.setItem(AFTERIMAGE_KEY, JSON.stringify(Object.values(acquiredMap)));
    } catch(err){
        console.error("Failed to save afterimage telemetry", err);
    }
}

// ---------- rendering ----------

function buildCardHTML(item){
    const hop = hopParams(item.id);
    const hopStyle = `--hop-name:${hop.name}; --hop-duration:${hop.duration}; --hop-delay:${hop.delay}; --hop-bracket-delay:${hop.bracketDelay};`;

    return `
    <div class="contact-card" id="contact-${item.id}" data-id="${item.id}">
        <span class="reticle tl"></span>
        <span class="reticle tr"></span>
        <span class="reticle bl"></span>
        <span class="reticle br"></span>
        <div class="contact-meta">
            <span class="contact-code mono">${item.code}</span>
            <span class="contact-sensor mono">${item.abbr}</span>
        </div>
        <div class="contact-body">
            <div class="contact-hidden">
                <div class="contact-status mono">SIGNAL: UNRESOLVED</div>
                <div class="noise-line" style="${hopStyle}"></div>
            </div>
            <div class="contact-revealed">
                <div class="contact-status mono locked">CONTACT CONFIRMED</div>
                <div class="contact-name"></div>
                <div class="contact-field">
                    <span class="mono field-label">Acquire</span>
                    <p class="contact-acquire-text"></p>
                </div>
                <div class="contact-field">
                    <span class="mono field-label">Fix</span>
                    <p class="contact-fix-text"></p>
                </div>
                <button class="btn small ghost release-btn" type="button">RELEASE</button>
            </div>
        </div>
        <div class="contact-telemetry mono">${pseudoTelemetry(item.name)}</div>
    </div>`;
}

function buildAll(){
    const container = document.getElementById("contactSections");
    let html = "";
    CATEGORIES.forEach(cat => {
        html += `<div class="category-block">`;
        html += `<div class="category-head">${cat.label.toUpperCase()} <span class="category-count mono">// SENSOR: ${cat.abbr}</span></div>`;
        html += `<div class="contact-grid">`;
        cat.items.forEach(item => {
            const full = AFTERIMAGES.find(a => a.name === item.name);
            html += buildCardHTML(full);
        });
        html += `</div></div>`;
    });
    container.innerHTML = html;

    AFTERIMAGES.forEach(item => {
        const card = document.getElementById(`contact-${item.id}`);

        card.addEventListener("click", (e) => {
            if(e.target.closest(".release-btn")) return;
            lockContact(item.id);
        });

        card.querySelector(".release-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            releaseContact(item.id);
        });

        if(acquiredMap[item.id]){
            card.classList.add("acquired");
            card.querySelector(".contact-name").textContent = item.name.toUpperCase();
            card.querySelector(".contact-acquire-text").textContent = item.acquire;
            card.querySelector(".contact-fix-text").textContent = item.fix;
        }
    });
}

function renderStats(){
    document.getElementById("statLogged").textContent = `${Object.keys(acquiredMap).length} / ${AFTERIMAGES.length}`;
}

function renderLog(){
    const panel = document.getElementById("logPanel");
    if(logEntries.length === 0){
        panel.innerHTML = '<div class="log-empty">NO CONTACTS LOGGED THIS SESSION</div>';
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

// ---------- actions ----------

function lockContact(id){
    const card = document.getElementById(`contact-${id}`);
    if(card.classList.contains("acquired") || card.classList.contains("locking")) return;

    const item = AFTERIMAGES.find(a => a.id === id);
    card.classList.add("locking");

    setTimeout(() => {
        card.classList.remove("locking");
        card.classList.add("acquired");

        revealText(card.querySelector(".contact-name"), item.name.toUpperCase());
        revealText(card.querySelector(".contact-acquire-text"), item.acquire);
        revealText(card.querySelector(".contact-fix-text"), item.fix);

        acquiredMap[id] = Object.assign({}, item, { acquiredAt: Date.now() });
        saveAcquired();

        addLog(`LOCK CONFIRMED — ${item.name.toUpperCase()} (${item.category.toUpperCase()}) · ${item.code}`);
        renderStats();

    }, 650);
}

function releaseContact(id){
    const item = AFTERIMAGES.find(a => a.id === id);
    delete acquiredMap[id];
    saveAcquired();

    const card = document.getElementById(`contact-${id}`);
    card.classList.remove("acquired");

    addLog(`RELEASED — ${item.name.toUpperCase()} (${item.category.toUpperCase()}) · ${item.code}`);
    renderStats();
}

function tickClock(){
    clockSeconds++;
    const h = String(Math.floor(clockSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((clockSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(clockSeconds % 60).padStart(2, "0");
    const el = document.getElementById("telemetryClock");
    if(el) el.textContent = `${h}:${m}:${s}`;
}

// ---------- init ----------

document.addEventListener("DOMContentLoaded", () => {
    loadAcquired();
    buildAll();
    renderStats();
    renderLog();
    setInterval(tickClock, 1000);
});

console.log("HORIZOGRAPH TERMINAL ONLINE");
console.log("SENSORS LIVE. CONTACTS UNRESOLVED. LOCK TO DECODE.");
