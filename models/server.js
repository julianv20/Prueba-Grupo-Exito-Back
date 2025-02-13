
    const express = require('express');
    const cors = require('cors');
    const { dbConnection } = require('../database/config');

    require('dotenv').config();


    class Server {

        constructor() {

            this.app = express();

            this.port = process.env.PORT || 8080;

            this.paths = {
                authPath:        '/auth',
                cardPath:        '/card',
                transactionPath: '/transaction'
            };

            this.connectionDB();

            this.middlewares();

            this.routes();
            
            this.server = require('http').createServer( this.app );

        };


        async connectionDB() {
            await dbConnection();
        };
        

        middlewares() {

            this.app.use( cors() );

            //Lectura y perseo
            this.app.use( express.json() )

            //Directorio publico
            this.app.use( express.static('public') );

        };


        configurarSockets() {

            new Sockets( this.io );
            
        };


        routes() {

            this.app.use(this.paths.authPath, require('../routes/auth'));
            this.app.use(this.paths.cardPath, require('../routes/card'));
            this.app.use(this.paths.transactionPath, require('../routes/transaction'));
            
        };


        listen() {

            this.server.listen( this.port, () => {
                console.log('Server running in port: ' + this.port);
            });        
        };

    };  


    module.exports = Server
