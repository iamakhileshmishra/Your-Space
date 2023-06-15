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


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// console.log(process.env);
//storage for the upload
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads");
  },
  filename: function (request, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});
// upload parameter for multer
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});
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
  let passHash = "";
  if (req.body.password) {
    passHash = await bcrypt.hash(req.body.password, 10);
  }

  const post = new Post({
    title: req.body.postTitle,
    content: req.body.blog,
    file: req.file.filename,
    password: passHash,
  });
  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
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
  Post.findById(req.params.postId, (err, post) => {
    if (err) {
      res.send(err);
      return;
    }
    console.log(req.body, post);
    const result = bcrypt.compareSync(req.body.password, post.password);
    if (!result) {
      res.send("Invalid password");
      return;
    }
    Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          file: req.file.filename,
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
      console.log(post);
      if (!post.password || post.password.length == 0) {
        res.sendFile(`./uploads/${post.file}`, { root: __dirname });
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
      res.sendFile(`./uploads/${post.file}`, { root: __dirname });
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
        res.download(`${__dirname}/uploads/${post.file}`, post.file);
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
      res.download(`${__dirname}/uploads/${post.file}`, post.file);
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
mongoose.connect(process.env.MONGOD_URL,() => {
  console.log("connected to mongodb");
  app.listen(port, () => {
    console.log("Server started on port 4000");
    
  });
});
