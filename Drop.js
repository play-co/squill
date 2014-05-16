import .Widget;

from util.browser import $;

function cancelEvent(e) {
	e.stopPropagation();
	e.preventDefault();
	return false;
}

var _activeDocuments = [];
_activeDocuments.add = function (doc) {
	$.addClass(doc.body, 'squill-drop-hover');

	var n = this.length;
	for (var i = 0; i < n; ++i) {
		if (this[i].doc == doc) {
			return this[i];
		}
	}

	obj = {doc: doc};
	this.push(obj);
	return obj;
};

_activeDocuments.remove = function (doc) {
	var n = this.length;
	for (var i = 0; i < n; ++i) {
		if (this[i].doc == doc) {
			if (this[i].timeout) {
				clearTimeout(this[i].timeout);
			}

			$.removeClass(doc.body, 'squill-drop-hover');
			this.splice(i, 1);
			return;
		}
	}
};


_activeDocuments.clear = function () {
	while (this[0]) {
		this.remove(this[0].doc);
	}
};

_activeDocuments.clearTimeouts = function () {
	var n = this.length;
	for (var i = 0; i < n; ++i) {
		if (this[i].timeout) {
			clearTimeout(this[i].timeout);
		}
	}
};

function registerDocument(doc) {
	var body = doc.body;
	var _timeout;
	body.addEventListener("dragenter", cancelEvent, false);
	body.addEventListener("dragover", function(e) {
		var d = _activeDocuments.add(doc);
		clearTimeout(d.timeout);
		console.log("DRAG OVER BODY");
		return cancelEvent(e);
	}, false);

	body.addEventListener("dragleave", function(e) {
		console.log("DRAG LEAVE BODY");
		_activeDocuments.add(doc).timeout = setTimeout(function () {
			console.log("DRAG LEAVE BODY > REMOVE CLASS");
			_activeDocuments.remove(doc);
		})

		return cancelEvent(e);
	}, false);

	body.addEventListener("drop", function(e) {
		$.removeClass(body, 'squill-drop-hover');
	}, false);

	body.addEventListener("dragend", function(e) {
		$.removeClass(body, 'squill-drop-hover');
	}, false);
}

registerDocument(document);

exports = Class(Widget, function (supr) {
	this.buildWidget = function () {
		supr(this, 'buildWidget', arguments);

		this._hoverClass = this._opts.hoverClass || 'over';

		var el = this._el;
		el.addEventListener("dragenter", bind(this, function(e) {
			console.log("DRAG ENTER TARGET");
			this.emit('dropenter');
			_activeDocuments.clearTimeouts();
			return cancelEvent(e);
		}), false);
		el.addEventListener("dragleave", bind(this, function(e) {
			console.log("DRAG LEAVE TARGET");
			$.removeClass(el, this._hoverClass);
			this.emit('dropleave');
			return cancelEvent(e);
		}), false);

		//modify the styles
		el.addEventListener("dragover", bind(this, function(e) {
			console.log("DRAG OVER TARGET");
			$.addClass(el, this._hoverClass);
			_activeDocuments.clearTimeouts();
			this.emit('dropover');
			return cancelEvent(e);
		}), false);

		el.addEventListener("dragend", bind(this, function (e) {
			_activeDocuments.clear();
		}));

		el.addEventListener("drop", bind(this, function (e) {
			_activeDocuments.clear();

			var files = e.dataTransfer && e.dataTransfer.files;
			var count = files && files.length || 0;
			var file  = files && files[0];

			if (count < 1) {
				this.emit('error', 'no file dropped');
			} else {
				var reader = new FileReader();
				reader.onload = bind(this, function (evt) {
					var res = event.target && event.target.result;
					if (res) {
						this.onDrop(res);
						this.emit('drop', res);
					} else {
						this.emit('error', 'no data read');
					}
				});

				reader.readAsDataURL(file);
			}
		}), false);
	}

	this.onDrop = function () {
	}
});
