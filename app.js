const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const http = require("http");
const _ = require("lodash");
const multer = require("multer");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const res = require("express/lib/response");
const app = express();

// Firebase integration
const firebase = require("firebase/app");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "your-space-b84f6.firebaseapp.com",
  projectId: "your-space-b84f6",
  storageBucket: process.env.BUCKET_URL,
  messagingSenderId: process.env.MSG_SENDER,
  appId: process.env.APP_ID,
  measurementId: process.env.M_ID,
};
firebase.initializeApp(firebaseConfig);
const storage = getStorage();
const upload = multer({ storage: multer.memoryStorage() });

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const postSchema = {
  title: String,
  content: String,
  file: String,
  password: String,
};

const Post = mongoose.model("Post", postSchema);

app.get("/", function (req, res) {
  Post.find({}, function (err, foundPosts) {
    if (err) {
      console.log(err);
    } else {
      res.render("home", {
        posts: foundPosts,
      });
    }
  });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

// Create Post
app.post("/compose", upload.single("myfile"), async function (req, res) {

  const folderName = "uploads"; // Specify the folder name
  const filePath = `${folderName}/${req.file.originalname}`;

  const StorageRef = ref(storage, filePath);
  const metadata = {
    contentType: req.file.mimetype,
  };
  uploadBytes(StorageRef, req.file.buffer, metadata)
    .then(() => {
      getDownloadURL(StorageRef)
        .then(async (url) => {
          let passHash = "";
          if (req.body.password) {
            passHash = await bcrypt.hash(req.body.password, 10);
          }

          const post = new Post({
            title: req.body.postTitle,
            content: req.body.blog,
            file: url,
            password: passHash,
          });

          post.save(function (err) {
            if (!err) {
              res.redirect("/");
            }
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send(err);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

// Read Post
app.get("/posts/:postId", function (req, res) {
  let requestedPostId = req.params.postId;
  Post.findOne({ _id: requestedPostId }, function (err, post) {
    res.render("post", {
      title: post.title,
      content: post.content,
      postId: post._id,
      file: post.file,
    });
  });
});

//For Editing the post
app.get("/posts/:postId/edit", (req, res) => {
  Post.findById(req.params.postId, (err, post) => {
    if (err) {
      console.log(err);
    } else {
      res.render("edit", { post: post });
    }
  });
});

app.post("/posts/:postId/edit", upload.single("myfile"), (req, res) => {
  Post.findById(req.params.postId, async (err, post) => {
    if (err) {
      res.send(err);
      return;
    }

    const result = await bcrypt.compare(req.body.password, post.password);
    if (!result) {
      res.send("Invalid password");
      return;
    }
  const folderName = "uploads"; // Specify the folder name
  const filePath = `${folderName}/${req.file.originalname}`;

  const StorageRef = ref(storage, filePath);
    const metadata = {
      contentType: req.file.mimetype,
    };
    uploadBytes(StorageRef, req.file.buffer, metadata)
      .then(() => {
        getDownloadURL(StorageRef)
          .then((url) => {
            Post.findByIdAndUpdate(
              req.params.postId,
              {
                $set: {
                  title: req.body.title,
                  content: req.body.content,
                  file: url,
                },
              },
              (err, update) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Post Updated");
                  res.redirect("/");
                }
              }
            );
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send(err);
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  });
});


//For Deleting the post
app.post("/posts/:postId/delete", function (req, res) {
  Post.deleteOne({ _id: req.params.postId }, function (err) {
    if (err) {
      res.send(err);
    } else {
      console.log("SuccesFully Deleted this Post");
      res.redirect("/");
    }
  });
});

app.get("/posts/:postId/view", function (req, res) {
  const postId = req.params.postId;
  Post.findById(postId, function (err, post) {
    if (err) {
      res.send(err);
    } else {
      if (!post.password || post.password.length == 0) {
        res.redirect(post.file);
        return;
      }
      res.render("view", {
        title: post.title,
        postId: post._id,
      });
    }
  });
});


app.post("/posts/:postId/view", function (req, res) {
  const { password } = req.body;
  const { postId } = req.params;

  Post.findById(postId, function (err, post) {
    if (err) {
      res.send(err);
      return;
    }

    console.log(password, post.password);
    const result = bcrypt.compareSync(password, post.password);
    if (result) {
      res.redirect(post.file);
    } else {
      res.send("Invalid Password");
    }
  });
});

app.get("/posts/:postId/download", function (req, res) {
  const postId = req.params.postId;
  Post.findById(postId, function (err, post) {
    if (err) {
      res.send(err);
    } else {
      if (!post.password || post.password.length == 0) {
        res.attachment(post.file);
        res.redirect(post.file);
        return;
      }
      res.render("download", {
        title: post.title,
        postId: post._id,
      });
    }
  });
});

app.post("/posts/:postId/download", function (req, res) {
  const { password } = req.body;
  const { postId } = req.params;

  Post.findById(postId, function (err, post) {
    if (err) {
      res.send(err);
      return;
    }
    const result = bcrypt.compareSync(password, post.password);
    if (result) {
      res.attachment(post.file);
      res.redirect(post.file);
    } else {
      res.send("Invalid Password");
    }
  });
});

//Listening the port Locally or heroku
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGOD_URL, () => {
  console.log("connected to mongodb");
  app.listen(port, () => {
    console.log("Server started on port 4000");
  });
});
