const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Set name for contact'],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
},{ collection: 'contacts' });

const Contact = mongoose.model('Contact', contactSchema);

const updateStatusContact = async (contactId, body) => {
  return await Contact.findByIdAndUpdate(
    contactId,
    { favorite: body.favorite },
    { new: true }
  );
};

module.exports = {
  Contact,
  updateStatusContact,
};