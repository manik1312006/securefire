import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getDatabase, ref, set, get, remove, child, update } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// ==============================
// DOM refs
// ==============================
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  authContainer: $('authContainer'),
  appContainer: $('appContainer'),
  loginForm: $('loginForm'),
  registerForm: $('registerForm'),
  logoutBtn: $('logoutBtn'),
  addPasswordBtn: $('addPasswordBtn'),
  emptyAddPasswordBtn: $('emptyAddPasswordBtn'),
  emptyImportPasswordsBtn: $('emptyImportPasswordsBtn'),
  importPasswordsBtn: $('importPasswordsBtn'),
  exportPasswordsBtn: $('exportPasswordsBtn'),
  importPasswordsInput: $('importPasswordsInput'),
  passwordForm: $('passwordForm'),
  cancelFormBtn: $('cancelFormBtn'),
  passwordListContainer: $('passwordListContainer'),
  passwordSearchInput: $('passwordSearchInput'),
  passwordCountBadge: $('passwordCountBadge'),
  noPasswordsMessage: $('noPasswordsMessage'),
  emptyState: $('emptyState'),
  emptyStateTitle: $('emptyStateTitle'),
  emptyStateText: $('emptyStateText'),
  passwordDetailView: $('passwordDetailView'),
  forgotPasswordModal: $('forgotPasswordModal'),
  forgotPasswordForm: $('forgotPasswordFormElement'),
  closeForgotModal: $('closeForgotModal'),
  cancelResetBtn: $('cancelResetBtn'),
  resetError: $('resetError'),
  resetSuccess: $('resetSuccess'),
  forgotPasswordLink: $('forgotPasswordLink'),
  userButton: $('userButton'),
  userDropdown: $('userDropdown'),
  userEmailLabel: $('userEmailLabel'),
  changePasswordBtn: $('changePasswordBtn'),
  changePasswordModal: $('changePasswordModal'),
  closeChangeModal: $('closeChangeModal'),
  cancelChangeBtn: $('cancelChangeBtn'),
  changePasswordForm: $('changePasswordFormElement'),
  changePasswordError: $('changePasswordError'),
  changePasswordSuccess: $('changePasswordSuccess'),
  currentPassword: $('currentPassword'),
  newPassword: $('newPassword'),
  confirmNewPassword: $('confirmNewPassword'),
  passwordFormView: $('passwordFormView'),
  toast: $('toast'),
  loadingSpinner: $('loadingSpinner'),
  mobileMenuBtn: $('mobileMenuBtn'),
  sidebar: document.querySelector('.sidebar'),
  sidebarOverlay: $('sidebarOverlay'),
  tabBtns: $$('.auth__tab'),
  authForms: $$('.auth__form'),
  toggleBtns: $$('.field__toggle'),
  revealPasswordBtn: $('revealPasswordBtn'),
  copyPasswordBtn: $('copyPasswordBtn'),
  editPasswordBtn: $('editPasswordBtn'),
  deletePasswordBtn: $('deletePasswordBtn'),
};

// ==============================
// State
// ==============================
let currentUser = null;
let allPasswords = [];
let selectedPasswordId = null;

// ==============================
// Helpers
// ==============================
function showToast(message, duration = 3000) {
  dom.toast.textContent = message;
  dom.toast.classList.remove('show');
  void dom.toast.offsetWidth;
  dom.toast.classList.add('show');
  clearTimeout(dom.toast._timer);
  dom.toast._timer = setTimeout(() => dom.toast.classList.remove('show'), duration);
}

function showLoading() { dom.loadingSpinner.hidden = false; }
function hideLoading() { dom.loadingSpinner.hidden = true; }

function getErrorMessage(code) {
  const map = {
    'auth/email-already-in-use': 'Email already in use',
    'auth/invalid-email': 'Invalid email address',
    'auth/weak-password': 'Password is too weak',
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Wrong password',
    'auth/invalid-credential': 'Incorrect email or password',
    'auth/missing-password': 'Please enter your password',
    'auth/too-many-requests': 'Too many login attempts, try again later',
    'auth/network-request-failed': 'Network error. Check your connection',
    'auth/requires-recent-login': 'Please log in again before changing your password',
    'auth/operation-not-allowed': 'Email/password sign-in is not enabled',
  };
  return map[code] || 'An error occurred. Please try again.';
}

function closeMobileMenu() {
  dom.sidebar.classList.remove('open');
  dom.sidebarOverlay.classList.remove('open');
}

function openMobileMenu() {
  dom.sidebar.classList.add('open');
  dom.sidebarOverlay.classList.add('open');
}

function updateMenuButtonVisibility() {
  const isMobile = window.innerWidth <= 768;
  dom.mobileMenuBtn.style.display = isMobile ? 'flex' : 'none';
  if (!isMobile) closeMobileMenu();
}

// ==============================
// Auth tabs
// ==============================
dom.tabBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const tab = btn.dataset.tab;
    dom.tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    dom.authForms.forEach(f => f.classList.remove('active'));
    const form = $(`${tab}Form`);
    if (form) form.classList.add('active');
    window.scrollTo(0, 0);
  });
});

// ==============================
// Toggle password visibility
// ==============================
dom.toggleBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const input = $(btn.dataset.target);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
  });
});

// ==============================
// Mobile menu
// ==============================
dom.mobileMenuBtn.addEventListener('click', () => {
  dom.sidebar.classList.toggle('open');
  dom.sidebarOverlay.classList.toggle('open');
});
dom.sidebarOverlay.addEventListener('click', closeMobileMenu);
window.addEventListener('resize', updateMenuButtonVisibility);
updateMenuButtonVisibility();

// ==============================
// Auth handlers
// ==============================
dom.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('loginEmail').value;
  const password = $('loginPassword').value;
  const errorEl = $('loginError');
  errorEl.textContent = '';

  if (!email || !password) { errorEl.textContent = 'Please fill in all fields'; return; }

  showLoading();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast('Login successful!');
    dom.loginForm.reset();
  } catch (error) {
    errorEl.textContent = getErrorMessage(error.code);
  } finally {
    hideLoading();
  }
});

dom.registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('registerEmail').value;
  const password = $('registerPassword').value;
  const confirm = $('confirmPassword').value;
  const errorEl = $('registerError');
  errorEl.textContent = '';

  if (!email || !password || !confirm) { errorEl.textContent = 'Please fill in all fields'; return; }
  if (password !== confirm) { errorEl.textContent = 'Passwords do not match'; return; }
  if (password.length < 6) { errorEl.textContent = 'Password must be at least 6 characters'; return; }

  showLoading();
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showToast('Registration successful!');
    dom.registerForm.reset();
    document.querySelector('[data-tab="login"]').click();
  } catch (error) {
    errorEl.textContent = getErrorMessage(error.code);
  } finally {
    hideLoading();
  }
});

dom.logoutBtn.addEventListener('click', async () => {
  showLoading();
  try {
    await signOut(auth);
    showToast('Logged out successfully');
  } catch {
    showToast('Error logging out');
  } finally {
    hideLoading();
  }
});

// ==============================
// Forgot password modal
// ==============================
dom.forgotPasswordLink.addEventListener('click', () => {
  dom.resetError.textContent = '';
  dom.resetSuccess.textContent = '';
  dom.forgotPasswordForm.reset();
  dom.forgotPasswordModal.hidden = false;
});

function closeForgotModal() { dom.forgotPasswordModal.hidden = true; }
dom.closeForgotModal.addEventListener('click', closeForgotModal);
dom.cancelResetBtn.addEventListener('click', closeForgotModal);

dom.forgotPasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('resetEmail').value;
  dom.resetError.textContent = '';
  dom.resetSuccess.textContent = '';

  if (!email) { dom.resetError.textContent = 'Please enter your email'; return; }

  showLoading();
  try {
    await sendPasswordResetEmail(auth, email);
    dom.resetSuccess.textContent = 'Reset link sent. Check your email.';
    showToast('Password reset email sent');
  } catch (error) {
    dom.resetError.textContent = getErrorMessage(error.code);
  } finally {
    hideLoading();
  }
});

// ==============================
// User dropdown & change password
// ==============================
dom.userButton.addEventListener('click', () => {
  dom.userDropdown.hidden = !dom.userDropdown.hidden;
});

document.addEventListener('click', (e) => {
  if (!dom.userDropdown.contains(e.target) && !dom.userButton.contains(e.target)) {
    dom.userDropdown.hidden = true;
  }
});

dom.changePasswordBtn.addEventListener('click', () => {
  dom.userDropdown.hidden = true;
  dom.changePasswordError.textContent = '';
  dom.changePasswordSuccess.textContent = '';
  dom.currentPassword.value = '';
  dom.newPassword.value = '';
  dom.confirmNewPassword.value = '';
  dom.changePasswordModal.hidden = false;
});

function closeChangeModal() { dom.changePasswordModal.hidden = true; }
dom.closeChangeModal.addEventListener('click', closeChangeModal);
dom.cancelChangeBtn.addEventListener('click', closeChangeModal);

dom.changePasswordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  dom.changePasswordError.textContent = '';
  dom.changePasswordSuccess.textContent = '';

  const current = dom.currentPassword.value;
  const newPw = dom.newPassword.value;
  const confirm = dom.confirmNewPassword.value;

  if (!current || !newPw || !confirm) { dom.changePasswordError.textContent = 'Please fill in all fields'; return; }
  if (newPw !== confirm) { dom.changePasswordError.textContent = 'New passwords do not match'; return; }
  if (newPw.length < 6) { dom.changePasswordError.textContent = 'New password must be at least 6 characters'; return; }
  if (!currentUser) { dom.changePasswordError.textContent = 'No user is signed in'; return; }

  showLoading();
  try {
    const credential = EmailAuthProvider.credential(currentUser.email, current);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPw);
    dom.changePasswordSuccess.textContent = 'Password updated successfully';
    showToast('Password updated successfully');
    setTimeout(closeChangeModal, 1200);
  } catch (error) {
    dom.changePasswordError.textContent = getErrorMessage(error.code) || 'Unable to update password';
  } finally {
    hideLoading();
  }
});

// ==============================
// Auth state
// ==============================
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    dom.userEmailLabel.textContent = user.email || 'Signed in';
    dom.authContainer.hidden = true;
    dom.appContainer.hidden = false;
    loadPasswords();
  } else {
    dom.authContainer.hidden = false;
    dom.appContainer.hidden = true;
    resetUI();
  }
});

// ==============================
// Load & render passwords
// ==============================
async function loadPasswords() {
  if (!currentUser) return;
  try {
    const snapshot = await get(child(ref(database), `users/${currentUser.uid}/passwords`));
    if (snapshot.exists()) {
      allPasswords = Object.entries(snapshot.val())
        .map(([id, p]) => ({ id, ...(p || {}) }))
        .sort((a, b) => (a.website || '').localeCompare(b.website || ''));
    } else {
      allPasswords = [];
    }
    renderPasswordList();
  } catch {
    showToast('Error loading passwords');
  }
}

function renderPasswordList(preferredId = selectedPasswordId) {
  const query = dom.passwordSearchInput.value.trim().toLowerCase();
  const filtered = allPasswords.filter(p => [p.website, p.username, p.notes].join(' ').toLowerCase().includes(query));

  dom.passwordListContainer.innerHTML = '';
  dom.passwordCountBadge.textContent = allPasswords.length;

  if (allPasswords.length === 0) {
    dom.noPasswordsMessage.hidden = false;
    dom.noPasswordsMessage.textContent = 'No saved passwords yet';
    showEmptyState('Your vault is empty', 'Add your first password or import from a CSV or JSON file.');
    return;
  }

  if (filtered.length === 0) {
    dom.noPasswordsMessage.hidden = false;
    dom.noPasswordsMessage.textContent = 'No matching passwords';
    showEmptyState('No matches found', 'Try a different search or add a new password.');
    return;
  }

  dom.noPasswordsMessage.hidden = true;
  filtered.forEach(p => dom.passwordListContainer.appendChild(createListItem(p)));

  const next = filtered.find(p => p.id === preferredId) || filtered[0];
  if (next) selectPassword(next.id);
}

dom.passwordSearchInput.addEventListener('input', () => renderPasswordList());

// ==============================
// List item creation
// ==============================
function createListItem(password) {
  const item = document.createElement('button');
  item.type = 'button';
  item.className = 'list-item';
  if (password.id === selectedPasswordId) item.classList.add('active');
  item.dataset.id = password.id;

  const website = password.website || 'Untitled';
  const username = password.username || '';

  const icon = document.createElement('span');
  icon.className = 'list-item__icon';
  icon.textContent = website.charAt(0).toUpperCase();

  const content = document.createElement('span');
  content.className = 'list-item__content';

  const title = document.createElement('span');
  title.className = 'list-item__title';
  title.textContent = website;

  const meta = document.createElement('span');
  meta.className = 'list-item__meta';
  meta.textContent = username || 'No username';

  content.append(title, meta);
  item.append(icon, content);

  item.addEventListener('click', () => {
    selectPassword(password.id);
    if (window.innerWidth <= 768) closeMobileMenu();
  });

  return item;
}

function selectPassword(id) {
  selectedPasswordId = id;
  document.querySelectorAll('.list-item').forEach(item => {
    item.classList.toggle('active', item.dataset.id === id);
  });
  loadPasswordDetail(id);
}

// ==============================
// Password detail
// ==============================
async function loadPasswordDetail(id) {
  if (!currentUser) return;
  try {
    const snapshot = await get(child(ref(database), `users/${currentUser.uid}/passwords/${id}`));
    if (snapshot.exists()) displayPasswordDetail(id, snapshot.val());
  } catch {
    showToast('Error loading password details');
  }
}

function displayPasswordDetail(id, password) {
  dom.emptyState.hidden = true;
  dom.passwordFormView.hidden = true;
  dom.passwordDetailView.hidden = false;

  const website = password.website || 'Untitled';
  const username = password.username || '';
  const savedPassword = password.password || '';
  const notes = password.notes || '';

  $('detailTitle').textContent = website;
  $('detailSubtitle').textContent = username || 'No username saved';
  $('detailWebsite').textContent = website;
  $('detailUsername').textContent = username;

  const pwEl = $('detailPassword');
  pwEl.textContent = '••••••••';
  pwEl.dataset.password = savedPassword;
  pwEl.dataset.revealed = 'false';
  dom.revealPasswordBtn.textContent = 'Reveal';

  const notesContainer = $('notesFieldContainer');
  $('detailNotes').textContent = notes;
  notesContainer.hidden = !notes;

  dom.passwordDetailView.dataset.currentId = id;
}

function showEmptyState(title = 'No Password Selected', text = 'Add a new password or select one from the list') {
  dom.emptyStateTitle.textContent = title;
  dom.emptyStateText.textContent = text;
  dom.emptyState.hidden = false;
  dom.passwordFormView.hidden = true;
  dom.passwordDetailView.hidden = true;
}

// Reveal / Copy / Edit / Delete
dom.revealPasswordBtn.addEventListener('click', () => {
  const pwEl = $('detailPassword');
  const revealed = pwEl.dataset.revealed === 'true';
  if (revealed) {
    pwEl.textContent = '••••••••';
    pwEl.dataset.revealed = 'false';
    dom.revealPasswordBtn.textContent = 'Reveal';
  } else {
    pwEl.textContent = pwEl.dataset.password;
    pwEl.dataset.revealed = 'true';
    dom.revealPasswordBtn.textContent = 'Hide';
  }
});

dom.copyPasswordBtn.addEventListener('click', () => {
  const password = $('detailPassword').dataset.password;
  navigator.clipboard.writeText(password).then(
    () => showToast('Password copied!'),
    () => showToast('Failed to copy password')
  );
});

dom.editPasswordBtn.addEventListener('click', () => {
  const id = dom.passwordDetailView.dataset.currentId;
  $('formTitle').textContent = 'Edit Password';
  $('formWebsite').value = $('detailWebsite').textContent;
  $('formUsername').value = $('detailUsername').textContent;
  $('formPassword').value = $('detailPassword').dataset.password;
  $('formNotes').value = $('detailNotes').textContent;
  dom.passwordForm.dataset.mode = 'edit';
  dom.passwordForm.dataset.id = id;
  dom.emptyState.hidden = true;
  dom.passwordDetailView.hidden = true;
  dom.passwordFormView.hidden = false;
});

dom.deletePasswordBtn.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to delete this password?')) return;
  const id = dom.passwordDetailView.dataset.currentId;
  if (!currentUser) return;
  showLoading();
  try {
    await remove(ref(database, `users/${currentUser.uid}/passwords/${id}`));
    selectedPasswordId = null;
    showToast('Password deleted successfully');
    await loadPasswords();
  } catch {
    showToast('Error deleting password');
  } finally {
    hideLoading();
  }
});

// ==============================
// Add password form
// ==============================
function openAddPasswordForm() {
  $('formTitle').textContent = 'Add New Password';
  dom.passwordForm.reset();
  dom.passwordForm.dataset.mode = 'add';
  delete dom.passwordForm.dataset.id;
  dom.emptyState.hidden = true;
  dom.passwordDetailView.hidden = true;
  dom.passwordFormView.hidden = false;
  if (window.innerWidth <= 768) closeMobileMenu();
}

dom.addPasswordBtn.addEventListener('click', openAddPasswordForm);
dom.emptyAddPasswordBtn.addEventListener('click', openAddPasswordForm);
dom.emptyImportPasswordsBtn.addEventListener('click', () => dom.importPasswordsBtn.click());

// ==============================
// Password form submit
// ==============================
dom.passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const website = $('formWebsite').value;
  const username = $('formUsername').value;
  const password = $('formPassword').value;
  const notes = $('formNotes').value;

  if (!website || !username || !password) { showToast('Please fill in all required fields'); return; }
  if (!currentUser) return;

  showLoading();
  try {
    const mode = dom.passwordForm.dataset.mode;
    let id = dom.passwordForm.dataset.id;

    if (mode === 'add') {
      const dup = findDuplicate(website, username);
      if (dup) {
        id = dup.id;
        await update(ref(database, `users/${currentUser.uid}/passwords/${id}`), {
          website, username, password, notes,
          updatedAt: new Date().toISOString()
        });
        showToast('Duplicate merged — entry updated');
      } else {
        id = createPasswordId();
        await set(ref(database, `users/${currentUser.uid}/passwords/${id}`), {
          website, username, password, notes,
          createdAt: new Date().toISOString()
        });
        showToast('Password added!');
      }
    } else {
      await update(ref(database, `users/${currentUser.uid}/passwords/${id}`), {
        website, username, password, notes,
        updatedAt: new Date().toISOString()
      });
      showToast('Password updated!');
    }

    selectedPasswordId = id;
    dom.passwordSearchInput.value = '';
    dom.passwordForm.reset();
    await loadPasswords();
  } catch {
    showToast('Error saving password');
  } finally {
    hideLoading();
  }
});

dom.cancelFormBtn.addEventListener('click', () => {
  dom.passwordForm.reset();
  const selected = allPasswords.find(p => p.id === selectedPasswordId);
  if (selected) selectPassword(selected.id);
  else if (allPasswords.length > 0) selectPassword(allPasswords[0].id);
  else showEmptyState('Your vault is empty', 'Add your first password or import from a CSV or JSON file.');
});

// ==============================
// CSV helpers
// ==============================
function csvEscape(value) {
  const str = String(value == null ? '' : value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function convertToCSV(passwords) {
  const headers = ['website', 'username', 'password', 'notes', 'createdAt', 'updatedAt'];
  const headerRow = headers.join(',');
  const rows = passwords.map(p => headers.map(h => csvEscape(p[h] || '')).join(','));
  return [headerRow, ...rows].join('\r\n');
}

function parseCSVText(text) {
  const rows = [];
  let currentRow = [], currentField = '', inQuotes = false, i = 0;
  while (i < text.length) {
    const ch = text[i], next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') { currentField += '"'; i += 2; }
      else if (ch === '"') { inQuotes = false; i++; }
      else { currentField += ch; i++; }
    } else {
      if (ch === '"') { inQuotes = true; i++; }
      else if (ch === ',') { currentRow.push(currentField); currentField = ''; i++; }
      else if (ch === '\r' && next === '\n') { currentRow.push(currentField); currentField = ''; rows.push(currentRow); currentRow = []; i += 2; }
      else if (ch === '\n' || ch === '\r') { currentRow.push(currentField); currentField = ''; rows.push(currentRow); currentRow = []; i++; }
      else { currentField += ch; i++; }
    }
  }
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(f => f !== '')) rows.push(currentRow);
  }
  return rows;
}

function csvRowsToPasswords(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim().toLowerCase());
  const passwords = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.every(cell => !cell.trim())) continue;
    const record = {};
    headers.forEach((header, idx) => { record[header] = (row[idx] || '').trim(); });
    const normalized = normalizeImportedPassword(record);
    if (normalized) passwords.push(normalized);
  }
  return passwords;
}

// ==============================
// Export
// ==============================
dom.exportPasswordsBtn.addEventListener('click', async () => {
  if (!currentUser) { showToast('Please log in first'); return; }
  if (!confirm('The export file will contain passwords in plain text. Store it safely. Continue?')) return;

  showLoading();
  try {
    const snapshot = await get(child(ref(database), `users/${currentUser.uid}/passwords`));
    const passwords = snapshot.exists() ? snapshot.val() : {};
    const entries = Object.entries(passwords).map(([id, p]) => ({
      id, website: p.website || '', username: p.username || '',
      password: p.password || '', notes: p.notes || '',
      createdAt: p.createdAt || '', updatedAt: p.updatedAt || ''
    }));
    if (entries.length === 0) { showToast('No passwords to export'); return; }

    const csv = convertToCSV(entries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securefire-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Exported ${entries.length} password${entries.length === 1 ? '' : 's'}`);
  } catch {
    showToast('Error exporting passwords');
  } finally {
    hideLoading();
  }
});

// ==============================
// Import
// ==============================
dom.importPasswordsBtn.addEventListener('click', () => {
  if (!currentUser) { showToast('Please log in first'); return; }
  dom.importPasswordsInput.click();
});

dom.importPasswordsInput.addEventListener('change', async () => {
  const file = dom.importPasswordsInput.files[0];
  if (!file || !currentUser) return;

  try {
    const text = await file.text();
    const name = file.name.toLowerCase();
    let toImport = [];

    if (name.endsWith('.csv') || file.type === 'text/csv') {
      toImport = csvRowsToPasswords(parseCSVText(text));
    } else {
      toImport = parseImportedPasswords(JSON.parse(text));
    }

    if (toImport.length === 0) { showToast('No valid passwords found in that file'); return; }
    if (!confirm(`Import ${toImport.length} password${toImport.length === 1 ? '' : 's'} into your vault?`)) return;
    showLoading();
    const now = new Date().toISOString();
    const updates = {};
    let merged = 0, created = 0;

    toImport.forEach((p) => {
      const dup = findDuplicate(p.website, p.username);
      const id = dup ? dup.id : createPasswordId();
      const entry = { ...p, createdAt: p.createdAt || dup?.createdAt || now };
      if (dup) entry.updatedAt = now;
      updates[`users/${currentUser.uid}/passwords/${id}`] = entry;
      if (dup) merged++; else created++;
    });
    await update(ref(database), updates);
    dom.passwordSearchInput.value = '';
    await loadPasswords();
    const msg = merged > 0
      ? `Imported ${created} new, merged ${merged} duplicate${merged === 1 ? '' : 's'}`
      : `Imported ${created} password${created === 1 ? '' : 's'}`;
    showToast(msg);
  } catch {
    showToast('Import failed. Choose a valid CSV or JSON file.');
  } finally {
    hideLoading();
    dom.importPasswordsInput.value = '';
  }
});

// ==============================
// JSON import helpers
// ==============================
function parseImportedPasswords(parsed) {
  const source = Array.isArray(parsed) ? parsed
    : Array.isArray(parsed?.passwords) ? parsed.passwords
    : parsed?.passwords && typeof parsed.passwords === 'object' ? Object.values(parsed.passwords)
    : parsed && typeof parsed === 'object' ? Object.values(parsed)
    : [];
  return source.map(normalizeImportedPassword).filter(Boolean);
}

function normalizeImportedPassword(record) {
  if (!record || typeof record !== 'object') return null;
  const website = String(record.website || record.service || record.name || '').trim();
  const username = String(record.username || record.email || record.login || '').trim();
  const password = record.password == null ? '' : String(record.password);
  const notes = record.notes == null ? '' : String(record.notes);
  if (!website || !username || !password) return null;
  return {
    website, username, password, notes,
    createdAt: typeof record.createdAt === 'string' ? record.createdAt : '',
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : ''
  };
}

function createPasswordId(index = 0) {
  return `${Date.now().toString(36)}-${index}-${Math.random().toString(36).slice(2, 10)}`;
}

function findDuplicate(website, username) {
  return allPasswords.find(p =>
    p.website?.toLowerCase() === website.toLowerCase() &&
    p.username?.toLowerCase() === username.toLowerCase()
  );
}

// ==============================
// Reset UI
// ==============================
function resetUI() {
  dom.passwordForm.reset();
  $('loginForm').reset();
  $('registerForm').reset();
  $('loginError').textContent = '';
  $('registerError').textContent = '';
  dom.resetError.textContent = '';
  dom.resetSuccess.textContent = '';
  dom.changePasswordError.textContent = '';
  dom.changePasswordSuccess.textContent = '';
  dom.forgotPasswordModal.hidden = true;
  dom.changePasswordModal.hidden = true;
  dom.userDropdown.hidden = true;
  dom.userEmailLabel.textContent = '';
  allPasswords = [];
  selectedPasswordId = null;
  dom.passwordSearchInput.value = '';
  dom.passwordCountBadge.textContent = '0';
  dom.noPasswordsMessage.hidden = true;
  dom.passwordListContainer.innerHTML = '';
  closeMobileMenu();
  showEmptyState('No Password Selected', 'Add a new password or select one from the list');
  document.querySelector('[data-tab="login"]').click();
}
