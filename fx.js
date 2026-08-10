/*

KERNEL — AMBIENT FX

Two independent, purely decorative effects for the gate page, plus
a fake boot log. None of them touch verify() or ACCESS from
terminal.js, and none of them link anywhere — the Kernel is a
threshold, not a menu.

  1. Ticker      — cycles through system callouts already seen
                    across the other nodes, tying the gate to the
                    same voice as everything behind it.
  2. Static block — several rows of braille glyphs, each flickering
                    a fraction of its characters on an interval,
                    standing in for "the Static" from the lore.
  3. Boot box     — a simulated kernel boot log that prints a few
                    lines, sits with a blinking cursor, then clears
                    and runs again after a pause.

*/

// ---------- ticker ----------

const TICKER_PHRASES = [
    ">> CONTAINMENT HOLDING",
    ">> SOURCE UNRESOLVED",
    ">> OBSERVATION ACTIVE",
    ">> STATIC PRESSURE ELEVATED",
    ">> SIGNAL LOCK PARTIAL",
    ">> PARAMETERS HOLDING",
    ">> PATTERN DRIFT DETECTED",
    ">> RESPONSE INCONCLUSIVE"
];

const TICKER_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ>-—/ ";

function scrambleTicker(text){
    return text
        .split("")
        .map(c => (c === " " ? c : (Math.random() < 0.5 ? TICKER_GLYPHS[Math.floor(Math.random() * TICKER_GLYPHS.length)] : c)))
        .join("");
}

function runTicker(){

    const el = document.getElementById("ticker");
    if(!el) return;

    let index = 0;

    function next(){

        index = (index + 1) % TICKER_PHRASES.length;
        const target = TICKER_PHRASES[index];

        let frame = 0;

        function step(){

            if(frame < 4){
                el.textContent = scrambleTicker(target);
                frame++;
                setTimeout(step, 45);
            } else {
                el.textContent = target;
            }

        }

        step();

    }

    setInterval(next, 4200);

}

// ---------- static block (multi-row braille noise) ----------

function runStaticBlock(){

    const root = document.getElementById("staticBlock");
    if(!root) return;

    const ROWS = 5;
    const COLS = 100;

    function randomBraille(){
        return String.fromCharCode(0x2800 + Math.floor(Math.random() * 256));
    }

    const rows = [];

    for(let r = 0; r < ROWS; r++){

        const rowEl = document.createElement("div");
        rowEl.className = "static-row";
        root.appendChild(rowEl);

        const chars = [];
        for(let i = 0; i < COLS; i++){
            chars.push(randomBraille());
        }

        rows.push({ el: rowEl, chars: chars, flicker: 0.05 + Math.random() * 0.06 });

    }

    function render(row){
        row.el.textContent = row.chars.join("");
    }

    rows.forEach(render);

    setInterval(() => {

        rows.forEach(row => {

            for(let i = 0; i < row.chars.length; i++){
                if(Math.random() < row.flicker){
                    row.chars[i] = randomBraille();
                }
            }

            render(row);

        });

    }, 180);

}

// ---------- boot box (simulated kernel boot) ----------

const BOOT_LINES = [
    { tag: "OK",   text: "Initializing containment kernel..." },
    { tag: "OK",   text: "Mounting Static interface..." },
    { tag: "OK",   text: "Calibrating Pale threshold..." },
    { tag: "OK",   text: "Loading Operant directory..." },
    { tag: "WARN", text: "Reading drift detected (BRN)" },
    { tag: "OK",   text: "Verifying Kete-Class registry..." },
    { tag: "OK",   text: "Establishing Link handshake..." },
    { tag: "FAIL", text: "Source resolution — unresolved" },
    { tag: "OK",   text: "Containment holding." },
    { tag: "OK",   text: "Awaiting authorization..." }
];

function runBootSequence(){

    const box = document.getElementById("bootBox");
    if(!box) return;

    function typeLine(line, onDone){

        const p = document.createElement("div");
        const tag = document.createElement("span");

        tag.className = "boot-tag";
        tag.textContent = "[ " + line.tag + " ]";
        p.appendChild(tag);

        const textNode = document.createElement("span");
        p.appendChild(textNode);
        box.appendChild(p);

        let i = 0;

        function step(){

            if(i <= line.text.length){
                textNode.textContent = line.text.slice(0, i);
                i++;
                setTimeout(step, 14 + Math.random() * 22);
            } else {
                onDone();
            }

        }

        step();

    }

    function runOnce(onFinished){

        box.innerHTML = "";
        let idx = 0;

        function next(){

            if(idx >= BOOT_LINES.length){
                const cursor = document.createElement("span");
                cursor.className = "boot-cursor";
                box.appendChild(cursor);
                onFinished();
                return;
            }

            typeLine(BOOT_LINES[idx], () => {
                idx++;
                setTimeout(next, 90 + Math.random() * 160);
            });

        }

        next();

    }

    function loop(){
        runOnce(() => {
            setTimeout(loop, 6000);
        });
    }

    loop();

}

document.addEventListener("DOMContentLoaded", () => {
    runTicker();
    runStaticBlock();
    runBootSequence();
});
