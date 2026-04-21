const firebaseConfig = {
    apiKey: "AIzaSyCJ8mRSIPUxPFZjvueVr1U0qMW5JqrS1bo",
    authDomain: "wkaz-5d050.firebaseapp.com",
    projectId: "wkaz-5d050",
    databaseURL: "https://wkaz-5d050-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

let isRegistering = false;
let currentServerId = null;

// --- AUTH LOGIC ---
const toggleMode = document.getElementById('toggle-mode');
const emailBtn = document.getElementById('email-btn');

toggleMode.onclick = () => {
    isRegistering = !isRegistering;
    document.getElementById('auth-title').textContent = isRegistering ? "Create an account" : "Welcome back!";
    emailBtn.textContent = isRegistering ? "Register" : "Log In";
    toggleMode.textContent = isRegistering ? "Login" : "Register";
};

// Email Login/Register
emailBtn.onclick = () => {
    const email = document.getElementById('email-input').value;
    const pass = document.getElementById('pass-input').value;
    if (isRegistering) {
        auth.createUserWithEmailAndPassword(email, pass).catch(e => alert(e.message));
    } else {
        auth.signInWithEmailAndPassword(email, pass).catch(e => alert(e.message));
    }
};

// Google Login (FIXED)
document.getElementById('google-btn').onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(e => {
        alert("Google Login Error: " + e.message + "\n\nMake sure Google is ENABLED in Firebase Console and your domain has no typos!");
    });
};

// Logout
document.getElementById('logout-btn-real').onclick = () => {
    auth.signOut().then(() => location.reload());
};

// --- APP LOGIC ---
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        document.getElementById('user-name').textContent = user.displayName || user.email.split('@')[0];
        document.getElementById('user-tag').textContent = `#${user.uid.slice(0,4)}`;
        if(user.photoURL) document.getElementById('user-img').src = user.photoURL;
        
        loadHomeView();
        loadServers(user.uid);
    } else {
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }
});

function loadHomeView() {
    currentServerId = null;
    document.getElementById('sidebar-name').textContent = "Direct Messages";
    document.getElementById('target-name').textContent = "Friends";
    
    // THE FRIENDS BUTTON
    const nav = document.getElementById('nav-content');
    nav.innerHTML = `
        <div class="nav-item active" style="padding: 10px; border-radius: 4px; cursor: pointer; background: #3f4147;">🏠 Home</div>
        <div class="nav-item" id="add-friend-btn" style="padding: 10px; color: #23a55a; font-weight: bold; cursor: pointer;">+ Add Friend</div>
    `;
    
    document.getElementById('add-friend-btn').onclick = () => {
        const id = prompt("Enter Friend's UID:");
        if(id) {
            db.ref(`users/${auth.currentUser.uid}/friends/${id}`).set(true);
            alert("Friend request sent!");
        }
    };
}

// Settings Modal
document.getElementById('open-settings-btn').onclick = () => document.getElementById('settings-modal').style.display = 'flex';
document.getElementById('close-settings-btn').onclick = () => document.getElementById('settings-modal').style.display = 'none';

document.getElementById('save-profile-btn').onclick = async () => {
    const name = document.getElementById('edit-display-name').value;
    const url = document.getElementById('edit-photo-url').value;
    await auth.currentUser.updateProfile({ displayName: name, photoURL: url });
    location.reload();
};

// Server Loading (Simplified)
async function loadServers(uid) {
    const list = document.getElementById('server-list');
    db.ref(`userServers/${uid}`).on('value', snap => {
        list.innerHTML = "";
        snap.forEach(child => {
            db.ref(`servers/${child.key}`).once('value', s => {
                const icon = document.createElement('div');
                icon.className = 'server-icon';
                icon.textContent = s.val().name[0];
                icon.onclick = () => {
                    currentServerId = child.key;
                    document.getElementById('sidebar-name').textContent = s.val().name;
                    document.getElementById('target-name').textContent = "general";
                };
                list.appendChild(icon);
            });
        });
    });
}