var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var _ =require('underscore');
var Movie = require('./models/movie');
var User = require('./models/user');
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var app = express();

mongoose.connect('mongodb://localhost/imooc');

app.set('views', './views/pages');
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.locals.moment = require('moment');
app.listen(port);

console.log('imooc started on port ' + port);

//伪造数据
// app.get('/', function (req, res) {
// 	res.render('index', { 
// 		title: 'imooc 首页',
// 		movies:[{
// 			title: '机械战警',
// 			_id: 1,
// 			poster: 'http://r3.ykimg.com/05160000530EEB63675839160D0B79D5'
// 		}, {
// 			title: '机械战警',
// 			_id: 2,
// 			poster: 'http://r3.ykimg.com/05160000530EEB63675839160D0B79D5'
// 		}, {
// 			title: '机械战警',
// 			_id: 3,
// 			poster: 'http://r3.ykimg.com/05160000530EEB63675839160D0B79D5'
// 		}, {
// 			title: '机械战警',
// 			_id: 4,
// 			poster: 'http://r3.ykimg.com/05160000530EEB63675839160D0B79D5'
// 		}, {
// 			title: '机械战警',
// 			_id: 5,
// 			poster: 'http://r3.ykimg.com/05160000530EEB63675839160D0B79D5'
// 		}, {
// 			title: '机械战警',
// 			_id: 6,
// 			poster: 'http://r3.ykimg.com/05160000530EEB63675839160D0B79D5'
// 		}]
// 	});
// });

app.get('/', function (req, res) {
	Movie.fetch(function (err, movies) {
		if (err) {
			console.log(err);
		}

		res.render('index', {
			title: 'imooc 首页',
			movies: movies
		});
	});
});

app.post('/user/signup', function (req, res) {
	var _user = req.body.user;

	User.find({ name: _user.name }, function (err, user) {
		if (err) {
			console.log(err);
		}

		//判断条件不能写成if (user)，否则会不能录入到数据库中
		//因为user是一个数组，不管有没有在数据库中找没找到,就算没找到，user是一个空数组，仍然是一个对象，if(user)始终为true
		//console.log(user);
		if (user.length) {
			return res.redirect('/');
		} else {
			var user = new User(_user);

			user.save(function (err, user) {
				if (err) {
					console.log(err);
				}

				res.redirect('/admin/userlist');
				console.log(user);
			});
		}
	});
});

app.post('/user/signin', function (req, res) {
	var _user = req.body.user;
	var name = _user.name;
	var password = _user.password;
	var hashPassword;

	User.findOne({ name: name }, function (err, user) {
		if (err) {
			console.log(err);
		}

		if (!user) {
			//user是一个对象
			//console.log(user);
			console.log('user not found!');
			return res.redirect('/');
		}

		user.comparePassword(password, function (err, isMatch) {
			if (err) {
				console.log(err);
			}

			if (isMatch) {
				console.log('Password is matched!');
				return res.redirect('/');
			} else {
				console.log('Password is not matched!');
				return res.redirect('/');
			}
		});
	});
});

app.get('/admin/userlist', function (req, res) {
	User.fetch(function (err, users) {
		if (err) {
			console.log(err);
		}
		
		res.render('userlist', {
			title: 'imooc 用户列表页',
			users: users
		});
	});
});

//伪造数据
// app.get('/movie/:id', function (req, res) {
// 	res.render('detail', { 
// 		title: 'imooc 详情页',
// 		movie: {
// 			doctor: '何塞·帕迪里亚',
// 			country: '美国',
// 			title: '机械战警',
// 			year: 2014,
// 			poster: 'http://r3.ykimg.com/05160000530EEB63675839160D0B79D5',
// 			language: '英语',
// 			flash: 'http://player.youku.com/player.php/sid/XNjA1Njc0NTUy/v.swf',
// 			summary: '哈哈哈'
// 		}
// 	});
// });

app.get('/movie/:id', function (req, res) {
	var id = req.params.id;

	Movie.findById(id, function (err, movie) {
		res.render('detail', {
			title: 'imooc ' + movie.title,
			movie: movie
		});
	});
});

app.get('/admin/movie', function (req, res) {
	res.render('admin', {
		title: 'imooc后台录入页',
		movie: {
			title: '',
			doctor: '',
			country: '',
			year: '',
			poster: '',
			flash: '',
			summary: '',
			language: ''
		}
	});
});

//admin
app.get('/admin/update/:id', function (req, res) {
	var id = req.params.id;

	if (id) {
		Movie.findById(id, function (err, movie) {
			if (err) {
				console.log(err);
			}

			res.render('admin', {
				title: 'imooc 后台更新页',
				movie: movie
			});
		});
	}
});

//不知为何下面的代码有问题
// app.get('/admin/update/:id', function (req, res) {
// 	var id = req.params.id;

// 	if (id) {
// 		Movie.findById(id, function (err, movie){
// 			res.render('admin', {
// 				title: 'imooc 后台更新页',
// 				movie: movie
// 			});
// 		});
// 	}
// });

//cannot read property _id of undefined when using the following commented codes.
// app.post('/admin/movie/new', function (req, res) {
// 	var id = req.body.Movie._id;
// 	var movieObj = req.body.Movie;
// 	var _movie;

// 	if (id !== 'undefined') {
// 		Movie.findById(id, function (err, movie) {
// 			if (err) {
// 				console.log(err);
// 			}

// 			_movie = _.extend(movie, movieObj);
// 			_movie.save(function (err, movie) {
// 				if (err) {
// 					console.log(err);
// 				}

// 				res.redirect('/movie/' + movie._id);
// 			});
// 		});
// 	} else {
// 		_movie = new Movie({
// 			doctor: movieObj.doctor,
// 			title: movieObj.title,
// 			country: movieObj.country,
// 			language: movieObj.language,
// 			year: movieObj.year,
// 			poster: movieObj.poster,
// 			summary: movieObj.summary,
// 			flash: movieObj.flash
// 		});

// 		_movie.save(function (err, movie) {
// 			if (err) {
// 				console.log(err);
// 			}

// 			res.redirect('/movie/' + movie._id);
// 		});
// 	}
// });

app.post('/admin/movie/new', function (req, res) {
  var id = req.body.movie._id;
  var movieObj = req.body.movie;
  var _movie;
 
  if (id !== 'undefined') {
    Movie.findById(id, function (err, movie) {
      if (err) {
        console.log(err);
      }
 
      _movie = _.extend(movie, movieObj);
      _movie.save(function (err, movie) {
        if (err) {
          console.log(err);
        }
 
        res.redirect('/movie/' + movie._id);
      })
    })
  } else {
    _movie = new Movie({
      doctor: movieObj.doctor,
      title: movieObj.title,
      country: movieObj.country,
      language: movieObj.language,
      year: movieObj.year,
      poster: movieObj.poster,
      summary: movieObj.summary,
      flash: movieObj.flash
    });
 
    _movie.save(function (err, movie) {
      if (err) {
        console.log(err);
      }
 
      res.redirect('/movie/' + movie._id);
    });
  }
})


//伪造数据
//admin list
// app.get('/admin/list', function (req, res) {
// 	res.render('list', { 
// 		title: 'imooc 列表页',
// 		movies: [{
// 			title: '机械战警',
// 			_id: 1,
// 			doctor: '何塞·帕迪里亚',
// 			country: '美国',
// 			year: 2014,
// 			poster: 'http://r3.ykimg.com/05160000530EEB63675839160D0B79D5',
// 			language: '英语',
// 			flash: 'http://player.youku.com/player.php/sid/XNjA1Njc0NTUy/v.swf',
// 			summary: '哈哈哈'
// 		}]
// 	});
// });

app.get('/admin/list', function (req, res) {
	Movie.fetch(function (err, movies) {
		if (err) {
			console.log(err);
		}
		
		res.render('list', {
			title: 'imooc 列表页',
			movies: movies
		});
	});
});

app.delete('/admin/list', function (req, res) {
	var id = req.query.id;

	if (id) {
		Movie.remove({_id: id}, function (err, movie) {
			if (err) {
				console.log(err);
			} else {
				res.json({ success: 1 });
			}
		});
	}
});