// Temporary Code
// document.getElementById("mainAuth").hidden = true;
// document.getElementById("homeScrn").hidden = false;

// Firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getDatabase, ref, set, get, child, onValue } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";
import { getStorage, ref as sref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAxl94Pt7OAX9qIN4C3F-34qbIPXH4ly7A",
    authDomain: "care-connect-ed790.firebaseapp.com",
    databaseURL: "https://care-connect-ed790-default-rtdb.firebaseio.com/",
    projectId: "care-connect-ed790",
    storageBucket: "care-connect-ed790.appspot.com",
    messagingSenderId: "498711747288",
    appId: "1:498711747288:web:99a1fcd9e5506f9682d5ad",
    measurementId: "G-83096X34Q9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const database = getDatabase(app);
const storage = getStorage();

// Auth Check
onAuthStateChanged(auth, (user) => {
    user = auth.currentUser;
    authData = user;
    if (user) {
        if (user.emailVerified) {
            get(child(ref(database), `users/${user.uid}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    console.log("User is valid")
                    userDetails = snapshot.val();
                    document.getElementById("splashDiv").hidden = true;
                    document.getElementById("mainAuth").hidden = true;
                    document.getElementById("homeScrn").hidden = false;
                    document.getElementById("navName").innerHTML = userDetails.username;
                    document.getElementById("navEmail").innerHTML = userDetails.email;
                    document.getElementById("navUID").innerHTML = authData.uid;
                    if (userDetails.accountType == "Parent") {
                        startListening()
                        document.getElementById("typeToSpeak").style.display = "none";
                        document.getElementById("emergency").style.display = "none";
                    } else {
                        document.getElementById("connect").hidden = true;
                    }
                } else {
                    document.getElementById("splashDiv").hidden = true;
                    document.getElementById("mainAuth").hidden = true;
                    document.getElementById("googleSignUp").hidden = false;
                }
            }).catch((error) => {
                console.error(error);
            });              
        } else {
            console.log('User email is not verified.');
            document.getElementById("splashDiv").hidden = true;
            document.getElementById("emailVerify").style.display = "flex";
        }
    } else {
        console.log('User is signed out.');
        document.getElementById("splashDiv").hidden = true;
    }
});

// Navigation
document.getElementById("menu").onclick = function() {
    openNav();
}
document.getElementById("barrier").onclick = function() {
    closeNav();
}
document.getElementById("navUID").onclick = function() {
    let copyText = document.getElementById("navUID").innerHTML;
    let inp = document.createElement("input")
    inp.value = copyText;
    inp.select();
    inp.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(inp.value);
    inp.remove();
    snackbar("UID copied to clipboard");
}
document.getElementById("connect").onclick = function() {
    setScreen("connectScrn");
    document.getElementById("barrier").click();
    if (userDetails.child != undefined) {
        document.getElementById("connectUID").value = userDetails.child;
        document.getElementById("connectUID").disabled = true;
        document.getElementById("connectBtn").hidden = true;
        document.getElementById("disconnectBtn").hidden = false;
    }
}
document.getElementById("signOut").onclick = function() {
    let c = confirm("Sign Out?")
    if (c == true) {
        signOut(auth).then(() => {
            // Sign-out successful.
            window.location.reload();
        }).catch((error) => {
            // An error happened.
            console.log("Sign out error: ", error)
        });
    }
}

// Connect
document.getElementById("connectBtn").onclick = function() {
    let b = this;
    b.disabled = true;
    b.innerHTML = "Connecting";
    if (document.getElementById("connectUID").value.trim() != "") {
        get(child(ref(database), `users`)).then((snapshot) => {
            let list = Object.keys(snapshot.val());
            if (list.includes(document.getElementById("connectUID").value.trim())) {
                if (snapshot.val()[document.getElementById("connectUID").value.trim()].accountType == "Child") {
                    set(ref(database, 'users/' + authData.uid + '/child'), document.getElementById("connectUID").value.trim()).then(() => {
                        b.disabled = false;
                        b.innerHTML = "Connect";
                        b.hidden = true;
                        document.getElementById("connectUID").disabled = true;
                        document.getElementById("disconnectBtn").hidden = false;
                        snackbar("Successfully Connected")
                    })
                } else {
                    b.disabled = false;
                    b.innerHTML = "Connect";
                    snackbar("Given account is not a child!")
                }
            } else {
                b.disabled = false;
                b.innerHTML = "Connect";
                snackbar("No child found");
            }
        });
    } else {
        b.disabled = false;
        b.innerHTML = "Connect";
        snackbar("Please enter the child's UID");
    }
}
document.getElementById("disconnectBtn").onclick = function() {
    let b = this;
    b.disabled = true;
    b.innerHTML = "Disonnecting";
    set(ref(database, 'users/' + authData.uid + '/child'), null).then(() => {
        b.disabled = false;
        b.innerHTML = "Disconnect";
        b.hidden = true;
        document.getElementById("connectUID").disabled = false;
        document.getElementById("connectBtn").hidden = false;
        snackbar("Successfully Disconnected");
    })
}

// Auth Screen
document.getElementById("authLogin").onclick = function() {
    document.getElementById("mainAuth").hidden = true;
    document.getElementById("loginScrn").hidden = false;
}
document.getElementById("authSignUp").onclick = function() {
    document.getElementById("mainAuth").hidden = true;
    document.getElementById("signUpScrn").hidden = false;
}
document.getElementById('loginForm').onsubmit = function (e) {
    e.preventDefault(); // Prevent form submission
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // User signed in successfully
        let user = userCredential.user;
        authData = user;
        window.location.reload();
        // ...
    })
    .catch((error) => {
        let errorCode = error.code;
        let errorMessage = error.message;
        // Handle errors
        console.log(errorCode)
        if (errorCode == "auth/invalid-email") {
            snackbar("Invalid Email");
        } else if (errorCode == "auth/invalid-credential") {
            snackbar("Incorrect Email or Password");
        } else {
            snackbar("Error. Try again");
        }
    });
};
document.getElementById('signUpForm').onsubmit = function (e) {
    e.preventDefault(); // Prevent form submission
    let username = document.getElementById("signUpUsername").value;
    let email = document.getElementById("signUpEmail").value;
    let password = document.getElementById("signUpPassword").value;
    let confirmPassword = document.getElementById("signUpConfirmPassword").value;
    let type = document.getElementById("signUpAccountType").value;
    const registerUser = async (email, password) => {
        try {
            let userCredential = await createUserWithEmailAndPassword(auth, email, password);
            let user = userCredential.user;
            set(ref(database, 'users/' + user.uid), {
                username: username.trim(),
                email: email.trim(),
                accountType: type
            }).then(() => {
                document.getElementById("emailVerify").style.display = "flex";
            })
            .catch((error) => {
                console.error(error)
            });
            // Send verification email
            await sendEmailVerification(user);
        } catch (error) {
            console.error('Error creating user:', error.code);
            if ((error.code).includes("auth/email-already-in-use") == true) {
                snackbar("The email is already registered");
            } else if ((error.code).includes("auth/weak-password") == true) {
                snackbar("The password is too weak");
            } else {
                snackbar("Error. Try again")
            }
        }
    }
    if (password == confirmPassword) {
        registerUser(email, password);
    } else {
        snackbar("Passwords doesn't match");
    }
};
document.getElementById('googleForm').onsubmit = function (e) {
    e.preventDefault(); // Prevent form submission
    document.getElementById('googleBtn').disabled = true;
    document.getElementById('googleBtn').innerHTML = "Wait"
    let username = document.getElementById("googleUsername").value.trim();
    let type = document.getElementById("googleAccountType").value.trim();
    set(ref(database, 'users/' + authData.uid), {
        username: username,
        email: authData.email,
        accountType: type
      })
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error(error)
    });
};

// Google Auth
function googleAuth() {
    signInWithPopup(auth, googleProvider)
    .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        console.log("Success", user)
        // IdP data available using getAdditionalUserInfo(result)
        let div = document.createElement("div");
        div.style = "position: fixed; left: 0%; top: 0%; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: rgba(0, 0, 0, 0.75); color: white; font-weight: bolder; font-size: 10vw; z-index: 15;";
        div.innerHTML = "Logging In";
        document.body.appendChild(div);
        get(child(ref(database), `users/${user.uid}`)).then((snapshot) => {
            if (snapshot.exists()) {
                window.location.reload();
            } else {
                document.getElementById("signUpScrn").hidden = true;
                document.getElementById("loginScrn").hidden = true;
                document.getElementById("googleSignUp").hidden = false;
                authData = user;
                div.remove();
            }
        });
        // ...
    }).catch((error) => {
        // Handle Errors here.
        console.log(error)
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        // const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
    });
}
document.getElementById("googleAuth").onclick = function() {
    googleAuth();
};
document.getElementById("googleAuth2").onclick = function() {
    googleAuth();
};

// Home Button
for (let h of document.querySelectorAll(".homeBtn")) {
    h.onclick = function() {
        setScreen("homeScrn");
    }
}


// Sign Out from verify screen
document.getElementById("signOut2").onclick = function() {
    let c = confirm("Sign Out?")
    if (c == true) {
        signOut(auth).then(() => {
            // Sign-out successful.
            window.location.reload();
        }).catch((error) => {
            // An error happened.
            console.log("Sign out error: ", error)
        });
    }
}

// Home Screen
for (let b of document.querySelectorAll(".homeMenu")) {
    b.onclick = function() {
        setScreen(`${b.id}Scrn`);
        if (userDetails.accountType == "Parent") {
            if (b.id == "tapToSpeak") {
                
            } else if (b.id == "reminder") {
    
            } else if (b.id == "games") {
                
            } else if (b.id == "mood") {
                
            }
        } else {
            if (b.id == "tapToSpeak") {
                document.getElementById("tapToSpeakAdd").hidden = true;
            } else if (b.id == "reminder") {
                document.getElementById("reminderAdd").hidden = true;
            } else if (b.id == "games") {
                document.getElementById("gamesAdd").hidden = true;
            } else if (b.id == "mood") {
                document.getElementById("moodAdd").hidden = true;
            } else if (b.id == "typeToSpeak") {

            } else if (b.id == "emergency") {
                setScreen("homeScrn");
                playSound("help");
                set(ref(database, `${authData.uid}/emergency`), Math.floor(Math.random()*(99999 - 1 + 1) + 1)).then(() => {
                    snackbar("Alerted the parent");
                })
            }
        }
    }
}

// Tap to Speak
////Mode
document.getElementById("tapToSpeakT2SSelect").oninput = function() {
    if (this.value == "Audio") {
        this.value = "Text to Speech";
        setScreen("tapToSpeakAudioAddScrn");
    }
}
document.getElementById("tapToSpeakAudioSelect").oninput = function() {
    if (this.value == "Text to Speech") {
        this.value = "Audio";
        setScreen("tapToSpeakT2SAddScrn");
    }
}
////Back and Add
document.getElementById("tapToSpeakT2SBack").onclick = function() {
    setScreen("tapToSpeakScrn")
}
document.getElementById("tapToSpeakAudioBack").onclick = function() {
    setScreen("tapToSpeakScrn")
}
document.getElementById("tapToSpeakAdd").onclick = function() {
    setScreen("tapToSpeakT2SAddScrn")
}
////T2S
document.getElementById("tapToSpeakT2SInp").oninput = function() {
    if (this.files[0] != undefined) {
        document.getElementById("tapToSpeakT2SInpText").innerHTML = "Insert Image<br>"+this.files[0].name;
        let l = URL.createObjectURL(this.files[0]);
        document.getElementById("tapToSpeakT2SImg").style.backgroundImage = `url(${l})`;
    }
}
document.getElementById("tapToSpeakT2SMessage").oninput = function() {
    this.style.height = 50;
    if (this.scrollHeight >= 50) {
        this.style.height = this.scrollHeight;
    } else {
        this.style.height = 50;
    }
}
document.getElementById("tapToSpeakT2SCaterogy").oninput = function() {
    if (this.value == "Manage Category") {
        this.value = "";
        // Goto manage category screen
    }
}
////Audio
document.getElementById("tapToSpeakAudioInp").oninput = function() {
    if (this.files[0] != undefined) {
        document.getElementById("tapToSpeakAudioInpText").innerHTML = "Insert Image<br>"+this.files[0].name;
        let l = URL.createObjectURL(this.files[0]);
        document.getElementById("tapToSpeakAudioImg").style.backgroundImage = `url(${l})`;
    }
}
document.getElementById("tapToSpeakAudioCaterogy").oninput = function() {
    if (this.value == "Manage Category") {
        this.value = "";
        // Goto manage category screen
    }
}
document.getElementById("tapToSpeakAudioMessage").oninput = function() {
    if (this.files[0] != undefined) {
        document.getElementById("tapToSpeakAudioMessageText").innerHTML = "Upload Audio<br>"+this.files[0].name;
        let l = URL.createObjectURL(this.files[0]);
        document.getElementById("tapToSpeakAudioPreview").src = l;
    }
}

// Type to speak
document.getElementById("typeToSpeakBtn").onclick = function() {
    let synth = window.speechSynthesis;
    let ourText = document.getElementById("typeToSpeakText").value;
    let utterThis = new SpeechSynthesisUtterance(ourText);
    synth.speak(utterThis);
    set(ref(database, `${authData.uid}/typeToSpeak`), document.getElementById("typeToSpeakText").value + "&kiba" + Math.floor(Math.random()*(99999 - 1 + 1) + 1)).then(() => {
        snackbar("Message Delivered");
    });
}
document.getElementById("typeToSpeakText").oninput = function() {
    this.style.height = 50;
    if (this.scrollHeight >= 50) {
        this.style.height = this.scrollHeight;
    } else {
        this.style.height = 50;
    }
}

// Listen for changes in db
function startListening() {
    onValue(ref(database, `${authData.uid}/emergency`), (snapshot) => {
        if (listenStart == count) {
            playSound("help");
        } else {
            listenStart += 1;
        }
    });
    onValue(ref(database, `${authData.uid}/typeToSpeak`), (snapshot) => {
        if (listenStart == count) {
            let text = snapshot.val().split("&kiba")[0];
            let synth = window.speechSynthesis;
            let utterThis = new SpeechSynthesisUtterance(text);
            synth.speak(utterThis);
        } else {
            listenStart += 1;
        }
    });
}