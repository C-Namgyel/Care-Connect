// Temporary Code
// document.getElementById("mainAuth").hidden = true;
// document.getElementById("homeScrn").hidden = false;

// Firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";
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
    userDetails = user;
    if (user) {
        if (user.emailVerified) {
            get(child(ref(database), `users/${user.uid}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    console.log("User is valid")
                    document.getElementById("splashDiv").hidden = true;
                    document.getElementById("mainAuth").hidden = true;
                    document.getElementById("homeScrn").hidden = false;
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
        userDetails = user;
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
    set(ref(database, 'users/' + userDetails.uid), {
        username: username,
        email: userDetails.email,
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
                userDetails = user;
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

// Variables
var userDetails;

// Home Button
for (let h of document.querySelectorAll(".homeBtn")) {
    h.onclick = function() {
        setScreen("homeScrn");
    }
}

// Menu Button
document.getElementById("menu").onclick = function() {
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
    }
}