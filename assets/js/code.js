// Firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getDatabase, ref, set, get, child, onValue } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";
import { getStorage, ref as sref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";
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
                    userDetails = snapshot.val();
                    document.getElementById("splashDiv").hidden = true;
                    document.getElementById("mainAuth").hidden = true;
                    document.getElementById("homeScrn").hidden = false;
                    document.getElementById("navName").innerHTML = userDetails.username;
                    document.getElementById("navEmail").innerHTML = userDetails.email;
                    document.getElementById("navUID").innerHTML = authData.uid;
                    if (userDetails.accountType == "Parent") {
                        startListening()
                        document.getElementById("d5").hidden = true;
                        document.getElementById("d6").hidden = true;
                        document.getElementById("d3").hidden = true;;
                    } else {
                        startListeningChild()
                        document.getElementById("d7").hidden = true;
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
            document.getElementById("splashDiv").hidden = true;
            document.getElementById("emailVerify").style.display = "flex";
        }
    } else {
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
    let inp = document.createElement("input");
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
            console.error("Sign out error: ", error)
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
                        userDetails.child = document.getElementById("connectUID").value.trim();
                        snackbar("Successfully Connected");
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
        console.error(errorCode)
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
        console.error(error)
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
            console.error("Sign out error: ", error)
        });
    }
}

// Home Screen
for (let b of document.querySelectorAll(".homeMenu")) {
    b.onclick = function() {
        setScreen(`${b.id}Scrn`);
        if (userDetails.accountType == "Parent") {
            if (b.id == "tapToSpeak") {
                loadTapToSpeak();
            } else if (b.id == "reminder") {
    
            } else if (b.id == "games") {
                
            } else if (b.id == "mood") {
                document.getElementById("moodChild").hidden = true;
                document.getElementById("moodParent").hidden = false;
            }
        } else {
            if (b.id == "tapToSpeak") {
                document.getElementById("tapToSpeakAdd").hidden = true;
                document.getElementById("tapToSpeakCategory").hidden = true;
                loadTapToSpeakChild();
            } else if (b.id == "reminder") {
                document.getElementById("reminderAdd").hidden = true;
            } else if (b.id == "emergency") {
                setScreen("homeScrn");
                playSound("./assets/audio/help.mp3");
                let t = randomNumber(1, 99999);
                console.log(t)
                set(ref(database, `${authData.uid}/emergency`), t).then(() => {
                    snackbar("Alerted the parent");
                })
            }
        }
    }
}

// Tap to Speak
function loadTapToSpeak() {
    document.getElementById("tapToSpeakHolder").innerHTML = "<b style='font-size: 30;'>Loading</b>";
    document.getElementById("tapToSpeakCategory").disabled = true;
    get(child(ref(database), `${userDetails.child}/tapToSpeak`)).then((snapshot) => {
        document.getElementById("tapToSpeakHolder").innerHTML = "";
        document.getElementById("tapToSpeakCategory").disabled = false;
        let dat = snapshot.val();
        document.getElementById("tapToSpeakCategory").innerHTML = "<option disabled selected hidden>Select Category</option>";
        if (dat != null) {
            categories = Object.keys(dat);
        } else {
            categories = [];
        }
        for (let o of categories) {
            let opt = document.createElement("option");
            opt.innerHTML = o;
            document.getElementById("tapToSpeakCategory").appendChild(opt);
        }
    })
}
function loadTapToSpeakChild() {
    document.getElementById("tapToSpeakHolder").innerHTML = "<b style='font-size: 30;'>Loading</b>";
    get(child(ref(database), `${authData.uid}/tapToSpeak`)).then((snapshot) => {
        document.getElementById("tapToSpeakHolder").innerHTML = "";
        let dat = snapshot.val();
        if (dat != null) {
            categories = Object.keys(dat);
        } else {
            categories = [];
        }
        for (let o of categories) {
            let cat = document.createElement("button");
            cat.className = "tapToSpeakMenu";
            cat.style.backgroundImage = `url(${dat[o].picture})`
            cat.innerHTML = o;
            document.getElementById("tapToSpeakHolder").appendChild(cat);
            document.getElementById("tapToSpeakHolder").appendChild(document.createElement("br"));
            cat.onclick = function() {
                setScreen("tapToSpeakChildScrn");
                document.getElementById("tapToSpeakChildHolder").innerHTML = "";
                console.log(Object.keys(dat[o]));
                for (let l of Object.keys(dat[o])) {
                    let cat = document.createElement("button");
                    cat.className = "tapToSpeakChildMenu";
                    cat.style.backgroundImage = `url(${dat[o][l].picture})`
                    document.getElementById("tapToSpeakChildHolder").appendChild(cat);
                    document.getElementById("tapToSpeakChildHolder").appendChild(document.createElement("br"));
                    let b = document.createElement("b");
                    b.className = "tapToSpeakChildLabel";
                    b.innerHTML = l;
                    document.getElementById("tapToSpeakChildHolder").appendChild(b);
                    document.getElementById("tapToSpeakChildHolder").appendChild(document.createElement("br"));
                    cat.onclick = function() {
                        let details = dat[o][l];
                        console.log(details);
                        if (details.type == "T2S") {
                            T2S(details.message);
                        } else {
                            playSound(details.message);
                        }
                        set(ref(database, `${authData.uid}/tapToSpeakMessage`), `${details.message}&kiba${details.type}&kiba${l}&kiba${randomNumber(1, 99999)}`).then(() => {
                            snackbar("Message Sent");
                        });
                    }
                }
            }
        }
    });
}
document.getElementById("tapToSpeakChildBack").onclick = function() {
    setScreen("tapToSpeakScrn");
}
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
    document.getElementById("tapToSpeakT2SCaterogy").innerHTML = `<option value="" hidden selected>Category</option>
    <option>Add Category</option></select>`
    document.getElementById("tapToSpeakAudioCaterogy").innerHTML = `<option value="" hidden selected>Category</option>
    <option>Add Category</option></select>`
    for (let x of categories) {
        let opt = document.createElement("option")
        opt.innerHTML = x;
        let opt2 = document.createElement("option")
        opt2.innerHTML = x;
        document.getElementById("tapToSpeakT2SCaterogy").insertBefore(opt, document.getElementById("tapToSpeakT2SCaterogy").lastChild);
        document.getElementById("tapToSpeakAudioCaterogy").insertBefore(opt2, document.getElementById("tapToSpeakAudioCaterogy").lastChild);
    }
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
    if (this.value == "Add Category") {
        this.value = "";
        inquire("Enter the new category", "", function(e) {
            if (e != null) {
                let opt = document.createElement("option");
                opt.innerHTML = e;
                document.getElementById("tapToSpeakT2SCaterogy").insertBefore(opt, document.getElementById("tapToSpeakT2SCaterogy").lastChild);
                document.getElementById("tapToSpeakT2SCaterogy").value = e;
            }
        })
    }
}
document.getElementById("tapToSpeakT2SForm").onsubmit = function(e) {
    e.preventDefault(); // Prevent form submission
    document.getElementById("tapToSpeakT2SBtn").disabled = true;
    document.getElementById("tapToSpeakT2SBtn").innerHTML = "Adding";
    if (document.getElementById("tapToSpeakT2SInp").files[0] != undefined) {
        uploadBytes(sref(storage, `${userDetails.child}/tapToSpeak/${document.getElementById("tapToSpeakT2SCaterogy").value}/${document.getElementById("tapToSpeakT2SName").value}/picture`), document.getElementById("tapToSpeakT2SInp").files[0]).then((snapshot) => {
            console.log('Uploaded a blob or file!');
            // Get the download URL
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                set(ref(database, `${userDetails.child}/tapToSpeak/${document.getElementById("tapToSpeakT2SCaterogy").value}/${document.getElementById("tapToSpeakT2SName").value}`), {
                    "picture": downloadURL,
                    "message": document.getElementById("tapToSpeakT2SMessage").value,
                    "type": "T2S"
                }).then(() => {
                    snackbar("Card Added");
                    if (categories.includes(document.getElementById("tapToSpeakT2SCaterogy").value) == false) {
                        categories.push(document.getElementById("tapToSpeakT2SCaterogy").value);
                    }
                    document.getElementById("tapToSpeakT2SBtn").disabled = false;
                    document.getElementById("tapToSpeakT2SBtn").innerHTML = "Add";
                    document.getElementById("tapToSpeakT2SInpText").innerHTML = "Insert Image";
                    document.getElementById("tapToSpeakT2SForm").reset();
                    document.getElementById("tapToSpeakT2SImg").style.backgroundImage = "";
                    document.getElementById("tapToSpeak").click();
                })
                .catch((error) => {
                    console.error(error)
                });
            });
          });
    } else {
        snackbar("Please upload a picture");
        document.getElementById("tapToSpeakT2SBtn").disabled = false;
        document.getElementById("tapToSpeakT2SBtn").innerHTML = "Add";
    }
}
document.getElementById("tapToSpeakCategory").oninput = function() {
    let n = this.value
    get(child(ref(database), `${userDetails.child}/tapToSpeak/${n}`)).then((snapshot) => {
        document.getElementById("tapToSpeakHolder").innerHTML = "";
        for (let y of Object.keys(snapshot.val())) {
            let holder = document.createElement("div");
            holder.className = "tapToSpeakDiv";
            holder.innerHTML = y;
            document.getElementById("tapToSpeakHolder").appendChild(holder)
            let del = document.createElement("div");
            del.className = "tapToSpeakDel";
            holder.appendChild(del);
            del.onclick = function() {
                verify("Delete this card?", function(d) {
                    if (d == true) {
                        if (snapshot.val()[y].type == "T2S") {
                            holder.innerHTML = "Deleting";
                            del.hidden = true;
                            console.log(`${userDetails.child}/tapToSpeak/${n}/${y}`)
                            set(ref(database, `${userDetails.child}/tapToSpeak/${n}/${y}`), null).then(() => {
                                deleteObject(sref(storage, `${userDetails.child}/tapToSpeak/${n}/${y}/picture`)).then(() => {
                                    holder.remove();
                                    document.getElementById("tapToSpeak").click();
                                })
                            })
                        } else {
                            holder.innerHTML = "Deleting";
                            del.hidden = true;
                            console.log(`${userDetails.child}/tapToSpeak/${n}/${y}`)
                            set(ref(database, `${userDetails.child}/tapToSpeak/${n}/${y}`), null).then(() => {
                                let p = 0;
                                deleteObject(sref(storage, `${userDetails.child}/tapToSpeak/${n}/${y}/picture`)).then(() => {
                                    if (p == 1) {
                                        holder.remove();
                                        document.getElementById("tapToSpeak").click();
                                    } else {
                                        p = 1;
                                    }
                                })
                                deleteObject(sref(storage, `${userDetails.child}/tapToSpeak/${n}/${y}/message`)).then(() => {
                                    if (p == 1) {
                                        holder.remove();
                                        document.getElementById("tapToSpeak").click();
                                    } else {
                                        p = 1;
                                    }
                                })
                            })
                        }
                    }
                })
            }
        }
    })
}

////Audio
document.getElementById("tapToSpeakAudioInp").oninput = function() {
    if (this.files[0] != undefined) {
        document.getElementById("tapToSpeakAudioInpText").innerHTML = "Insert Image<br>"+this.files[0].name;
        let l = URL.createObjectURL(this.files[0]);
        document.getElementById("tapToSpeakAudioImg").style.backgroundImage = `url(${l})`;
    }
}
document.getElementById("tapToSpeakAudioMessage").oninput = function() {
    this.style.height = 50;
    if (this.scrollHeight >= 50) {
        this.style.height = this.scrollHeight;
    } else {
        this.style.height = 50;
    }
}
document.getElementById("tapToSpeakAudioCaterogy").oninput = function() {
    if (this.value == "Add Category") {
        this.value = "";
        inquire("Enter the new category", "", function(e) {
            if (e != null) {
                let opt = document.createElement("option");
                opt.innerHTML = e;
                console.log(document.getElementById("tapToSpeakAudioCaterogy").lastChild)
                document.getElementById("tapToSpeakAudioCaterogy").insertBefore(opt, document.getElementById("tapToSpeakAudioCaterogy").lastChild);
                document.getElementById("tapToSpeakAudioCaterogy").value = e;
            }
        })
    }
}
document.getElementById("tapToSpeakAudioForm").onsubmit = function(e) {
    e.preventDefault(); // Prevent form submission
    document.getElementById("tapToSpeakAudioBtn").disabled = true;
    document.getElementById("tapToSpeakAudioBtn").innerHTML = "Adding";
    if (document.getElementById("tapToSpeakAudioInp").files[0] != undefined) {
        if (document.getElementById("tapToSpeakAudioMessage").files[0] != undefined) {
            let prog = 0; 
            let picUrl;
            let audUrl;
            function upload(pic, aud) {
                set(ref(database, `${userDetails.child}/tapToSpeak/${document.getElementById("tapToSpeakAudioCaterogy").value}/${document.getElementById("tapToSpeakAudioName").value}`), {
                    "picture": pic,
                    "message": aud,
                    "type": "Audio"
                }).then(() => {
                    snackbar("Card Added");
                    if (categories.includes(document.getElementById("tapToSpeakAudioCaterogy").value) == false) {
                        categories.push(document.getElementById("tapToSpeakAudioCaterogy").value);
                    }
                    document.getElementById("tapToSpeakAudioBtn").disabled = false;
                    document.getElementById("tapToSpeakAudioBtn").innerHTML = "Add";
                    document.getElementById("tapToSpeakAudioInpText").innerHTML = "Insert Image";
                    document.getElementById("tapToSpeakAudioMessageText").innerHTML = "Upload Audio";
                    document.getElementById("tapToSpeakAudioForm").reset();
                    document.getElementById("tapToSpeakAudioImg").style.backgroundImage = "";
                    document.getElementById("tapToSpeak").click();
                })
                .catch((error) => {
                    console.error(error)
                });
            }
            uploadBytes(sref(storage, `${userDetails.child}/tapToSpeak/${document.getElementById("tapToSpeakAudioCaterogy").value}/${document.getElementById("tapToSpeakAudioName").value}/picture`), document.getElementById("tapToSpeakAudioInp").files[0]).then((snapshot) => {
                console.log('Uploaded a blob or file!');
                // Get the download URL
                getDownloadURL(snapshot.ref).then((downloadURL) => {
                    picUrl = downloadURL;
                    if (prog == 1) {
                        upload(picUrl, audUrl);
                    } else {
                        prog = 1;
                    }
                });
            });
            uploadBytes(sref(storage, `${userDetails.child}/tapToSpeak/${document.getElementById("tapToSpeakAudioCaterogy").value}/${document.getElementById("tapToSpeakAudioName").value}/message`), document.getElementById("tapToSpeakAudioMessage").files[0]).then((snapshot) => {
                console.log('Uploaded a blob or file!');
                // Get the download URL
                getDownloadURL(snapshot.ref).then((downloadURL) => {
                    audUrl = downloadURL;
                    if (prog == 1) {
                        upload(picUrl, audUrl);
                    } else {
                        prog = 1;
                    }
                });
            });
        } else {
            snackbar("Please upload a message audio");
        document.getElementById("tapToSpeakAudioBtn").disabled = false;
        document.getElementById("tapToSpeakAudioBtn").innerHTML = "Add";
        }
    } else {
        snackbar("Please upload a picture");
        document.getElementById("tapToSpeakAudioBtn").disabled = false;
        document.getElementById("tapToSpeakAudioBtn").innerHTML = "Add";
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
    if (document.getElementById("typeToSpeakText").value.trim() != "") {
        T2S(document.getElementById("typeToSpeakText").value);
        set(ref(database, `${authData.uid}/typeToSpeak`), document.getElementById("typeToSpeakText").value + "&kiba" + randomNumber(1, 99999)).then(() => {
            snackbar("Message Delivered");
        });
    }
}
document.getElementById("typeToSpeakText").oninput = function() {
    this.style.height = 50;
    if (this.scrollHeight >= 50) {
        this.style.height = this.scrollHeight;
    } else {
        this.style.height = 50;
    }
}

// Message
document.getElementById("messageBtn").onclick = function() {
    this.disabled = true;
    if (document.getElementById("messageText").value.trim() != "") {
        T2S(document.getElementById("messageText").value);
        set(ref(database, `${userDetails.child}/message`), document.getElementById("messageText").value + "&kiba" + randomNumber(1, 99999)).then(() => {
            snackbar("Message Delivered");
        });
    }
}
document.getElementById("messageText").oninput = function() {
    this.style.height = 50;
    if (this.scrollHeight >= 50) {
        this.style.height = this.scrollHeight;
    } else {
        this.style.height = 50;
    }
}

// Listen for changes in db
function startListening() {
    onValue(ref(database, `${userDetails.child}/emergency`), (snapshot) => {
        if (listenStart == count) {
            playSound("./assets/audio/help.mp3");
            verify("Your child needs help!\nClick OK to reply.", function(out) {
                if (out == true) {
                    document.getElementById("message").click();
                }
            })
        } else {
            listenStart += 1;
        }
    });
    onValue(ref(database, `${userDetails.child}/typeToSpeak`), (snapshot) => {
        console.log(snapshot.val());
        if (listenStart == count) {
            T2S(snapshot.val().split("&kiba")[0]);
            verify("Your child is saying \"" + snapshot.val().split("&kiba")[0] + "\"\nClick OK to reply.", function(out) {
                if (out == true) {
                    document.getElementById("message").click();
                }
            });
        } else {
            listenStart += 1;
        }
    });
    onValue(ref(database, `${userDetails.child}/tapToSpeakMessage`), (snapshot) => {
        if (listenStart == count) {
            let val = snapshot.val().split("&kiba");
            if (val[1] == "T2S") {
                T2S(val[0]);
                verify("Your child is saying \"" + val[0] + "\"\nClick OK to reply.", function(out) {
                    if (out == true) {
                        document.getElementById("message").click();
                    }
                })
            } else {
                playSound(val[0]);
                verify("Your child clicked \"" + val[2] + "\"\nClick OK to reply.", function(out) {
                    if (out == true) {
                        document.getElementById("message").click();
                    }
                })
            }
        } else {
            listenStart += 1;
        }
    })
}
function startListeningChild() {
    onValue(ref(database, `${authData.uid}/message`), (snapshot) => {
        if (childLoad == 1) {
            notify(snapshot.val().split("&kiba")[0]);
        } else {
            childLoad = 1;
        }
    })
}
