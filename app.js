const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const contacts = require('./routes/api/contacts'); // Import the contacts module

const app = express();

// Middleware
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json()); // To parse incoming JSON data


const Joi = require('joi');

// Define validation schemas
const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required()
});


// Routes
app.get('/api/contacts', async (req, res) => {

  try {
    const contactList = await contacts.listContacts();
    res.status(200).json(contactList);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

app.get('/api/contacts/:id', async (req, res) => {



  const { id } = req.params;
  try {
    const contact = await contacts.getById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/contacts', async (req, res) => {

  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Missing required fields' });
  }


  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'Missing required name field' });
  }
  try {
    const newContact = await contacts.addContact({ name, email, phone });
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const contact = await contacts.removeContact(id);
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/contacts/:id', async (req, res) => {

  const { error } = contactSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const { id } = req.params;
  const { name, email, phone } = req.body;
  if (!name && !email && !phone) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    const updatedContact = await contacts.updateContact(id, { name, email, phone });
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = app;
