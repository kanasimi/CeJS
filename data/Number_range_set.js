/**
 * @name CeL data.Number_range_set function
 * @fileoverview 本檔案包含了 data.Number_range_set 處理的 functions。
 * 
 * @since 2022/6/23 10:7:53
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

typeof CeL === 'function' && CeL.run({
	// module name
	name : 'data.Number_range_set',

	require : 'data.code.compatibility.|data.native.',

	// 設定不匯出的子函式。
	// no_extend: '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring

	// ---------------------------------------------------------------------//

	/**
	 * 指定包括數字範圍的數字集合，並可測試指定數字是否在範圍集合內。
	 * 
	 * @param {String|Array}
	 *            range_set 數字範圍集合。
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項。
	 */
	function Number_range_set(range_set, options) {
		options = library_namespace.setup_options(options);

		// e.g., new CeL.Number_range_set(1)
		range_set = String(range_set).split(/[,;]/);

		if (options.using_real)
			this.using_real = true;

		this.number_Set = new Set;
		this.range_start_Map = new Map;

		if (Array.isArray(range_set)) {
			range_set.forEach(add_range, this);
		} else {
			library_namespace.error([ 'Number_range_set: ', {
				// gettext_config:{"id":"invalid-set-of-number-ranges-$1"}
				T : [ 'Invalid set of number ranges: %1', range_set ]
			} ]);
		}
	}

	function is_Number_range_set(value) {
		return value && value.constructor === Number_range_set;
	}

	Number_range_set.is_Number_range_set = is_Number_range_set;

	function Number_range_set_toString() {
		var value_list = Array.from(this.number_Set.values());
		for (var list = Array.from(this.range_start_Map.keys()), index = 0, length = list.length; index < length; index++) {
			var start = list[index];
			value_list.push(start + '–' + this.range_start_Map.get(start));
		}
		return value_list.join(',');
	}

	Number_range_set.prototype.toString = Number_range_set_toString;

	/**
	 * 添加數字範圍。
	 * 
	 * @param {String}
	 *            range 數字範圍。
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項。
	 * @returns
	 */
	function add_range(range, options) {
		if (library_namespace.is_digits(range)) {
			range = +range;
			// if (!is_in_the_range(range))
			this.number_Set.add(range);
			return;
		}

		// @see CeL.date.parse_period.PATTERN
		var matched = range.trim().split(/^(\d*)\s*[\-–~－—─～〜﹣至]\s*(\d*)$/);
		if (matched) {
			var lower = matched[1] ? +matched[1] : -Infinity;
			var upper = matched[2] ? +matched[2] : Infinity;
			if (upper < lower) {
				var tmp = upper;
				upper = lower;
				lower = tmp;
			}
			if (isNaN(lower))
				lower = -Infinity;
			if (isNaN(upper))
				upper = Infinity;
			if (lower === upper
					|| !this.using_real
					&& upper - lower < (options && options.max_split_size || 100)) {
				for (var number = lower; number <= upper; number++) {
					this.number_Set.add(number);
				}
			} else if (!this.range_start_Map.has(lower)
					|| this.range_start_Map.get(lower) < upper) {
				// TODO: 最佳化，剔除重複的範圍。
				this.range_start_Map.set(lower, upper);
				delete this.range_start_sorted;
			}
			return;
		}

		library_namespace.error([ 'add_range: ', {
			// gettext_config:{"id":"invalid-number-range-$1"}
			T : [ 'Invalid number range: %1', range ]
		} ]);
	}

	/**
	 * 測試指定數字是否在範圍集合內。
	 * 
	 * @param {Number}
	 *            number 指定數字
	 * @returns {Boolean} 指定數字在範圍集合內。
	 */
	function is_in_the_range(number) {
		number = +number;
		if (this.number_Set.has(number) || this.range_start_Map.has(number))
			return true;

		if (!this.range_start_sorted) {
			this.range_start_sorted = Array.from(this.range_start_Map.keys())
					.sort();
		}

		var lower = this.range_start_sorted.search_sorted(number, {
			near : true
		});
		lower = this.range_start_sorted[lower];
		if (number < lower)
			return false;
		var upper = this.range_start_Map.get(lower);
		return number <= upper;
	}

	library_namespace.set_method(Number_range_set.prototype, {
		add_range : add_range,
		is_in_the_range : is_in_the_range
	});

	return Number_range_set;
}
