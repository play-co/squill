var gLang = null;

exports.setLang = function(lang) { gLang = lang; }
exports.get = function(key) {
	return gLang && gLang.get(key);
}

exports.Language = Class(function() {
	this.init = function(dict) { this._dict = dict; }
	this.add = function(key, value) { this._dict[key] = value; }
	this.get = function(key) { return this._dict[key]; }
});
