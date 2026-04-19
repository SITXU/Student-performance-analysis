const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'data', 'spars.db');

// We'll use a simple JSON-file-based DB approach since better-sqlite3 failed native build
// This is a lightweight local DB using JSON files
const DATA_DIR = path.join(__dirname, 'data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readCollection(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeCollection(name, data) {
  ensureDir();
  const file = path.join(DATA_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function findOne(collection, predicate) {
  return readCollection(collection).find(predicate) || null;
}

function findAll(collection, predicate) {
  const data = readCollection(collection);
  return predicate ? data.filter(predicate) : data;
}

function insert(collection, record) {
  const data = readCollection(collection);
  const existing = data.find(r => r.id === record.id);
  if (!existing) {
    data.push(record);
    writeCollection(collection, data);
  }
  return record;
}

function update(collection, id, updates) {
  const data = readCollection(collection);
  const idx = data.findIndex(r => r.id === id);
  if (idx === -1) return null;
  data[idx] = { ...data[idx], ...updates };
  writeCollection(collection, data);
  return data[idx];
}

function remove(collection, id) {
  const data = readCollection(collection);
  const filtered = data.filter(r => r.id !== id);
  writeCollection(collection, filtered);
  return filtered.length < data.length;
}

// ===== STUDENT DATA =====
const STUDENTS_DATA = [
  {sl:1,name:"SHARVANI SUCHITA MEHER",reg:"2211100123",midSem:17,quiz:5,assign:4,attend:0,total:26,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2,q2b:2.5,q2c:2.5,q2d:2,q2e:2,q2f:0}},
  {sl:2,name:"RAJESH KUMAR JENA",reg:"2211100124",midSem:18,quiz:5,assign:5,attend:0,total:28,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2,q2d:2,q2e:2.5,q2f:1.5}},
  {sl:3,name:"SURYAKANTA PRIYADARSHI",reg:"2211100126",midSem:14,quiz:5,assign:5,attend:0,total:24,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:1.5,q2c:1.5,q2d:2,q2e:1.5,q2f:0}},
  {sl:4,name:"SNEHA DASGUPTA",reg:"2211100127",midSem:16,quiz:5,assign:4,attend:0,total:25,q:{q1a:1,q1b:1,q1c:0.5,q1d:0.5,q1e:1,q2a:2.5,q2b:2.5,q2c:2,q2d:2,q2e:2,q2f:1}},
  {sl:5,name:"ADITYA MOHATY",reg:"2211100128",midSem:13,quiz:5,assign:4,attend:0,total:22,q:{q1a:1,q1b:1,q1c:0,q1d:1,q1e:1,q2a:0,q2b:1,q2c:2,q2d:2,q2e:2,q2f:2}},
  {sl:6,name:"AYUSHA PATTNAIK",reg:"2211100129",midSem:20,quiz:5,assign:5,attend:0,total:30,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2.5,q2f:2.5}},
  {sl:7,name:"SMARANIKA MANASWINI",reg:"2211100130",midSem:16,quiz:5,assign:5,attend:0,total:26,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:1.5,q2c:2,q2d:2.5,q2e:2.5,q2f:1.5}},
  {sl:8,name:"AKANKSHA SAHANI",reg:"2211100131",midSem:19,quiz:5,assign:5,attend:0,total:29,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2,q2d:2.5,q2e:2.5,q2f:2.5}},
  {sl:9,name:"RAHUL KUMAR SAHOO",reg:"2211100132",midSem:17,quiz:5,assign:4,attend:0,total:26,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2,q2d:1.5,q2e:1.5,q2f:2}},
  {sl:10,name:"JAYKRISHNA PATRA",reg:"2211100135",midSem:20,quiz:4,assign:5,attend:0,total:29,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2.5,q2f:2.5}},
  {sl:11,name:"N SANKAR",reg:"2211100136",midSem:20,quiz:5,assign:5,attend:0,total:30,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2.5,q2f:2.5}},
  {sl:12,name:"SWAPNIL KHADANGA",reg:"2211100137",midSem:17,quiz:5,assign:5,attend:0,total:27,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2,q2c:2,q2d:2.5,q2e:1.5,q2f:1.5}},
  {sl:13,name:"ABHIJIT BEHERA",reg:"2211100138",midSem:18,quiz:5,assign:5,attend:0,total:28,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2,q2d:2.5,q2e:2.5,q2f:1.5}},
  {sl:14,name:"SIDDHARTH RATH",reg:"2211100139",midSem:12,quiz:5,assign:5,attend:0,total:22,q:{q1a:1,q1b:1,q1c:0.5,q1d:1,q1e:0.5,q2a:2,q2b:2,q2c:1.5,q2d:1.5,q2e:1,q2f:0}},
  {sl:15,name:"PRATIK KUMAR CHAND",reg:"2211100140",midSem:18,quiz:5,assign:5,attend:0,total:28,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2,q2d:2.5,q2e:2,q2f:1.5}},
  {sl:16,name:"ARYAN ABHILESH",reg:"2211100141",midSem:11,quiz:5,assign:3,attend:0,total:19,q:{q1a:1,q1b:1,q1c:1,q1d:0.5,q1e:0.5,q2a:2,q2b:1.5,q2c:1,q2d:1.5,q2e:0,q2f:0}},
  {sl:17,name:"SUVENDU PRADHAN",reg:"2211100142",midSem:10,quiz:5,assign:3,attend:0,total:18,q:{q1a:0.5,q1b:0,q1c:0.5,q1d:0,q1e:1,q2a:2.5,q2b:1.5,q2c:1,q2d:1.5,q2e:1.5,q2f:0}},
  {sl:18,name:"SNEHASISH DHAL",reg:"2211100143",midSem:18,quiz:5,assign:5,attend:0,total:28,q:{q1a:1,q1b:1,q1c:1,q1d:0.5,q1e:1,q2a:2.5,q2b:2.5,q2c:1.5,q2d:2.5,q2e:2.5,q2f:2.5}},
  {sl:19,name:"PRIYANSU UPADHYAY",reg:"2211100144",midSem:17,quiz:5,assign:5,attend:0,total:27,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2,q2b:2.5,q2c:2,q2d:2.5,q2e:2,q2f:1}},
  {sl:20,name:"SHREEYANSHI MISHRA",reg:"2211100145",midSem:15,quiz:5,assign:5,attend:0,total:25,q:{q1a:1,q1b:0.5,q1c:1,q1d:1,q1e:1,q2a:2,q2b:1.5,q2c:2.5,q2d:1.5,q2e:1.5,q2f:1.5}},
  {sl:21,name:"SOUMYA RANJAN PANIGRAHI",reg:"2211100146",midSem:18,quiz:5,assign:5,attend:0,total:28,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2,q2b:2.5,q2c:2,q2d:2.5,q2e:2.5,q2f:1.5}},
  {sl:22,name:"SATYAJIT PANDA",reg:"2211100147",midSem:17,quiz:5,assign:4,attend:0,total:26,q:{q1a:1,q1b:0,q1c:1,q1d:0.5,q1e:1,q2a:2.5,q2b:2.5,q2c:2,q2d:2.5,q2e:2,q2f:1.5}},
  {sl:23,name:"SPANDAN MISHRA",reg:"2211100148",midSem:10,quiz:5,assign:4,attend:0,total:19,q:{q1a:0.5,q1b:0.5,q1c:0,q1d:1,q1e:0.5,q2a:2,q2b:2,q2c:2,q2d:0,q2e:1.5,q2f:0}},
  {sl:24,name:"SASWAT KUMAR DASH",reg:"2211100149",midSem:14,quiz:5,assign:4,attend:0,total:23,q:{q1a:1,q1b:1,q1c:1,q1d:0,q1e:1,q2a:2.5,q2b:2.5,q2c:2,q2d:2,q2e:1,q2f:0}},
  {sl:25,name:"RAKESH KUMAR PANDA",reg:"2211100150",midSem:19,quiz:5,assign:4,attend:0,total:28,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2,q2d:2.5,q2e:2.5,q2f:2}},
  {sl:26,name:"D NANDAKISHORE",reg:"2211100151",midSem:17,quiz:5,assign:5,attend:0,total:27,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2,q2c:1.5,q2d:2,q2e:2,q2f:2}},
  {sl:27,name:"BINAYAK GIRI",reg:"2211100153",midSem:16,quiz:5,assign:5,attend:0,total:26,q:{q1a:1,q1b:1,q1c:1,q1d:0,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2,q2e:1.5,q2f:1}},
  {sl:28,name:"ADITYA DEY",reg:"2211100154",midSem:16,quiz:5,assign:4,attend:0,total:25,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2,q2c:2,q2d:2.5,q2e:1,q2f:1}},
  {sl:29,name:"SASANKA SHEKHAR DASH",reg:"2211100155",midSem:15,quiz:5,assign:5,attend:0,total:25,q:{q1a:1,q1b:0.5,q1c:1,q1d:1,q1e:1,q2a:2,q2b:2,q2c:1,q2d:2,q2e:1,q2f:2}},
  {sl:30,name:"AMITESH SAHU",reg:"2211100156",midSem:16,quiz:5,assign:5,attend:0,total:26,q:{q1a:1,q1b:1,q1c:1,q1d:0.5,q1e:0.5,q2a:2.5,q2b:2,q2c:1.5,q2d:2.5,q2e:2,q2f:1.5}},
  {sl:31,name:"PRIONA PRITI PATTANAIK",reg:"2211100157",midSem:18,quiz:5,assign:5,attend:0,total:28,q:{q1a:1,q1b:1,q1c:0,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2,q2d:2.5,q2e:2,q2f:2.5}},
  {sl:32,name:"LAXMIDHAR SATAPATHY",reg:"2211100158",midSem:null,quiz:null,assign:null,attend:0,total:null,absent:true,q:{}},
  {sl:33,name:"SOUMYA RANJAN MOHANTY",reg:"2211100159",midSem:20,quiz:5,assign:5,attend:0,total:28,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2.5,q2f:2.5}},
  {sl:34,name:"ANUPAM SAHU",reg:"2211100160",midSem:15,quiz:5,assign:5,attend:0,total:25,q:{q1a:1,q1b:1,q1c:0,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:1.5,q2d:1.5,q2e:2,q2f:1}},
  {sl:35,name:"ABHIPSA SAHOO",reg:"2211100161",midSem:15,quiz:4,assign:5,attend:0,total:24,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2,q2c:1.5,q2d:2.5,q2e:1.5,q2f:0}},
  {sl:36,name:"NIRMALYA KAR",reg:"2211100162",midSem:19,quiz:5,assign:4,attend:0,total:28,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:0.5,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2,q2e:2.5,q2f:2.5}},
  {sl:37,name:"AYUSH DAS",reg:"2211100163",midSem:13,quiz:5,assign:2,attend:0,total:20,q:{q1a:0,q1b:1,q1c:0,q1d:0,q1e:1,q2a:2,q2b:2.5,q2c:2,q2d:2.5,q2e:2,q2f:0}},
  {sl:38,name:"NIGAMAHANSA SAMAL",reg:"2211100165",midSem:17,quiz:5,assign:5,attend:0,total:27,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:1.5,q2d:2,q2e:1.5,q2f:2}},
  {sl:39,name:"MONALISHA JENA",reg:"2211100166",midSem:19,quiz:5,assign:4,attend:0,total:28,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2,q2f:2}},
  {sl:40,name:"PRIYANKA DASH",reg:"2211100167",midSem:20,quiz:5,assign:5,attend:0,total:30,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2.5,q2f:2.5}},
  {sl:41,name:"KRISHNA KUMAR KHUNTIA",reg:"2211100168",midSem:14,quiz:5,assign:4,attend:0,total:23,q:{q1a:1,q1b:1,q1c:1,q1d:0.5,q1e:0.5,q2a:2,q2b:2,q2c:2,q2d:2,q2e:1,q2f:1}},
  {sl:42,name:"RASMIRANJAN NAYAK",reg:"2211100169",midSem:17,quiz:5,assign:4,attend:0,total:26,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2,q2b:2,q2c:2,q2d:2,q2e:2,q2f:2}},
  {sl:43,name:"AUROSRITA SWAIN",reg:"2211100170",midSem:20,quiz:5,assign:5,attend:0,total:30,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2.5,q2f:2.5}},
  {sl:44,name:"ANKITA PARIDA",reg:"2211100171",midSem:12,quiz:5,assign:4,attend:0,total:21,q:{q1a:1,q1b:1,q1c:0.5,q1d:0,q1e:0.5,q2a:2,q2b:2,q2c:1,q2d:1.5,q2e:1.5,q2f:1}},
  {sl:45,name:"KAILASH OJHA",reg:"2211100172",midSem:18,quiz:5,assign:4,attend:0,total:27,q:{q1a:1,q1b:1,q1c:1,q1d:0,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2,q2f:2}},
  {sl:46,name:"SURAJ KUMAR BASANTARA",reg:"2211100173",midSem:19,quiz:5,assign:5,attend:0,total:29,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2,q2d:2.5,q2e:1.5,q2f:1}},
  {sl:47,name:"ADITYA DASH",reg:"2211100174",midSem:12,quiz:5,assign:4,attend:0,total:21,q:{q1a:1,q1b:1,q1c:1,q1d:0.5,q1e:0.5,q2a:1,q2b:1.5,q2c:1.5,q2d:0,q2e:2,q2f:2}},
  {sl:48,name:"SALONY PADHI",reg:"2211100175",midSem:12,quiz:5,assign:4,attend:0,total:21,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2,q2b:2,q2c:2,q2d:2.5,q2e:1.5,q2f:2}},
  {sl:49,name:"SATYABRATA SWAIN",reg:"2211100176",midSem:15,quiz:5,assign:4,attend:0,total:24,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2,q2b:1.5,q2c:2,q2d:1.5,q2e:2,q2f:1}},
  {sl:50,name:"ASUTOSH PARIJA",reg:"2211100177",midSem:15,quiz:5,assign:4,attend:0,total:24,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2,q2b:1.5,q2c:2,q2d:1.5,q2e:2,q2f:1}},
  {sl:51,name:"JAGANNATH SAHOO",reg:"2211100178",midSem:15,quiz:5,assign:2,attend:0,total:22,q:{q1a:1,q1b:1,q1c:0.5,q1d:0.5,q1e:1,q2a:2.5,q2b:2.5,q2c:1,q2d:2,q2e:1.5,q2f:1.5}},
  {sl:52,name:"BIMBADHAR PANDA",reg:"2211100179",midSem:null,quiz:null,assign:null,attend:0,total:null,absent:true,q:{}},
  {sl:53,name:"PREETAM SAHOO",reg:"2211100180",midSem:13,quiz:5,assign:4,attend:0,total:22,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:0,q2b:2.5,q2c:1.5,q2d:1.5,q2e:1.5,q2f:1}},
  {sl:54,name:"SOVAN SEKHAR SENAPATI",reg:"2211100182",midSem:16,quiz:5,assign:2,attend:0,total:23,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2,q2c:2,q2d:2,q2e:1.5,q2f:1}},
  {sl:55,name:"SABYASACHI MOHANTY",reg:"2211100183",midSem:15,quiz:5,assign:2,attend:0,total:22,q:{q1a:1,q1b:1,q1c:0.5,q1d:0.5,q1e:1,q2a:2,q2b:2,q2c:1.5,q2d:1.5,q2e:2,q2f:2}},
  {sl:56,name:"DEBASIS SAHOO",reg:"2211100184",midSem:12,quiz:5,assign:4,attend:0,total:21,q:{q1a:1,q1b:0.5,q1c:0,q1d:0.5,q1e:1,q2a:2.5,q2b:2.5,q2c:0,q2d:1,q2e:2,q2f:1}},
  {sl:57,name:"JEEVAN JYOTI BEHERA",reg:"2211100185",midSem:15,quiz:5,assign:5,attend:0,total:25,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2,q2b:2,q2c:1.5,q2d:2,q2e:1.5,q2f:1}},
  {sl:58,name:"ANKITA SAHU",reg:"2211100186",midSem:17,quiz:5,assign:5,attend:0,total:27,q:{q1a:1,q1b:1,q1c:0,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2,q2d:2,q2e:2,q2f:2}},
  {sl:59,name:"ADITYA KUMAR MANDAL",reg:"2211100187",midSem:16,quiz:5,assign:4,attend:0,total:25,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:1,q2b:1,q2c:2,q2d:2.5,q2e:2.5,q2f:2}},
  {sl:60,name:"ANANYA ANURUPA BEHERA",reg:"2211100188",midSem:13,quiz:5,assign:5,attend:0,total:23,q:{q1a:1,q1b:0.5,q1c:1,q1d:0.5,q1e:1,q2a:1.5,q2b:1.5,q2c:1,q2d:2,q2e:2,q2f:1}},
  {sl:61,name:"LOKANATH MAJHI",reg:"2211100189",midSem:13,quiz:5,assign:4,attend:0,total:22,q:{q1a:1,q1b:0,q1c:0.5,q1d:0,q1e:0,q2a:2.5,q2b:2,q2c:2,q2d:1.5,q2e:1.5,q2f:1.5}},
  {sl:62,name:"MANASI NAIK",reg:"2211100190",midSem:9,quiz:5,assign:4,attend:0,total:18,q:{q1a:0.5,q1b:0.5,q1c:1,q1d:0,q1e:1,q2a:1,q2b:1.5,q2c:1.5,q2d:1,q2e:0.5,q2f:0.5}},
  {sl:63,name:"ADITYA PRADHAN",reg:"2211100191",midSem:18,quiz:5,assign:4,attend:0,total:27,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2,q2e:1.5,q2f:1.5}},
  {sl:64,name:"RAJASHREE DALAI",reg:"2211100192",midSem:19,quiz:5,assign:4,attend:0,total:28,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2,q2f:2}},
  {sl:65,name:"ABHIJIT NAIK",reg:"2211100193",midSem:15,quiz:5,assign:4,attend:0,total:24,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2,q2b:2,q2c:2,q2d:1,q2e:1.5,q2f:1.5}},
  {sl:66,name:"SANDEEP KUMAR PRADHAN",reg:"2211100194",midSem:15,quiz:5,assign:2,attend:0,total:22,q:{q1a:1,q1b:1,q1c:0.5,q1d:1,q1e:0,q2a:2.5,q2b:2,q2c:1.5,q2d:2.5,q2e:1.5,q2f:1}},
  {sl:67,name:"DINESH KUMAR KALO",reg:"2211100195",midSem:12,quiz:5,assign:4,attend:0,total:21,q:{q1a:1,q1b:1,q1c:0,q1d:1,q1e:0,q2a:2,q2b:1.5,q2c:1,q2d:2,q2e:1.5,q2f:1}},
  {sl:68,name:"PRERNA NAIK",reg:"2211100197",midSem:19,quiz:5,assign:4,attend:0,total:28,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2,q2e:2.5,q2f:2}},
  {sl:69,name:"SUNARAM NAIK",reg:"2211100198",midSem:11,quiz:5,assign:4,attend:0,total:20,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:1.5,q2b:1,q2c:1.5,q2d:1,q2e:1,q2f:0}},
  {sl:70,name:"BIVRAJ SAHU",reg:"2211100199",midSem:12,quiz:5,assign:4,attend:0,total:21,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2,q2b:1.5,q2c:1,q2d:1.5,q2e:0.5,q2f:0.5}},
  {sl:71,name:"ABHISEK SAHOO",reg:"2211100200",midSem:13,quiz:5,assign:4,attend:0,total:22,q:{q1a:0.5,q1b:1,q1c:0.5,q1d:1,q1e:1,q2a:2,q2b:1.5,q2c:2,q2d:1.5,q2e:1,q2f:1}},
  {sl:72,name:"SUJIT PRUSTY",reg:"2211100223",midSem:19,quiz:5,assign:5,attend:0,total:29,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2,q2d:2.5,q2e:2.5,q2f:2}},
  {sl:73,name:"ADITYA KIRAN PATI",reg:"2211100239",midSem:20,quiz:5,assign:4,attend:0,total:29,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2.5,q2f:2.5}},
  {sl:74,name:"ANJANEYA PATTANAIK",reg:"2211100518",midSem:20,quiz:5,assign:3,attend:0,total:28,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2.5,q2f:2.5}},
  {sl:75,name:"SADANANDA BEHERA",reg:"2211100521",midSem:14,quiz:5,assign:4,attend:0,total:23,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2,q2b:2,q2c:2,q2d:1.5,q2e:1.5,q2f:0}},
  {sl:76,name:"PRADESTHA PATTNAIK",reg:"2211100530",midSem:19,quiz:5,assign:4,attend:0,total:28,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2,q2f:2}},
  {sl:77,name:"ALISH DAS",reg:"2211100531",midSem:17,quiz:5,assign:5,attend:0,total:27,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:1.5,q2c:2,q2d:2.5,q2e:1.5,q2f:2}},
  {sl:78,name:"MOHIT KUMAR DASS",reg:"2312100028",midSem:18,quiz:5,assign:3,attend:0,total:26,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2,q2c:2,q2d:2.5,q2e:1.5,q2f:2}},
  {sl:79,name:"AKASH PATTANAIK",reg:"2312100029",midSem:null,quiz:null,assign:null,attend:0,total:null,absent:true,q:{}},
  {sl:80,name:"BRAHMANANDA TOSH",reg:"2312100030",midSem:19,quiz:5,assign:3,attend:0,total:27,q:{q1a:1,q1b:1,q1c:1,q1d:0.5,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2,q2e:2.5,q2f:2.5}},
  {sl:81,name:"SAMIT KUMAR SAHOO",reg:"2312100031",midSem:null,quiz:null,assign:null,attend:0,total:null,absent:true,q:{}},
  {sl:82,name:"RAJAT SATRUSAL",reg:"2312100032",midSem:14,quiz:5,assign:4,attend:0,total:23,q:{q1a:1,q1b:1,q1c:0.5,q1d:1,q1e:0,q2a:2.5,q2b:2,q2c:1.5,q2d:2,q2e:1.5,q2f:1}},
  {sl:83,name:"DHARMENDRA MISHAL",reg:"2312100033",midSem:16,quiz:5,assign:2,attend:0,total:23,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2,q2b:2.5,q2c:2.5,q2d:2.5,q2e:1.5,q2f:0}},
  {sl:84,name:"SUSHREE RITURESHMA SWAIN",reg:"2312100034",midSem:20,quiz:5,assign:4,attend:0,total:29,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2.5,q2f:2.5}},
  {sl:85,name:"PRAKASH ROUT",reg:"2312100035",midSem:20,quiz:5,assign:4,attend:0,total:29,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2.5,q2b:2.5,q2c:2.5,q2d:2.5,q2e:2.5,q2f:2.5}},
  {sl:86,name:"ANSUMAN PATNAIK",reg:"1901106200",midSem:12,quiz:5,assign:2,attend:0,total:19,q:{q1a:1,q1b:1,q1c:1,q1d:1,q1e:1,q2a:2,q2b:1,q2c:1.5,q2d:1.5,q2e:1,q2f:1}},
];

async function initDB() {
  ensureDir();

  // Seed users if not exists
  if (readCollection('users').length === 0) {
    const users = [
      { id: 'admin-1', username: 'admin', password: bcrypt.hashSync('admin123', 10), name: 'Administrator', role: 'admin' },
      { id: 'teacher-1', username: 'teacher', password: bcrypt.hashSync('teach123', 10), name: 'Pranati Mishra', role: 'teacher', subject: 'Cloud Computing' },
    ];
    writeCollection('users', users);
    console.log('✅ Users seeded');
  }

  // Seed students if not exists
  if (readCollection('students').length === 0) {
    const studentRecords = STUDENTS_DATA.map(s => ({
      id: s.reg,
      sl: s.sl,
      name: s.name,
      reg: s.reg,
      subject: 'UPECS710',
      semester: '5th',
      branch: 'CSE',
      midSem: s.midSem,
      quiz: s.quiz,
      assign: s.assign,
      attend: s.attend,
      total: s.total,
      absent: s.absent || false,
      q: s.q,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    writeCollection('students', studentRecords);

    // Seed student user accounts
    const existingUsers = readCollection('users');
    const studentUsers = STUDENTS_DATA
      .filter(s => !s.absent)
      .map(s => ({
        id: `student-${s.reg}`,
        username: s.reg,
        password: bcrypt.hashSync(s.reg, 10),
        name: s.name,
        role: 'student',
        reg: s.reg,
      }));
    writeCollection('users', [...existingUsers, ...studentUsers]);
    console.log('✅ Students seeded');
  }

  // Audit log
  if (!fs.existsSync(path.join(DATA_DIR, 'audit.json'))) {
    writeCollection('audit', []);
  }

  console.log('✅ Database initialized');
}

module.exports = { readCollection, writeCollection, findOne, findAll, insert, update, remove, initDB };
