const express = require('express'); // express js
const db = require('./connection/db.js');
const upload = require('./middlewares/fileUpload.js');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');

let isLogin = false

const app = express();
const PORT = 443;

app.set('view engine', 'hbs'); // set template engine

app.use('/public', express.static(__dirname+'/public')); // static folder
app.use('/uploads', express.static(__dirname+'/uploads')); // static folder
app.use(express.urlencoded({ extended: false}));

app.use(
	session({
		cookie: {
			maxAge: 2 * 60 * 60 * 1000,
			secure: false,
			httpOnly: true
		},
		store: new session.MemoryStore(),
		saveUninitialized: true,
		resave: false,
		secret: 'secretValue'
	})
)
app.use(flash())

app.get('/', function(req, res){
	db.connect(function(err, client, done){
		if (err) throw err

		client.query('SELECT * FROM project', function(err, result){
			if (err) throw err

			let data = result.rows

			res.render('index', {projects: data, isLogin: req.session.isLogin, user: req.session.user});
		})
	})
});

app.get('/blog', function(req, res){

	let query = `SELECT blog.id, blog.title, blog.content, blog.image, tb_user.name AS author, blog.post_at
	FROM blog LEFT JOIN tb_user
	ON blog.author_id = tb_user.id`

	db.connect(function(err, client, done){
		if (err) throw err

		client.query(query, function(err, result){
			if (err) throw err

			let data = result.rows

			let dataBlogs = data.map((data)=>{
				return {
					...data,
					post_at: getFullTime(data.post_at),
					post_age: getDistanceTime(data.post_at),
					image: '/uploads/'+data.image,
					isLogin: req.session.isLogin
					}
		})

			res.render('blog', {isLogin: req.session.isLogin, blogs: dataBlogs, user: req.session.user});
		})
	})

});

app.post('/blog', upload.single('image'), function(req, res){

	let data = req.body

	if(!req.session.isLogin){
		req.flash('danger', 'You must login')
		return res.redirect('/add-blog')
	}

	let image = req.file.filename
	let authorId = req.session.user.id
	let query = `INSERT INTO blog(title, content, image, author_id) VALUES ('${data.title}', '${data.content}', '${image}', ${authorId})`

	db.connect(function(err, client, done){
		if (err) throw err

		client.query(query, function(err, result){
			if (err) throw err

			res.redirect('/blog')
		})
	})
	
})

app.get('/delete-blog/:id', function(req, res){
	let id = req.params.id;
	let query = `DELETE FROM blog WHERE id = ${id}`

	db.connect(function(err, client, done){
		if (err) throw err

		client.query(query, function(err, result){
			if (err) throw err

			res.redirect('/blog');
    	});
    });
})

app.get('/add-blog', function(req, res){
	res.render('add-blog', {isLogin: req.session.isLogin, user: req.session.user});
});

app.get('/update-blog/:id', function(req, res){
	let id = req.params.id
	let query = `SELECT * FROM blog WHERE id = ${id}`

	db.connect(function(err, client, done){
		if (err) throw err

		client.query(query, function (err, result) {
			if (err) throw err

			let data = result.rows[0]
			res.render('update-blog', { id: id, blog: data, isLogin: req.session.isLogin, user: req.session.user});

    	});
    });
})

app.post('/update-blog/:id', upload.single('image'), function(req, res){
	let data = req.body
	let id = req.params.id
	let image = req.file.filename
	let query = `UPDATE blog SET title='${data.title}', content='${data.content}', image='${image}' WHERE id = ${id};`

	db.connect(function(err, client, done){
		if (err) throw err

		client.query(query, function (err, result) {
			if (err) throw err

			res.redirect('/blog');

    	});
    });
})

function getFullTime(time) {

    let date = time.getDate()
    let monthIndex = time.getMonth()
    let year = time.getFullYear()

    let hours = time.getHours()
    let minutes = time.getMinutes()

    let result = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`

    return result
}

app.get('/blog-detail/:id', function(req, res){

	let id = req.params.id
	let query = `SELECT blog.title, blog.content, blog.image, tb_user.name AS author, blog.post_at
	FROM blog LEFT JOIN tb_user
	ON blog.author_id = tb_user.id
	WHERE blog.id = ${id}`

	db.connect(function(err, client, done){
		if (err) throw err

		client.query(query, function (err, result) {
			if (err) throw err

			let data = result.rows

			let dataBlog = data.map((data)=>{
				return {
					...data,
					post_at: getFullTime(data.post_at),
					image: '/uploads/'+data.image,
					isLogin: req.session.isLogin
					}
		})
			res.render('blog-detail', { id: id, blog: dataBlog, isLogin: req.session.isLogin });

    	});
    });
});

app.get('/contact-form', function(req, res){
	res.render('contact-form', {isLogin: req.session.isLogin, user: req.session.user});
});

app.get('/register', function(req, res){
	res.render('register');
});

app.post('/register', function(req, res){

	const { name, email, password } = req.body
	const hashedPassword = bcrypt.hashSync(password, 10)
	let query = `INSERT INTO tb_user(name, email, password) VALUES ('${name}', '${email}', '${hashedPassword}')`

	db.connect(function(err, client, done){
		if (err) throw err

		client.query(query, function(err, result){
			if (err) throw err

			res.redirect('/login')
		})
	})
});

app.get('/login', function(req, res){
	res.render('login');
});

app.post('/login', function(req, res){
	const { email, password } = req.body
	let query = `SELECT * FROM tb_user WHERE email = '${email}'`

	db.connect(function(err, client, done){
		if (err) throw err

		client.query(query, function(err, result){
			if (err) throw err

			if (result.rows.length == 0){
				req.flash('danger', 'Email and Password dont Match')
				return res.redirect('/login')
			}

			let isMatch = bcrypt.compareSync(password, result.rows[0].password)

			if (isMatch) {
				req.session.isLogin = true
				req.session.user = {
					id: result.rows[0].id,
					name: result.rows[0].name,
					email: result.rows[0].email
				}
				req.flash('success', 'Login Success')
				res.redirect('/blog')
			} else {
				req.flash('danger', 'Email and Password dont Match')
				res.redirect('/login')
			}
		})
	})
});

app.get('/logout', function(req, res){
	req.session.destroy()
	res.redirect('/blog')
});

// app.get('/', (req, res) => {
// 	res.send('ini halaman utama');
// });

app.listen(PORT, function(){
	console.log(`Server starting on PORT: ${PORT}`);
});

let month = [ 
	'January', 
	'February', 
	'March', 
	'April', 
	'May', 
	'June', 
	'July', 
	'August', 
	'September', 
	'October', 
	'November', 
	'December'
]

function getFullTime(time) {

let date = time.getDate()
let monthIndex = time.getMonth()
let year = time.getFullYear()

let hours = time.getHours()
let minutes = time.getMinutes()

let result = `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`

return result
}

function getDistanceTime(time) {

    let timePost = time
    let timeNow = new Date()

    let distance = timeNow - timePost

    let milisecond = 1000;
    let secondInMinutes = 60;
    let minutesInHour = 60;
    let hourInDay = 23;

    let distanceDay = Math.floor(distance / (milisecond * secondInMinutes * minutesInHour * hourInDay))
    let distanceHour = Math.floor(distance / (milisecond * secondInMinutes * minutesInHour))
    let distanceMinutes = Math.floor(distance / (milisecond * secondInMinutes))
    let distanceSecond = Math.floor(distance / milisecond)

    if ( distanceDay >= 1) {
    return `${distanceDay} day ago` }

    else if ( distanceHour >= 1) {
    return `${distanceHour} hours ago` }

    else  if ( distanceMinutes >= 1) {
    return `${distanceMinutes} minutes ago` }

    else {
        return `${distanceSecond} second ago` }
}