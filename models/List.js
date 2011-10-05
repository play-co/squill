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
		this._cells = {};
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
	this.getCellById = function(id) { return this._cells[id]; }
	
	this.setSorter = function(sorter) { this._sorter = sorter; }
	
	// just render all cells for now
	this.render = function(viewport) {
		if (this._needsSort) {
			this._needsSort = null;
			this._dataSource.sort();
		}
		
		if (!this._dataSource.length) { return; }
		
		if (this._opts.isFixedHeight) {
			this.renderFixed(viewport);
		} else {
			this.renderVariable(viewport);
		}
	}
	
	this.renderVariable = function() {
		if (!this._dataSource) { return; }
		
		var i = 0;
		var y = 0;
		function renderOne() {
			var item = this._dataSource.getItemForIndex(i);
			if (!item) {
				this._view.setMaxY(y);
				return false;
			}
			
			var id = item[this._dataSource.key];
			var cell = this._createCell(item);
			if (cell) {
				var height = cell.getHeight();
				cell.setSize(y, height);
				y += height;
				this._view.addCell(cell);
			}
			
			cell.needsRepaint();
			
			//this.positionCell(cell, i);
			++i;
			return true;
		}
		
		function renderMany() {
			var THRESHOLD = 50; // ms to render
			var n = 0, t = +new Date();
			while (n++ < 10 || +new Date() - t < THRESHOLD) {
				if (!renderOne.call(this)) { return; }
			}
			
			setTimeout(bind(this, renderMany), 100);
		}
		
		var removed = this._removed;
		for (var id in removed) {
			if (!this._dataSource.getItemForID(id)) {
				var cell = this._cells[id];
				if (cell) {
					cell.remove();
					delete this._cells[id];
				}
			}
		}
		
		renderMany.call(this);
	}
	
	this._createCell = function(item) {
		var key = this._dataSource.key;
		var cellView = this._cells[item[key]];
		if (!cellView) {
			cellView = this._getCell(item, this._cellResource);
			this._cells[item[key]] = cellView;
			cellView.setData(item);
			cellView.model.setResource(this._cellResource);
		}
		return cellView;
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
			prevCells = this._cells,
			y = startCell * cellHeight;
		
		this._view.setMaxY(this._dataSource.length * cellHeight);
		
		this._cells = {};
		for (var i = startCell; i < endCell; ++i) {
			var item = dataSource.getItemForIndex(i);
			if (!item) {
				break;
			} else {
				var cellView = this._createCell(item);
				if (cellView) {
					cellView.setSize(y, cellHeight);
					this._view.addCell(cellView);
					
					// we remove all cells in prevCells that aren't used.
					// mark it as used by deleting it.
					delete prevCells[item[key]];
				}
			}
			
			y += cellHeight;
		}
		
		for (var id in prevCells) {
			prevCells[id].remove();
			prevCells[id].model.recycle();
		}
	}
});
