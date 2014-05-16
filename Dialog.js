import .Widget;
import .Events;
import math.geom.Point as Point;
from util.browser import $;
import .Window;

var Dialog = exports = Class(Widget, function(supr) {

	this._def = {
		draggable: true,
		closeable: true,
		style: {
			position: 'absolute'
		},
		children: [
			{
				id: '_titlebar',
				children: [
					{id: '_closeBtn', children: [{
						id: '_closeBtnIcon'
					}]},
					{id: '_titlebarText'}
				]
			},
			{
				id: '_container'
			},
			{
				id: '_footer'
			}
		]
	};

	this.getContainer = function () { return this._container; }

	this.buildWidget = function (el, result) {
		if (this._opts.title) {
			this.setTitle(this._def.title);
		}

		if (this._opts.footer) {
			this.buildFooter(this._opts.footer, result);
		}

		this._isModal = !!this._opts.isModal;

		if (!this._opts.closeable) {
			$.hide(this._closeBtn);
		}

		$.onEvent(this._closeBtn, 'click', this, 'hide', null);
		$.onEvent(this._closeBtn, 'touchend', this, 'hide', null);

		this.initDragEvents(this._titlebar);
	}

	this.buildFooter = function (children, result) {
		for (var i = 0, n = children.length; i < n; ++i) {
			this.addWidget(children[i], this._footer, result);
		}
	};

	this.setTitle = function (title) { $.setText(this._titlebarText, title); }

	this.onDrag = function(dragEvt, moveEvt, delta) {
		if (!dragEvt.data) {
			dragEvt.data = new Point(parseInt(this._el.style.left), parseInt(this._el.style.top));
		}

		var pos = Point.add(dragEvt.data, Point.subtract(dragEvt.currPt, dragEvt.srcPt)),
			dim = Window.get().getViewport();

		this._el.style.left = Math.max(0, pos.x) + 'px';
		this._el.style.top = Math.max(0, pos.y) + 'px';
	}

	// override
	this.dispatchButton = function(target, evt) {
		if (this.delegate && this.delegate.call(this, target) !== false) {
			this.hide(target);
		}
	}

	this.fadeOut = function() {
		var onFinish = bind(this, function() {
			this.onHide();
		});

		this.onBeforeHide();
		new Animation({
			duration: 250,
			subject: function(t) {
				$.style(el, {opacity: 1 - t});
			},
			onFinish: onFinish
		}).seekTo(1);
	}

	this.setIsModal = function (isModal) {
		this._isModal = isModal;
		if (this.isShowing()) {
			this.showUnderlay();
		}
	}

	this.show = function () {

		var el = this.getElement();
		if (!el.parentNode) {
			document.body.appendChild(el);
		}

		var ret = supr(this, 'show', arguments);

		if (this._isModal) {
			this.showUnderlay();
		}

		return ret;
	}

	this.hide = function () {
		var ret = supr(this, 'hide', arguments);

		this.hideUnderlay();

		return ret;
	}

	this.showUnderlay = function () {
		if (!this._underlay) {
			this._underlay = $({style: {
				parent: document.body,
				position: 'fixed',
				top: '0px',
				right: '0px',
				bottom: '0px',
				left: '0px',
				background: 'rgba(0, 0, 0, 0.85)'
			}});
		}

		this._el.parentNode.appendChild(this._underlay);
		this._underlay.style.zIndex = getComputedStyle(this._el).zIndex - 1;
		this._underlay.style.display = 'block';
	}

	this.hideUnderlay = function () {
		if (this._underlay) {
			this._underlay.style.display = 'none';
		}
	}
});
