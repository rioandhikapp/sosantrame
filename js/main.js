import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabase = createClient(
      'https://dnlmqwcsbdytrgshosyh.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRubG1xd2NzYmR5dHJnc2hvc3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNjY2MTAsImV4cCI6MjA2NTY0MjYxMH0.Z88PYt3Hq3QAQ4ZY2yqUmbb8AKdmyAd0tP6CcXFguZI'
)

// === Utils ===
function getEventIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// === Buat Acara (index.html) ===
document.addEventListener("DOMContentLoaded", () => {
  const createForm = document.getElementById("createEventForm");

  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const eventName = document.getElementById("eventName").value.trim();
      if (!eventName) return;

      const { data, error } = await supabase
        .from("event")
        .insert([{ eventName }])
        .select()
        .single();

      if (error) {
        alert("Gagal membuat acara: " + error.message);
        return;
      }

      window.location.href = `event.html?id=${data.id}`;
    });
  }
});

// === Tampilkan Judul Acara (event.html) ===
async function loadEventTitle() {
  const eventId = getEventIdFromURL();
  if (!eventId) {
    document.getElementById('eventTitle').textContent = 'Acara tidak ditemukan';
    return;
  }

  const { data, error } = await supabase
    .from('event')
    .select('eventName')
    .eq('id', eventId)
    .single();

  const el = document.getElementById('eventTitle');
  if (error || !data) {
    el.textContent = 'Gagal memuat acara';
    console.error('Error:', error);
  } else {
    el.textContent = data.title;
  }
}

// === Tambahkan Tamu ke Supabase ===
const guestForm = document.getElementById("guestForm");
if (guestForm) {
  guestForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("guestName").value.trim();
    const ig = document.getElementById("guestIG").value.trim();
    const eventId = getEventIdFromURL();

    if (!name || !ig || !eventId) return;

    const { error } = await supabase
      .from("guests")
      .insert([{ name: name, instagram: ig, event_id: eventId }]);

    if (error) {
      alert("Gagal menambahkan tamu: " + error.message);
    } else {
      guestForm.reset();
      loadGuestList();
    }
  });
}

// === Tampilkan Daftar Tamu ===
async function loadGuestList() {
  const eventId = getEventIdFromURL();
  const guestList = document.getElementById("guestList");
  if (!eventId || !guestList) return;

  const { data, error } = await supabase
    .from("guests")
    .select("name, instagram")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  guestList.innerHTML = "";

  if (error) {
    guestList.innerHTML = `<li>Gagal memuat tamu</li>`;
    return;
  }

  data.forEach((guest) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="flex justify-between items-center border p-3 rounded-md bg-[#fdfaf5]">
        <span>${guest.name}</span>
        <a href="https://instagram.com/${guest.instagram}" target="_blank" class="text-blue-600 hover:underline">@${guest.instagram}</a>
      </div>
    `;
    guestList.appendChild(li);
  });
}

// === Inisialisasi saat event.html terbuka ===
if (document.getElementById("eventTitle")) {
  loadEventTitle();
}
if (document.getElementById("guestList")) {
  loadGuestList();
}

function copyEventLink() {
  const eventId = getEventIdFromURL();
  const url = `${window.location.origin}/event.html?id=${eventId}`;
  navigator.clipboard.writeText(url).then(() => {
    alert("Tautan acara disalin!");
  });
}