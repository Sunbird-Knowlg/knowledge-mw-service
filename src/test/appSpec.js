var server = require("../app.js");

//below method used to close server once all the specs are executed
var _finishCallback = jasmine.Runner.prototype.finishCallback;
jasmine.Runner.prototype.finishCallback = function() {
  _finishCallback.bind(this)();
  server.close();
};
