import .Widget;

exports = Class(Widget, function (supr) {
	this._def = {
		children: [
			{id: 'contents', tag: 'table', style: {borderSpacing: 0}}
		]
	};

	this.getContainer = function () { return this.contents; }

	this.buildChildren = function (children, result) {
		if (Array.isArray(children[0])) {
			var gridChildren = [];
			for (var i = 0, n = children.length; i < n; ++i) {
				var rows = children[i];
				var numRows = rows.length;
				gridChildren[i] = {tag: 'tr', children: []};
				for (var j = 0; j < numRows; ++j) {
					gridChildren[i].children[j] = {tag: 'td', children: rows[j]};
				}
			}
			return supr(this, 'buildChildren', [gridChildren, result]);
		} else {
			return supr(this, 'buildChildren', arguments);
		}
	}
});
