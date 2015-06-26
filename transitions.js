import lib.PubSub;

var Transition = Class(lib.PubSub, function () {
  this.init = function (opts) {
    this._target = opts.target;
    this._start = opts.start;
    this._end = opts.end;

    setTimeout(bind(this, 'run'), 0);
  };

  this.run = function () {};
});

var CSSTransition = Class(Transition, function () {
  this.run = function () {
    var target = this._target;
    this._start && this._start(target);

    this.emit('start', this._target);

    var duration = getComputedStyle(target).transitionDuration || 0;
    if (duration) {
      duration = parseFloat(duration) * (/ms/.test(duration) ? 1 : 1000);
    }

    setTimeout(bind(this, 'end'), duration);
  };

  this.end = function () {
    var target = this._target;
    this._end && this._end(target);
    this.emit('end', target);
  };
});

exports.Transition = Transition;
exports.CSSTransition = CSSTransition;

exports.cssFadeIn = function (el) {
  return new CSSTransition({
    target: el,
    start: function (target) {
      target.style.opacity = 1;
    }
  });
};

exports.cssFadeOut = function (el) {
  var pointerEvents;
  return new CSSTransition({
    target: el,
    start: function (target) {
      pointerEvents = target.style.pointerEvents;
      target.style.pointerEvents = 'none';
      target.style.opacity = 0;
    },
    end: function (target) {
      target.style.pointerEvents = pointerEvents;
      target.parentNode && target.parentNode.removeChild(target);
    }
  });
};
