const router = require('express').Router();
const { readCollection } = require('../db');
const { auth } = require('../middleware/auth');

const CO_MAP = {
  q1a:'CO1', q1b:'CO3', q1c:'CO2', q1d:'CO2', q1e:'CO3',
  q2a:'CO2', q2b:'CO4', q2c:'CO2', q2d:'CO3', q2e:'CO4', q2f:'CO1'
};
const Q_MAX = { q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2.5,q2f:2.5 };

function calcCO(student) {
  const co = {CO1:0,CO2:0,CO3:0,CO4:0,CO5:0};
  const coMax = {CO1:0,CO2:0,CO3:0,CO4:0,CO5:0};
  for (const [q, coName] of Object.entries(CO_MAP)) {
    const mark = (student.q || {})[q] ?? 0;
    co[coName] = (co[coName]||0) + mark;
    coMax[coName] = (coMax[coName]||0) + Q_MAX[q];
  }
  const pct = {};
  for (const c of Object.keys(co)) {
    pct[c] = coMax[c] > 0 ? Math.round((co[c]/coMax[c])*100) : 0;
  }
  return { raw: co, max: coMax, pct };
}

// GET dashboard summary
router.get('/summary', auth(['admin','teacher']), (req, res) => {
  const students = readCollection('students');
  const present = students.filter(s => !s.absent && s.total !== null);
  const totals = present.map(s => s.total);
  const avg = totals.length ? (totals.reduce((a,b)=>a+b,0)/totals.length).toFixed(1) : 0;
  const passing = totals.filter(t => (t/30)*100 >= 60).length;

  // Distribution bins
  const bins = [0,0,0,0,0];
  totals.forEach(t => {
    if (t < 18) bins[0]++;
    else if (t < 21) bins[1]++;
    else if (t < 24) bins[2]++;
    else if (t < 27) bins[3]++;
    else bins[4]++;
  });

  res.json({
    total: students.length,
    present: present.length,
    absent: students.filter(s => s.absent).length,
    avg: parseFloat(avg),
    passing,
    passRate: present.length ? Math.round((passing/present.length)*100) : 0,
    topScore: totals.length ? Math.max(...totals) : 0,
    distribution: { labels: ['<18','18-20','21-23','24-26','27-30'], data: bins }
  });
});

// GET CO analysis
router.get('/co', auth(['admin','teacher']), (req, res) => {
  const students = readCollection('students').filter(s => !s.absent && s.total !== null);
  const cos = ['CO1','CO2','CO3','CO4','CO5'];
  const result = {};
  for (const co of cos) {
    const scores = students.map(s => calcCO(s).pct[co]);
    const passing = scores.filter(x => x >= 50).length;
    result[co] = {
      avg: Math.round(scores.reduce((a,b)=>a+b,0)/scores.length),
      passing,
      passPct: Math.round((passing/scores.length)*100),
      total: students.length
    };
  }

  // Question-level
  const qData = {};
  for (const [q, coName] of Object.entries(CO_MAP)) {
    const scores = students.map(s => (s.q||{})[q] ?? 0);
    const avg = scores.reduce((a,b)=>a+b,0)/scores.length;
    qData[q] = { co: coName, max: Q_MAX[q], avg: Math.round(avg*100)/100, pct: Math.round((avg/Q_MAX[q])*100) };
  }

  res.json({ coStats: result, qData });
});

// GET toppers
router.get('/toppers', auth(['admin','teacher']), (req, res) => {
  const { limit = 10 } = req.query;
  const students = readCollection('students')
    .filter(s => !s.absent && s.total !== null)
    .sort((a,b) => b.total - a.total)
    .slice(0, +limit)
    .map((s,i) => ({ ...s, rank: i+1, coScores: calcCO(s).pct }));
  res.json(students);
});

// GET at-risk
router.get('/at-risk', auth(['admin','teacher']), (req, res) => {
  const students = readCollection('students')
    .filter(s => !s.absent && s.total !== null && (s.total/30)*100 < 60)
    .sort((a,b) => a.total - b.total)
    .map(s => {
      const co = calcCO(s).pct;
      const weakCOs = Object.entries(co).filter(([,v]) => v < 50).map(([k]) => k);
      return { ...s, coScores: co, weakCOs };
    });
  res.json(students);
});

// GET single student analytics (student can access own)
router.get('/student/:reg', auth(), (req, res) => {
  const { reg } = req.params;
  if (req.user.role === 'student' && req.user.reg !== reg) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const s = readCollection('students').find(s => s.reg === reg);
  if (!s) return res.status(404).json({ error: 'Not found' });

  const all = readCollection('students').filter(x => !x.absent && x.total !== null);
  const rank = all.sort((a,b) => b.total - a.total).findIndex(x => x.reg === reg) + 1;
  const classCoStats = {};
  for (const co of ['CO1','CO2','CO3','CO4','CO5']) {
    const scores = all.map(x => calcCO(x).pct[co]);
    classCoStats[co] = Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
  }

  res.json({ student: s, coScores: calcCO(s).pct, rank, totalStudents: all.length, classCoAvg: classCoStats });
});

// GET audit log (admin only)
router.get('/audit', auth(['admin']), (req, res) => {
  const audit = readCollection('audit').reverse().slice(0, 100);
  res.json(audit);
});

module.exports = router;
