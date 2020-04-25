module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1587806679707, function(require, module, exports) {
module.exports = {
	Class: require('./Class'),
	bind: require('./bind'),
	curry: require('./curry'),
	throttle: require('./throttle'),
	delay: require('./delay'),
	invoke: require('./invoke'),
	isArray: require('./isArray'),
	each: require('./each'),
	map: require('./map'),
	pick: require('./filter'), // deprecated in favor of filter
	filter: require('./filter'),
	flatten: require('./flatten'),
	extend: require('./extend'),
	slice: require('./slice'),
	pack: require('./pack'),
	unpack: require('./unpack'),
	crc32: require('./crc32'),
	strip: require('./strip')
}

}, function(modId) {var map = {"./Class":1587806679708,"./bind":1587806679709,"./curry":1587806679711,"./throttle":1587806679712,"./delay":1587806679713,"./invoke":1587806679714,"./isArray":1587806679715,"./each":1587806679716,"./map":1587806679718,"./filter":1587806679719,"./flatten":1587806679720,"./extend":1587806679721,"./slice":1587806679710,"./pack":1587806679723,"./unpack":1587806679724,"./crc32":1587806679725,"./strip":1587806679727}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679708, function(require, module, exports) {
/* Example usage:

	var UIComponent = Class(function() {
		this.init = function() { ... }
		this.create = function() { ... this.createDOM() ... }
	})

	var PublisherMixin = {
		init: function(){ ... },
		publish_: function() { ... }
	}
  
	var Button = Class(UIComponent, PublisherMixin, function(supr) {
		this.init = function(opts) {
			// call UIComponents init method, with the passed in arguments
			supr(this, 'init', arguments) // or, UIComponent.constructor.prototype.init.apply(this, arguments)
			this.color_ = opts && opts.color
		}

		// createDOM overwrites abstract method from parent class UIComponent
		this.createDOM = function() {
			this.getElement().onclick = bind(this, function(e) {
				// this.publish_ is a method added to Button by the Publisher mixin
				this.publish_('Click', e)
			})
		}
	})

*/
module.exports = function Class(/* optParent, optMixin1, optMixin2, ..., proto */) {
	var args = arguments,
		numOptArgs = args.length - 1,
		mixins = []

	// the prototype function is always the last argument
	var proto = args[numOptArgs]

	// if there's more than one argument, then the first argument is the parent class
	if (numOptArgs) {
		var parent = args[0]
		if (parent) { proto.prototype = parent.prototype }
	}

	for (var i=1; i < numOptArgs; i++) { mixins.push(arguments[i]) }

	// cls is the actual class function. Classes may implement this.init = function(){ ... },
	// which gets called upon instantiation
	var cls = function() {
		if(this.init) { this.init.apply(this, arguments) }
		for (var i=0, mixin; mixin = mixins[i]; i++) {
			if (mixin.init) { mixin.init.apply(this) }
		}
	}

	// the proto function gets called with the supr function as an argument. supr climbs the
	// inheritence chain, looking for the named method
	cls.prototype = new proto(function supr(context, method, args) {
		var target = parent
		while(target = target.prototype) {
			if(target[method]) {
				return target[method].apply(context, args || [])
			}
		}
		throw new Error('supr: parent method ' + method + ' does not exist')
	})

	// add all mixins' properties to the class' prototype object
	for (var i=0, mixin; mixin = mixins[i]; i++) {
		for (var propertyName in mixin) {
			if (!mixin.hasOwnProperty(propertyName) || propertyName == 'init') { continue }
			if (cls.prototype.hasOwnProperty(propertyName)) {
				throw new Error('Mixin property "'+propertyName+'" already exists on class')
			}
			cls.prototype[propertyName] = mixin[propertyName]
		}
	}

	cls.prototype.constructor = cls
	return cls
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679709, function(require, module, exports) {
/*
	Example usage:

	function Client() {
		this._socket = new Connection()
		this._socket.open()
		this._socket.on('connected', bind(this, '_log', 'connected!'))
		this._socket.on('connected', bind(this, 'disconnect'))
	}

	Client.prototype._log = function(message) {
		console.log('client says:', message)
	}

	Client.prototype.disconnect = function() {
		this._socket.disconnect()
	}

	Example usage:

	var Toolbar = Class(function() {
		
		this.init = function() {
			this._buttonWasClicked = false
		}
		
		this.addButton = function(clickHandler) {
			this._button = new Button()
			this._button.on('Click', bind(this, '_onButtonClick', clickHandler))
		}

		this._onButtonClick = function(clickHandler) {
			this._buttonWasClicked = true
			clickHandler()
		}

	})

*/
var slice = require('./slice')

module.exports = function bind(context, method /* curry1, curry2, ... curryN */) {
	if (typeof method == 'string') { method = context[method] }
	var curryArgs = slice(arguments, 2)
	return function bound() {
		var invocationArgs = slice(arguments)
		return method.apply(context, curryArgs.concat(invocationArgs))
	}
}


}, function(modId) { var map = {"./slice":1587806679710}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679710, function(require, module, exports) {
/*
	Example usage:

	function log(category, arg1, arg2) { // arg3, arg4, ..., argN
		console.log('log category', category, std.slice(arguments, 1))
	}
*/
module.exports = function args(args, offset, length) {
	if (typeof length == 'undefined') { length = args.length }
	return Array.prototype.slice.call(args, offset || 0, length)
}


}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679711, function(require, module, exports) {
var slice = require('./slice')

module.exports = function curry(fn /* arg1, arg2, ... argN */) {
	var curryArgs = slice(arguments, 1)
	return function curried() {
		var invocationArgs = slice(arguments)
		return fn.apply(this, curryArgs.concat(invocationArgs))
	}
}


}, function(modId) { var map = {"./slice":1587806679710}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679712, function(require, module, exports) {
var unique = 0
module.exports = function throttle(fn, delay) {
	if (typeof delay != 'number') { delay = 50 }
	var timeoutName = '__throttleTimeout__' + (++unique)
	return function throttled() {
		if (this[timeoutName]) { return }
		var args = arguments, self = this
		this[timeoutName] = setTimeout(function fireDelayed() {
			delete self[timeoutName]
			fn.apply(self, args)
		}, delay)
		fn.apply(self, args)
	}
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679713, function(require, module, exports) {
/*
	Delay the execution of a function.
	If the function gets called multiple times during a delay, the delayed function gets invoced only once,
	with the arguments of the most recent invocation. This is useful for expensive functions that should
	not be called multiple times during a short time interval, e.g. rendering
	
	Example usage:

	Class(UIComponent, function() {
		this.render = delay(function() {
			...
		}, 250) // render at most 4 times per second
	})

	// Bath messages into a single email
	var EmailBatcher = Class(function() {
		this.init = function() {
			this._queue = []
		}

		this.send = function(email) {
			this._queue.push(email)
			this._scheduleDispatch()
		}

		this._scheduleDispatch = delay(function() {
			smtp.send(this._queue.join('\n\n'))
			this._queue = []
		}, 5000) // send emails at most once every 5 seconds
	})
*/
module.exports = function delay(fn, delayBy) {
	if (typeof delayBy != 'number') { delayBy = 50 }
	var timeoutName = '__delayTimeout__' + (++module.exports._unique)
	var delayedFunction = function delayed() {
		if (this[timeoutName]) {
			clearTimeout(this[timeoutName])
		}
		var args = arguments, self = this
		this[timeoutName] = setTimeout(function fireDelayed() {
			clearTimeout(self[timeoutName])
			delete self[timeoutName]
			fn.apply(self, args)
		}, delayBy)
	}
	delayedFunction.cancel = function() {
	  clearTimeout(this[timeoutName])
	}
	return delayedFunction
}
module.exports._unique = 0

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679714, function(require, module, exports) {
/*
	Example usage:

	var obj = {
		setTime: function(ts) { this._time = ts }
	}
	each([obj], call('setTime', 1000))
*/

var slice = require('./slice')
module.exports = function call(methodName /*, curry1, ..., curryN */) {
	var curryArgs = slice(arguments, 1)
	return function futureCall(obj) {
		var fn = obj[methodName],
			args = curryArgs.concat(slice(arguments, 1))
		return fn.apply(obj, args)
	}
}


}, function(modId) { var map = {"./slice":1587806679710}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679715, function(require, module, exports) {
module.exports = (function() {
	if (Array.isArray && Array.isArray.toString().match('\\[native code\\]')) {
		return function(obj) {
			return Array.isArray(obj)
		}
	} else {
		// thanks @kangax http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
		return function(obj) {
			return Object.prototype.toString.call(obj) == '[object Array]'
		}
	}
})();

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679716, function(require, module, exports) {
var isArray = require('./isArray'),
	isArguments = require('./isArguments')

module.exports = function(items, ctx, fn) {
	if (!items) { return }
	if (!fn) {
		fn = ctx
		ctx = this
	}
	if (isArray(items) || isArguments(items)) {
		for (var i=0; i < items.length; i++) {
			fn.call(ctx, items[i], i)
		}
	} else {
		for (var key in items) {
			if (!items.hasOwnProperty(key)) { continue }
			fn.call(ctx, items[key], key)
		}
	}
}

}, function(modId) { var map = {"./isArray":1587806679715,"./isArguments":1587806679717}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679717, function(require, module, exports) {
module.exports = function isArguments(obj) {
  return Object.prototype.toString.call(obj) == '[object Arguments]'
}
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679718, function(require, module, exports) {
var each = require('./each')

module.exports = function(items, ctx, fn) {
	var result = []
	if (!fn) {
		fn = ctx
		ctx = this
	}
	each(items, ctx, function(item, key) {
		result.push(fn.call(ctx, item, key))
	})
	return result
}

}, function(modId) { var map = {"./each":1587806679716}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679719, function(require, module, exports) {
/*
	Example usage:
	filter([1,2,0,'',false,null,undefined]) // -> [1,2,0,'',false]
	filter([1,2,3], this, function(val, index) { val == 1 }) // -> [1]
*/
var each = require('./each')
var isArray = require('./isArray')

module.exports = function filter(arr, ctx, fn) {
	if (arguments.length == 2) {
		fn = ctx
		ctx = this
	}
	if (!fn) {
		fn = falseOrTruthy
	}
	
	var result
	if (isArray(arr)) {
		result = []
		each(arr, function(value, index) {
			if (!fn.call(ctx, value, index)) { return }
			result.push(value)
		})
	} else {
		result = {}
		each(arr, function(value, key) {
			if (!fn.call(ctx, value, key)) { return }
			result[key] = value
		})
	}
	return result
}

function falseOrTruthy(arg) {
	return !!arg || arg === false
}


}, function(modId) { var map = {"./each":1587806679716,"./isArray":1587806679715}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679720, function(require, module, exports) {
module.exports = function flatten(arr) {
	return Array.prototype.concat.apply([], arr)
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679721, function(require, module, exports) {
/*
	Example usage:

	var A = Class(function() {
		
		var defaults = {
			foo: 'cat',
			bar: 'dum'
		}

		this.init = function(opts) {
			opts = std.extend(opts, defaults)
			this._foo = opts.foo
			this._bar = opts.bar
		}

		this.getFoo = function() {
			return this._foo
		}

		this.getBar = function() {
			return this._bar
		}
	})

	var a = new A({ bar:'sim' })
	a.getFoo() == 'cat'
	a.getBar() == 'sim'
*/

var copy = require('./copy')

module.exports = function extend(target, extendWith) {
	target = copy(target)
	for (var key in extendWith) {
		if (typeof target[key] != 'undefined') { continue }
		target[key] = extendWith[key]
	}
	return target
}

}, function(modId) { var map = {"./copy":1587806679722}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679722, function(require, module, exports) {
var each = require('./each'),
	isArray = require('./isArray')

module.exports = function copy(obj, deep) {
	var result = isArray(obj) ? [] : {}
	each(obj, function(val, key) {
		result[key] = (deep && typeof val == 'object') ? copy(val, deep) : val
	})
	return result
}

}, function(modId) { var map = {"./each":1587806679716,"./isArray":1587806679715}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679723, function(require, module, exports) {
// https://github.com/kvz/phpjs/raw/2ae4292a8629d6007eae26298bd19339ef97957e/functions/misc/pack.js
// MIT License http://phpjs.org/pages/license

module.exports = function pack (format) {
    // http://kevin.vanzonneveld.net
    // +   original by: Tim de Koning (http://www.kingsquare.nl)
    // +      parts by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   bugfixed by: Tim de Koning (http://www.kingsquare.nl)
    // %        note 1: Float encoding by: Jonas Raoni Soares Silva
    // %        note 2: Home: http://www.kingsquare.nl/blog/12-12-2009/13507444
    // %        note 3: Feedback: phpjs-pack@kingsquare.nl
    // %        note 4: 'machine dependent byte order and size' aren't
    // %        note 4: applicable for JavaScript; pack works as on a 32bit,
    // %        note 4: little endian machine
    // *     example 1: pack('nvc*', 0x1234, 0x5678, 65, 66);
    // *     returns 1: '4xVAB'
    var formatPointer = 0,
        argumentPointer = 1,
        result = '',
        argument = '',
        i = 0,
        r = [],
        instruction, quantifier, word, precisionBits, exponentBits, extraNullCount;

    // vars used by float encoding
    var bias, minExp, maxExp, minUnnormExp, status, exp, len, bin, signal, n, intPart, floatPart, lastBit, rounded, j, k, tmpResult;

    while (formatPointer < format.length) {
        instruction = format[formatPointer];
        quantifier = '';
        formatPointer++;
        while ((formatPointer < format.length) && (format[formatPointer].match(/[\d\*]/) !== null)) {
            quantifier += format[formatPointer];
            formatPointer++;
        }
        if (quantifier === '') {
            quantifier = '1';
        }

        // Now pack variables: 'quantifier' times 'instruction'
        switch (instruction) {
        case 'a':
            // NUL-padded string
        case 'A':
            // SPACE-padded string
            if (typeof arguments[argumentPointer] === 'undefined') {
                throw new Error('Warning:  pack() Type ' + instruction + ': not enough arguments');
            } else {
                argument = String(arguments[argumentPointer]);
            }
            if (quantifier === '*') {
                quantifier = argument.length;
            }
            for (i = 0; i < quantifier; i++) {
                if (typeof argument[i] === 'undefined') {
                    if (instruction === 'a') {
                        result += String.fromCharCode(0);
                    } else {
                        result += ' ';
                    }
                } else {
                    result += argument[i];
                }
            }
            argumentPointer++;
            break;
        case 'h':
            // Hex string, low nibble first
        case 'H':
            // Hex string, high nibble first
            if (typeof arguments[argumentPointer] === 'undefined') {
                throw new Error('Warning: pack() Type ' + instruction + ': not enough arguments');
            } else {
                argument = arguments[argumentPointer];
            }
            if (quantifier === '*') {
                quantifier = argument.length;
            }
            if (quantifier > argument.length) {
                throw new Error('Warning: pack() Type ' + instruction + ': not enough characters in string');
            }
            for (i = 0; i < quantifier; i += 2) {
                // Always get per 2 bytes...
                word = argument[i];
                if (((i + 1) >= quantifier) || typeof(argument[i + 1]) === 'undefined') {
                    word += '0';
                } else {
                    word += argument[i + 1];
                }
                // The fastest way to reverse?
                if (instruction === 'h') {
                    word = word[1] + word[0];
                }
                result += String.fromCharCode(parseInt(word, 16));
            }
            argumentPointer++;
            break;

        case 'c':
            // signed char
        case 'C':
            // unsigned char
            // c and C is the same in pack
            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
            }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning:  pack() Type ' + instruction + ': too few arguments');
            }

            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(arguments[argumentPointer]);
                argumentPointer++;
            }
            break;

        case 's':
            // signed short (always 16 bit, machine byte order)
        case 'S':
            // unsigned short (always 16 bit, machine byte order)
        case 'v':
            // s and S is the same in pack
            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
            }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning:  pack() Type ' + instruction + ': too few arguments');
            }

            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(arguments[argumentPointer] & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 8 & 0xFF);
                argumentPointer++;
            }
            break;

        case 'n':
            // unsigned short (always 16 bit, big endian byte order)
            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
            }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning:  pack() Type ' + instruction + ': too few arguments');
            }

            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(arguments[argumentPointer] >> 8 & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] & 0xFF);
                argumentPointer++;
            }
            break;

        case 'i':
            // signed integer (machine dependent size and byte order)
        case 'I':
            // unsigned integer (machine dependent size and byte order)
        case 'l':
            // signed long (always 32 bit, machine byte order)
        case 'L':
            // unsigned long (always 32 bit, machine byte order)
        case 'V':
            // unsigned long (always 32 bit, little endian byte order)
            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
            }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning:  pack() Type ' + instruction + ': too few arguments');
            }

            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(arguments[argumentPointer] & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 8 & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 16 & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 24 & 0xFF);
                argumentPointer++;
            }

            break;
        case 'N':
            // unsigned long (always 32 bit, big endian byte order)
            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
            }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning:  pack() Type ' + instruction + ': too few arguments');
            }

            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(arguments[argumentPointer] >> 24 & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 16 & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] >> 8 & 0xFF);
                result += String.fromCharCode(arguments[argumentPointer] & 0xFF);
                argumentPointer++;
            }
            break;

        case 'f':
            // float (machine dependent size and representation)
        case 'd':
            // double (machine dependent size and representation)
            // version based on IEEE754
            precisionBits = 23;
            exponentBits = 8;
            if (instruction === 'd') {
                precisionBits = 52;
                exponentBits = 11;
            }

            if (quantifier === '*') {
                quantifier = arguments.length - argumentPointer;
            }
            if (quantifier > (arguments.length - argumentPointer)) {
                throw new Error('Warning:  pack() Type ' + instruction + ': too few arguments');
            }
            for (i = 0; i < quantifier; i++) {
                argument = arguments[argumentPointer];
                bias = Math.pow(2, exponentBits - 1) - 1;
                minExp = -bias + 1;
                maxExp = bias;
                minUnnormExp = minExp - precisionBits;
                status = isNaN(n = parseFloat(argument)) || n === -Infinity || n === +Infinity ? n : 0;
                exp = 0;
                len = 2 * bias + 1 + precisionBits + 3;
                bin = new Array(len);
                signal = (n = status !== 0 ? 0 : n) < 0;
                n = Math.abs(n);
                intPart = Math.floor(n);
                floatPart = n - intPart;

                for (k = len; k;) {
                    bin[--k] = 0;
                }
                for (k = bias + 2; intPart && k;) {
                    bin[--k] = intPart % 2;
                    intPart = Math.floor(intPart / 2);
                }
                for (k = bias + 1; floatPart > 0 && k; --floatPart) {
                    (bin[++k] = ((floatPart *= 2) >= 1) - 0);
                }
                for (k = -1; ++k < len && !bin[k];) {}

                if (bin[(lastBit = precisionBits - 1 + (k = (exp = bias + 1 - k) >= minExp && exp <= maxExp ? k + 1 : bias + 1 - (exp = minExp - 1))) + 1]) {
                    if (!(rounded = bin[lastBit])) {
                        for (j = lastBit + 2; !rounded && j < len; rounded = bin[j++]) {}
                    }
                    for (j = lastBit + 1; rounded && --j >= 0;
                    (bin[j] = !bin[j] - 0) && (rounded = 0)) {}
                }

                for (k = k - 2 < 0 ? -1 : k - 3; ++k < len && !bin[k];) {}

                if ((exp = bias + 1 - k) >= minExp && exp <= maxExp) {
                    ++k;
                } else {
                    if (exp < minExp) {
                        if (exp !== bias + 1 - len && exp < minUnnormExp) { /*"encodeFloat::float underflow" */
                        }
                        k = bias + 1 - (exp = minExp - 1);
                    }
                }

                if (intPart || status !== 0) {
                    exp = maxExp + 1;
                    k = bias + 2;
                    if (status === -Infinity) {
                        signal = 1;
                    } else if (isNaN(status)) {
                        bin[k] = 1;
                    }
                }

                n = Math.abs(exp + bias);
                tmpResult = '';

                for (j = exponentBits + 1; --j;) {
                    tmpResult = (n % 2) + tmpResult;
                    n = n >>= 1;
                }

                n = 0;
                j = 0;
                k = (tmpResult = (signal ? '1' : '0') + tmpResult + bin.slice(k, k + precisionBits).join('')).length;
                r = [];

                for (; k;) {
                    n += (1 << j) * tmpResult.charAt(--k);
                    if (j === 7) {
                        r[r.length] = String.fromCharCode(n);
                        n = 0;
                    }
                    j = (j + 1) % 8;
                }

                r[r.length] = n ? String.fromCharCode(n) : '';
                result += r.join('');
                argumentPointer++;
            }
            break;

        case 'x':
            // NUL byte
            if (quantifier === '*') {
                throw new Error('Warning: pack(): Type x: \'*\' ignored');
            }
            for (i = 0; i < quantifier; i++) {
                result += String.fromCharCode(0);
            }
            break;

        case 'X':
            // Back up one byte
            if (quantifier === '*') {
                throw new Error('Warning: pack(): Type X: \'*\' ignored');
            }
            for (i = 0; i < quantifier; i++) {
                if (result.length === 0) {
                    throw new Error('Warning: pack(): Type X:' + ' outside of string');
                } else {
                    result = result.substring(0, result.length - 1);
                }
            }
            break;

        case '@':
            // NUL-fill to absolute position
            if (quantifier === '*') {
                throw new Error('Warning: pack(): Type X: \'*\' ignored');
            }
            if (quantifier > result.length) {
                extraNullCount = quantifier - result.length;
                for (i = 0; i < extraNullCount; i++) {
                    result += String.fromCharCode(0);
                }
            }
            if (quantifier < result.length) {
                result = result.substring(0, quantifier);
            }
            break;

        default:
            throw new Error('Warning:  pack() Type ' + instruction + ': unknown format code');
        }
    }
    if (argumentPointer < arguments.length) {
        throw new Error('Warning: pack(): ' + (arguments.length - argumentPointer) + ' arguments unused');
    }

    return result;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679724, function(require, module, exports) {
// https://github.com/marcuswestin/phpjs/raw/master/_workbench/misc/unpack.js
// Original repo https://github.com/kvz/phpjs/blob/master/_workbench/misc/unpack.js
// MIT license

module.exports = function unpack(format, data) {
    // http://kevin.vanzonneveld.net
    // +   original by: Tim de Koning (http://www.kingsquare.nl)
    // +      parts by: Jonas Raoni Soares Silva
    // +      http://www.jsfromhell.com
    // %        note 1: Float decoding by: Jonas Raoni Soares Silva
    // %        note 2: Home: http://www.kingsquare.nl/blog/22-12-2009/13650536
    // %        note 3: Feedback: phpjs-unpack@kingsquare.nl
    // %        note 4: 'machine dependant byte order and size' aren't
    // %        note 5: applicable for JavaScript unpack works as on a 32bit,
    // %        note 6: little endian machine
    // *     example 1: unpack('f2test', 'abcddbca');
    // *     returns 1: { 'test1': 1.6777999408082E+22.
    // *     returns 2: 'test2': 2.6100787562286E+20 }

    var formatPointer = 0, dataPointer = 0, result = {}, instruction = '',
            quantifier = '', label = '', currentData = '', i = 0, j = 0,
            word = '', precisionBits = 0, exponentBits = 0, dataByteLength = 0;

    // Used by float decoding
    var b = [], bias,  signal, exponent, significand, divisor, curByte,
            byteValue, startBit = 0, mask, currentResult;

    var readBits = function(start, length, byteArray){
        var offsetLeft, offsetRight, curByte, lastByte, diff, sum;

        function shl(a, b){
            for(++b; --b;) {
                a = ((a %= 0x7fffffff + 1) & 0x40000000) === 0x40000000 ?
                    a * 2 :
                    (a - 0x40000000) * 2 + 0x7fffffff + 1;
            }
            return a;
        }
        if(start < 0 || length <= 0) {
            return 0;
        }

        offsetRight = start % 8;
        curByte = byteArray.length - (start >> 3) - 1;
        lastByte = byteArray.length + (-(start + length) >> 3);
        diff = curByte - lastByte;
        sum = (
                (byteArray[ curByte ] >> offsetRight) &
                ((1 << (diff ? 8 - offsetRight : length)) - 1)
            ) + (
               diff && (offsetLeft = (start + length) % 8) ?
                (byteArray[ lastByte++ ] & ((1 << offsetLeft) - 1)) <<
                (diff-- << 3) - offsetRight :
                0
            );

        for(; diff;) {
            sum += shl(byteArray[ lastByte++ ], (diff-- << 3) - offsetRight);
        }
        return sum;
    };

    while (formatPointer < format.length) {
        instruction = format[formatPointer];

        // Start reading 'quantifier'
        quantifier = '';
        formatPointer++;
        while ((formatPointer < format.length) &&
              (format[formatPointer].match(/[\d\*]/) !== null)) {
            quantifier += format[formatPointer];
            formatPointer++;
        }
        if (quantifier === '') {
            quantifier = '1';
        }


        // Start reading label
        label = '';
        while ((formatPointer < format.length) &&
              (format[formatPointer] !== '/')) {
            label += format[formatPointer];
            formatPointer++;
        }
        if (format[formatPointer] === '/') {
            formatPointer++;
        }

        // Process given instruction
        switch (instruction) {
            case 'a': // NUL-padded string
            case 'A': // SPACE-padded string
                if (quantifier === '*') {
                    quantifier = data.length - dataPointer;
                } else {
                    quantifier = parseInt(quantifier, 10);
                }
                currentData = data.substr(dataPointer, quantifier);
                dataPointer += quantifier;

                if (instruction === 'a') {
                    currentResult = currentData.replace(/\0+$/, '');
                } else {
                    currentResult = currentData.replace(/ +$/, '');
                }
                result[label] = currentResult;
                break;

            case 'h': // Hex string, low nibble first
            case 'H': // Hex string, high nibble first
                if (quantifier === '*') {
                    quantifier = data.length - dataPointer;
                } else {
                    quantifier = parseInt(quantifier, 10);
                }
                currentData = data.substr(dataPointer, quantifier);
                dataPointer += quantifier;

                if (quantifier>currentData.length) {
                    throw new Error('Warning: unpack(): Type ' + instruction +
                            ': not enough input, need '  + quantifier);
                }

                currentResult = '';
                for(i=0;i<currentData.length;i++) {
                    word = currentData.charCodeAt(i).toString(16);
                    if (instruction === 'h') {
                        word = word[1]+word[0];
                    }
                   currentResult += word;
                }
                result[label] = currentResult;
                break;

            case 'c': // signed char
            case 'C': // unsigned c
                if (quantifier === '*') {
                    quantifier = data.length - dataPointer;
                } else {
                    quantifier = parseInt(quantifier, 10);
                }

                currentData = data.substr(dataPointer, quantifier);
                dataPointer += quantifier;

                for (i=0;i<currentData.length;i++) {
                     currentResult = currentData.charCodeAt(i);
                     if ((instruction === 'c') && (currentResult >= 128)) {
                        currentResult -= 256;
                     }
                     result[label+(quantifier>1?
                            (i+1):
                            '')] = currentResult;
                }
                break;

            case 'S': // unsigned short (always 16 bit, machine byte order)
            case 's': // signed short (always 16 bit, machine byte order)
            case 'v': // unsigned short (always 16 bit, little endian byte order)
                if (quantifier === '*') {
                    quantifier = (data.length - dataPointer) / 2;
                } else {
                    quantifier = parseInt(quantifier, 10);
                }

                currentData = data.substr(dataPointer, quantifier * 2);
                dataPointer += quantifier * 2;

                for (i=0;i<currentData.length;i+=2) {
                     // sum per word;
                    currentResult = (currentData.charCodeAt(i+1) & 0xFF) << 8 +
                            (currentData.charCodeAt(i) & 0xFF);
                    if ((instruction === 's') && (currentResult >= 32768)) {
                        currentResult -= 65536;
                    }
                    result[label+(quantifier>1?
                            ((i/2)+1):
                            '')] = currentResult;
                }
                break;

            case 'n': // unsigned short (always 16 bit, big endian byte order)
                if (quantifier === '*') {
                    quantifier = (data.length - dataPointer) / 2;
                } else {
                    quantifier = parseInt(quantifier, 10);
                }

                currentData = data.substr(dataPointer, quantifier * 2);
                dataPointer += quantifier * 2;

                for (i=0;i<currentData.length;i+=2) {
                     // sum per word;
                    currentResult = ((currentData.charCodeAt(i) & 0xFF) << 8) +
                            (currentData.charCodeAt(i+1) & 0xFF);
                    result[label+(quantifier>1?
                            ((i/2)+1):
                            '')] = currentResult;
                }
                break;

            case 'i': // signed integer (machine dependent size and byte order)
            case 'I': // unsigned integer (machine dependent size & byte order)
            case 'l': // signed long (always 32 bit, machine byte order)
            case 'L': // unsigned long (always 32 bit, machine byte order)
            case 'V': // unsigned long (always 32 bit, little endian byte order)
                if (quantifier === '*') {
                    quantifier = (data.length - dataPointer) / 4;
                } else {
                    quantifier = parseInt(quantifier, 10);
                }

                currentData = data.substr(dataPointer, quantifier * 4);
                dataPointer += quantifier * 4;

                for (i=0;i<currentData.length;i+=4) {
                    currentResult =
                            ((currentData.charCodeAt(i+3) & 0xFF) << 24) +
                            ((currentData.charCodeAt(i+2) & 0xFF) << 16) +
                            ((currentData.charCodeAt(i+1) & 0xFF) << 8) +
                            ((currentData.charCodeAt(i) & 0xFF));
                    result[label+(quantifier>1?
                            ((i/4)+1):
                            '')] = currentResult;
                }

                break;

            case 'N': // unsigned long (always 32 bit, little endian byte order)
               if (quantifier === '*') {
                    quantifier = (data.length - dataPointer) / 4;
                } else {
                    quantifier = parseInt(quantifier, 10);
                }

                currentData = data.substr(dataPointer, quantifier * 4);
                dataPointer += quantifier * 4;

                for (i=0;i<currentData.length;i+=4) {
                    currentResult =
                            ((currentData.charCodeAt(i) & 0xFF) << 24) +
                            ((currentData.charCodeAt(i+1) & 0xFF) << 16) +
                            ((currentData.charCodeAt(i+2) & 0xFF) << 8) +
                            ((currentData.charCodeAt(i+3) & 0xFF));
                    result[label+(quantifier>1?
                            ((i/4)+1):
                            '')] = currentResult;
                }

                break;

            case 'f':
            case 'd':
                exponentBits = 8;
                dataByteLength = 4;
                if (instruction === 'd') {
                    exponentBits = 11;
                    dataByteLength = 8;
                }

               if (quantifier === '*') {
                    quantifier = (data.length - dataPointer) / dataByteLength;
                } else {
                    quantifier = parseInt(quantifier, 10);
                }

                currentData = data.substr(dataPointer,
                        quantifier * dataByteLength);
                dataPointer += quantifier * dataByteLength;

                for (i=0;i<currentData.length;i+=dataByteLength) {
                    data = currentData.substr(i, dataByteLength);

                    b = [];
                    for(j = data.length-1; j >= 0  ; --j) {
                        b.push(data.charCodeAt(j));
                    }

                    precisionBits = (instruction === 'f')?23:52;

                    bias = Math.pow(2, exponentBits - 1) - 1;
                    signal = readBits(precisionBits + exponentBits, 1, b);
                    exponent = readBits(precisionBits, exponentBits, b);
                    significand = 0;
                    divisor = 2;
                    curByte = b.length + (-precisionBits >> 3) - 1;
                    startBit = 0;

                    do {
                        byteValue = b[ ++curByte ];
                        startBit = precisionBits % 8 || 8;
                        mask = 1 << startBit;
                        for(; (mask >>= 1);) {
                            if (byteValue & mask) {
                                significand += 1 / divisor;
                            }
                            divisor *= 2;
                        }
                    } while ((precisionBits -= startBit));

                        if (exponent === (bias << 1) + 1) {
                            if (significand) {
                                currentResult = NaN;
                            } else {
                                if (signal) {
                                    currentResult = -Infinity;
                                } else {
                                    currentResult = +Infinity;
                                }
                            }
                        } else {
                            if ((1 + signal * -2) * (exponent || significand)) {
                                if (!exponent) {
                                    currentResult = Math.pow(2, -bias + 1) *
                                            significand;
                                } else {
                                    currentResult = Math.pow(2,
                                            exponent - bias) *
                                            (1 + significand);
                                }
                            } else {
                                currentResult = 0;
                            }
                        }
                        result[label+(quantifier>1?
                                ((i/4)+1):
                                '')] = currentResult;
                }

                break;

            case 'x': // NUL byte
            case 'X': // Back up one byte
            case '@': // NUL byte
                 if (quantifier === '*') {
                    quantifier = data.length - dataPointer;
                } else {
                    quantifier = parseInt(quantifier, 10);
                }

                if (quantifier > 0) {
                    if (instruction === 'X') {
                        dataPointer -= quantifier;
                    } else {
                        if (instruction === 'x') {
                            dataPointer += quantifier;
                        } else {
                            dataPointer = quantifier;
                        }
                    }
                }
                break;

            default:
            throw new Error('Warning:  unpack() Type ' + instruction +
                    ': unknown format code');
        }
    }
    return result;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679725, function(require, module, exports) {
// https://github.com/kvz/phpjs/raw/2ae4292a8629d6007eae26298bd19339ef97957e/functions/strings/crc32.js
// MIT License http://phpjs.org/pages/license

var utf8_encode = require('./utf8_encode')

module.exports = function crc32 (str) {
    // http://kevin.vanzonneveld.net
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // +   improved by: T0bsn
    // -    depends on: utf8_encode
    // *     example 1: crc32('Kevin van Zonneveld');
    // *     returns 1: 1249991249
    str = utf8_encode(str);
    var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";

    var crc = 0;
    var x = 0;
    var y = 0;

    crc = crc ^ (-1);
    for (var i = 0, iTop = str.length; i < iTop; i++) {
        y = (crc ^ str.charCodeAt(i)) & 0xFF;
        x = "0x" + table.substr(y * 9, 8);
        crc = (crc >>> 8) ^ x;
    }

    return crc ^ (-1);
}

}, function(modId) { var map = {"./utf8_encode":1587806679726}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679726, function(require, module, exports) {
// https://github.com/kvz/phpjs/raw/2ae4292a8629d6007eae26298bd19339ef97957e/functions/xml/utf8_encode.js
// MIT License http://phpjs.org/pages/license

module.exports = function utf8_encode (argString) {
    // http://kevin.vanzonneveld.net
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: sowberry
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman
    // +   improved by: Yves Sucaet
    // +   bugfixed by: Onno Marsman
    // +   bugfixed by: Ulrich
    // *     example 1: utf8_encode('Kevin van Zonneveld');
    // *     returns 1: 'Kevin van Zonneveld'
    var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    var utftext = "",
        start, end, stringl = 0;

    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;

        if (c1 < 128) {
            end++;
        } else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
        } else {
            enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.slice(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }

    if (end > start) {
        utftext += string.slice(start, stringl);
    }

    return utftext;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587806679727, function(require, module, exports) {
var stripRegex = /^\s*(.*?)\s*$/
module.exports = function(str) {
	return str.match(stripRegex)[1]
}


}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1587806679707);
})()
//# sourceMappingURL=index.js.map