const { Message, Page } = require('../middleware');
const Category = require('./model');
const Tag = require('../tag/model');
const Post = require('../post/model');
const Author = require('../author/model');
const mongoose = require('mongoose');

const ObjectId = mongoose.Types.ObjectId;

const index = async (req, res) => {
  try {
     const { search, page, limit } = req.query;
		 const index = (page > 1 ? page - 1 : 0) * limit || 0;
     const total = await Category.find({
       $or: [
        { name: { $regex: search || '', $options: 'i' } },
        { description: { $regex: search || '', $options: 'i' } },
        { status: { $regex: search || '', $options: 'i' } },
       ]
     });
     const data = await Category.find({
         $or: [
					{ name: { $regex: search || '', $options: 'i' } },
					{ description: { $regex: search || '', $options: 'i' } },
					{ status: { $regex: search || '', $options: 'i' } },
				]
     }).populate('tags').skip(index).limit(limit || 3);
     const pages = Math.ceil(total.length / (limit || 3));

    const alert = {
      status: req.flash('alertStatus'),
      message: req.flash('alertMessage'),
      messageDetail: req.flash('alertMessageDetail')
    }

    res.render('modules/categories/read', {
      alert, pages, data, currentPage: parseInt(page) || 1, index: index + 1, page: Page(req, search ? `Search Categories : ${search}` :'Categories')
    })
  } catch (error) {
    Message(req, 'danger', error?.message || 'Internal Server Error');
    res.redirect('/');
  }
}

const create = async (req, res) => {
  try {
    const categories = await Category.find({ tags: { $exists: true } }).select('tags');
    const categoriesTags = categories.map(category => category.tags).flat();
    const tags = await Tag.find({ _id: { $nin: categoriesTags } });

    const alert = {
      status: req.flash('alertStatus'),
      message: req.flash('alertMessage'),
      messageDetail: req.flash('alertMessageDetail')
    };

    res.render('modules/categories/create', {
      alert, data: { tags }, page: Page(req, 'Create Category')
    });
  } catch (error) {
    Message(req, 'danger', error?.message || 'Internal Server Error');
    res.redirect('/categories');
  }
}

const insert = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.tags) {
      Message(req, 'danger', 'Atleast input one tag');
      return res.redirect('/categories/create');
    }

    await Category.create(payload);

    Message(req, 'success', 'Category Successfully Created');
    res.redirect('/categories');
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Insert New Category');
    res.redirect('/categories/create');
  }
}

const edit = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id).populate('tags');

    const categories = await Category.find({ tags: { $exists: true } }).select('tags');

    const currentTags = await Tag.find({ _id: { $in: category.tags.map(tags => tags._id) } });
    const availableTags = await Tag.find({ _id: { $nin: categories.map(category => category.tags).flat() } });
    const tags = [ ...currentTags, ...availableTags ]

    const alert = {
      status: req.flash('alertStatus'),
      message: req.flash('alertMessage'),
      messageDetail: req.flash('alertMessageDetail')
    };

    res.render('modules/categories/edit', {
      alert, data: { category, tags }, page: Page(req, 'Edit Category')
    });
  } catch (error) {
    Message(req, 'danger', error?.message || 'Internal Server Error');
    res.redirect('/categories');
  }
}

const update = async (req, res) => {
  const { id } = req.params;

  try {
    const { name, description, tags, status } = req.body;

    if (!tags) {
      Message(req, 'danger', 'Atleast input one tag');
      return res.redirect(`/categories/edit/${id}`);
    }

    await Category.findOneAndUpdate({ _id: id }, {
      name, description, tags, status
    }, { runValidators: true });

    Message(req, 'success', 'Category Successfully Updated');
    res.redirect('/categories');
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Update Category');
    res.redirect(`/categories/edit/${id}`);
  }
}

const swap = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ _id: id });

    if (category.status === 'active') {
      category.status = 'nonactive';
    } else {
      category.status = 'active';
    }

    category.save();
    Message(req, 'success', 'Category Status Successfully Switched');
    res.redirect('/categories');
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Switch Category Status');
    res.redirect('/categories');
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    await Author.updateMany({ favoriteCategory: id }, { $unset: { favoriteCategory: '' } });
    await Post.deleteMany({ category: id });
    await Category.deleteOne({ _id: id });

    Message(req, 'success', 'Category Successfully Deleted');
    res.redirect('/categories');
  } catch (error) {
    Message(req, 'danger', error?.message || 'Failed Delete Category');
    res.redirect('/categories');
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