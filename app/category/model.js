const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name must be filled']
  },
  description: {
    type: String,
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  status: {
    type: String,
    enum: ['active', 'nonactive'],
    default: 'active'
  }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category