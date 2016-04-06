var port = process.env.PORT || 8081;

var connect = require('connect');
var serveStatic = require('serve-static');
var vhost = require('vhost');
var fs = require('fs');

// create main app
var app = connect();

var directories = fs.readdirSync('./modules');
directories.forEach(function(directory) {
	
	if (!directory.startsWith('.')) {
		var vhost_name = directory + '.localhost';
		var modulePath = './modules/'+directory;

		var credentials_config = require(modulePath+"/credentials.json");
		if (credentials_config) {
			console.log('found credentials configuration..');
			var credentials = {
				clientID: credentials_config.client_id,
	  			clientSecret: credentials_config.client_secret,
	  			site: 'http://localhost:8080'
			};

			var oauth2 = require('simple-oauth2')(credentials);
	
			var module =connect();
			
			module.use(function(req,res,next){
				console.log(req.originalUrl);
				if (req.originalUrl === '/token') {
					console.log('requesting token...');

					// Get the access token object for the client
					oauth2.client.getToken({}, function(error,result){
						 if (error) { 
						  	console.log('Access Token Error', error.message);
						  	res.status(400).send('Bad Request');
						  	next();
						 }
	  					else {
	  						console.log(result);
	  						var token = oauth2.accessToken.create(result);
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify(result));
							next();
						}
					});
				} else {
				next();
			}
			});
			module.use(serveStatic('./modules/'+directory));
			app.use(vhost(vhost_name, module));
			}
	}
});

app.listen(port,function() {
	console.log('eu.ownyourdata.webhost is listening on port '+port);
});
