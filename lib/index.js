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
                    localhost: _options.host || 'localhost'
                }),
                new (winston.transports.Console)({
                    colorize: true
                })
            ]
        });
    };

    this.info = function(title, message) {
        var _this = this;
        var msg = {
            title: title,
            message: message || {}
        }
        _this.logger.log('info', {message: msg, service: _service}, function(){

        });
    };

    this.debug = function(title, message) {
        var _this = this;
        var msg = {
            title: title,
            data: message || {}
        }
        _this.logger.log('debug', {message: msg, service: _service}, function(){

        });
    };

    this.warn = function(title, message) {
        var _this = this;
        var msg = {
            title: title,
            data: message || {}
        }
        _this.logger.log('warn', {message: msg, service: _service}, function(){

        });
    };

    this.error = function(title, message) {
        var _this = this;
        var msg = {
            title: title,
            data: message || {}
        }
        _this.logger.log('error', {message: msg, service: _service}, function(){

        });
    };

    this.errorcallback = function(message, callback) {
        var _this = this;
        _this.logger.log('error', {message: message, service: _service},callback);
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
