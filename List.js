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
	
	this.getCellHeight = function() {
		if (this._cellHeight) { return this._cellHeight; }
		
		if (this._isFixedHeight) {
			var key = this._dataSource.key;
			var item = this._dataSource.getItemForIndex(0);
			var cell = this._createCell(item);
			var height = cell.getElement().offsetHeight;
			this._cellsByID[item[key]] = cell;
			this._cellHeight = height;
			return height;
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
	
	this.renderFixedHeight = function() {
		// the list might be contained in some other scrolling div
		var parent = this._testEl.offsetParent;
		if (!parent) { return; }
		
		if (parent != this._offsetParent) {
			if (this._removeScrollEvt) { this._removeScrollEvt(); }
			this._offsetParent = parent;
			this._removeScrollEvt = $.onEvent(parent, 'scroll', this, 'render');
		}
		
		var offsetTop = parent == this._el ? 0 : this._el.offsetTop,
			top = parent.scrollTop - offsetTop,
			height = parent.offsetHeight,
			bottom = top + height,
			cellHeight = this.getCellHeight();
		
		var start = Math.max(0, top / cellHeight | 0);
		var end = (bottom / cellHeight + 1) | 0;
		
		var oldCellsByID = this._cellsByID;
		this._cellsByID = {};
		
		var src = this._renderedDataSource;
		
		this._el.style.height = src.length * cellHeight + 'px';
		
		var key = src.key;
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
			
			cell.getElement().style.top = i * cellHeight + offsetTop + 'px';
			this._cellsByID[id] = cell;
		}
		
		for (var id in oldCellsByID) {
			logger.log('removing', id);
			oldCellsByID[id].remove();
			delete oldCellsByID[id];
		}
	}
	
	this.needsRender = delay(this.render);
});
