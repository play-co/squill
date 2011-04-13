jsio('import .Resource');
jsio('import .Widget');

var List = exports = Class(Widget, function(supr) {
	this.init = function(params) {
		supr(this, 'init', arguments);
		
		if (params.getCell) { this.setCellGetter(params.getCell); }
		if (params.dataSource) { this.setDataSource(params.dataSource); }
		if (params.sorter) { this.setSorter(params.sorter); }
		if (params.fixedHeight) {}
		
		this._fixedHeight = true; // TODO: make this an option
		
		this._cellResource = new Resource();
		this._cells = [];
		this._cellsById = {};
		this._needsSort = true;
	}
	
	this.setDataSource = function(dataSource) {
		this._dataSource = dataSource;
		this._dataSource.subscribe('UPDATE', this, 'needsSort');
		this._dataSource.subscribe('REMOVE', this, 'needsSort');
	}
	
	this.needsSort = function() { this._needsSort = true; }
	
	this.setSelected = function(data) { this._selected = data; }
	this.getSelected = function() { return this._selected; }
	
	this.setCellGetter = function(getCell) { this._getCell = getCell; }
	this.getCellById = function(id) { return this._cellsById[id]; }
	
	this.setSorter = function(sorter) { this._sorter = sorter; }
	
	// just render all cells for now
	this.render = function(ctx) {
		if (this._needsSort) {
			this._needsSort = null;
			this._dataSource.sort();
		}
		
		if (this._fixedHeight) {
			this.renderFixed(ctx);
		} else {
			this.renderVariable(ctx);
		}
	}
	
	this.renderFixed = function(ctx) {
		var top = ctx._viewport.y,
			height = ctx._viewport.height,
			bottom = top + height,
			i = 0;
		
		if (!this._fixedHeightValue) {
			var firstCell = this._getCell(this._dataSource.getItemForIndex(0), this._cellResource);
			this._fixedHeightValue = firstCell.getHeight();
		}
		
		var cellHeight = this._fixedHeightValue,
			startCell = (top / cellHeight | 0),
			endCell = (bottom / cellHeight | 0) + 1,
			cells = {},
			y = startCell * cellHeight;
		
		for (var i = startCell; i < endCell; ++i) {
			var item = this._dataSource.getItemForIndex(i);
			if (!item) {
				this._view.setMaxY(y);
				break;
			} else {
				var cellView = this._cells[item.id];
				if (!cellView) {
					logger.debug("no cell for", item.id);
					
					cellView = this._getCell(item, this._cellResource);
					cellView.setData(item);
					cellView.model.setResource(this._cellResource);
				}
				
				if (cellView) {
					cellView.setSize(y, cellHeight);
					this._view.addCell(cellView);
					
					// we delete everything from this._cells and then 
					// replace this._cells with cells
					delete this._cells[item.id];
					cells[item.id] = cellView;
				}
			}
			
			y += cellHeight;
		}
		
		for (var id in this._cells) {
			logger.debug("deleting cell", id);
			var cell = this._cells[id];
			cell.model.recycle();
			delete this._cells[id];
		}
		
		this._cells = cells;
	}
});
