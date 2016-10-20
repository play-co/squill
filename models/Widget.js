import PubSub from 'lib/PubSub';

exports = Class(PubSub, function () {
  this.init = function (opts) {
    this._opts = opts;
    this._view = opts.view;
  };
});
