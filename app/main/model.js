const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    avatar: {
        type: String,
        default: '/images/empty_user.jpg'
    },
    name: {
        type: String,
        required: [true, 'Name must be filled']
    },
    username: {
        type: String,
        minLength: [5, 'Username must more than 4 Characters'],
        required: [true, 'Username must be filled']
    },
    password: {
        type: String,
        minLength: [5, 'Password must more than 5 Characters'],
        required: [true, 'Password must be filled']
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;