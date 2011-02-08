var gLang = null;

exports.setLang = function(lang) { gLang = lang; }
exports.get = function(key) {
	return gLang.get(key);
}
