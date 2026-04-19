const router = require('express').Router();
const { readCollection, findOne, update, remove, writeCollection } = require('../db');
const { auth } = require('../middleware/auth');

// GET all students (admin/teacher)
router.get('/', auth(['admin', 'teacher']), (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  let students = readCollection('students');
  if (search) {
    const q = search.toLowerCase();
    students = students.filter(s =>
      s.name.toLowerCase().includes(q) || s.reg.toLowerCase().includes(q)
    );
  }
  const total = students.length;
  const paginated = students.slice((page - 1) * limit, page * limit);
  res.json({ students: paginated, total, page: +page, limit: +limit });
});

// GET single student
router.get('/:reg', auth(), (req, res) => {
  const { reg } = req.params;
  // Students can only view their own record
  if (req.user.role === 'student' && req.user.reg !== reg) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const student = findOne('students', s => s.reg === reg);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

// PUT update student marks (admin/teacher only)
router.put('/:reg', auth(['admin', 'teacher']), (req, res) => {
  const { reg } = req.params;
  const student = findOne('students', s => s.reg === reg);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const allowed = ['midSem', 'quiz', 'assign', 'attend', 'q', 'absent'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  // Recalculate total
  if (updates.midSem !== undefined || updates.quiz !== undefined || updates.assign !== undefined) {
    const mid = updates.midSem ?? student.midSem ?? 0;
    const quiz = updates.quiz ?? student.quiz ?? 0;
    const assign = updates.assign ?? student.assign ?? 0;
    updates.total = (mid || 0) + (quiz || 0) + (assign || 0);
  }
  updates.updatedAt = new Date().toISOString();
  updates.updatedBy = req.user.username;

  const updated = update('students', reg, updates);

  // Audit
  const audit = readCollection('audit');
  audit.push({ action: 'UPDATE_STUDENT', user: req.user.username, target: reg, time: new Date().toISOString() });
  writeCollection('audit', audit.slice(-500));

  res.json(updated);
});

// DELETE student (admin only)
router.delete('/:reg', auth(['admin']), (req, res) => {
  const { reg } = req.params;
  const ok = remove('students', reg);
  if (!ok) return res.status(404).json({ error: 'Student not found' });

  const audit = readCollection('audit');
  audit.push({ action: 'DELETE_STUDENT', user: req.user.username, target: reg, time: new Date().toISOString() });
  writeCollection('audit', audit.slice(-500));

  res.json({ message: 'Student deleted' });
});

module.exports = router;
