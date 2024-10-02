const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const contactsPath = path.join(__dirname, 'db', 'contacts.json');

async function listContacts() {
  const data = await fs.readFile(contactsPath, 'utf8');
  return JSON.parse(data);
}

async function getById(contactId) {
  const contacts = await listContacts();
  return contacts.find(contact => contact.id === contactId);
}

async function addContact({ name, email, phone }) {
  const contacts = await listContacts();
  const newContact = { id: uuidv4(), name, email, phone };
  contacts.push(newContact);
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return newContact;
}

async function removeContact(contactId) {
  const contacts = await listContacts();
  const filteredContacts = contacts.filter(contact => contact.id !== contactId);
  if (contacts.length === filteredContacts.length) return null; // Contact not found
  await fs.writeFile(contactsPath, JSON.stringify(filteredContacts, null, 2));
  return true;
}

async function updateContact(id, updates) {
  const contacts = await listContacts();
  const index = contacts.findIndex(contact => contact.id === id);
  if (index === -1) return null; // Contact not found
  contacts[index] = { ...contacts[index], ...updates };
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return contacts[index];
}

module.exports = {
  listContacts,
  getById,
  addContact,
  removeContact,
  updateContact
};
