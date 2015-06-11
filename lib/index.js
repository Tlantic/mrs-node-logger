var winston = require('winston');

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

    this.log = function(title, message, source, level){
        var _this = this;
        var msg = {
            title: title,
            message: message || {}
        }
        var src = source || ''
        _this.logger.log(level, {message: msg, service: _service, source: src}, function(){

        } );
    };

    this.debug = function(title, message, source) {
        this.log(title, message, source, 'debug');
    };

    this.verbose = function(title, message, source) {
        this.log(title, message, source, 'verbose');
    };

    this.info = function(title, message, source) {
        this.log(title, message, source, 'info');
    };

    this.warn = function(title, message, source) {
        this.log(title, message, source, 'warn');
    };

    this.error = function(title, message, source) {
        this.log(title, message, source, 'error');
    };

    this.errorcallback = function(message, callback) {
        this.log(title, message, source, 'error');
    };

};

Logger.instance = null;

Logger.getInstance = function(){
    if(this.instance === null)
        this.instance = new Logger();
    return this.instance;
};


var Metric = function Metric() {

    this.set = function(status, url, duration, callback) {
        var _this = this;
        var message = {status: status, url: url, duration:duration};
        _this.metric.log('info',{message: message}, callback);
    };

    this.init = function(options, service){
        require('winston-logstash');
        var _options = options || {};
        this._service = service || 'mrs';
        this.metric = new (winston.Logger)({
            transports: [
                new (winston.transports.Logstash)({
                    port: _options.port || 28778,
                    node_name: _options.node_name || 'mrs-metric',
                    host: _options.host || 'localhost',
                    localhost: _options.host || 'localhost'
                })
            ]
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
