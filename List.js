jsio('import .Widget');
jsio('from util.browser import $');
jsio('import GCDataSource');

var List = exports = Class(Widget, function(supr) {
	this.init = function(opts) {
		opts = merge(opts, {
			containSelf: true,
			margin: 0,
			isTiled: false,
			preserveCells: false
		});
		
		if (opts.cellCtor) { this.setCellCtor(opts.cellCtor); }
		if (opts.dataSource) { this.setDataSource(opts.dataSource); }
		if (opts.sorter) { this.setSorter(opts.sorter); }
		
		this._lastFilter = -1;
		this._isFixedHeight = true;
		this._cells = [];
		this._cellsByID = {};
		this._containSelf = opts.containSelf;
		this._margin = opts.margin || 0;
		this._isTiled = opts.isTiled;
		
		this.needsRender = delay(this.render);
		this.updateFilter = delay(function() {
			this._lastFilter = -1;
			this.needsRender();
		}, 100);
		
		supr(this, 'init', [opts]);
	}
	
	this.onShow = function() { this.needsRender(); }
	
	this.setDataSource = function(dataSource) {
		this._dataSource = dataSource;
		this._dataSource.subscribe('Update', this, 'updateFilter');
		this._dataSource.subscribe('Remove', this, 'updateFilter');
	}
	
	this.setSelected = function(data) { this._selected = data; }
	this.getSelected = function() { return this._selected; }
	
	this.buildWidget = function() {
		this._container = $({parent: this._el});
		if (this._containSelf) {
			this._container.style.position = 'relative';
		}
		this.render();
	}
	
	this.setCellCtor = function(cellCtor) { this._cellCtor = cellCtor; }
	this.getCellById = function(id) { return this._cellsByID[id]; }
	this.getCells = function() { return this._cellsByID; }
	
	this.setSorter = function(sorter) { this._sorter = sorter; }
	
	this.setFilter = function(filter) {
		this._filter = filter;
		this.needsRender();
	}
	
	this.setFixedHeight = function(isFixedHeight) {
		this._isFixedHeight = isFixedHeight;
	}
	
	this._applyFilter = function() {
		var filter = this._filter;
		var ds = this._renderedDataSource = new GCDataSource();
		ds.key = this._dataSource.key;
		var src = this._dataSource;
		for (var i = 0, n = src.length; i < n; ++i) {
			var item = src.getItemForIndex(i);
			var match = true;
			for (var key in filter) {
				if (typeof item[key] == 'string'
						&& item[key].toLowerCase().indexOf(filter[key]) == -1) {
					match = false;
				}
			}
			
			if (match) {
				ds.add(item);
			}
		}
	}
	
	// just render all cells for now
	this.render = function() {
		this._dataSource.sort();
		
		if (this._filter != this._lastFilter || !this._renderedDataSource) {
			this._lastFilter = this._filter;
			this._applyFilter();
		}
		
		if (this._isFixedHeight) {
			this.renderFixedHeight();
		} else {
			this.renderDynamicHeight();
		}
	}
	
	this.getCellDim = function() {
		if (this._cellDim) { return this._cellDim; }
		
		if (this._isFixedHeight) {
			var item = this._dataSource.getItemForIndex(0);
			var key = item[this._dataSource.key];
			var cell = this._cellsByID[key] || (this._cellsByID[key] = this._createCell(item));
			var dim = $.size(cell.getElement());
			if (dim.width == 0 || dim.height == 0) { return null; }
			
			if (this._margin) {
				dim.width += this._margin;
				dim.height += this._margin;
			}
			
			this._cellDim = dim;
			return dim;
		} else {
			throw 'unimplemented'
		}
	}
	
	this._createCell = function(item) {
		var cell = new this._cellCtor({parent: this._container, key: this._dataSource.key});
		cell.setParent(this);
		cell.setData(item);
		cell.render();
		return cell;
	}
	
	this.renderAllDelayed = function() {
		// TODO
	}
	
	this.setOffsetParent = function(offsetParent) {
		this._params.offsetParent = offsetParent;
	}
	
	this.renderFixedHeight = function() {
		// the list might be contained in some other scrolling div
		var parent = this._params.offsetParent || this._container.offsetParent;
		if (!parent) { return; }
		
		if (parent != this._offsetParent) {
			if (this._removeScrollEvt) { this._removeScrollEvt(); }
			this._offsetParent = parent;
			this._removeScrollEvt = $.onEvent(parent, 'scroll', this, 'needsRender');
		}
		
		// render data
		var src = this._renderedDataSource;
		var key = src.key;
		var n = src.length;
		if (n) {
			// do this before swapping lists so that if we create a cell, it doesn't get lost!
			var cellDim = this.getCellDim();
			if (!cellDim) { return; }
		}
		
		// swap lists
		var oldCellsByID = this._cellsByID;
		this._cellsByID = {};
		
		// render new items
		if (n) {
			var offsetTop = this._containSelf ? 0 : this._container.offsetTop,
				offsetLeft = this._containSelf ? 0 : this._container.offsetLeft,
				top = (parent.getAttribute('squill-scroller-top') || parent.scrollTop) - offsetTop,
				height = parent.offsetHeight,
				bottom = top + height;
			
			var isTiled = this._isTiled;
			
			if (isTiled) {
				var maxWidth = parent.offsetWidth - offsetLeft;
				var numPerRow = maxWidth / cellDim.width | 0;
				var start = Math.max(0, (top / cellDim.height | 0) * numPerRow);
				var end = Math.ceil(bottom / cellDim.height) * numPerRow;
			} else {
				var start = Math.max(0, top / cellDim.height | 0);
				var end = (bottom / cellDim.height + 1) | 0;
			}
			
			var numRows = (isTiled ? Math.ceil(n / numPerRow) : n);
			this._container.style.height = numRows * cellDim.height + 'px';
			
			for (var i = start; i < end; ++i) {
				var item = src.getItemForIndex(i);
				if (!item) { break; }

				var id = item[key];
				var cell = oldCellsByID[id];
				if (!cell) {
					cell = this._createCell(item);
				} else {
					delete oldCellsByID[id];
				}

				if (isTiled) {
					var el = cell.getElement();
					var x = i % numPerRow;
					var y = (i / numPerRow) | 0;
					el.style.left = x * cellDim.width + offsetLeft + 'px';
					el.style.top = y * cellDim.height + offsetTop + 'px';
				} else {
					cell.getElement().style.top = i * cellDim.height + offsetTop + 'px';
				}
				
				this._cellsByID[id] = cell;
			}
			
		}
		
		// remove old items
		if (!this._params.preserveCells) {
			for (var id in oldCellsByID) {
				oldCellsByID[id].remove();
			}
		} else {
			for (var id in oldCellsByID) {
				var cell = oldCellsByID[id];
				if (!this._dataSource.getItemForId(id)) {
					cell.remove();
				} else {
					this._cellsByID[id] = cell;
				}
			}
			
		}
	}
});
