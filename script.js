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

// --- AUTHENTICATION ---
const toggleMode = document.getElementById('toggle-mode');
const emailBtn = document.getElementById('email-btn');

toggleMode.onclick = () => {
    isRegistering = !isRegistering;
    document.getElementById('auth-title').textContent = isRegistering ? "Create an account" : "Welcome back!";
    emailBtn.textContent = isRegistering ? "Register" : "Log In";
    toggleMode.textContent = isRegistering ? "Login" : "Register";
};

emailBtn.onclick = () => {
    const email = document.getElementById('email-input').value;
    const pass = document.getElementById('pass-input').value;
    if (isRegistering) {
        auth.createUserWithEmailAndPassword(email, pass).catch(e => alert(e.message));
    } else {
        auth.signInWithEmailAndPassword(email, pass).catch(e => alert(e.message));
    }
};

document.getElementById('google-btn').onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(e => alert(e.message));
};

document.getElementById('logout-btn-real').onclick = () => {
    auth.signOut().then(() => location.reload());
};

// --- APP INITIALIZATION ---
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        
        const name = user.displayName || user.email.split('@')[0];
        document.getElementById('user-name').textContent = name;
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
    
    // ADD THE FRIENDS BUTTON TO SIDEBAR
    const nav = document.getElementById('nav-content');
    nav.innerHTML = `
        <div class="nav-item active" style="padding: 10px; cursor: pointer; background: rgba(255,255,255,0.05); border-radius: 4px;">🏠 Home</div>
        <div class="nav-item" id="add-friend-btn" style="padding: 10px; color: #23a55a; font-weight: bold; cursor: pointer;">+ Add Friend</div>
        <div id="friends-list" style="margin-top: 10px;"></div>
    `;
    
    document.getElementById('add-friend-btn').onclick = () => {
        const friendUid = prompt("Enter Friend's UID:");
        if (friendUid) {
            db.ref(`users/${auth.currentUser.uid}/friends/${friendUid}`).set(true);
            alert("Friend added!");
        }
    };
}

// --- SERVER & SETTINGS UI ---
document.getElementById('home-btn').onclick = () => {
    document.querySelectorAll('.server-icon').forEach(i => i.classList.remove('active'));
    document.getElementById('home-btn').classList.add('active');
    loadHomeView();
};

document.getElementById('open-settings-btn').onclick = () => document.getElementById('settings-modal').style.display = 'flex';
document.getElementById('close-settings-btn').onclick = () => document.getElementById('settings-modal').style.display = 'none';

document.getElementById('save-profile-btn').onclick = async () => {
    const newName = document.getElementById('edit-display-name').value;
    const newPhoto = document.getElementById('edit-photo-url').value;
    await auth.currentUser.updateProfile({ displayName: newName, photoURL: newPhoto });
    location.reload();
};

document.getElementById('add-server-trigger').onclick = () => document.getElementById('add-server-modal').style.display = 'flex';
document.getElementById('close-server-modal').onclick = () => document.getElementById('add-server-modal').style.display = 'none';

document.getElementById('create-server-btn').onclick = async () => {
    const name = document.getElementById('new-server-name').value;
    if(!name) return;
    const ref = db.ref('servers').push();
    await ref.set({ name, owner: auth.currentUser.uid });
    await db.ref(`userServers/${auth.currentUser.uid}/${ref.key}`).set(true);
    location.reload();
};

async function loadServers(uid) {
    const list = document.getElementById('server-list');
    db.ref(`userServers/${uid}`).on('value', snap => {
        list.innerHTML = "";
        snap.forEach(child => {
            db.ref(`servers/${child.key}`).once('value', sSnap => {
                const s = sSnap.val();
                if(!s) return;
                const icon = document.createElement('div');
                icon.className = 'server-icon';
                icon.textContent = s.name[0].toUpperCase();
                icon.onclick = () => {
                    currentServerId = child.key;
                    document.getElementById('sidebar-name').textContent = s.name;
                    document.getElementById('target-name').textContent = "general";
                    document.querySelectorAll('.server-icon').forEach(i => i.classList.remove('active'));
                    icon.classList.add('active');
                };
                list.appendChild(icon);
            });
        });
    });
}
