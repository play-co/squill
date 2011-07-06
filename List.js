jsio('import .Widget');

var List = exports = Class(Widget, function(supr) {
	this.init = function(params) {
		
		if (params.cellCtor) { this.setCellCtor(params.cellCtor); }
		if (params.dataSource) { this.setDataSource(params.dataSource); }
		if (params.sorter) { this.setSorter(params.sorter); }
		
		this._cells = [];
		this._cellsById = {};
		
		supr(this, 'init', arguments);
	}
	
	this.setDataSource = function(dataSource) {
		this._dataSource = dataSource;
		this._dataSource.subscribe('Update', this, 'render');
		this._dataSource.subscribe('Remove', this, 'render');
	}
	
	this.setSelected = function(data) { this._selected = data; }
	this.getSelected = function() { return this._selected; }
	
	this.buildWidget = function() { this.render(); }
	
	this.setCellCtor = function(cellCtor) { this._cellCtor = cellCtor; }
	this.getCellById = function(id) { return this._cellsById[id]; }
	
	this.setSorter = function(sorter) { this._sorter = sorter; }
	
	// just render all cells for now
	this.render = function() {
		this._dataSource.sort();
		
		// TODO: if fixed-height cells, only render the visible ones and use the `scroll` event
		var top = this._el.scrollTop,
			height = this._el.offsetHeight,
			bottom = top + height,
			i = 0;
			
		while (true) {
			var item = this._dataSource.getItemForIndex(i);
			if (!item) {
				var remainder = this._cells.slice(i);
				this._cells.length = i;
				for (var i = 0, cell; cell = remainder[i]; ++i) {
					cell.remove();
					delete this._cellsById[cell.getData().id];
				}
				return;
			}
			
			var cell = this._cells[i];
			if (!cell) {
				cell = this._cells[i] = new this._cellCtor({parent: this._el});
			}
			cell.setParent(this);
			cell.setData(item);
			cell.render();
			
			this._cellsById[item.id] = cell;
			++i;
		}
	}
});
