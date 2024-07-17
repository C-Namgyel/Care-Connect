// Functions
function setScreen(screen) {
    for (let s of document.querySelectorAll(".scrn")) {
        if (screen == s.id) {
            s.hidden = false;
        } else {
            s.hidden = true;
        }
    }
}
function snackbar(message) {
    let sb = document.getElementById("snackbar")
    sb.innerHTML = message;
    sb.style.animationName = "snackbar";
    sb.onanimationend = function() {
        sb.style.animationName = NaN;
    }
}
function animation(elem, name, duration) {
    elem.style.animationName = name;
    elem.style.animationDuration = duration;
    elem.style.animationFillMode = "forwards"
    elem.style.animationTimingFunction = "calc()"
}
function openNav() {
    document.getElementById("barrier").hidden = false;
    animation(document.getElementById("navDiv"), "openNav", "0.2s");
    animation(document.getElementById("barrier"), "fadeIn", "0.2s");
}
function closeNav() {
    animation(document.getElementById("navDiv"), "closeNav", "0.2s");
    animation(document.getElementById("barrier"), "fadeOut", "0.2s");
    document.getElementById("barrier").onanimationend = function(event) {
        if (event.animationName == "fadeOut") {
            document.getElementById("barrier").hidden = true;
        }
    }
}
function playSound(filename) {
    let aud = document.createElement("audio");
    aud.src = `./assets/audio/${filename}.mp3`;
    document.body.appendChild(aud);
    aud.play();
    aud.onended = function() {
        aud.remove();
    }
}

// Variables
var authData;
var userDetails;
var listenStart = 0;
var count = 2;