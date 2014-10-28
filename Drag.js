import lib.PubSub;
import math.geom.Point as Point;
from util.browser import $;

var gCurrentDrag = [],
	gCurrentMouse = {x: 0, y: 0};

function resolveMouse(e) {
	if (e.touches) { return resolveMouse(e.touches[0]); }
	
	if ('pageX' in e) {
		gCurrentMouse.x = e.pageX;
		gCurrentMouse.y = e.pageY;
	} else { // looks like IE
		var doc = document.documentElement,
			body = document.body;
		
		gCurrentMouse.x = e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
		gCurrentMouse.y = e.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
	}
}

var _active = false;

function gAddItem(item) {
	gRemoveItem(item);
	gCurrentDrag.push(item);
	_active = true;
}

function gRemoveItem(item) {
	for (var i = 0, len = gCurrentDrag.length; i < len; ++i) {
		if (gCurrentDrag[i] == item) {
			gCurrentDrag.splice(i, 1);
			--i;
		}
	}
	
	if (!gCurrentDrag[0]) { _active = false; }
}

function onMove(e) {
	if (!_active) { return; }
	
	resolveMouse(e);
	for (var i = 0, len = gCurrentDrag.length; i < len; ++i) {
		gCurrentDrag[i].onMouseMove(e);
	}
	
}

function onUp(e) {
	if (!_active) { return; }
	
	for (var i = 0, len = gCurrentDrag.length; i < len; ++i) {
		gCurrentDrag[i].onMouseUp(e);
	}
}

if ('ontouchstart' in window && document.addEventListener) {
	document.addEventListener('touchstart', resolveMouse, true);
	document.addEventListener('touchmove', onMove, true);
	document.addEventListener('touchend', onUp, true);
} else {
	document.addEventListener('mousedown', resolveMouse, true);
	document.addEventListener('mousemove', onMove, true);
	document.addEventListener('mouseup', onUp, true);
}

exports = Class(lib.PubSub, function(supr) {

	this.init = function(params) {
		this._isActive = false;
	}
	
	this.isDragging = function () { return this._isActive; }

	// data is an optional object that will be added to dragEvt.data.
	// This allows the caller of startDrag to pass along arbitrary objects
	// to the DragStart, Drag, and DragStop events, since the receiver
	// can just read data off of the event object (first argument).
	this.startDrag = function(params, data) {
		var e = this._evt = new exports.DragEvent();
		this._evt.data = data;
		this._evt.params = merge(params, {
			/* addInScroll: true, */ // TODO?
			threshold: 5
		});
		
		e.srcPt = new Point(gCurrentMouse);
		e.currPt = new Point(gCurrentMouse);
		gAddItem(this);
	}
	
	this.onMouseMove = function(moveEvt) {
		var dragEvt = this._evt,
			absDelta = Point.subtract(gCurrentMouse, dragEvt.srcPt);
		
		if (!this._isActive && absDelta.getMagnitude() > dragEvt.params.threshold) {
			this._isActive = true;
			this.setIframesEnabled(false);
			this.publish('DragStart', dragEvt);
		}
		
		if (this._isActive) {
			$.stopEvent(moveEvt);
			
			dragEvt.prevPt = dragEvt.currPt;
			dragEvt.currPt = new Point(gCurrentMouse);
			this.publish('Drag', dragEvt, moveEvt, Point.subtract(dragEvt.currPt, dragEvt.prevPt));
		}
	}
	
	this.onMouseUp = function(upEvt) {
		gRemoveItem(this);
		if (this._isActive) {
			
			$.stopEvent(upEvt);
			this._isActive = false;
			this.setIframesEnabled(true);
			this.publish('DragStop', this._evt, upEvt);
			return true;
		}
	}

	this.setIframesEnabled = function (isEnabled) {
		$("iframe").forEach(function (iframe) {
			try {
				if (isEnabled) {
					iframe.style.pointerEvents = iframe.__squill_drag_pointer_events;
				} else {
					iframe.__squill_drag_pointer_events = getComputedStyle(iframe).getPropertyValue('pointerEvents');
					iframe.style.pointerEvents = 'none';
				}
			} catch (e) {};
		});
	}
});

exports.DragEvent = Class(function() {});
