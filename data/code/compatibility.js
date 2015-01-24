﻿
/**
 * @name	CeL function for compatibility
 * @fileoverview
 * 本檔案包含了標準已規定，但先前版本未具備的內建物件功能；以及相容性 test 專用的 functions。<br />
 * 部分功能已經包含於 ce.js。
 * 
 * @since	
 * @see
 * <a href="http://msdn.microsoft.com/en-us/library/s4esdbwz%28v=VS.85%29.aspx" accessdate="2010/4/16 20:4">Version Information (Windows Scripting - JScript)</a>
 */

'use strict';
if (typeof CeL === 'function')
CeL.run({name:'data.code.compatibility',
code:function(library_namespace) {

//	nothing required.
//	本 module 為許多 module 所用，應盡可能勿 requiring 其他 module。


/**
 * null module constructor
 * @class	標準已規定，但先前版本未具備的功能；以及相容性 test 專用的 functions。
 */
var _// JSDT:_module_
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
_// JSDT:_module_
.prototype = {
};


// cache
var Array_slice = Array.prototype.slice,
// cache
set_method = library_namespace.set_method,
// const: 基本上與程式碼設計合一，僅表示名義，不可更改。(== -1)
NOT_FOUND = ''.indexOf('_');


//----------------------------------------------------------------------------------------------------------------------------------------------------------//


/*
 * TODO:

Object.create()
Array.prototype.reduce()
Array.prototype.reduceRight()

http://www.comsharp.com/GetKnowledge/zh-CN/It_News_K875.aspx
8進制數字表示被禁止， 010 代表 10 而不是 8


http://jquerymobile.com/gbs/


*/


var main_version = 0, full_version = '';
// for IE/NS only
if (typeof window !== 'undefined' && window.ScriptEngine) {
	library_namespace.debug(library_namespace.is_type(ScriptEngineMajorVersion), 2);
	main_version = window.ScriptEngineMajorVersion() + '.' + window.ScriptEngineMinorVersion();
	full_version = window.ScriptEngine() + ' ' + main_version + '.' + window.ScriptEngineBuildVersion();
	main_version = Number(main_version);
}
/*
//java test: 加了下面這段在 FF3 會召喚出 java! IE中沒有java object.
//	old: object, new: function (?)
else if ((typeof java == 'function' || typeof java == 'object') && java) {
	//library_namespace.debug("Today is " + java.text.SimpleDateFormat("EEEE-MMMM-dd-yyyy").format(new java.util.Date()));
	if (main_version = java.lang.System.getProperty('os.name')
			+ ' ' + java.lang.System.getProperty('os.version')
			+ ' ' + java.lang.System.getProperty('os.arch'))
		full_version = main_version;
	else
		main_version = 0;
}
*/
if (full_version)
	library_namespace.debug('Script engine: ' + full_version);

/**
 * 版本檢查.
 * 
 * @param {Number}version 最低 version
 */
function check_version(version) {
	if (!library_namespace.is_digits(version) || version < 5)
		version = 5;

	if (typeof WScript !== 'undefined' && WScript.Version < version) {
		// WScript.FullName, WScript.Path
		var Locale = library_namespace.env.locale, promptTitle = Locale == 0x411 ? 'アップグレードしませんか？' : '請升級',
				promptC = Locale == 0x411 ? "今使ってる " + WScript.Name + " のバージョンは古過ぎるから、\nMicrosoft Windows スクリプト テクノロジ Web サイトより\nバージョン "
				+ WScript.Version + " から " + version + " 以上にアップグレードしましょう。"
				: "正使用的 " + WScript.Name + " 版本過舊，\n請至 Microsoft Windows 網站將版本由 " + WScript.Version + " 升級到 " + version + " 以上。",
				url = /* Locale==0x411? */"http://www.microsoft.com/japan/developer/scripting/default.htm";
		if (1 == WScript.Popup(promptC, 0, promptTitle, 1 + 48))
			WshShell.Run(url);
		WScript.Quit(1);
	}
}



//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// global object


set_method(library_namespace.env.global, {
	encodeURI : escape,
	decodeURI : unescape,
	encodeURIComponent : encodeURI,
	decodeURIComponent : decodeURI,
	isNaN : function(value) {
		//parseFloat(value)
		//var a = typeof value == 'number' ? value : parseInt(value);
		//alert(typeof a+','+a+','+(a===a));

		//	變數可以與其本身比較。如果比較結果不相等，則它會是 NaN。原因是 NaN 是唯一與其本身不相等的值。
		//	A reliable way for ECMAScript code to test if a value X is a NaN is an expression of the form X !== X. The result will be true if and only if X is a NaN.
		//return /*typeof value=='number'&&*/a != a;
		value = Number(value);
		return value !== value;
	},
	//	isFinite(null) === true
	isFinite : function (value) {
		return !isNaN(value)
		&& value !== Infinity
		&& value !== -Infinity;
	}
}, null);


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// Object.*


if (typeof Object.freeze === 'function')
	try {
		// https://github.com/es-shims/es5-shim/blob/master/es5-sham.js
		Object.freeze(function() {
		});
	} catch (e) {
		var Object_freeze = Object.freeze;
		Object.freeze = function freeze_Object(object) {
			return typeof object == 'function' ? Object_freeze(object) : object;
		};
	}


set_method(Object, {
	// Object.seal()
	seal: function seal(object) {
		// 無法以舊的語法實現。
		return object;
	},
	// Object.isSealed()
	isSealed: function isSealed(object) {
		return false;
	},
	// Object.preventExtensions()
	preventExtensions: function preventExtensions(object) {
		// 無法以舊的語法實現。
		return object;
	},
	// Object.isExtensible()
	isExtensible: function isExtensible(object) {
		return true;
	},

	// Object.freeze()
	freeze : function freeze(object) {
		// 無法以舊的語法實現。
		return object;
	},
	// Object.isFrozen()
	isFrozen : function isFrozen(object) {
		return false;
	}
});



if (!Object.setPrototypeOf) {
	var Object_getPrototypeOf, Object_setPrototypeOf;

	// test prototype chain
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain
	if (typeof {}.__proto__ === 'object') {
		// http://ejohn.org/blog/objectgetprototypeof/
		// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/GetPrototypeOf
		// http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/
		Object_getPrototypeOf = function (object) {
			return object.__proto__;
		};
		Object_setPrototypeOf = function (object, prototype) {
			object.__proto__ = prototype;
			return object;
		};

		set_method(Object, {
			getPrototypeOf: Object_getPrototypeOf,
			setPrototypeOf: Object_setPrototypeOf
		});

	} else if ({}.constructor && {}.constructor.prototype) {
		Object_getPrototypeOf = function (object) {
			return object.constructor.prototype;
		};
		Object_setPrototypeOf = function (object, prototype) {
			object.constructor.prototype = prototype;
			return object;
		};

		set_method(Object, {
			getPrototypeOf: Object_getPrototypeOf,
			setPrototypeOf: Object_setPrototypeOf
		});
	}
}


function hasOwnProperty(key) {
	try {
		return (key in this)
		// Object.getPrototypeOf() 返回給定對象的原型。
		&& this[key] !== Object.getPrototypeOf(this)[key];
	} catch (e) {
		// TODO: handle exception
	}
}


// Object.keys(): get Object keys, 列出對象中所有可以枚舉的屬性 (Enumerable Only)
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
// 可用來防止 .prototype 帶來之 properties。e.g., @ IE
// cf. Object.getOwnPropertyNames() 會列出對象中所有可枚舉以及不可枚舉的屬性 (enumerable or non-enumerable)
function keys(object) {
	var key, keys = [], prototype;

	try {
		prototype = Object.getPrototypeOf(object);
	} catch (e) {
	}

	try {
		if (!prototype)
			prototype = library_namespace.null_Object();
		for (key in object) {
			// !hasOwnProperty(key)
			if (!(key in prototype)
					|| object[key] !== prototype[key])
				keys.push(key);
		}

	} catch (e) {
		// TODO: handle exception
	}

	return keys;
}

function getPropertyNames() {
	return Object.keys(this);
}


function getOwnPropertyDescriptor(object, property) {
	if (property in object)
		return {
			configurable : true,
			enumerable : true,
			value : object[property],
			writable : true
		};
}

set_method(Object, {
	// Object.getOwnPropertyDescriptor()
	getOwnPropertyDescriptor : getOwnPropertyDescriptor,
	// Object.getOwnPropertyNames() 會列出對象中所有可枚舉以及不可枚舉的屬性 (enumerable or non-enumerable)
	getOwnPropertyNames : keys,
	// Object.keys(): get Object keys, 列出對象中所有可以枚舉的屬性 (enumerable only)
	keys : keys
});



function copy_properties(from, to) {
	Object.keys(from).forEach(function(property) {
		to[property] = from[property];
	});
	return to;
}
// 現在有 Object.keys() 了，使用 Object.keys() 來替代原有之 copy_properties()。
library_namespace.copy_properties = copy_properties;



//	會造成幾乎每個使用 for(.. in Object)，而不是使用 Object.keys() 的，都出現問題。
if (false)
set_method(Object.prototype, {
	getPropertyNames : getPropertyNames,
	hasOwnProperty : hasOwnProperty
});


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// Array.*


/*

var a=[1,2,3,1],s=new Set(a),e=s.entries(),v=s.values();
console.assert(e.next().value.join()==="1,1");
console.assert(e.next().value.join()==="2,2");
console.assert(e.next().value.join()==="3,3");
console.assert(e.next().done);
console.assert(v.next().value===1);
console.assert(v.next().value===2);
console.assert(v.next().value===3);
console.assert(v.next().done);

v=s.values();
console.assert(v.next().value===1);
console.assert(v.next().value===2);
console.assert(v.next().value===3);

s.add(4);
console.assert(v.next().value===4);
console.assert(v.next().done);

e=a.entries();
console.assert(e.next().value.join()==="0,1");
console.assert(e.next().value.join()==="1,2");
console.assert(e.next().value.join()==="2,3");
console.assert(e.next().value.join()==="3,1");
console.assert(e.next().done);

//{String}string
//string.split('')
//Object(string)
//Array.from(string)
console.assert(Array.from('abc').join()==="a,b,c");
console.assert(Array.from(5).join()==="");
console.assert(Array.from(true).join()==="");
console.assert(Array.from(a).join()==="1,2,3,1");
console.assert(Array.from(a.entries()).join(';')==="0,1;1,2;2,3;3,1");
console.assert(Array.from({length:4},function(v,i){return i*i;}).join()==="0,1,4,9");
console.assert(Array.from(new Set(a)).join()==="1,2,3");
console.assert(Array.from(new Map([[5,1],[7,1],[5,2],[3,1]])).join()==="5,2,7,1,3,1");
console.assert(Array.from(new Map([[5,1],[7,1],[5,2],[3,1]]).keys()).join()==="5,7,3");


TODO: test:
Array.from(Array, String, {length:\d}, Map, Set, Iterator, other arrayLike)


*/

// Array.from()
function Array_from(items, mapfn, thisArg) {
	var array, i, iterator = items && !Array.isArray(items)
	// 測試是否有 iterator。
	&& (items['@@iterator'] || (items.entries ? 'entries' : items.values && 'values'));

	if (!iterator && typeof items.next === 'function')
		// items itself is an iterator.
		iterator = items;

	if (iterator) {
		array = [];

		// need test library_namespace.env.has_for_of
		// for(i of items) array.push(i);

		if (typeof iterator === 'function')
			iterator = iterator.call(items);
		else if (iterator && typeof items[iterator] === 'function')
			iterator = items[iterator]();
		else if (!iterator.next)
			throw new Error('Array.from: invalid iterator!');

		while (!(i = iterator.next()).done)
			array.push(i.value);
		return array;
	}

	if (typeof mapfn !== 'function')
		try {
			// for IE, Array.prototype.slice.call('ab').join() !== 'a,b'
			return typeof items === 'string' ? items.split('') : Array_slice.call(items);
		} catch (e) {
			if ((e.number & 0xFFFF) !== 5014)
				throw e;
			mapfn = null;
		}

	var length = items && items.length | 0;
	array = [];
	if (mapfn)
		for (i = 0; i < length; i++)
			array.push(thisArg ? mapfn.call(thisArg, items[i], i)
			// 不採用 .call() 以加速執行。
			: mapfn(items[i], i));
	else
		while (i < length)
			array.push(items[i++]);

	return array;
}

if (!Array.from)
	// 做個標記。
	Set.prototype['@@iterator'] = 'values';

set_method(Array, {
	from : Array_from,
	//	Array.of()
	of : function Array_of() {
		return Array_slice.call(arguments);
	}
});



function Array_Iterator_next() {
	// this: [ index, array, use value ]
	//library_namespace.debug(this.join(';'));
	var index = this[0]++;
	//library_namespace.debug(this.join(';'));
	if (index < this[1].length)
		return {
			value : this[2] ? this[1][index] : [ index, this[1][index] ],
			done : false
		};

	// 已經 done 的不能 reuse。
	this[0] = NaN;
	return {
		value : undefined,
		done : true
	};
};

function Array_Iterator(array) {
	//library_namespace.debug(array);
	this.next = Array_Iterator_next.bind([ 0, array ]);
}


// Array.prototype.entries()
function Array_entries() {
	// [ index, array, use value ]
	return new Array_Iterator(this);
}


set_method(Array.prototype, {
	// Array.prototype.entries()
	entries : Array_entries,
	// Array.prototype.includes()
	includes : includes,
	// Array.prototype.findIndex()
	find : function find(predicate, thisArg) {
		for (var index = 0, length = this.length; index < length; index++)
			if (thisArg ? predicate.call(thisArg, this[index], index, this)
			// 不採用 .call() 以加速執行。
			: predicate(this[index], index, this))
				return this[index];
		//return undefined;
	},
	// Array.prototype.findIndex()
	findIndex : function findIndex(predicate, thisArg) {
		for (var index = 0, length = this.length; index < length; index++)
			if (thisArg ? predicate.call(thisArg, this[index], index, this)
			// 不採用 .call() 以加速執行。
			: predicate(this[index], index, this))
				return index;
		return NOT_FOUND;
	},
	// Array.prototype.some()
	some : function some(callback, thisArg) {
		for (var index = 0, length = this.length; index < length; index++)
			if (thisArg ? callback.call(thisArg, this[index], index, this)
			// 不採用 .call() 以加速執行。
			: callback(this[index], index, this))
				return true;
		return false;
	},
	// Array.prototype.every()
	every : function every(callback, thisArg) {
		for (var index = 0, length = this.length; index < length; index++)
			if (!(thisArg ? callback.call(thisArg, this[index], index, this)
			// 不採用 .call() 以加速執行。
			: callback(this[index], index, this)))
				return false;
		return true;
	},
	// Array.prototype.map()
	map : function map(callback, thisArg) {
		var result = [];
		this.forEach(function() {
			result.push(callback.apply(this, arguments));
		}, thisArg);
		return result;
	},
	// Array.prototype.filter()
	filter : function map(callback, thisArg) {
		var result = [];
		this.forEach(function(value) {
			if (callback.apply(this, arguments))
				result.push(value);
		}, thisArg);
		return result;
	},
	//Array.prototype.indexOf ( searchElement [ , fromIndex ] )
	indexOf : function indexOf(searchElement, fromIndex) {
		fromIndex |= 0;
		var length = this.length;
		if (fromIndex < 0 && (fromIndex += length) < 0)
			fromIndex = 0;

		for (; fromIndex < length; fromIndex++)
			if (searchElement === this[fromIndex])
				return fromIndex;
		return NOT_FOUND;
	},
	// Array.prototype.lastIndexOf ( searchElement [ , fromIndex ] )
	lastIndexOf : function lastIndexOf(searchElement, fromIndex) {
		var length = this.length;
		if (isNaN(fromIndex))
			fromIndex = length - 1;
		else if ((fromIndex |= 0) < 0)
			fromIndex += length;
		else
			fromIndex = Math.min(fromIndex, length - 1);

		for (; 0 <= fromIndex; fromIndex--)
			if (searchElement === this[fromIndex])
				return fromIndex;
		return NOT_FOUND;
	},
	// Array.prototype.fill()
	fill : function fill(value, start, end) {
		// Array.prototype.fill() 只會作用於 0~原先的 length 範圍內！
		if (isNaN(end) || this.length < (end |= 0))
			end = this.length;
		else if (end < 0)
			end += this.length;
		for (var index = start || 0; index < end;)
			this[index++] = value;
		return this;
	},
	/**
	 * 對於舊版沒有 Array.push() 等函數時之判別及處置。
	 * 不能用t=this.valueOf(); .. this.push(t);
	 */
	// Array.prototype.push()
	push : function push() {
		var i = 0, l = arguments.length, w = this.length;
		//	在 FF3 僅用 this[this.length]=o; 效率略好於 Array.push()，但 Chrome 6 相反。
		for (; i < l; i++)
			this[w++] = arguments[i];
		return w;
	},
	// Array.prototype.pop()
	pop : function pop() {
		// 不能用 return this[--this.length];
		var l = this.length, v;
		if (l) {
			v = this[l];
			this.length--;
		}
		return v;
	},
	// Array.prototype.shift()
	shift : function shift() {
		var v = this[0];
		//	ECMAScript 不允許設定 this=
		this.value = this.slice(1);
		return v;
	},
	// Array.prototype.unshift()
	unshift : function unshift() {
		// ECMAScript 不允許設定 this =
		this.value = Array_slice.call(arguments).concat(this);
		return this.length;
	}
}, null);


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// Number.*

//	1. === 1.0

function ToNumber(value) {
	return +value;
}

// cf. Math.floor()
// ((Number.MAX_SAFE_INTEGER / 4) | 0) < 0, 0 < ((Number.MAX_SAFE_INTEGER / 5) | 0)
function ToInteger(value) {
	//return value >> 0;
	//	http://wiki.ecmascript.org/doku.php?id=harmony:number.tointeger&s=number+tointeger
	return (value = Number(value)) ? value | 0 : 0;
}


//Number.isNaN()
//	http://wiki.ecmascript.org/doku.php?id=harmony:number.isnan
function is_NaN(value) {
	return typeof value === 'number' &&
		//isNaN(value)
		value !== value;
}

//calculatable
/**
 * 取得最小最低可做除法計算數值。回傳值為邊界，已不可再做操作。但可做乘法操作。
 * 
 * @param [base_integral]
 * @returns {Number}
 */
function dividable_minimum(base_integral, return_last) {
	if (!base_integral || isNaN(base_integral))
		base_integral = 1;
	var last = 1, min;
	// 預防 min 變成0，因此設置前一步 last。
	while (base_integral !== base_integral + (min = last / 2))
		last = min;
	return !return_last && min || last;
}


//calculatable
/**
 * 取得最大可做加法計算數值。回傳值為邊界，已不可再做加法操作。但可做減法操作。
 * 
 * @param [base_integral]
 * @returns {Integer}
 */
function addable_maximum(base_integral) {
	if (!base_integral || isNaN(base_integral))
		base_integral = 1;
	var max = 1, test;
	while ((max *= 2) < (test = max + base_integral)
			&& max === test - base_integral)
		;
	return max;
}
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || addable_maximum() - 1;
// Number.isSafeInteger()
function isSafeInteger(number) {
	return typeof number === 'number'

		//&& number <= MAX_SAFE_INTEGER && -MAX_SAFE_INTEGER <= number
		&& Math.abs(number) <= MAX_SAFE_INTEGER

		//	在範圍外的，常常 % 1 亦為 0。
		&& 0 === number % 1
		//&& Math.floor(number) === number
		;
}


set_method(Number, {
	//	The value of Number.MAX_SAFE_INTEGER is the largest integer value that can be represented as a Number value without losing precision,
	//	which is 9007199254740991 (2^53-1).
	MAX_SAFE_INTEGER : MAX_SAFE_INTEGER,
	//	The value of Number.MIN_SAFE_INTEGER is -9007199254740991 (-(2^53-1)).
	MIN_SAFE_INTEGER : -MAX_SAFE_INTEGER,
	//	The value of Number.EPSILON is the difference between 1 and the smallest value greater than 1 that is representable as a Number value,
	//	which is approximately 2.2204460492503130808472633361816 x 10-16.
	EPSILON : dividable_minimum(0, 1)
}, 'number');

set_method(Number, {
	isSafeInteger: isSafeInteger,
	// Number.toInteger() is obsolete.
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toInteger
	// Number.toInteger was part of the draft ECMAScript 6 specification, but has been removed on August 23, 2013 in Draft Rev 17.
	//toInteger: ToInteger,

	// Number.isInteger()
	// cf. .is_digits()
	isInteger: function isInteger(number) {
		return typeof number === 'number' && ToInteger(number) === number;
	},
	parseFloat: parseFloat,
	parseInt: parseInt,
	isNaN: is_NaN,
	isFinite: function (value) {
		return typeof value === 'number' && isFinite(value);
	}
});



//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// Math.*


//	32 bits
var BITS = 1;
while (1 !== 1 << BITS)
	BITS <<= 1;
// assert: BITS === 32

//	Math.clz32()
//	TODO: 增進效率。
function clz32(value) {
	//	ToUint32() ??
	value >>>= 0;
	//console.log(value + ' = ' + value.toString(2) + ' (2)');
	//	binary search: 計算數字本身具有的 bits.
	for (var min = 0, MAX = BITS, zeros;;) {
		zeros = (min + MAX) >> 1;
		//console.log(min + ' - ' + zeros + ' - ' + MAX);
		if (0 === value >> zeros)
			if (MAX === zeros)
				break;
			else
				MAX = zeros;
		else
			if (min === zeros)
				break;
			else
				min = zeros;
	}
	return BITS - MAX;
}
/*

var BITS = 32;
CeL.assert([BITS, Math.clz(0)], 'Math.clz(0) === 32');
for (var i = BITS, test_number_in_2 = '1'; --i;) {
	CeL.assert([i, Math.clz(parseInt(test_number_in_2, 2))], i + ': ' + test_number_in_2);
	test_number_in_2 = test_number_in_2.replace(new RegExp('^.{1,' + (1 + (test_number_in_2.length * Math.random()) | 0) + '}'), function ($) {
		return $ + (Math.random() < .5 ? 0 : 1)
	});
}
CeL.log('OK');

*/





//	分界
var Math_hypot_up_boundary = Math.sqrt(Number.MAX_SAFE_INTEGER) / 2 | 0,
//
Math_hypot_down_boundary = Math.sqrt(Number.MIN_VALUE);

//	Math.hypot(value1 , value2, value3 = 0)
//	TODO: 增進效率。
//	http://en.wikipedia.org/wiki/Hypot
function hypot(value1, value2, value3) {
	var r, MAX = Math.max(value1 = Math.abs(value1),
		//	轉正
		value2 = Math.abs(value2),
		//
		value3 = value3 === undefined ? 0 : Math.abs(value3));
	if (!MAX || !Number.isFinite(MAX))
		return MAX;

	if (MAX < Math_hypot_up_boundary
		//	avoid underflow
		&& Math_hypot_down_boundary < Math.min(value1, value2, value3)
		//	avoid overflow, minimise rounding errors (預防本該為整數的出現小數).
		&& Number.isFinite(r = value1 * value1 + value2 * value2 + value3 * value3))
		return Math.sqrt(r);

	return MAX * Math.sqrt(
		(value1 ? (value1 /= MAX) * value1 : 0)
		+ (value2 ? (value2 /= MAX) * value2 : 0)
		+ (value3 ? (value3 /= MAX) * value3 : 0));
}


/*

CeL.assert([5, Math.hypot(3, 4)], 'normal positive Math.hypot');
CeL.assert([5, Math.hypot(-3, -4)], 'negative Math.hypot');
CeL.assert([Number.MAX_VALUE, Math.hypot(3 / 5 * Number.MAX_VALUE, 4 / 5 * Number.MAX_VALUE)], 'avoid overflow');
CeL.assert([5, Math.hypot(Number.MIN_VALUE * 3, Number.MIN_VALUE * 4) / Number.MIN_VALUE], 'avoid underflow');


*/


set_method(Math, {
	LN2: Math.log(2),
	LN10: Math.log(10)
}, 'number');


set_method(Math, {
	clz32: clz32,
	log2: function log2(value) {
		return Math.log(value) / Math.LN2;
	},
	log10: function log10(value) {
		return Math.log(value) / Math.LN10;
	},
	hypot: hypot,
	cbrt: function cbrt(value) {
		return Math.pow(value, 1 / 3);
	},
	trunc : function trunc(value) {
		// value >= 0 ? Math.floor(value) : Math.ceil(value)
		return value > 0 ? Math.floor(value)
		: value < 0 ? Math.ceil(value)
		: value === 0 ? value
		: isNaN(value) ? NaN
		// null, true, false, ..
		: value | 0;
	},
	sign : function sign(value) {
		value = Number(value);
		return 0 < value ? 1 : value < 0 ? -1 : value;
	}
});


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// String.*

//String.prototype.repeat()
//in VB: String(count, this)
//“x” operator @ perl
//http://wiki.ecmascript.org/doku.php?id=harmony:string.prototype.repeat
function repeat(count) {
	var result = [],
	//	The repeat function is intentionally generic
	//	https://mail.mozilla.org/pipermail/es-discuss/2011-January/012538.html
	//	Trivia:  ""+obj is not the same thing as ToString(obj). They differ if obj has a .valueOf method.
	piece = '' + this;

	if (!piece || isNaN(count) || (count = Math.floor(count)) < 1)
		return '';

	//	https://mail.mozilla.org/pipermail/es-discuss/2011-January/012525.html
	// If ToUint32(`amount) is not equal to `amount, throw a RangeError.
	//	isFinite()
	if (count >>> 0 !== count)
		throw new Error("invalid repeat argument");

	//	http://stackoverflow.com/questions/202605/repeat-string-javascript
	//	此法較 (new Array( count + 1 ).join(this)) 稍快。
	for (;;) {
		library_namespace.debug('left: ' + count, 3, 'String.prototype.repeat');
		if (count & 1)
			result.push(piece);

		if (count >>>= 1)
			piece += piece;
		else
			break;
	}

	return result.join('');
}





/*

2010/6/1
test time:

'   fhdgjk   lh gjkl ;sfdf d  hf gj '

.replace(/^\s+|\s+$/g, '')
~<
.replace(/\s+$|^\s+/g, '')
<
.replace(/^\s+/, '').replace(/\s+$/, '')
~<
.replace(/\s+$/, '').replace(/^\s+/, '')

*/

/**
 * 去除首尾空白。去除前後空白。去頭去尾。去掉 string 前後 space.
 * @param {String} string	input string
 * @return	{String}	轉換過的 string
 * @since	2006/10/27 16:36
 * @see
 * from lib/perl/BaseF.pm (or program/database/BaseF.pm)
 * function strip() @ Prototype JavaScript framework
 * 
 * String.prototype.trim()
 * http://stackoverflow.com/questions/1418050/string-strip-for-javascript
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/Trim
 * http://blog.stevenlevithan.com/archives/faster-trim-javascript
 * 
 * @_memberOf	_module_
 */
function trim() {
	//	The repeat function is intentionally generic
	return String(this)

	//.replace(/\s+$|^\s+/g, '');
	//.replace(/^\s+|\s+$/g, '');

	//	The definition of white space is the union of WhiteSpace and LineTerminator.
	.replace(/[\s\n]+$|^[\s\n]+/g, '');
}


// String.prototype.startsWith()
function startsWith(searchString, position) {
	searchString = String(searchString);
	if (!position || !(position |= 0) || position < 0)
		return this.lastIndexOf(searchString, 0) === 0;

	return searchString === this.substr(position, searchString.length);
}

// String.prototype.endsWith()
function endsWith(searchString, endPosition) {
	searchString = String(searchString);
	var is_tail = endPosition === undefined
			|| (endPosition |= 0) === this.length,
	//
	position = (is_tail ? this.length : endPosition) - searchString.length;
	return position >= 0
			&& (is_tail ? this.indexOf(searchString, position) === position
					: searchString === this.substr(position,
							searchString.length));
}

// String.prototype.includes()
// Array.prototype.includes()
function includes(searchString, position) {
	return this.indexOf(searchString, position) !== NOT_FOUND;
}


set_method(String.prototype, {
	repeat : repeat,
	trim : trim,
	includes : includes,
	startsWith : startsWith,
	endsWith : endsWith
});


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// Date.*

function pad_00(integer) {
	return integer < 10 ? '0' + integer : integer;
}

// Date.prototype.toISOString() for IE8
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
function toISOString() {
	var year = this.getUTCFullYear(), m = year < 0;
	if (m)
		year = -year;
	if (year < 1000)
		year = (year < 100 ? year < 10 ? '000' : '00' : '0') + year;
	if (m)
		year = '-' + year;

	m = this.getUTCMilliseconds();
	if (m < 100)
		m = (m < 10 ? '00' : '0') + m;

	return year + '-' + pad_00(this.getUTCMonth() + 1) + '-'
			+ pad_00(this.getUTCDate()) + 'T' + pad_00(this.getUTCHours())
			+ ':' + pad_00(this.getUTCMinutes()) + ':'
			+ pad_00(this.getUTCSeconds()) + '.' + m + 'Z';
}

set_method(Date, {
	// Date.now()
	now : function now() {
		// (new Date()).getTime()
		return new Date - 0;
	}
});

set_method(Date.prototype, {
	// Date.prototype.toJSON()
	toJSON : function toJSON() {
		return this.toISOString();
	},
	// Date.prototype.toISOString()
	toISOString : toISOString
});


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// JSON.*



/*	2008/12/21 18:53:42
value to json
JavaScript Object Notation	ECMA-262 3rd Edition

http://stackoverflow.com/questions/1500745/how-to-pass-parameters-in-eval-in-an-object-form
json={name:'~',values:..,description:'~'}
window[json.name].apply(null, json.values)


usage:
json(value)

parse:
data=eval('('+data+')');	//	字串的前後記得要加上刮號 ()，這是用來告知 Javascript Interpreter 這是個物件描述，不是要執行的 statement。
eval('data='+data);

TODO:

useObj
加入function object成員，.prototype可用with()。加入函數相依性(dependency)

array用name:
(function(){
var o;
o=[..];
var i,v={..};
for(i in v)o[i]=v[i];
return o; 
})()


recursion 循環參照
(function(){
var o;
o={a:[]};
o['b']=[o['a']],
o['a'].push([o['b']]);
return o; 
})()



BUG:
function 之名稱被清除掉了，這可能會產生問題！
(function(){
var f=function(){..};
f.a=..;
f.b=..;
f.prototype={
a:..,
b:..
}
return f; 
})()


*/



/*

test recursion 循環參照
(function(){
var o=[],_1=[o];
o.push(_1);
return o; 
})();

var a=[],b;a.push(b=[a]);json(a);
*/

//json[generateCode.dLK]='qNum,dQuote';
/**
 * 須判別來源是否為 String or Number!
 * @deprecated
 * 	改用 window.JSON, jQuery.parseJSON.
 * @param val
 * @param name
 * @param type
 * 	type==2: inside object, treat undefined as ''
 * @returns
 */
function json(val, name, type) {
	var _f = json, expA = [], expC = [], vType = typeof val, addE = function(
			o, l, n) {
		if (l) {
			o = _f(o, 0, 2);
			n = typeof n == 'undefined' || n === '' ? ''
					: (/^(\d{1,8})?(\.\d{1,8})?$/
							.test(n)
							|| /^[a-z_][a-z_\d]{0,30}$/i
							.test(n) ? n
									: dQuote(n))
									+ ':' + _f.separator;
			expA.push(n, o[1]);

			// expC.push(_f.indentString+n+o[0].join(_f.line_separator+_f.indentString)+',');
			o = o[0];
			o[0] = n
			+ (typeof o[0] == 'undefined' ? ''
					: o[0]);
			o[o.length - 1] += ',';
			for ( var i = 0; i < o.length; i++)
				o[i] = _f.indentString
				+ (typeof o[i] == 'undefined' ? ''
						: o[i]);
			expC = expC.concat(o);
		} else
			expA.push(o), expC.push(o);
	}
	// 去掉最後一組的 ',' 並作結
	, closeB = function(c) {
		var v = expC[expC.length - 1];
		if (v.charAt(v.length - 1) == ',')
			expC[expC.length - 1] = v.slice(0,
					v.length - 1);
		addE(c);
	};

	switch (vType) {
	case 'number':
		// http://msdn2.microsoft.com/zh-tw/library/y382995a(VS.80).aspx
		// isFinite(value) ? String(value)
		var k = 0, m = 'MAX_VALUE,MIN_VALUE,NEGATIVE_INFINITY,POSITIVE_INFINITY,NaN'
			.split(','), t = 0;
		if (val === NaN || val === Infinity
				|| val === -Infinity)
			t = '' + val;
		else
			for (; k < m.length; k++)
				if (val === Number[m[k]]) {
					t = 'Number.' + m[k];
					break;
				}
		if (!t) {
			// http://msdn2.microsoft.com/zh-tw/library/shydc6ax(VS.80).aspx
			for (k = 0, m = 'E,LN10,LN2,LOG10E,LOG2E,PI,SQRT1_2,SQRT2'
				.split(','); k < m.length; k++)
				if (val === Math[m[k]]) {
					t = 'Math.' + m[k];
					break;
				}
			if (!t)
				if (k = ('' + val)
						.match(/^(-?\d*[1-9])(0{3,})$/))
					t = k[1] + 'e' + k[2].length;
				else {

					// 有理數判別
					k = qNum(val);

					// 小數不以分數顯示. m==1:非分數
					m = k[1];
					while (m % 2 == 0)
						m /= 2;
					while (m % 5 == 0)
						m /= 5;

					t = k[2] == 0 && m != 1 ? k[0]
					+ '/' + k[1]
					:
						// TODO: 加速(?)
						(t = Math.floor(val)) == val
						&& ('' + t).length > (t = '0x'
							+ val
							.toString(16)).length ? t
									: val;
				}

		}
		addE(t);
		break;
	case 'null':
		addE('' + val);
		break;
	case 'boolean':
		addE(val);
		break;
	case 'string':
		addE(dQuote(val));
		break;
	case 'undefined':
		addE(type == 2 ? '' : 'undefined');
		break;

	case 'function':
		// 加入function
		// object成員，.prototype可用with()。加入函數相依性(dependency)
		var toS, f;
		// 這在多執行緒有機會出問題！
		if (typeof val.toString != 'undefined') {
			toS = val.toString;
			delete val.toString;
		}
		f = '' + val;
		if (typeof toS != 'undefined')
			val.toString = toS;

		f = f.replace(/\r?\n/g, _f.line_separator); // function
		// 才會產生
		// \r\n
		// 問題，所以先處理掉
		var r = /^function\s+([^(\s]+)/, m = f.match(r), t;
		if (m)
			m = m[1], addE('//	function [' + m + ']'),
			t = f.replace(r, 'function'
					+ _f.separator);
		if (m && t.indexOf(m) !== NOT_FOUND)
			alert('function [' + m
					+ '] 之名稱被清除掉了，這可能會產生問題！');
		addE(t || f);
		// UNDO
		break;

	case 'object':
		try {
			if (val === null) {
				addE('' + val);
				break;
			}
			var c = val.constructor;
			if (c == RegExp) {
				addE(val);
				break;
			}
			if (c == Date || vType == 'date') { // typeof
				// val.getTime=='function'
				// 與 now 相隔過短(<1e7, 約3h)視為 now。但若是 new
				// Date()+3 之類的會出現誤差！
				addE('new Date'
						+ ((val - new Date) > 1e7 ? '('
								+ val.getTime() + ')'
								: '')); // date被當作object
				break;
			}
			if (('' + c).indexOf('Error') !== NOT_FOUND) {
				addE('new Error'
						+ (val.number
								|| val.description ? '('
										+ (val.number || '')
										+ (val.description ? (val.number ? ','
												: '')
												+ dQuote(val.description)
												: '') + ')'
												: ''));
				break;
			}

			var useObj = 0;
			if (c == Array) {
				var i, l = 0;
				if (!_f.forceArray)
					for (i in val)
						if (isNaN(i)) {
							useObj = 1;
							break;
						} else
							l++;

				if (_f.forceArray || !useObj
						&& l > val.length * .8) {
					addE('[');
					for (i = 0; i < val.length; i++)
						addE(val[i], 1);
					closeB(']');
					break;
				} else
					useObj = 1;
			}

			if (useObj || c == Object) {// instanceof
				addE('{');
				for ( var i in val)
					addE(val[i], 1, i);
				closeB('}');
				break;
			}
			addE(dQuote(val));
			break;
		} catch (e) {
			if (28 == (e.number & 0xFFFF))
				alert('json: Too much recursion?\n循環參照？');
			return;
		}

	case 'unknown': // sometimes we have this kind of type
	default:
		alert('Unknown type: [' + vType
				+ '] (constructor: ' + val.constructor
				+ '), please contract me!\n' + val);
	break;
	// alert(vType);
	}
	return type ? [ expC, expA ] : expC
			.join(_f.line_separator);
}
json.dL = 'dependencyList'; // dependency List Key
json.forceArray = 1;

json.indentString = '	';
json.line_separator = '\n';
json.separator = ' ';



//----------------------------------------------------------------------------------------------------------------------------------------------------------//


return (
	_// JSDT:_module_
);
}


});

