const express = require('express');
const mongoose = require('mongoose');
const contactsRouter = require('./routes/api/contacts');
const { Contact, listContacts, getContactById, removeContact, addContact, updateContact, updateStatusContact } = require('./models/contacts'); 
require('dotenv').config();

const app = express();

app.use(express.json());
app.use('/api/contacts', contactsRouter);

const { DB_HOST, PORT = 3000 } = process.env;

mongoose.connect(DB_HOST)
  .then(() => {
    console.log("Database connection successful");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    console.error("Database connection error:", DB_HOST);
    process.exit(1);

  });

  app.patch('/api/contacts/:contactId/favorite', async (req, res) => {
  const { contactId } = req.params;
  const { favorite } = req.body;

  if (favorite === undefined) {
    return res.status(400).json({ message: "missing field favorite" });
  }

  try {
    const updatedContact = await updateStatusContact(contactId, { favorite });
    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});