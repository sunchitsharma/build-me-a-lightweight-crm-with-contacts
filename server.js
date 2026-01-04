const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let contacts = [];
let notes = [];
let contactIdSeq = 1;
let noteIdSeq = 1;

// Contacts CRUD
app.get('/api/contacts', (req, res) => {
  res.json(contacts.map(c => ({ ...c, notes: notes.filter(n => n.contactId === c.id) })));
});

app.post('/api/contacts', (req, res) => {
  const { name, email, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const newContact = { id: contactIdSeq++, name, email: email || '', phone: phone || '' };
  contacts.push(newContact);
  res.status(201).json(newContact);
});

app.put('/api/contacts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const contact = contacts.find(c => c.id === id);
  if (!contact) return res.status(404).json({ error: 'Not found' });
  const { name, email, phone } = req.body;
  if (name !== undefined) contact.name = name;
  if (email !== undefined) contact.email = email;
  if (phone !== undefined) contact.phone = phone;
  res.json(contact);
});

app.delete('/api/contacts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  contacts = contacts.filter(c => c.id !== id);
  notes = notes.filter(n => n.contactId !== id);
  res.status(204).end();
});

// Notes
app.get('/api/contacts/:id/notes', (req, res) => {
  const id = parseInt(req.params.id, 10);
  res.json(notes.filter(n => n.contactId === id));
});

app.post('/api/contacts/:id/notes', (req, res) => {
  const contactId = parseInt(req.params.id, 10);
  const contact = contacts.find(c => c.id === contactId);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  const newNote = { id: noteIdSeq++, contactId, text, createdAt: new Date().toISOString() };
  notes.push(newNote);
  res.status(201).json(newNote);
});

app.delete('/api/notes/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  notes = notes.filter(n => n.id !== id);
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CRM app listening on port ${PORT}`));
