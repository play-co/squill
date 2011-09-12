jsio('import .Resource');
jsio('import .Widget');
logger.setLevel(0);

var List = exports = Class(Widget, function(supr) {
	this.init = function(params) {
		supr(this, 'init', arguments);
		
		if (params.getCell) { this.setCellGetter(params.getCell); }
		if (params.dataSource) { this.setDataSource(params.dataSource); }
		if (params.sorter) { this.setSorter(params.sorter); }
		if (params.fixedHeight) {}
		
		this._fixedHeight = true; // TODO: make this an option
		
		this._cellResource = new Resource();
		this._cells = {};
		this._cellsById = {};
		this._needsSort = true;
	}
	
	this.setDataSource = function(dataSource) {
		this._dataSource = dataSource;
		this._dataSource.subscribe('Update', this, 'needsSort');
		this._dataSource.subscribe('Remove', this, 'needsSort');
	}
	
	this.needsSort = function() { this._needsSort = true; this._view.needsRepaint(); }
	
	this.setSelected = function(data) { this._selected = data; }
	this.getSelected = function() { return this._selected; }
	
	this.setCellGetter = function(getCell) { this._getCell = getCell; }
	this.getCellById = function(id) { return this._cellsById[id]; }
	
	this.setSorter = function(sorter) { this._sorter = sorter; }
	
	// just render all cells for now
	this.render = function(viewport) {
		if (this._needsSort) {
			this._needsSort = null;
			this._dataSource.sort();
		}
		
		if (this._fixedHeight) {
			this.renderFixed(viewport);
		} else {
			this.renderVariable(viewport);
		}
	}
	
	this.renderFixed = function(viewport) {
		var top = viewport.y;
		var height = viewport.height;
		var bottom = top + height;
		var i = 0;
		var dataSource = this._dataSource;
		var key = dataSource.key;
		
		if (!this._fixedHeightValue) {
			var item0 = dataSource.getItemForIndex(0);
			if (!item0) { return; }
			var firstCell = this._getCell(item0, this._cellResource);
			this._fixedHeightValue = firstCell.getHeight();
		}
		
		var cellHeight = this._fixedHeightValue,
			startCell = (top / cellHeight | 0),
			endCell = (bottom / cellHeight | 0) + 1,
			cells = {},
			y = startCell * cellHeight;
		
		this._view.setMaxY(this._dataSource.length * cellHeight);
		
		for (var i = startCell; i < endCell; ++i) {
			var item = dataSource.getItemForIndex(i);
			if (!item) {
				break;
			} else {
				var cellView = this._cells[item[key]];
				if (!cellView) {
					cellView = this._getCell(item, this._cellResource);
					cellView.setData(item);
					cellView.model.setResource(this._cellResource);
				}
				
				if (cellView) {
					cellView.setSize(y, cellHeight);
					this._view.addCell(cellView);
					
					// we delete everything from this._cells and then 
					// replace this._cells with cells
					delete this._cells[item[key]];
					cells[item[key]] = cellView;
				}
			}
			
			y += cellHeight;
		}
		
		for (var id in this._cells) {
			var cell = this._cells[id];
			cell.model.recycle();
			delete this._cells[id];
		}
		
		this._cells = cells;
	}
});
