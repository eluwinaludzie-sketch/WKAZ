// 1. YOUR FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyCJ8mRSIPUxPFZjvueVr1U0qMW5JqrS1bo",
    authDomain: "wkaz-5d050.firebaseapp.com",
    projectId: "wkaz-5d050",
    databaseURL: "https://wkaz-5d050-default-rtdb.firebaseio.com",
    storageBucket: "wkaz-5d050.firebasestorage.app",
    messagingSenderId: "934837234847",
    appId: "1:934837234847:web:15c9d266edac3833b3c6aa"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// 2. AUTH ELEMENTS
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app');
const emailBtn = document.getElementById('email-btn');
const googleBtn = document.getElementById('google-btn');
const toggleMode = document.getElementById('toggle-mode');

let isRegistering = false;

// 3. AUTH LOGIC
toggleMode.onclick = () => {
    isRegistering = !isRegistering;
    emailBtn.textContent = isRegistering ? "Register" : "Log In";
    document.getElementById('auth-msg').textContent = isRegistering ? "Create your account!" : "We're so excited to see you again!";
    toggleMode.textContent = isRegistering ? "Login" : "Register";
};

googleBtn.onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(e => alert(e.message));
};

emailBtn.onclick = () => {
    const email = document.getElementById('email-input').value;
    const pass = document.getElementById('pass-input').value;
    if(!email || !pass) return alert("Fill fields!");

    if(isRegistering) {
        auth.createUserWithEmailAndPassword(email, pass).catch(e => alert(e.message));
    } else {
        auth.signInWithEmailAndPassword(email, pass).catch(e => alert(e.message));
    }
};

auth.onAuthStateChanged(user => {
    if(user) {
        authScreen.style.display = 'none';
        appScreen.style.display = 'flex';
        document.getElementById('user-name').textContent = user.displayName || user.email.split('@')[0];
        document.getElementById('user-img').src = user.photoURL || 'https://via.placeholder.com/32';
        document.getElementById('user-tag').textContent = `#${user.uid.slice(0,4)}`;
    } else {
        authScreen.style.display = 'flex';
        appScreen.style.display = 'none';
    }
});

document.getElementById('logout-btn').onclick = () => auth.signOut();