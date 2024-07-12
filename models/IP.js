const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ipAddressSchema = mongoose.Schema({
  ip: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const IpAddress = mongoose.model('IpAddress', ipAddressSchema);

module.exports = IpAddress;
