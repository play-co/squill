exports.classes = {
	alpha: '.Alpha',
	label: '.Label',
	list: '.List',
	text: '.TextInput',
	textarea: '.TextArea',
	password: '.TextInput',
	scroller: '.Scroller',
	canvas: '.Canvas',
	slider: '.Slider',
	color: '.Color',
	vcenter: '.VerticalCenter',
	treelist: '.TreeList',
	graph: '.Graph',
	select: '.SelectBox',
};


exports.resolve = function(env, opts) {
	var imports = [];
	
	if (env == 'browser') {
		for (var key in exports.classes) {
			imports.push(exports.classes[key]);
		}
	}
	
	return imports;
}
