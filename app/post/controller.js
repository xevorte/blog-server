const { Message, Page } = require('../middleware');
const { JSDOM } = require('jsdom');
const slugify = require('slugify');
const newDOMPurify = require('dompurify');

const Post = require('./model');
const Author = require('../author/model');
const Category = require('../category/model');
const Tag = require('../tag/model');
const Comment = require('../comment/model');

const HTML = new JSDOM('').window;
const DOMPurify = newDOMPurify(HTML);

const index = async (req, res) => {
    try {
        const { search, page, limit } = req.query;
        const total = await Post.find({
          $or: [{ title: { $regex: search || "", $options: "i" } }],
        });
        const data = await Post.find({
          $or: [{ title: { $regex: search || "", $options: "i" } }],
        })
          .populate("author")
          .populate("category")
          .populate("tags")
          .skip((page > 1 ? page - 1 : 0) * limit || 0)
          .limit(limit || 2);
        const pages = Math.ceil(total.length / (limit || 2));

        const alert = {
          status: req.flash('alertStatus'),
          message: req.flash('alertMessage'),
          messageDetail: req.flash('alertMessageDetail')
        };

        res.render('modules/posts/read', {
          data, pages, currentPage: parseInt(page) || 1, alert, page: Page(req, search ? `Search Posts : ${search}` : 'Posts')
        });
    } catch (error) {
        Message(req, 'danger', error?.message || 'Internal Server Error');
        res.redirect('/');
    }
}

const create = async (req, res) => {
    try {
        const authors = await Author.find();
        const categories = await Category.find().populate('tags');
        const tags = await Tag.find();

        const alert = {
            status: req.flash('alertStatus'),
            message: req.flash('alertMessage'),
            messageDetail: req.flash('alertMessageDetail')
        }

        res.render('modules/posts/create', {
            data: { authors, categories, tags }, alert, page: Page(req, 'Create Post')
        })
    } catch (error) {
        Message(req, 'danger', error?.message || 'Internal Server Error');
        res.redirect('/posts');
    }
}

const insert = async (req, res) => {
    try {
        const { title, body, category, author, tags } = req.body;
        const slug = slugify(title, { lower: true, replacement: '-' });

        const sanitizeBody = DOMPurify.sanitize(body);

        if (title.charAt(title.length - 1) === "?") {
            Message(req, 'danger', 'Failed Create Post', 'title cannot contain "?" on last character');
            return res.redirect('/posts/create');
        }

        await Post.create({
            title, slug, body: sanitizeBody, category, author, tags
        });

        Message(req, 'success', 'Post Created Successfully');
        res.redirect('/posts');
    } catch (error) {
        Message(req, 'danger', error?.message || 'Failed Create Post');
        res.redirect('/posts/create');
    }
}

const edit = async (req, res) => {
    try {
        const { slug } = req.params;

        const post = await Post.findOne({ slug }).populate('author').populate('category').populate('tags');
        const authors = await Author.find();
        const categories = await Category.find().populate('tags');
        const tags = await Tag.find();

        const alert = {
            status: req.flash('alertStatus'),
            message: req.flash('alertMessage'),
            messageDetail: req.flash('alertMessageDetail')
        };

        res.render('modules/posts/edit', {
            alert, data: { post, authors, categories, tags }, page: Page(req, 'Edit Post')
        });
    } catch (error) {
        Message(req, 'danger', error?.message || 'Internal Server Error');
        res.redirect('/posts');
    }
}

const update = async (req, res) => {
    const { slug } = req.params;
    
    try {
        const payload = req.body;

        const newSlug = slugify(payload.title, { lower: true, replacement: '-' });

        if (payload.title.charAt(payload.title.length - 1) === "?") {
            Message(req, 'danger', 'Failed Create Post', 'title cannot contain "?" on last character');
            return res.redirect(`/posts/edit/${slug}`);
        }
        
        await Post.findOneAndUpdate({ slug }, {
            slug: newSlug,
            ...payload
        }, { runValidators: true });

        Message(req, 'success', 'Post Successfully Updated');
        res.redirect('/posts');
    } catch (error) {
        Message(req, 'danger', error?.message || 'Internal Server Error');
        res.redirect(`/posts/edit/${slug}`);
    }
}

const remove = async (req, res) => {
    try {
        const { id } = req.params;

        await Comment.deleteMany({ post: id });
        await Post.deleteOne({ _id: id });
        Message(req, 'success', 'Post Successfully Deleted');
    } catch (error) {
        Message(req, 'danger', error?.message || 'Internal Server Error');
    }

    res.redirect('/posts');
}

module.exports = {
    index,
    create,
    insert,
    edit,
    update,
    remove
};