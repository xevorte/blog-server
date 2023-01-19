const firebase = require('firebase-admin');
const bcrypt = require('bcryptjs');
const { Message, Page, FirebaseSetup } = require('../middleware');

const Author = require('./model');
const Category = require('../category/model');
const Post = require('../post/model');

const index = async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    const index = (page > 1 ? page - 1 : 0) * limit || 0;
    const total = await Author.find({
      $or: [{ name: { $regex: search || '', $options: 'i' } }],
      $or: [{ username: { $regex: search || '', $options: 'i' } }],
      $or: [{ email: { $regex: search || '', $options: 'i' } }],
    });
    const data = await Author.find({
      $or: [{ name: { $regex: search || '', $options: 'i' } }],
      $or: [{ username: { $regex: search || '', $options: 'i' } }],
      $or: [{ email: { $regex: search || '', $options: 'i' } }],
    }).populate('favoriteCategory').skip(index).limit(limit || 5);
    const pages = Math.ceil(total.length / (limit || 5));

    const alert = {
      status: req.flash('alertStatus'),
      message: req.flash('alertMessage'),
      messageDetail: req.flash('alertMessageDetail')
    };

    res.render('modules/authors/read', {
      alert, pages, data, currentPage: parseInt(page) || 1, index: index + 1, page: Page(req, search ? `Search Authors : ${search}` :'Authors')
    });
  } catch (error) {
    Message(req, 'danger', error?.message || 'Internal Server Error');
    res.redirect('/');
  }
}

const create = async (req, res) => {
  try {
    const categories = await Category.find();

    const alert = {
      status: req.flash('alertStatus'),
      message: req.flash('alertMessage'),
      messageDetail: req.flash('alertMessageDetail')
    };

    res.render('modules/authors/create', {
      alert, data: { categories }, page: Page(req, 'Create Author')
    });
  } catch (error) {
    Message(req, 'danger', error?.message || 'Internal Server Error');
    res.redirect('/authors');
  }
}

const insert = async (req, res) => {
  try {
    const payload = req.body;
    const file = req?.files?.avatar;
    payload.password = bcrypt.hashSync(payload.password, 10);

    if (payload.avatar === '') { delete payload.avatar };
    
    if (file) {
      const { Stream, bucket, blob } = FirebaseSetup(file);

      Stream.on('finish', async () => {
        try {
          const avatar = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${blob.id}?alt=media`;
          await Author.create({
            avatar,
            ...payload
          });

          Message(req, 'success', 'Author Successfully Created');
          res.redirect('/authors');
        } catch (error) {
          Message(req, 'danger', error?.message || 'Failed Insert New Author');
          res.redirect('/authors/create');
        }
      });

      Stream.end(file.data);
    } else {
      await Author.create(payload);

      Message(req, 'success', 'Author Successfully Created');
      res.redirect('/authors');
    }
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Insert New Author');
    res.redirect('/authors/create');
  }
}

const edit = async (req, res) => {
  try {
    const { id } = req.params;
    const author = await Author.findById(id);
    const categories = await Category.find();

    const alert = {
      status: req.flash('alertStatus'),
      message: req.flash('alertMessage'),
      messageDetail: req.flash('alertMessageDetail')
    };

    res.render('modules/authors/edit', {
      alert, data: { author, categories }, page: Page(req, 'Edit Author')
    });
  } catch (error) {
    Message(req, 'danger', error?.message || 'Internal Server Error');
    res.redirect('/authors');
  }
}

const update = async (req, res) => {
  const { id } = req.params;

  try {
    const { avatar } = await Author.findById(id).select('avatar');

    const payload = req.body;
    const file = req?.files?.avatar;

    if (payload.avatar === '') { delete payload.avatar };

    if (file) {
      const { bucket, bucketName, blob, Stream} = FirebaseSetup(file);

      Stream.on('finish', async () => {
        try {
            if (avatar && avatar !== '/images/empty_user.jpg') {
                const removeAvatar = bucket.file(avatar.substring(bucketName.length, avatar.length - 10));
                removeAvatar.delete();
            }

            const newAvatar = `${bucketName}${blob.id}?alt=media`;
            payload.password = bcrypt.hashSync(payload.password, 10);

            await Author.findOneAndUpdate(
                { _id: id },
                {
                    avatar: newAvatar,
                    ...payload,
                },
                { runValidators: true }
            );

            Message(req, 'success', 'Author Successfully Updated');
            res.redirect('/authors');
        } catch (error) {
            Message(req, 'danger', error?.message || 'Failed Update Author');
            res.redirect('/authors');
        }
      });

      Stream.end(file.data);
    } else {
      await Author.findOneAndUpdate({ _id: id }, payload, { runValidators: true });

      Message(req, 'success', 'Author Successfully Updated');
      res.redirect('/authors');
    }
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Update Author');
    res.redirect(`/authors/edit/${id}`);
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const { avatar } = await Author.findOne({ _id: id }).select('avatar');

    if (avatar !== '/images/empty_user.jpg') {
      const { bucket, bucketName } = FirebaseSetup();
      const removeAvatar = bucket.file(avatar.substring(bucketName.length, avatar.length - 10));
      removeAvatar.delete();
    }

    await Post.deleteMany({ author: id });
    const response = await Author.findOneAndDelete({ _id: id });
    Message(req, 'success', `Author with email : ${response.email} Successfully Deleted`);
    res.redirect('/authors');
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Delete Author');
    res.redirect('/authors');
  }
}

module.exports = {
  index,
  create,
  insert,
  edit,
  update,
  remove
}