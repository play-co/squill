jsio('import lib.PubSub');

exports.Poller = new (Class(lib.PubSub, function() {
	
	this._lastTag = null;
	
	this.start = function(initial, frequency) {
		this._lastTag = initial;
		setInterval(bind(this, pollHash), frequency || 500);
		setTimeout(bind(this, pollHash), 0);
	}
	
	this.getPrev = function() { return this._lastTag; }
	
	function pollHash() {
		try {
			var i = window.location.href.indexOf('#');
			var tag = i > 0 ? window.location.href.substring(i + 1).toLowerCase() : '';
			if(tag && tag !== this._lastTag) {
				this.publish('Change', tag, this._lastTag);
				this._lastTag = tag;
			}
		} catch(e) {}
	}
}));

exports.BasicPager = Class(function() {
	this.init = function(prefix) {
		this._prefix = prefix;
		exports.Poller.subscribe('Change', this, 'goto');
	}
	
	this.goto = function(page, lastPage) {
		lastPage = lastPage || exports.Poller.getPrev();
		
		window.location.hash = page;
		
		var prev = document.getElementById(this._prefix + lastPage);
		if(prev) { prev.style.display = 'none'; }
		
		var next = document.getElementById(this._prefix + page);
		if(next) { next.style.display = 'block'; }
	}
});