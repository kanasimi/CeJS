/**
 * @name CeL function for physical quantities
 * @fileoverview 本檔案包含了 value of a quantity/物理量/度量衡（長度、時間、重量等）標準/國際單位/國際單位制詞頭
 *               單位換算用的 functions。<br />
 * 
 * TODO:<br />
 * https://en.wikipedia.org/wiki/Category:Units_of_amount
 * https://en.wikipedia.org/wiki/Significance_arithmetic
 * 
 * http://thdl.ntu.edu.tw/tools/
 * http://thdl.ntu.edu.tw/weight_measure/transformation8.php<br />
 * 中國度量衡/中國古代貨幣 http://thdl.ntu.edu.tw/suzhou/
 * 
 * @since
 * @example <code>
 * CeL.run('data.quantity',function(){
 * 	// ..
 * });
 * </code>
 * 
 * @see http://unit.0123456789.tw/
 * 
 * @example <code>


cm^2, cm2 視作 cm²

CeL.assert([(new CeL.quantity('5.4cm')).toString(),'5.4 cm'],'');
CeL.assert([(new CeL.quantity('4cm^2')).toString(),'4 cm²'],'');
CeL.assert([(new CeL.quantity('4cm2')).toString(),'4 cm²'],'');
CeL.assert([(new CeL.quantity('四千五百六十七公尺')).toString(),'4567 m'],'');
CeL.assert([(new CeL.quantity('54公尺')).toString(),'54 m'],'');
CeL.assert([(new CeL.quantity('5公尺')).multiple(4).toString(),'20 m'],'');
CeL.assert([(new CeL.quantity('54cm')).multiple('8.5公尺').toString(),'4.59 m²'],'');
CeL.assert([(new CeL.quantity('54cm')).multiple('8.5公尺').toString('繁體中文'),'4.59平方公尺'],'');
CeL.assert([(new CeL.quantity('500平方公尺')).convert_to('a').toString(),'5 a'],'');
CeL.assert([(new CeL.quantity('500平方公尺')).convert_to('ha').toString(),'0.05 ha'],'');
CeL.assert([(new CeL.quantity('500平方公尺')).convert_to('a').toString('繁體中文'),'5 公畝'],'');


°C
廿分鐘
三磅

 
 * </code>
 */

'use strict';

// --------------------------------------------------------------------------------------------

typeof CeL === 'function' && CeL.run({
	// module name
	name : 'data.quantity',

	// |data.native.
	require : 'data.|data.numeral.|data.Convert_Pairs.',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	/**
	 * 
	 * @param {RegExp}pattern
	 * @param {String}flag
	 * 
	 * @returns {RegExp}
	 */
	function convert_pattern(pattern, flag) {
		return new RegExp(pattern.source.replace(/N/, PATTERN_NUMBER_SOURCE)
				.replace(/S/, SUPERSCRIPT_NUMBER), flag);
	}

	// ---------------------------------------------------------------------//
	// 定義基本常數。

	var SUPERSCRIPT_NUMBER =
	// @ data.native
	// Number.prototype.to_super.digits,
	'⁰¹²³⁴⁵⁶⁷⁸⁹',

	//
	PATTERN_NUMBER_SOURCE =
	// /[+\-]?(?:\d+(?:\.\d+)?|\.\d+)(?:E[+\-]?\d+)?/i
	/[+\-]?(?:\d+(?:\.\d+)?|\.\d+)/i.source,

	// [ , number, units, 分母 units ]
	PATTERN_QUANTITY = convert_pattern(
	// /^\s*(N)\s*([^\/\d][^\/]*)(?:\/(.+))?$/
	/^\s*(N)\s*([^\d\s\^].*)$/, 'i'),

	// kg/(m·s2) and kg·m−1·s−2 are acceptable, but kg/m/s2 is ambiguous
	// and unacceptable.
	PATTERN_UNIT = convert_pattern(
	// [ , unit symbol, exponent, exponent, superscript exponent ]
	/([^\d\s\^⋅·×()]+)([+\-]?\d|\^\(?([+\-]?\d)\)?|([⁺⁻]?[S]))?/
	//
	, 'gi'),

	// exponent_to_prefix.pair_Map.get(6) === 'M'
	exponent_to_prefix = new library_namespace.data.Convert_Pairs(
	// https://en.wikipedia.org/wiki/Metric_prefix
	'30=Q,27=R,24=Y,21=Z,18=E,15=P,12=T,9=G,6=M,3=k,2=h,1=da,'
	//
	+ '-1=d,-2=c,-3=m,-6=µ,-9=n,-12=p,-15=f,-18=a,-21=z,-24=y,-27=r,-30=q', {
		key_is_number : true
	}),
	// 數量級
	exponent_of = exponent_to_prefix.clone().reverse({
		key_is_number : true
	}),
	//
	prefix_pattern = new RegExp('^\\s*(' + exponent_of.pattern({
		get_normal_keys : true
	}).join('|') + ')([^\\s]+)$'),

	// prefix name. prefix_name.pair_Map.get('M') === 'mega'.
	prefix_name = new library_namespace.data.Convert_Pairs(
	//
	'Q=quetta,R=ronna,Y=yotta,Z=zetta,E=exa,P=peta,'
	//
	+ 'T=tera,G=giga,M=mega,k=kilo,h=hecto,da=deca,'
	//
	+ 'd=deci,c=centi,m=milli,µ=micro,n=nano,p=pico,'
	//
	+ 'f=femto,a=atto,z=zepto,y=yocto,r=ronto,q=quecto');

	// ---------------------------------------------------------------------//
	// 初始調整並規範基本常數。

	// ---------------------------------------------------------------------//
	// private 工具函數。

	// Prefixes may not be used in combination.
	function parse_prefix(unit) {
		library_namespace.debug('parse_prefix(' + unit + ')', 3);
		var matched = String(unit).match(prefix_pattern);
		// [ unit symbol, prefix exponent ]
		return matched ? [ matched[2], exponent_of.pair_Map.get(matched[1]) ]
				: [ unit, 0 ];
	}

	// 度量衡單位 : 數量級 (prefix exponent / integer powers of 10)
	// 度量衡單位 : [ 數量級, 單位數量級 (unit power) ]
	// e.g., m : 0 → m
	// e.g., m : 3 → km
	// e.g., m : [ , 2 ] → m^2
	// e.g., m : [ 3 , 2 ] → km^2
	function multiple_unit(quantity, unit_symbol, prefix_exponent, unit_power) {

		if (unit_power === '' || isNaN(unit_power))
			unit_power = 1;

		var units = quantity.units;
		if (!units)
			quantity.units = units = Object.create(null);

		if (unit_symbol in units) {
			var array = units[unit_symbol];
			if (!Array.isArray(array))
				// assert: !isNaN(units[unit_symbol])
				units[unit_symbol] = array = [ array, 1 ];
			// 若是 Array，則使用原 Array。

			if (prefix_exponent !== array[0]) {
				// km^3 * cm^-2
				// = 10^(3*3 - (-2)*2) m^(3 + -2)
				// = 10^13 m
				// = 10 Tm
				prefix_exponent = array[0] * array[1] + unit_power
						* (prefix_exponent || 0);
				array[1] += unit_power;
				// The "non-three" prefixes (hecto-, deca-, deci-, and
				// centi-) are however more commonly used for everyday
				// purposes than in science.
				if (array[0] = prefix_exponent / 3 / array[1] | 0)
					prefix_exponent -= 3 * array[0] * array[1];
				// assert: Math.abs(prefix_exponent) = 0, 1, 2

				// 微調：盡量取到不會 overflow 或 underflow 的 prefix。
				if (prefix_exponent < 0) {
					if (Math.abs(quantity.amount) < 1)
						array[0]--, prefix_exponent += 3;

				} else if (prefix_exponent > 0
						&& Math.abs(quantity.amount) > 1e6
						&& quantity.amount % 10 === 0)
					array[0]++, prefix_exponent -= 3;

				// 把剩餘乘進 quantity.amount。
				if (prefix_exponent)
					quantity.amount *= Math.pow(10, prefix_exponent);
				array[0] *= 3;

			} else
				// e.g., km * km = km^2
				array[1] += unit_power;

			if (!array[1])
				delete units[unit_symbol];
			else if (array[1] === 1)
				units[unit_symbol] = array[0];

		} else
			units[unit_symbol] = unit_power !== 1 ? [ prefix_exponent,
					unit_power ] : prefix_exponent;

		return units;
	}

	function parse_unit(unit, quantity, is_division) {
		library_namespace.debug('parse_unit(' + unit + ')', 2);
		if (library_namespace.is_Object(unit))
			return unit;

		var matched = String(unit).match(/([^\/]*)\/([^\/]+)/);
		if (matched) {
			return Object.assign(parse_unit(matched[1], quantity), parse_unit(
					matched[2], quantity, true));
		}

		is_division = is_division ? -1 : 1;
		// var units = Object.create(null);
		// reset pattern
		PATTERN_UNIT.lastIndex = 0;
		while (matched = PATTERN_UNIT.exec(unit)) {
			library_namespace.debug('parse_unit: [' + matched + ']', 3);
			if (matched[4])
				matched[2] = matched[4].length > 1 ? (matched[4].charAt(0) === '⁻' ? 1
						: -1)
						* SUPERSCRIPT_NUMBER.indexOf(matched[4].charAt(1))
						: SUPERSCRIPT_NUMBER.indexOf(matched[4]);
			// return [ unit symbol, prefix exponent ]
			matched[1] = parse_prefix(normalize_name(matched[1]));
			multiple_unit(quantity, matched[1][0], matched[1][1], matched[3]
					|| matched[2]);
		}

		return quantity.units;
	}

	function unit_to_String(unit_symbol, prefix_exponent, unit_power) {
		if (Array.isArray(prefix_exponent)
		// 處理 [ 數量級, 單位數量級 (unit power) ]
		&& unit_power === undefined) {
			unit_power = prefix_exponent[1];
			prefix_exponent = prefix_exponent[0];
		}

		var unit = (prefix_exponent ?
		//
		exponent_to_prefix.pair_Map.get(+prefix_exponent)
				|| ('10^' + prefix_exponent) : '')
				+ unit_symbol;
		if (unit_power) {
			if (unit_power < 0)
				unit += '⁻', unit_power = -unit_power;
			unit += SUPERSCRIPT_NUMBER[unit_power];
		}

		return unit;
	}

	var unit_name_all, unit_name = {

		// 繁體中文
		'cmn-Hant-TW' : {
			公里 : 'km',
			公尺 : 'm',
			公分 : 'cm',
			厘米 : 'cm',
			公釐 : 'mm',
			毫米 : 'mm'
		},

		// https://zh.wikipedia.org/wiki/%E5%B8%82%E5%88%B6
		'市制' : {
			市尺 : '1/3m'
		},

		// https://zh.wikipedia.org/wiki/%E5%8F%B0%E5%88%B6
		'臺制' : {
			臺尺 : '10/33m'
		},

		// 英制單位
		'imperial' : {},

		// default, 公制
		'' : {
			'㎝' : 'cm',
			'㎠' : 'cm^2',
			'㎤' : 'cm^3',

			'㎜' : 'mm',
			'㎟' : 'mm^2',
			'㎣' : 'mm^3'
		}
	};

	// normalize unit name
	function normalize_name(unit, locale) {
		var matched = unit.match(/^([平立])方(.+)$/),
		//
		prefix_exponent, unit_power;

		if (matched) {
			unit_power = matched[1] === '平' ? 2 : 3;
			unit = matched[2];
		}

		if (!unit_name_all) {
			// initialization.
			unit_name_all = Object.create(null);
			for ( var l in unit_name)
				Object.assign(unit_name_all, unit_name[l]);
		}

		// TODO
		if (false)
			if (unit in unit_name_all)
				return [ unit_name_all[unit],
				//
				prefix_exponent, unit_power ];

		if (unit in unit_name_all)
			return unit_name_all[unit];

		return unit;
	}

	// ---------------------------------------------------------------------//
	// 定義基本常數。

	function Quantity(amount, units, options) {
		if (!units && isNaN(amount)) {
			units = String(amount)
			// 先期處理。
			.replace(/^\s*[〇一二三四五六七八九十百千萬億兆]+/,
			//
			library_namespace.from_Chinese_numeral);

			// e.g., new Quantity('2m', null, { type : 'length' })
			if (units = units.match(PATTERN_QUANTITY)) {
				amount = units[1];
				units = units[2];
			}
		}

		// 數值/量值的大小 / number / amount/count of base unit /
		// numerical value / factor
		// {Number} or [{Number}積]
		if (typeof amount === 'string' && !isNaN(amount))
			amount = +amount;
		this.amount = amount;

		// unit symbol
		this.units = parse_unit(units, this);

		if (options) {
			// 度量衡單位分類 type. e.g., 'length' (長度)
			if (options.type)
				this.type = options.type;

			// 有效數字/the appropriate number of significant
			// figures
			if ('significant_figures' in options)
				this.significant_figures
				//
				= options.significant_figures | 0;
		}
	}

	// 數值單位換算。
	function convert_to(units) {
		;
	}

	function multiple(quantity) {
		if (quantity)
			if (isNaN(quantity)) {
				if (quantity.constructor !== Quantity)
					quantity = new Quantity(quantity);
				this.amount *= quantity.amount;
				var units = quantity.units;
				for ( var unit in units)
					multiple_unit(this, unit, units[unit]);
			} else
				this.amount *= quantity;
		else
			this.amount = 0;
		return this;
	}

	// https://en.wikipedia.org/wiki/International_System_of_Units#Unit_symbols_and_the_values_of_quantities
	// The value of a quantity is written as a number followed
	// by a space
	// (representing a multiplication sign) and a unit symbol
	function to_String(locale) {
		var result = [], units = this.units;
		for ( var unit in units)
			result.push(unit_to_String(unit, units[unit]));
		// intervening space ' ', dot operator '⋅'.
		return this.amount + ' ' + result.join('⋅');
	}

	// http://en.wikipedia.org/wiki/SI_base_unit
	// http://en.wikipedia.org/wiki/International_System_of_Units#Units_and_prefixes
	// http://en.wikipedia.org/wiki/List_of_thermodynamic_properties
	// Quantity.type_of('m')==='length';
	function type_of(unit) {
		;
	}

	function name_of(unit, locale) {
		;
	}

	// Quantity.multiple(Quantity, Quantity);

	function parse_factor() {
		;
	}

	// 同一個物理量的兩種不同的單位之間，是靠著轉換因子（conversion
	// factor）從一個單位轉換到另一個單位。例如，1 in = 2.54
	// cm，注意到在這裡「2.54 cm/in」是轉換因子，不具有因次，其數值等於1。
	parse_factor('min=60s,hr=60min,a=100m2,Newton=kg*m/s2');

	// 常數/constants/factors
	var constants = {
		PI : Math.PI,
		c : 299792458
	};

	// ---------------------------------------------------------------------//
	// 應用功能。

	// ---------------------------------------------------------------------//
	// 網頁應用功能。

	// ---------------------------------------------------------------------//
	// export.

	library_namespace.set_method(Quantity, {
		type_of : type_of,
		name_of : name_of,
		parse_factor : parse_factor,
		constants : constants
	});

	library_namespace.set_method(Quantity.prototype, {
		convert_to : convert_to,
		multiple : multiple
	});
	Quantity.prototype.toString = to_String;

	return (Quantity// JSDT:_module_
	);
}
