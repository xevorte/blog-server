const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name must be filled']
    },
    status: {
        type: String,
        enum: ['active', 'nonactive'],
        default: 'active'
    }
}, { timestamps: true });

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;