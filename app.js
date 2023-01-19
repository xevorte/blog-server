const createError = require('http-errors');
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fileupload = require('express-fileupload');
const firebase = require('firebase-admin');
// const firebaseServiceAccount = require('./config/');

const mainRouter = require('./app/main/router');
const postsRouter = require('./app/post/router');
const categoriesRouter = require('./app/category/router');
const tagsRouter = require('./app/tag/router');
const authorsRouter = require('./app/author/router');
const commentsRouter = require('./app/comment/router');

const app = express();
// const firebaseConfig = {

// };
// firebase.initializeApp({
//     ...firebaseConfig,
//     credential: firebase.credential.cert(firebaseServiceAccount),
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(fileupload());
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 120 * 60 * 1000
    },
  })
);
app.use(flash());
app.use(methodOverride('_method'));
app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
  limit: '50mb', extended: false
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/dist', express.static(path.join(__dirname, 'public/dist')));
app.use('/quill', express.static(path.join(__dirname, 'node_modules/quill')));

app.use('/', mainRouter);
app.use('/posts', postsRouter);
app.use('/categories', categoriesRouter);
app.use('/tags', tagsRouter);
app.use('/authors', authorsRouter);
app.use('/comments', commentsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app