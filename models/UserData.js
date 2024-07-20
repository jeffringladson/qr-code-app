

// models/UserData.js
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const userDataSchema = new mongoose.Schema({
  name: String,
  email: String,
  data: String, // Adjust fields as needed
  nanoid: {
    type: String,
    default: () => nanoid(),
    unique: true,
  },
});

const UserData = mongoose.model('UserData', userDataSchema, 'users');

module.exports = UserData;
