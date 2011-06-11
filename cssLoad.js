"use import";

import util.ajax;
from util.browser import $;

exports.get = function(opts, cb) {
	if (typeof opts == 'string') {
		opts = {url: opts};
	}
	
	util.ajax.get(opts.url, function(err, content) {
		if (err) { logger.error('could not fetch css at', url); return; }
		$({tag: 'style', text: content, parent: opts.el || document.getElementsByTagName('head')[0]});
		setTimeout(cb, 0);
	});
}