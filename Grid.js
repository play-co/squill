import .Widget;

exports = Class(Widget, function (supr) {
	this._def = {
		children: [
			{id: 'contents', tag: 'table', style: {borderSpacing: 0}}
		]
	};

	this.getContainer = function () { return this.contents; }

	this.buildChildren = function (children, result) {
		for (var i = 0, n = children.length; i < n; ++i) {
			if (Array.isArray(children[i])) {
				var rows = children[i];
				var numRows = rows.length;
				children[i] = {tag: 'tr', children: []};
				for (var j = 0; j < numRows; ++j) {
					children[i].children[j] = {tag: 'td', children: rows[j]};
				}
			}
		}

		return supr(this, 'buildChildren', arguments);
	}
});
