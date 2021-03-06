'use strict';

let Base = think.adapter('websocket', 'base');
let uws = require('uws');

/**
 * Socket.io uWebsockets adapter
 */
export default class extends Base {
    /**
     * run
     * @return {} []
     */
    async run(){
        let socketio = await think.npm('socket.io');
        let io = socketio(this.server);
        let uwsConfig = {
            noServer: true,
            perMessageDeflate: false
        };
        //Sets the path v under which engine.io and the static files will be served. Defaults to /socket.io.
        if(this.config.path){
            io.path(this.config.path);
        }
        //Sets uWebsockets options, see there - https://github.com/uWebSockets/uWebSockets#nodejs
        if(this.config.uws) {
            uwsConfig = think.extend({}, uwsConfig, this.config.uws)
        }
        this.io = io;
        //set io engine.ws, see there - https://github.com/uWebSockets/uWebSockets#socketio
        io.engine.ws = new uws.Server(uwsConfig);
        //set io adapter, must be a function
        //http://socket.io/docs/using-multiple-nodes/
        if(this.config.adp){
            io.adapter(this.config.adp());
        }
        let allow_origin = this.config.allow_origin;
        if(allow_origin){
            io.origins(this.config.allow_origin);
        }
        let messages = think.isArray(this.config.messages) ? this.config.messages : [this.config.messages];
        messages.forEach((v = {}) => {
            let sc = v.namespace ? io.of(v.namespace) : io;
            this.registerSocket(sc, v);
        });
    }
    /**
     * register namespace of socket, and support multi socket connect
     * eg:
     * export default {
    messages:
        [
            {
                namespace:'/payCount',
                open: 'analysis/erp_pay/open',
                close: 'analysis/erp_pay/close',
                day: 'analysis/erp_pay/day',
                updateFromMq: 'analysis/erp_pay/updateFromMq',
            }
        ]
    };
     * @param io
     * @param messages
     */
    registerSocket(io, messages){
        let msgKeys = Object.keys(messages);
        let open = messages.open;
        delete messages.open;
        let close = messages.close;
        delete messages.close;
        thinkCache(thinkCache.WEBSOCKET, io.sockets.sockets);
        io.on('connection', socket => {
            if(open){
                this.message(open, undefined, socket);
            }
            if(close){
                socket.on('disconnect', () => {
                    this.message(close, undefined, socket);
                });
            }

            msgKeys.forEach(msgKey => {
                socket.on(msgKey, msg => {
                    this.message(messages[msgKey], msg, socket);
                });
            });
        });
    }
    /**
     * emit socket data
     * @param  {String} event []
     * @param  {Mixed} data  []
     * @return {}       []
     */
    emit(event, data){
        return this.socket.emit(event, data);
    }
    /**
     * broadcast socket data
     * @param  {String} event       []
     * @param  {Mixed} data        []
     * @param  {Boolean} containSelf []
     * @return {}             []
     */
    broadcast(event, data, containSelf){
        if(containSelf){
            this.io.sockets.emit(event, data);
        }else{
            this.socket.broadcast.emit(event, data);
        }
    }
    /**
     * deal message
     * @param  {String} url  []
     * @param  {Mixed} data []
     * @return {}      []
     */
    async message(url, data, socket){
        let request = socket.request;
        if(url[0] !== '/'){
            url = `/${url}`;
        }
        request.url = url;
        let http;
        if(!request.res){
            http = await think.http(url);
        }else{
            http = await think.http(request, think.extend({}, request.res));
        }
        http.data = data;
        http.socket = socket;
        http.io = this.io;

        http.socketEmit = this.emit;
        http.socketBroadcast = this.broadcast;

        let instance = new this.app(http);
        return instance.run();
    }
}