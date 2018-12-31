var bodyParser        = require("body-parser"),
    mongoose          = require("mongoose"),
    express           = require("express"),
    methodOverride    = require("method-override"),
    expressSanitizer  = require("express-sanitizer"),
    app               = express();
    

app.use(function(req, res, next){
    console.log("URL: " + req.url);
    console.log("METHOD: " + req.method);
    console.log("");
    next();
});             //this is showing POST because method not yet overriden.
                //When we use POSTMAN to send PUT request, this too shows PUT. 
                //Browsers can't sent PUT Request, hence we used method override middlware. Postman can directly send PUT request hence it's logging method type as PUT even before method ovverriding.
// APP CONFIG

//mongoose.connect("mongodb://localhost/restful_blog_app", {useNewUrlParser: true});
mongoose.connect("mongodb://himansh:himansh1@ds119258.mlab.com:19258/restful_blog_app", {useNewUrlParser: true});


app.set("view engine", "ejs");
app.use(express.static("public"));  

//var func1 = bodyParser.urlencoded({extended: true});
// console.log(func1.toString());   -  do this to view definition of func.. it takes three parameter req, res and next.. and operates on req object..
//app.use(func1);   //this is a middleware and appends the req object by inserting parse data as its property.
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());    //this needs to be after bodyParser middleware
//Sanitizer removes all script and other harmful elements from html form.

//var func2 = methodOverride("_method");
//console.log(func2.toString());
app.use(methodOverride("_method"));

app.use(function(req, res, next){
    console.log("URL: " + req.url);
    console.log("METHOD: " + req.method);
    console.log("");
    next();
})              //this is showing PUT because method overriden.

//  MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);


    /*
        Blog.create({
        title: "Test Blog",
        image: "https://www.thenorthernecho.co.uk/resources/images/7204564.jpg?display=1&htype=0&type=responsive-gallery",
        body: "Hello this is a blog post!"
    });
    */

// RESTFUL ROUTES
app.get("/", function(req, res){
    //res.send("Hello How are you?");
    res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        }else{
            res.render("index", {blogs: blogs});
        }
    });
});

// NEW ROUTE  
app.get("/blogs/new", function(req, res){
    res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res){
    // create blog 
        //console.log(req.body.blog);      req.body.blog is an object which contains all the form data (This is possible due to our naming of form inputs as blog[title], blog[name]...etc)
    
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        }else{
            //then redirect to index
            res.redirect("/blogs/" + newBlog._id);
        }
    });

})

// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("show", {blog: foundBlog});
        }
    })
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("edit", {blog: foundBlog});        
        }
    });
    
})

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //we should've written an middleware for above line instead of repeating it in create and update route.
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE Route
app.delete("/blogs/:id", function(req, res){
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    })
})

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is  Running...");
});