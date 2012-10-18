import std.uri;
import util.ajax;
from util.browser import $;

logger.setLevel(0);

exports.get = function(opts, cb) {
	if (typeof opts == 'string') {
		opts = {url: opts};
	}
	
	var parent = opts.el || document.getElementsByTagName('head')[0];
	
	var uri = std.uri.relativeTo(opts.url, window.location);
	var host = uri.getHost ? uri.getHost() : false;
	if (host && (host != window.location.hostname)) {
		var el = $({tag: 'link'});
		el.type = 'text/css';
		el.rel = 'stylesheet';
		el.href = opts.url;
		parent.appendChild(el);
		setTimeout(cb, 500);
	} else {
		util.ajax.get({
			url: opts.url
		}, function(err, content) {
			if (err) {
				logger.error('could not fetch css at', opts.url);
				cb && cb(err);
				return;
			}

			var el = $({tag: 'style', text: content, parent: parent});

			if (window.DEV_MODE) {
				exports._styleTags.push({
					el: el,
					src: opts.url
				});
			}
			
			setTimeout(function () {
				cb && cb(err, el);
			}, 0);
		});
	}
}

if (window.DEV_MODE) {
	exports._styleTags = [];
	window.reloadCSS = function() {
		for (var i = 0, s; s = exports._styleTags[i]; ++i) {
			util.ajax.get({url: s.src}, bind(this, function(s, err, content) {
				if (!err) { $.setText(s.el, content); }
			}, s));
		}
	}
	window.addEventListener('message', function(evt) {
		if (evt.data == 'squill.cssLoad.reload()') {
			reloadCSS();
		}
	}, true);
}
