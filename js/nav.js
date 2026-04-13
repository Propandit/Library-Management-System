/* ================================================================
   js/nav.js — Navigation & Routing Module
   Maps page keys to HTML element IDs and triggers data refresh.
   ================================================================ */

const pageMap = {
  home:             'pg-home',
  bookAvail:        'pg-bookAvail',
  bookIssue:        'pg-bookIssue',
  returnBook:       'pg-returnBook',
  payFine:          'pg-payFine',
  rptBooks:         'pg-rptBooks',
  rptMovies:        'pg-rptMovies',
  rptMembers:       'pg-rptMembers',
  rptActive:        'pg-rptActive',
  rptOverdue:       'pg-rptOverdue',
  rptRequests:      'pg-rptRequests',
  addMembership:    'pg-addMembership',
  updateMembership: 'pg-updateMembership',
  addBook:          'pg-addBook',
  updateBook:       'pg-updateBook',
  userMgmt:         'pg-userMgmt',
  confirmation:     'pg-confirmation',
  cancel:           'pg-cancel',
};

/* ── NAV LABEL MAP for breadcrumb ── */
const pageLabels = {
  home: 'Dashboard', bookAvail: 'Book Availability', bookIssue: 'Issue Book',
  returnBook: 'Return Book', payFine: 'Pay Fine',
  rptBooks: 'Books List', rptMovies: 'Movies List', rptMembers: 'Memberships',
  rptActive: 'Active Issues', rptOverdue: 'Overdue Returns', rptRequests: 'Issue Requests',
  addMembership: 'Add Membership', updateMembership: 'Update Membership',
  addBook: 'Add Book/Movie', updateBook: 'Update Book/Movie', userMgmt: 'User Management',
  confirmation: 'Done', cancel: 'Cancelled',
};

function nav(key) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pg = document.getElementById(pageMap[key]);
  if (pg) pg.classList.add('active');

  // Highlight matching nav button
  document.querySelectorAll('.nav-item').forEach(btn => {
    const onclick = btn.getAttribute('onclick') || '';
    if (onclick.includes(`'${key}'`)) btn.classList.add('active');
  });

  const refreshMap = {
    home:        updateStats,
    bookAvail:   populateSearchDropdowns,
    bookIssue:   populateIssueForm,
    returnBook:  populateReturnForm,
    updateBook:  populateUpdateBookForm,
    rptBooks:    renderBooksTable,
    rptMovies:   renderMoviesTable,
    rptMembers:  renderMembersTable,
    rptActive:   renderActiveIssues,
    rptOverdue:  renderOverdue,
    rptRequests: renderRequests,
    userMgmt:    renderUsersTable,
  };
  if (refreshMap[key]) refreshMap[key]();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
