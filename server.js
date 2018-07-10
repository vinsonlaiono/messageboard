const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var session = require('express-session');

app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

const flash = require('express-flash');
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));

var path = require('path');

app.use(express.static(path.join(__dirname, './static')));

app.set('views', path.join(__dirname, './views'));

app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/message-board');

const PostSchema = new mongoose.Schema({
    postmessage: { type: String, required: [true, "Posts must have a title"] },
    content: { type: String, required: [true, "Posts must have content"] },
}, { timestamps: true })

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: [true, "Blogs must have a title"], minlength: [3, "Titles must have at least 3 characters"] },
    posts: [PostSchema]
}, { timestamps: true })

const UserSchema = new mongoose.Schema({
    name: { type: String, required: [true, "A first name is required"] },
    message: [BlogSchema]
}, { timestamps: true })
mongoose.model('User', UserSchema);
mongoose.model('Message', BlogSchema);
mongoose.model('Post', PostSchema);

var User = mongoose.model('User');
var Message = mongoose.model('Message');
var Post = mongoose.model('Post');

mongoose.Promise = global.Promise;

// Render root route
app.get('/', function (req, res) {
    User.find({}, function (err, users) {
        if (err) {
            console.log(err)
            res.redirect('/')
        } else {
            var allUsers = [];
            for (i = 0; i < users.length; i++) {
                allUsers.push(users[i]);
            }
        }
        Message.find({}, function(err, messages){
            if (err) {
                console.log(err)
                res.redirect('/')
            } else {
                var allMessages = [];
                for (i = 0; i < messages.length; i++) {
                    allMessages.push(messages[i]);
                }
            }
            console.log("All Messages------: ", allMessages)
            console.log("All Users: ", allUsers)
            res.render('index', { users: allUsers });
            res.end()
            console.log("-------------")
        })
    })

})


app.post('/addMessage', function (req, res) {
    
    var messages = new Message({ title: req.body.message })

    messages.save(function (err) {
        if (err) {
            console.log("something went wrong" + err)
            res.redirect('/')
        } else { console.log('message saved') }
    })
    var user = new User({ name: req.body.name, message: messages })

    user.save(function (err) {
        if (err) {
            console.log("something went wrong" + err)
            res.redirect('/')
        } else { res.redirect('/') }
    })


})// end post add message

app.post('/addPost/:id', function(req, res){
    console.log("POST DATA", req.body);
    console.log(req.params.id)
    
    var post = new Post({postmessage: req.body.name, content: req.body.message})

    post.save(function (err) {
        if (err) {
            console.log("something went wrong" + err)
            res.redirect('/')
        } else { console.log("Saved Post") }
    })

    Message.update({_id: req.params.id}, {$push: {posts : post}}, function(err, data) {
        if(err){
            console.log(err);
        } else {
            console.log('successfully added a new comment');
        }
    })  
    
    res.redirect('/')
})// end post add post message

app.get('/deleteAll', function (req, res) {
    User.remove({}, function (err) {
        // This code will run when the DB has attempted to remove all matching records to {}
    })
    Message.remove({}, function (err) {
        // This code will run when the DB has attempted to remove all matching records to {}
    })
    Post.remove({}, function (err) {
        // This code will run when the DB has attempted to remove all matching records to {}
    })
    res.redirect('/')
})

app.listen(8000, function () {
    console.log('Listening on port: 8000')
});