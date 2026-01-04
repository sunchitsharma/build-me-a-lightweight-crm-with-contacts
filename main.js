const storageKey = 'crmData';

function loadData() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return { contacts: [] };
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse data', err);
    return { contacts: [] };
  }
}

function saveData(data) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function createId(prefix) {
  return prefix + '_' + Math.random().toString(36).substring(2, 9);
}

let state = loadData();

const contactForm = document.getElementById('contact-form');
const contactIdInput = document.getElementById('contact-id');
const contactNameInput = document.getElementById('contact-name');
const contactEmailInput = document.getElementById('contact-email');
const contactPhoneInput = document.getElementById('contact-phone');
const contactList = document.getElementById('contact-list');
const contactDetailsDiv = document.getElementById('contact-details');
const notesSection = document.getElementById('notes-section');
const noteForm = document.getElementById('note-form');
const noteText = document.getElementById('note-text');
const notesList = document.getElementById('notes-list');
const resetContactBtn = document.getElementById('reset-contact');

let selectedContactId = null;

function renderContacts() {
  contactList.innerHTML = '';
  state.contacts.forEach(contact => {
    const li = document.createElement('li');
    const info = document.createElement('div');
    const actions = document.createElement('div');
    actions.className = 'contact-actions';

    info.innerHTML = `<strong>${contact.name}</strong><br><small>${contact.email || ''}${contact.email && contact.phone ? ' | ' : ''}${contact.phone || ''}</small>`;

    const selectBtn = document.createElement('button');
    selectBtn.textContent = 'Open';
    selectBtn.onclick = () => selectContact(contact.id);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editContact(contact.id);

    const delBtn = document.createElement('button');
    delBtn.className = 'delete';
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => deleteContact(contact.id);

    actions.appendChild(selectBtn);
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(info);
    li.appendChild(actions);

    contactList.appendChild(li);
  });
}

function renderContactDetails() {
  if (!selectedContactId) {
    contactDetailsDiv.innerHTML = '<p>Select a contact to see details.</p>';
    notesSection.classList.add('hidden');
    return;
  }
  const contact = state.contacts.find(c => c.id === selectedContactId);
  if (!contact) return;
  contactDetailsDiv.innerHTML = `
    <h3>${contact.name}</h3>
    <p><strong>Email:</strong> ${contact.email || '-'}<br>
    <strong>Phone:</strong> ${contact.phone || '-'}</p>
  `;
  renderNotes(contact);
  notesSection.classList.remove('hidden');
}

function renderNotes(contact) {
  notesList.innerHTML = '';
  contact.notes = contact.notes || [];
  contact.notes.forEach(note => {
    const li = document.createElement('li');
    const meta = document.createElement('div');
    meta.className = 'note-meta';
    meta.textContent = `Created: ${new Date(note.createdAt).toLocaleString()}`;
    const text = document.createElement('div');
    text.textContent = note.text;
    li.appendChild(meta);
    li.appendChild(text);
    notesList.appendChild(li);
  });
}

function selectContact(id) {
  selectedContactId = id;
  renderContactDetails();
}

function editContact(id) {
  const contact = state.contacts.find(c => c.id === id);
  if (!contact) return;
  contactIdInput.value = contact.id;
  contactNameInput.value = contact.name;
  contactEmailInput.value = contact.email;
  contactPhoneInput.value = contact.phone;
}

function deleteContact(id) {
  state.contacts = state.contacts.filter(c => c.id !== id);
  if (selectedContactId === id) selectedContactId = null;
  saveData(state);
  renderContacts();
  renderContactDetails();
}

function resetContactForm() {
  contactIdInput.value = '';
  contactNameInput.value = '';
  contactEmailInput.value = '';
  contactPhoneInput.value = '';
}

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = contactIdInput.value;
  const name = contactNameInput.value.trim();
  const email = contactEmailInput.value.trim();
  const phone = contactPhoneInput.value.trim();
  if (!name) return;

  if (id) {
    const idx = state.contacts.findIndex(c => c.id === id);
    if (idx >= 0) {
      state.contacts[idx].name = name;
      state.contacts[idx].email = email;
      state.contacts[idx].phone = phone;
    }
  } else {
    const newContact = { id: createId('c'), name, email, phone, notes: [] };
    state.contacts.push(newContact);
  }
  saveData(state);
  renderContacts();
  resetContactForm();
});

resetContactBtn.addEventListener('click', () => {
  resetContactForm();
});

noteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!selectedContactId) return;
  const text = noteText.value.trim();
  if (!text) return;
  const contact = state.contacts.find(c => c.id === selectedContactId);
  if (!contact) return;
  contact.notes = contact.notes || [];
  contact.notes.unshift({ id: createId('n'), text, createdAt: new Date().toISOString() });
  saveData(state);
  noteText.value = '';
  renderNotes(contact);
});

renderContacts();
renderContactDetails();
