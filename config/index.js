require('dotenv').config();

const rootPath = require('path').resolve(__dirname, '..');

const {
    PORT,
    MONGO_URL,
    JWT
} = process.env;

module.exports = {
    rootPath,
    PORT,
    MONGO_URL,
    JWT
}