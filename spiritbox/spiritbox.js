/*

SPIRITBOX — DECRYPTION ARCHIVE

To add a new message for the Operators to decode:

1. Write your plaintext message.
2. Encrypt it with a Vigenère cipher using whatever key you want
   the Operators to need. Spaces and punctuation pass through
   unchanged — only letters get shifted.
3. Add a new entry to the MESSAGES array below, following the
   same shape as the example entry. Each entry needs:
     - id             unique, no spaces (e.g. "cipher-02")
     - label          shown in the row (e.g. "TRANSMISSION 02")
     - classification shown as the badge text (e.g. "ULTRABLACK")
     - ciphertext     your Vigenère-encrypted string

New entries appear at the bottom of the archive, collapsed,
in the order you list them. Nothing else needs to change.

The key a user enters is never checked against a "correct"
answer — any key decodes into *something*. Only the right key
produces a readable result. That's how Vigenère works.

*/

const MESSAGES = [

    {
        id: "cipher-01",
        label: "TRANSMISSION 01",
        classification: "ULTRABLACK",
        ciphertext:
            "CKACQA YFBKN WVG JOGKG TRHRESF GVZ SWYAOGS HZR OMCVAIS MEAWZPZRG WISMY BSZS"
    }

    // Add new entries here, comma-separated. Example:
    //
    // ,{
    //     id: "cipher-02",
    //     label: "TRANSMISSION 02",
    //     classification: "ULTRABLACK",
    //     ciphertext: "YOUR ENCRYPTED STRING HERE"
    // }

];

function vigDecrypt(text, key){

    const keyLetters = key
        .toUpperCase()
        .split("")
        .filter(c => c >= "A" && c <= "Z");

    if(keyLetters.length === 0) return null;

    let ki = 0;
    let out = "";

    for(const c of text.toUpperCase()){

        if(c >= "A" && c <= "Z"){

            const shift = keyLetters[ki % keyLetters.length].charCodeAt(0) - 65;
            const code = ((c.charCodeAt(0) - 65 - shift) + 26) % 26;
            out += String.fromCharCode(code + 65);
            ki++;

        } else {

            out += c;

        }

    }

    return out;

}

function lockedView(text){

    // strip existing spacing, rechunk into blocks of 5
    // to keep word boundaries hidden while encrypted
    const letters = text.replace(/[^A-Z]/gi, "").toUpperCase();
    const blocks = [];

    for(let i = 0; i < letters.length; i += 5){

        blocks.push(letters.slice(i, i + 5));

    }

    const rows = [];

    for(let i = 0; i < blocks.length; i += 8){

        rows.push(blocks.slice(i, i + 8).join("  "));

    }

    return rows.join("\n");

}

function buildEntryMarkup(msg, index){

    const num = String(index + 1).padStart(2, "0");

    return `
        <summary>
            <span class="entry-left">
                <span class="entry-index">${num}</span>
                <span class="entry-title">${msg.label}</span>
                <span class="entry-class">${msg.classification}</span>
            </span>
            <span class="entry-right">
                <span class="entry-status" id="rowstatus-${msg.id}">NOISE</span>
                <span class="toggle-icon"></span>
            </span>
        </summary>
        <div class="entry-body">
            <div class="cipher-text" id="display-${msg.id}"></div>
            <div class="key-row">
                <input id="key-${msg.id}" autocomplete="off" placeholder="ENTER KEY">
                <button type="button" data-clear="${msg.id}">CLEAR</button>
            </div>
            <div class="decode-status" id="status-${msg.id}"></div>
        </div>
    `;

}

const glitchTimers = {};

function scramble(text){

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    return text
        .split("")
        .map(c => {

            if(c >= "A" && c <= "Z"){

                return Math.random() < 0.65
                    ? alphabet[Math.floor(Math.random() * 26)]
                    : c;

            }

            return c;

        })
        .join("");

}

function playGlitch(id, finalText){

    const el = document.getElementById("display-" + id);
    if(!el) return;

    if(glitchTimers[id]){

        clearTimeout(glitchTimers[id]);
        delete glitchTimers[id];

    }

    el.classList.add("shake");

    let frame = 0;
    const totalFrames = 3;
    const frameDelay = 45;

    function step(){

        if(frame < totalFrames){

            el.textContent = scramble(finalText);
            frame++;
            glitchTimers[id] = setTimeout(step, frameDelay);

        } else {

            el.textContent = finalText;
            el.classList.remove("shake");
            delete glitchTimers[id];

        }

    }

    step();

}

function renderMessage(msg){

    const display = document.getElementById("display-" + msg.id);
    const status = document.getElementById("status-" + msg.id);
    const rowStatus = document.getElementById("rowstatus-" + msg.id);
    const keyInput = document.getElementById("key-" + msg.id);
    const key = keyInput.value.trim();

    if(key.length === 0){

        playGlitch(msg.id, lockedView(msg.ciphertext));
        display.classList.remove("decoded");

        status.textContent = "";
        status.classList.remove("decoded");
        rowStatus.textContent = "NOISE";
        rowStatus.classList.remove("decoded");
        return;

    }

    const decoded = vigDecrypt(msg.ciphertext, key);

    playGlitch(msg.id, decoded);
    display.classList.add("decoded");

    status.textContent = "— KEY APPLIED : " + key.toUpperCase() + " —";
    status.classList.add("decoded");
    rowStatus.textContent = "SIGNAL";
    rowStatus.classList.add("decoded");

}

document.addEventListener("DOMContentLoaded", () => {

    const archive = document.getElementById("archive");

    if(MESSAGES.length === 0){

        archive.innerHTML = '<p class="archive-empty">NO TRANSMISSIONS ON FILE</p>';
        return;

    }

    MESSAGES.forEach((msg, i) => {

        const entry = document.createElement("details");
        entry.className = "archive-entry";
        entry.dataset.id = msg.id;
        entry.innerHTML = buildEntryMarkup(msg, i);

        archive.appendChild(entry);

        renderMessage(msg);

        document
            .getElementById("key-" + msg.id)
            .addEventListener("input", () => renderMessage(msg));

    });

    archive.addEventListener("click", (e) => {

        const btn = e.target.closest("[data-clear]");
        if(!btn) return;

        e.preventDefault();

        const id = btn.dataset.clear;
        const msg = MESSAGES.find(m => m.id === id);

        document.getElementById("key-" + id).value = "";
        renderMessage(msg);

    });

});

console.log("SPIRITBOX ARCHIVE ONLINE");
console.log("EVERY KEY OPENS SOMETHING. ONLY ONE OPENS THE TRUTH.");
