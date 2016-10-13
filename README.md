# ThinkJS Socket.io uWebSocket

[![NPM version](https://img.shields.io/npm/v/thinkjs.svg?style=flat-square)](http://badge.fury.io/js/think-socket-uws)
[![travis-ci](https://img.shields.io/travis/75team/thinkjs.svg?style=flat-square)](https://travis-ci.org/im-kulikov/think-socket-uws)
[![Coverage Status](https://img.shields.io/coveralls/75team/thinkjs.svg?style=flat-square)](https://coveralls.io/github/im-kulikov/think-socket-uws)
[![Dependency Status](https://david-dm.org/75team/thinkjs.svg)](https://david-dm.org/im-kulikov/think-socket-uws)

-----

ThinkJS 2.x [Socket.io](https://github.com/socketio/socket.io) adapter, that's implement [uWebsockets](https://github.com/uWebSockets/uWebSockets)

## Install

```sh
npm install think-socket-uws
```

## How to use

### register adapter

```js
import uws from 'think-socket-uws';
think.adapter('websocket', 'uws', uws);
```

add above code in bootstrap file, like `src/common/boostrap/adapter.js`.

### change view type

change adapter type in file `src/common/config/websocket.js`,

```js
export default {
  type: 'uws',
  adapter: {
    uws: { //uws socket.io options

    }
  }
}
```
