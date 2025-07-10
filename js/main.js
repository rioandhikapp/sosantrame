// === SUPABASE SETUP ===
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  'https://dnlmqwcsbdytrgshosyh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRubG1xd2NzYmR5dHJnc2hvc3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNjY2MTAsImV4cCI6MjA2NTY0MjYxMH0.Z88PYt3Hq3QAQ4ZY2yqUmbb8AKdmyAd0tP6CcXFguZI'
);

// === SQL.JS SETUP (SQLite in browser) ===
let SQL, db;

initSqlJs({
  locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
}).then(SQLLib => {
  SQL = SQLLib;
  db = new SQL.Database();

  db.run(`CREATE TABLE IF NOT EXISTS event (
    eventName TEXT,
    guestName TEXT,
    guestIG TEXT
  )`);

  console.log("SQLite siap digunakan!");
});

// === DOM References ===
const eventNameInput = document.getElementById('eventName');
const guestNameInput = document.getElementById('guestName');
const guestIGInput = document.getElementById('guestIG');
const eventListBody = document.getElementById('eventListBody');
const createEventForm = document.getElementById('createEventForm');
const viewAllDataBtn = document.getElementById('viewAllDataBtn');

// === Fungsi Simpan ke Supabase ===
async function insertToSupabase(eventName, guestName, guestIG) {
  const { error } = await supabase
    .from("event")
    .insert([{ eventName, guestName, guestIG }]);
  return error;
}

// === Fungsi Simpan ke SQLite ===
function insertToSQLite(eventName, guestName, guestIG) {
  db.run("INSERT INTO event (eventName, guestName, guestIG) VALUES (?, ?, ?)", [eventName, guestName, guestIG]);
}

// === Fungsi Ambil Data dari Supabase ===
async function getFromSupabase() {
  const { data, error } = await supabase
    .from("event")
    .select("eventName, guestName, guestIG");

  if (error) {
    console.error("Supabase Error:", error.message);
    return [];
  }
  return data;
}

// === Fungsi Ambil Data dari SQLite ===
function getFromSQLite() {
  const result = db.exec("SELECT * FROM event");
  if (result.length === 0) return [];

  return result[0].values.map(row => ({
    eventName: row[0],
    guestName: row[1],
    guestIG: row[2]
  }));
}

// === Fungsi Menampilkan Semua Data ===
async function displayAllEvents() {
  eventListBody.innerHTML = "";

  // Ambil data dari Supabase
  const supaEvents = await getFromSupabase();
  supaEvents.forEach(e => {
    addTableRow(e.eventName, e.guestName, e.guestIG, "🟢 Supabase");
  });

  // Ambil data dari SQLite
  const sqliteEvents = getFromSQLite();
  sqliteEvents.forEach(e => {
    addTableRow(e.eventName, e.guestName, e.guestIG, "🟡 SQLite");
  });

  if (eventListBody.innerHTML.trim() === '') {
    eventListBody.innerHTML = `<tr><td colspan="4" class="text-center py-4">Belum ada acara.</td></tr>`;
  }
}

// === Tambah Baris ke Tabel ===
function addTableRow(eventName, guestName, guestIG, source) {
  const row = `
    <tr>
      <td class="py-2 px-4 border-b">${eventName}</td>
      <td class="py-2 px-4 border-b">${guestName}</td>
      <td class="py-2 px-4 border-b">${guestIG}</td>
      <td class="py-2 px-4 border-b text-sm">${source}</td>
    </tr>
  `;
  eventListBody.insertAdjacentHTML('beforeend', row);
}

// === Submit Form Event ===
createEventForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const eventName = eventNameInput.value.trim();
  const guestName = guestNameInput.value.trim();
  const guestIG = guestIGInput.value.trim();

  if (!eventName || !guestName || !guestIG) {
    alert("Semua kolom harus diisi!");
    return;
  }

  // Simpan ke Supabase
  const supaError = await insertToSupabase(eventName, guestName, guestIG);
  if (supaError) {
    alert("Gagal simpan ke Supabase: " + supaError.message);
  } else {
    console.log("Berhasil simpan ke Supabase");
  }

  // Simpan ke SQLite
  insertToSQLite(eventName, guestName, guestIG);
  console.log("Berhasil simpan ke SQLite");

  // Reset input
  eventNameInput.value = '';
  guestNameInput.value = '';
  guestIGInput.value = '';
  viewAllDataBtn.classList.remove('hidden');

  alert("Acara berhasil ditambahkan ke dua database.");
});

// === Tampilkan Semua Data ===
viewAllDataBtn.addEventListener('click', displayAllEvents);

// === Auto Load saat halaman siap ===
document.addEventListener('DOMContentLoaded', displayAllEvents);
