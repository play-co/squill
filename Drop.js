import .Widget;

from util.browser import $;

function cancelEvent(e) {
	e.stopPropagation();
	e.preventDefault();
	return false;
}

function registerDocument(doc) {
	var body = doc.body;
	body.addEventListener("dragenter", cancelEvent, false);
	body.addEventListener("dragover", function(e) {
		$.addClass(body, 'squill-drop-hover');
		return cancelEvent(e);
	}, false);

	body.addEventListener("dragleave", function(e) {
		console.log("DRAG EXIT")
		$.removeClass(body, 'squill-drop-hover');
		return cancelEvent(e);
	}, false);
}

registerDocument(document);

exports = Class(Widget, function (supr) {
	this.buildWidget = function () {
		supr(this, 'buildWidget', arguments);

		this._hoverClass = this._opts.hoverClass || 'over';

		var el = this._el;
		el.addEventListener("dragenter", cancelEvent, false);
		el.addEventListener("dragleave", bind(this, function(e) {
			$.removeClass(el, this._hoverClass);
			this.emit('dropout');
			return cancelEvent(e);
		}), false);

		//modify the styles
		el.addEventListener("dragover", bind(this, function(e) {
			$.addClass(el, this._hoverClass);
			this.emit('dropover');
			return cancelEvent(e);
		}), false);

		el.addEventListener("drop", bind(this, function (e) {
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
