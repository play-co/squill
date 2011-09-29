"use import";

import .Widget;
from util.browser import $;

exports = Class(Widget, function() {
	this._def = {
		tag: 'table',
		style: merge({height: '100%', width: '100%'}, def.style),
		attrs: {cellpadding: 0, cellspacing: 0},
		children: [
			$({tag: 'tbody', children: [
				$({tag: 'tr', children: [
					$({id: 'contentPane', tag: 'td', attrs: {valign: 'middle'}, style: {verticalAlign: 'middle'}})
				]})
			]})
		]
	};
	
	this.addElement = function() { this.contentPane.appendChild(el); }
});
