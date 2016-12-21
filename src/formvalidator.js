/****************************************************
 * FormTextField class								*
 * Applied to a given form element along with	    *
 * character requirements, checks if field value	*
 * matches requirements.							*
 *													*
 * Copyright 2014 Alex Schaeffer					*
 ****************************************************/
// Class constructor
function FormTextField(element, options, parent) {
	this.element = element;
	this.matches = options.matches || this.element;
	this.validator = parent;

	// Regex string for matching each type of character
	this.regex = {
		Length: /^[.]/g,
		Letters: /[^a-zA-Z]/g,
		UpperCase: /[^A-Z]/g,
		LowerCase: /[^a-z]/g,
		Nums: /[^0-9]/g,
		Symbols: /[^!@#:\$%\^\&*\)\(+=_-]/g
	};

	// Default field requirements
	this.reqs = {
		minLength: 0, // Minimum length of field, 0 for no minimum
		maxLength: -1, // Maximum length of field, -1 for no maximum
		minLetters: 0, // Minimum number of letters, 0 for no minimum
		maxLetters: -1, // Maximum number of letters, -1 for no maximum
		minUpperCase: 0, // Minimum number of uppercase letters, 0 for no minimum
		maxUpperCase: -1, // Maximum number of uppercase letters, -1 for no maximum
		minLowerCase: 0, // Minimum number of lowercase letters, 0 for no minimum
		maxLowerCase: -1, // Maximum number of lowercase letters, -1 for no maximum
		minNums: 0, // Minimum number of digits, 0 for no minimum
		maxNums: -1, // Maximum number of digits, -1 for no maximum
		minSymbols: 0, // Minimum number of special characters (!@#$%^&*)(+=._-:), 0 for no minimum
		maxSymbols: -1, // Maximum number of special characters, -1 for no maximum
		matches: this.matches.name // The name of the field that must be matched
	};

	// Default error messages for each type of validation error
	this.msgs = {
		minLength: "This field must contain at least {minLength} character{s-minLength}.",
		maxLength: "This field cannot contain more than {maxLength} character{s-maxLength}.",
		minLetters: "This field must contain at least {minLetters} letter{s-minLetters}.",
		maxLetters: "This field cannot contain more than {maxLetters} letter{s-maxLetters}.",
		minUpperCase: "This field must contain at least {minUpperCase} uppercase letter{s-minUpperCase}.",
		maxUpperCase: "This field cannot contain more than {maxUpperCase} uppercase letter{s-maxUpperCase}.",
		minLowerCase: "This field must contain at least {minLowerCase} lowercase letter{s-minLowerCase}.",
		maxLowerCase: "This field cannot contain more than {maxLowerCase} lowercase letter{s-maxLowerCase}.",
		minNums: "This field must contain at least {minNums} digit{s-minNums}.",
		maxNums: "This field cannot contain more than {maxNums} digit{s-maxNums}.",
		minSymbols: "This field must contain at least {minSymbols} of the following: !@#$%^&*)(+=._-:",
		maxSymbols: "This field cannot contain more than {maxSymbols} of the following: !@#$%^&*)(+=._-:",
		matches: "This field must match the {matches} field."
	};

	this.validator.log("Loaded form text field '"+this.element.name+"'");

	// Take in any custom options and apply them to the validator
	for (var key in options) {
		if (typeof (options[key]) == "number" && this.reqs[key] !== undefined && options[key] >= 0) this.reqs[key] = options[key];
		else if (typeof (options[key]) == "string" && key.indexOf("Msg") >= 0 && this.msgs[key.replace("Msg", "")] !== undefined) this.msgs[key.replace("Msg", "")] = options[key];
		else this.element[key] = options[key];
		this.validator.log(this.element.name+": Loaded option '"+key+"' ("+options[key]+")");
	}
}
// Return an object of the current validation settings
FormTextField.prototype.getSettings = function () {
	return {
		reqs: this.reqs,
		msgs: this.msgs
	};
};
// Parse an error message, inserting variable values
FormTextField.prototype.parseMsg = function (setting) {
	var that = this;
	var newStr = this.msgs[setting].replace(/\{([a-zA-Z\-]*)\}/g, function (str, key) {
		if (key in that.reqs) return that.reqs[key];
		if (key.indexOf("s-") === 0) return (that.reqs[key.substr(2)] > 1 ? "s" : "");
	});
	this.validator.log(this.element.name+": Parsed message '"+setting+"' as \""+newStr+"\"");
	return newStr;
};
// Check the field's contents against specified requirements and return if it passes
FormTextField.prototype.validate = function () {
	var val = this.element.value;
	this.element.setCustomValidity("");
	if (!this.element.checkValidity()) {
		this.validator.log(this.element.name+": HTML5 validation failed.");
		return false;
	}
	for (var key in this.regex) {
		var newVal = val.replace(this.regex[key], "");
		//console.log(key+': '+val+' - '+newVal+' ('+newVal.length+', '+this.reqs['min'+key]+', '+this.reqs['max'+key]+')');
		if (newVal.length < this.reqs['min' + key]) {
			this.validator.log(this.element.name+": "+key+" is too small (min "+this.reqs['min'+key]+")");
			this.element.setCustomValidity(this.parseMsg('min' + key));
			return false;
		}
		if (newVal.length > this.reqs['max' + key] && this.reqs['max' + key] > -1) {
			this.validator.log(this.element.name+": "+key+" is too large (max "+this.reqs['max'+key]+")");
			this.element.setCustomValidity(this.parseMsg('max' + key));
			return false;
		}
	}
	if (val != this.matches.value) {
		this.validator.log(this.element.name+": Value does not match required field '"+this.matches.name+"'");
		this.element.setCustomValidity(this.parseMsg('matches'));
		return false;
	}
	return true;
};



/****************************************************
 * FormRadioButton class							*
 * Applied to a given form radio button set along	*
 * with requirements, checks if field matches		*
 * requirements.									*
 *													*
 * Copyright 2014 Alex Schaeffer					*
 ****************************************************/
// Class constructor
function FormRadioButton(element, options, parent) {
	this.element = element;
	this.validator = parent;

	this.settings = {
		required: false,
		requiredMsg: "Please select an option"
	};

	this.validator.log("Loaded radio button set '"+this.element.item(0).name+"'");

	// Take in any custom options and apply them to the validator
	for (var key in options) {
		if (key in this.settings) this.settings[key] = options[key];
		else this.element[key] = options[key];
		this.validator.log(this.element.item(0).name+": Loaded option '"+key+"' ("+options[key]+")");
	}
}
// Set an error message for the radio button group
FormRadioButton.prototype.setValidity = function (msg) {
	for (var i = 0; i < this.element.length; i++) {
		this.element.item(i).setCustomValidity(msg);
	}
};
// Check if a button is selected, if required
FormRadioButton.prototype.validate = function () {
	this.setValidity("");
	if (!this.settings.required) return true;
	for (var i = 0; i < this.element.length; i++) {
		if (this.element.item(i).checked) return true;
	}
	this.validator.log(this.element.item(0).name+": Required button not selected.");
	this.setValidity(this.settings.requiredMsg);
	return false;
};



/*************************************************
 * FormCheckbox class							 *
 * Applied to a given form checkbox set along	 *
 * with requirements, checks if field matches	 *
 * requirements.								 *
 *												 *
 * Copyright 2014 Alex Schaeffer				 *
 *************************************************/
// Class constructor
function FormCheckbox(element, options, parent) {
	this.element = element;
	this.validator = parent;

	this.reqs = {
		required: false,
		minSelect: 0,
		maxSelect: -1
	};

	this.msgs = {
		required: "Please select this checkbox.",
		minSelect: "You must select at least {minSelect} option{s-minSelect}.",
		maxSelect: "You cannot select more than {maxSelect} option{s-maxSelect}."
	};

	this.validator.log("Loaded form checkbox set '"+this.element.item(0).name+"'");

	// Take in any custom options and apply them to the validator
	for (var key in options) {
		if (key in this.reqs) this.reqs[key] = options[key];
		else if (key.indexOf("Msg") >= 0 && this.msgs[key.replace("Msg", "")] !== undefined) this.msgs[key.replace("Msg", "")] = options[key];
		else this.element[key] = options[key];
		this.validator.log(this.element.item(0).name+": Loaded option '"+key+"' ("+options[key]+")");
	}
}
// Parse an error message, inserting variable values
FormCheckbox.prototype.parseMsg = function (setting) {
	var that = this;
	var newStr = this.msgs[setting].replace(/\{([a-zA-Z\-]*)\}/g, function (str, key) {
		if (key in that.reqs) return that.reqs[key];
		if (key.indexOf("s-") === 0) return (that.reqs[key.substr(2)] > 1 ? "s" : "");
	});
	this.validator.log(this.element.item(0).name+": Parsed message '"+setting+"' as \""+newStr+"\"");
	return newStr;
};
// Set an error message for all checkboxes in the group
FormCheckbox.prototype.setValidity = function (msg) {
	for (var i = 0; i < this.element.length; i++) {
		this.element.item(i).setCustomValidity(msg);
	}
};
// Check that number of selected items is in range, and if any required boxes are checked
FormCheckbox.prototype.validate = function () {
	this.setValidity("");
	var numChecked = 0;
	for (var i = 0; i < this.element.length; i++) {
		var box = this.element.item(i);
		if (box.checked) {
			numChecked++;
		} else {
			if (typeof (this.reqs.required) == "string" && this.reqs.required == box.id) {
				this.validator.log(this.element.item(0).name+": Required checkbox '"+this.reqs.required+"' not selected");
				box.setCustomValidity(this.parseMsg('required'));
				return false;
			} else if (typeof (this.reqs.required) == "object") {
				for (var j = 0; j < this.reqs.required.length; j++) {
					if (this.reqs.required[j] == box.id) {
						this.validator.item(0).log(this.element.name+": Required checkbox '"+this.reqs.required[j]+"' not selected");
						box.setCustomValidity(this.parseMsg('required'));
						return false;
					}
				}
			}
		}
	}
	if (numChecked < this.reqs.minSelect) {
		this.validator.log(this.element.item(0).name+": Number of checked boxes is too small (min "+this.reqs['minSelect']+")");
		this.setValidity(this.parseMsg('minSelect'));
		return false;
	}
	if (this.reqs.maxSelect >= 0 && numChecked > this.reqs.maxSelect) {
		this.validator.log(this.element.item(0).name+": Number of checked boxes is too large (max "+this.reqs['maxSelect']+")");
		this.setValidity(this.parseMsg('maxSelect'));
		return false;
	}
	return true;
};




/************************************************
 * FormSelect class								*
 * Applied to a given form dropdown list along	*
 * with requirements, checks if field matches	*
 * requirements.								*
 *												*
 * Copyright 2014 Alex Schaeffer				*
 ************************************************/
// Class constructor
function FormSelect(element, options, parent) {
	this.element = element;
	this.matches = options.matches || this.element;
	this.validator = parent;

	this.reqs = {
		minVal: 0,
		maxVal: -1
	};

	this.msgs = {
		minVal: "The selected value is too low.",
		maxVal: "The selected value is too high."
	};

	// Take in any custom options and apply them to the validator
	for (var key in options) {
		if (key in this.reqs) this.reqs[key] = options[key];
		else if (key.indexOf("Msg") >= 0 && this.msgs[key.replace("Msg", "")] !== undefined) this.msgs[key.replace("Msg", "")] = options[key];
		else this.element[key] = options[key];
	}

	/*for (var i=1; i<this.element.length; i++) {
		this.element.item(i).id = i+'-'+this.element.name+'-'+this.element.item(i).value;
	}*/
}
// Parse an error message, inserting variable values
FormSelect.prototype.parseMsg = function (setting) {
	var that = this;
	var newStr = this.msgs[setting].replace(/\{([a-zA-Z\-]*)\}/g, function (str, key) {
		if (key in that.reqs) return that.reqs[key];
		if (key.indexOf("s-") === 0) return (that.reqs[key.substr(2)] > 1 ? "s" : "");
	});
	this.validator.log(this.element.name+": Parsed message '"+setting+"' as \""+newStr+"\"");
	return newStr;
};
// Check that an item is selected if required, and if it is within range
FormSelect.prototype.validate = function () {
	this.element.setCustomValidity("");
	if (this.element.required && this.element.value === "") {
		this.element.setCustomValidity("Please select an item in the list.");
		return false;
	}
	if (this.element.value < this.reqs.minVal) {
		this.element.setCustomValidity(this.parseMsg('minVal'));
		return false;
	}
	if (this.reqs.maxVal >= 0 && this.element.value > this.reqs.maxVal) {
		this.element.setCustomValidity(this.parseMsg('maxVal'));
		return false;
	}
	return true;
};



/****************************************************
 * FormValidator class								*
 * Applied to an HTML form with options passed		*
 * for each form element. Checks each element for	*
 * the given requirements.							*
 *													*
 * Copyright 2014 Alex Schaeffer					*
 ****************************************************/
// Class constructor
function FormValidator(element, options) {
	const DEBUG=0,ALPHA=1,BETA=2,PUBLISH=3;

	this.element = element;
	this.state = DEBUG;

	// Generate list of fields to add to the validator
	this.items = [];
	for (var key in options) {
		if (!this.element[key]) {
			console.log("Unknown type: " + key);
		} else if (this.element[key].type == "text" || this.element[key].type == "email" || this.element[key].type == "url" || this.element[key].type == "password" || this.element[key].type == "textarea") {
			this.items.push(new FormTextField(this.element[key], options[key], this));
		} else if (this.element[key].item(0).type == "radio") {
			this.items.push(new FormRadioButton(this.element[key], options[key], this));
		} else if (this.element[key].item(0).type == "checkbox") {
			this.items.push(new FormCheckbox(this.element[key], options[key], this));
		} else if (this.element[key].type == "select-one") {
			this.items.push(new FormSelect(this.element[key], options[key], this));
		} else {
			console.log("Unknown error for " + key);
		}
	}
}
// Log a message to the console
FormValidator.prototype.log = function(msg,level) {
	level = level || 0;
	if (this.state <= level) console.log(msg);
};
// Iterates through field list and validates each one
FormValidator.prototype.validate = function () {
	for (var item in this.items) {
		if (!this.items[item].validate()) return false;
	}
	return true;
};
// Returns an array of fields currently in the validator
FormValidator.prototype.getItems = function () {
	items = [];
	for (var item in this.items)
	items.push(this.items[item].element);
	return items;
};