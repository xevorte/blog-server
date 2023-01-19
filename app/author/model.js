const mongoose = require('mongoose');

const authorSchema = mongoose.Schema({
    avatar: {
        type: String,
        default: '/images/empty_user.jpg'
    },
    name: {
        type: String,
        minLength: [4, 'Name must more than 4 characters'],
        required: [true, 'Name must be filled']
    },
    username: {
        type: String,
        maxLength: [16, 'Username must between 4 - 16 characters'],
        minLength: [4, 'Username must between 4 - 16 characters'],
        required: [true, 'Username must be filled']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email must be filled']
    },
    password: {
        type: String,
        minLength: [4, 'Password must more than 4 characters'],
        required: [true, 'Password must be filled']
    },
    favoriteCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }
}, { timestamps: true });
authorSchema.path('email').validate(
    async function (value) {
        try {
            const count = await this.model('Author').countDocuments({
                email: value,
            });
            return !count;
        } catch (error) {
            throw error;
        }
    },
    (attr) => `${attr.value} already registered`
);

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;