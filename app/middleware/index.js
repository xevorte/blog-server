const jwt = require('jsonwebtoken');
const firebase = require('firebase-admin');
const { JWT } = require('../../config');

const isLogin = async (req, res, next) => {
  if (req.session.user !== undefined || req.cookies.auth !== undefined) {
      if (req.cookies.auth !== undefined) { req.user = jwt.verify(req.cookies.auth, JWT).user };
      next();
  } else {
      res.redirect('/login');
  }
};

const isLoginAdmin = async (req, res, next) => {
  if (req.cookies.auth !== undefined) { req.user = jwt.verify(req.cookies.auth, JWT).user };

  if (req?.session?.user?.role === 'admin' || req?.user?.role === 'admin') {
    next();
  } else {
    Message(req, "danger", "Restricted Access Only");
    res.redirect("/");
  }
}

const Message = (req, status, message, messageDetail = '') => {
  req.flash('alertStatus', status);
  req.flash('alertMessage', message);
  req.flash('alertMessageDetail', messageDetail);
};

const Page = (req, title) => ({
  title,
  avatar: req?.session?.user?.avatar || req?.user?.avatar,
  name: (req?.session?.user?.name || req?.user?.name).slice(0, 12),
  username: (req?.session?.user?.username || req?.user?.username).slice(0, 8),
  path: req.baseUrl,
  pathDetail: req.path
}); 

const FirebaseSetup = (file) => {
  const bucket = firebase.storage().bucket();
  const bucketName = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/`;
  const name = `${Date.now()}-${file?.name.split(' ').join('-').toLowerCase()}`;
  const blob = bucket.file(name);
  return {
      bucket,
      bucketName,
      blob,
      Stream: blob.createWriteStream({
          metadata: { contentType: file?.mimetype },
      }),
  };
};

module.exports = {
  isLogin,
  isLoginAdmin,
  Message,
  Page,
  FirebaseSetup
}