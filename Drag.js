jsio('import lib.PubSub');
jsio('import math.geom.Point as Point');
jsio('from util.browser import $');

var gCurrentDrag = [], gCurrentMouse = {
    x: 0,
    y: 0
  };

function resolveMouse(e) {
  if (e.touches) {
    return resolveMouse(e.touches[0]);
  }


  if ('pageX' in e) {
    gCurrentMouse.x = e.pageX;
    gCurrentMouse.y = e.pageY;
  } else {
    // looks like IE
    var doc = document.documentElement, body = document.body;

    gCurrentMouse.x = e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
    gCurrentMouse.y = e.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
  }
}


var _active = false;

function gAddItem(item) {
  gRemoveItem(item);
  gCurrentDrag.push(item);
  _active = true;
}


function gRemoveItem(item) {
  for (var i = 0; i < gCurrentDrag.length; ++i) {
    if (gCurrentDrag[i] == item) {
      gCurrentDrag.splice(i, 1);
      --i;
    }
  }


  if (!gCurrentDrag[0]) {
    _active = false;
  }
}


function onMove(e) {
  if (!_active) {
    return;
  }


  resolveMouse(e);
  for (var i = 0; i < gCurrentDrag.length; ++i) {
    gCurrentDrag[i].onMouseMove(e);
  }


}


function onUp(e) {
  if (!_active) {
    return;
  }


  for (var i = 0; i < gCurrentDrag.length; ++i) {
    gCurrentDrag[i].onMouseUp(e);
  }
}


function registerWindow(win) {
  var doc = win.document;
  if ('ontouchstart' in win) {
    doc.addEventListener('touchstart', resolveMouse, true);
    doc.addEventListener('touchmove', onMove, true);
    doc.addEventListener('touchend', onUp, true);
  } else {
    doc.addEventListener('mousedown', resolveMouse, true);
    doc.addEventListener('mousemove', onMove, true);
    doc.addEventListener('mouseup', onUp, true);
  }
}


exports = Class(lib.PubSub, function (supr) {
  this.init = function (params) {
    this._isActive = false;
  }
;

  this.isDragging = function () {
    return this._isActive;
  }
;

  // data is an optional object that will be added to dragEvt.data.
  // This allows the caller of startDrag to pass along arbitrary objects
  // to the DragStart, Drag, and DragStop events, since the receiver
  // can just read data off of the event object (first argument).
  this.startDrag = function (params, data) {
    var e = this._evt = new exports.DragEvent();
    this._evt.data = data;
    this._evt.params = merge(params, {
      /* addInScroll: true, */
      // TODO?
      threshold: 5
    });

    e.srcPt = new Point(gCurrentMouse);
    e.currPt = new Point(gCurrentMouse);
    gAddItem(this);
  }
;

  this.onMouseMove = function (moveEvt) {
    var dragEvt = this._evt;
    var absDelta = Point.subtract(gCurrentMouse, dragEvt.srcPt);

    if (!this._isActive && absDelta.getMagnitude() > dragEvt.params.threshold) {
      this._isActive = true;

      var doc = moveEvt.target && (moveEvt.target.ownerDocument || moveEvt.target.nodeType == 9 && moveEvt.target);
      this.disableIframes(doc);
      this.publish('DragStart', dragEvt);
    }


    if (this._isActive) {
      $.stopEvent(moveEvt);

      dragEvt.prevPt = dragEvt.currPt;
      dragEvt.currPt = new Point(gCurrentMouse);
      this.publish('Drag', dragEvt, moveEvt, Point.subtract(dragEvt.currPt, dragEvt.prevPt));
    }
  }
;

  this.onMouseUp = function (upEvt) {
    gRemoveItem(this);
    if (this._isActive) {
      $.stopEvent(upEvt);
      this._isActive = false;
      this.enableIframes();
      this.publish('DragStop', this._evt, upEvt);
      return true;
    }
  }
;

  this.disableIframes = function (doc) {
    if (!this._disabledFrames) {
      this._disabledFrames = [];
    }


    $('iframe', doc).forEach(function (iframe) {
      try {
        this._disabledFrames.push({
          frame: iframe,
          pointerEvents: iframe.style.pointerEvents
        });

        iframe.style.pointerEvents = 'none';
      } catch (e) {
      }
    }, this);
  }
;

  this.enableIframes = function () {
    this._disabledFrames.splice(0, this._disabledFrames.length).forEach(function (item) {
      item.frame.style.pointerEvents = item.pointerEvents;
    });
  };
});

exports.registerWindow = registerWindow;

exports.DragEvent = Class(function () {
});

var win = window;
registerWindow(win);
while (win.parent != win) {
  win = win.parent;
  try {
    registerWindow(win);
  } catch (e) {
  }
}
