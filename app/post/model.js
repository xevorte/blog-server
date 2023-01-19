const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: {
        type: String,
        minLength: [4, 'Title must more than 4 characters'],
        required: [true, 'Title must be filled!']
    },
    slug: {
        type: String,
    },
    body: {
        type: String,
        required: [true, 'Body must be filled']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category must be filled']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author',
        required: [true, 'Author must be filled']
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        required: [true, 'Tags must be filled']
    }],
    status: {
        type: String,
        enum: ['active', 'nonactive'],
        default: 'active'
    }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;