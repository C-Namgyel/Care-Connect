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
function playSound(dir) {
    let aud = document.createElement("audio");
    aud.src = dir;
    document.body.appendChild(aud);
    aud.play();
    aud.onended = function() {
        aud.remove();
    }
}
function notify(message) {
    let barrier = document.createElement("div");
    barrier.style = "position: fixed; width: 100%; height: 100%; left: 0%; top: 0%; animation-name: darken; animation-duration: 150ms; animation-timing-function: linear; animation-fill-mode: forwards; z-index: 999;";
    document.body.appendChild(barrier);
    let div = document.createElement("div");
    div.style = "padding: 10px; background-color: #ffffff; border: 1px solid #000000; border-radius: 10px; width: 90%; max-width: 500px; max-height: 50%; overflow: auto; overflow-wrap: break-word; position: absolute; left: 50%; top: 30%; transform: translateX(-50%) translateY(-50%); animation-name: popUp; animation-duration: 150ms; animation-timing-function: linear;";
    barrier.appendChild(div);
    let messageDiv = document.createElement("div");
    messageDiv.style = "font-size: 16px;"
    messageDiv.innerHTML = message.replaceAll("\n", "<br>");
    div.appendChild(messageDiv);
    div.appendChild(document.createElement("br"));
    let button = document.createElement("button");
    button.innerHTML = "OK";
    button.style = "background-color: rgb(0, 60, 255); color: white; border: none; padding: 10px 20px; font-size: 12px; cursor: pointer; border-radius: 4px; float: right;";
    div.appendChild(button);
    let clear = document.createElement("div");
    clear.style = "clear: both;";
    div.appendChild(clear);
    button.onclick = function() {
        div.style.animationDuration = "150ms";
        div.style.animationName = "popOut";
        barrier.style.animationDuration = "150ms";
        barrier.style.animationName = "lighten";
        barrier.onanimationend = function() {
            barrier.remove();
        }
    }
}
function inquire(message, def, code) {
    let barrier = document.createElement("div");
    barrier.style = "position: fixed; width: 100%; height: 100%; left: 0%; top: 0%; animation-name: darken; animation-duration: 150ms; animation-timing-function: linear; animation-fill-mode: forwards; z-index: 999;";
    document.body.appendChild(barrier);
    let div = document.createElement("div");
    div.style = "padding: 10px; background-color: #ffffff; border: 1px solid #000000; border-radius: 10px; width: 90%; max-width: 500px; max-height: 50%; overflow: auto; overflow-wrap: break-word; position: absolute; left: 50%; top: 25%; transform: translateX(-50%); animation-name: popUp; animation-duration: 150ms; animation-timing-function: linear; animation-fill-mode: forwards;";
    barrier.appendChild(div);
    let messageDiv = document.createElement("div");
    messageDiv.style = "font-size: 16px;"
    messageDiv.innerHTML = message.replaceAll("\n", "<br>");
    div.appendChild(messageDiv);
    div.appendChild(document.createElement("br"));
    let input = document.createElement("input");
    input.value = def;
    input.style = "padding: 5px; font-size: 16px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; width: 100%;";
    div.appendChild(input);
    div.appendChild(document.createElement("br"));
    div.appendChild(document.createElement("br"));
    let cancel = document.createElement("button");
    cancel.innerHTML = "Cancel";
    cancel.style = "background-color: #ffffff; color: black; border: none; outline: solid lightgrey 1px; padding: 10px 20px; font-size: 12px; cursor: pointer; border-radius: 4px; float: right;";
    div.appendChild(cancel);
    let br1 = document.createElement("div")
    br1.style = "float: right; color: rgba(0, 0, 0, 0);";
    br1.innerHTML = "__";
    div.appendChild(br1);
    let ok = document.createElement("button");
    ok.innerHTML = "OK";
    ok.style = "background-color: rgb(0, 60, 255); color: white; border: none; outline: solid lightgrey 1px; padding: 10px 20px; font-size: 12px; cursor: pointer; border-radius: 4px; float: right;";
    div.appendChild(ok);
    let clear = document.createElement("div");
    clear.style = "clear: both;";
    div.appendChild(clear);
    ok.onclick = function() {
        div.style.animationDuration = "150ms";
        div.style.animationName = "popOut";
        barrier.style.animationDuration = "150ms";
        barrier.style.animationName = "lighten";
        code(input.value);
        div.onanimationend = function(aa) {
            if (aa.animationName == "popOut") {
                barrier.remove();
            }
        }
    }
    input.onkeydown = function(ev) {
        if (ev.code == "Enter") {
            ok.click();
        }
    }
    cancel.onclick = function() {
        div.style.animationDuration = "150ms";
        div.style.animationName = "popOut";
        barrier.style.animationDuration = "150ms";
        barrier.style.animationName = "lighten";
        code(null);
        div.onanimationend = function(aa) {
            if (aa.animationName == "popOut") {
                barrier.remove();
            }
        }
    }
    input.focus();
}
function verify(message, code) {
    let barrier = document.createElement("div");
    barrier.style = "position: fixed; width: 100%; height: 100%; left: 0%; top: 0%; animation-name: darken; animation-duration: 150ms; animation-timing-function: linear; animation-fill-mode: forwards; z-index: 999;";
    document.body.appendChild(barrier);
    let div = document.createElement("div");
    div.style = "padding: 10px; background-color: #ffffff; border: 1px solid #000000; border-radius: 10px; width: 90%; max-width: 500px; max-height: 50%; overflow: auto; overflow-wrap: break-word; position: absolute; left: 50%; top: 25%; transform: translateX(-50%); animation-name: popUp; animation-duration: 150ms; animation-timing-function: linear; animation-fill-mode: forwards;";
    barrier.appendChild(div);
    let messageDiv = document.createElement("div");
    messageDiv.style = "font-size: 16px;"
    messageDiv.innerHTML = message.replaceAll("\n", "<br>");
    div.appendChild(messageDiv);
    div.appendChild(document.createElement("br"));
    let cancel = document.createElement("button");
    cancel.innerHTML = "Cancel";
    cancel.style = "background-color: #ffffff; color: black; border: none; outline: solid lightgrey 1px; padding: 10px 20px; font-size: 12px; cursor: pointer; border-radius: 4px; float: right;";
    div.appendChild(cancel);
    let br1 = document.createElement("div")
    br1.style = "float: right; color: rgba(0, 0, 0, 0);";
    br1.innerHTML = "__";
    div.appendChild(br1);
    let ok = document.createElement("button");
    ok.innerHTML = "OK";
    ok.style = "background-color: rgb(0, 60, 255); color: white; border: none; outline: solid lightgrey 1px; padding: 10px 20px; font-size: 12px; cursor: pointer; border-radius: 4px; float: right;";
    div.appendChild(ok);
    let clear = document.createElement("div");
    clear.style = "clear: both;";
    div.appendChild(clear);
    ok.onclick = function() {
        div.style.animationDuration = "150ms";
        div.style.animationName = "popOut";
        barrier.style.animationDuration = "150ms";
        barrier.style.animationName = "lighten";
        code(true);
        div.onanimationend = function(aa) {
            if (aa.animationName == "popOut") {
                barrier.remove();
            }
        }
    }
    cancel.onclick = function() {
        div.style.animationDuration = "150ms";
        div.style.animationName = "popOut";
        barrier.style.animationDuration = "150ms";
        barrier.style.animationName = "lighten";
        code(false);
        div.onanimationend = function(aa) {
            if (aa.animationName == "popOut") {
                barrier.remove();
            }
        }
    }
}
function randomNumber(min, max) {
    return(Math.floor(Math.random()*(max - min + 1) + min))
}
function T2S(text) {
    let synth = window.speechSynthesis;
    let ourText = text;
    let utterThis = new SpeechSynthesisUtterance(ourText);
    synth.speak(utterThis);
}

// Variables
var authData; // The data returned from firebase auth
var userDetails; // The user data stored in the database
var listenStart = 0; // Will start listening for changes when it reaches the count value
var count = 3;
var categories;
var childLoad = 0;