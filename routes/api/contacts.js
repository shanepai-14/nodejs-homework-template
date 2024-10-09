const express = require('express');
const router = express.Router();
const { Contact  } = require('../../models/contacts');

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single contact
router.get('/:id', getContact, (req, res) => {
  res.json(res.contact);
});

// Create a contact
router.post('/', async (req, res) => {
  const contact = new Contact(req.body);
  try {
    const newContact = await contact.save();
    res.status(201).json(newContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a contact
router.put('/:id', getContact, async (req, res) => {
  if (req.body.name != null) {
    res.contact.name = req.body.name;
  }
  if (req.body.email != null) {
    res.contact.email = req.body.email;
  }
  if (req.body.phone != null) {
    res.contact.phone = req.body.phone;
  }
  try {
    const updatedContact = await res.contact.save();
    res.json(updatedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a contact
router.delete('/:id', getContact, async (req, res) => {
  try {
    await res.contact.remove();
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update favorite status
router.patch('/:id/favorite', getContact, async (req, res) => {
  if (req.body.favorite == null) {
    return res.status(400).json({ message: "Missing field favorite" });
  }
  res.contact.favorite = req.body.favorite;
  try {
    const updatedContact = await res.contact.save();
    res.json(updatedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

async function getContact(req, res, next) {
  try {
    const contact = await Contact.findById(req.params.id);
    if (contact == null) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.contact = contact;
    next();
  } catch (error) {
    
    return res.status(500).json({ message: error.message + req.params.id + "eerror" });
  }
}

module.exports = router;