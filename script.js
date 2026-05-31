// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getDatabase, ref, set, get, remove, child, update } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD9Kj0Y5gb6n0_5klK17LYqh9cZNT22zIo",
    authDomain: "fire-e4350.firebaseapp.com",
    databaseURL: "https://fire-e4350-default-rtdb.firebaseio.com",
    projectId: "fire-e4350",
    storageBucket: "fire-e4350.firebasestorage.app",
    messagingSenderId: "510948978284",
    appId: "1:510948978284:web:19432f64e92d0d47e83249",
    measurementId: "G-NZXZ7J4D7M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// DOM Elements
const authContainer = document.getElementById('authContainer');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const addPasswordBtn = document.getElementById('addPasswordBtn');
const emptyAddPasswordBtn = document.getElementById('emptyAddPasswordBtn');
const emptyImportPasswordsBtn = document.getElementById('emptyImportPasswordsBtn');
const importPasswordsBtn = document.getElementById('importPasswordsBtn');
const exportPasswordsBtn = document.getElementById('exportPasswordsBtn');
const importPasswordsInput = document.getElementById('importPasswordsInput');
const passwordForm = document.getElementById('passwordForm');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const passwordListContainer = document.getElementById('passwordListContainer');
const passwordSearchInput = document.getElementById('passwordSearchInput');
const passwordCountBadge = document.getElementById('passwordCountBadge');
const noPasswordsMessage = document.getElementById('noPasswordsMessage');
const emptyState = document.getElementById('emptyState');
const emptyStateTitle = document.getElementById('emptyStateTitle');
const emptyStateText = document.getElementById('emptyStateText');
const passwordDetailView = document.getElementById('passwordDetailView');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const forgotPasswordFormElement = document.getElementById('forgotPasswordFormElement');
const closeForgotModal = document.getElementById('closeForgotModal');
const cancelResetBtn = document.getElementById('cancelResetBtn');
const resetError = document.getElementById('resetError');
const resetSuccess = document.getElementById('resetSuccess');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const userButton = document.getElementById('userButton');
const userDropdown = document.getElementById('userDropdown');
const userEmailLabel = document.getElementById('userEmailLabel');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const changePasswordModal = document.getElementById('changePasswordModal');
const closeChangeModal = document.getElementById('closeChangeModal');
const cancelChangeBtn = document.getElementById('cancelChangeBtn');
const changePasswordFormElement = document.getElementById('changePasswordFormElement');
const changePasswordError = document.getElementById('changePasswordError');
const changePasswordSuccess = document.getElementById('changePasswordSuccess');
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
const passwordFormView = document.getElementById('passwordFormView');
const toast = document.getElementById('toast');
const loadingSpinner = document.getElementById('loadingSpinner');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.dataset.tab;
        
        // Remove active from all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        // Add active to clicked tab
        btn.classList.add('active');
        
        // Hide all forms
        authForms.forEach(form => form.classList.remove('active'));
        // Show selected form
        const formId = `${tab}Form`;
        const selectedForm = document.getElementById(formId);
        if (selectedForm) {
            selectedForm.classList.add('active');
        }

        window.scrollTo(0, 0);
        authContainer.scrollTop = 0;
        setTimeout(() => {
            window.scrollTo(0, 0);
            authContainer.scrollTop = 0;
        }, 0);
    });
});

// Mobile Menu Toggle
function closeMobileMenu() {
    sidebar.classList.remove('mobile-open');
    sidebarOverlay.classList.remove('mobile-open');
}

function openMobileMenu() {
    sidebar.classList.add('mobile-open');
    sidebarOverlay.classList.add('mobile-open');
}

mobileMenuBtn.addEventListener('click', () => {
    if (sidebar.classList.contains('mobile-open')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
});

// Close sidebar when clicking overlay
sidebarOverlay.addEventListener('click', closeMobileMenu);

// Close sidebar when clicking on a password
const handlePasswordListClick = () => {
    const listItems = document.querySelectorAll('.list-item');
    listItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
};

// Update menu button visibility on window resize
function updateMenuButtonVisibility() {
    const isMobile = window.innerWidth <= 768;
    mobileMenuBtn.style.display = isMobile ? 'flex' : 'none';
    
    // Close menu if resizing to desktop
    if (!isMobile) {
        closeMobileMenu();
    }
}

window.addEventListener('resize', updateMenuButtonVisibility);
updateMenuButtonVisibility();

// Toggle Password Visibility
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(btn.dataset.target);
        const type = target.type === 'password' ? 'text' : 'password';
        target.type = type;
    });
});

// Show Toast Notification
function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.remove('show');
    // Trigger reflow to restart animation
    void toast.offsetWidth;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Show Loading
function showLoading() {
    loadingSpinner.style.display = 'flex';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Login Form Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = '';

    if (!email || !password) {
        errorEl.textContent = 'Please fill in all fields';
        return;
    }

    showLoading();
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Login successful!');
        loginForm.reset();
    } catch (error) {
        errorEl.textContent = getErrorMessage(error.code);
    } finally {
        hideLoading();
    }
});

// Register Form Handler
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorEl = document.getElementById('registerError');
    errorEl.textContent = '';

    if (!email || !password || !confirmPassword) {
        errorEl.textContent = 'Please fill in all fields';
        return;
    }

    if (password !== confirmPassword) {
        errorEl.textContent = 'Passwords do not match';
        return;
    }

    if (password.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters';
        return;
    }

    showLoading();
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        showToast('Registration successful!');
        registerForm.reset();
        // Switch to login tab
        document.querySelector('[data-tab="login"]').click();
    } catch (error) {
        errorEl.textContent = getErrorMessage(error.code);
    } finally {
        hideLoading();
    }
});

// Forgot Password Modal
forgotPasswordLink.addEventListener('click', () => {
    resetError.textContent = '';
    resetSuccess.textContent = '';
    forgotPasswordFormElement.reset();
    forgotPasswordModal.style.display = 'flex';
});

function closeForgotPasswordModal() {
    forgotPasswordModal.style.display = 'none';
}

closeForgotModal.addEventListener('click', closeForgotPasswordModal);
cancelResetBtn.addEventListener('click', closeForgotPasswordModal);

forgotPasswordFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;
    resetError.textContent = '';
    resetSuccess.textContent = '';

    if (!email) {
        resetError.textContent = 'Please enter your email';
        return;
    }

    showLoading();
    try {
        await sendPasswordResetEmail(auth, email);
        resetSuccess.textContent = 'Reset link sent. Check your email.';
        showToast('Password reset email sent');
    } catch (error) {
        resetError.textContent = getErrorMessage(error.code);
    } finally {
        hideLoading();
    }
});

// User dropdown and password change
userButton.addEventListener('click', () => {
    userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', (e) => {
    if (!userDropdown.contains(e.target) && !userButton.contains(e.target)) {
        userDropdown.style.display = 'none';
    }
});

changePasswordBtn.addEventListener('click', () => {
    userDropdown.style.display = 'none';
    changePasswordError.textContent = '';
    changePasswordSuccess.textContent = '';
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmNewPasswordInput.value = '';
    changePasswordModal.style.display = 'flex';
});

function closeChangePasswordModal() {
    changePasswordModal.style.display = 'none';
}

closeChangeModal.addEventListener('click', closeChangePasswordModal);
cancelChangeBtn.addEventListener('click', closeChangePasswordModal);

changePasswordFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    changePasswordError.textContent = '';
    changePasswordSuccess.textContent = '';

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmNewPassword = confirmNewPasswordInput.value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        changePasswordError.textContent = 'Please fill in all fields';
        return;
    }

    if (newPassword !== confirmNewPassword) {
        changePasswordError.textContent = 'New passwords do not match';
        return;
    }

    if (newPassword.length < 6) {
        changePasswordError.textContent = 'New password must be at least 6 characters';
        return;
    }

    if (!currentUser) {
        changePasswordError.textContent = 'No user is signed in';
        return;
    }

    showLoading();
    try {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        changePasswordSuccess.textContent = 'Password updated successfully';
        showToast('Password updated successfully');
        setTimeout(closeChangePasswordModal, 1200);
    } catch (error) {
        changePasswordError.textContent = getErrorMessage(error.code) || 'Unable to update password';
    } finally {
        hideLoading();
    }
});

// Get Friendly Error Messages
function getErrorMessage(code) {
    const messages = {
        'auth/email-already-in-use': 'Email already in use',
        'auth/invalid-email': 'Invalid email address',
        'auth/weak-password': 'Password is too weak',
        'auth/user-not-found': 'User not found',
        'auth/wrong-password': 'Wrong password',
        'auth/invalid-credential': 'Incorrect email or password',
        'auth/missing-password': 'Please enter your password',
        'auth/too-many-requests': 'Too many login attempts, try again later',
        'auth/network-request-failed': 'Network error. Check your connection and try again',
        'auth/requires-recent-login': 'Please log in again before changing your password',
        'auth/operation-not-allowed': 'Email/password sign-in is not enabled for this app'
    };
    return messages[code] || 'An error occurred. Please try again.';
}

// Logout Handler
logoutBtn.addEventListener('click', async () => {
    showLoading();
    try {
        await signOut(auth);
        showToast('Logged out successfully');
    } catch (error) {
        showToast('Error logging out');
    } finally {
        hideLoading();
    }
});

// Auth State Management
let currentUser = null;
let allPasswords = [];
let selectedPasswordId = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        userEmailLabel.textContent = user.email || 'Signed in';
        authContainer.style.display = 'none';
        appContainer.style.display = 'flex';
        loadPasswords();
    } else {
        authContainer.style.display = 'flex';
        appContainer.style.display = 'none';
        resetUI();
    }
});

// Load Passwords from Database
async function loadPasswords() {
    if (!currentUser) return;

    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `users/${currentUser.uid}/passwords`));

        if (snapshot.exists()) {
            const passwords = snapshot.val();
            allPasswords = Object.entries(passwords)
                .map(([id, password]) => ({ id, ...(password || {}) }))
                .sort((a, b) => (a.website || '').localeCompare(b.website || ''));
        } else {
            allPasswords = [];
        }

        renderPasswordList();
    } catch (error) {
        showToast('Error loading passwords');
        console.error('Error loading passwords:', error);
    }
}

function renderPasswordList(preferredId = selectedPasswordId) {
    const query = passwordSearchInput.value.trim().toLowerCase();
    const filteredPasswords = allPasswords.filter((password) => {
        const searchable = [
            password.website,
            password.username,
            password.notes
        ].join(' ').toLowerCase();

        return searchable.includes(query);
    });

    passwordListContainer.innerHTML = '';
    passwordCountBadge.textContent = allPasswords.length;
    noPasswordsMessage.style.display = filteredPasswords.length === 0 ? 'block' : 'none';

    if (allPasswords.length === 0) {
        noPasswordsMessage.textContent = 'No saved passwords yet';
        showEmptyState('Your vault is empty', 'Add your first password or import a JSON backup.');
        return;
    }

    if (filteredPasswords.length === 0) {
        noPasswordsMessage.textContent = 'No matching passwords';
        showEmptyState('No Matches Found', 'Try a different search or add a new password.');
        return;
    }

    filteredPasswords.forEach((password, index) => {
        const listItem = createListItem(password, index);
        passwordListContainer.appendChild(listItem);
    });

    const nextSelection = filteredPasswords.find((password) => password.id === preferredId) || filteredPasswords[0];
    if (nextSelection) {
        selectPassword(nextSelection.id);
    }
}

passwordSearchInput.addEventListener('input', () => {
    renderPasswordList();
});

// Export passwords to a local JSON file
exportPasswordsBtn.addEventListener('click', async () => {
    if (!currentUser) {
        showToast('Please log in first');
        return;
    }

    if (!confirm('The export file will contain readable passwords. Keep it somewhere safe. Continue?')) {
        return;
    }

    showLoading();
    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `users/${currentUser.uid}/passwords`));
        const passwords = snapshot.exists() ? snapshot.val() : {};
        const passwordEntries = Object.entries(passwords).map(([id, password]) => ({
            id,
            website: password.website || '',
            username: password.username || '',
            password: password.password || '',
            notes: password.notes || '',
            createdAt: password.createdAt || '',
            updatedAt: password.updatedAt || ''
        }));

        if (passwordEntries.length === 0) {
            showToast('No passwords to export');
            return;
        }

        const exportData = {
            app: 'SecureFire',
            version: 1,
            exportedAt: new Date().toISOString(),
            passwordCount: passwordEntries.length,
            passwords: passwordEntries
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const downloadUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = `securefire-passwords-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        URL.revokeObjectURL(downloadUrl);
        showToast(`Exported ${passwordEntries.length} password${passwordEntries.length === 1 ? '' : 's'}`);
    } catch (error) {
        showToast('Error exporting passwords');
        console.error('Error exporting passwords:', error);
    } finally {
        hideLoading();
    }
});

// Import passwords from a SecureFire JSON export or a simple JSON array/object
importPasswordsBtn.addEventListener('click', () => {
    if (!currentUser) {
        showToast('Please log in first');
        return;
    }

    importPasswordsInput.click();
});

importPasswordsInput.addEventListener('change', async () => {
    const file = importPasswordsInput.files[0];
    if (!file || !currentUser) return;

    try {
        const fileText = await file.text();
        const parsed = JSON.parse(fileText);
        const passwordsToImport = parseImportedPasswords(parsed);

        if (passwordsToImport.length === 0) {
            showToast('No valid passwords found in that file');
            return;
        }

        if (!confirm(`Import ${passwordsToImport.length} password${passwordsToImport.length === 1 ? '' : 's'} into this vault?`)) {
            return;
        }

        showLoading();
        const now = new Date().toISOString();
        const updates = {};

        passwordsToImport.forEach((password, index) => {
            const id = createPasswordId(index);
            updates[`users/${currentUser.uid}/passwords/${id}`] = {
                ...password,
                createdAt: password.createdAt || now,
                importedAt: now
            };
        });

        await update(ref(database), updates);
        passwordSearchInput.value = '';
        await loadPasswords();
        showToast(`Imported ${passwordsToImport.length} password${passwordsToImport.length === 1 ? '' : 's'}`);
    } catch (error) {
        showToast('Import failed. Choose a valid JSON file');
        console.error('Error importing passwords:', error);
    } finally {
        hideLoading();
        importPasswordsInput.value = '';
    }
});

function parseImportedPasswords(parsed) {
    const source = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.passwords)
            ? parsed.passwords
            : parsed?.passwords && typeof parsed.passwords === 'object'
                ? Object.values(parsed.passwords)
                : parsed && typeof parsed === 'object'
                    ? Object.values(parsed)
                    : [];

    return source
        .map(normalizeImportedPassword)
        .filter(Boolean);
}

function normalizeImportedPassword(record) {
    if (!record || typeof record !== 'object') return null;

    const website = String(record.website || record.service || record.name || '').trim();
    const username = String(record.username || record.email || record.login || '').trim();
    const password = record.password == null ? '' : String(record.password);
    const notes = record.notes == null ? '' : String(record.notes);

    if (!website || !username || !password) return null;

    return {
        website,
        username,
        password,
        notes,
        createdAt: typeof record.createdAt === 'string' ? record.createdAt : '',
        updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : ''
    };
}

function createPasswordId(index = 0) {
    return `${Date.now().toString(36)}-${index}-${Math.random().toString(36).slice(2, 10)}`;
}

// Create List Item
function createListItem(password, index) {
    const item = document.createElement('button');
    const website = password.website || 'Untitled';
    const username = password.username || 'No username';

    item.type = 'button';
    item.className = 'list-item';
    if (password.id === selectedPasswordId) item.classList.add('active');
    item.dataset.id = password.id;

    const icon = document.createElement('span');
    icon.className = 'list-item-icon';
    icon.textContent = website.charAt(0).toUpperCase();

    const content = document.createElement('span');
    content.className = 'list-item-content';

    const title = document.createElement('span');
    title.className = 'list-item-title';
    title.textContent = website;

    const meta = document.createElement('span');
    meta.className = 'list-item-meta';
    meta.textContent = username;

    content.append(title, meta);
    item.append(icon, content);
    
    item.addEventListener('click', () => {
        selectPassword(password.id);
        if (window.innerWidth <= 768) {
            closeMobileMenu();
        }
    });
    
    return item;
}

function selectPassword(id) {
    selectedPasswordId = id;
    document.querySelectorAll('.list-item').forEach((item) => {
        item.classList.toggle('active', item.dataset.id === id);
    });
    loadPasswordDetail(id);
}

// Load Password Detail
async function loadPasswordDetail(id) {
    if (!currentUser) return;

    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `users/${currentUser.uid}/passwords/${id}`));
        
        if (snapshot.exists()) {
            const password = snapshot.val();
            displayPasswordDetail(id, password);
        }
    } catch (error) {
        showToast('Error loading password details');
    }
}

// Display Password Detail
function displayPasswordDetail(id, password) {
    emptyState.style.display = 'none';
    passwordFormView.style.display = 'none';
    passwordDetailView.style.display = 'block';

    const website = password.website || 'Untitled';
    const username = password.username || '';
    const savedPassword = password.password || '';
    const notes = password.notes || '';
    
    document.getElementById('detailTitle').textContent = website;
    document.getElementById('detailSubtitle').textContent = username || 'No username saved';
    document.getElementById('detailWebsite').textContent = website;
    document.getElementById('detailUsername').textContent = username;
    document.getElementById('detailPassword').textContent = '••••••••';
    document.getElementById('detailPassword').dataset.password = savedPassword;
    document.getElementById('detailPassword').dataset.revealed = 'false';
    document.getElementById('revealPasswordBtn').textContent = 'Reveal';
    
    const notesContainer = document.getElementById('notesFieldContainer');
    document.getElementById('detailNotes').textContent = notes;
    if (notes) {
        notesContainer.style.display = 'block';
    } else {
        notesContainer.style.display = 'none';
    }
    
    // Store current password ID
    passwordDetailView.dataset.currentId = id;
}

// Show Empty State
function showEmptyState(title = 'No Password Selected', text = 'Add a new password or select one from the list to get started') {
    emptyStateTitle.textContent = title;
    emptyStateText.textContent = text;
    emptyState.style.display = 'flex';
    passwordFormView.style.display = 'none';
    passwordDetailView.style.display = 'none';
}

// Reveal Password
document.getElementById('revealPasswordBtn').addEventListener('click', () => {
    const passwordEl = document.getElementById('detailPassword');
    const revealed = passwordEl.dataset.revealed === 'true';
    
    if (revealed) {
        passwordEl.textContent = '••••••••';
        passwordEl.dataset.revealed = 'false';
        document.getElementById('revealPasswordBtn').textContent = 'Reveal';
    } else {
        passwordEl.textContent = passwordEl.dataset.password;
        passwordEl.dataset.revealed = 'true';
        document.getElementById('revealPasswordBtn').textContent = 'Hide';
    }
});

// Copy Password
document.getElementById('copyPasswordBtn').addEventListener('click', () => {
    const password = document.getElementById('detailPassword').dataset.password;
    navigator.clipboard.writeText(password).then(() => {
        showToast('Password copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy password');
    });
});

// Edit Password Button
document.getElementById('editPasswordBtn').addEventListener('click', () => {
    const id = passwordDetailView.dataset.currentId;
    const website = document.getElementById('detailWebsite').textContent;
    const username = document.getElementById('detailUsername').textContent;
    const password = document.getElementById('detailPassword').dataset.password;
    const notes = document.getElementById('detailNotes').textContent;
    
    document.getElementById('formTitle').textContent = 'Edit Password';
    document.getElementById('formWebsite').value = website;
    document.getElementById('formUsername').value = username;
    document.getElementById('formPassword').value = password;
    document.getElementById('formNotes').value = notes;
    
    passwordForm.dataset.mode = 'edit';
    passwordForm.dataset.id = id;
    
    emptyState.style.display = 'none';
    passwordDetailView.style.display = 'none';
    passwordFormView.style.display = 'block';
});

// Delete Password
document.getElementById('deletePasswordBtn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete this password?')) return;
    
    const id = passwordDetailView.dataset.currentId;
    if (!currentUser) return;
    
    showLoading();
    try {
        await remove(ref(database, `users/${currentUser.uid}/passwords/${id}`));
        selectedPasswordId = null;
        showToast('Password deleted successfully');
        await loadPasswords();
    } catch (error) {
        showToast('Error deleting password');
    } finally {
        hideLoading();
    }
});

// Add Password Button
function openAddPasswordForm() {
    document.getElementById('formTitle').textContent = 'Add New Password';
    passwordForm.reset();
    passwordForm.dataset.mode = 'add';
    delete passwordForm.dataset.id;
    
    emptyState.style.display = 'none';
    passwordDetailView.style.display = 'none';
    passwordFormView.style.display = 'block';
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        closeMobileMenu();
    }
}

addPasswordBtn.addEventListener('click', openAddPasswordForm);
emptyAddPasswordBtn.addEventListener('click', openAddPasswordForm);
emptyImportPasswordsBtn.addEventListener('click', () => importPasswordsBtn.click());

// Password Form Submit
passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const website = document.getElementById('formWebsite').value;
    const username = document.getElementById('formUsername').value;
    const password = document.getElementById('formPassword').value;
    const notes = document.getElementById('formNotes').value;
    
    if (!website || !username || !password) {
        showToast('Please fill in all required fields');
        return;
    }
    
    if (!currentUser) return;
    
    showLoading();
    try {
        const mode = passwordForm.dataset.mode;
        let id = passwordForm.dataset.id;
        
        if (mode === 'add') {
            id = createPasswordId();
            await set(ref(database, `users/${currentUser.uid}/passwords/${id}`), {
                website,
                username,
                password,
                notes,
                createdAt: new Date().toISOString()
            });
            showToast('Password added successfully!');
        } else {
            await update(ref(database, `users/${currentUser.uid}/passwords/${id}`), {
                website,
                username,
                password,
                notes,
                updatedAt: new Date().toISOString()
            });
            showToast('Password updated successfully!');
        }
        
        selectedPasswordId = id;
        passwordSearchInput.value = '';
        passwordForm.reset();
        await loadPasswords();
    } catch (error) {
        showToast('Error saving password');
        console.error('Error saving password:', error);
    } finally {
        hideLoading();
    }
});

// Cancel Form
cancelFormBtn.addEventListener('click', () => {
    passwordForm.reset();
    const selectedPassword = allPasswords.find((password) => password.id === selectedPasswordId);

    if (selectedPassword) {
        selectPassword(selectedPassword.id);
    } else if (allPasswords.length > 0) {
        selectPassword(allPasswords[0].id);
    } else {
        showEmptyState('Your vault is empty', 'Add your first password or import a JSON backup.');
    }
});

// Reset UI
function resetUI() {
    passwordForm.reset();
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    document.getElementById('loginError').textContent = '';
    document.getElementById('registerError').textContent = '';
    resetError.textContent = '';
    resetSuccess.textContent = '';
    changePasswordError.textContent = '';
    changePasswordSuccess.textContent = '';
    forgotPasswordModal.style.display = 'none';
    changePasswordModal.style.display = 'none';
    userDropdown.style.display = 'none';
    userEmailLabel.textContent = '';
    allPasswords = [];
    selectedPasswordId = null;
    passwordSearchInput.value = '';
    passwordCountBadge.textContent = '0';
    noPasswordsMessage.style.display = 'none';
    passwordListContainer.innerHTML = '';
    closeMobileMenu();
    showEmptyState('No Password Selected', 'Add a new password or select one from the list to get started');
    document.querySelector('[data-tab="login"]').click();
}
