"use import";

from util.browser import $;

import .Widget;

var contextMenu = false;

document.oncontextmenu = function(evt) {
	var element = evt.target;
	while (element) {
		if (element.contextMenu) {
			showMenu(element.contextMenu, evt.x, evt.y);
			break;
		} else {
			element = element.parentNode;
		}
	}
	return false;
};

function clearMenu() {
	while (contextMenu.elements.length) {
		$.remove(contextMenu.elements.pop());
	}
}

function clickOption(evt) {
	var option = contextMenu.options[evt.target.optionIndex];
	if (option) {
		if ((option.selected === true) || (option.selected === false)) {
			option.selected = !option.selected;
			if (option.selected) {
				$.removeClass(evt.target, 'deselectedOption');
				$.addClass(evt.target, 'selectedOption');
			} else {
				$.removeClass(evt.target, 'selectedOption');
				$.addClass(evt.target, 'deselectedOption');
			}
			option.onchange && option.onchange(option.selected);
		} else {
			hideMenu();
			option.onclick && option.onclick();
		}
	} else {
		hideMenu();
	}
};

function showMenu(menu, x, y) {
	if (contextMenu === false) {
		contextMenu = {
			overlay: document.createElement('div'),
			element: document.createElement('div'),
			elements: []
		};

		document.body.appendChild(contextMenu.overlay);
		document.body.appendChild(contextMenu.element);

		$.onEvent(
			contextMenu.overlay,
			'mousedown',
			this,
			function() {
				hideMenu()
			}
		);
		$.onEvent(
			contextMenu.element,
			'mousedown',
			this,
			function(evt) {
				$.stopEvent(evt);
			}
		);
	}

	contextMenu.options = menu.options;

	$.addClass(contextMenu.overlay, 'contextMenuOverlay');
	$.addClass(contextMenu.element, 'contextMenu');

	clearMenu();

	var className,
		style,
		element,
		option,
		i, j;

	for (i = 0, j = menu.options.length; i < j; i++) {
		option = menu.options[i];
		if (option.title === '-') {
			contextMenu.elements.push($({parent: contextMenu.element, className: 'optionSeparator1'}));
			contextMenu.elements.push($({parent: contextMenu.element, className: 'optionSeparator2'}));
		} else {
			className = 'option';
			if (option.selected === true) {
				className = 'selectedOption';
			} else if (option.selected === false) {
				className = 'deselectedOption';
			}
			element = $({
				parent: contextMenu.element,
				tag: 'a',
				text: option.title,
				className: className
			});
			element.onclick = clickOption;
			element.optionIndex = i;
		}
		contextMenu.elements.push(element);
	}

	$.style(contextMenu.overlay, {display: 'block'});

	style = {left: x + 'px', top: y + 'px', display: 'block'};
	if (menu.width) {
		style.width = menu.width + 'px';
	}
	$.style(contextMenu.element, style);
};

function hideMenu() {
	$.style(contextMenu.overlay, {display: 'none'});
	$.style(contextMenu.element, {display: 'none'});
};