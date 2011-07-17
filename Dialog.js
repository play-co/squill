jsio('import .Widget');
jsio('import .Events');
jsio('import math2D.Point as Point');
jsio('from util.browser import $');
jsio('import .Window');

var Dialog = exports = Class(Widget, function(supr) {
	this.init = function(params) {
		var params = merge(params, {
			draggable: true,
			closeable: true
		});
		
		params.style = merge(params.style, {
			position: 'absolute',
			top: '10px',
			left: '10px'
		});
		
		supr(this, 'init', [params]);
	}
	
	this.buildContent = function() {
		$.addClass(this._el, 'dialog');
		
		this._titlebar = $({
			className: 'titlebar',
			text: this._def.title || '',
			parent: this._el
		});
		
		if (this._params.closeable) {
			this._closeBtn = $({
				className: 'closeBtn',
				text: 'x',
				parent: this._titlebar,
				first: true
			});
			
			$.onEvent(this._closeBtn, 'click', this, 'hide', null);
			$.onEvent(this._closeBtn, 'touchend', this, 'hide', null);
		}
		
		this.initDragEvents(this._titlebar);
		
		supr(this, 'buildContent');
	}
	
	this.setTitle = function(title) { $.setText(this._titlebar, title); }
	
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
		this.hide(target);
	}
	
	this.hide = function(action) {
		this.onBeforeHide();
		
		$(this._el);
		
		this.publish('Close');
		this.delegate && this.delegate.call(this, action || 'closed');
		
		this.onHide();
	}
	
	this.show = function() {
		this.onBeforeShow();
		
		(this._parent._el || this._parent).appendChild(this._el);
		
		this.onShow();
		this.center();
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
	
	this.onBeforeHide =
	this.onHide =
	this.onBeforeShow =
	this.onShow =
		function() {}
});
