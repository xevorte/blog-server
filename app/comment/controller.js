const { Message, Page } = require('../middleware');
const Comment = require('./model');
const Post = require('../post/model');

const index = async (req, res) => {
  try {
    const { search, page, limit } = req.query;
		 const index = (page > 1 ? page - 1 : 0) * limit || 0;
     const total = await Comment.find({
       $or: [
        { name: { $regex: search || '', $options: 'i' } },
        { email: { $regex: search || '', $options: 'i' } },
        { description: { $regex: search || '', $options: 'i' } },
        { status: { $regex: search || '', $options: 'i' } },
       ]
     });
     const data = await Comment.find({
         $or: [
					{ name: { $regex: search || '', $options: 'i' } },
					{ email: { $regex: search || '', $options: 'i' } },
					{ description: { $regex: search || '', $options: 'i' } },
					{ status: { $regex: search || '', $options: 'i' } },
				]
     }).populate('post').skip(index).limit(limit || 10);
     const pages = Math.ceil(total.length / (limit || 10));

    const alert = {
      status: req.flash('alertStatus'),
      message: req.flash('alertMessage'),
      messageDetail: req.flash('alertMessageDetail')
    }

    res.render('modules/comments/read', {
      alert, pages, data, currentPage: parseInt(page) || 1, index: index + 1, page: Page(req, search ? `Search Comments : ${search}` :'Comments')
    })
  } catch (error) {
    Message(req, 'danger', error?.message || 'Internal Server Error');
    res.redirect('/');
  }
}
const create = async (req, res) => {
  try {
    const posts = await Post.find();

    const alert = {
      status: req.flash('alertStatus'),
      message: req.flash('alertMessage'),
      messageDetail: req.flash('alertMessageDetail')
    };

    res.render('modules/comments/create', {
      alert, data: { posts }, page: Page(req, 'Create Comment')
    });
  } catch (error) {
    Message(req, 'danger', error?.message || 'Internal Server Error');
    res.redirect('/comments');
  }
}

const insert = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.post) {
      Message(req, 'danger', 'Please choose one post');
      return res.redirect('/comments/create');
    }

    await Comment.create(payload);

    Message(req, 'success', 'Comment Successfully Created');
    res.redirect('/comments');
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Insert New Comment');
    res.redirect('/comments/create');
  }
}

const edit = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id).populate('post');
    const posts = await Post.find();

    const alert = {
      status: req.flash('alertStatus'),
      message: req.flash('alertMessage'),
      messageDetail: req.flash('alertMessageDetail')
    };

    res.render('modules/comments/edit', {
      alert, data: { comment, posts }, page: Page(req, 'Edit Comment')
    });
  } catch (error) {
    Message(req, 'danger', error?.message || 'Internal Server Error');
    res.redirect('/comments');
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, description, post, status } = req.body;

    await Comment.findOneAndUpdate({ _id: id }, {
      name, email, description, post, status
    }, { runValidators: true });

    Message(req, 'success', 'Comment Successfully Updated');
    res.redirect('/comments');
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Update Comment');
    res.redirect('/comments/edit');
  }
}

const swap = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findOne({ _id: id });

    if (comment.status === 'active') {
      comment.status = 'nonactive';
    } else {
      comment.status = 'active';
    }

    comment.save();
    Message(req, 'success', 'Comment Status Successfully Switched');
    res.redirect('/comments');
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Switch Comment Status');
    res.redirect('/comments');
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    await Comment.deleteOne({ _id: id });

    Message(req, 'success', 'Comment Successfully Deleted');
    res.redirect('/comments');
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Delete Comment');
    res.redirect('/comments');
  }
}

module.exports = {
  index,
  create,
  insert,
  edit,
  update,
  swap,
  remove
}