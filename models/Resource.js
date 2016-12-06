exports = Class(function() {
  this.init = function() {
    this._data = {};
  }

  this.get = function(key) {
    return this._data[key] && this._data[key].pop();
  }

  this.put = function(item, key) {
    var dataArray = (this._data[key] || (this._data[key] = []));
    if (dataArray.indexOf(item) === -1) {
      dataArray.push(item);
    }
  }
});
