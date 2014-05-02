define([
    'dojo/node!express',
    'dojo/node!fs',
    'dojo/node!http',
    'dojo/node!path',
    'dojo/node!url',
    'dojo/_base/array'
], function (express, fs, http, path, url, array) {
    /* Setup Express Server */
    var app = express(),
        appPort = process.env.OPENSHIFT_NODEJS_PORT || 8080,
        appIPaddress = process.env.OPENSHIFT_NODEJS_IP,
        env = process.env.NODE_ENV || 'development',
        root = '/src',
        signals = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ],
        /**
         *  terminator === the termination handler
         *  Terminate server on receipt of the specified signal.
         *  @param {string} sig  Signal to terminate on.
         */
        terminator = function (sig) {
            if (typeof sig === 'string') {
                console.log('%s: Received %s - terminating sample app ...',
                    Date(Date.now()), sig);
                process.exit(1);
            }
            console.log('%s: Node server stopped.', Date(Date.now()));
        },contentTypesByExtension = {
                '.html': "text/html",
                '.css':  "text/css",
                '.js':   "text/javascript"
              };
    if (appIPaddress === 'undefined') {
        //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
        //  allows us to run/test the app locally.
        console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
        appIPaddress = '127.0.0.1';
    }
    app.configure(function () {
        app.locals.pretty = true;
        app.use(express.compress());
        app.use(express.logger(env === 'production' ? null : 'dev'));
        app.use('/src', express['static']('./src'));
        app.use(app.router);
        app.use('/500', function (req, res, next) {
            next(new Error('All your base are belong to us!'));
        });
        app.use(function (request, response) {
            if (request.accepts('html')) {
                response.status(404);
                response.render('404', {
                    url: request.url,
                    root: root
                });
                return;
            }
            if (request.accepts('json')) {
                response.send({
                    error: 'Not Found'
                });
                return;
            }
            response.type('txt').send('Not Found');
        });
        app.use(function (error, req, response) {
            response.status(error.status || 500);
            response.render('500', {
                error: error,
                root: root
            });
        });
    });
    app.get('/', function (req, response) {
        fs.readFile('./src/index.html', 'binary', function (err, file) {
            if (err) {
                response.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                response.write(err + '\n');
                response.end();
                return;
            }
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
            response.write(file, 'binary');
            response.end();
        });
    });
    app.get('/404', function (req, res, next) {
        next();
    });
    app.get('/403', function (req, res, next) {
        var error = new Error('not allowed!');
        error.status = 403;
        next(error);
    });
    app.get('/500', function (req, res, next) {
        // TODO: Handle different response encodings (html/json)
        next(new Error('All your base are belong to us!'));
    });
    array.forEach(signals, function (item) {
        process.on(item, function () {
            terminator(item);
        });
    });
    app.listen(appPort, appIPaddress, function () {
        console.log('%s: Node server started on %s:%d ...',
            Date(Date.now()), appIPaddress, appPort);
    });
});