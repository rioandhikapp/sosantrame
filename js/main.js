import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Koneksi ke Supabase (PostgreSQL)
const supabase = createClient(
  'https://dnlmqwcsbdytrgshosyh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRubG1xd2NzYmR5dHJnc2hvc3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNjY2MTAsImV4cCI6MjA2NTY0MjYxMH0.Z88PYt3Hq3QAQ4ZY2yqUmbb8AKdmyAd0tP6CcXFguZI'
);

// Inisialisasi SQLite di browser
let SQL, db;
const SQL_READY = initSqlJs({
  locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
}).then(SQLLib => {
  SQL = SQLLib;
  db = new SQL.Database();
  db.run(`CREATE TABLE IF NOT EXISTS event (
    eventName TEXT,
    guestName TEXT,
    guestIG TEXT
  )`);
  console.log("SQLite siap digunakan");

  // Jika ada file tersimpan sebelumnya di localStorage
  const saved = localStorage.getItem('sqliteBackup');
  if (saved) {
    db = new SQL.Database(new Uint8Array(JSON.parse(saved)));
    console.log("Database SQLite dipulihkan dari penyimpanan lokal");
  }
});

function saveSQLiteToDisk() {
  const binaryArray = db.export();
  localStorage.setItem('sqliteBackup', JSON.stringify(Array.from(binaryArray)));

  const blob = new Blob([binaryArray], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "event_data.sqlite";
  a.click();
  URL.revokeObjectURL(url);
}

// Get elements
const eventNameInput = document.getElementById('eventName');
const guestNameInput = document.getElementById('guestName');
const guestIGInput = document.getElementById('guestIG');

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const nextToStep2Btn = document.getElementById('nextToStep2');
const prevToStep1Btn = document.getElementById('prevToStep1');
const createEventForm = document.getElementById('createEventForm');
const eventDisplayContainer = document.getElementById('eventDisplayContainer');
const eventFormContainer = document.getElementById('eventFormContainer');
const createNewEventBtn = document.getElementById('createNewEventBtn');
const viewAllDataBtn = document.getElementById('viewAllDataBtn');

const tab1Btn = document.getElementById('tab1Btn');
const tab2Btn = document.getElementById('tab2Btn');

const eventListBody = document.getElementById('eventListBody');
let currentStep = 1;

function showStep(stepNumber) {
  if (stepNumber === 1) {
    step1.classList.remove('hidden');
    step2.classList.add('hidden');
  } else if (stepNumber === 2) {
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
  }
  currentStep = stepNumber;
  updateTabStyles();
}

function updateTabStyles() {
  if (currentStep === 1) {
    tab1Btn.classList.add('bg-kopi', 'text-white');
    tab1Btn.classList.remove('bg-emas', 'text-kayu', 'hover:bg-kopi', 'hover:text-white');
    tab2Btn.classList.add('bg-emas', 'text-kayu', 'hover:bg-kopi', 'hover:text-white');
    tab2Btn.classList.remove('bg-kopi', 'text-white');
  } else if (currentStep === 2) {
    tab2Btn.classList.add('bg-kopi', 'text-white');
    tab2Btn.classList.remove('bg-emas', 'text-kayu', 'hover:bg-kopi', 'hover:text-white');
    tab1Btn.classList.add('bg-emas', 'text-kayu', 'hover:bg-kopi', 'hover:text-white');
    tab1Btn.classList.remove('bg-kopi', 'text-white');
  }
}

async function displayAllEvents() {
  eventListBody.innerHTML = '';

  const { data: pgEvents, error: pgError } = await supabase
    .from('event')
    .select('eventName, guestName, guestIG');

  if (pgError) {
    console.error("Error loading events from PostgreSQL:", pgError.message);
  } else {
    pgEvents.forEach(event => {
      const row = `
        <tr class="bg-white">
          <td class="py-2 px-4 border-b border-gray-200">${event.eventName}</td>
          <td class="py-2 px-4 border-b border-gray-200">${event.guestName}</td>
          <td class="py-2 px-4 border-b border-gray-200">${event.guestIG}</td>
          <td class="py-2 px-4 border-b border-gray-200 text-xs text-gray-500">[SUPABASE]</td>
        </tr>
      `;
      eventListBody.insertAdjacentHTML('beforeend', row);
    });
  }

  await SQL_READY;
  const result = db.exec("SELECT * FROM event");
  if (result.length > 0) {
    const rows = result[0].values;
    rows.forEach(([eventName, guestName, guestIG]) => {
      const row = `
        <tr class="bg-gray-50">
          <td class="py-2 px-4 border-b border-gray-200">${eventName}</td>
          <td class="py-2 px-4 border-b border-gray-200">${guestName}</td>
          <td class="py-2 px-4 border-b border-gray-200">${guestIG}</td>
          <td class="py-2 px-4 border-b border-gray-200 text-xs text-gray-500">[SQLITE]</td>
        </tr>
      `;
      eventListBody.insertAdjacentHTML('beforeend', row);
    });
  }

  if (eventListBody.innerHTML === '') {
    eventListBody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-kopi">Belum ada acara yang dibuat.</td></tr>';
  }

  eventFormContainer.classList.add('hidden');
  eventDisplayContainer.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', displayAllEvents);

nextToStep2Btn.addEventListener('click', () => {
  const eventName = eventNameInput.value;
  if (eventName.trim() === '') {
    alert("Judul Acara tidak boleh kosong!");
    return;
  }
  showStep(2);
});

prevToStep1Btn.addEventListener('click', () => {
  showStep(1);
});

tab1Btn.addEventListener('click', () => {
  showStep(1);
});

tab2Btn.addEventListener('click', () => {
  const eventName = eventNameInput.value;
  if (eventName.trim() === '') {
    alert("Mohon isi Judul Acara terlebih dahulu!");
    return;
  }
  showStep(2);
});

createEventForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const eventName = eventNameInput.value;
  const guestName = guestNameInput.value;
  const guestIG = guestIGInput.value;

  if (eventName.trim() === '' || guestName.trim() === '' || guestIG.trim() === '') {
    alert("Semua kolom harus diisi!");
    return;
  }

  const { error: pgError } = await supabase.from("event").insert([{ eventName, guestName, guestIG }]);
  if (pgError) {
    alert("Gagal menambahkan data ke PostgreSQL: " + pgError.message);
    return;
  }

  await SQL_READY;
  db.run("INSERT INTO event (eventName, guestName, guestIG) VALUES (?, ?, ?)", [eventName, guestName, guestIG]);
  saveSQLiteToDisk();
  console.log("Berhasil disimpan ke SQLite dan disimpan ke penyimpanan lokal");

  guestNameInput.value = '';
  guestIGInput.value = '';
  viewAllDataBtn.classList.remove('hidden');
});

createNewEventBtn.addEventListener('click', () => {
  eventDisplayContainer.classList.add('hidden');
  eventFormContainer.classList.remove('hidden');
  guestNameInput.value = '';
  guestIGInput.value = '';
  viewAllDataBtn.classList.add('hidden');
  showStep(1);
});

viewAllDataBtn.addEventListener('click', () => {
  displayAllEvents();
});
