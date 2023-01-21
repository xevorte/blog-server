![x-panel-2](https://user-images.githubusercontent.com/64916445/213869239-be797200-b774-4388-a909-d1bcaa52935b.jpg)

<div align="center">

# X Panel Blog Server 💻

</div>

<div align="center">

<p align="center">
	<img src="https://img.shields.io/github/issues/xevorte/blog-server?style=flat-square">
	<img src="https://img.shields.io/github/stars/xevorte/blog-server?style=flat-square"> 
	<img src="https://img.shields.io/github/forks/xevorte/blog-server?style=flat-square">
	<img src="https://img.shields.io/github/license/xevorte/blog-server?style=flat-square">
	<img src="https://img.shields.io/badge/maintained%3F-no-red.svg?style=flat-square">
	<img src="https://img.shields.io/github/followers/xevorte.svg?style=flat-square&label=followers">
</p>

</div>

<p align="center">
  <b><a href="https://github.com/xevorte/blog-server">X Panel Blog Server</a></b> is an Admin Dashboard Service that can help you develop personal blog. Made by Express.
</p>

##

<p align="center">
  <a href="https://xevorte-blog-server.fly.dev" target="_blank">Demo</a> •
  <a href="#installation-guide">Installation</a> •
  <a href="#contribution">Contribution</a> •
  <a href="#license">License</a>
</p>

## Installation Guide

You may need to use Node.js v16.9.0 or above to continue with installation guide.

## Build Setup

```bash
# clone the repository
$ git clone https://github.com/xevorte/blog-server.git

# navigate to the folder
$ cd blog-server
```

After clone the repository and navigate to the folder, you can use few commands below

```bash
# install dependencies using the node package manager of your choice. For example run
$ npm install
# or
$ yarn install

# open Mongodb Compass then connect to `localhost:27017`
# then create new database, example:
$ database name : `blog-server`
$ collection name : `users`

# after that continue create all collections with names:
$ authors, categories, comments, posts, tags

# finally after creating all 6 collections, you can `ADD DATA` from each collection using file from folder `database`
$ authors.json, categories.json, comments.json, posts.json, tags.json, users.json

# then create your own `.env` file using format from file `env` , example:
$ MODE=dev
$ PORT=4000
$ SERVICE_NAME=x-panel-blog-server
$ MONGO_URL=mongodb://127.0.0.1:27017/blog-server
$ JWT=keyforjwt
```

Setup your own `Firebase`

```bash

# open console.firebase.google.com
# sign in or sign up using your gmail account
# click `Add a project` for create a new project
# enter project name, eg. `x-panel`
# prefer to disable google analytics and just hit Continue button
# in overview you can add Firebase to web app by click `</>` icon circle button
# then register app name, prefer to disable `Also set up Firebase Hosting for this app.`
# in `Add Firebase SDK` , copy this and continue to console

`const firebaseConfig = {
  ...
};`

# open app.js and uncomment the commented code
# replace `firebaseConfig` you just copy to line 22

# back to Project Overview in Firebase
# click `Build` dropdown in sidebar and choose `Storage`
# click `Get Started` and start in production mode, next and done
# go to `Rules` tab, change line 5 to:

$ allow read; allow write: if request.auth != null;

# then go to `Project Setting` by clicking on wheel button or option button in sidebar beside `Project Overview`
# go to tab `Service Accounts` then download private key by click `Generate new private key`

$ put file inside config folder

# go back to app.js
# at line 12, change require config path to your private key path
# now we're done! just finish and test by running in terminal

$ `npm run dev` or `yarn dev` 

```

You can change role on `users` collection into `admin` inside MongoDB Compass for explore the app

## License

MIT License.

## Author

Created by <a href="https://github.com/xevorte">Xevorte</a> <br/>
Template [Mazer](https://github.com/zuramai/mazer) by [@zuramai](https://github.com/zuramai)
