var port = process.env.PORT || 8081;
var moduleport = process.env.MODULEPORT || 8082;

var connect = require('connect');
var serveStatic = require('serve-static');
var vhost = require('vhost');
var fs = require('fs');
var httpProxy = require('http-proxy').createProxyServer({});
// create main app
var app = connect();

var directories = fs.readdirSync('./modules');

function proxy(credentials) {
	return function(req,res,next) {
		var oauth2 = require('simple-oauth2')(credentials);
	  	oauth2.client.getToken({},function(error,result){
	    	if(error) {
		      console.log('Access Token Error', error.message);
		      res.status(400).send('Bad Request');
		      next();
	    	}

	    	var token = oauth2.accessToken.create(result).token.access_token;

		    httpProxy.on('proxyReq', function(proxyReq, req, res, options) {
		      proxyReq.setHeader('Authorization', 'Bearer '+token);
		    });

		    httpProxy.web(req, res,{target: 'http://localhost:8080/api'});
	  });
  }
}

function host(directory) {
		var modulePath = './modules/'+directory;
  		var module = connect();
		var credentials_config = require(modulePath+"/credentials.json");
		
			console.log('found credentials configuration..');
			var credentials = {
				clientID: credentials_config.client_id,
	  			clientSecret: credentials_config.client_secret,
	  			site: 'http://localhost:8080'
			};
			
			module.use('/api',proxy(credentials));

			var port = moduleport++;

			module.use(serveStatic('./modules/'+directory));
			module.listen(port,function() {
				console.log('module :'+directory +" is listening on port "+port)
			});

			app.use('/'+directory,function(req,res) {
				var host = req.headers.host.split(':')[0];
				res.writeHead(301, {Location: 'http://'+host+':'+port});
				res.end();
			});
}


directories.forEach(function(directory) {
	if (!directory.startsWith('.')) {
		host(directory);
	}
});

app.listen(port,function() {
	console.log('eu.ownyourdata.webhost is listening on port '+port);
});
