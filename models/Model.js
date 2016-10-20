import PubSub from 'lib/PubSub';


function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}


var PATH_SEP = /[\[.,]/;
function parsePath(path) {
  return path.split(PATH_SEP).map(function (piece) {
    return piece[piece.length - 1] == ']' ? parseInt(piece) : piece;
  });
}


function matchPath(p1, p2) {
  return p1.indexOf(p2) == 0 || p2.indexOf(p1) == 0;
}








var Model = exports = Class(PubSub, function (supr) {
  this.init = function (opts) {
    var obj;

    if (opts instanceof Model) {
      var cloneFrom = opts;
      opts = { localStorage: cloneFrom._storageKey };

      obj = cloneFrom._data;
    }


    this._data = {};

    if (opts && opts.localStorage) {
      this._storageKey = opts.localStorage;

      if (obj === undefined) {
        var raw = localStorage.getItem(this._storageKey);
        if (raw) {
          try {
            obj = JSON.parse(raw);
          } catch (e) {
          }
        }
      }
    }


    this.setObject(obj || {});

    if (opts) {
      // initial values
      if (opts.values) {
        Object.keys(opts.values).forEach(function (key) {
          this.set(key, opts.values[key]);
        }, this);
      }


      // default values
      if (opts.defaults) {
        Object.keys(opts.defaults).forEach(function (key) {
          if (!this.has(key)) {
            this.set(key, opts.defaults[key]);
          }
        }, this);
      }
    }
  };

  this.setObject = function (obj) {
    this._data = obj;
    this.emit();
    this.persist();
    return this;
  };

  this.toObject = function () {
    return copy(this._data);
  };

  this.clone = function () {
    return new Model(this.getObject());
  };

  this.has = function (path) {
    return this.get(path) !== undefined;
  };

  this.get = function (path) {
    var segments = parsePath(path);
    var n = segments.length;
    var i = 0;
    var o = this._data;
    while (o && i < n) {
      o = o[segments[i++]];
    }




    return o;
  };

  this.getObject = function (path) {
    return copy(this.get(path) || {});
  };

  this.set = function (path, value) {
    var segments = parsePath(path);
    var n = segments.length - 1;
    var i = 0;
    var o = this._data;
    while (o && i < n) {
      var s = segments[i++];
      if (!o[s]) {
        o[s] = typeof segments[i] == 'number' ? [] : {};
      }


      o = o[s];
    }


    var prevValue = o[segments[n]];
    if (value != prevValue) {
      o[segments[n]] = value;
      this.emit(path, value);
    }




    this.persist();
    return this;
  };

  this.emit = function (path, value) {
    if (path) {
      supr(this, 'emit', arguments);
    }


    if (this._subscribers) {
      Object.keys(this._subscribers).forEach(function (key) {
        if (!path || key != path && matchPath(key, path)) {
          supr(this, 'emit', [
            key,
            this.get(key)
          ]);
        }
      }, this);
    }
    return this;
  };

  this.persist = function () {
    if (this._storageKey) {
      localStorage.setItem(this._storageKey, JSON.stringify(this._data));
    }
    return this;
  };
});
