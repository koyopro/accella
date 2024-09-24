"use strict";

const net = require("net");
const v8 = require("node:v8");

const INIT = 1;
const CALL = 0;
const modules = [];

const NULL_PROMISE = Promise.resolve(null);
const server = net.createServer({ allowHalfOpen: true }, (c) => {
  let responded = false;
  function respond(data) {
    if (responded) return;
    responded = true;
    c.end(v8.serialize(data).toString("base64"));
  }

  let buffer = "";
  c.on("error", function (err) {
    respond({ s: false, v: { code: err.code, message: err.message } });
  });
  c.on("data", function (data) {
    buffer += data.toString("utf8");
    if (/\r\n/.test(buffer)) {
      onMessage(buffer.trim());
    }
  });
  function onMessage(str) {
    if (str === "ping") {
      c.end("pong");
      return;
    }
    NULL_PROMISE.then(function () {
      const req = v8.deserialize(Buffer.from(str, "base64"));
      if (req.t === INIT) {
        return init(req.f, req.a);
      }
      return modules[req.i](req.a);
    }).then(
      function (response) {
        respond({ s: true, v: response });
      },
      function (err) {
        respond({ s: false, v: { code: err.code, message: err.message } });
      }
    );
  }
});

async function init(filename, arg) {
  let m = filename.endsWith(".mjs") ? await import(filename) : require(filename);
  if (m && typeof m === "object" && typeof m.default === "function") {
    m = m.default;
  }
  if (typeof m !== "function") {
    throw new Error(filename + " did not export a function.");
  }
  return NULL_PROMISE.then(function () {
    return m(arg);
  }).then(function (fn) {
    const i = modules.length;
    modules[i] = fn;
    return i;
  });
}

server.listen(+process.argv[2]);
