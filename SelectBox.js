"use import";

import .Widget;
from util.browser import $;
import squill.models.DataSource as DataSource;

var SelectBox = exports = Class(Widget, function(supr) {
	this._def = {
		tag: 'select'
	};

	this.init = function(opts) {
		this._items = {};
		if (opts.dataSource) { this.setDataSource(opts.dataSource); }
		supr(this, 'init', arguments);
	}
	
	this.buildWidget = function() {
		if (this._opts.name) {
			this.setName(this._opts.name);
		}

		if (!this._dataSource) {
			this.setDataSource(new DataSource());
		}
		
		if (this._opts.items) {
			this._dataSource.add(this._opts.items);
		}

		
		this.initMouseEvents(this._el);
		$.onEvent(this._el, 'change', this, '_onSelect');
	}
	
	this._onSelect = function() {
		this.publish('Select', this.getValue());
	}

	this.setDataSource = function(dataSource) {
		if (this._dataSource) {
			this._dataSource.unsubscribe('Update', this);
			this._dataSource.unsubscribe('Remove', this);
		}
		this._dataSource = dataSource;
		this._dataSource.subscribe('Update', this, 'onUpdateItem');
		this._dataSource.subscribe('Remove', this, 'onRemoveItem');
		this._dataSource.forEach(function(item, key) {
			this.onUpdateItem(key, item);
		}, this);
	}
	
	this.onUpdateItem = function(id, item) {
		var el = this._items[id];

		if (typeof(item) === 'string') {
			item = {value: item};
		}

		if (!el) {
			var el = this._items[id] = $.create({tag: 'option'});
			$.insertBefore(this._el, el);
		}

		el.setAttribute('value', item.value);
		el.innerText = item.text || item.label || item.value || '';
	}
	
	this.onRemoveItem = function(id) {
		var el = this._items[id];
		var prevValue = this.getValue();
		if (el) {
			$.remove(el);
			delete this._items[id];
		}
		var newValue = this.getValue();
		if (newValue != prevValue) {
			this._onSelect(); // the old value was removed, so select a new one
		}
	}


	this.setName = function(name) { this._el.name = name; }
	this.setValue = function(value) { this._el.value = value; }

	this.getValue = function() { return this._el.value; }
});
