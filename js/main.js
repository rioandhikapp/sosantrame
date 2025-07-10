import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import mysql from 'mysql2/promise';

// Koneksi ke Supabase (PostgreSQL)
const supabase = createClient(
  'https://dnlmqwcsbdytrgshosyh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRubG1xd2NzYmR5dHJnc2hvc3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNjY2MTAsImV4cCI6MjA2NTY0MjYxMH0.Z88PYt3Hq3QAQ4ZY2yqUmbb8AKdmyAd0tP6CcXFguZI'
);

// Koneksi ke MySQL
let mysqlConnection;
try {
  mysqlConnection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', // User default untuk XAMPP
    password: '', // Password default biasanya kosong
    database: 'event_management' // Ganti dengan nama database Anda
  });
  console.log("Koneksi MySQL berhasil");
} catch (error) {
  console.error("Koneksi MySQL gagal:", error.message);
}

// Get elements for wizard and display
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

// Fungsi untuk menampilkan/menyembunyikan langkah-langkah form
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

// Fungsi untuk update gaya tab navigasi
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

// Fungsi untuk menampilkan semua data acara di tabel
async function displayAllEvents() {
  eventListBody.innerHTML = '';

  // Ambil data dari PostgreSQL
  const { data: pgEvents, error: pgError } = await supabase
    .from('event')
    .select('eventName, guestName, guestIG');

  if (pgError) {
    console.error("Error loading events from PostgreSQL:", pgError.message);
  } else {
    pgEvents.forEach(event => {
      const row = `
        <tr>
          <td class="py-2 px-4 border-b border-gray-200">${event.eventName}</td>
          <td class="py-2 px-4 border-b border-gray-200">${event.guestName}</td>
          <td class="py-2 px-4 border-b border-gray-200">${event.guestIG}</td>
        </tr>
      `;
      eventListBody.insertAdjacentHTML('beforeend', row);
    });
  }

  // Ambil data dari MySQL
  const [mysqlEvents] = await mysqlConnection.query('SELECT eventName, guestName, guestIG FROM event');
  mysqlEvents.forEach(event => {
    const row = `
      <tr>
        <td class="py-2 px-4 border-b border-gray-200">${event.eventName}</td>
        <td class="py-2 px-4 border-b border-gray-200">${event.guestName}</td>
        <td class="py-2 px-4 border-b border-gray-200">${event.guestIG}</td>
      </tr>
    `;
    eventListBody.insertAdjacentHTML('beforeend', row);
  });

  if (eventListBody.innerHTML === '') {
    eventListBody.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-kopi">Belum ada acara yang dibuat.</td></tr>';
  }

  eventFormContainer.classList.add('hidden');
  eventDisplayContainer.classList.remove('hidden');
}

// Panggil fungsi displayAllEvents saat halaman dimuat
document.addEventListener('DOMContentLoaded', displayAllEvents);

// Event Listeners untuk navigasi form wizard
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

// Event Listener untuk submit form
createEventForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const eventName = eventNameInput.value;
  const guestName = guestNameInput.value;
  const guestIG = guestIGInput.value;

  if (eventName.trim() === '' || guestName.trim() === '' || guestIG.trim() === '') {
    alert("Semua kolom harus diisi!");
    return;
  }

  // Insert into PostgreSQL
  const { data: pgData, error: pgError } = await supabase.from("event").insert([{ eventName, guestName, guestIG }]).select();
  if (pgError) {
    alert("Gagal menambahkan data ke PostgreSQL: " + pgError.message);
    return; // Hentikan eksekusi jika gagal
  }

  // Insert into MySQL
  try {
    const [mysqlResult] = await mysqlConnection.execute('INSERT INTO event (eventName, guestName, guestIG) VALUES (?, ?, ?)', [eventName, guestName, guestIG]);
    if (mysqlResult.affectedRows > 0) {
      alert("Berhasil membuat acara di MySQL!");
    } else {
      alert("Gagal menyimpan data di MySQL.");
    }
  } catch (error) {
    alert("Gagal menambahkan data ke MySQL: " + error.message);
  }

  // Reset input fields
  guestNameInput.value = '';
  guestIGInput.value = '';
  viewAllDataBtn.classList.remove('hidden');
});

// Event Listener untuk tombol "Tambah Acara Baru"
createNewEventBtn.addEventListener('click', () => {
  eventDisplayContainer.classList.add('hidden');
  eventFormContainer.classList.remove('hidden');
  guestNameInput.value = '';
  guestIGInput.value = '';
  viewAllDataBtn.classList.add('hidden');
  showStep(1);
});

// Event Listener untuk tombol "Lihat Data"
viewAllDataBtn.addEventListener('click', () => {
  displayAllEvents();
});

// Tutup koneksi MySQL saat aplikasi selesai
window.addEventListener('beforeunload', async () => {
  await mysqlConnection.end();
});