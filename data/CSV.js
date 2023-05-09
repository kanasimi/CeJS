/**
 * @name CeL function for Comma-separated values (CSV) and tab-separated values
 *       (TSV) data
 * @fileoverview 本檔案包含了處理 CSV, TSV data 的 functions。 TODO: delimiter-separated
 *               values (DSV)
 * @since
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'data.CSV',

	// require : '',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// nothing required

	/**
	 * null module constructor
	 * 
	 * @class CSV data 的 functions
	 */
	var _// JSDT:_module_
	= function() {
		// null module constructor
	};

	/**
	 * for JSDT: 有 prototype 才會將之當作 Class
	 */
	_// JSDT:_module_
	.prototype = {};

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	/**
	 * default config/設定/選項/options/flag.
	 */
	var default_config = {
		/**
		 * {Boolean} is there a title line? (TODO: Should use has_header)
		 */
		has_title : false,
		/**
		 * {Boolean} 是否將 [0] 設定為第一筆資料。若為 true，則 [0] 為 title。
		 */
		skip_title : false,
		// data[title_word]=title row array
		title_word : 'title',
		// data[title_index_word]={title:column index}
		title_index_word : 'index',

		/**
		 * {Integer} 將每筆資料依 title column index 存成 Object。<br />
		 * 設定之後 table = {title_name: [row data]}
		 */
		to_Object : undefined,
		/**
		 * {Boolean} 如何存每筆資料。<br />
		 * select_column=true<br />
		 * 設定之後 data[row index] = {title_name: data}<br />
		 * TODO:<br />
		 * select_column=column_index<br />
		 * select_column=[column_index]<br />
		 * select_column={title_name:column_index}<br />
		 * select_column={title_index:column_index}<br />
		 */
		select_column : false,

		// table[row index][column index] 將以 handle_array[column index] 預先處理。
		handle_array : undefined,

		// 處理 every row。row = handle_row(row, row_count);
		handle_row : undefined,

		// bool|'auto'
		/**
		 * {Boolean} 是否使用 text delimiter。<br />
		 * for to_CSV_String()，表示是否強制加上 text delimiter。
		 */
		no_text_qualifier : 'auto',
		/**
		 * {String} 欄位文字辨識符號。<br />
		 * Excel 之 Unicode 文字輸出不包括 "'"。<br />
		 * //text_qualifier : '"\'',
		 */
		text_qualifier : '"',
		/**
		 * {String} 欄位分隔符號。<br />
		 * adding ';:\\s'
		 */
		field_delimiter : '\t,',
		/**
		 * {String} row delimiter (row 分隔符號) / record delimiters: usually only
		 * \n.<br />
		 * '\r' will be replaced to '\n' and will ignored!
		 */
		line_separator : '\n',

		/**
		 * {Number} 僅取首起之筆數
		 */
		row_limit : undefined
	};

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	/**
	 * parse Comma-separated values/Delimiter-separated values data.<br />
	 * 讀入 CSV 檔。<br />
	 * TODO:<br />
	 * mix data. e.g., [data 1, data 2, "data 3", data 4]<br />
	 * 可一筆一筆處理，不佔記憶體。<br />
	 * DoEvents
	 * 
	 * @param {String}data
	 *            CSV text data
	 * @param {Object}config
	 *            自訂設定/選項。 see parse_CSV.config.
	 * 
	 * @return {Array} data array = [<br />
	 *         [R1F1,R1F2,... ],<br />
	 *         [R2F1,R2F2,... ],<br />
	 *         ... ]
	 * 
	 * @_memberOf _module_
	 * 
	 * @example <code>

	 //	to use:
	 CeL.run('data.CSV',function(){ 'code' ;});
	 var data=parse_CSV('data');
	 //data[_line_][_field_]

	 //	there's a title line:
	 var data = parse_CSV('data',{has_title:true});
	 //data[_line_][data.t[_title_]]

	 //	then:
	 data[title_word]	=	{title_field_name : field number of title};
	 data.title_array	=	[title_field_name];
	 data.it	=	ignored title array
	 data[num]	=	the num-th line (num: 0,1,2,..)

	 // More examples: see /_test suite/test.js

	 * </code>
	 * 
	 * @see <a href="http://www.jsdb.org/" accessdate="2010/1/1 0:53">JSDB:
	 *      JavaScript for databases</a>,<br />
	 *      <a
	 *      href="http://hax.pie4.us/2009/05/lesson-of-regexp-50x-faster-with-just.html"
	 *      accessdate="2010/1/1 0:53">John Hax: A lesson of RegExp: 50x faster
	 *      with just one line patch</a>,<br />
	 *      http://misoproject.com/dataset/
	 * 
	 * @since 2012/4/2 15:26:06 重寫 parse_CSV()，功能加強。效能恐降低。
	 */
	function parse_CSV(data, config) {
		if (!data || !/[^\n]/.test(data = ('' + data).replace(/\r\n?/g, '\n')))
			return;

		var tmp, table = [], row = [], matched, value, max_column_count, min_column_count,
		// 自訂設定
		config = new library_namespace.setting_pair({}, parse_CSV.config,
				config),
		// cache
		data_length = data.length,

		to_Object = parseInt(config('to_Object')),

		// cache
		select_column = config('select_column'), title_row_for_Object,
		// cache
		title_row_for_Object_length, column_count = 0, title_passed,

		row_count = 0, row_limit = config('row_limit'),

		auto_text_qualifier, field_pattern = [ '(.*?)' ], text_qualifier = config('text_qualifier'), text_qualifier_replace_from, last_index_of_data = 0, handle_array = config('handle_array'), handle_row = config('handle_row'), has_title = config('has_title'), preserve_blank_row = config('preserve_blank_row'),
		// 設定 title.
		set_title = function(row) {
			if (has_title && row
			// && to_Object === undefined
			) {
				if (typeof config('title_word') === 'string') {
					table[config('title_word')] = row;
				}
				if (typeof config('title_index_word') === 'string') {
					var i, j = table[config('title_index_word')] = {};
					for (i in row) {
						j[row[i]] = +i;
					}
				}
			}
			set_title = undefined;
		};

		function add_row(row) {
			var use_row;
			// 包含 title 與末列(undefined)皆會被傳入。
			if (!handle_row
					|| (use_row = handle_row(row, row_count)) === undefined)
				use_row = row;

			if (title_passed || !has_title || !config('skip_title')) {
				if (isNaN(to_Object)) {
					// 去除空白列，包括檔尾。
					if (column_count > 0 || preserve_blank_row) {
						table.push(use_row);
						row_count++;
					} else if (library_namespace.is_debug()) {

						library_namespace.warn('parse_CSV: 空白列 @ record '
								+ row_count + '('
								+ library_namespace.is_type(row) + ')');
					}
				} else if (title_row_for_Object) {
					var column_index = title_row_for_Object[to_Object];
					if (column_index in row) {
						if (row[column_index] in table) {
							library_namespace
									.warn('parse_CSV: conflict record name: ['
											+ row[column_index] + '], index: '
											+ column_index);
						}
						table[row[column_index]] = use_row;
						row_count++;
					}
				} else if (to_Object in row) {
					table[row[to_Object]] = use_row;
					row_count++;
				}
			}
		}

		if (isNaN(row_limit))
			row_limit = undefined;

		if (isNaN(to_Object))
			to_Object = undefined;
		else {
			table = {};
			// 既然指定 to_Object，蘊含應當有 title。
			has_title = true;
			config('skip_title', true);
		}

		if (select_column !== undefined && select_column !== false) {
			library_namespace.debug('select_column: ' + select_column, 2,
					'parse_CSV');
			if (Array.isArray(select_column)) {
				title_row_for_Object = select_column;
				// cache
				title_row_for_Object_length = title_row_for_Object.length;
				row = {};
			} else {
				// 既然指定 select_column，蘊含應當有 title。
				has_title = true;
			}
		}

		if (!Array.isArray(handle_array)
				&& (!select_column || !library_namespace
						.is_Object(handle_array)))
			handle_array = undefined;
		library_namespace
				.debug('handle_array: ' + handle_array, 2, 'parse_CSV');

		if (typeof handle_row !== 'function')
			handle_row = undefined;

		if (typeof config('no_text_qualifier') === 'undefined') {
			if (matched = data.match(new RegExp('[^' + config('line_separator')
					+ ']+'))) {
				matched = matched[0];
				matched = (new RegExp('^[' + text_qualifier + ']'))
						.test(matched)
						&& (new RegExp('[' + text_qualifier + ']$'))
								.test(matched);
				library_namespace.debug('auto detect: '
						+ (matched ? 'using' : 'no') + ' text_qualifier.', 1,
						'parse_CSV');
				config('no_text_qualifier', !matched);
			}
		} else if (config('no_text_qualifier') === 'auto' && text_qualifier) {
			auto_text_qualifier = true;
		}

		// build field pattern
		if (!config('no_text_qualifier') && text_qualifier) {
			// e.g., /(.*?)["']((?:[^"']|["']{2})*)["'](?:[\t,]|([\n]))?/g .
			field_pattern.push(
			// ["']
			'[', text_qualifier, ']',
			// ((?:[^"']|["']{2})*)
			'((?:[^', text_qualifier, ']|[', text_qualifier, ']{2})*)',
			// ["']
			'[', text_qualifier, ']');
		} else if (auto_text_qualifier) {
			// 對**每個** column 都作偵測。
			// e.g.,
			// /(.*?)(?:["']((?:[^"']|["']{2})*)["']|[^\t,\n]*)(?:[\t,]|([\n]))?/g
			// .
			field_pattern.push('(?:',
			// ["']
			'[', text_qualifier, ']',
			// ((?:[^"']|["']{2})*)
			'((?:[^', text_qualifier, ']|[', text_qualifier, ']{2})*)',
			// ["']
			'[', text_qualifier, ']',
			// |: 無 text qualifier 的部分。
			'|',
			// 無 text qualifier 的部分。
			'(',
			// [^\t,\n]*
			'[^', config('field_delimiter'), config('line_separator'), ']*',
			// ending of 無 text qualifier 的部分。
			')',
			// ending
			')');
		} else {
			text_qualifier = '';
			// e.g., /(.*?)([^\t,\n]*)(?:[\t,]|([\n]))?/g .
			field_pattern.push(
			// 無 text qualifier 的部分。
			'(',
			// [^\t,\n]*
			'[^', config('field_delimiter'), config('line_separator'), ']*',
			// ending of 無 text qualifier 的部分。
			')');
		}
		field_pattern.push('(?:[', config('field_delimiter'), ']|([',
				config('line_separator'), ']))?');
		field_pattern = new RegExp(field_pattern.join(''), 'g');
		if (text_qualifier)
			// e.g., /(["']){2}/g
			text_qualifier_replace_from = new RegExp('([' + text_qualifier
					+ ']){2}', 'g');
		library_namespace.debug('use field pattern: ' + field_pattern, 2,
				'parse_CSV');

		// main loop
		while (last_index_of_data < data_length
				&& (matched = field_pattern.exec(data))) {
			last_index_of_data = field_pattern.lastIndex;
			// matched = [fill pattern, extra(error?), field data[, field data],
			// line separator]
			library_namespace.debug(last_index_of_data + '/' + data_length
					+ ' ' + row_count + '<br />' + matched.join('<br />→ '), 4,
					'parse_CSV');

			if (library_namespace.is_debug() && matched[1]) {
				// check if data is valid.
				library_namespace
						.warn('parse_CSV: Cannot parse data (無法辨識的資料): ['
								+ matched[1] + ']');
			}

			if (value = matched[2]) {
				if (text_qualifier)
					value = value.replace(text_qualifier_replace_from, '$1');
			} else if (auto_text_qualifier) {
				value = matched[3];
			}

			if (handle_array
					&& title_passed
					&& typeof (tmp = column_count in handle_array ? handle_array[column_count]
							: title_row_for_Object
									&& ((tmp = title_row_for_Object[column_count]) in handle_array)
									&& handle_array[tmp]) === 'function') {
				library_namespace.debug('handle_array(' + value + ')', 2,
						'parse_CSV');
				value = tmp.call(row, value);
			}

			if (title_row_for_Object) {
				if (column_count < title_row_for_Object_length)
					row[title_row_for_Object[column_count]] = value;
				library_namespace.debug('[' + (to_Object === undefined
				//
				|| column_count < to_Object ? row_count
				//
				: row[title_row_for_Object[to_Object]] + '(' + row_count + ')')
						+ '].' + title_row_for_Object[column_count] + ' = ['
						+ value + ']', 3, 'parse_CSV');
			} else {
				row.push(value);
				library_namespace.debug('[' + (to_Object === undefined
				//
				|| column_count < to_Object ? row_count
				//
				: row[to_Object] + '(' + row_count + ')') + '][' + column_count
						+ '] = [' + value + ']', 3, 'parse_CSV');
			}
			column_count++;

			if (matched[auto_text_qualifier ? 4 : 3]) {
				library_namespace.debug('已到行末。', 4, 'parse_CSV');
				if (title_passed) {
					library_namespace.debug('紀錄資料欄數 ' + column_count + '。', 4,
							'parse_CSV');
					if (max_column_count < column_count) {
						max_column_count = column_count;
					} else if (min_column_count > column_count) {
						min_column_count = column_count;
					}

				} else {
					library_namespace.debug('初始化資料欄數紀錄 ' + column_count + '。',
							4, 'parse_CSV');
					min_column_count = max_column_count = column_count;

					if (select_column && !title_row_for_Object) {
						set_title(title_row_for_Object = row);
						// cache
						title_row_for_Object_length = title_row_for_Object.length;
						library_namespace.debug(
								'title_row_for_Object_length = '
										+ title_row_for_Object_length, 3,
								'parse_CSV');
					}
				}

				if (row_limit && row_limit <= row_count)
					break;

				add_row(row);

				// 因為 add_row() 要用到 title_passed，因此這邊才設定。
				if (!title_passed)
					title_passed = row;

				column_count = 0;
				if (title_row_for_Object) {
					row = {};
				} else {
					row = [];
				}

			}
		}
		// add the last row
		add_row(row);

		if (library_namespace.is_debug() && last_index_of_data < data_length) {
			library_namespace
					.warn('parse_CSV: Cannot parse data (無法/尚未辨識的資料): ('
							+ (data_length - last_index_of_data) + ')<br />\n['
							+ data.slice(last_index_of_data) + ']');
		}
		if (library_namespace.is_debug()
				&& min_column_count !== max_column_count) {
			library_namespace.warn('parse_CSV: 資料欄數不同: range: '
					+ min_column_count + '－' + max_column_count);
		}

		if (set_title) {
			// TODO: 自動判別是否有 title。
			set_title(title_passed || row);
		}
		table.max_column_count = max_column_count;

		if (has_title) {
			Object.assign(table, {
				each : each_record,
				map_key : map_key,
				merge : merge_table
			});
		}

		return table;
	}

	parse_CSV.config = default_config;

	_// JSDT:_module_
	.parse_CSV = parse_CSV;

	/**
	 * @example <code>

	var table = CeL.parse_CSV('t1	t2' + 'v11	v12' + 'v21	v22', {
		has_title : true
	});

	table.each(function(get, record, index) {
		console.log(get('t2') + get('t1'));
	});
	// v12v11
	// v22v21

	console.log(table.map_key(function(get) {
		return get('t2') + get('t1');
	}, true));
	// table.key_to_index = {v12v11 : 1, v22v21 : 2};

	table.map_key(function key_mapper(get) { });
	table2.map_key(function key_mapper(get) { });
	table.merge_table(table2);


	 </code>
	 */

	// type : forEach, some, every, map, ...
	// processor(get_field_value, record, index)
	function each_record(processor, _this, type) {
		var table = this, table_index = this.index, is_set_value = type === true;
		return table
		//
		[!is_set_value && type || 'forEach'](function(record, index) {
			if (/* table.has_title && */index === 0)
				return type === 'every' ? true : undefined;

			return processor(is_set_value ? function set_field_value(title,
					value) {
				record[table_index[title]] = value;
			} : function get_field_value(title, allow_undefined) {
				var value = record[table_index[title]];
				return allow_undefined ? value : value || '';
			}, record, index);
		}, _this);
	}

	function map_key(key_mapper, using_index) {
		var key_to_record = {};
		this.each(function(get_field_value, record, index) {
			var key = key_mapper(get_field_value, record, index);
			if (key in key_to_record) {
				library_namespace.error('map_key: Duplicate key [' + key
						+ ']:\n' + key_to_record[key] + '\n→\n' + record);
			}

			// cache key
			record.key = key;
			// record.index = index;
			key_to_record[key] = using_index ? index : record;
		});

		this[using_index ? 'key_to_record' : 'key_to_index'] = key_to_record;
		return key_to_record;
	}

	// 依照欄位標題, key 合併兩資料表格. title_mapper 可選
	// title_mapper[ title of table ] = title of this_table
	function merge_table(table, title_mapper, merge_title_list) {
		var this_table = this;
		// assert: table.has_title && this_table.has_title
		if (!merge_title_list)
			merge_title_list = table.title;

		// merge_title_list: 僅合併這些標題
		merge_title_list.forEach(function(title) {
			if (!(title in this_table.index)) {
				this_table.index[title] = table.max_column_count;
				this_table.title[table.max_column_count++] = title;
			}
		});

		table.each(function(get_field_value, record, index) {
			var key = record.key;
			var this_record = this_table.key_to_record[key];
			merge_title_list.forEach(function(title) {
				var value = get_field_value(title, true);
				if (value === undefined)
					return;

				var this_index = this_table.index[title_mapper[title]]
						|| this_table.index[title],
				//
				old_value = this_record[this_index];
				if (old_value !== undefined && old_value !== value) {
					library_namespace.error('merge_table: "' + key + '"['
							+ title + ']: [' + old_value + '] → [' + value
							+ ']');
				}
				this_record[this_index] = value;
			});
		});
	}

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	/**
	 * 將 {Array|Object} 依設定轉成 CSV text。<br />
	 * 
	 * @example <code>

	 // More examples: see /_test suite/test.js

	 * </code>
	 * 
	 * @param {Array|Object}CSV_object
	 * @param {Object}config
	 *            自訂設定/選項。 see to_CSV_String.config.
	 * 
	 * @returns {String} CSV data
	 * 
	 * @see <a href="http://tools.ietf.org/html/rfc4180">Common Format and MIME
	 *      Type for Comma-Separated Values (CSV) Files</a>
	 * 
	 * @since 2012/4/3 18:26:06 重寫 to_CSV()，改名 to_CSV_String()，功能加強。效能恐降低。
	 */
	function to_CSV_String(CSV_object, config) {
		if (!CSV_object)
			return;

		var i, l,
		//
		CSV = [],
		// 自訂設定
		config = new library_namespace.setting_pair({}, to_CSV_String.config,
				config),
		//
		field_delimiter = config('field_delimiter'),
		//
		select_column = config('select_column'),
		//
		text_qualifier = config('text_qualifier'),
		// [, text_qualifier ]
		text_qualifier_replace_from = text_qualifier !== undefined
				&& new RegExp('([' + text_qualifier + '])', 'g'),
		//
		text_qualifier_replace_to = '$1$1',
		//
		text_qualifier_tester = text_qualifier !== undefined
				&& new RegExp('[' + text_qualifier + ']'),
		//
		field_replace_from = new RegExp('[' + field_delimiter
				+ config('line_separator') + ']', 'g'),
		//
		field_replace_chars = {
			'\t' : '\\t',
			'\n' : '\\n',
			'\r' : '\\r'
		},
		//
		field_replace_to = function($0) {
			library_namespace.debug('field replace: [' + $0 + ']', 2);
			return ($0 in field_replace_chars) ? field_replace_chars[$0] : '\\'
					+ $0;
		},
		//
		handle_field = config('no_text_qualifier') && text_qualifier ? config('no_text_qualifier') === 'auto' ? function(
				field, i) {
			library_namespace.debug('add field (auto): [' + field + ']', 3);
			if (field === undefined || field === null)
				return '';

			if (handle_array && (i in handle_array)
					&& typeof handle_array[i] === 'function')
				field = handle_array[i](field);

			if (typeof field !== 'string')
				field = '' + field;
			return text_qualifier_tester.test(field) ? text_qualifier
					+ field.replace(text_qualifier_replace_from,
							text_qualifier_replace_to) + text_qualifier : field
					.replace(field_replace_from, field_replace_to);
		}
				: function(field, i) {
					library_namespace.debug('add field (no text qualifier): ['
							+ field + ']', 3);
					if (field === undefined || field === null)
						return '';

					if (handle_array && (i in handle_array)
							&& typeof handle_array[i] === 'function')
						field = handle_array[i](field);

					if (typeof field !== 'string')
						field = '' + field;
					return field.replace(field_replace_from, field_replace_to);
				}
				: function(field, i) {
					library_namespace.debug('add field (add text qualifier): ['
							+ field + ']', 3);
					if (field === undefined || field === null)
						return text_qualifier + text_qualifier;

					if (handle_array && (i in handle_array)
							&& typeof handle_array[i] === 'function')
						field = handle_array[i](field);

					if (typeof field !== 'string')
						field = '' + field;
					return text_qualifier
							+ field.replace(text_qualifier_replace_from,
									text_qualifier_replace_to) + text_qualifier;
				},
		//
		add_row,
		//
		handle_array = config('handle_array'),
		//
		handle_row = config('handle_row'),
		// cache
		select_column_length;

		if (typeof select_column === 'number'
				|| typeof select_column === 'string')
			select_column = [ select_column ];
		else if (!Array.isArray(select_column))
			select_column = undefined;
		if (select_column)
			select_column_length = select_column.length;

		if (!Array.isArray(handle_array))
			handle_array = undefined;

		if (typeof handle_row !== 'function')
			handle_row = undefined;

		function add_row_by_selectd(row) {
			var i = 0, array = [], index;
			library_namespace.debug('push ' + select_column_length + ' fields',
					2);
			if (handle_row)
				row = handle_row(row, CSV.length);
			for (; i < select_column_length; i++) {
				index = select_column[i];
				if (library_namespace.is_debug() && !(index in row))
					library_namespace.warn('unknown index: [' + index
							+ '] @ record #' + CSV.length);
				array.push(handle_field(row[index], i));
			}
			library_namespace.debug('push selected: ['
					+ array.join(field_delimiter) + ']', 2);
			CSV.push(array.join(field_delimiter));
		}

		function add_row_by_data(row) {
			var i, l, array = [];
			if (handle_row)
				row = handle_row(row, CSV.length);
			if (Array.isArray(row)) {
				library_namespace.debug('push ' + row.length + ' fields: ['
						+ row + ']', 2);
				for (i = 0, l = row.length; i < l; i++)
					array.push(handle_field(row[i], i));
			} else {
				for (i in row)
					array.push(handle_field(row[i], i));
			}
			library_namespace.debug('push: [' + array.join(field_delimiter)
					+ ']', 2);
			CSV.push(array.join(field_delimiter));
		}

		add_row = select_column ? add_row_by_selectd : add_row_by_data;

		library_namespace.debug('select_column: ' + select_column, 2);
		library_namespace.debug('field_delimiter: ' + field_delimiter, 2);
		library_namespace.debug('no_text_qualifier: '
				+ config('no_text_qualifier'), 2);
		library_namespace.debug('text_qualifier_replace_from: '
				+ text_qualifier_replace_from, 2);
		library_namespace.debug('field_replace_from: ' + field_replace_from, 2);

		if (select_column && config('has_title')) {
			add_row_by_data(select_column);
		}

		if (Array.isArray(CSV_object)) {
			for (i = 0, l = CSV_object.length; i < l; i++) {
				library_namespace.debug('add []: ' + CSV_object[i], 2);
				add_row(CSV_object[i]);
			}

		} else if (library_namespace.is_Object(CSV_object)) {
			for (i in CSV_object) {
				library_namespace.debug('add {}: ' + CSV_object[i], 2);
				add_row(CSV_object[i]);
			}

		} else {
			library_namespace.warn('to_CSV_String: unknown CSV data type: '
					+ CSV_object);
			return;
		}

		return CSV.join(config('line_separator'));
	}

	to_CSV_String.config = (new library_namespace.setting_pair({},
			default_config, {
				title_array : undefined,
				no_text_qualifier : false,
				text_qualifier : '"',
				field_delimiter : ',',
				line_separator : library_namespace.env.line_separator
			}))({});

	_// JSDT:_module_
	.to_CSV_String = to_CSV_String;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	function speedy_TSV(data, field_delimiter, text_qualifier) {
		data = data.split(text_qualifier || /\r?\n/);

		if (!field_delimiter)
			field_delimiter = '\t';

		for (var i = 0, length = data.length; i < length; i++)
			data[i] = data[i].split(field_delimiter);

		return data;
	}

	speedy_TSV.to_TSV = function(data, field_delimiter) {
		for (var i = 0, length = data.length; i < length; i++)
			data[i] = data[i].join(field_delimiter || '\t');

		return data;
	};

	_.speedy_TSV = speedy_TSV;

	// ----------------------------------------------------------------------------------------------------------------------------------------------------------//

	/**
	 * @example <code>

	 http://hax.pie4.us/2009/05/lesson-of-regexp-50x-faster-with-just.html
	 GetKeywords: function(str) {
		 o: return '\\b(' + str.replace(/\s+/g, '|') + ')\\b';
		 x: return '\\b' + str.replace(/\s+/g, '\\b|\\b') + '\\b';
	 },


	 http://www.jsdb.org/
	 jsdb.from_array
	 jsdb.from_CSV
	 jsdb.from_CSV_file
	 jsdb.select=function(
	 field	//	[1,0,1,1,1] || '1010100' || 'a,b,c,d' || {a:0,b:1,c:1}
	 ,where	//	function(o={a:,b:,c:}){..;return select;} || {a:3} || {a:function(a){..;return select;}} || {a://} || {op:'a&&b||c',a:[3,4,6,11],b:[4,5,6],c:32}
	 )
	 jsdb.concat(table1, table2, id filed/[id fileds] = auto detect)
	 jsdb.from_HTML_TABLE(data,for_every_cell)
	 jsdb.transpose	//	轉置
	 jsdb.to_CSV
	 jsdb.to_HTML_TABLE
	 jsdb.to_array(row_first)
	 jsdb.to_object(row_first)

	 </code>
	 */

	/**
	 * parse CSV data to JSON 讀入 CSV 檔
	 * 
	 * @deprecated 廢棄/棄用: use parse_CSV() instead.
	 * @param {String}
	 *            _t CSV text data
	 * @param {Boolean}
	 *            doCheck check if data is valid
	 * @param {Boolean}
	 *            has_title there's a title line
	 * @return {Array} [ [ L1_1, L1_2, ... ], [ L2_1, L2_2, ... ], ... ]
	 * @_memberOf _module_
	 * @example <code>

	 //	to use:
	 var data=parse_CSV('~');
	 data[_line_][_field_]

	 //	has_title:
	 var data = parse_CSV('~',0,1);
	 //data[_line_][data.t[_title_]]

	 //	then:
	 data.tA	=	title line
	 data.t[_field_name_]	=	field number of title
	 data.it	=	ignored title array
	 data[num]	=	the num-th line (num: 0,1,2,..)

	 * </code>
	 * 
	 * @see <a href="http://www.jsdb.org/" accessdate="2010/1/1 0:53">JSDB:
	 *      JavaScript for databases</a>, <a
	 *      href="http://hax.pie4.us/2009/05/lesson-of-regexp-50x-faster-with-just.html"
	 *      accessdate="2010/1/1 0:53">John Hax: A lesson of RegExp: 50x faster
	 *      with just one line patch</a>
	 */
	function old_parse_CSV(_t, doCheck, has_title) {
		if (!_t || !/[^\n]/.test(_t = _t.replace(/\r\n?/g, '\n')))
			return;
		// _t+=_t.slice(-1)!='\n\n'?'\n':'\n';//if(_t.slice(-1)!='\n')_t+='\n';//if(!/\n/.test(_t))_t+='\n';
		// // 後面一定要[\n]是bug?

		var _f = old_parse_CSV, _r = [], _a, _b = {}, _i = 0, _m = _f.fd,

		/**
		 * <code>
		 Here is a workaround for Opera 10.00 alpha build 1139 bug

		 '\u10a0'.match(/[^\u10a1]+/)
		 and
		 '\u10a0'.match(/[^"]+/)
		 gives different result.
		 The latter should '\u10a0' but it gives null.

		 But
		 '\u10a0'.match(/[^"\u109a]+/)
		 works.

		 </code>
		 */
		c = '\u10a0'.match(/[^"]+/) ? '' : '\u109a';

		_m = '((|[^' + _f.text_qualifier + _m
		// +c: for Opera bug
		+ c + '\\n][^' + _m
		// +c: for Opera bug
		+ c + '\\n]*';

		for (; _i <
		// 這裡不加 _f.text_qualifier 可以 parse 更多狀況
		_f.text_qualifier.length; _i++) {
			_a = _f.text_qualifier.charAt(_i);
			_b[_a] = new RegExp(_a + _a, 'g');
			_m += '|' + _a + '(([^' + _a
			// +c: for Opera bug
			+ c
			// 不用 [^'+_a+']+| 快很多
			+ ']|' + _a + _a + '|\\n)*)' + _a;
		}
		_m += ')[' + _f.fd + '\\n])';
		/**
		 * <code>
		 _m=
		 '((|[^\'"'+_m+'\\n][^'+_m+'\\n]*|"((""|[^"]|\\n)*)"|\'((\'\'|[^\']|\\n)*)\')['+_m+'\\n])'
		 '((|[^\'"'+_m+'\\n$][^'+_m+'\\n$]*|"((""|[^"]|\\n)*)"|\'((\'\'|[^\']|\\n)*)\')['+_m+'\\n$])'
		 _a='((|[^"\''+_f.fd+'\\n][^'+_f.fd+'\\n]*|"((""|[^"]|\\n)*)"|\'((\'\'|[^\']|\\n)*)\')['+_f.fd+'\\n])',alert(_m+'\n'+_a+'\n'+(_m==_a));
		 </code>
		 */
		if (false) {
			alert('now:\n'
					+ new RegExp(_m, 'g').source
					+ '\n\nfull:\n'
					+ /((|[^'",;\t\n$][^,;\t\n$]*|'((''|[^']|\n)*)'|"((""|[^"]|\n)*)")[,;\t\n$])/.source);
		}
		if (doCheck
				&& !new RegExp('^(' + _m + ')+$')
						.test(_t.slice(-1) === '\n' ? _t : _t + '\n'))
			throw new Error(1, "parse_CSV(): Can't parse data!\npattern: /^"
					+ _m + "$/g");

		for (_a = [], _i = 0, _m = (_t.slice(-1) === '\n' ? _t : _t + '\n')
				.match(new RegExp(_m, 'g')); _i < _m.length; _i++) {
			_a.push(_b[_t = _m[_i].charAt(0)] ? _m[_i].slice(1, -2).replace(
					_b[_t], _t) : _m[_i].slice(0, -1));
			// alert('['+_i+'] '+_m[_i]+'|\n'+_a.slice(-1));
			if (_m[_i].slice(-1) === '\n')
				_r.push(_a), _a = [];
		}
		// if(_a.length)_r.push(_a);

		if (typeof has_title === 'undefined')
			has_title = _f.has_title === null ? 0 : _f.has_title;
		if (has_title) {
			// ignored title array
			// library_namespace.debug('parse_CSV(): ');
			_r.it = [];
			while (_a = _r.shift(), _a.length < _r[0].length)
				// 預防 title 有許多行
				_r.it.push(_a);
			for (_r.tA = _a, _b = _r.t = {}, _i = 0; _i < _a.length; _i++)
				_b[_a[_i]] = _i;
		}

		// _r = [ [ L1_1, L1_2, ... ], [ L2_1, L2_2, ... ], ... ]
		return _r;
	}

	/**
	 * field delimiter
	 */
	old_parse_CSV.fd = '\\t,;';// :\s
	/**
	 * text qualifier
	 */
	old_parse_CSV.text_qualifier = '"\'';
	// old_parse_CSV.ld line delimiter: only \n, \r will be ignored.
	/**
	 * auto detect.. no title
	 */
	old_parse_CSV.has_title = null;
	if (false) {
		// data[old_parse_CSV.title_word]=title row array
		old_parse_CSV.title_word = 't';
				old_parse_CSV.fd = ';',
				old_parse_CSV.text_qualifier = '"',
				alert(parse_CSV(
						'"dfdf\nsdff";"sdf""sadf\n""as""dfsdf";sdfsadf;"dfsdfdf""dfsadf";sfshgjk',
						1).join('\n'));
		WScript.Quit();
	}

	// 2007/8/6 17:53:57-22:11:22

	/**
	 * <code>
	 test:
	 'dfgdfg,"fgd",dfg'
	 'dfgdfg,"fgd",dfg'

	 'sdfsdf','ssdfdf'',''sdf'

	 </code>
	 */
	/**
	 * 讀入CSV檔<br /> !! slow !!
	 * 
	 * @since 2007/8/6 17:53:57-22:11:22
	 * @see 可參考 JKL.ParseXML.CSV.prototype.parse_CSV 2007/11/4 15:49:4
	 * @deprecated 廢棄: use parse_CSV() instead.
	 * @param FP
	 *            file path
	 * @param FD
	 *            field delimiter([,;: ]|\s+)
	 * @param text_qualifier
	 *            text qualifier['"]
	 * @param has_title
	 *            the data has a title line
	 * @return Array contains data
	 */
	// readCSVdata[generateCode.dLK]='autodetectEncode,simpleRead,simpleFileAutodetectEncode';
	function readCSVdata(FP, FD, text_qualifier, has_title, enc) {
		var t = simpleRead(FP, enc || simpleFileAutodetectEncode).replace(
				/^[\r\n\s]+/, ''), r = [], reg = {
			'"' : /"?(([^"]+|"")+)"?([,;:	]|[ \r\n]+)/g,
			"'" : /'?(([^']+|'')+)'?([,;:	]|[ \r\n]+)/g
		};
		// detect delimiter
		/**
		 * <code>
		if (!FD || !text_qualifier) {
			var a, b, i = 0, F = '[,;:	\s]', T = '[\'"]', r = new RegExp('(^'
					+ (text_qualifier || T) + '|(' + (text_qualifier || T) + ')('
					+ (FD || F) + ')(' + (text_qualifier || T) + ')|'
					+ (text_qualifier || T) + '$)', 'g');
			F = {}, T = {};
			try {
				t.replace(/(^['"]|(['"])([,;:	\s])(['"])|['"]$)/g, function($0, $1, $2,
						$3, $4) {
					if (!$2)
						T[$0] = (T[$0] || 0) + 1;
					else if ($2 == $4)
						T[$2] = (T[$2] || 0) + 1, F[$3] = (F[$3] || 0) + 1;
					if (i++ > 20)
						break;
					return $0;
				});
			} catch (e) {
			}
			if (!FD) {
				a = b = 0;
				for (i in F)
					if (F[i] > a)
						a = F[b = i];
				FD = b;
			}
			if (!text_qualifier) {
				a = b = 0;
				for (i in T)
					if (T[i] > a)
						a = T[b = i];
				text_qualifier = b;
			}
		}
		</code>
		 */
		if (!text_qualifier) {
			l = t.indexOf('\n');
			if (l === -1)
				t.indexOf('\r');
			l = (l === -1 ? t : t.slice(0, l));
			if (!l.replace(reg['"'], ''))
				text_qualifier = '"';
			else if (!l.replace(reg["'"], ''))
				text_qualifier = "'";
			else
				return;
		}
		reg = reg[text_qualifier];

		l = [];
		if (!has_title)
			r.length = 1;
		(t + '\n').replace(reg, function($0, $1, $2, $3) {
			l.push($1);
			if (/\r\n/.test($3))
				r.push(l), l = [];
			return '';
		});
		if (has_title)
			for (l = 0, r.t = {}; l < r[0].length; l++)
				r.t[r[0][l]] = l;
		return r;
	}

	var default_config_to_CSV;
	if (false) {
		default_config_to_CSV = {
			/**
			 * 標題列
			 */
			title_array : [],
			/**
			 * 欄位分隔符號
			 */
			field_delimiter : ',',
			/**
			 * 文字辨識符號
			 */
			text_qualifier : '"',
			/**
			 * 是否強制加上 text delimiter
			 */
			force_add_text_qualifier : true,
			/**
			 * line delimiter
			 */
			line_delimiter : '\n'
		};
	}

	_// JSDT:_module_
	.
	/**
	 * @deprecated 廢棄: use to_CSV_String() instead.<br />
	 *             config =
	 *             {field_delimiter:',',title_array:[],text_qualifier:'"',force_text_qualifier:true}
	 */
	to_CSV = function(csv_object, config) {
		library_namespace
				.warn('to_CSV is deprecated. Please using to_CSV_String.');
		config = library_namespace.setup_options(config);
		var CSV = [], i = 0, text_qualifier = config.text_qualifier || '"', force_add_text_qualifier = config.force_add_text_qualifier
				&& text_qualifier, line_delimiter = config.line_delimiter
				|| '\n', field_delimiter = config.field_delimiter || ',', text_qualifier_tester, text_qualifier_RegExp, text_qualifier_replace, add_line = function(
				line_array) {
			var i = 0, field = [];
			if (force_add_text_qualifier) {
				for (; i < line_array.length; i++) {
					// 預防 cell 為 null, undefined 等。
					var cell = line_array[i] && String(line_array[i]) || '';
					field.push(cell.replace(text_qualifier_RegExp,
							text_qualifier_replace));
				}
				CSV.push(text_qualifier
						+ field.join(text_qualifier + field_delimiter
								+ text_qualifier) + text_qualifier);
			} else {
				for (; i < line_array.length; i++) {
					// 預防 cell 為 null, undefined 等。
					var cell = line_array[i] && String(line_array[i]) || '';
					field.push(text_qualifier_tester
							&& cell.indexOf(text_qualifier_tester) !== -1
					//
					? text_qualifier
							+ cell.replace(text_qualifier_RegExp,
									text_qualifier_replace) + text_qualifier
					//
					: cell);
				}
				CSV.push(field.join(field_delimiter));
			}
		};

		if (text_qualifier)
			text_qualifier_tester = text_qualifier,
					text_qualifier_RegExp = new RegExp('\\' + text_qualifier,
							'g'), text_qualifier_replace = text_qualifier
							+ text_qualifier;
		else if (line_delimiter === '\n')
			text_qualifier_tester = line_delimiter,
					text_qualifier_RegExp = /\n/g,
					text_qualifier_replace = '\\n';

		if (Array.isArray(config.title_array)
		// && config.title_array.length
		)
			add_line(config.title_array);

		for (; i < csv_object.length; i++)
			add_line(csv_object[i]);

		return CSV.join(line_delimiter);
	};

	/**
	 * <code>
	//	old:
	function quoteCSVfield(t, d) {
		if (!d)
			d = '"';
		for (var i = 0, j, rd = new RegExp(d, 'g'), d2 = d + d; i < t.length; i++) {
			for (j = 0; j < t[i].length; j++)
				if (typeof t[i][j] == 'string')
					t[i][j] = d + t[i][j].replace(rd, d2) + d;
			if (Array.isArray(t[i]))
				t[i] = t[i].join(',');
		}
		return t.join('\n') + '\n';
	}
	 </code>
	 */

	return (_// JSDT:_module_
	);
}
