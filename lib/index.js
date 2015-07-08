var winston = require('winston');
var expressWinston = require('express-winston');
var uuid = require('uuid');

var Logger = function Logger(service, options) {

    var _options = options || {},
        _service =  service || 'mrs';

    this.init = function(options, service){
        require('winston-logstash');
        var _options = options || {};
        this._service = options.service || 'mrs';
        this.logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Logstash)({
                    port: _options.port || 28777,
                    node_name: _options.service || 'mrs-metric',
                    host: _options.host || 'localhost',
                    localhost: _options.host || 'localhost',
                    level: _options.level || 'silly'
                }),
                new (winston.transports.Console)({
                    colorize: true,
                    level: _options.level || 'silly'
                })
            ]
        });
    };

    this.log = function(title, message, source, method, level){
        var _this = this;
        var msg = {
            title: title,
            message: message || {}
        };
        var src = source || '';
        var mtd = method || '';
        _this.logger.log(level, {message: msg, service: _service, source: src, method: mtd}, function(){

        } );
    };

    this.debug = function(title, message, source, method) {
        this.log(title, message, source, method, 'debug');
    };

    this.verbose = function(title, message, source, method) {
        this.log(title, message, source, method, 'verbose');
    };

    this.info = function(title, message, source, method) {
        this.log(title, message, source, method, 'info');
    };

    this.warn = function(title, message, source, method) {
        this.log(title, message, source, method, 'warn');
    };

    this.error = function(title, message, source, method) {
        this.log(title, message, source, method, 'error');
    };

    this.errorcallback = function(message, callback, source, method) {
        var _this = this;
        _this.logger.log('error', {message: message, service: _service, source: source, method: method}, callback);
    };

};

Logger.instance = null;

Logger.getInstance = function(){
    if(this.instance === null)
        this.instance = new Logger();
    return this.instance;
};


var Metric = function Metric() {

    expressWinston.requestWhitelist.push('body');
    expressWinston.responseWhitelist.push('body');
    expressWinston.responseWhitelist.push('headers');
    expressWinston.responseWhitelist.push('_headers');
    expressWinston.requestWhitelist.push('date');
    expressWinston.requestWhitelist.push('process');
    expressWinston.requestWhitelist.push('memoryUsage');
    expressWinston.requestWhitelist.push('os');
    expressWinston.requestWhitelist.push('trace');
    expressWinston.requestWhitelist.push('stack');


    this.set = function(status, url, duration, callback) {
        var _this = this;
        var message = {status: status, url: url, duration:duration};
        _this.metric.log('info',{message: message}, callback);
    };

    this.getRequestId = function(){
        return uuid.v4();
    }
    this.init = function(options, service){
        require('winston-logstash');
        var _options = options || {};
        this._service = service || 'mrs';
        this.transports= [
            new (winston.transports.Logstash)({
                port: _options.port || 28778,
                node_name: _options.node_name || 'mrs-metric',
                host: _options.host || 'localhost',
                localhost: _options.host || 'localhost'
            })
        ]
        this.metric = new (winston.Logger)({
            transports: this.transports
        });

        this.specialMdd = function(req, res, next){
            var info = winston.exception.getAllInfo("");
            req.date = info.date;
            req.process = info.process;
            req.memoryUsage = info.memoryUsage;
            req.os = info.os;
            req.trace = [];
            req.stack = [];
            next();
        }
        this.middleware = expressWinston.logger({
            transports: this.transports
        });

        this.errorMiddleware = expressWinston.errorLogger({
            transports: this.transports
        });

    };

};

Metric.instance = null;

Metric.getInstance = function(){
    if(this.instance === null)
        this.instance = new Metric();
    return this.instance;
};

module.exports.Logger = Logger.getInstance();
module.exports.Metric = Metric.getInstance();
