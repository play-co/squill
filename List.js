"use import";

import .Widget
from util.browser import $;
import .models.DataSource as DataSource;
import .Selection;

var List = exports = Class(Widget, function(supr) {
	this.init = function(opts) {
		opts = merge(opts, {
			containSelf: true,
			margin: 0,
			isTiled: false,
			preserveCells: false,
			renderAll: true,
			isFixedHeight: true,
			absolutePosition: true,
			filter: null
		});

		this.needsRender = delay(this.render);
		
		if (opts.cellCtor) { this.setCellCtor(opts.cellCtor); }
		if (opts.dataSource) { this.setDataSource(opts.dataSource); }
		if (opts.sorter) { this.setSorter(opts.sorter); }

		this._lastFilter = -1;
		this._filter = opts.filter;
		this._cellsByID = {};
		this._removed = {};
		this._containSelf = opts.containSelf;
		this._containerTag = opts.containerTag;
		this._applyNodeOrder = opts.applyNodeOrder;

		this._renderOpts = {
			margin: opts.margin || 0
		};

		this.updateFilter = delay(function() {
			this._lastFilter = -1;
			this.needsRender();
		}, 100);

		supr(this, 'init', [opts]);
	};

	// cells go in _container
	this.getContainer = function() {
		return this._container;
	};

	this.getDataSource = function() {
		return this._dataSource;
	};

	this.setDataSource = function(dataSource) {
		if (this._dataSource == dataSource) { return; }

		if (this._dataSource) {
			this._dataSource.unsubscribe('Update', this);
			this._dataSource.unsubscribe('Remove', this);
			this.clear();
		}

		this._dataSource = dataSource;
		this._dataSource.subscribe('Update', this, 'onUpdateItem');
		this._dataSource.subscribe('Remove', this, 'onRemoveItem');

		this.needsRender();
	};

	this.onUpdateItem = function(id, item) {
		var cell = this._cellsByID[id];
		if (cell && cell.getData() != item) { cell.setData(item); }
		this.updateFilter();
	};

	this.onRemoveItem = function(id) {
		this._removed[id] = true;
		this.updateFilter();
	};

	this.buildWidget = function() {
		
		this._container = $({parent: this._el, className: this._opts.containerClassName, tag: this._containerTag || 'div'});
		if (this._containSelf && !this._applyNodeOrder) {
			this._container.style.position = 'relative';
		}

		if (this._opts.selectable) {
			this.setSelectable(this._opts.selectable);
		}

		this.render();
	};

	this.setSelectable = function(selectable) {
		this.selection = new Selection({
			parent: this,
			type: selectable
		})
			.subscribe('Select', this, '_onSelected', true)
			.subscribe('Deselect', this, '_onSelected', false)

		this.selection;
	};

	this._onSelected = function(isSelected, item, id) {
		if (this._cellsByID[id] !== undefined) {
			this._cellsByID[id].updateSelected();
		}
	};

	this.setCellCtor = function(cellCtor) {
		if (cellCtor == this._cellCtor) { return; }

		this._cellCtor = cellCtor;
		this.clear();
	}
	
	this.clear = function() {
		for (var id in this._cellsByID) {
			var cell = this._cellsByID[id];
			cell.remove();
		}

		this._cellsByID = {};
		this._renderedDataSource = null;
		this._cellDim = null;
	};

	this.getCellById = function(id) {
		return this._cellsByID[id];
	};

	this.getCells = function() {
		return this._cellsByID;
	};

	this.setSorter = function(sorter) {
		this._sorter = sorter;
	};

	// Filter moved to DataSource...
	this.setFilter = function(filter) {
		this._filter = filter;
		this.needsRender();
	};

	this.setFixedHeight = function(isFixedHeight) {
		this._opts.isFixedHeight = isFixedHeight;
	};

	// Filter moved to DataSource...
	this._applyFilter = function() {
		var filter = this._filter;
		var ds = this._renderedDataSource = new DataSource({key: this._dataSource.getKey()});
		var src = this._dataSource;
		for (var i = 0, n = src.length; i < n; ++i) {
			var item = src.getItemForIndex(i);
			var match = true;
			for (var key in filter) {
				if (filter[key] instanceof RegExp) {
					if (!item[key].match(filter[key])) {
						match = false;
					}
				} else if (typeof item[key] == 'string'
						&& item[key].toLowerCase().indexOf(filter[key]) == -1) {
					match = false;
				}
			}
			
			if (match) {
				ds.add(item);
			} else {
				this._removed[item[ds.key]] = true;
			}
		}
	};

	this.onShow = function() { supr(this, 'onShow', arguments); this.needsRender(); }

	// just render all cells for now
	this.render = function() {
		if (!this._dataSource) { return; }
		this._dataSource.sort();

		if (this._filter != this._lastFilter || !this._renderedDataSource) {
			this._lastFilter = this._filter;
			this._applyFilter();
		}

		if (this._opts.renderAll) {
			this.renderAllDelayed();
		} else if (this._opts.isFixedHeight) {
			this.renderFixedHeight();
		} else {
			this.renderDynamicHeight();
		}

		this._removed = {};
	};

	this.setCellDim = function(cellDim) {
		this._cellDim = cellDim;
	};

	this.getCellDim = function() {
		if (this._cellDim) { return this._cellDim; }
		
		if (this._opts.isFixedHeight) {
			var item = this._dataSource.getItemForIndex(0);
			if (!item) { return false; }
			var key = item[this._dataSource.getKey()],
				cell = this._cellsByID[key] || (this._cellsByID[key] = this._createCell(item)),
				dim = $.size(cell.getElement());
			if (dim.width == 0 || dim.height == 0) { return null; }
			
			var margin = this._opts.margin;
			if (margin) {
				dim.width += margin;
				dim.height += margin;
			}
			
			this._cellDim = dim;
			return dim;
		} else {
			throw 'unimplemented'
		}
	};

	this._createCell = function(item) {
		var key = this._dataSource.getKey(),
			cell = new this._cellCtor({
				parent: this,
				controller: this,
				key: key,
				data: item
			});
		
		cell.getElement().setAttribute('squill-data-id', item[key]);
		cell.render();
		return cell;
	};

	this._nodeOrder = function() {
		var container = this._container;
		var src = this._renderedDataSource;
		var key = src.key;
		var dummy;
		var cell;
		var element;
		var item;
		var i;

		if (!container.childNodes.length) {
			return;
		}

		dummy = document.createElement('div');

		container.insertBefore(dummy, container.childNodes[0]);
		for (i = 0; i < src.length; i++) {
			item = src.getItemForIndex(i);
			cell = this._cellsByID[item[key]];
			element = cell.getElement();
			if (cell && element.parentNode) {
				container.insertBefore(container.removeChild(element), dummy);
			}
		}

		container.removeChild(dummy);
	};

	this.renderAllDelayed = function() {
		var src = this._renderedDataSource;
		if (!src) { return; }

		this.updateRenderOpts();
		var i = 0;
		function renderOne() {
			var item = src.getItemForIndex(i);
			if (!item) { return false; }
			
			var id = item[src.getKey()];
			var cell = this._cellsByID[id];
			if (!cell) {
				cell = this._cellsByID[id] = this._createCell(item);
			} else {
				cell.render();
			}
			!this._applyNodeOrder && this.positionCell(cell, i);
			++i;
			return true;
		}

		function renderMany() {
			var THRESHOLD = 50; // ms to render
			var n = 0, t = +new Date();
			while (n++ < 10 || +new Date() - t < THRESHOLD) {
				if (!renderOne.call(this)) {
					this._applyNodeOrder && this._nodeOrder();
					return;
				}
			}
			
			setTimeout(bind(this, renderMany), 100);
		}

		var removed = this._removed;
		for (var id in removed) {
			if (!src.getItemForID(id)) {
				var cell = this._cellsByID[id];
				if (cell) {
					cell.remove();
					delete this._cellsByID[id];
				}
			}
		};

		renderMany.call(this);
	}

	this.setOffsetParent = function(offsetParent) {
		this._opts.offsetParent = offsetParent;
	};

	this.setTiled = function(tiled) {
		this._opts.isTiled = tiled;
		this._isTiled = tiled;
	};

	this.updateRenderOpts = function() {
		var r = this._renderOpts;

		r.offsetTop = this._containSelf ? 0 : this._container.offsetTop;
		r.offsetLeft = this._containSelf ? 0 : this._container.offsetLeft;

		var parent = this._offsetParent || this.getOffsetParent();
		r.top = (parent.getAttribute('squill-scroller-top') || parent.scrollTop) - r.offsetTop;
		r.height = parent.offsetHeight;
		r.bottom = r.top + r.height;

		if (this._opts.isFixedHeight) {
			var cellDim = this.getCellDim();
			if (!cellDim) { return false; }
			r.cellWidth = cellDim.width;
			r.cellHeight = cellDim.height;
		}

		var n = r.numRows = this._renderedDataSource.length;
		if (this._opts.isFixedHeight) {
			if (this._opts.isTiled) {
				r.maxWidth = parent.offsetWidth - r.offsetLeft;
				r.numPerRow = Math.max(1, r.maxWidth / r.cellWidth | 0);
				r.numRows = Math.ceil(n / r.numPerRow);
				r.start = Math.max(0, (r.top / r.cellHeight | 0) * r.numPerRow);
				r.end = Math.ceil(r.bottom / r.cellHeight) * r.numPerRow;
			} else {
				r.start = Math.max(0, r.top / r.cellHeight | 0);
				r.end = (r.bottom / r.cellHeight + 1) | 0;
			}
		}

		if (!this._applyNodeOrder) {
			if (this._opts.absolutePosition) {
				this._container.style.height = r.numRows * r.cellHeight + 'px';
			} else {
				this._container.style.height = 'auto';
			}
		}

		return true;
	};

	this.positionCell = function(cell, i) {
		if (!this._opts.absolutePosition) { return; }

		var r = this._renderOpts;
		var el = cell.getElement();
		var x, y;

		if (this._opts.isTiled) {
			x = i % r.numPerRow;
			y = (i / r.numPerRow) | 0;
			el.style.left = x * r.cellWidth + r.offsetLeft + 'px';
			el.style.top = y * r.cellHeight + r.offsetTop + 'px';
		} else {
			el.style.top = (i * r.cellHeight || 0) + r.offsetTop + 'px';
		}
	};

	this.getOffsetParent = function() {
		// the list might be contained in some other scrolling div
		return this._opts.offsetParent || (this._containSelf ? this._container : this._container.offsetParent) || document.body;
	};

	this.renderFixedHeight = function() {
		var parent = this.getOffsetParent();
		if (!parent) { return; }
		if (parent != this._offsetParent) {
			if (this._removeScrollEvt) { this._removeScrollEvt(); }
			this._offsetParent = parent;
			this._removeScrollEvt = $.onEvent(parent, 'scroll', this, 'needsRender');
		}

		// render data
		var src = this._renderedDataSource,
			key = src.getKey(),
			n = src.length;
		
		if (n && !this.updateRenderOpts()) { return; }

		// swap lists
		var oldCellsByID = this._cellsByID;
		this._cellsByID = {};

		// render new items
		if (n) {
			var isTiled = this._isTiled;
			var r = this._renderOpts;
			for (var i = r.start; i < r.end; ++i) {
				var item = src.getItemForIndex(i);
				if (!item) { break; }

				var id = item[key];
				var cell = oldCellsByID[id];
				if (!cell) {
					cell = this._createCell(item);
				} else {
					delete(oldCellsByID[id]);
					cell.render();
				}

				this.positionCell(cell, i);
				this._cellsByID[id] = cell;
			}
		};

		// remove old items
		if (!this._opts.preserveCells) {
			for (var id in oldCellsByID) {
				oldCellsByID[id].remove();
			}
		} else {
			for (var id in oldCellsByID) {
				var cell = oldCellsByID[id];
				if (!src.getItemForID(id)) {
					cell.remove();
				} else {
					this._cellsByID[id] = cell;
				}
			}
		}
	};
});
