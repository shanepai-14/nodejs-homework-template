const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

const userRoutes = require('./routes/api/user');
const { Contact } = require('./models/contacts');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/users', userRoutes);

const { DB_HOST, PORT = 3000 } = process.env;

const createDirectories = async () => {
  const dirs = [
    path.join(__dirname, 'public'),
    path.join(__dirname, 'public', 'avatars'),
    path.join(__dirname, 'tmp')
  ];

  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error(`Error creating directory ${dir}:`, error);
      }
    }
  }
};

mongoose.connect(DB_HOST)
  .then( async () => {
    console.log("Database connection successful");
    await createDirectories();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
    console.error("Database connection error:", DB_HOST);
    process.exit(1);
  });

// Move this route to the contacts router
app.patch('/api/contacts/:contactId/favorite', async (req, res) => {
  const { contactId } = req.params;
  const { favorite } = req.body;

  if (favorite === undefined) {
    return res.status(400).json({ message: "missing field favorite" });
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = app;