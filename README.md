# YourSpace 
> A Space for all your files

- Users can upload password protected files of any format (.pdf,.png,.jpg,.mp4,.docx,etc).

- Users with the link and password can only Edit/Modify the files.

- Implemented CRUD operations on the uploaded Files.

- Developed REST APIs using all HTTP Methods.

- The files uploaded will be removed automatically after 24 hrs if User do not delete it.

## .env Setup Instruction
> Add .env file in root Directory and write 

```
MONGOD_URL
PORT
API_KEY
APP_ID
MSG_SENDER
M_ID
BUCKET_URL

```

## Currently Live in [YourSpace-Cyclic](https://determined-waistcoat-clam.cyclic.app/)

![Home Page](/sample-pictures/home-page.jpg)
![Home List Page](/sample-pictures/files-list.jpg)

## Problem Statement
**File system CRUD API** :
In this problem, you have to make an apis to upload,
read, update and delete files.

## The user can perform the following operations:

- Upload a file
- Get list of all the files
- Download a file
- Update/Edit a file
- Delete a file

## Tech Stack Used
- HTML5
- CSS3
- JavaScript
- NodeJS
- EJS
- MONGODB
- Firebase Storage

## Dependencies 
- Body-Parser
- Dot env
- EJS
- Express
- Loadash
- Mongoose
- Multer

## To clone and work locally 
- Clone the Repo locally 
- run npm install command to install all the modules required for this Project
- create .env file as per Setup Instruction


# EndPoints
Base URL https://determined-waistcoat-clam.cyclic.app/
## /compose

![Compose Page](/sample-pictures/compose-page.jpg)
> It is post route that take multiple values 
The user can upload the files from this route by clicking on Upload button from the home page 
It will have three required column asking for title for the file name then a quick description about the file and the file itself.

>There is one entry with password and if the user want to keep his file password protected then only he/she can add the password.

On clicking Pubish Button it will redirect to Home Page and show the list of Uploads 
```
{
    title: req.body.postTitle,
    content: req.body.blog,
    file: url/firebase,
 }
```

## posts/:id

![Post Page](/sample-pictures/post-img.jpg)

> This route shows a particular post (here file description)
It will show data on the basis of id of the file { _id: requestedPostId }
On the basis of id it will render the other details of the file 
```
res.render("post", {
      title: post.title,
      content: post.content,
      postId: post._id,
      file: post.file,
    });
```
## posts/:id/edit 
> First it will get all the value as per id and put the value on the compose like edit form where you can update the data which will replace the older one.

> This route will redirect to the home page and now boom your file has been updated.
```
$set: {
        title: req.body.title,
        content: req.body.content,
        file: req.file.filename,
      },
```

## posts/:id/delete
> This post route will perform delete action with the id value and uses mongo feature of **deleteOne**
```
{ _id: req.params.postId }
```


## That's All the project was. All the issues you face are welcomed just raise it 	:gift_heart:
