(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ChatSDK = {}, global.React));
})(this, (function (exports, React) { 'use strict';

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
  function _arrayWithoutHoles(r) {
    if (Array.isArray(r)) return _arrayLikeToArray(r);
  }
  function asyncGeneratorStep(n, t, e, r, o, a, c) {
    try {
      var i = n[a](c),
        u = i.value;
    } catch (n) {
      return void e(n);
    }
    i.done ? t(u) : Promise.resolve(u).then(r, o);
  }
  function _asyncToGenerator(n) {
    return function () {
      var t = this,
        e = arguments;
      return new Promise(function (r, o) {
        var a = n.apply(t, e);
        function _next(n) {
          asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
        }
        function _throw(n) {
          asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
        }
        _next(void 0);
      });
    };
  }
  function _iterableToArray(r) {
    if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
  }
  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = true,
        o = false;
      try {
        if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = true, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _regenerator() {
    /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
    var e,
      t,
      r = "function" == typeof Symbol ? Symbol : {},
      n = r.iterator || "@@iterator",
      o = r.toStringTag || "@@toStringTag";
    function i(r, n, o, i) {
      var c = n && n.prototype instanceof Generator ? n : Generator,
        u = Object.create(c.prototype);
      return _regeneratorDefine(u, "_invoke", function (r, n, o) {
        var i,
          c,
          u,
          f = 0,
          p = o || [],
          y = false,
          G = {
            p: 0,
            n: 0,
            v: e,
            a: d,
            f: d.bind(e, 4),
            d: function (t, r) {
              return i = t, c = 0, u = e, G.n = r, a;
            }
          };
        function d(r, n) {
          for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
            var o,
              i = p[t],
              d = G.p,
              l = i[2];
            r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
          }
          if (o || r > 1) return a;
          throw y = true, n;
        }
        return function (o, p, l) {
          if (f > 1) throw TypeError("Generator is already running");
          for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
            i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
            try {
              if (f = 2, i) {
                if (c || (o = "next"), t = i[o]) {
                  if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
                  if (!t.done) return t;
                  u = t.value, c < 2 && (c = 0);
                } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
                i = e;
              } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
            } catch (t) {
              i = e, c = 1, u = t;
            } finally {
              f = 1;
            }
          }
          return {
            value: t,
            done: y
          };
        };
      }(r, o, i), true), u;
    }
    var a = {};
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}
    t = Object.getPrototypeOf;
    var c = [][n] ? t(t([][n]())) : (_regeneratorDefine(t = {}, n, function () {
        return this;
      }), t),
      u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
    function f(e) {
      return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
    }
    return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine(u), _regeneratorDefine(u, o, "Generator"), _regeneratorDefine(u, n, function () {
      return this;
    }), _regeneratorDefine(u, "toString", function () {
      return "[object Generator]";
    }), (_regenerator = function () {
      return {
        w: i,
        m: f
      };
    })();
  }
  function _regeneratorDefine(e, r, n, t) {
    var i = Object.defineProperty;
    try {
      i({}, "", {});
    } catch (e) {
      i = 0;
    }
    _regeneratorDefine = function (e, r, n, t) {
      function o(r, n) {
        _regeneratorDefine(e, r, function (e) {
          return this._invoke(r, n, e);
        });
      }
      r ? i ? i(e, r, {
        value: n,
        enumerable: !t,
        configurable: !t,
        writable: !t
      }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
    }, _regeneratorDefine(e, r, n, t);
  }
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }
  function _toConsumableArray(r) {
    return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  function useChat(_ref) {
    var client = _ref.client;
    var _useState = React.useState([]),
      _useState2 = _slicedToArray(_useState, 2),
      messages = _useState2[0],
      setMessages = _useState2[1];
    var _useState3 = React.useState('connected'),
      _useState4 = _slicedToArray(_useState3, 2),
      status = _useState4[0],
      setStatus = _useState4[1];
    var sendMessage = React.useCallback(/*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(content) {
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              setMessages(function (prev) {
                return [].concat(_toConsumableArray(prev), [{
                  role: 'user',
                  content: content
                }]);
              });
              setStatus('loading');
              _context.p = 1;
              _context.n = 2;
              return client.sendMessage(content, {
                onToken: function onToken(token) {
                  setMessages(function (prev) {
                    var lastMsg = prev[prev.length - 1];
                    if (lastMsg.role === 'assistant') {
                      lastMsg.content += token;
                      return [].concat(_toConsumableArray(prev.slice(0, -1)), [lastMsg]);
                    } else {
                      return [].concat(_toConsumableArray(prev), [{
                        role: 'assistant',
                        content: token
                      }]);
                    }
                  });
                }
              });
            case 2:
              setStatus('connected');
              _context.n = 4;
              break;
            case 3:
              _context.p = 3;
              _context.v;
              setStatus('error');
              setMessages(function (prev) {
                return [].concat(_toConsumableArray(prev), [{
                  role: 'system',
                  content: 'Error sending message'
                }]);
              });
            case 4:
              return _context.a(2);
          }
        }, _callee, null, [[1, 3]]);
      }));
      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }(), [client]);
    return {
      messages: messages,
      sendMessage: sendMessage,
      status: status
    };
  }

  function MessageList(_ref) {
    var messages = _ref.messages;
    return /*#__PURE__*/React.createElement("div", {
      className: "chat-window"
    }, messages.map(function (msg, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        className: "message ".concat(msg.role)
      }, msg.content);
    }));
  }

  function Composer(_ref) {
    var onSend = _ref.onSend;
    var _useState = React.useState(''),
      _useState2 = _slicedToArray(_useState, 2),
      text = _useState2[0],
      setText = _useState2[1];
    return /*#__PURE__*/React.createElement("div", {
      className: "composer"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: text,
      onChange: function onChange(e) {
        return setText(e.target.value);
      },
      placeholder: "Type a message..."
    }), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        if (!text) return;
        onSend(text);
        setText('');
      }
    }, "Send"));
  }

  function TypingIndicator(_ref) {
    var isTyping = _ref.isTyping;
    if (!isTyping) return null;
    return /*#__PURE__*/React.createElement("div", {
      className: "typing"
    }, "Assistant is typing...");
  }

  function ChatWidget(_ref) {
    var client = _ref.client;
    var _useChat = useChat({
        client: client
      }),
      messages = _useChat.messages,
      sendMessage = _useChat.sendMessage,
      status = _useChat.status;
    return /*#__PURE__*/React.createElement("div", {
      className: "chat-widget"
    }, /*#__PURE__*/React.createElement(MessageList, {
      messages: messages
    }), /*#__PURE__*/React.createElement(TypingIndicator, {
      isTyping: status === 'loading'
    }), /*#__PURE__*/React.createElement(Composer, {
      onSend: sendMessage
    }));
  }

  var sessionId = null;
  function createClient(_ref) {
    var baseUrl = _ref.baseUrl,
      agentId = _ref.agentId,
      locale = _ref.locale;
    sessionId = sessionId || "sess-".concat(Math.random().toString(36).substr(2, 9));
    function sendMessage(_x) {
      return _sendMessage.apply(this, arguments);
    }
    function _sendMessage() {
      _sendMessage = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(content) {
        var callbacks,
          res,
          reader,
          decoder,
          done,
          _yield$reader$read,
          value,
          streamDone,
          data,
          _args = arguments;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              callbacks = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
              _context.n = 1;
              return fetch("".concat(baseUrl, "/chat"), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  sessionId: sessionId,
                  agentId: agentId,
                  locale: locale,
                  content: content
                })
              });
            case 1:
              res = _context.v;
              if (res.ok) {
                _context.n = 2;
                break;
              }
              throw new Error('Network error');
            case 2:
              if (!(res.body && callbacks.onToken)) {
                _context.n = 5;
                break;
              }
              reader = res.body.getReader();
              decoder = new TextDecoder();
              done = false;
            case 3:
              if (done) {
                _context.n = 5;
                break;
              }
              _context.n = 4;
              return reader.read();
            case 4:
              _yield$reader$read = _context.v;
              value = _yield$reader$read.value;
              streamDone = _yield$reader$read.done;
              if (value) callbacks.onToken(decoder.decode(value));
              done = streamDone;
              _context.n = 3;
              break;
            case 5:
              _context.n = 6;
              return res.json();
            case 6:
              data = _context.v;
              return _context.a(2, data);
          }
        }, _callee);
      }));
      return _sendMessage.apply(this, arguments);
    }
    return {
      sendMessage: sendMessage,
      getSessionId: function getSessionId() {
        return sessionId;
      }
    };
  }

  exports.ChatWidget = ChatWidget;
  exports.createClient = createClient;
  exports.useChat = useChat;

}));
