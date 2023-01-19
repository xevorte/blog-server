const { Message, Page } = require('../middleware');
const Tag = require('./model');

const index = async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    const index = (page > 1 ? page - 1 : 0) * limit || 0;
    const total = await Tag.find({
      $or: [{ name: { $regex: search || '', $options: 'i' } }],
    });
    const data = await Tag.find({
      $or: [{ name: { $regex: search || '', $options: 'i' } }],
    }).skip(index).limit(limit || 5);
    const pages = Math.ceil(total.length / (limit || 5));

    const alert = {
      status: req.flash('alertStatus'),
      message: req.flash('alertMessage'),
      messageDetail: req.flash('alertMessageDetail')
    }

    res.render('modules/tags/read', {
      alert, pages, data, currentPage: parseInt(page) || 1, index: index + 1,
      page: Page(req, search ? `Search Tags : ${search}` :'Tags')
    })
  } catch (error) {
    Message(req, 'danger', error?.message || 'Internal Server Error');
    res.redirect('/');
  }
}
const create = async (req, res) => {
  try {
    const alert = {
      status: req.flash('alertStatus'),
      message: req.flash('alertMessage'),
      messageDetail: req.flash('alertMessageDetail')
    };

    res.render('modules/tags/create', {
      alert, page: Page(req, 'Create Tag')
    });
  } catch (error) {
    Message(req, 'danger', error?.message || 'Internal Server Error');
    res.redirect('/tags');
  }
}

const insert = async (req, res) => {
  try {
    const payload = req.body;

    await Tag.create(payload);

    Message(req, 'success', 'Tag Successfully Created');
    res.redirect('/tags');
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Insert Tag');
    res.redirect('/tags/create');
  }
}

const edit = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Tag.findById(id);

    const alert = {
      status: req.flash('alertStatus'),
      message: req.flash('alertMessage'),
      messageDetail: req.flash('alertMessageDetail')
    };

    res.render('modules/tags/edit', {
      alert, data, page: Page(req, 'Edit Tag')
    });
  } catch (error) {
    Message(req, 'danger', error?.message || 'Internal Server Error');
    res.redirect('/tags');
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    await Tag.findOneAndUpdate({ _id: id }, {
      name, status
    }, { runValidators: true });

    Message(req, 'success', 'Tag Successfully Updated');
    res.redirect('/tags');
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Update Tag');
    res.redirect('/tags/edit');
  }
}

const swap = async (req, res) => {
  try {
    const { id } = req.params;
    const tag = await Tag.findOne({ _id: id });

    if (tag.status === 'active') {
      tag.status = 'nonactive';
    } else {
      tag.status = 'active';
    }

    tag.save();
    Message(req, 'success', 'Tag Status Successfully Switched');
    res.redirect('/tags');
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Switch Tag Status');
    res.redirect('/tags');
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    await Tag.deleteOne({ _id: id });

    Message(req, 'success', 'Tag Successfully Deleted');
    res.redirect('/tags');
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Delete Tag');
    res.redirect('/tags');
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