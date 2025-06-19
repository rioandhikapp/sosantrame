import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  'https://dnlmqwcsbdytrgshosyh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRubG1xd2NzYmR5dHJnc2hvc3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNjY2MTAsImV4cCI6MjA2NTY0MjYxMH0.Z88PYt3Hq3QAQ4ZY2yqUmbb8AKdmyAd0tP6CcXFguZI'
);

// Get elements for wizard and display
const eventNameInput = document.getElementById('eventName'); // Get the event name input
const guestNameInput = document.getElementById('guestName'); // Get the guest name input
const guestIGInput = document.getElementById('guestIG');     // Get the guest IG input

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const nextToStep2Btn = document.getElementById('nextToStep2');
const prevToStep1Btn = document.getElementById('prevToStep1');
const createEventForm = document.getElementById('createEventForm');
const eventDisplayContainer = document.getElementById('eventDisplayContainer');
const eventFormContainer = document.getElementById('eventFormContainer');
const createNewEventBtn = document.getElementById('createNewEventBtn'); // ID tombol diubah di HTML
const viewAllDataBtn = document.getElementById('viewAllDataBtn'); // Tombol baru "Lihat Data"

const tab1Btn = document.getElementById('tab1Btn');
const tab2Btn = document.getElementById('tab2Btn');

const eventListBody = document.getElementById('eventListBody');

let currentStep = 1; // Keep track of the current form step

// ---
// Fungsi untuk menampilkan/menyembunyikan langkah-langkah form
// ---
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

// ---
// Fungsi untuk update gaya tab navigasi
// ---
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

// ---
// Fungsi untuk menampilkan semua data acara di tabel
// ---
async function displayAllEvents() {
  eventListBody.innerHTML = ''; // Kosongkan tabel sebelum mengisi ulang

  const { data: events, error } = await supabase
    .from('event')
    .select('eventName, guestName, guestIG')

  if (error) {
    console.error("Error loading all events:", error.message);
    eventListBody.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-kopi">Gagal memuat data acara.</td></tr>';
    return;
  }

  if (events && events.length > 0) {
    events.forEach(event => {
      const row = `
        <tr>
          <td class="py-2 px-4 border-b border-gray-200">${event.eventName}</td>
          <td class="py-2 px-4 border-b border-gray-200">${event.guestName}</td>
          <td class="py-2 px-4 border-b border-gray-200">${event.guestIG}</td>
        </tr>
      `;
      eventListBody.insertAdjacentHTML('beforeend', row);
    });
  } else {
    eventListBody.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-kopi">Belum ada acara yang dibuat.</td></tr>';
  }

  // Sembunyikan form dan tampilkan daftar acara
  eventFormContainer.classList.add('hidden');
  eventDisplayContainer.classList.remove('hidden');
}

// ---
// Panggil fungsi displayAllEvents saat halaman dimuat
// ---
document.addEventListener('DOMContentLoaded', displayAllEvents);


// ---
// Event Listeners untuk navigasi form wizard
// ---
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

// ---
// Event Listener untuk submit form
// ---
createEventForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const eventName = eventNameInput.value;
  const guestName = guestNameInput.value;
  const guestIG = guestIGInput.value;

  if (eventName.trim() === '' || guestName.trim() === '' || guestIG.trim() === '') {
    alert("Semua kolom harus diisi!");
    return;
  }

  const { data, error } = await supabase.from("event").insert([{ eventName, guestName, guestIG }]).select();

  if (error) {
    alert("Gagal menambahkan data: " + error.message);
  } else {
    alert("Berhasil membuat acara!");
    // Hanya kosongkan input guestName dan guestIG
    guestNameInput.value = '';
    guestIGInput.value = '';

    // Tampilkan tombol "Lihat Data" setelah submit berhasil
    viewAllDataBtn.classList.remove('hidden');

    // Tetap di halaman tab 2
    // Tidak perlu panggil displayAllEvents() di sini
    // showStep(2) sudah otomatis aktif karena form tetap di step 2
  }
});

// ---
// Event Listener untuk tombol "Tambah Acara Baru" (dari halaman daftar data)
// ---
createNewEventBtn.addEventListener('click', () => {
  // Sembunyikan daftar acara, tampilkan form
  eventDisplayContainer.classList.add('hidden');
  eventFormContainer.classList.remove('hidden');

  // Reset form untuk acara baru, tapi Judul Acara bisa tetap ada jika diisi sebelumnya
  // eventNameInput.value = ''; // Jangan dikosongkan jika ingin old value di judul
  guestNameInput.value = '';
  guestIGInput.value = '';

  // Sembunyikan tombol "Lihat Data" saat memulai form baru
  viewAllDataBtn.classList.add('hidden');

  // Pastikan form kembali ke langkah 1
  showStep(1);
});

// ---
// Event Listener untuk tombol "Lihat Data" (dari halaman form wizard)
// ---
viewAllDataBtn.addEventListener('click', () => {
  // Muat ulang dan tampilkan semua acara
  displayAllEvents();
});