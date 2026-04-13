/* ================================================================
   js/maintenance.js — Maintenance Module (Admin Only)
   Covers: Add/Update Membership, Add/Update Book/Movie, User Management.
   ================================================================ */

/* ════════════════════════════════════════════════
   1. ADD MEMBERSHIP
   ════════════════════════════════════════════════ */
function submitAddMembership() {
  const alertEl   = document.getElementById('addMemberAlert');
  const firstName = document.getElementById('mFirstName').value.trim();
  const lastName  = document.getElementById('mLastName').value.trim();
  const contact   = document.getElementById('mContact').value.trim();
  const address   = document.getElementById('mAddress').value.trim();
  const aadhar    = document.getElementById('mAadhar').value.trim();
  const startDate = document.getElementById('mStart').value;
  const duration  = parseInt(document.querySelector('input[name="mDur"]:checked').value);

  if (!firstName || !lastName || !contact || !address || !aadhar || !startDate) {
    alertEl.innerHTML = '<div class="alert alert-error">⚠ All fields are required.</div>';
    return;
  }

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + duration);

  const newId = 'MEM-' + String(db.members.length + 1).padStart(3, '0');
  db.members.push({
    id: newId, firstName, lastName, contact, address, aadhar,
    start: startDate, end: endDate.toISOString().split('T')[0],
    status: 'Active', fine: 0
  });

  alertEl.innerHTML = '';
  document.getElementById('confirmMsg').textContent = `Membership ${newId} created for ${firstName} ${lastName}.`;
  nav('confirmation');
}

function clearAddMember() {
  ['mFirstName', 'mLastName', 'mContact', 'mAddress', 'mAadhar'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('addMemberAlert').innerHTML = '';
}

/* ════════════════════════════════════════════════
   2. UPDATE MEMBERSHIP
   ════════════════════════════════════════════════ */
function lookupMember() {
  const id     = document.getElementById('updMemberId').value.trim();
  const member = db.members.find(m => m.id === id);
  document.getElementById('updStart').value = member ? member.start : '';
  document.getElementById('updEnd').value   = member ? member.end   : '';
  const infoEl = document.getElementById('updMemberInfo');
  if (member) {
    document.getElementById('updMemberName').textContent = `${member.firstName} ${member.lastName}`;
    infoEl.style.display = 'block';
  } else {
    infoEl.style.display = 'none';
  }
}

function submitUpdateMembership() {
  const alertEl = document.getElementById('updMemberAlert');
  const id      = document.getElementById('updMemberId').value.trim();
  const member  = db.members.find(m => m.id === id);

  if (!member) {
    alertEl.innerHTML = '<div class="alert alert-error">⚠ Membership ID not found.</div>';
    return;
  }

  const action = document.querySelector('input[name="updAction"]:checked').value;

  if (action === 'cancel') {
    member.status = 'Inactive';
    document.getElementById('confirmMsg').textContent = `Membership ${id} has been cancelled.`;
  } else {
    const duration = parseInt(document.querySelector('input[name="updDur"]:checked').value);
    const newEnd   = new Date(member.end);
    newEnd.setMonth(newEnd.getMonth() + duration);
    member.end = newEnd.toISOString().split('T')[0];
    document.getElementById('confirmMsg').textContent = `Membership ${id} extended to ${member.end}.`;
  }

  alertEl.innerHTML = '';
  nav('confirmation');
}

/* ════════════════════════════════════════════════
   3. ADD BOOK / MOVIE
   ════════════════════════════════════════════════ */
function updateItemType() {
  const type = document.querySelector('input[name="itemType"]:checked').value;
  document.getElementById('itemNameLabel').textContent   = type === 'book' ? 'Book Name *'     : 'Movie Name *';
  document.getElementById('itemAuthorLabel').textContent = type === 'book' ? 'Author Name *'   : 'Director Name *';
}

function submitAddBook() {
  const alertEl  = document.getElementById('addBookAlert');
  const type     = document.querySelector('input[name="itemType"]:checked').value;
  const name     = document.getElementById('addItemName').value.trim();
  const author   = document.getElementById('addItemAuthor').value.trim();
  const category = document.getElementById('addItemCategory').value;
  const cost     = document.getElementById('addItemCost').value;
  const qty      = parseInt(document.getElementById('addItemQty').value) || 1;
  const date     = document.getElementById('addItemDate').value;

  if (!name || !author || !category || !cost || !date) {
    alertEl.innerHTML = '<div class="alert alert-error">⚠ All fields are required.</div>';
    return;
  }

  const prefix = category.substring(0, 2).toUpperCase();
  const suffix  = type === 'book' ? 'B' : 'M';

  for (let i = 0; i < qty; i++) {
    const count = db.books.filter(b => b.type === type && b.category === category).length + 1 + i;
    const num   = String(count).padStart(6, '0');
    db.books.push({
      serial: `${prefix}-${suffix}-${num}`,
      name, author, category, type,
      status: 'Available',
      cost: parseInt(cost),
      procured: date
    });
  }

  alertEl.innerHTML = '';
  document.getElementById('confirmMsg').textContent = `${qty} copy/copies of "${name}" added to inventory.`;
  nav('confirmation');
}

function clearAddBook() {
  ['addItemName', 'addItemAuthor', 'addItemCost', 'addItemDate'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('addItemCategory').value = '';
  document.getElementById('addItemQty').value      = '1';
  document.getElementById('addBookAlert').innerHTML = '';
}

/* ════════════════════════════════════════════════
   4. UPDATE BOOK / MOVIE
   ════════════════════════════════════════════════ */
function populateUpdateBookForm() {
  const el = document.getElementById('updItemName');
  el.innerHTML = '<option value="">— Select book or movie —</option>';
  db.books.forEach(b => el.innerHTML += `<option value="${b.serial}">${b.name} (${b.serial})</option>`);
}

function lookupItem() {
  const serial = document.getElementById('updItemName').value;
  const book   = db.books.find(b => b.serial === serial);
  document.getElementById('updItemSerial').value = book ? book.serial : '';
  document.getElementById('updItemStatus').value = book ? book.status : 'Available';
}

function submitUpdateBook() {
  const alertEl = document.getElementById('updBookAlert');
  const serial  = document.getElementById('updItemName').value;
  const status  = document.getElementById('updItemStatus').value;

  if (!serial) {
    alertEl.innerHTML = '<div class="alert alert-error">⚠ Please select a book or movie.</div>';
    return;
  }

  const book  = db.books.find(b => b.serial === serial);
  book.status = status;

  alertEl.innerHTML = '';
  document.getElementById('confirmMsg').textContent = `"${book.name}" status updated to "${status}".`;
  nav('confirmation');
}

/* ════════════════════════════════════════════════
   5. USER MANAGEMENT
   ════════════════════════════════════════════════ */
function toggleUserForm() {
  const isExisting = document.querySelector('input[name="userOp"]:checked').value === 'existing';
  document.getElementById('umIdField').style.display = isExisting ? 'block' : 'none';
}

function submitUserMgmt() {
  const alertEl = document.getElementById('userMgmtAlert');
  const name    = document.getElementById('umName').value.trim();

  if (!name) {
    alertEl.innerHTML = '<div class="alert alert-error">⚠ Name is required.</div>';
    return;
  }

  const op     = document.querySelector('input[name="userOp"]:checked').value;
  const active = document.getElementById('umActive').checked;
  const admin  = document.getElementById('umAdmin').checked;

  if (op === 'existing') {
    const id   = document.getElementById('umId').value.trim();
    const user = db.users.find(u => u.id === id);
    if (!user) {
      alertEl.innerHTML = '<div class="alert alert-error">⚠ User ID not found.</div>';
      return;
    }
    user.name   = name;
    user.active = active;
    user.admin  = admin;
  } else {
    const newId = 'usr' + String(db.users.length + 1).padStart(3, '0');
    db.users.push({
      id: newId,
      name,
      password: name.toLowerCase().replace(/\s/g, ''),
      active,
      admin
    });
  }

  alertEl.innerHTML = '';
  renderUsersTable();
  document.getElementById('confirmMsg').textContent = `User "${name}" saved successfully.`;
  nav('confirmation');
}

function clearUserForm() {
  document.getElementById('umName').value     = '';
  document.getElementById('umId').value       = '';
  document.getElementById('umActive').checked  = true;
  document.getElementById('umAdmin').checked   = false;
  document.getElementById('userMgmtAlert').innerHTML = '';
}

function renderUsersTable() {
  const body = document.getElementById('usersTableBody');
  body.innerHTML = db.users.map(u => `
    <tr>
      <td><span class="code-mono">${u.id}</span></td>
      <td><strong>${u.name}</strong></td>
      <td><span class="badge ${u.admin ? 'badge-amber' : 'badge-blue'}">${u.admin ? '⭐ Admin' : 'User'}</span></td>
      <td><span class="badge ${u.active ? 'badge-green' : 'badge-red'}">${u.active ? 'Active' : 'Inactive'}</span></td>
    </tr>`).join('');
}
