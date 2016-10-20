import PubSub from 'lib/PubSub';

exports = Class(PubSub, function (supr) {
  this.init = function (opts) {
    supr(this, 'init', arguments);

    this.key = this._key = opts.key;
    this._channel = opts.channel;
    this._hasRemote = opts.hasRemote;
  };

  this.getKey = function () {
    return this._key;
  };
});
var BasicDataSource = exports;
