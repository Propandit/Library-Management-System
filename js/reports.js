/* ================================================================
   js/reports.js — Reports Module
   Renders all 6 report pages.
   ================================================================ */

/* ── UTILITY: Empty state HTML ── */
function emptyRow(cols, msg = 'No records found.', icon = '📋') {
  return `<tr><td colspan="${cols}">
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <p>${msg}</p>
    </div>
  </td></tr>`;
}

/* ════════════════════════════════════════════════
   1. MASTER LIST OF BOOKS
   ════════════════════════════════════════════════ */
function renderBooksTable() {
  const filter = (document.getElementById('filterBooks').value || '').toLowerCase();
  const body   = document.getElementById('booksTableBody');

  const items = db.books.filter(b =>
    b.type === 'book' && (!filter ||
      b.name.toLowerCase().includes(filter) ||
      b.author.toLowerCase().includes(filter) ||
      b.category.toLowerCase().includes(filter))
  );

  body.innerHTML = items.length
    ? items.map(b => `
        <tr>
          <td><span class="code-mono">${b.serial}</span></td>
          <td><strong>${b.name}</strong></td>
          <td>${b.author}</td>
          <td>${b.category}</td>
          <td><span class="badge ${b.status === 'Available' ? 'badge-green' : 'badge-amber'}">${b.status}</span></td>
          <td>₹${b.cost}</td>
          <td>${b.procured}</td>
        </tr>`).join('')
    : emptyRow(7, 'No books found matching your search.', '📚');
}

/* ════════════════════════════════════════════════
   2. MASTER LIST OF MOVIES
   ════════════════════════════════════════════════ */
function renderMoviesTable() {
  const filter = (document.getElementById('filterMovies').value || '').toLowerCase();
  const body   = document.getElementById('moviesTableBody');

  const items = db.books.filter(b =>
    b.type === 'movie' && (!filter ||
      b.name.toLowerCase().includes(filter) ||
      b.author.toLowerCase().includes(filter))
  );

  body.innerHTML = items.length
    ? items.map(b => `
        <tr>
          <td><span class="code-mono">${b.serial}</span></td>
          <td><strong>${b.name}</strong></td>
          <td>${b.author}</td>
          <td>${b.category}</td>
          <td><span class="badge ${b.status === 'Available' ? 'badge-green' : 'badge-amber'}">${b.status}</span></td>
          <td>₹${b.cost}</td>
          <td>${b.procured}</td>
        </tr>`).join('')
    : emptyRow(7, 'No movies found matching your search.', '🎬');
}

/* ════════════════════════════════════════════════
   3. MASTER LIST OF MEMBERSHIPS
   ════════════════════════════════════════════════ */
function renderMembersTable() {
  const filter = (document.getElementById('filterMembers').value || '').toLowerCase();
  const body   = document.getElementById('membersTableBody');

  const items = db.members.filter(m =>
    !filter ||
    m.firstName.toLowerCase().includes(filter) ||
    m.lastName.toLowerCase().includes(filter)  ||
    m.id.toLowerCase().includes(filter)
  );

  body.innerHTML = items.length
    ? items.map(m => `
        <tr>
          <td><span class="code-mono">${m.id}</span></td>
          <td><strong>${m.firstName} ${m.lastName}</strong></td>
          <td>${m.contact}</td>
          <td style="max-width:150px;font-size:12px">${m.address}</td>
          <td>${m.aadhar}</td>
          <td>${m.start}</td>
          <td>${m.end}</td>
          <td><span class="badge ${m.status === 'Active' ? 'badge-green' : 'badge-red'}">${m.status}</span></td>
          <td>${m.fine > 0 ? `<span class="badge badge-red">₹${m.fine}</span>` : '<span style="color:var(--muted2)">—</span>'}</td>
        </tr>`).join('')
    : emptyRow(9, 'No members found matching your search.', '👥');
}

/* ════════════════════════════════════════════════
   4. ACTIVE ISSUES
   ════════════════════════════════════════════════ */
function renderActiveIssues() {
  const body  = document.getElementById('activeIssuesBody');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const items = db.issues.filter(i => !i.returned);

  body.innerHTML = items.length
    ? items.map(i => {
        const due      = new Date(i.returnDate); due.setHours(0, 0, 0, 0);
        const overdue  = due < today;
        const daysLeft = Math.ceil((due - today) / 86400000);
        return `<tr>
          <td><span class="code-mono">${i.serial}</span></td>
          <td><strong>${i.name}</strong></td>
          <td><span class="code-mono">${i.memberId}</span></td>
          <td>${i.issueDate}</td>
          <td>${i.returnDate}</td>
          <td>${overdue
            ? `<span class="badge badge-red">Overdue</span>`
            : `<span class="badge badge-green">${daysLeft}d left</span>`}</td>
        </tr>`;
      }).join('')
    : emptyRow(6, 'No active issues at the moment. 🎉', '✅');
}

/* ════════════════════════════════════════════════
   5. OVERDUE RETURNS
   ════════════════════════════════════════════════ */
function renderOverdue() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const body  = document.getElementById('overdueBody');
  const items = db.issues.filter(i => !i.returned && new Date(i.returnDate) < today);

  body.innerHTML = items.length
    ? items.map(i => {
        const due  = new Date(i.returnDate); due.setHours(0, 0, 0, 0);
        const days = Math.floor((today - due) / 86400000);
        return `<tr>
          <td><span class="code-mono">${i.serial}</span></td>
          <td><strong>${i.name}</strong></td>
          <td><span class="code-mono">${i.memberId}</span></td>
          <td>${i.issueDate}</td>
          <td>${i.returnDate}</td>
          <td><span class="badge badge-red">${days} day${days !== 1 ? 's' : ''}</span></td>
          <td><strong style="color:var(--red)">₹${days * 5}</strong></td>
        </tr>`;
      }).join('')
    : emptyRow(7, 'No overdue returns. All books returned on time! 🎉', '⏰');
}

/* ════════════════════════════════════════════════
   6. ISSUE REQUESTS (Full history log)
   ════════════════════════════════════════════════ */
function renderRequests() {
  const body = document.getElementById('requestsBody');

  body.innerHTML = db.issues.length
    ? db.issues.map(i => `
        <tr>
          <td><span class="code-mono">${i.memberId}</span></td>
          <td><strong>${i.name}</strong></td>
          <td>${i.issueDate}</td>
          <td>${i.returned ? i.returnDate : '<span style="color:var(--muted2)">—</span>'}</td>
          <td><span class="badge ${i.returned ? 'badge-green' : 'badge-blue'}">${i.returned ? 'Returned' : 'Active'}</span></td>
        </tr>`).join('')
    : emptyRow(5, 'No issue requests recorded yet.', '📋');
}
