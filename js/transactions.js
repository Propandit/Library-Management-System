/* ================================================================
   js/transactions.js — Transactions Module
   Covers: Book Availability Search, Issue Book, Return Book, Pay Fine
   ================================================================ */

let pendingReturn = null;

/* ── UTILITY: Fine Calculation ₹5/day ── */
function calcFineAmt(returnDate, actual) {
  const due = new Date(returnDate); due.setHours(0, 0, 0, 0);
  const now = actual ? new Date(actual) : new Date(); now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now - due) / 86400000);
  return diff > 0 ? diff * 5 : 0;
}

/* ── DASHBOARD STATS ── */
function updateStats() {
  document.getElementById('statBooks').textContent   = db.books.filter(b => b.type === 'book').length;
  document.getElementById('statMovies').textContent  = db.books.filter(b => b.type === 'movie').length;
  document.getElementById('statMembers').textContent = db.members.filter(m => m.status === 'Active').length;

  const active = db.issues.filter(i => !i.returned);
  document.getElementById('statIssued').textContent  = active.length;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const overdue = active.filter(i => new Date(i.returnDate) < today);
  document.getElementById('statOverdue').textContent = overdue.length;

  const totalFine = active.reduce((sum, i) => sum + calcFineAmt(i.returnDate), 0);
  document.getElementById('statFines').textContent   = '₹' + totalFine;

  // Animate stat values
  document.querySelectorAll('.stat-val').forEach(el => {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'statPop 0.4s ease';
  });
}

/* ── INIT FORMS: Set today's date ── */
function initForms() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('issueDate').value = today;
  document.getElementById('issueDate').min   = today;

  const ret = new Date();
  ret.setDate(ret.getDate() + 15);
  document.getElementById('issueReturn').value = ret.toISOString().split('T')[0];

  document.getElementById('mStart').value = today;
}

/* ════════════════════════════════════════════════
   1. BOOK AVAILABILITY
   ════════════════════════════════════════════════ */
function populateSearchDropdowns() {
  const nameEl = document.getElementById('searchName');
  const authEl = document.getElementById('searchAuthor');
  nameEl.innerHTML = '<option value="">— Select or type —</option>';
  authEl.innerHTML = '<option value="">— Select or type —</option>';

  [...new Set(db.books.map(b => b.name))].sort()
    .forEach(n => nameEl.innerHTML += `<option>${n}</option>`);
  [...new Set(db.books.map(b => b.author))].sort()
    .forEach(a => authEl.innerHTML += `<option>${a}</option>`);
}

function searchBooks() {
  const name    = document.getElementById('searchName').value.toLowerCase();
  const auth    = document.getElementById('searchAuthor').value.toLowerCase();
  const alertEl = document.getElementById('availAlert');

  if (!name && !auth) {
    alertEl.innerHTML = '<div class="alert alert-error">⚠ Please select a book name or author before searching.</div>';
    return;
  }
  alertEl.innerHTML = '';

  const results = db.books.filter(b =>
    (!name || b.name.toLowerCase().includes(name)) &&
    (!auth || b.author.toLowerCase().includes(auth))
  );

  const body = document.getElementById('searchResultsBody');
  if (!results.length) {
    body.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">🔍</div><p>No results found for your search.</p></div></td></tr>`;
  } else {
    body.innerHTML = results.map(b => {
      const avail = b.status === 'Available';
      return `<tr>
        <td><strong>${b.name}</strong></td>
        <td>${b.author}</td>
        <td><span class="code-mono">${b.serial}</span></td>
        <td>${b.category}</td>
        <td><span class="badge ${avail ? 'badge-green' : 'badge-amber'}">${b.status}</span></td>
        <td>${avail
          ? `<input type="radio" name="selectBook" value="${b.serial}" style="accent-color:var(--amber);width:17px;height:17px;cursor:pointer" />`
          : '<span style="color:var(--muted2);font-size:12px">Unavailable</span>'}</td>
      </tr>`;
    }).join('');
  }

  document.getElementById('searchResultsCard').style.display = 'block';
}

function clearSearch() {
  document.getElementById('searchName').value       = '';
  document.getElementById('searchAuthor').value     = '';
  document.getElementById('availAlert').innerHTML   = '';
  document.getElementById('searchResultsCard').style.display = 'none';
}

function issueSelected() {
  const sel = document.querySelector('input[name="selectBook"]:checked');
  if (!sel) {
    document.getElementById('availAlert').innerHTML = '<div class="alert alert-error">⚠ Please select a book to issue.</div>';
    return;
  }
  const book = db.books.find(b => b.serial === sel.value);
  nav('bookIssue');
  setTimeout(() => {
    document.getElementById('issueName').value = book.serial;
    document.getElementById('issueName').dispatchEvent(new Event('change'));
  }, 120);
}

/* ════════════════════════════════════════════════
   2. ISSUE BOOK
   ════════════════════════════════════════════════ */
function populateIssueForm() {
  const nameEl = document.getElementById('issueName');
  nameEl.innerHTML = '<option value="">— Select book or movie —</option>';
  db.books.filter(b => b.status === 'Available')
    .forEach(b => nameEl.innerHTML += `<option value="${b.serial}">${b.name} (${b.type})</option>`);

  nameEl.onchange = () => {
    const book = db.books.find(x => x.serial === nameEl.value);
    document.getElementById('issueAuthor').value = book ? book.author : '';
    document.getElementById('issueSerial').value = book ? book.serial : '';
  };

  const memberEl = document.getElementById('issueMember');
  memberEl.innerHTML = '<option value="">— Select member —</option>';
  db.members.filter(m => m.status === 'Active')
    .forEach(m => memberEl.innerHTML += `<option value="${m.id}">${m.id} – ${m.firstName} ${m.lastName}</option>`);
}

function submitIssue() {
  const alertEl    = document.getElementById('issueAlert');
  const serial     = document.getElementById('issueName').value;
  const memberId   = document.getElementById('issueMember').value;
  const issueDate  = document.getElementById('issueDate').value;
  const returnDate = document.getElementById('issueReturn').value;

  if (!serial || !memberId || !issueDate || !returnDate) {
    alertEl.innerHTML = '<div class="alert alert-error">⚠ All required fields must be filled in before submitting.</div>';
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  if (issueDate < today) {
    alertEl.innerHTML = '<div class="alert alert-error">⚠ Issue Date cannot be earlier than today.</div>';
    return;
  }

  const maxRet = new Date(issueDate);
  maxRet.setDate(maxRet.getDate() + 15);
  if (new Date(returnDate) > maxRet) {
    alertEl.innerHTML = '<div class="alert alert-error">⚠ Return Date cannot be more than 15 days from Issue Date.</div>';
    return;
  }

  const book = db.books.find(b => b.serial === serial);
  book.status = 'Issued';
  db.issues.push({ serial: book.serial, name: book.name, author: book.author, memberId, issueDate, returnDate, returned: false, fineCalc: 0 });

  alertEl.innerHTML = '';
  document.getElementById('confirmMsg').textContent = `"${book.name}" has been successfully issued to member ${memberId}.`;
  nav('confirmation');
}

function clearIssueForm() {
  document.getElementById('issueAlert').innerHTML  = '';
  document.getElementById('issueName').value       = '';
  document.getElementById('issueAuthor').value     = '';
  document.getElementById('issueSerial').value     = '';
  document.getElementById('issueMember').value     = '';
  document.getElementById('issueRemarks').value    = '';
}

/* ════════════════════════════════════════════════
   3. RETURN BOOK
   ════════════════════════════════════════════════ */
function populateReturnForm() {
  const active = db.issues.filter(i => !i.returned);
  const nameEl = document.getElementById('returnName');
  nameEl.innerHTML = '<option value="">— Select book or movie —</option>';
  [...new Set(active.map(i => i.name))].forEach(n => nameEl.innerHTML += `<option>${n}</option>`);

  nameEl.onchange = () => {
    const issue = active.find(i => i.name === nameEl.value);
    document.getElementById('returnAuthor').value = issue ? issue.author : '';

    const serialEl = document.getElementById('returnSerial');
    serialEl.innerHTML = '<option value="">— Select serial —</option>';
    active.filter(i => i.name === nameEl.value)
      .forEach(i => serialEl.innerHTML += `<option value="${i.serial}">${i.serial}</option>`);

    serialEl.onchange = () => {
      const iss = active.find(i => i.serial === serialEl.value && i.name === nameEl.value);
      document.getElementById('returnIssueDate').value = iss ? iss.issueDate  : '';
      document.getElementById('returnDate').value      = iss ? iss.returnDate : '';
    };
  };
}

function submitReturn() {
  const alertEl = document.getElementById('returnAlert');
  const name    = document.getElementById('returnName').value;
  const serial  = document.getElementById('returnSerial').value;
  const retDate = document.getElementById('returnDate').value;

  if (!name || !serial) {
    alertEl.innerHTML = '<div class="alert alert-error">⚠ Book name and serial number are required.</div>';
    return;
  }

  const issue = db.issues.find(i => i.name === name && i.serial === serial && !i.returned);
  if (!issue) {
    alertEl.innerHTML = '<div class="alert alert-error">⚠ No active issue found for this book/serial combination.</div>';
    return;
  }

  pendingReturn = { issue, actualReturn: retDate || new Date().toISOString().split('T')[0] };

  document.getElementById('fineName').value       = issue.name;
  document.getElementById('fineAuthor').value     = issue.author;
  document.getElementById('fineSerial').value     = issue.serial;
  document.getElementById('fineMember').value     = issue.memberId;
  document.getElementById('fineIssueDate').value  = issue.issueDate;
  document.getElementById('fineReturnDate').value = issue.returnDate;
  document.getElementById('fineActualDate').value = pendingReturn.actualReturn;
  document.getElementById('finePaid').checked     = false;
  document.getElementById('fineRemarks').value    = '';
  calcFineDisplay();
  nav('payFine');
}

function clearReturnForm() {
  document.getElementById('returnAlert').innerHTML   = '';
  document.getElementById('returnName').value        = '';
  document.getElementById('returnAuthor').value      = '';
  document.getElementById('returnSerial').innerHTML  = '<option value="">— Select serial —</option>';
  document.getElementById('returnIssueDate').value   = '';
  document.getElementById('returnDate').value        = '';
}

/* ════════════════════════════════════════════════
   4. PAY FINE
   ════════════════════════════════════════════════ */
function calcFineDisplay() {
  const returnDate = document.getElementById('fineReturnDate').value;
  const actual     = document.getElementById('fineActualDate').value;
  const fine       = calcFineAmt(returnDate, actual);
  document.getElementById('fineCalc').value          = fine;
  document.getElementById('fineDisplay').textContent = '₹ ' + fine;
  document.getElementById('fineDays').textContent    = fine > 0
    ? `(${Math.round(fine / 5)} day${fine > 5 ? 's' : ''} overdue × ₹5/day)`
    : '(No overdue)';
}

function calcFine() { calcFineDisplay(); }

function confirmFine() {
  const alertEl = document.getElementById('fineAlert');
  const fine    = parseInt(document.getElementById('fineCalc').value) || 0;
  const paid    = document.getElementById('finePaid').checked;

  if (fine > 0 && !paid) {
    alertEl.innerHTML = '<div class="alert alert-error">⚠ A fine is pending. Please check "Fine Paid" to complete the return.</div>';
    return;
  }

  if (!pendingReturn) { nav('returnBook'); return; }

  pendingReturn.issue.returned = true;
  const book = db.books.find(b => b.serial === pendingReturn.issue.serial);
  if (book) book.status = 'Available';
  pendingReturn = null;

  alertEl.innerHTML = '';
  document.getElementById('confirmMsg').textContent = 'Book returned successfully. Fine has been collected.';
  nav('confirmation');
}
