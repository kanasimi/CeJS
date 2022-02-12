/**
 * @name CeL data.Convert_Pairs function
 * @fileoverview 本檔案包含了 data.Convert_Pairs 處理的 functions。
 * 
 * TODO: Should use Map()
 * 
 * @since 2022/2/10 8:43:7
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

typeof CeL === 'function' && CeL.run({
	// module name
	name : 'data.Convert_Pairs',

	require : 'data.|data.code.compatibility.|data.native.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring

	// ---------------------------------------------------------------------//
	// see data.native.String_to_RegExp
	/**
	 * 主要目的：解析文字 source 成 Object，以及用來作 convert。
	 * 
	 * TODO:<br />
	 * 整合 application.OS.Windows.file.cacher
	 * 
	 * @example <code>

	 // example 1
	 var conversion_pair = new CeL.data.Convert_Pairs(CeL.get_file(path));
	 text = conversion_pair.convert(text);


	 // example 2
	 CeL.run([ 'data.file', 'application.OS.Windows.file' ]);
	 var cache_file = 'work.codes/get_work_information.cache.txt', cache_pair,
	 // target encoding
	 target_encoding = 'UTF-8';

	 cache_pair = new CeL.data.Convert_Pairs(null, {
		path : cache_file,
		encoding : target_encoding,
		remove_comments : true
	 });

	 cache_pair.add([ [ 'key 1', 'value 1' ] ]);

	 CeL.log(cache_pair.select('key 1'));

	 cache_pair.save_new();

	 * </code>
	 * 
	 * @param {Object|Array}source
	 * @param {Object}options
	 */
	function Convert_Pairs(source, options) {
		if (!is_Convert_Pairs(this)) {
			library_namespace
					.warn('Convert_Pairs: Please use (pair = new Convert_Pairs()) instead of (pair = Convert_Pairs())!');
			return new Convert_Pairs(source, options);
		}

		// 前置處理。
		options = library_namespace.setup_options(options);

		var _this = this;
		function copy_properties_from_options() {
			// 單一 instance 僅能設定一個 replace_flags。
			// Convert_Pairs.prototype.add() 不設定 this.flags。
			[ 'flags', 'may_remove_pair_Map' ].forEach(function(property) {
				if (options[property]) {
					_this[property] = options[property];
				}
			});
		}

		if (is_Convert_Pairs(source)) {
			// is_clone
			// library_namespace.is_Object(source) @ Firefox
			// assert: library_namespace.is_Object(source.pair);
			// assert: Array.isArray(source.keys);
			Object.assign(this, source);
			this.pair_Map = new Map(source.pair_Map);
			copy_properties_from_options();
		} else {
			copy_properties_from_options();
			// Warning: 手動設定 this.pair_Map 非常危險!
			// initialization.
			this.pair_Map = new Map;
			if (source)
				this.add(source, options);
		}

		if (options.path) {
			this.add_path(options);
		}
	}

	// if the value is instance of Convert_Pairs
	function is_Convert_Pairs(value) {
		return value && value.constructor === Convert_Pairs;
	}

	library_namespace.set_method(Convert_Pairs, {
		is_Convert_Pairs : is_Convert_Pairs,

		KEY_REMOVE : typeof Symbol === 'function' ? Symbol('remove the key')
				: {
					KEY_REMOVE : true
				},

		// 排除/移除注解 (//, /* */)。
		/**
		 * strip/remove javascript comments.
		 * CeL.data.Convert_Pairs.remove_comments(text)
		 * 
		 * @see http://vrana.github.io/JsShrink/
		 * @see http://trinithis.awardspace.com/commentStripper/stripper.html
		 * @see http://upshots.org/javascript/javascript-regexp-to-remove-comments
		 * @see http://marijnhaverbeke.nl//uglifyjs
		 */
		remove_comments : function(text) {
			// 僅作最簡單之處理，未考量: "// .. /*", "// .. */", "// /* .. */",
			// 以及 RegExp, "", '' 中注解的情況!
			return String(text).replace(/\/\*[\s\S]*?\*\//g, '').replace(
					/\/\/[^\r\n]*/g, '');

			// text.replace(/<!--[\s\S]*?-->/g, '');

			// TODO: /^#/
		}
	});

	// ----------------------------------------------------------------------------------

	function Convert_Pairs__get_value(key) {
		return this.pair_Map.get(key);
	}

	function Convert_Pairs__add(source, options) {
		// 前置處理。
		options = library_namespace.setup_options(options);

		var pair_Map = this.pair_Map;

		if (library_namespace.is_Object(source)) {
			for ( var key in source) {
				if (value === Convert_Pairs.KEY_REMOVE)
					pair_Map['delete'](key, source[key]);
				else
					pair_Map.set(key, source[key]);
			}
			delete this.special_keys_Map;
			return this;
		}

		if (typeof source === 'string') {
			if (options.remove_comments)
				source = Convert_Pairs.remove_comments(source);
			// console.trace([ source ]);
			if (!source.trim())
				return;
			// 順便正規化。
			var separator = options.field_separator
			//
			|| this.field_separator;
			if (!separator) {
				// 偵測是 key=value,key=value，
				// 或 key \t value \n key \t value
				if (/[\r\n]/.test(source))
					separator = /[\r\n]+/;
				else if (separator = source.match(/[,;|]/))
					separator = separator[0];
				if (separator)
					library_namespace.debug('Use field separator: ['
							+ separator + ']', 2, 'Convert_Pairs.add');
			}
			if (separator)
				source = source.split(separator);
			else {
				library_namespace
						.warn('Convert_Pairs.add: Can not determine the field separator! '
								+ source);
				source = [ source ];
			}
		}

		if (!Array.isArray(source) || source.length === 0) {
			return this;
		}

		// --------------------------------------------------------------------

		var length = source.length,
		// options: 僅納入 key 與 value 不同之 pair。
		no_the_same_key_value = options.no_the_same_key_value,
		// key / value 分隔符號。
		separator = options.separator || this.separator,
		//
		key_is_number = options.key_is_number,
		//
		value_is_number = options.value_is_number,
		//
		item_processor = typeof options.item_processor === 'function'
				&& options.item_processor;

		if (!separator && typeof source[0] === 'string') {
			// 遍歷 source 以偵測是 key=value,key=value，
			// 或 key \t value \n key \t value
			for (var i = 0; i < length; i++) {
				if (typeof source[i] === 'string'
						&& (separator = source[i].match(/[^\n]([\t=])[^\n]/))) {
					separator = separator[1];
					library_namespace.debug('Use assignment sign: '
							+ new RegExp(separator), 3, 'Convert_Pairs.add');
					break;
				}
			}
			if (!separator) {
				// console.trace(source);
				throw new Error(
						'Convert_Pairs.add: No assignment sign detected! 請手動指定！');
			}
		}

		library_namespace.debug('Add ' + source.length + ' pairs...', 3,
				'Convert_Pairs.add');
		source.forEach(function(item) {
			if (item_processor) {
				item = item_processor(/* {String} */item, options);
			}
			if (!item)
				return;

			if (false && typeof item === 'string' && !item.trim()) {
				console.log(item.charCodeAt(0));
				console.trace(JSON.stringify(item));
			}
			if (typeof item === 'string')
				item = item.split(separator);
			var key = item[0], value = item[1];
			if (!key) {
				return;
			}

			library_namespace.debug('adding [' + key + '] → ['
			// Cannot convert a Symbol value to a string
			+ String(value) + ']', source.length > 200 ? 3 : 2,
					'Convert_Pairs.add');
			if (key === value) {
				library_namespace.debug('key 與 value 相同，項目沒有改變：[' + key + ']');
				if (no_the_same_key_value
				// 長度為1的沒有轉換必要。
				|| no_the_same_key_value !== false && key.length === 1) {
					return;
				}
				// 可能是為了確保不被改變而設定。
			}

			if (value === Convert_Pairs.KEY_REMOVE) {
				library_namespace.debug('Remove [' + key + ']: '
						+ pair_Map[key], 0, 'Convert_Pairs.add');
				// if (pair_Map.has(key)) { }
				pair_Map['delete'](key);
				return;
			}

			if (key_is_number && !isNaN(key))
				key = +key;
			if (value_is_number && !isNaN(value))
				value = +value;

			if (false && pair_Map.has(key)) {
				if (value === pair_Map.get(key))
					return;
				// 後來的會覆蓋前面的。
				library_namespace.warn('Convert_Pairs.add: Duplicated key ['
						+ key + '], value will be changed: [' + pair_Map[key]
						+ '] → [' + String(value) + ']');
			}
			pair_Map.set(key, value);
		});

		delete this.special_keys_Map;
		return this;
	}

	function Convert_Pairs__remove(key_hash, options) {
		if (!key_hash)
			return this;

		if (typeof key_hash === 'string')
			key_hash = [ key_hash ];

		if (Array.isArray(key_hash)) {
			var tmp = key_hash;
			key_hash = Object.create(null);
			for (var i = 0; i < tmp.length; i++)
				key_hash[tmp[i]] = null;
		}

		var remove_matched_path = options && options.remove_matched_path;
		var pair_Map = this.pair_Map, path = this.path, changed;
		// console.trace(path);
		for ( var search_key in key_hash) {
			// key_hash[key]: ignore path
			if (key_hash[search_key] === path) {
				if (remove_matched_path)
					delete key_hash[search_key];
				continue;
			}

			var pattern = search_key.match(library_namespace.PATTERN_RegExp);
			if (pattern) {
				pattern = new RegExp(pattern[1], pattern[2] || this.flags);
				library_namespace.debug('Remove pattern: ' + pattern + ' of '
						+ path, 1);
				pair_Map.forEach(function(value, key) {
					if (!pattern.test(key) && !pattern.test(value))
						return;

					library_namespace.debug(path + '\tRemove ' + key
					//
					+ ' → ' + value, 2);
					pair_Map['delete'](key);
				});

			} else {
				pair_Map['delete'](search_key);
			}
			changed = true;
		}

		if (changed)
			delete this.special_keys_Map;
		return this;
	}

	// add the content of file path
	function Convert_Pairs__add_path(options) {
		// console.trace(options);
		// 前置處理。
		options = library_namespace.setup_options(options);

		var path = options.path;
		if (Array.isArray(path)) {
			if (path.length < 2) {
				path = path[0];
			} else {
				path.forEach(function(file_path) {
					var _options = library_namespace.new_options(options);
					if (library_namespace.is_Object(file_path)) {
						// e.g., for .remove_comments
						Object.assign(_options, file_path);
						file_path = file_path.file_path || file_path.path;
					}

					_options.path = file_path;
					this.add_path(_options);
				}, this);
				return this;
			}
		}

		// assert: typeof path === 'string'
		// `path` is file path
		if (!path || typeof options.file_filter === 'function'
				&& !options.file_filter(path)) {
			return this;
		}

		var source;
		try {
			// 注意:此方法不可跨 domain!
			source = library_namespace.get_file(path);
		} catch (e) {
			// TODO: handle exception
		}

		if (source) {
			this.path = path;
			// 載入 resources。
			this.add(source, options);
		} else {
			library_namespace
					.warn('Convert_Pairs.add_path: Can not get contents of ['
							+ path + ']!');
		}
		return this;
	}

	function Convert_Pairs__save(path, encoding, save_new) {
		if (!library_namespace.write_file)
			throw new Error('Please include CeL.application.storage first!');

		if (path !== this.path) {
			path = this.path;
		} else if (!save_new && this.remove_comments) {
			library_namespace.warn('移除注解後再存檔，會失去原先的注解！請考慮設定 save_new flag。');
		}

		if (!encoding) {
			encoding = library_namespace.guess_encoding
					&& library_namespace.guess_encoding(path)
					|| library_namespace.open_format.TristateTrue;
		}
		library_namespace.debug([ '(' + encoding, ') [', path, ']' ], 2,
				'Convert_Pairs.save');

		var pair_Map = this.pair_Map;
		if (pair_Map.size > 0) {
			var line, data = [], separator = this.separator || '\t';
			pair_Map.forEach(function(pair) {
				var value = pair[1];
				if (Array.isArray(value))
					value = value.join(separator);
				data.push(pair[0] + separator + value);
			})

			library_namespace.debug([ save_new ? 'Appending ' : 'Writing ',
					data.length, ' data to (' + encoding, ') [', path, ']' ],
					2, 'Convert_Pairs.save');
			library_namespace.debug(data.join('<br />'), 3,
					'Convert_Pairs.save');
			library_namespace.write_file(path,
			//
			data.join(this.field_separator
					|| library_namespace.env.line_separator), encoding,
			//
			save_new ? library_namespace.IO_mode.ForAppending : undefined);
		}

		library_namespace.log([ data.length, ' new records saved. [', {
			// 重新紀錄.
			a : 'save again',
			href : '#',
			onclick : function() {
				this.save(path, encoding, save_new);
				return false;
			}.bind(this)
		}, ']' ]);

		return this;
	}

	function Convert_Pairs__save_new(path, encoding) {
		return this.save(path, encoding, true);
	}

	// re-generate pattern, this.get_sorted_keys()
	function Convert_Pairs__pattern(options) {
		// 前置處理。
		options = library_namespace.setup_options(options);

		var normal_keys = [], flags = options.flags || this.flags,
		// 若 key 為 RegExp 之 source 時，.length 不代表可能 match 之長度。
		// e.g., '([\d〇一二三四五六七八九])米'
		// 因此特殊 keys 必須放在 special_keys_Map。
		special_keys_Map = this.special_keys_Map = new Map,
		//
		pair_Map = this.pair_Map;
		pair_Map.forEach(function(value, key) {
			if (!/[.(){}+*?\[\]\|\\\/]/.test(key)) {
				normal_keys.push(key);
				return;
			}

			try {
				special_keys_Map.set(key, [ new RegExp(key, flags), value ]);
			} catch (e) {
				library_namespace.error('Convert_Pairs__pattern: '
				// Error key?
				+ '[' + key + '] → ['
				// Cannot convert a Symbol value to a string
				+ String(value) + ']: ' + e.message);

				// normal_keys.push(key);
			}
		});

		normal_keys.sort(this.comparator);

		// reset
		delete this.pair_Map_by_length;
		delete this.convert_pattern;

		if (normal_keys.length === 0) {
			;

		} else if (options.generate_pair_Map_by_length) {
			var pair_Map_by_length = this.pair_Map_by_length = [];
			normal_keys.forEach(function(key) {
				var length = key.length;
				var map = pair_Map_by_length[length];
				if (!map)
					map = pair_Map_by_length[length] = new Map;
				map.set(key, pair_Map.get(key));
			});

		} else {
			try {
				this.convert_pattern = new RegExp(
						normal_keys.join('|') || '^$', flags);
			} catch (e) {
				// @IE，當 keys 太多太長時，
				// 若是使用 new RegExp(keys.join('|'), 'g') 的方法，
				// 可能出現 "記憶體不足" 之問題。
			}
		}
		// console.log(this.convert_pattern);

		if (options.get_normal_keys)
			return normal_keys;

		return this.convert_pattern;
	}

	function Convert_Pairs__for_each(operator, options) {
		this.pair_Map.forEach(function(value, key) {
			operator(key, value);
		});
		return this;
	}

	// select the first fitted
	function Convert_Pairs__select(selector, options) {
		var pair_Map = this.pair_Map;

		if (typeof selector !== 'function') {
			var target = selector || options && options.target;
			if (!target)
				return;

			library_namespace.debug('target: ' + target + ', options: '
					+ options, 3);
			if (options === true)
				return pair_Map.get(target);

			if (library_namespace.is_RegExp(target)) {
				selector = function(key, value) {
					return target.test(key) && value;
				};
			} else {
				var replace_flags = this.flags;
				selector = function(key, value) {
					var pattern;
					try {
						pattern = typeof replace_flags === 'function'
						//
						? replace_flags(key)
						//
						: new RegExp(key, replace_flags);
					} catch (e) {
						// Error key?
						library_namespace.error('Convert_Pairs.select: key '
								+ (pattern || '[' + key + ']') + ': '
								+ e.message);
					}
					return pattern.test(target) && value;
				};
			}
		}

		// TODO: use `for (const key of this.pair_Map.keys())`
		for (var keys = Array.from(pair_Map.keys()), index = 0; index < keys.length; index++) {
			var key = keys[index], value = selector(key, pair_Map.get(key));
			if (value)
				return value;
		}
	}

	function convert_using_pair_Map_by_length(text) {
		var pair_Map_by_length = this.pair_Map_by_length, max_key_length = pair_Map_by_length.length,
		// TODO: test if use converted_text = '' and converted_text += ''
		converted_text = [];

		// @see
		// https://github.com/tongwentang/tongwen-core/blob/master/src/converter/map/convert-phrase.ts
		for (var index = 0, length = text.length; index < length;) {
			var this_slice = text.slice(index, Math.min(length, index
					+ max_key_length));

			while (true) {
				var this_slice_length = this_slice.length;
				var map = pair_Map_by_length[this_slice_length];
				if (map && map.has(this_slice)) {
					if (false) {
						library_namespace.info(this_slice + '→'
								+ map.get(this_slice));
					}
					converted_text.push(map.get(this_slice));
					break;
				}

				if (this_slice_length === 1) {
					// Nothing matched.
					converted_text.push(this_slice);
					break;
				}

				// 長先短後 詞先字後
				this_slice = this_slice.slice(0, -1);
			}

			index += this_slice_length;
		}

		// console.trace(converted_text);
		return converted_text.join('');
	}

	var using_pair_Map_by_length = true;
	function Convert_Pairs__convert(text) {
		text = String(text);
		if (false && this.pair_Map) {
			library_namespace.debug(
					'Convert ' + text.length + ' characters, using '
							+ this.pair_Map.size
							+ ' pairs with replace_flags ['
							+ this.replace_flags + '].', 3,
					'Convert_Pairs.convert');
		}

		if (!this.special_keys_Map) {
			this.pattern({
				flags : this.replace_flags,
				generate_pair_Map_by_length : using_pair_Map_by_length
			});
			if (this.may_remove_pair_Map) {
				library_namespace.debug('在開始轉換之後就不會再修改字典檔，因此可移除 .pair_Map。', 1,
						'Convert_Pairs.convert');
				delete this.pair_Map;
			}
		}
		// console.trace(this.convert_pattern);
		// console.trace(this.special_keys_Map);

		// 長先短後 詞先字後
		if (this.pair_Map_by_length) {
			// console.trace(text);
			text = convert_using_pair_Map_by_length.call(this, text);

		} else if (this.convert_pattern) {
			text = text.replace(this.convert_pattern, function(token) {
				// library_namespace.info(token + '→' + pair_Map.get(token));
				return pair_Map.get(token);
			});
		}

		this.special_keys_Map.forEach(function(value, key) {
			// var pattern = value[0], replace_to = value[1];
			text = text.replace(value[0], value[1]);
		});

		return text;
	}

	// reverse conversion, 改成 value → key
	function Convert_Pairs__reverse(options) {
		// 前置處理。
		options = library_namespace.new_options(options);
		options.ignore_null_value = true;

		this.pair_Map = this.pair_Map.reverse_key_value(options);

		delete this.special_keys_Map;
		return this;
	}

	function Convert_Pairs__clone(options) {
		return new Convert_Pairs(this, options);
	}

	function Convert_Pairs__to_Object(source) {
		var object = Object.create(null);
		this.pair_Map.forEach(function(value, key) {
			object[key] = value;
		});
		return object;
	}

	function Convert_Pairs__comparator(key_1, key_2) {
		// 排序：長的 key 排前面。 long → short
		var diff = key_2.length - key_1.length;
		return diff !== 0 ? diff
		// assert: key_1 !== key_2
		: key_1 < key_2 ? -1 : 1;
	}

	library_namespace.set_method(Convert_Pairs.prototype, {
		get_value : Convert_Pairs__get_value,
		add : Convert_Pairs__add,
		remove : Convert_Pairs__remove,
		add_path : Convert_Pairs__add_path,
		save : Convert_Pairs__save,
		save_new : Convert_Pairs__save_new,
		pattern : Convert_Pairs__pattern,
		// for each pair
		for_each : Convert_Pairs__for_each,
		select : Convert_Pairs__select,
		// convert from key to value.
		convert : Convert_Pairs__convert,
		reverse : Convert_Pairs__reverse,
		clone : Convert_Pairs__clone,
		to_Object : Convert_Pairs__to_Object,

		comparator : Convert_Pairs__comparator,

		/**
		 * {String} key-value 分隔符號.
		 */
		// separator : '\t',
		/**
		 * {String} 欄位分隔符號.
		 */
		// field_separator : /[\r\n]+/,
		/** default RegExp replace flags: global match, or 'ig' */
		flags : 'g'
	});

	return Convert_Pairs;
}
