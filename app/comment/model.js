const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name must be filled']
  },
  email: {
    type: String,
    required: [true, 'Email must be filled']
  },
  description: {
    type: String,
    required: [true, 'Description must be filled']
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  status: {
    type: String,
    enum: ['active', 'nonactive'],
    default: 'active'
  }
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;