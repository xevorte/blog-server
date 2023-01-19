const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Message, Page, FirebaseSetup } = require('../middleware');
const { JWT } = require('../../config');

const User = require('./model');
const Post = require('../post/model');
const Author = require('../author/model');
const Category = require('../category/model');
const Tag = require('../tag/model');
const Comment = require('../comment/model');

const overview = async (req, res) => {
    try {
        const users = await User.find();
        const posts = await Post.find();
        const authors = await Author.find();
        const categories = await Category.find();
        const tags = await Tag.find();
        const comments = await Comment.find();

        const alert = {
            status: req.flash('alertStatus'),
            message: req.flash('alertMessage'),
            messageDetail: req.flash('alertMessageDetail')
        };

        res.render("index", {
            data: {
                users, posts, authors, categories, tags, comments 
            },
            alert,
            page: Page(req, 'Overview'),
        });
    } catch (error) {
        Message(req, 'danger', error?.message || 'Internal Server Error');
        res.redirect('/');
    }
};

const profile = async (req, res) => {
    try {
        const id = req?.session?.user?.id || req?.user?.id;
        const data = await User.findById(id);

        const alert = {
            status: req.flash('alertStatus'),
            message: req.flash('alertMessage'),
            messageDetail: req.flash('alertMessageDetail'),
        };

        res.render('settings', {
            alert, data, page: Page(req, 'Settings')
        });
    } catch (error) {
        Message(req, 'danger', error?.message || 'Internal Server Error');
        res.redirect('/');
    }
}

const settings = async (req, res) => {
    try {
        const id = req?.session?.user?.id || req?.user?.id;
        const { password, avatar } = await User.findById(id).select('password avatar');

        const payload = req.body;
        const file = req?.files?.avatar;
        const confirmPassword = bcrypt.compareSync(payload.password, password);

        if (payload.avatar === '') { delete payload.avatar };
        if (!confirmPassword) { 
            Message(req, 'danger', 'Failed Update Profile', 'wrong password');
            return res.redirect('/settings');
        };

        payload.password = bcrypt.hashSync(payload.password, 10);

        if (file) {
            const { bucket, bucketName, blob, Stream } = FirebaseSetup(file);

            Stream.on('finish', async () => {
                try {
                    if (avatar && avatar !== '/images/empty_user.jpg') {
                        const removeAvatar = bucket.file(avatar.substring(bucketName.length, avatar.length - 10));
                        removeAvatar.delete();
                    };

                    const replaceAvatar = `${bucketName}${blob.id}?alt=media`;
                    await User.findOneAndUpdate({ _id: id }, {
                        avatar: replaceAvatar, ...payload
                    }, { runValidators: true });

                    Message(req, 'success', 'Successfully Update Profile');
                    return res.redirect('/logout');
                } catch (error) {
                    Message(req, 'success', error?.message || 'Failed Update Profile');
                    return res.redirect('/settings');
                };
            });

            Stream.end(file.data);
        } else {
            await User.findOneAndUpdate({ _id: id }, payload, { runValidators: true });
            Message(req, 'success', 'Successfully Update Profile');
            res.redirect('/logout');
        }
    } catch (error) {
        Message(req, 'danger', error?.message || 'Internal Server Error');
        res.redirect('/settings');
    }
}

const login = async (req, res) => {
    const alertStatus = req.flash('alertStatus');
    const alertMessage = req.flash('alertMessage');
    const alertMessageDetail = req.flash('alertMessageDetail');

    const alert = {
        status: alertStatus,
        message: alertMessage,
        messageDetail: alertMessageDetail,
    };

    if (req.session.user !== undefined || req.cookies.auth !== undefined) {
        res.redirect('/');
    } else {
        res.render('auth/login', {
            alert,
            page: { title: 'Login' },
        });
    }
}

const loginAction = async (req, res) => {
    try {
        const { username, password, keepMeLoggedIn } = req.body;
        const auth = await User.findOne({ username });

        if (auth) {
            const confirmPassword = bcrypt.compareSync(password, auth.password);

            if (confirmPassword) {
                const payload = {
                    id: auth._id,
                    name: auth.name,
                    username: auth.username,
                    role: auth.role,
                    avatar: auth.avatar,
                };
                
                !keepMeLoggedIn
                    ? (req.session.user = payload)
                    : res.cookie("auth", jwt.sign({ user: payload }, JWT));

                Message(req, 'success', 'Successfully Login');
                return res.redirect('/');
            } else {
                Message(req, 'danger', 'Failed Login', 'wrong password!');
            }
        } else {
            Message(req, 'danger', 'Failed Login', 'username not found!');
        }

        res.redirect('/login');
    } catch (error) {
        Message(req, 'danger', error?.message || 'Internal Server Error');
        res.redirect('/login');
    }
}

const registration = async (req, res) => {
    const alertStatus = req.flash('alertStatus');
    const alertMessage = req.flash('alertMessage');
    const alertMessageDetail = req.flash('alertMessageDetail');

    const alert = {
        status: alertStatus,
        message: alertMessage,
        messageDetail: alertMessageDetail,
    };

    if (req.session.user !== undefined || req.cookies.auth !== undefined) {
        res.redirect('/');
    } else {
        res.render('auth/registration', {
            alert,
            page: { title: 'Registration' },
        });
    }
}

const registrationAction = async (req, res) => {
    try {
        const payload = req.body;
        const file = req?.files?.avatar;

        if (payload.password !== payload.confirmPassword) {
            Message(req, 'danger', 'Password is not same', 'please try again!');
            return res.redirect('/registration');
        }

        payload.password = bcrypt.hashSync(payload.password, 10);

        if (file) {
            const { bucketName, blob, Stream } = FirebaseSetup(file);

            Stream.on('finish', async () => {
                try {
                    const avatar = `${bucketName}${blob.id}?alt=media`;
                    await User.create({
                        avatar,
                        ...payload,
                    });

                    Message(req, 'success', 'Successfully Registration');
                    return res.redirect('/login');
                } catch (error) {
                    Message(req, 'danger', error?.message || 'Internal Server Error');
                    return res.redirect('/registration');
                }
            });

            Stream.end(file.data);
        } else {
            await User.create(payload);

            Message(req, 'success', 'Successfully Registration');
            res.redirect('/login');
        }
    } catch (error) {
        Message(req, 'danger', error?.message || 'Internal Server Error');
        res.redirect('/registration');
    }
}

const logout = async (req, res) => {
    req.session.destroy();
    res.clearCookie('auth');
    res.redirect('/login');
}

module.exports = {
    overview,
    profile,
    settings,
    login,
    loginAction,
    registration,
    registrationAction,
    logout
}