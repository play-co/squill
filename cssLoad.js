"use import";

import std.uri;
import util.ajax;
from util.browser import $;

logger.setLevel(0);

exports.get = function(opts, cb) {
	if (typeof opts == 'string') {
		opts = {url: opts};
	}
	
	var parent = opts.el || document.getElementsByTagName('head')[0];
	
	var uri = new std.uri(opts.url);
	var host = uri.getHost();
	if (host && (host != window.location.hostname)) {
		var el = $({tag: 'link'});
		el.type = 'text/css';
		el.rel = 'stylesheet';
		el.href = opts.url;
		parent.appendChild(el);
		setTimeout(cb, 500);
	} else {
		util.ajax.get(opts.url, function(err, content) {
			if (err) { logger.error('could not fetch css at', url); return; }
			var el = $({tag: 'style', text: content, parent: parent});

			if (window.DEV_MODE) {
				exports._styleTags.push({
					el: el,
					src: opts.url
				});
			}
			
			setTimeout(cb, 0);
		});
	}
}

if (window.DEV_MODE) {
	exports._styleTags = [];
	window.addEventListener('message', function(evt) {
		if (evt.data == 'squill.cssLoad.reload()') {
			for (var i = 0, s; s = exports._styleTags[i]; ++i) {
				util.ajax.get(s.src, bind(this, function(s, err, content) {
					if (!err) { $.setText(s.el, content); }
				}, s));
			}
		}
	}, true);
}
