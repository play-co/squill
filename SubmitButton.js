jsio('from util.browser import $');
jsio('import .TextButton, .Widget');

var SubmitButton  = exports = Class(TextButton, function(supr) {
	this.putHere = function() {
		supr(this, 'putHere', arguments);
		if(this._opts.form) {
			this.onclick(bind(this, function() {
				this._opts.form.submit();
			}));
		} else {
			setTimeout(bind(this, function() {
				var el = this._el;
				while(el.tagName != 'FORM' && (el = el.parentNode)) {}
				if(el && el.submit) {
					this.onclick(bind(this, function() {
						el.submit();
					}));
				}
			}), 0);
		}
		return this;
	}
});

Widget.register(SubmitButton, 'SubmitButton');
