const ACCESS = {

    "ESPER": "esper/",

    "LINKWALKER": "linkwalker/",
    
    "FORERUNNER": "forerunner/",

    "SPIRITBOX": "spiritbox/",

    "ROUTINE": "routine/",

    "KNOT": "link-and-knot/",

    "LINK": "link-and-knot/",

    "LINK AND KNOT": "link-and-knot/",

    "HEX": "hex-grave/",

    "GRAVE": "hex-grave/",

    "HEX GRAVE": "hex-grave/",

    "OPERATOR": "operator-registry/",

    "REGISTRY": "operator-registry/",

    "OPERATOR REGISTRY": "operator-registry/",

    "FIELD": "field-baseline-operational-structure/",

    "BASELINE": "field-baseline-operational-structure/",

    "OPERATIONAL": "field-baseline-operational-structure/",

    "FIELD": "field-baseline-operational-structure/",

    "FIELD BASELINE": "field-baseline-operational-structure/",

    "AFTERIMAGE": "afterimage-telemetry/",

    "TELEMETRY": "afterimage-telemetry/",

    "AFTERIMAGE TELEMETRY": "afterimage-telemetry/",

    "HORIZOGRAPH": "horizograph/",

    "CONSTELLATION": "constellation/",

    "DOOMER": "doomer/",

    "KINDLING": "kindling/",

    "6321": "6321/"
};

function targetURL(relPath){

    // resolve relative to the actual folder this document lives in,
    // rather than trusting a bare relative string (which breaks if
    // the browser's address bar has no trailing slash)
    const path = window.location.pathname;
    const dir = path.substring(0, path.lastIndexOf("/") + 1);

    return dir + relPath;

}

function verify(){

    const key = document
        .getElementById("key")
        .value
        .trim()
        .toUpperCase();

    const status =
        document.getElementById("status");

    if(ACCESS[key]){

        status.innerHTML =
        '<span class="whitebox">ACCESS GRANTED</span>';

        setTimeout(()=>{

            window.location.href = targetURL(ACCESS[key]);

        },900);

    }

    else{

        status.innerHTML =
        '<span class="whitebox">INVALID AUTHORIZATION</span>';

    }

}

document.addEventListener("keydown",e=>{

    if(e.key==="Enter"){

        verify();

    }

});

console.log("DOCUMENT STATUS : ACTIVE");
console.log("OBSERVATION IS A FORM OF ENTRY");

/*

If you're reading this,

follow sagittarius.

*/
