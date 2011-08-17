jsio('from util.browser import $');
jsio('import .Widget');
jsio('import .TextArea');

var TextLimitArea = exports = Class(TextArea, function(supr){

	this.buildWidget = function(){
		supr(this,'buildWidget',arguments);
		this._limit = this._opts.limit || 140;
		this._limitLabel = $({
			text: this._limit,
			parent: this._el
		});

		this.initKeyEvents(this._textarea);
	}
	
	this.onKeyUp = function() {
		supr(this, 'onKeyUp', arguments);
		this.validate();
		var val = this._limitLabel.innerHTML;
		val = this._limit - this._textarea.value.length;
		this._limitLabel.innerHTML = '' + val;
		if(val<0){
			this._limitLabel.className += ' invalid';
		}else{
			this._limitLabel.className = this._limitLabel.className.replace(/\binvalid\b/g,'');
		}
	}

	this.validators = [
		{
			validator: function(){return this._textarea.value.length <= this._limit;}, 
			message: "over the char limit"
		},
		{
			validator: function(){return this._textarea.value != '';},
			message: "must enter a value"
		}
	]

	

});

Widget.register(TextLimitArea, 'TextLimitArea');