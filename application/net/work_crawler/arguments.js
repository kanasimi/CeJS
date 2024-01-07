/**
 * @name WWW work crawler sub-functions
 * 
 * @fileoverview WWW work crawler functions: part of command-line arguments
 * 
 * @since 2019/10/20 拆分自 CeL.application.net.work_crawler.task
 */

'use strict';

// --------------------------------------------------------------------------------------------

if (typeof CeL === 'function') {
	// 忽略沒有 Windows Component Object Model 的錯誤。
	CeL.env.ignore_COM_error = true;

	CeL.run({
		// module name
		name : 'application.net.work_crawler.arguments',

		require : 'application.net.work_crawler.',

		// 設定不匯出的子函式。
		no_extend : 'this,*',

		// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
		code : module_code
	});
}

function module_code(library_namespace) {

	// requiring
	var Work_crawler = library_namespace.net.work_crawler;

	var gettext = library_namespace.locale.gettext;

	// --------------------------------------------------------------------------------------------

	/**
	 * 正規化定義參數的規範，例如數量包含可選範圍，可用 RegExp。如'number:0~|string:/v\\d/i',
	 * 'number:1~400|string:item1;item2;item3'。亦可僅使用'number|string'。
	 * 
	 * @see CeL.data.fit_filter()
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text#pattern
	 */
	function generate_argument_condition(condition) {
		if (library_namespace.is_Object(condition))
			return condition;

		var condition_data = Object.create(null), matched, PATTERN = /([a-z]+)(?::(\/(\\[\s\S]|[^\/])+\/([i]*)|[^|]+))?(?:\||$)/g;
		while (matched = PATTERN.exec(condition)) {
			var type = matched[1], _condition = undefined;
			if (!matched[2]) {
				;

			} else if (matched[3]) {
				_condition = new RegExp(matched[3], matched[4]);

			} else if (type === 'number' && (_condition = matched[2].match(
			// @see CeL.date.parse_period.PATTERN
			/([+\-]?\d+(?:\.\d+)?)?\s*[–~－—─～〜﹣至]\s*([+\-]?\d+(?:\.\d+)?)?/))) {
				_condition = {
					min : _condition[1] && +_condition[1],
					max : _condition[2] && +_condition[2]
				};

			} else if (type === 'number'
					&& (matched[2] === 'natural' || matched[2] === 'ℕ')) {
				_condition = function is_natural(value) {
					return value >= 1 && value === Math.floor(value);
				};

			} else if (type === 'number'
					&& (matched[2] === 'natural+0' || matched[2] === 'ℕ+0')) {
				// Naturals with zero: non-negative integers 非負整數。
				_condition = function is_non_negative(value) {
					return value >= 0 && value === Math.floor(value);
				};

			} else if (type === 'number' && matched[2] === 'integer') {
				_condition = function is_integer(value) {
					return value === Math.floor(value);
				};

			} else {
				_condition = matched[2].split(';');
			}

			condition_data[type] = _condition;
		}

		return condition_data;
	}

	/**
	 * 初始設定好命令列選項之型態資料集。
	 * 
	 * @param {Object}[arg_hash]
	 *            參數型態資料集。
	 * @param {Boolean}[append]
	 *            添加至當前的參數型態資料集。否則會重新設定參數型態資料集。
	 * 
	 * @returns {Object}命令列選項之型態資料集。
	 */
	function setup_argument_conditions(arg_hash, append) {
		if (append) {
			arg_hash = Object.assign(Work_crawler.prototype.import_arg_hash,
					arg_hash);
		} else if (arg_hash) {
			// default: rest import_arg_hash
			Work_crawler.prototype.import_arg_hash = arg_hash;
		} else {
			arg_hash = Work_crawler.prototype.import_arg_hash;
		}

		Object.keys(arg_hash).forEach(function(key) {
			arg_hash[key] = generate_argument_condition(arg_hash[key]);
		});
		// console.log(arg_hash);
		return arg_hash;
	}

	Work_crawler.setup_argument_conditions = setup_argument_conditions;

	/**
	 * 檢核 crawler 的設定參數。
	 * 
	 * @param {String}key
	 *            參數名稱
	 * @param value
	 *            欲設定的值
	 * 
	 * @returns {Boolean} true: Error occudded
	 * 
	 * @see CeL.data.fit_filter()
	 */
	function verify_arg(key, value) {
		if (!(key in this.import_arg_hash)) {
			return true;
		}

		var type = typeof value, arg_type_data = this.import_arg_hash[key];
		// console.log(arg_type_data);

		if (!(type in arg_type_data)) {
			library_namespace.warn([ 'verify_arg: ', {
				// gettext_config:{"id":"the-allowed-data-type-for-$1-is-$4-but-it-was-set-to-{$2}-$3"}
				T : [ '"%1" 這個值所允許的數值類型為 %4，但現在被設定成 {%2} %3',
				//
				key, typeof value, value,
				//
				library_namespace.is_Object(arg_type_data)
				//
				? Object.keys(arg_type_data).map(function(type) {
					return gettext(type);
				}).join('|') : arg_type_data ]
			} ]);

			return true;
		}

		arg_type_data = arg_type_data[type];
		if (Array.isArray(arg_type_data)) {
			if (arg_type_data.length === 1
					&& typeof arg_type_data[0] === 'string') {
				var fso_type = arg_type_data[0]
						.match(/^fso_(file|files|directory|directories)$/);
				if (fso_type) {
					fso_type = fso_type[1];
					if (typeof value === 'string')
						value = value.split('|');
					// assert: Array.isArray(value)
					var error_fso = undefined, checker = fso_type
							.startsWith('file') ? library_namespace.storage.file_exists
							: library_namespace.storage.directory_exists;
					if (value.some(function(fso_path) {
						if (!checker(fso_path)) {
							error_fso = fso_path;
							return true;
						}
					})) {
						library_namespace.warn([ 'verify_arg: ', {
							// gettext_config:{"id":"some-$2-path(s)-specified-by-$1-do-not-exist-$3"}
							T : [ '至少一個由「%1」所指定的%2路徑不存在：%3', key,
							// gettext_config:{"id":"file","mark_type":"combination_message_id"}
							// gettext_config:{"id":"files","mark_type":"combination_message_id"}
							// gettext_config:{"id":"directory","mark_type":"combination_message_id"}
							// gettext_config:{"id":"directories","mark_type":"combination_message_id"}
							gettext(fso_type), error_fso ]
						} ]);
						return true;
					}
					return;
				}
			}

			// e.g., "string:value1,value2"
			if (arg_type_data.includes(value)) {
				// verified
				return;
			}

		} else if (arg_type_data && ('min' in arg_type_data)) {
			// assert: type === 'number'
			if ((!arg_type_data.min || arg_type_data.min <= value)
					&& (!arg_type_data.max || value <= arg_type_data.max)) {
				// verified
				return;
			}

		} else if (typeof arg_type_data === 'function') {
			if (arg_type_data(value))
				return;

		} else {
			if (arg_type_data !== undefined) {
				library_namespace.warn([ 'verify_arg: ', {
					// gettext_config:{"id":"unable-to-process-$1-condition-with-value-type-$2"}
					T : [ '無法處理 "%1" 在數值類型為 %2 時之條件！', key, arg_type_data ]
				} ]);
			}
			// 應該修改審查條件式，而非數值本身的問題。
			return;
		}

		library_namespace.warn([ 'verify_arg: ', {
			// gettext_config:{"id":"$1-is-set-to-the-problematic-value-{$2}-$3"}
			T : [ '"%1" 被設定成了有問題的值：{%2} %3', key, typeof value, value ]
		} ]);

		return true;
	}

	/**
	 * 設定 crawler 的參數。 normalize and setup value
	 * 
	 * @example<code>

	crawler.setup_value(key, value);

	// 應該用:
	this.setup_value(key, value);
	// 不應用:
	this[key] = value;
	delete this[key];

	</code>
	 * 
	 * @param {any}
	 *            key
	 * @param {any}
	 *            value
	 * 
	 * @return {String}has error
	 */
	function setup_value(key, value) {
		if (!key)
			// gettext_config:{"id":"key-value-not-given"}
			return '未提供鍵值';

		if (library_namespace.is_Object(key)) {
			// assert: value === undefined
			value = key;
			for (key in value) {
				this.setup_value(key, value[key]);
			}
			// TODO: return error
			return;
		}

		// assert: typeof key === 'string'

		switch (key) {
		case 'proxy':
			// 使用代理伺服器 proxy_server
			// TODO: check .proxy
			library_namespace.info({
				// gettext_config:{"id":"using-proxy-server-$1"}
				T : [ 'Using proxy server: %1', value ]
			});
			this.get_URL_options.proxy = this[key] = value;
			return;

		case 'cookie':
			// set-cookie, document.cookie
			if (this.get_URL_options.agent) {
				library_namespace.merge_cookie(this.get_URL_options.agent,
						value);
			} else if (this.get_URL_options.cookie) {
				if (!/;\s*$/.test(this.get_URL_options.cookie))
					this.get_URL_options.cookie += ';';
				this.get_URL_options.cookie += value;
			} else {
				this.get_URL_options.cookie = value;
			}
			// console.trace(this.get_URL_options);
			return;

		case 'timeout':
			value = library_namespace.to_millisecond(value);
			if (!(value >= 0)) {
				// gettext_config:{"id":"failed-to-parse-time"}
				return '無法解析的時間';
			}
			this.get_URL_options.timeout = this[key] = value;
			break;

		// case 'agent':
		// @see function setup_agent(URL)

		case 'user_agent':
			if (!value) {
				// gettext_config:{"id":"user-agent-is-not-set"}
				return '未設定 User-Agent。';
			}
			this.get_URL_options.headers['User-Agent'] = this[key] = value;
			break;

		case 'Referer':
			if (!value
			// value === '': Unset Referer
			&& value !== '') {
				// gettext_config:{"id":"referer-cannot-be-undefined"}
				return 'Referer 不可為 undefined。';
			}
			library_namespace.debug({
				// gettext_config:{"id":"configure-referer-$1"}
				T : [ '設定 Referer：%1', JSON.stringify(value) ]
			}, 2);
			this.get_URL_options.headers.Referer = value;
			// console.log(this.get_URL_options);
			return;

		case 'allow_EOI_error':
			if (this.using_default_MIN_LENGTH) {
				this[key] = value;
				// 因為 .allow_EOI_error 會影響到 .MIN_LENGTH
				this.setup_value('MIN_LENGTH', 'default');
				return;
			}
			break;

		case 'MIN_LENGTH':
			// 設定預設可容許的最小圖像大小。
			if (!(value >= 0)) {
				if (value === 'default') {
					this.using_default_MIN_LENGTH = true;
					value = this.allow_EOI_error ? 4e3 : 1e3;
				} else
					// gettext_config:{"id":"min-image-size-should-be-greater-than-0"}
					return '最小圖片大小應大於等於零';
			} else {
				delete this.using_default_MIN_LENGTH;
			}
			break;

		case 'main_directory':
			if (!value || typeof value !== 'string')
				return;
			value = value.replace(/[\\\/]/g,
			// 正規化成當前作業系統使用的目錄分隔符號。
			library_namespace.env.path_separator);
			// main_directory 必須以 path separator 作結。
			value = library_namespace.append_path_separator(value);
			break;
		}

		if (key in this.import_arg_hash) {
			this.verify_arg(key, value);
		}

		if (value === undefined) {
			// delete this[key];
		}
		this[key] = value;
	}

	// import command line arguments 以命令行參數為準
	// 從命令列引數來的設定，優先等級比起作品預設設定更高。
	function import_args() {
		// console.log(library_namespace.env.arg_hash);
		if (!library_namespace.env.arg_hash) {
			return;
		}

		for ( var key in library_namespace.env.arg_hash) {
			if (!(key in this.import_arg_hash) && !(key in this)) {
				continue;
			}

			var value = library_namespace.env.arg_hash[key];

			if (this.import_arg_hash[key] === 'number') {
				try {
					// value = +value;
					// 這樣可以處理如"1e3"
					value = JSON.parse(value);
				} catch (e) {
					library_namespace.error('import_args: '
					// gettext_config:{"id":"cannot-parse-$1"}
					+ gettext('無法解析 %1', key + '=' + value));
					continue;
				}
			}

			var old_value = this[key], error = this.setup_value(key, value);
			if (error) {
				library_namespace.error('import_args: '
				// gettext_config:{"id":"unable-to-set-$1-$2"}
				+ gettext('無法設定 %1：%2', key + '=' + old_value, error));
			} else {
				library_namespace.log(library_namespace.display_align([
						[ key + ': ', old_value ],
						// + ' ': 增加間隙。
						// gettext_config:{"id":"from-command-line"}
						[ gettext('由命令列') + ' → ', value ] ]));
			}
		}
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	// @instance
	Object.assign(Work_crawler.prototype, {
		verify_arg : verify_arg,
		setup_value : setup_value,
		import_args : import_args,
		// 數值規範。命令列可以設定的選項之型態資料集。通常僅做測試微調用。
		// GUI 選項於 work_crawler/gui_electron/gui_electron_functions.js 設定。
		// 以純量為主，例如邏輯真假、數字、字串。無法處理函數！
		// 現在 import_arg_hash 之說明已與 I18n 統合在一起。
		// work_crawler/work_crawler_loader.js與gui_electron_functions.js各參考了import_arg_hash的可選參數。
		// @see work_crawler/gui_electron/gui_electron_functions.js
		// @see work_crawler/resource/locale of work_crawler - locale.csv

		// gettext_config:{"id":"number","mark_type":"combination_message_id"}
		// gettext_config:{"id":"function","mark_type":"combination_message_id"}
		// gettext_config:{"id":"boolean","mark_type":"combination_message_id"}
		// gettext_config:{"id":"string","mark_type":"combination_message_id"}
		// gettext_config:{"id":"fso_file","mark_type":"combination_message_id"}
		// gettext_config:{"id":"fso_files","mark_type":"combination_message_id"}
		// gettext_config:{"id":"fso_directory","mark_type":"combination_message_id"}
		// gettext_config:{"id":"fso_directories","mark_type":"combination_message_id"}
		import_arg_hash : {
			// 預設值設定於 Work_crawler_prototype @ CeL.application.net.work_crawler

			// set download directory, fso:directory
			main_directory : 'string:fso_directory',

			// crawler.show_work_data(work_data);
			show_information_only : 'boolean',

			// 一張張下載圖片。
			// string: image_time_interval
			one_by_one : 'boolean|string',
			// 篩選想要下載的章節標題關鍵字。例如"單行本"。
			chapter_filter : 'string',
			// 開始/接續下載的章節。將依類型轉成 .start_chapter_title 或
			// .start_chapter_NO。對已下載過的章節，必須配合 .recheck。
			start_chapter : 'number:natural|string',
			// 開始/接續下載的章節編號。
			start_chapter_NO : 'number:natural',
			// 下載此章節編號範圍。例如 "20-30,50-60"。
			chapter_NO_range : 'string',
			// 開始/接續下載的章節標題。
			start_chapter_title : 'string',
			// 指定了要開始下載的列表序號。將會跳過這個訊號之前的作品。
			// 一般僅使用於命令列設定。default:1
			start_list_serial : 'number:natural|string',
			// 重新整理列表檔案 rearrange list file
			rearrange_list_file : 'boolean',
			// string: 如 "3s"
			chapter_time_interval : 'number:natural+0|string|function',
			MIN_LENGTH : 'number:natural+0',
			timeout : 'number:natural+0|string',
			// 容許錯誤用的相關操作設定。
			MAX_ERROR_RETRY : 'number:natural+0',
			allow_EOI_error : 'boolean',
			skip_error : 'boolean',
			skip_chapter_data_error : 'boolean',

			directory_name_pattern : 'string',

			preserve_work_page : 'boolean',
			preserve_chapter_page : 'boolean',
			remove_ebook_directory : 'boolean',
			// 當新獲取的檔案比較大時，覆寫舊的檔案。
			overwrite_old_file : 'boolean',
			// 隱藏電子書的章節資訊欄位。
			hide_chapter_information : 'boolean',
			vertical_writing : 'boolean|string',
			// RTL_writing : 'boolean',
			convert_to_language : 'string:TW;CN',
			// 不解開原電子書的選項: 就算存在舊電子書檔案，也不解壓縮、利用舊資料。
			discard_old_ebook_file : 'boolean',

			user_agent : 'string',
			// 代理伺服器 proxy_server: "username:password@hostname:port"
			proxy : 'string',
			// 設定下載時要添加的 cookie。 document.cookie: "key=value"
			cookie : 'string',

			// 可接受的圖片類別（延伸檔名）。以 "|" 字元作分隔，如 "webp|jpg|png"。未設定將不作檢查。
			// 輸入 "images" 表示接受所有圖片。
			acceptable_types : 'string',
			// 漫畫下載完畢後壓縮圖片檔案。
			archive_images : 'boolean',
			// 完全沒有出現錯誤才壓縮圖片檔案。
			archive_all_good_images_only : 'boolean',
			// 壓縮圖片檔案之後，刪掉原先的圖片檔案。
			remove_images_after_archive : 'boolean',
			images_archive_extension : 'string',

			// 重新擷取用的相關操作設定。
			regenerate : 'boolean',
			reget_chapter : 'boolean',
			// force: see "檢查是否久未更新。"
			recheck : 'boolean|string:changed;multi_parts_changed;force',
			search_again : 'boolean',
			cache_title_to_id : 'boolean',

			write_chapter_metadata : 'boolean',
			write_image_metadata : 'boolean',

			// 封存舊作品。
			archive_old_works : 'boolean|string',
			// 以作品完結時間為分界來封存舊作品。預設為最後一次下載時間。
			use_finished_date_to_archive_old_works : 'boolean',
			// 同時自作品列表中刪除將封存之作品。
			modify_work_list_when_archive_old_works : 'boolean',

			// 儲存偏好選項 save_options。
			save_preference : 'boolean'
		}

	});

	setup_argument_conditions();

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
