import .Widget;
import squill.models.DataSource as DataSource;

from util.browser import $;

var SelectBox = exports = Class(Widget, function(supr) {

	this._css = 'select';

	this._def = {
		tag: 'label',
		style: {display: 'inline-block'},
		children: [{
			id: '_select',
			tag: 'select'
		}]
	};

	this.init = function(opts) {
		opts = merge(opts, {
			renderer: bind(this, 'defaultRenderer')
		});

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
			var uid = 1;
			var items = this._opts.items.map(function (item) {
				if (typeof item != 'object') {
					return {id: typeof item == 'string' ? item : uid++, value: item};
				} else {
					if (!item.id) {
						item.id =   'value' in item ? item.value :
									'title' in item ? item.title :
									(uid++);
					}

					return item;
				}
			});

			this._dataSource.add(items);
		}

		if ('value' in this._opts) {
			this.setValue(this._opts.value);
		}

		this.initMouseEvents(this._el);
		$.onEvent(this._select, 'change', this, '_onSelect');
	}

	this._onSelect = function() {
		var item = this._dataSource.get(this.getValue());
		if (item) {
			this.publish('change', item);
		}
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

	this.defaultRenderer = function(item) {
		var key = this._dataSource.getKey();
		return item.displayName || item.label || item.title || item.text || item[key];
	}

	this.onUpdateItem = function(id, item) {
		var el = this._items[id];
		var keyField = this._dataSource.getKey();

		if (typeof(item) === 'string') {
			var o = {};
			o[keyField] = item;
			item = o;
		}

		if (!el) {
			var el = this._items[id] = $.create({tag: 'option'});
			$.insertBefore(this._select, el);
		}

		el.setAttribute('value', item[keyField]);
		var renderer = this._opts.renderer;
		el.innerText = (typeof renderer === 'string' ? item[renderer] : renderer(item))
		el.value = item[keyField];
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


	this.setName = function(name) { this._select.name = name; }
	this.setValue = function(value) { this._select.value = value; }

	this.getValue = function() { return this._select.value; }
});
