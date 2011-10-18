jsio('import .Resource');
jsio('import .Widget');
jsio('import ..Selection');
logger.setLevel(0);

var List = exports = Class(Widget, function(supr) {
	this.init = function(opts) {
		opts = merge(opts, {isFixedSize: true});
		
		supr(this, 'init', arguments);
		
		if (opts.getCell) { this.setCellGetter(opts.getCell); }
		if (opts.dataSource) { this.setDataSource(opts.dataSource); }
		if (opts.sorter) { this.setSorter(opts.sorter); }
		
		this._cellResource = new Resource();
		this._cells = {};
		this._needsSort = true;
		this._removed = {};
		this._renderOpts = {margin: 0};
		if (opts.selectable) {
			this.selection = new Selection({dataSource: this._dataSource, type: opts.selectable});
		}
	}
	
	this.setDataSource = function(dataSource) {
		this._dataSource = dataSource;
		this._dataSource.subscribe('Update', this, '_onUpdate');
		this._dataSource.subscribe('Remove', this, '_onRemove');
	}
	
	this._onUpdate = function(id, item) {
		var cell = this._cells[id];
		if (cell) { cell.setData(item); }
		this.needsSort();
	}
	
	this._onRemove = function(id, item) {
		this._removed[id] = true;
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
		
		if (this._opts.isFixedSize) {
			this.renderFixed(viewport);
		} else {
			this.renderVariable(viewport);
		}
	}

	// y is required for non-fixed-size lists.  Otherwise, y is ignored.
	this._positionCell = function(cell, i, y) {
		this._view.addCell(cell);

		var r = this._renderOpts;
		if (this._opts.isFixedSize) {
			if (this._opts.isTiled) {
				var x = i % r.numPerRow;
				var y = (i / r.numPerRow) | 0;
				cell.setPosition(x * r.cellWidth, y * r.cellHeight, r.cellWidth, r.cellHeight);
			} else {
				cell.setPosition(0, i * r.cellHeight || 0, r.cellWidth, r.cellHeight);
			}
		} else {
			cell.setPosition(0, y, null, cell.getHeight());
		}
	}
	
	this.renderVariable = function(viewport) {
		if (!this._dataSource) { return; }
		if (!this._updateRenderOpts(viewport)) { return; }
		
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
			this._positionCell(cell, i, y);
			cell.needsRepaint();
			
			++i;
			y += cell.style.height;
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
		this._removed = {};
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
		var cell = this._cells[item[key]];
		if (!cell) {
			cell = this._getCell(item, this._cellResource);
			this._cells[item[key]] = cell;
			cell.controller = this;
			cell.setData(item);
			cell.model.setResource(this._cellResource);
		}
		return cell;
	}
	
	this._updateRenderOpts = function(viewport) {
		var r = this._renderOpts;
		r.top = viewport.y;
		r.height = viewport.height;
		r.bottom = r.top + r.height;
		var n = r.numRows = this._dataSource.length;

		if (this._opts.isFixedSize) {
			if (!r.cellWidth || !r.cellHeight) {
				var item = this._dataSource.getItemForIndex(0);
				if (!item) { return false; }

				var key = item[this._dataSource.key];
				var cell = this._cells[key] || (this._cells[key] = this._createCell(item));
				r.cellWidth = cell.getWidth();
				r.cellHeight = cell.getHeight();
				if (!r.cellWidth || !r.cellHeight) { return null; }
				
				var margin = this._opts.margin;
				if (margin) { r.cellWidth += margin; r.cellHeight += margin; }
			}
			
			if (this._opts.isTiled) {
				r.maxWidth = viewport.width;
				r.numPerRow = r.maxWidth / r.cellWidth | 0;
				r.numRows = Math.ceil(n / r.numPerRow);
				r.start = Math.max(0, (r.top / r.cellHeight | 0) * r.numPerRow);
				r.end = Math.ceil(r.bottom / r.cellHeight) * r.numPerRow;
			} else {
				r.start = Math.max(0, r.top / r.cellHeight | 0);
				r.end = (r.bottom / r.cellHeight + 1) | 0;
			}

			this._view.setMaxY(r.numRows * r.cellHeight);
		}
		
		return true;
	}

	this.renderFixed = function(viewport) {
		if (!(this._updateRenderOpts(viewport))) { return; }

		var r = this._renderOpts;
		var i = 0;
		var dataSource = this._dataSource;
		var key = dataSource.key;
		var newCells = {};
		for (var i = r.start; i < r.end; ++i) {
			var item = dataSource.getItemForIndex(i);
			if (!item) {
				break;
			} else {
				var cell = this._createCell(item);
				if (cell) {
					newCells[item[key]] = cell;
					this._positionCell(cell, i);
					
					// we remove all cells in prevCells that aren't used.
					// mark it as used by deleting it.
					delete this._cells[item[key]];
				}
			}
		}
		
		for (var id in this._cells) {
			this._cells[id].remove();
			this._cells[id].model.recycle();
		}
		
		this._cells = newCells;
	}
});
