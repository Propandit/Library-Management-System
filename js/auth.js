/* ================================================================
   js/auth.js — Authentication Module
   Handles login, logout, and role-based UI visibility.
   Note: initial field values and enter-key binding are wired
   in index.html bootApp() after page modules load.
   ================================================================ */

let currentUser = null;
let loginType   = 'admin';

/* ── SET ACTIVE LOGIN TAB (Admin / User) ── */
function setLoginType(type) {
  loginType = type;
  document.querySelectorAll('.login-tab').forEach((el, i) => {
    el.classList.toggle('active', (i === 0 && type === 'admin') || (i === 1 && type === 'user'));
  });
  document.getElementById('loginId').value  = type === 'admin' ? 'adm'  : 'user';
  document.getElementById('loginPwd').value = type === 'admin' ? 'adm'  : 'user';
}

/* ── LOGIN ── */
function doLogin() {
  const id    = document.getElementById('loginId').value.trim();
  const pwd   = document.getElementById('loginPwd').value.trim();
  const errEl = document.getElementById('loginErr');

  const user = db.users.find(u => u.id === id && u.password === pwd && u.active);

  if (!user) {
    errEl.textContent = '⚠ Invalid credentials. Please try again.';
    return;
  }
  if (loginType === 'admin' && !user.admin) {
    errEl.textContent = '⚠ This account does not have admin access.';
    return;
  }

  currentUser = user;
  errEl.textContent = '';

  document.getElementById('loginWrap').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');

  // Update sidebar user info
  document.getElementById('avatarInitial').textContent = user.name[0].toUpperCase();
  document.getElementById('userLabel').textContent     = user.name;
  document.getElementById('roleLabel').textContent     = user.admin ? 'Administrator' : 'Librarian';
  document.getElementById('homeTitle').textContent     = user.admin ? 'Admin Dashboard' : 'User Dashboard';

  // Show / hide admin-only nav items & section
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = user.admin ? (el.tagName === 'BUTTON' ? 'flex' : 'block') : 'none';
  });

  initForms();
  updateStats();
  nav('home');
}

/* ── LOGOUT ── */
function doLogout() {
  currentUser = null;
  document.getElementById('loginWrap').classList.remove('hidden');
  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('loginErr').textContent = '';
  document.getElementById('loginId').value  = 'adm';
  document.getElementById('loginPwd').value = 'adm';
  loginType = 'admin';
  document.querySelectorAll('.login-tab').forEach((el, i) => el.classList.toggle('active', i === 0));
}
