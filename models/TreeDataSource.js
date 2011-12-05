"use import";

import lib.PubSub;
import std.js as JS;

var TreeDataSource = exports = Class(lib.PubSub, function() {
	this.init = function(opts) {
		opts = opts || {};

		this._hasRemote = opts.hasRemote;
		this.getExampleData();
	};

	this.getExampleData = function() {
		this._root =  {
			title: 'Example item 0',
			children: [
				{
					title: 'Example item 1',
					children: [
						{title: 'Example item 2'},
						{title: 'Example item 3'},
						{title: 'Example item 4'},
						{
							title: 'Example item 5',
							children: [
								{ title: 'Example item 6' },
								{ title: 'Example item 7' },
								{ title: 'Example item 8' },
								{ title: 'Example item 9' }
							]
						}
					]
				}
			]
		};
	};

	this.getRoot = function() {
		return this._root;
	};
});