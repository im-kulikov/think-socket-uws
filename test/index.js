var assert = require('assert');
var path = require('path');
var fs = require('fs');
var http = require('http');
var muk = require('muk');

var thinkjs = require('thinkjs');
var instance = new thinkjs();
instance.load();

think.APP_PATH = path.dirname(__dirname) + think.sep + 'testApp';

var uws = require('../lib/index.js');

var WebSocket = uws.default;
var sUWS,
    server = {},
    config = {},
    app = {};

describe('think=socket-uws', function(){
    beforeEach(function () {
        server = {};
        config = {};
        app = {};
        sUWS = new WebSocket(server, config, app);

    });
    it('init', function(){
        assert.equal(sUWS.server, server);
        assert.equal(sUWS.config, config);
        assert.equal(sUWS.app, app);
    });
    it('emit', function(){
        sUWS.socket = {
            emit: function(event, data){
                assert.equal(event, 'event');
                assert.equal(data, 'data');
            }
        };
        sUWS.emit('event', 'data');
    });
    it('broadcast', function(){
        sUWS.socket = {
            broadcast: {
                emit: function(event, data){
                    assert.equal(event, 'event');
                    assert.equal(data, 'data');
                }
            }
        };
        sUWS.broadcast('event', 'data')
    });
    it('broadcast, contain self', function(){
        sUWS.io = {
            sockets: {
                emit: function(event, data){
                    assert.equal(event, 'event');
                    assert.equal(data, 'data');
                }
            }
        };
        sUWS.broadcast('event', 'data', true);
    });
    it('run', function(done){
        muk(think, 'npm', function(){
            return function(ser){
                assert.equal(server, ser);
                return {
                    engine: {},
                    sockets: {
                        sockets: []
                    },
                    on: function(type){
                        assert.equal(type, 'connection');
                        assert.equal(think.isFunction(sUWS.io.on), true);
                        done();
                    }
                }
            }
        });

        sUWS.run().catch(function(err){
            muk.restore();
            done(err)
        });
    });
    it('run, adapter', function(done){
        muk(think, 'npm', function(){
            return function(ser){
                assert.equal(server, ser);
                return {
                    engine: {},
                    sockets: {
                        sockets: []
                    },
                    on: function(type){
                        assert.equal(type, 'connection');
                        assert.equal(think.isFunction(sUWS.io.on), true);
                        muk.restore();
                        done();
                    },
                    adapter: function(data){
                        assert.equal(data, 'adapter');
                    }
                }
            }
        });

        config = {adapter: function(){
            return 'adapter'
        }};
        sUWS = new WebSocket(server, config, app);

        sUWS.run().catch(function(err){
            done(err)
        });
    });
    it('run, adp', function(done){
        muk(think, 'npm', function(){
            return function(ser){
                assert.equal(server, ser);
                return {
                    engine: {},
                    sockets: {
                        sockets: []
                    },
                    on: function(type){
                        assert.equal(type, 'connection');
                        assert.equal(think.isFunction(sUWS.io.on), true);
                        muk.restore();
                        done();
                    },
                    adapter: function(data){
                        assert.equal(data, 'adapter');
                    }
                }
            }
        });

        config = {adp: function(){
            return 'adapter'
        }};
        sUWS = new WebSocket(server, config, app);

        sUWS.run().catch(function(err){
            done(err)
        });
    });
    it('run, uws', function(done){
        var rUWS = require('uWebsockets.js');
        muk(think, 'npm', function(){
            return function(ser){
                assert.equal(server, ser);
                return {
                    engine: {},
                    sockets: {
                        sockets: []
                    },
                    on: function(type){
                        assert.deepEqual(this.engine.ws, rUWS.App());
                        assert.equal(type, 'connection');
                        assert.equal(think.isFunction(sUWS.io.on), true);
                        muk.restore();
                        done();
                    }
                }
            }
        });

        config = {uws: {
            noServer: true,
            perMessageDeflate: false
        }};
        sUWS = new WebSocket(server, config, app);

        sUWS.run().catch(function(err){
            done(err)
        });
    });
    it('run, path', function(done){
        muk(think, 'npm', function(){
            return function(ser){
                assert.equal(server, ser);
                return {
                    engine: {},
                    sockets: {
                        sockets: []
                    },
                    on: function(type){
                        assert.equal(type, 'connection');
                        assert.equal(think.isFunction(sUWS.io.on), true);
                        muk.restore();
                        done();
                    },
                    path: function(data){
                        assert.equal(data, 'path');
                    }
                }
            }
        });

        config = {path: 'path'};
        sUWS = new WebSocket(server, config, app);

        sUWS.run().catch(function(err){
            done(err)
        });
    });
    it('run, allow_origin', function(done){
        muk(think, 'npm', function(){
            return function(ser){
                assert.equal(server, ser);
                return {
                    engine: {},
                    sockets: {
                        sockets: []
                    },
                    on: function(type){
                        assert.equal(type, 'connection');
                        assert.equal(think.isFunction(sUWS.io.on), true);
                        muk.restore();
                        done();
                    },
                    origins: function(data){
                        assert.equal(data, 'kulikov.im');
                    }
                }
            }
        });

        config = {allow_origin: 'kulikov.im'};
        sUWS = new WebSocket(server, config, app);

        sUWS.run().catch(function(err){
            done(err)
        });
    });
    it('run, collection 1', function(done){
        muk(think, 'npm', function(){
            return function(ser){
                assert.equal(server, ser);
                return {
                    engine: {},
                    sockets: {
                        sockets: []
                    },
                    on: function(type, callback){
                        assert.equal(type, 'connection');
                        assert.equal(think.isFunction(sUWS.io.on), true);
                        sUWS.message = function(message, data, socket){
                            assert.equal(message, 'home/user/add');
                            assert.equal(data, 'message');
                            assert.equal(think.isFunction(socket.on), true)
                        };
                        callback && callback({
                            on: function(key, cb){
                                cb && cb('message');
                            }
                        });
                        muk.restore();
                        done();
                    }
                }
            }
        });

        config = {messages: {
            user: 'home/user/add'
        }};
        sUWS = new WebSocket(server, config, app);

        sUWS.run().catch(function(err){
            done(err)
        });
    });
    it('run, collection, open', function(done){
        muk(think, 'npm', function(){
            return function(ser){
                assert.equal(server, ser);
                return {
                    engine: {},
                    sockets: {
                        sockets: []
                    },
                    on: function(type, callback){
                        assert.equal(type, 'connection');
                        assert.equal(think.isFunction(sUWS.io.on), true);
                        sUWS.message = function(message, data, socket){
                            assert.equal(message, 'home/user/open');
                            assert.equal(data, undefined);
                            assert.equal(think.isFunction(socket.on), true)
                        };
                        callback && callback({
                            on: function(key, cb){ }
                        });
                        muk.restore();
                        done();
                    }
                }
            }
        });

        config = { messages: { open: 'home/user/open' } };
        sUWS = new WebSocket(server, config, app);

        sUWS.run().catch(function(err){
            done(err)
        });
    });
    it('run, collection, close', function(done){
        muk(think, 'npm', function(){
            return function(ser){
                assert.equal(server, ser);
                return {
                    engine: {},
                    sockets: {
                        sockets: []
                    },
                    on: function(type, callback){
                        assert.equal(type, 'connection');
                        assert.equal(think.isFunction(sUWS.io.on), true);
                        sUWS.message = function(message, data, socket){
                            assert.equal(message, 'home/user/close');
                            assert.equal(data, undefined);
                            assert.equal(think.isFunction(socket.on), true)
                        };
                        callback && callback({
                            on: function(key, cb){
                                if(key === 'disconnect'){
                                    cb();
                                }
                            }
                        });
                        muk.restore();
                        done();
                    }
                }
            }
        });

        config = { messages: { close: 'home/user/close' } };
        sUWS = new WebSocket(server, config, app);

        sUWS.run().catch(function(err){
            done(err)
        });
    });
    it('message', function(done){
        app = function(http){
            return {run: function(){
                assert.equal(http.data, 'data');
                assert.equal(think.isFunction(http.socketEmit), true);
                assert.equal(think.isFunction(http.socketBroadcast), true);
                assert.equal(http.url, '/open');
                return Promise.resolve();
            }}
        };
        sUWS = new WebSocket(server, config, app);
        sUWS.message('open', 'data', {request: {
            headers: {},
            res: {setTimeout: function(){}}}
        }).then(function(){
            done();
        }).catch(function(err){ done(err) })
    });
    it('message, url with /', function(done){
        app = function(http){
            return {run: function(){
                assert.equal(http.data, 'data');
                assert.equal(think.isFunction(http.socketEmit), true);
                assert.equal(think.isFunction(http.socketBroadcast), true);
                assert.equal(http.url, '/open');
                return Promise.resolve();
            }}
        };
        sUWS = new WebSocket(server, config, app);
        sUWS.message('/open', 'data', {request: {
            headers: {},
            res: {setTimeout: function(){}}}
        }).then(function(){
            done();
        }).catch(function(err){ done(err) })
    });
    it('message, res undefined', function(done){
        app = function(http){
            return {run: function(){
                assert.equal(http.data, 'data');
                assert.equal(think.isFunction(http.socketEmit), true);
                assert.equal(think.isFunction(http.socketBroadcast), true);
                assert.equal(http.url, '/open');
                return Promise.resolve();
            }}
        };
        sUWS = new WebSocket(server, config, app);
        sUWS.message('/open', 'data', {request: {
            headers: {},
            res: undefined}
        }).then(function(){
            done();
        }).catch(function(err){ done(err) })
    });
});