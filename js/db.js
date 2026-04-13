/* ================================================================
   js/db.js — In-Memory Data Store
   Central data store shared across all modules.
   ================================================================ */

const db = {

  /* ── USERS ── */
  users: [
    { id: 'adm',  name: 'Admin',      password: 'adm',  active: true, admin: true  },
    { id: 'user', name: 'Librarian',  password: 'user', active: true, admin: false },
  ],

  /* ── BOOKS & MOVIES ── */
  books: [
    { serial: 'SC-B-000001', name: 'Physics Fundamentals',           author: 'H.C. Verma',           category: 'Science',              type: 'book',  status: 'Available', cost: 450, procured: '2023-01-10' },
    { serial: 'SC-B-000002', name: 'Chemistry Today',                author: 'R.K. Gupta',            category: 'Science',              type: 'book',  status: 'Issued',    cost: 380, procured: '2023-02-15' },
    { serial: 'EC-B-000001', name: 'Principles of Economics',        author: 'N. Gregory Mankiw',     category: 'Economics',            type: 'book',  status: 'Available', cost: 620, procured: '2022-11-20' },
    { serial: 'FC-B-000001', name: 'The Great Gatsby',               author: 'F. Scott Fitzgerald',   category: 'Fiction',              type: 'book',  status: 'Available', cost: 299, procured: '2023-03-05' },
    { serial: 'FC-B-000002', name: '1984',                           author: 'George Orwell',         category: 'Fiction',              type: 'book',  status: 'Available', cost: 320, procured: '2023-01-25' },
    { serial: 'CH-B-000001', name: "Harry Potter & Sorcerer's Stone",author: 'J.K. Rowling',          category: 'Children',             type: 'book',  status: 'Issued',    cost: 550, procured: '2022-12-01' },
    { serial: 'PD-B-000001', name: 'Atomic Habits',                  author: 'James Clear',           category: 'Personal Development', type: 'book',  status: 'Available', cost: 399, procured: '2023-04-10' },
    { serial: 'SC-M-000001', name: 'Interstellar',                   author: 'Christopher Nolan',     category: 'Science',              type: 'movie', status: 'Available', cost: 250, procured: '2023-05-01' },
    { serial: 'FC-M-000001', name: 'Inception',                      author: 'Christopher Nolan',     category: 'Fiction',              type: 'movie', status: 'Available', cost: 220, procured: '2023-05-01' },
    { serial: 'CH-M-000001', name: 'The Lion King',                  author: 'Roger Allers',          category: 'Children',             type: 'movie', status: 'Issued',    cost: 200, procured: '2023-03-15' },
  ],

  /* ── MEMBERS ── */
  members: [
    { id: 'MEM-001', firstName: 'Rahul', lastName: 'Sharma', contact: '9876543210', address: '123 MG Road, Delhi',   aadhar: '1234-5678-9012', start: '2024-01-01', end: '2024-12-31', status: 'Active',   fine: 0  },
    { id: 'MEM-002', firstName: 'Priya', lastName: 'Patel',  contact: '9123456789', address: '45 Park St, Mumbai',   aadhar: '9876-5432-1098', start: '2024-03-01', end: '2025-02-28', status: 'Active',   fine: 0  },
    { id: 'MEM-003', firstName: 'Arjun', lastName: 'Singh',  contact: '9012345678', address: '78 Nehru Nagar, Pune', aadhar: '4567-8901-2345', start: '2023-06-01', end: '2024-05-31', status: 'Inactive', fine: 50 },
  ],

  /* ── ISSUE RECORDS ── */
  issues: [
    { serial: 'SC-B-000002', name: 'Chemistry Today',                 author: 'R.K. Gupta',    memberId: 'MEM-001', issueDate: '2024-12-01', returnDate: '2024-12-16', returned: false, fineCalc: 0   },
    { serial: 'CH-B-000001', name: "Harry Potter & Sorcerer's Stone", author: 'J.K. Rowling',  memberId: 'MEM-002', issueDate: '2024-12-05', returnDate: '2024-12-20', returned: false, fineCalc: 0   },
    { serial: 'CH-M-000001', name: 'The Lion King',                   author: 'Roger Allers',  memberId: 'MEM-001', issueDate: '2024-11-15', returnDate: '2024-11-30', returned: false, fineCalc: 150 },
  ]
};
