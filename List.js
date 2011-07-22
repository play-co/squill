jsio('import .Widget');
jsio('from util.browser import $');
jsio('import GCDataSource');

var List = exports = Class(Widget, function(supr) {
	this.init = function(params) {
		
		if (params.cellCtor) { this.setCellCtor(params.cellCtor); }
		if (params.dataSource) { this.setDataSource(params.dataSource); }
		if (params.sorter) { this.setSorter(params.sorter); }
		
		this._lastFilter = -1;
		this._isFixedHeight = true;
		this._cells = [];
		this._cellsByID = {};
		this._margin = params.margin;
		this._isTiled = params.isTiled;
		
		supr(this, 'init', arguments);
	}
	
	this.setDataSource = function(dataSource) {
		this._dataSource = dataSource;
		this._dataSource.subscribe('Update', this, 'updateFilter');
		this._dataSource.subscribe('Remove', this, 'updateFilter');
	}
	
	this.updateFilter = delay(function() {
		this._lastFilter = -1;
		this.needsRender();
	}, 100);
	
	this.setSelected = function(data) { this._selected = data; }
	this.getSelected = function() { return this._selected; }
	
	this.buildWidget = function() {
		this._testEl = this._el.appendChild($({}));
		this.render();
	}
	
	this.setCellCtor = function(cellCtor) { this._cellCtor = cellCtor; }
	this.getCellById = function(id) { return this._cellsByID[id]; }
	
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
		var cell = new this._cellCtor({parent: this._el});
		cell.setParent(this);
		cell.setData(item);
		cell.render();
		return cell;
	}
	
	this.renderAllDelayed = function() {
		// TODO
	}
	
	this.renderFixedHeight = function() {
		// the list might be contained in some other scrolling div
		var parent = this._testEl.offsetParent;
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
		}
		
		// swap lists
		var oldCellsByID = this._cellsByID;
		this._cellsByID = {};
		
		// render new items
		if (n) {
			var offsetTop = parent == this._el ? 0 : this._el.offsetTop,
				top = (parent.getAttribute('squill-scroller-top') || parent.scrollTop) - offsetTop,
				height = parent.offsetHeight,
				bottom = top + height;
			
			var isTiled = this._isTiled;
			
			if (isTiled) {
				var maxWidth = parent.offsetWidth;
				var numPerRow = maxWidth / cellDim.width | 0;
				var start = Math.max(0, (top / cellDim.height | 0) * numPerRow);
				var end = Math.ceil(bottom / cellDim.height) * numPerRow;
			} else {
				var start = Math.max(0, top / cellDim.height | 0);
				var end = (bottom / cellDim.height + 1) | 0;
			}
			
			var numRows = (isTiled ? Math.ceil(n / numPerRow) : n);
			this._el.style.height = numRows * cellDim.height + 'px';
			
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
					el.style.left = x * cellDim.width + 'px';
					el.style.top = y * cellDim.height + offsetTop + 'px';
				} else {
					cell.getElement().style.top = i * cellDim.height + offsetTop + 'px';
				}
				
				this._cellsByID[id] = cell;
			}
			
		}
		
		// remove old items
		for (var id in oldCellsByID) {
			oldCellsByID[id].remove();
			delete oldCellsByID[id];
		}
	}
	
	this.needsRender = delay(this.render);
});
