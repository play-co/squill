"use import";

import lib.PubSub;

/**
 * The Selection class connects a selection storage to a UI element.
 *
 * A selection storage is very simple class that maintains the data layer of 
 * a selection. It is entirely based on item ID, exposing the methods:
 *   isSelected(id) -> bool
 *   select(id)
 *   deselect(id)
 * You may, for example, want to implement a selection store that persists
 * the current selection over a network. The base implementation of a selection
 * storage is exports.LocalStore, which simply wraps an in-memory object.
 * 
 * The Selection class handles logic such as how many items can be selected
 * at once, and provides the API that UI widgets can interact with.  For example,
 * the squill.List class contains a public proprty .selection that is an
 * instance of a Selection instance.
 */
exports = Class(lib.PubSub, function() {

	this.init = function(opts) {
		this._parent = opts.parent;
		this._type = opts.type || false;
		this._selection = opts.selectionStore || new exports.LocalStore();
		this._maxSelections = opts.maxSelections || 1;
		this._currentSelectionCount = 0;
		this._lastSelected = null;
	};

	this.getType = function() { return this._type; };

	this.isSelected = function(id) {
		if (typeof id == 'object') {
			id = id[this._parent.getDataSource().key];
		}
		return this._selection.isSelected(id);
	};

	this.toggle = function(item) {
		this._setSelected(item, !this.isSelected(item[this._parent.getDataSource().key]));
	};

	this.select = function(item) {
		if((this._currentSelectionCount < this._maxSelections) || this._type == 'single') {
			this._setSelected(item, true);
		}
	};

	this.deselect = function(item) {
		this._setSelected(item, false);
	};

	this.deselectAll = function() {
		this._selection.deselectAll();
		this._currentSelectionCount = 0;
	};

	this.get = function() { return this._selection.get(); };

	this.getSelectionCount = function() {
		return this._currentSelectionCount;
	};
	
	this._setSelected = function(item, isSelected) {
		if (!item) { return; }
		
		var dataSource = this._parent.getDataSource(),
			key = dataSource.key;
		if (typeof item == 'string') {
			item = dataSource.get(item);
		}
		var id = item[key];

		if (this._selection.isSelected(id) != isSelected) {
			if (isSelected) {
				if (this._lastSelected && this._type == 'single') {
					var lastID = this._lastSelected[key];
					this._selection.deselect(lastID);
					this._currentSelectionCount--;
					this.publish('Deselect', this._lastSelected, lastID);
				}

				this._lastSelected = item;
				this._selection.select(id);
				this._currentSelectionCount++;
			} else {
				this._selection.deselect(id);
				this._currentSelectionCount--;
			}

			this.publish(isSelected ? 'Select' : 'Deselect', item, id);
		}
	};
});

exports.LocalStore = Class(function() {
	this.init = function() {
		this._store = {};
	}
	
	this.get = function() {
		return merge({}, this._store);
	}

	this.select = function(id) {
		this._store[id] = true;
	}
	
	this.deselect = function(id) {
		delete this._store[id];
	}
	
	this.deselectAll = function(id) {
		this._store = {};
	}
	
	this.isSelected = function(id) {
		if (id !== undefined) {
			return !!this._store[id];
		} else {
			for (var key in this._store) {
				return true;
			}
			return false;
		}
	}
});

