/**
 * @name CeL function for downloading online works (novels, comics).
 * 
 * @fileoverview 本檔案包含了批量下載線上作品（小說、漫畫）的函式庫。 WWW work crawler.
 * 
 * <code>

下載作業流程:

# 取得伺服器列表。 start_downloading()
# 解析設定檔，判別所要下載的作品列表。 parse_work_id(), get_work_list(), .base_URL, .extract_work_id()
# 特別處理特定id。	.convert_id()
# 解析 作品名稱 → 作品id	get_work(), .search_URL, .parse_search_result()
# 取得作品資訊與各章節資料。 get_work_data(), pre_process_chapter_list_data(), process_chapter_list_data()
# 對於章節列表與作品資訊分列不同頁面(URL)的情況，應該另外指定 .chapter_list_URL。 get_work_data(), .work_URL, .parse_work_data(), chapter_list_URL, .get_chapter_list()
# 取得每一個章節的內容與各個影像資料。 pre_get_chapter_data(), .chapter_URL, get_chapter_data(), .pre_parse_chapter_data(), .parse_chapter_data()
# 取得各個章節的每一個影像內容。 get_image(), .image_preprocessor(), .image_post_processor(), .after_get_image()
# finish_up(), .after_download_chapter(), .after_download_work()

TODO:
將工具檔結構以及說明統合在一起，並且建造可以自動生成的工具。
	自動判別網址所需要使用的下載工具，輸入網址自動揀選所需的工具檔案。
	從其他的資料來源網站尋找取得作品以及章節的資訊。
	自動記得某個作品要從哪些網站下載。

將可選參數import_arg_hash及說明統合在一起，不像現在分別放在work_crawler.js與gui_electron_functions.js。考慮加入I18n


暗色主題 dark theme
CLI progress bar
下載完畢後作繁簡轉換。
在單一/全部任務完成後執行的外部檔+等待單一任務腳本執行的時間（秒數）
用安全一點的 eval()
	Runs untrusted code securely https://github.com/patriksimek/vm2
parse 圖像。
拼接長圖。
檢核章節內容。
考慮 search_URL 搜尋的頁數，包含所有結果

</code>
 * 
 * @see https://github.com/abc9070410/JComicDownloader
 *      https://github.com/eight04/ComicCrawler https://github.com/riderkick/FMD
 *      https://github.com/yuru-yuri/manga-dl
 *      https://github.com/Xonshiz/comic-dl
 *      https://github.com/wellwind/8ComicDownloaderElectron
 *      https://github.com/Arachnid-27/Cimoc
 *      https://github.com/qq573011406/KindleHelper
 *      https://github.com/InzGIBA/manga
 * 
 * @see 爬蟲框架 https://scrapy.org/
 * 
 * @since 2016/10/30 21:40:6
 * @since 2016/11/1 23:15:16 正式運用：批量下載腾讯漫画 qq。
 * @since 2016/11/5 22:44:17 正式運用：批量下載漫画台 manhuatai。
 * @since 2016/11/27 19:7:2 模組化。
 */

// More examples: see 各網站工具檔.js: https://github.com/kanasimi/work_crawler
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

if (typeof CeL === 'function') {
	// 忽略沒有 Windows Component Object Model 的錯誤。
	CeL.env.ignore_COM_error = true;

	CeL.run({
		// module name
		name : 'application.net.work_crawler',

		// .includes() @ CeL.data.code.compatibility
		require : 'data.code.compatibility.'
		// .between() @ CeL.data.native
		// .append() @ CeL.data.native
		// .pad() @ CeL.data.native
		// display_align() @ CeL.data.native
		+ '|data.native.'
		// for CeL.to_file_name()
		+ '|application.net.'
		//
		+ '|application.net.Ajax.get_URL'
		// for CeL.env.arg_hash, CeL.fs_read()
		+ '|application.platform.nodejs.|application.storage.'
		// for CeL.storage.file.file_type()
		+ '|application.storage.file.'
		// for HTML_to_Unicode()
		+ '|interact.DOM.'
		// for Date.prototype.format(), String.prototype.to_Date(),
		// .to_millisecond()
		+ '|data.date.'
		// CeL.character.load(), 僅在要設定 this.charset 時才需要載入。
		+ '|data.character.'
		// gettext, and for .detect_HTML_language(), .time_zone_of_language()
		+ '|application.locale.gettext'
		// guess_text_language()
		+ '|application.locale.encoding.'
		// storage.archive()
		+ '|application.storage.archive.',

		// 設定不匯出的子函式。
		no_extend : '*',

		// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
		code : module_code
	});
}

function module_code(library_namespace) {

	// requiring
	var get_URL = this.r('get_URL'),
	// library_namespace.locale.gettext
	gettext = this.r('gettext'),
	/** node.js file system module */
	node_fs = library_namespace.platform.nodejs && require('fs'),
	// @see CeL.application.net.wiki
	PATTERN_non_CJK = /^[\u0000-\u2E7F]*$/i,
	//
	path_separator = library_namespace.env.path_separator;

	// --------------------------------------------------------------------------------------------

	function Work_crawler(configurations) {
		Object.assign(this, configurations);

		// 預設自動匯入 .env.arg_hash
		if (this.auto_import_args)
			this.import_args();

		// 在crawler=new CeL.work_crawler({})的情況下可能沒辦法得到準確的檔案路徑，因此這個路徑僅供參考。
		if (typeof module === 'object') {
			var _module = module;
			while (_module = _module.parent) {
				// console.log('Work_crawler: ' + _module.filename);
				// 在 electron 中可能會是 index.html 之類的。
				if (/\.js/i.test(_module.filename)) {
					this.main_script = _module.filename;
				}
			}
		}

		// this.id 之後將提供給 this.site_id 使用。
		// 在使用gui_electron含入檔案的情況下，this.id應該稍後在設定。
		if (!this.id) {
			this.id = this.main_script
			// **1** require.main.filename: 如 require('./site_id.js')
			// **2** 如 node site_id.js work_id
			&& this.main_script
			// 去掉 path
			.replace(/^[\s\S]*[\\\/]([^\\\/]+)$/, '$1')
			// 去掉 file extension
			.replace(/\.*[^.]+$/, '')
			// NOT require('./site_id.js'). 如 node site_id.js work_id
			|| this.main_directory.replace(/\.*[\\\/]+$/, '')
			// **3** others: unnormal
			|| this.base_URL.match(/\/\/([^\/]+)/)[1].toLowerCase().split('.')
			//
			.reverse().some(function(token, index) {
				if (index === 0) {
					// 頂級域名
					return false;
				}
				if (token !== 'www') {
					this.id = token;
				}
				if (token.length > 3 || index > 1) {
					// e.g., www.[id].co.jp
					return true;
				}
			}, this);
			if (!this.id && !(this.id = this.id.match(/[^\\\/]*$/)[0])) {
				library_namespace.error(gettext('無法從網址擷取作品 id：%1',
						this.base_URL));
			}
		}
		process.title = gettext('Starting %1', this.id);

		if (library_namespace.is_digits(this.baidu_cse)) {
			if (!this.parse_search_result) {
				// for 百度站内搜索工具。非百度搜索系統得要自己撰寫。
				this.parse_search_result = 'baidu';
			}
			// baidu cse id 百度站内搜索工具。
			if (!this.search_URL) {
				this.search_URL = {
					URL : 'http://zhannei.baidu.com/cse/search?s='
					// &ie=utf-8 &isNeedCheckDomain=1&jump=1 &entry=1
					+ this.baidu_cse + '&q=',
					charset : 'UTF-8'
				};
			}
		}

		if (typeof this.parse_search_result === 'string') {
			if (parse_search_result_set[this.parse_search_result]) {
				this.parse_search_result = parse_search_result_set[this.parse_search_result];
			} else {
				this.onerror('Work_crawler: No this parse_search_result: '
						+ this.parse_search_result, work_data);
				return Work_crawler.THROWED;
			}
		}

		// 設定預設可容許的最小圖像大小。
		if (!(this.MIN_LENGTH >= 0)) {
			// 先設定一個，預防到最後都沒有被設定到。
			this.setup_value('MIN_LENGTH', 'default');
		}

		this.get_URL_options = {
			// start_time : Date.now(),
			no_protocol_warn : true,
			headers : Object.assign({
				Referer : this.base_URL
			}, this.headers)
		};

		this.setup_value('timeout', this.timeout);
		this.setup_value('user_agent', this.user_agent);

		// console.log(this.get_URL_options);
		this.default_agent = this.set_agent();
	}

	// ------------------------------------------

	/**
	 * 定義參數的規範，例如數量包含可選範圍，可用 RegExp。如'number:0~|string:/v\\d/i',
	 * 'number:1~400|string:item1;item2;item3'。不像現在import_arg_hash只規範了'number|string'
	 * 
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text#pattern
	 */
	function generate_argument_condition(condition) {
		if (library_namespace.is_Object(condition))
			return condition;

		var condition_data = library_namespace.null_Object(), matched, PATTERN = /([a-z]+)(?::(\/(\\\/|[^\/])+\/([i]*)|[^|]+))?(?:\||$)/g;
		while (matched = PATTERN.exec(condition)) {
			var type = matched[1], _condition;
			if (!matched[2]) {
				;

			} else if (matched[3]) {
				_condition = new RegExp(matched[3], matched[4]);

			} else if (type === 'number'
					&& (_condition = matched[2]
							.match(/([+\-]?\d+(?:\.\d+)?)?~([+\-]?\d+(?:\.\d+)?)?/))) {
				_condition = {
					min : _condition[1] && +_condition[1],
					max : _condition[2] && +_condition[2]
				};

			} else if (type === 'number' && matched[2] === 'natural') {
				_condition = function(value) {
					return value >= 1 && value === Math.floor(value);
				};

			} else if (type === 'number' && matched[2] === 'integer') {
				_condition = function(value) {
					return value === Math.floor(value);
				};

			} else {
				_condition = matched[2].split(';');
			}

			condition_data[type] = _condition;
		}

		return condition_data;
	}

	function verify_arg(key, value) {
		if (!(key in this.import_arg_hash)) {
			return true;
		}

		var type = typeof value, arg_type_data = this.import_arg_hash[key];

		if (type in arg_type_data) {
			arg_type_data = arg_type_data[type];
			if (Array.isArray(arg_type_data)) {
				if (arg_type_data.includes(value))
					// verified
					return;

			} else if (arg_type_data && ('min' in arg_type_data)) {
				if ((!arg_type_data.min || arg_type_data.min <= value)
						&& (!arg_type_data.max || value <= arg_type_data.max))
					// verified
					return;

			} else if (typeof arg_type_data === 'function') {
				if (arg_type_data(value))
					return;

			} else {
				// assert: arg_type_data === undefined
				return;
			}

		}

		arg_type_data = JSON.stringify(arg_type_data);

		library_namespace.warn([ 'verify_arg: ', {
			T : [ '"%1" 這個值所允許的數值類型為 %2，但現在被設定了 {%3} %4',
			//
			key, arg_type_data, typeof value, value ]
		} ]);

		return true;
	}

	// 檢核參數. normalize and setup value
	// return {String}has error
	function setup_value(key, value) {
		if (!key)
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
			// 代理伺服器 proxy_server
			// TODO: check .proxy
			library_namespace.info({
				T : [ '使用proxy：%1', this.proxy ]
			});
			this.get_URL_options.proxy = this.proxy = value;
			return;

		case 'timeout':
			value = library_namespace.to_millisecond(value);
			if (!(value >= 0)) {
				return '無法解析的時間';
			}
			this.get_URL_options.timeout = value;
			break;

		case 'user_agent':
			this.get_URL_options.headers['User-Agent'] = value;
			break;

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
					return '最小圖像大小應大於等於零';
			} else {
				delete this.using_default_MIN_LENGTH;
			}
			break;

		case 'main_directory':
			if (!value || typeof value !== 'string')
				return;
			value = value.replace(/[\\\/]/g, path_separator)
			// main_directory 必須以 path separator 作結。
			.replace(/[\\\/]*$/, path_separator);
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
					library_namespace.error('import_args: Can not parse ' + key
							+ '=' + value);
					continue;
				}
			}

			var old_value = this[key], error = this.setup_value(key, value);
			if (error) {
				library_namespace.error('import_args: 無法設定 ' + key + '='
						+ old_value + ': ' + error);
			} else {
				library_namespace.log(library_namespace.display_align([
						[ key + ': ', old_value ],
						[ gettext('由命令列 → '), value ] ]));
			}
		}
	}

	// --------------------------------

	// 初始化 agent。
	// create and keep a new agent. 維持一個獨立的 agent。
	// 以不同 agent 應對不同 host。
	function set_agent(URL) {
		var agent;
		if (URL
		// restore
		|| !(agent = this.default_agent)) {
			agent = library_namespace.application.net.Ajax.setup_node_net(URL
					|| this.base_URL);
			agent.keepAlive = true;
		}
		return this.get_URL_options.agent = agent;
	}

	// --------------------------------

	// set download directory
	function set_main_directory(main_directory) {
		if (main_directory
				&& (main_directory = main_directory.replace(/[\\\/]+$/, ''))) {
			Work_crawler.prototype.main_directory = main_directory
			// main_directory 必須以 path separator 作結。
			+ path_separator;
		}
		return Work_crawler.prototype.main_directory;
	}

	Work_crawler.set_main_directory = set_main_directory;

	// --------------------------------

	// fatal error throwed
	Work_crawler.THROWED = {
		throwed : true
	};

	// --------------------------------
	// 這邊放的是一些會在 Work_crawler_prototype 中被運算到的數值。

	/** {Natural}下載失敗時最多重新嘗試下載的次數。同一檔案錯誤超過此數量則跳出。 */
	Work_crawler.MAX_ERROR_RETRY = 4;

	Work_crawler.HTML_extension = 'htm';

	Work_crawler.parse_favorite_list = parse_favorite_list;

	var Work_crawler_prototype = {
		// 所有的子檔案要修訂注解說明時，應該都要順便更改在CeL.application.net.work_crawler中Work_crawler.prototype內的母comments，並以其為主體。

		// 下載檔案儲存目錄路徑。圖片檔+紀錄檔下載位置。
		// 這個目錄會在 work_crawler_loder.js 裡面被 setup_crawler() 之 data_directory 覆寫。
		main_directory : library_namespace.storage
		// 決定預設的主要下載目錄 default_main_directory。
		.determin_download_directory(true),

		// id : '',
		// site_id : '',
		// base_URL : '',
		// charset : 'GBK',

		// 預設自動匯入 .env.arg_hash
		auto_import_args : true,

		// {String}瀏覽器識別 navigator.userAgent 模擬 Chrome。
		user_agent : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
		// 並且每次更改不同的 user agent。
		.replace(/( Chrome\/\d+\.\d+\.)(\d+)/, function($0, $1, $2) {
			return $1 + (Math.random() * 1e4 | 0);
		}),

		/**
		 * {Natural|String}timeout for get_URL()
		 * 下載圖片的逾時等待時間。若逾時時間太小（如10秒），下載大檔案容易失敗。
		 * 
		 * 注意: 因為 this.get_URL_options 在 constructor 中建構完畢，因此 timeout
		 * 必須在一開始就設定。之後必須以 `this.setup_value('timeout', this.timeout);`
		 * 設定，否則沒有效果。
		 */
		timeout : '30s',
		// 本站速度頗慢，必須等待較久否則容易中斷。
		// timeout : '60s',

		// {Natural}出錯時重新嘗試的次數。若值太小，傳輸到一半壞掉的圖片可能被當作正常圖片而不會出現錯誤。
		MAX_ERROR_RETRY : Work_crawler.MAX_ERROR_RETRY,
		// {Natural}圖片下載未完全，出現 EOI (end of image) 錯誤時重新嘗試的次數。
		MAX_EOI_ERROR : Math.min(3, Work_crawler.MAX_ERROR_RETRY),
		// {Natural}MIN_LENGTH:最小容許圖案檔案大小 (bytes)。
		// 因為當前尚未能 parse 圖像，而 jpeg 檔案可能在檔案中間出現 End Of Image mark；
		// 因此當圖像檔案過小，即使偵測到以 End Of Image mark 作結，依然有壞檔疑慮。
		//
		// 對於極少出現錯誤的網站，可以設定一個比較小的數值，並且設定.allow_EOI_error=false。因為這類型的網站要不是無法取得檔案，要不就是能夠取得完整的檔案；要取得破損檔案，並且已通過EOI測試的機會比較少。
		// MIN_LENGTH : 4e3,
		// 對於有些圖片只有一條細橫桿的情況。
		// MIN_LENGTH : 140,

		// {Natural}預設所容許的章節最短內容字數。最少應該要容許一句話的長度。
		MIN_CHAPTER_SIZE : 200,

		// retry delay. cf. one_by_one
		// {Natural|String|Function}當網站不允許太過頻繁的訪問讀取/access時，可以設定下載章節資訊/章節內容前的等待時間。
		// chapter_time_interval : '1s',
		get_chapter_time_interval : get_chapter_time_interval,

		// 需要重新讀取頁面的時候使用。
		REGET_PAGE : {
			REGET_PAGE : true
		},

		// {String}預設的圖片延伸檔名/副檔名/filename extension。
		default_image_extension : 'jpg',

		// {String}仙人拍鼓有時錯，跤步踏差啥人無？ 客語 神仙打鼓有時錯，腳步踏差麼人無
		MESSAGE_RE_DOWNLOAD : '神仙打鼓有時錯，腳步踏差誰人無。下載出錯了，例如服務器暫時斷線、檔案闕失(404)。請確認排除錯誤或錯誤不再持續後，重新執行以接續下載。',
		// 當圖像不存在 EOI (end of image) 標記，或是被偵測出非圖像時，依舊強制儲存檔案。
		// allow image without EOI (end of image) mark. default:false
		// allow_EOI_error : true,
		// 圖像檔案下載失敗處理方式：忽略/跳過圖像錯誤。當404圖像不存在、檔案過小，或是被偵測出非圖像(如不具有EOI)時，依舊強制儲存檔案。default:false
		// skip_error : true,
		//
		// 若已經存在壞掉的圖片，就不再嘗試下載圖片。default:false
		// skip_existed_bad_file : true,
		//
		// 循序逐個、一個個下載圖像。僅對漫畫有用，對小說無用。小說章節皆為逐個下載。 Download images one by one.
		// default: 同時下載本章節中所有圖像。 Download ALL images at the same time.
		// 若設成{Natural}大於零的數字(ms)或{String}時間長度，那會當成下載每張圖片之時間間隔 time_interval。
		// cf. chapter_time_interval
		// one_by_one : true,
		//
		// e.g., '2-1.jpg' → '2-1 bad.jpg'
		EOI_error_postfix : ' bad',
		// 加上有錯誤檔案之註記。
		EOI_error_path : EOI_error_path,
		// cache directory below this.main_directory.
		// MUST append path_separator!
		cache_directory_name : 'cache' + path_separator,
		// archive directory below this.main_directory for ebook. 封存舊電子書用的目錄。
		// MUST append path_separator!
		archive_directory_name : 'archive' + path_separator,
		// log directory below this.main_directory
		log_directory_name : 'log' + path_separator,
		// 錯誤記錄檔案: 記錄無法下載的圖檔。
		error_log_file : 'error_files.txt',
		// 當從頭開始檢查時，會重新設定錯誤記錄檔案。此時會把舊的記錄檔改名成為這個檔案。
		// 移動完之後這個值會被設定為空，以防被覆寫。
		error_log_file_backup : 'error_files.'
				+ (new Date).format('%Y%2m%2dT%2H%2M%2S') + '.txt',
		// last updated date, latest update date. 最後更新日期時間。
		// latest_chapter_url → latest_chapter_url
		// latest_chapter_name, last_update_chapter → latest_chapter
		// update_time, latest_update → last_update
		// 這些值會被複製到記錄報告中，並用在 show_search_result() @ gui_electron_functions.js。
		last_update_status_keys : 'latest_chapter,last_update_chapter,latest_chapter,latest_chapter_name,latest_chapter_url,last_update,update_time'
				.split(','),
		// 記錄報告檔案/日誌的路徑。
		report_file : 'report.' + (new Date).format('%Y%2m%2dT%2H%2M%2S') + '.'
				+ Work_crawler.HTML_extension,
		report_file_JSON : 'report.json',

		search_result_file_name : 'search.json',
		get_search_result_file : function() {
			var search_result_file = this.main_directory
					+ this.search_result_file_name;
			return search_result_file;
		},
		get_search_result : function() {
			var search_result_file = this.get_search_result_file(),
			// search cache
			// 檢查看看之前是否有取得過。
			search_result = library_namespace.get_JSON(search_result_file);
			return search_result;
		},

		onwarning : function onwarning(warning, work_data) {
			library_namespace.error(warning);
		},
		// for uncaught error. work_data 可能為 undefined/image_data
		onerror : function onerror(error, work_data) {
			process.title = 'Error: ' + error;
			if (typeof error === 'object') {
				// 丟出異常錯誤。
				throw error;
			} else {
				console.trace(
				// typeof error === 'object' ? JSON.stringify(error) :
				error);
				throw this.id + ': ' + (new Date).toISOString() + ' ' + error;
			}
			// return CeL.work_crawler.THROWED;
			return Work_crawler.THROWED;
		},

		// default start chapter index: 1.
		// 將開始/接續下載的章節編號。對已下載過的章節，必須配合 .recheck。
		// 若是 start_chapter 在之前下載過的最後一個章節之前的話，那麼就必須要設定 recheck 才會有效。
		// 之前下載到第8章且未設定 recheck，則指定 start_chapter=9 **有**效。
		// 之前下載到第8章且未設定 recheck，則指定 start_chapter=7 **無**效。必須設定 recheck。
		start_chapter : 1,
		// 是否重新取得每個所檢測的章節內容 chapter_page。
		// 警告: reget_chapter=false 僅適用於小說之類不取得圖片的情形，
		// 因為若有圖片（parse_chapter_data()會回傳chapter_data.image_list），將把chapter_page寫入僅能從chapter_URL取得名稱的於目錄中。
		reget_chapter : true,
		// 是否保留 chapter page。false: 明確指定不保留，將刪除已存在的 chapter page。
		// 注意: 若是沒有 reget_chapter，則 preserve_chapter_page 不應發生效用。
		preserve_chapter_page : false,
		// 是否保留作品資料 cache 於 this.cache_directory_name 下。
		preserve_work_page : false,
		// 是否保留損壞圖檔。
		preserve_bad_image : true,
		// 是否保留 cache
		// preserve_cache : true,

		// 在取得小說章節內容的時候，若發現有章節被目錄漏掉，則將之補上。
		check_next_chapter : check_next_chapter,

		// for CeL.application.storage.EPUB
		// auto_create_ebook, automatic create ebook
		// MUST includes CeL.application.locale!
		// need_create_ebook : true,
		KEY_EBOOK : 'ebook',
		milestone_extension : true,
		add_ebook_chapter : add_ebook_chapter,
		pack_ebook : pack_ebook,
		/** 在包裝完電子紙書之後，把電子書目錄整個刪掉。 請注意： 必須先安裝 7-Zip **18.01 以上的版本**。 */
		remove_ebook_directory : true,
		/** 章節數量無變化時依舊利用 cache 重建資料(如ebook)。 */
		// regenerate : true,
		/** 進一步處理書籍之章節內容。例如繁簡轉換、錯別字修正、裁剪廣告。 */
		contents_post_processor : function(contents, work_data) {
			return contents;
		} && null,
		// 話: 日文
		// 「卷」為漫畫單行本，「話」為雜誌上的連載，「卷」包含了以往雜誌上所有發行的「話」
		chapter_unit : '話',
		parse_ebook_name : parse_ebook_name,

		full_URL : full_URL_of_path,
		// recheck:從頭檢測所有作品之所有章節與所有圖片。不會重新擷取圖片。對漫畫應該僅在偶爾需要從頭檢查時開啟此選項。default:false
		// 每次預設會從上一次中斷的章節接續下載，不用特地指定 recheck。
		// 有些漫畫作品分區分單行本、章節與外傳，當章節數量改變、添加新章節時就需要重新檢查/掃描。
		// recheck='changed': 若是已變更，例如有新的章節，則重新下載/檢查所有章節內容。否則只會自上次下載過的章節接續下載。
		// recheck='multi_parts_changed': 當有多個分部的時候才重新檢查。
		// recheck : true,
		// recheck=false:明確指定自上次下載過的章節接續下載。
		// recheck : false,
		//
		// 當無法取得 chapter 資料時，直接嘗試下一章節。在手動+監視下 recheck 時可併用此項。 default:false
		// skip_chapter_data_error : true,

		// 重新搜尋。default:false
		// research : false,

		// TODO: .heif
		image_types : {
			jpg : true,
			jpeg : true,
			// 抓取到非JPG圖片
			png : true,
			gif : true,
			webp : true,
			bmp : true
		},

		// 漫畫下載完畢後壓縮每個章節的圖像檔案。
		archive_images : true,
		// 完全沒有出現錯誤才壓縮圖像檔案。
		// archive_all_good_images_only : true,
		// 壓縮圖像檔案之後，刪掉原先的圖像檔案。 請注意： 必須先安裝 7-Zip **18.01 以上的版本**。
		remove_images_after_archive : true,
		images_archive_extension : 'zip',

		image_path_to_url : image_path_to_url,
		// 規範 work id 的正規模式；提取出引數中的作品id 以回傳。
		extract_work_id : function(work_information) {
			// default: accept numerals only
			if (library_namespace.is_digits(work_information)
			// || /^[a-z_\-\d]+$/.test(work_information)
			)
				return work_information;
		},
		// 自作品網址 URL 提取出 work id。 via URL
		extract_work_id_from_URL : function(work_information) {
			if (typeof work_information === 'string'
					&& /^https?:\/\//.test(work_information)) {
				var PATTERN_work_id_of_url = this.PATTERN_work_id_of_url;
				if (!PATTERN_work_id_of_url) {
					PATTERN_work_id_of_url = this.full_URL(this.work_URL,
							'work_id');
					if (PATTERN_work_id_of_url.endsWith('work_id/')) {
						// 允許不用"/"結尾。
						PATTERN_work_id_of_url = PATTERN_work_id_of_url.slice(
								0, -1);
					}
					PATTERN_work_id_of_url = this.PATTERN_work_id_of_url
					// assert:
					// 'work_id'===library_namespace.to_RegExp_pattern('work_id')
					= new RegExp('^'
							+ library_namespace.to_RegExp_pattern(
									PATTERN_work_id_of_url).replace('work_id',
									'([^\/]+)'));
				}

				var matched = work_information.match(PATTERN_work_id_of_url);
				if (matched) {
					matched = matched[1];
					library_namespace
							.info('extract_work_id_from_URL: 自作品網址提取出 work id: '
									+ matched);
					return /* this.extract_work_id(matched) && */matched;
				}
				library_namespace
						.warn('extract_work_id_from_URL: 無法自作品網址提取出 work id！ '
								+ work_information);
			}
		},
		// 由文章狀態/進程取得用在作品完結的措辭。
		finished_words : function finished_words(status) {
			status = String(status);

			// e.g., https://syosetu.org/?mode=ss_detail&nid=33378
			if (/^[(\[]?(?:完[結结成]?|Completed)[)\]]?$/i.test(status))
				return status;

			// e.g., 连载中, 連載中, 已完结, 已完成, 已完結作品, 已連載完畢
			var matched = status.match(/(?:^|已)完[結结成]/);
			if (matched)
				return matched[0];

			// 完本: http://book.qidian.com/
			if ('完結済|完本|読み切り'.split('|').some(function(word) {
				return status.includes(word);
			})) {
				return status;
			}

			// ck101: 全文完, 全書完
			// MAGCOMI: 連載終了作品
			if (/全[文書]完|終了/.test(status)) {
				return status;
			}

			// 已停更
		},
		is_finished : function(work_data) {
			var status_list = library_namespace.is_Object(work_data) ? work_data.status
					// treat work_data as status
					: work_data;
			if (!status_list) {
				if (this.recheck
						&& !work_data.recheck
						&& library_namespace.is_Object(work_data)
						&& (Date.now() - set_last_update_Date(work_data))
						// 因為沒有明確記載作品是否完結，10年沒更新就不再重新下載。
						/ library_namespace.to_millisecond('1D') > (work_data.recheck_days || 10 * 366)) {
					library_namespace.info('is_finished: 本作品已經 '
							+ library_namespace
									.age_of(set_last_update_Date(work_data))
							+ ' 沒有更新，時間過久不再重新下載，僅作檢查: ' + work_data.title);
					work_data.recheck = 'changed';
				}

				return status_list;
			}
			// {String|Array}status_list

			if (!Array.isArray(status_list)) {
				return this.finished_words(status_list);
			}

			var finished;
			if (status_list.some(function(status) {
				return finished = this.finished_words(status);
			}, this)) {
				return finished;
			}
		},
		work_URL : function(work_id) {
			// default work_URL: this.base_URL + work_id + '/'
			return work_id + '/';
			// or you may use:
			return work_id + '/' + work_id + '.html';
			return work_id + '.html';
		},
		/**
		 * 對於章節列表與作品資訊分列不同頁面(URL)的情況，應該另外指定 .chapter_list_URL。 e.g., <code>
		chapter_list_URL : '',
		chapter_list_URL : function(work_id) { return this.work_URL(work_id) + 'chapter/'; },
		chapter_list_URL : function(work_id, work_data) { return [ 'url', { post_data } ]; },
		 </code>
		 */
		// 當有設定work_data.chapter_list的時候的預設函數，由 this.get_chapter_data() 呼叫。
		chapter_URL : function(work_data, chapter_NO) {
			// chapter_NO starts from 1
			// console.log(work_data.chapter_list);
			// console.log(work_data.chapter_list[chapter_NO - 1]);
			// console.trace(chapter_NO + '/' + work_data.chapter_list.length);

			// e.g., work_data.chapter_list = [ chapter_data,
			// chapter_data={url:'',title:'',date:new Date}, ... ]
			return work_data.chapter_list[chapter_NO - 1].url;

			return this.full_URL(this.work_URL, work_data.id)
					+ work_data.chapter_list[chapter_NO - 1].url;
		},
		// this.get_URL(url, function(XMLHttp) {})
		get_URL : function(url, callback, post_data, options) {
			if (options === true) {
				options = Object.assign({
					error_retry : this.MAX_ERROR_RETRY
				}, this.get_URL_options);
			} else if (library_namespace.is_Object(options)) {
				options = Object.assign(library_namespace.null_Object(),
						this.get_URL_options, options);
			} else {
				// assert: !options === true
				options = this.get_URL_options;
			}

			get_URL(this.full_URL(url), callback, this.charset, post_data,
					options);
		},

		set_part : set_part_title,
		add_chapter : add_chapter_data,
		reverse_chapter_list_order : reverse_chapter_list_order,
		set_chapter_NO_via_title : set_chapter_NO_via_title,
		get_chapter_directory_name : get_chapter_directory_name,

		// work_data properties to reset
		reset_work_data_properties : {
			// work_data.recheck
			recheck : true,
			last_download : true,

			error_images : true,
			chapter_count : true,
			image_count : true
		},

		verify_arg : verify_arg,
		setup_value : setup_value,
		import_args : import_args,
		// 命令列可以設定的選項。通常僅做測試微調用。
		// 以純量為主，例如邏輯真假、數字、字串。無法處理函數！
		// @see work_crawler/gui_electron/gui_electron_functions.js
		import_arg_hash : {
			// set download directory
			main_directory : 'string',
			user_agent : 'string',
			one_by_one : 'boolean',
			// 篩選想要下載的章節標題關鍵字。例如"單行本"。
			chapter_filter : 'string',
			// 將開始/接續下載的章節編號。對已下載過的章節，必須配合 .recheck。
			start_chapter : 'number:natural',
			// 指定了要開始下載的列表序號。將會跳過這個訊號之前的作品。
			// 一般僅使用於命令列設定。default:1
			start_list_serial : 'number:natural|string',
			// 重新整理列表檔案 rearrange list file
			rearrange_list_file : 'boolean',
			// string: 如 "3s"
			chapter_time_interval : 'number:natural|string',
			MIN_LENGTH : 'number:natural',
			// 容許錯誤用的相關操作設定。
			MAX_ERROR_RETRY : 'number:natural',
			allow_EOI_error : 'boolean',
			skip_error : 'boolean',
			skip_chapter_data_error : 'boolean',

			preserve_work_page : 'boolean',
			preserve_chapter_page : 'boolean',
			remove_ebook_directory : 'boolean',

			// 代理伺服器 proxy_server: "username:password@hostname:port"
			proxy : 'string',

			// 漫畫下載完畢後壓縮圖像檔案。
			archive_images : 'boolean',
			// 完全沒有出現錯誤才壓縮圖像檔案。
			archive_all_good_images_only : 'boolean',
			// 壓縮圖像檔案之後，刪掉原先的圖像檔案。
			remove_images_after_archive : 'boolean',

			// 重新擷取用的相關操作設定。
			regenerate : 'boolean',
			reget_chapter : 'boolean',
			recheck : 'boolean|string:changed;multi_parts_changed',
			research : 'boolean',

			write_chapter_metadata : 'boolean',
			write_image_metadata : 'boolean',

			// 儲存偏好選項 save_options。
			save_preference : 'boolean',
		},

		set_agent : set_agent,
		data_of : start_get_data_of,

		is_stopping_now : is_stopping_now,
		stop_task : stop_task,
		continue_task : continue_task,

		start : start_downloading,
		set_server_list : set_server_list,
		parse_work_id : parse_work_id,
		get_work_list : get_work_list,
		get_work : get_work,
		get_work_data : get_work_data,
		save_work_data : save_work_data_file,
		get_image : get_image,

		parse_favorite_list_file : parse_favorite_list_file
	};

	Object.keys(Work_crawler_prototype.import_arg_hash).forEach(function(key) {
		this[key] = generate_argument_condition(this[key]);
	}, Work_crawler_prototype.import_arg_hash);
	// console.log(Work_crawler_prototype.import_arg_hash);

	Object.assign(Work_crawler.prototype, Work_crawler_prototype);
	// free
	Work_crawler_prototype = null;

	// --------------------------------------------------------------------------------------------

	function set_server_list(server_URL, callback, server_file) {
		if (Array.isArray(server_URL)) {
			// 直接設定。
			this.server_list = server_URL;
			typeof callback === 'function' && callback();
			return;
		}

		if (typeof server_URL === 'function') {
			server_URL = server_URL.call(this);
		}
		server_URL = this.full_URL(server_URL);

		var _this = this;

		// 取得圖庫伺服器列表。
		get_URL(server_URL, function(XMLHttp) {
			var html = XMLHttp.responseText;
			_this.server_list = _this.parse_server_list(html)
			// 確保有東西。
			.filter(function(server) {
				return !!server;
			}).unique();
			if (_this.server_list.length > 0) {
				library_namespace.log('Get ' + _this.server_list.length
						+ ' servers from [' + server_URL + ']: '
						+ _this.server_list.join(', '));
				if (server_file) {
					node_fs.writeFileSync(server_file, JSON
							.stringify(_this.server_list));
				}
			} else {
				library_namespace.error('set_server_list: No server get from ['
						+ server_URL + ']!');
			}

			typeof callback === 'function' && callback();
		}, this.charset, null, Object.assign({
			error_retry : this.MAX_ERROR_RETRY
		}, this.get_URL_options));
	}

	// front end #1: start downloading operation
	// callback(work_data)
	function start_downloading(work_id, callback) {
		if (!work_id) {
			library_namespace.log({
				T : [ '%1: 沒有輸入 work_id！', this.id ]
			});
			return;
		}

		if (this.charset
				&& !library_namespace.character.is_loaded(this.charset)) {
			// 載入需要的字元編碼。
			library_namespace.character.load(this.charset, start_downloading
					.bind(this, work_id, callback));
			return;
		}

		library_namespace.log([ this.id, ': ', (new Date).toISOString(), ' ', {
			// 開始下載/處理
			T : [ 'Starting %1, save to %2', work_id, this.main_directory ]
		} ]);
		// prepare work directory.
		library_namespace.create_directory(this.main_directory);
		// check if this.main_directory exists.
		// e.g., set "E:\directory\" but "E:\" do not exists.
		if (!library_namespace.directory_exists(this.main_directory)) {
			library_namespace.error({
				T : [ 'Can not create base directory: %1',
				//
				this.main_directory ]
			});
			return;
		}

		if (!this.server_URL) {
			this.parse_work_id(work_id, callback);
			return;
		}

		var _this = this,
		// host_file
		server_file = this.main_directory + 'servers.json';

		if (this.use_server_cache
		// host_list
		&& (this.server_list = library_namespace.get_JSON(server_file))) {
			// use cache of host list. 不每一次重新取得伺服器列表。
			this.parse_work_id(work_id, callback);
			return;
		}

		this.set_server_list(this.server_URL, function() {
			_this.parse_work_id(work_id, callback);
		}, server_file);
	}

	/**
	 * front end #2: start get work information operation. e.g., search only, no
	 * download.
	 * 
	 * @param {String}work_id
	 *            作品標題/作品名稱
	 * @param {Function}callback
	 *            callback function(work_data).
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 * 
	 * @examples <code>

	var work_crawler = new CeL.work_crawler(configurations);
	work_crawler.data_of(work_id, function(work_data) {
		console.log(work_data);
	});

	 * </code>
	 */
	function start_get_data_of(work_id, callback, options) {
		function start_get_data_of_callback(work_data) {
			typeof callback === 'function' && callback.call(this, work_data);
		}
		start_get_data_of_callback.options = Object.assign({
			get_data_only : true
		}, options);

		// TODO: full test
		this.start(work_id, start_get_data_of_callback);
	}

	// ----------------------------------------------------------------------------

	// modify from CeL.application.net.Ajax
	// 本函式將使用之 encodeURIComponent()，包含對 charset 之處理。
	// @see function_placeholder() @ module.js
	var encode_URI_component = function(string, encoding) {
		if (library_namespace.character) {
			library_namespace.debug('採用 ' + library_namespace.Class
			// 有則用之。 use CeL.data.character.encode_URI_component()
			+ '.character.encode_URI_component', 1, library_namespace.Class
			// module name
			+ '.application.net.work_crawler');
			encode_URI_component = library_namespace.character.encode_URI_component;
			return encode_URI_component(string, encoding);
		}
		return encodeURIComponent(string);
	};

	function full_URL_of_path(url, base_data, base_data_2) {
		if (typeof url === 'function') {
			url = url.call(this, base_data, base_data_2);
		} else if (base_data) {
			base_data = encode_URI_component(base_data, url.charset
					|| this.charset);
			if (url.URL) {
				url.URL += base_data
			} else {
				url += base_data;
			}
		}

		// combine urls
		if (typeof url === 'string' && !url.includes('://')) {
			if (url.startsWith('/')) {
				if (url.startsWith('//')) {
					// 借用 base_URL 之 protocol。
					return this.base_URL.match(/^(https?:)\/\//)[1] + url;
				}
				// url = url.replace(/^[\\\/]+/g, '');
				// 只留存 base_URL 之網域名稱。
				return this.base_URL.match(/^https?:\/\/[^\/]+/)[0] + url;
			} else {
				// 去掉開頭的 "./"
				url = url.replace(/^\.\//, '');
			}
			if (url.startsWith('.')) {
				library_namespace.warn('full_URL_of_path: '
						+ gettext('無效的網址：%1', url));
			}
			url = this.base_URL + url;
		} else if (url.URL) {
			url.URL = this.full_URL(url.URL);
		}

		return url;
	}

	// /./ doesn't include "\r", can't preserv line separator.
	var PATTERN_favorite_list_token = /(?:\r?\n|^)(\s*\/\*[\s\S]*?\*\/([^\r\n]*)|[^\r\n]*)/g;
	// 解析及操作列表檔案的功能。 最愛清單 / 圖書館 / 書籤 / 書庫
	function parse_favorite_list(work_list_text, options) {
		if (options === true) {
			options = {
				rearrange_list : true
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		var remove_list = options.remove, rearrange_list = options.rearrange_list
				|| remove_list;
		if (remove_list && !Array.isArray(remove_list)) {
			remove_list = [ remove_list ];
		}
		var get_parsed = options.get_parsed || rearrange_list;

		var matched, work_list = [], work_hash = library_namespace
				.null_Object(), parsed;
		work_list.blank = work_list.comments = work_list.duplicated = 0;
		work_list.work_indexes = [];
		if (get_parsed) {
			parsed = work_list.parsed = [];
			parsed.duplicated = [];
			parsed.line_separator = library_namespace
					.determine_line_separator(work_list_text);
			parsed.toString = function() {
				return this.join(this.line_separator);
			};
			// /(?:^|\n).../ 會無限次 match '\n...'，
			// 故改 /(?:\n|^)
			// 但這遇到 '\n...' 會少一個 ''。
			if (/^\r?\n/.test(work_list_text)) {
				parsed.push('');
			}
		}

		if (!work_list_text) {
			// PATTERN_favorite_list_token 會無限次 match ''。
			return work_list;
		}

		while (matched = PATTERN_favorite_list_token.exec(work_list_text)) {
			// or work id
			var work_title = matched[1], remove_it = false;
			if (parsed) {
				// `work_title` includes "\r"
				parsed.push(work_title);
			}

			// .trim() 會去掉 "\r", BOM (byte order mark)
			work_title = work_title.trim();

			// 定義列表檔案的規範，可以統合設定檔案的規範。
			if (!work_title) {
				// Skip blank line
				work_list.blank++;
			} else if (work_title.startsWith('#')
					|| work_title.startsWith('//')) {
				// Skip comments
				work_list.comments++;
			} else if (work_title.startsWith('/*')) {
				work_list.comments++;
				if (matched[2] && (matched[2] = matched[2].trim())) {
					library_namespace.warn(gettext('作品列表區塊注解 "*/" 後面的"%1"會被忽略',
							matched[2]));
				}
			} else if ((work_title in work_hash)
					|| (remove_it = remove_list
							&& remove_list.includes(work_title))) {
				if (!remove_it)
					work_list.duplicated++;
				if (parsed) {
					// 改變原先的 list data。
					if (!remove_it)
						parsed.duplicated.push(work_title);
					if (rearrange_list) {
						if (typeof rearrange_list === 'function') {
							rearrange_list(parsed);
						} else {
							// comment out this work title / work id
							parsed[parsed.length - 1] = '#'
									+ parsed[parsed.length - 1];
						}
					}
				}
			} else {
				// verify work titles: .unique(), 避免同一次作業中重複下載相同的作品。
				work_hash[work_title] = null;
				work_list.push(work_title);
			}
		}

		// need `delete work_list.parsed` yourself
		return work_list;
	}

	// parse and rearrange favorite list file
	function parse_favorite_list_file(favorite_list_file_path,
			rearrange_list_file) {
		var work_list = library_namespace.fs_read(favorite_list_file_path);
		if (!work_list) {
			// 若是檔案不存在，.fs_read() 可能會回傳 undefined。
			library_namespace.warn(this.id + ': '
					+ gettext('無法讀取列表檔案：%1', favorite_list_file_path));
			return [];
		}

		if (rearrange_list_file === undefined) {
			rearrange_list_file = this.rearrange_list_file;
		}
		if (rearrange_list_file) {
			library_namespace.debug(this.id + ': '
					+ gettext('重新整理列表檔案：%1', favorite_list_file_path));
		}
		work_list = parse_favorite_list(work_list.toString(), {
			rearrange_list : rearrange_list_file
		});

		if (rearrange_list_file) {
			if (work_list.duplicated > 0) {
				// console.log(work_list.parsed);
				work_list.parsed = work_list.parsed.toString();
				library_namespace.info(this.id
						+ ': '
						+ gettext(typeof rearrange_list_file === 'function'
						// rearrange_list_file 整合報告
						? '重新整理列表檔案 [%1]，處理了%2個作品。'
								: '重新整理列表檔案 [%1]，注解排除了%2個作品。',
								favorite_list_file_path, work_list.duplicated));
				library_namespace.write_file(favorite_list_file_path,
						work_list.parsed);
			} else {
				library_namespace.debug(this.id
						+ ': '
						+ gettext('重新整理列表檔案 [%1]，未作改變。'
								+ favorite_list_file_path));
			}
			// free
			delete work_list.parsed;
		}

		return work_list;
	}

	function parse_work_id(work_id, callback) {
		work_id = String(work_id);

		if (this.convert_id && this.convert_id[work_id]) {
			// 因為 convert_id[work_id]() 可能回傳 list，因此需要以 get_work_list() 特別處理。
			this.get_work_list([ work_id ], callback);
			return;
		}

		if (work_id
		// list=filename
		.startsWith('l=') || node_fs.existsSync(work_id)) {
			// e.g.,
			// node 各漫畫網站工具檔.js l=各漫畫網站工具檔.txt
			// node 各漫畫網站工具檔.js 各漫畫網站工具檔.txt
			// @see http://ac.qq.com/Rank/comicRank/type/pgv
			if (work_id.startsWith('l=')) {
				work_id = work_id.slice('l='.length);
			}
			if (/\.js$/i.test(work_id)) {
				library_namespace.warn(this.id + ': '
						+ gettext('您可能錯把下載工具檔當作了列表檔案：%1', work_id));
				[ '.lst', '.txt' ].some(function(extension) {
					var work_list_file = work_id.replace(/\.js$/i, extension);
					if (library_namespace.storage.file_exists(work_list_file)) {
						library_namespace.info(this.id + ': '
								+ gettext('改採用列表檔案：%1', work_list_file));
						work_id = work_list_file;
						return true;
					}
				}, this);
			}
			var work_list = this.parse_favorite_list_file(work_id);

			this.get_work_list(work_list, callback);
			return;
		}

		if (work_id
		// 跳過來自命令列參數的手動設定。
		&& !(work_id.match(/^[^=]*/)[0] in this.import_arg_hash)) {
			if (false && this.need_create_ebook) {
				this.get_work_list([ work_id ], callback);
			} else {
				// e.g.,
				// node 各漫畫網站工具檔.js 12345
				// node 各漫畫網站工具檔.js ABC
				this.get_work(work_id, callback);
			}
			return;
		}

		library_namespace.error('parse_work_id: Invalid work id: ' + work_id);
		typeof callback === 'function' && callback();
	}

	function get_work_list(work_list, callback) {
		// console.log(work_list);
		// 真正處理的作品數。
		var work_count = 0, all_work_status = library_namespace.null_Object(),
		//
		start_list_serial = this.start_list_serial;

		// console.log(start_list_serial);
		if (start_list_serial && !(start_list_serial >= 1)) {
			// start_list_serial=work_title
			start_list_serial = work_list.indexOf(start_list_serial);
			if (start_list_serial >= 0) {
				// start_list_serial starts from 1
				start_list_serial++;
			}
		}

		if (Array.isArray(this.work_list_now)
				&& this.work_list_now !== work_list) {
			library_namespace.error(gettext(
					'警告：正下載以"%2"開始、長度 %1 的作品列表中。重複下載作品列表可能造成錯誤！',
					this.work_list_now.length, this.work_list_now[0]));
		}

		this.work_list_now = work_list;

		// assert: Array.isArray(work_list)
		work_list.run_async(function for_each_title(get_next_work, work_title,
				this_index) {
			// 解開/插入作品。
			function insert_id_list(id_list) {
				if (Array.isArray(id_list) && id_list.length > 0) {
					library_namespace.info('get_work_list: ' + work_title
					// 插入list。
					+ ' → ' + id_list.join(', '));
					id_list.unshift(this_index, 0);
					Array.prototype.splice.apply(work_list, id_list);
				}
				get_next_work();
			}

			// work_list.list_serial: this.work_list_now.list_serial
			// this_index: convert to serial, and is next index
			work_list.list_serial = ++this_index;
			work_title = work_title.trim();
			if (!work_title
			// 指定了要開始下載的列表序號。將會跳過這個訊號之前的作品。
			|| /* start_list_serial > 0 && */this_index < start_list_serial) {
				// 直接進入下一個作品 work_title。
				get_next_work();
				return;
			}

			// 特別處理特定id。
			var id_converter = this.convert_id && this.convert_id[work_title];

			if (typeof id_converter === 'function') {
				library_namespace.debug('Using convert_id[' + work_title + ']',
						3, 'get_work_list');
				// convert special work id:
				// convert_id:{id_type:function(insert_id_list,get_label){;insert_id_list(id_list);}}
				// insert_id_list: 提供異序(asynchronously,不同時)使用。
				// 警告: 需要自行呼叫 insert_id_list(id_list);
				id_converter.call(this, insert_id_list, get_label);
				return;
			}

			if (library_namespace.is_Object(id_converter) && id_converter.url
					&& typeof id_converter.parser === 'function') {
				library_namespace.debug(
				// 從指定網址 id_converter.url 得到網頁內容後，
				// 丟給解析器 id_converter.parser 解析出作品列表。
				'Using convert_id[' + work_title + '] via url: '
						+ id_converter.url, 3, 'get_work_list');
				// convert_id:{id_type:{url:'',parser:function(html,get_label){...}}}
				get_URL(this.full_URL(id_converter.url), function(XMLHttp) {
					var id_list = id_converter.parser.call(this,
							XMLHttp.responseText, get_label);
					insert_id_list(id_list);
				}, this.charset, null, Object.assign({
					error_retry : this.MAX_ERROR_RETRY
				}, this.get_URL_options));
				return;
			}

			if (id_converter) {
				this.onerror('get_work_list: Invalid id converter for '
						+ work_title, work_title);
				typeof callback === 'function' && callback(all_work_status);
				return Work_crawler.THROWED;
			}

			work_count++;
			library_namespace.log([ this.id, ': ', {
				T : [ 'Download %1: %2', work_count
				// 下載作品列表
				+ (work_count === this_index ? '' : '/' + this_index)
				//
				+ '/' + work_list.length, work_title ],
				S : {
					color : 'magenta',
					backgroundColor : 'cyan'
				}
			} ]);
			this.get_work(work_title, function(work_data) {
				var work_status = set_work_status(work_data);
				if (work_status) {
					// 把需要報告的狀態export到{Array}work_status。
					// assert: {Array}work_status
					if (work_data.id) {
						work_status.id = work_data.id;
						work_status.url = this.full_URL(this.work_URL,
								work_data.id);
					}
					work_status.title = work_data.title || work_title;
					var last_update = [];
					this.last_update_status_keys.forEach(function(key) {
						if (work_data[key])
							last_update.push(key + ': ' + work_data[key]);
					});
					work_status.last_update = last_update.unique().join(', ');
					// console.log(work_status);
					all_work_status[work_status.title] = work_status;
				}
				get_next_work();
			});

		}, function all_work_done() {
			delete this.work_list_now;
			library_namespace.log(this.id + ': All ' + work_list.length
					+ ' works done. ' + (new Date).toISOString()
					+ ' 所有作品下載作業結束.');
			var work_status_titles = Object.keys(all_work_status);
			if (work_status_titles.length > 0) {
				library_namespace.create_directory(
				// 先創建記錄用目錄。
				this.main_directory + this.log_directory_name);
				try {
					node_fs.writeFileSync(this.main_directory
							+ this.log_directory_name + this.report_file_JSON,
							JSON.stringify({
								date : (new Date).toISOString(),
								status : all_work_status
							}));
				} catch (e) {
					// TODO: handle exception
				}

				var report_file = this.main_directory + this.log_directory_name
						+ this.report_file,
				// 產生網頁形式的報告檔。
				reports = [ '<html>', '<head>',
				// http://mdn.beonex.com/en/Web_development/Historical_artifacts_to_avoid.html
				// https://developer.mozilla.org/zh-TW/docs/Web_%E9%96%8B%E7%99%BC/Historical_artifacts_to_avoid
				'<meta charset="UTF-8" />', '<style>',
						'table{border-collapse:collapse}',
						'table,th,td{border:1px solid #55f;padding:.2em}',
						'</style>', '</head>', '<body>', '<h2>',
						'<a href="' + this.base_URL + '">',
						this.site_name || this.id, '</a>', '</h2>', '<table>',
						'<tr><th>#</th><th>id</th>',
						'<th>title</th><th>status</th>',
						'<th>last update</th></tr>' ];
				library_namespace.info(this.id + ': '
				//
				+ work_status_titles.length + ' notes: ' + report_file);
				work_status_titles.forEach(function(work_title, index) {
					var work_status = all_work_status[work_title];
					// assert: {Array}work_status
					library_namespace.info(work_title + ': '
							+ work_status.join(', '));
					var work_status_report = work_status.map(function(status) {
						switch (status) {
						case 'not found':
							status = '<b style="color:#f44;">' + status
									+ '</b>';
							break;

						case 'limited':
							status = '<b style="color:#bb0;">' + status
									+ '</b>';
							break;

						case 'finished':
							status = '<b style="color:#88f;">' + status
									+ '</b>';
							break;

						default:
							break;
						}

						return status;
					});
					reports.push('<tr><td>'
							+ (index + 1)
							+ '</td><td>'
							+ (work_status.id || '')
							+ '</td><td>'
							+ (work_status.url ? '<a href="' + work_status.url
									+ '">' + work_status.title + '</a>'
									: work_status.title) + '</td><td>'
							+ work_status_report.join('<br />') + '</td><td>'
							+ work_status.last_update + '</td></tr>');
				});
				reports.push('</table>', '</body></html>');
				try {
					node_fs.writeFileSync(report_file, reports
							.join(library_namespace.env.line_separator));
				} catch (e) {
					// TODO: handle exception
				}

			} else {
				all_work_status = undefined;
			}
			typeof callback === 'function' && callback(all_work_status);
		}, this);
	}

	// ----------------------------------------------------------------------------

	var PATTERN_url_for_baidu = /([\d_]+)(?:\.html|\/(?:index\.html)?)?$/;
	if (library_namespace.is_debug()) {
		[ 'http://www.host/0/123/', 'http://www.host/123/index.html',
				'http://www.host/123.html' ].forEach(function(url) {
			console.assert('123' === 'http://www.host/123/'
					.match(PATTERN_url_for_baidu)[1]);
		});
	}

	var parse_search_result_set = {
		// baidu cse
		baidu : function(html, get_label) {
			// console.log(html);
			var id_data = [],
			// {Array}id_list = [id,id,...]
			id_list = [], get_next_between = html.find_between(
					' cpos="title" href="', '</a>'), text;

			while ((text = get_next_between()) !== undefined) {
				// console.log(text);
				// 從URL網址中解析出作品id。
				var matched = text.between(null, '"').match(
						PATTERN_url_for_baidu);
				// console.log(matched);
				if (!matched)
					continue;
				id_list.push(matched[1]);
				// 從URL網址中解析出作品title。
				matched = text.match(/ title="([^"]+)"/);
				if (matched) {
					matched = matched[1];
				} else {
					// e.g., omanhua.js: <em>择</em><em>天</em><em>记</em>
					matched = text.between('<em>', {
						tail : '</em>'
					});
				}
				// console.log(matched);
				if (matched && (matched = get_label(matched))
				// 只取第一個符合的。
				// 避免如 http://host/123/, http://host/123/456.htm
				&& !id_data.includes(matched)) {
					id_data.push(matched);
				} else {
					id_list.pop();
				}
			}

			// console.log([ id_list, id_data ]);
			return [ id_list, id_data ];
		}
	};

	// ----------------------------------------------------------------------------

	function set_work_status(work_data, status) {
		if (status) {
			if (!work_data.process_status)
				work_data.process_status = [];
			work_data.process_status.push(status);
		}
		return work_data.process_status;
	}

	// 儲存本次作業到現在的作品資訊到檔案。 cache / save work data file
	function save_work_data_file(work_data) {
		if (!work_data.data_file)
			return;

		// 預防(work_data.directory)不存在。
		library_namespace.create_directory(work_data.directory);

		var ebook = work_data[this.KEY_EBOOK];
		// 為了預防 TypeError: Converting circular structure to JSON
		// ebook 結構中可能會有 circular。
		delete work_data[this.KEY_EBOOK];
		// 避免當 work_data 過大而出現崩潰的情況，造成資料檔案被清空。因此先試試 JSON.stringify()。
		var data_to_write = Buffer.from(JSON.stringify(work_data));
		if (this.bakeup_work_data) {
			var bakeup_file = work_data.data_file + '.bak';
			library_namespace.remove_file(bakeup_file);
			library_namespace.move_fso(work_data.data_file, bakeup_file);
		}
		try {
			node_fs.writeFileSync(work_data.data_file, data_to_write);
		} catch (e) {
			library_namespace
					.error('save_work_data_file: Can not save work data of '
							+ (work_data.title || work_data.id) + '!');
			library_namespace.error(e);
		}
		// revert
		if (ebook)
			work_data[this.KEY_EBOOK] = ebook;
	}

	function get_work(work_title, callback) {
		this.running = true;
		var _this = this;

		// 執行順序: finish() → finish_up()
		function finish_up(work_data) {
			if (work_data && work_data.title) {
				// 最後紀錄。
				_this.save_work_data(work_data);
				if (_this.need_create_ebook
				// 未找到時沒有 work_data。
				&& work_data.chapter_count >= 1) {
					_this.pack_ebook(work_data);
				}
				if (false && _this.need_create_ebook && !_this.preserve_cache) {
					// 注意: 若是刪除ebook目錄，也會把media資源檔刪掉。
					// 因此只能刪除造出來的HTML網頁檔案。
					library_namespace.fs_remove(
					// @see CeL.application.storage.EPUB
					work_data[this.KEY_EBOOK].path.root, true);
				}
			} else if (work_data && work_data.titles) {
				// @see ((approximate_title))
				set_work_status(work_data, 'found search result: '
						+ work_data.titles.length + ' titles: '
						+ work_data.titles.map(function(item) {
							return item[0] + ':' + item[1];
						}).join('; '));
			} else {
				var status = work_data;
				work_data = library_namespace.null_Object();
				set_work_status(work_data,
						status && typeof status === 'string' ? status
								: 'not found');
			}

			if (typeof _this.finish_up === 'function') {
				_this.finish_up(work_data);
			}
			typeof callback === 'function' && callback.call(_this, work_data);
			_this.running = false;
		}
		if (callback && callback.options) {
			// e.g., for .get_data_only
			finish_up.options = callback.options;
		}

		// --------------------------------------

		// 先試試看能否取得 work id。
		var work_id = this.extract_work_id(work_title)
				|| this.extract_work_id_from_URL(work_title);
		if (work_id) {
			this.get_work_data(work_id, finish_up);
			return;
		}

		// --------------------------------------

		function finish(no_cache) {
			if (!no_cache) {
				// write cache
				library_namespace.write_file(search_result_file, search_result);
			}
			search_result = search_result[work_title];
			var search_result_id = _this.id_of_search_result;
			if (search_result_id) {
				// console.log([ search_result_id, search_result ]);
				search_result = typeof search_result_id === 'function' ? _this
						.id_of_search_result(search_result)
						: search_result ? search_result[search_result_id]
								: search_result;
			}
			_this.get_work_data({
				id : search_result,
				title : work_title
			}, finish_up);
		}

		var search_result_file = this.main_directory
				+ this.search_result_file_name,
		// search cache
		// 檢查看看之前是否有取得過。
		search_result = this.get_search_result()
				|| library_namespace.null_Object();
		library_namespace.debug('search result file: ' + search_result_file, 2,
				'get_work');
		// console.log(search_result);

		// assert: work_title前後不應包含space
		work_title = work_title.trim();
		if (this.research) {
			library_namespace.log(this.id + ': Re-search title: [' + work_title
					+ ']');
		} else if (search_result[work_title]) {
			// 已經搜尋過此作品標題。
			library_namespace.log(this.id + ': ' + gettext('已緩存作品id：')
					+ work_title + '→'
					+ JSON.stringify(search_result[work_title]));
			finish(true);
			return;
		}

		var search_url_data = this.search_URL, search_URL_string, post_data;
		if (!search_url_data || typeof this.parse_search_result !== 'function') {
			if (callback && callback.options) {
				// e.g., for .get_data_only
				finish_up('本線上作品網站 ' + this.id + ' 的模組未提供搜尋功能。');
				return;
			}

			search_url_data = library_namespace.null_Object();
			search_url_data[work_title] = '';
			this.onerror('本線上作品網站 ' + this.id
					+ ' 的模組未提供搜尋功能。請輸入作品 id，或手動設定/編輯 [' + work_title
					+ '] 之 id 於 ' + search_result_file + '\n (e.g., '
					+ JSON.stringify(search_url_data) + ')', work_title);
			finish(true);
			return Work_crawler.THROWED;
		}
		if (typeof search_url_data === 'function') {
			// 通過關鍵詞搜索作品。 解析 作品名稱 → 作品id
			// search_url_data = search_url_data.call(this, work_title,
			// get_label);
			// return [ search_url_data, POST data ]
			search_url_data = this.search_URL(work_title, get_label);
			if (Array.isArray(search_url_data)) {
				// use POST method
				post_data = search_url_data[1];
				search_url_data = search_url_data[0];
			}
			search_url_data = this.full_URL(search_url_data);
			search_URL_string = search_url_data.URL || search_url_data;
		} else {
			// default:
			// assert: typeof search_url_data==='string'
			// || search_url_data==={URL:'',charset:''}
			// TODO: .replace(/%t/g, work_title)
			search_url_data = this.full_URL(search_url_data);
			// 對 {Object}search_url_data，不可動到 search_url_data。
			search_URL_string = (search_url_data.URL || search_url_data)
					+ encode_URI_component(
					// e.g., 找不到"隔离带 2"，須找"隔离带"。
					work_title.replace(/\s+\d{1,2}$/, '')
					// e.g., "Knight's & Magic" @ 小説を読もう！ || 小説検索
					.replace(/&/g, ''), search_url_data.charset || this.charset);
		}

		// console.log(search_url_data);
		this.set_agent(search_URL_string);
		// console.log(this.get_URL_options);
		get_URL(search_URL_string, function(XMLHttp) {
			_this.set_agent();
			if (!XMLHttp.responseText) {
				library_namespace.error('get_work: 沒有搜索結果（網站暫時不可用或改版？）: ['
						+ work_title + ']');
				finish_up('沒有搜索結果。網站暫時不可用或改版？');
				return;
			}
			// this.parse_search_result() returns:
			// [ {Array}id_list, 與id_list相對應之{Array}或{Object} ]
			// e.g., [ [id,id,...], [title,title,...] ]
			// e.g., [ [id,id,...], [data,data,...] ]
			// e.g., [ [id,id,...], {id:data,id:data,...} ]
			var id_data;
			try {
				// console.log(XMLHttp.responseText);
				// console.log(XMLHttp.buffer.toString(_this.charset));
				id_data = _this.parse_search_result(XMLHttp.responseText,
						get_label, work_title);
				if (id_data === undefined) {
					_this.onerror('get_work.parse_search_result:'
							+ ' 作品網址解析函數 parse_search_result 未回傳結果！',
							work_title);
					finish_up('作品網址解析函數 parse_search_result 未回傳結果！');
					return Work_crawler.THROWED;
				}
				if (!id_data) {
					_this.onerror('get_work.parse_search_result:'
							+ ' 作品網址解析函數 parse_search_result 未回傳正規結果！',
							work_title);
					finish_up('作品網址解析函數 parse_search_result 未回傳正規結果！');
					return Work_crawler.THROWED;
				}
			} catch (e) {
				if (e)
					console.trace(e);
				library_namespace
						.error('get_work.parse_search_result: 無法解析搜尋作品['
								+ work_title + ']之結果！');
				finish_up('無法解析搜尋作品之結果');
				return;
			}
			// e.g., {id:data,id:data,...}
			if (library_namespace.is_Object(id_data)) {
				id_data = [ Object.keys(id_data), id_data ];
			}
			// {Array}id_list = [id,id,...]
			var id_list = id_data[0] || [];
			// console.log(id_data);
			id_data = id_data[1];
			if (id_list.length !== 1) {
				library_namespace.warn('[' + work_title + ']: Get '
				//
				+ id_list.length + ' works: ' + JSON.stringify(id_data));
			}

			// 近似的標題。
			var approximate_title = [];
			if (id_list.every(function(id, index) {
				// console.log(id);
				var title;
				if (library_namespace.is_Object(id)) {
					title = id;
				} else if (Array.isArray(id_data)
						&& (id_list.length === id_data.length || isNaN(id))) {
					title = id_data[index];
				} else {
					title = id_data[id] || id_data[index];
				}

				var search_result_id = _this.title_of_search_result;
				if (search_result_id) {
					title = typeof search_result_id === 'function' ? _this
							.title_of_search_result(title)
							: title ? title[search_result_id] : title;
				}
				title = title.trim();
				// console.log([ 'compare', title, work_title ]);
				// 找看看是否有完全相同的title。
				if (title !== work_title) {
					if (title.includes(work_title) || title.replace(/\s/g, '')
					//
					=== work_title.replace(/\s/g, '')) {
						approximate_title.push([ id, title ]);
					}
					return true;
				}
				id_list = id;
			})) {
				if (approximate_title.length !== 1) {
					library_namespace.error(_this.id + ': '
					// failed: not only one
					+ (approximate_title.length === 0 ? '未搜尋到' : '找到'
					//
					+ approximate_title.length + '個') + '與[' + work_title
					// 相匹配
					+ ']相符者。' + (approximate_title.length === 0
					// is_latin
					&& /^[\x20-\x7e]+$/.test(work_title) ?
					//
					'若您輸入的是 work id，請回報議題讓下載工具設定 extract_work_id()，以免將 work id 誤判為 work title。'
					//
					: ''));
					finish_up(approximate_title.length > 0 && {
						titles : approximate_title
					});
					return;
				}
				approximate_title = approximate_title[0];
				library_namespace.warn(library_namespace.display_align({
					'Use title:' : work_title,
					'→' : approximate_title[1]
				}));
				work_title = approximate_title[1];
				id_list = approximate_title[0];
			}

			// 已確認僅找到唯一id。
			id_data = id_data[id_list];
			search_result[work_title] = typeof id_data === 'object'
			// {Array}或{Object}
			? id_data : id_list;
			if (typeof _this.post_get_work_id === 'function') {
				// post_get_work_id :
				// function(callback, work_title, search_result) {}
				_this.post_get_work_id(finish, work_title, search_result);
			} else {
				finish();
			}

		}, search_url_data.charset || this.charset, post_data, Object.assign({
			error_retry : this.MAX_ERROR_RETRY
		}, this.get_URL_options));
	}

	// node.innerText
	function get_label(html) {
		return html ? library_namespace.HTML_to_Unicode(
				html.replace(/<!--[\s\S]*?-->/g, '').replace(
						/<(script|style)[^<>]*>[\s\S]*?<\/\1>/g, '').replace(
						/\s*<br(?:\/| [^<>]*)?>/ig, '\n').replace(
						/<\/?[a-z][^<>]*>/g, '')
				// incase 以"\r"為主。 e.g., 起点中文网
				.replace(/\r\n?/g, '\n')).trim().replace(
				/[\s\u200B]+$|^[\s\u200B]+/g, '')
		// .replace(/\s{2,}/g, ' ').replace(/\s?\n+/g, '\n')
		: '';
	}

	function extract_work_data(work_data, html, PATTERN_work_data, overwrite) {
		if (!PATTERN_work_data) {
			PATTERN_work_data =
			// 由 meta data 取得作品資訊。 e.g.,
			// <meta property="og:title" content="《作品》" />
			// <meta property="og:novel:author" content="作者" />
			// <meta name="Keywords" content="~" />
			// <meta property="og:site_name" name="application-name"
			// content="卡提諾論壇"/>
			// matched: [ all tag, key, value ]
			/<meta\s+(?:property|name)=["'](?:[^<>"']+:)?([^<>"':]+)["']\s[^<>]*?content=["']([^<>"']+)/g;
			html = html.between(null, '</head>') || html;
		}

		var matched;
		// matched: [ all, key, value ]
		while (matched = PATTERN_work_data.exec(html)) {
			// delete matched.input;
			// console.log(matched);

			var key = get_label(matched[1]).replace(/[:：︰\s]+$/, '').trim();
			// default: do not overwrite
			if (!key || !overwrite && work_data[key])
				continue;

			var value = matched[2], link = value.match(
			// 從連結的title取得更完整的資訊。
			/^[:：︰\s]*<a [^<>]*?title=["']([^<>"']+)["'][^<>]*>([\s\S]*?)<\/a>\s*$/
			//
			);
			if (link) {
				link[1] = get_label(link[1]);
				link[2] = get_label(link[2]);
				if (link[1].length > link[2].length) {
					value = link[1];
				}
			}
			value = get_label(value).replace(/^[:：︰\s]+/, '').trim();
			if (value) {
				work_data[key] = value.replace(/ {3,}/g, '  ');
			}
		}
	}

	// this.chapter_time_interval: 下載章節資訊/章節內容前的等待時間。
	// usage: var chapter_time_interval =
	// this.get_chapter_time_interval(argument_1, work_data)
	function get_chapter_time_interval(argument_1, work_data) {
		var chapter_time_interval = this.chapter_time_interval;
		if (typeof chapter_time_interval === 'function') {
			// 採用函數可以提供亂數值的間隔。
			chapter_time_interval = this.chapter_time_interval(argument_1,
					work_data);
		}
		chapter_time_interval = library_namespace
				.to_millisecond(chapter_time_interval);

		if (chapter_time_interval > 0
		// this.last_fetch_time = Date.now();
		&& this.last_fetch_time > 0) {
			chapter_time_interval -= Date.now() - this.last_fetch_time;
			return chapter_time_interval > 0 && chapter_time_interval;
		}
	}

	var null_XMLHttp = {
		responseText : ''
	};

	function get_work_data(work_id, callback, error_count) {
		var work_title;
		// 預防並列執行的時候出現交叉干擾。
		this.running = true;
		if (library_namespace.is_Object(work_id)) {
			work_title = work_id.title;
			work_id = work_id.id;
		}
		// console.trace([ work_id, work_title ]);
		process.title = '下載' + work_title + ' - 資訊 @ ' + this.id;

		var _this = this, work_URL = this.full_URL(this.work_URL, work_id), work_data;
		library_namespace.debug('work_URL: ' + work_URL, 2, 'get_work_data');

		get_work_page();

		// ----------------------------------------------------------

		function get_work_page() {
			if (_this.skip_get_work_page) {
				process_work_data(null_XMLHttp);
				return;
			}
			get_URL(work_URL, process_work_data, _this.charset, null,
					_this.get_URL_options);
		}

		function process_work_data(XMLHttp) {
			// console.log(XMLHttp);
			_this.last_fetch_time = Date.now();
			var html = XMLHttp.responseText;
			if (!html && !_this.skip_get_work_page) {
				library_namespace
						.error('Failed to get work data of '
								+ work_id
								+ (XMLHttp.buffer
										&& XMLHttp.buffer.length === 0 ? ': Nothing get'
										: ''));
				if (error_count === _this.MAX_ERROR_RETRY) {
					_this.onerror(_this.id + ': ' + _this.MESSAGE_RE_DOWNLOAD,
							_this.id);
					typeof callback === 'function' && callback({
						title : work_title
					});
					return Work_crawler.THROWED;
				}
				error_count = (error_count | 0) + 1;
				library_namespace.log('process_work_data: '
						+ gettext('Retry %1', error_count + '/'
								+ _this.MAX_ERROR_RETRY) + '...');
				_this.get_work_data({
					// 书号
					id : work_id,
					title : work_title
				}, callback, error_count);
				return;
			}

			try {
				// 作品詳情。
				work_data = _this.parse_work_data(html, get_label,
						extract_work_data
				// , { id : work_id, title : work_title, url : work_URL }
				);
				if (work_data === _this.REGET_PAGE) {
					// 需要重新讀取頁面。e.g., 502
					var chapter_time_interval = _this
							.get_chapter_time_interval(work_URL, work_data);
					process.stdout.write('process_work_data: '
							+ (chapter_time_interval > 0 ? 'Wait '
									+ library_namespace.age_of(0,
											chapter_time_interval) + ' to '
									: '') + 'reget page [' + work_URL
							+ ']...\r');
					if (chapter_time_interval > 0) {
						setTimeout(get_work_page, chapter_time_interval);
					} else {
						get_work_page();
					}
					return;
				}

			} catch (e) {
				// throw e;
				var warning = 'process_work_data: ' + (work_title || work_id)
						+ ': ' + e;
				_this.onwarning(warning);
				typeof callback === 'function' && callback({
					title : work_title
				});
				return;
			}

			if (!work_data.title) {
				work_data.title = work_title;
			} else if (!work_title
			// cache work title: 方便下次從 search cache 反查。
			&& typeof _this.parse_search_result !== 'function') {
				// search cache
				var search_result = _this.get_search_result();
				if (!search_result[work_data.title]) {
					search_result[work_data.title] = work_id;
					library_namespace.write_file(search_result_file,
							search_result);
				}
			}

			// 從已設定的網站名稱挑選一個可用的。
			if (work_data.site_name) {
				_this.site_name = work_data.site_name;
			} else if (_this.site_name) {
				work_data.site_name = _this.site_name;
			}
			// 基本檢測。 e.g., "NOT FOUND", undefined
			if (PATTERN_non_CJK.test(work_data.title)
			// e.g., "THE NEW GATE", "Knight's & Magic"
			&& !/[a-z]+ [a-z\d&]/i.test(work_data.title)
			// e.g., "Eje(c)t"
			&& !/[()]/.test(work_data.title)
			// e.g., "H-Mate"
			&& !/[a-z\-][A-Z]/.test(work_data.title)
			// .title: 必要屬性：須配合網站平台更改。
			&& PATTERN_non_CJK.test(work_id)) {
				if (!_this.skip_get_work_page || work_data.title)
					library_namespace.warn('process_work_data: '
							+ (work_data.title ? '非中日文' : '無法取得/未設定')
							+ '作品標題: ' + work_data.title + ' (id: ' + work_id
							+ ')');
			}

			// 自動添加之作業用屬性：
			work_data.id = work_id;
			work_data.last_download = {
				// {Date}
				date : (new Date).toISOString(),
				// {Natural}chapter_NO
				chapter : _this.start_chapter
			};
			// source URL of work
			work_data.url = work_URL;

			process.title = '下載' + work_data.title + ' - 目次 @ ' + _this.id;
			work_data.directory_name = library_namespace.to_file_name(
			// 允許自訂作品目錄名/命名資料夾。
			work_data.directory_name
			// default 作品目錄名/命名資料夾。
			|| (typeof work_data.directory_id === 'function'
			// 自行指定作品放置目錄與 ebook 用的 work id。
			&& work_data.directory_id() || work_data.id)
			// this.skip_get_work_page 時， work_data.title === undefined
			+ (work_data.title ? ' ' + work_data.title : '')
			// e.g., '.' + (new Date).format('%Y%2m%2d')
			+ (work_data.directory_name_extension || ''));
			// full directory path of the work.
			if (!work_data.directory) {
				var work_base_directory = _this.main_directory;
				if (work_data.base_directory_name) {
					// 允許自訂作品目錄，將作品移至特殊目錄下。
					// @see qq.js, qidian.js
					// set base directory name below this.main_directory
					work_base_directory += work_data.base_directory_name
							+ path_separator;
					// 特殊目錄可能還不存在。
					library_namespace.create_directory(work_base_directory);
					if (_this.need_create_ebook)
						work_data.ebook_directory = work_base_directory;
				}
				work_data.directory = work_base_directory
						+ work_data.directory_name + path_separator;
			}
			work_data.data_file = work_data.directory
					+ work_data.directory_name + '.json';

			var work_cache_directory = _this.main_directory
					+ _this.cache_directory_name,
			// .data.htm
			work_page_path = work_cache_directory + work_data.directory_name
					+ '.' + Work_crawler.HTML_extension, html;
			if (_this.preserve_work_page) {
				// 先寫入作品資料 cache。
				library_namespace.create_directory(work_cache_directory);
				node_fs.writeFileSync(work_page_path);
			} else if (_this.preserve_work_page === false) {
				// 明確指定不保留，將刪除已存在的作品資料 cache。
				library_namespace.debug('Romove ' + work_page_path, 1,
						'process_work_data');
				library_namespace.remove_file(work_page_path);
			}

			// .status 選擇性屬性：須配合網站平台更改。
			// ja:種別,状態
			if (Array.isArray(work_data.status)) {
				// e.g., ジャンル
				work_data.status = work_data.status.filter(function(item) {
					return !!item;
				})
				// .sort()
				// .join(', ')
				;
			}
			// assert: typeof work_data.status === 'string'
			// || Array.isArray(work_data.status)

			// 主要提供給 this.get_chapter_list() 使用。
			// e.g., 'ja-JP'
			if (!('language' in work_data)) {
				work_data.language
				// CeL.application.locale.detect_HTML_language()
				= library_namespace.detect_HTML_language(html)
				// CeL.application.locale.encoding.guess_text_language()
				|| library_namespace.guess_text_language(html);
			}
			// normalize work_data.language
			if (work_data.language && work_data.language.startsWith('cmn')) {
				// calibre 不認得/讀不懂 "cmn-Hant-TW" 這樣子的語言代碼，
				// 但是讀得懂 "zh-cmn-Hant-TW"。
				work_data.language = 'zh-' + work_data.language;
				if (!work_data.chapter_unit)
					work_data.chapter_unit = '章';
			}

			if (false && _this.is_finished(work_data)) {
				// 注意: 這時可能尚未建立 work_data.directory。
				// TODO: skip finished + no update works
			}

			var matched = library_namespace.get_JSON(work_data.data_file);
			if (matched) {
				// work_data properties to reset
				var skip_cache = Object.assign({
					process_status : _this.recheck,

					ebook_directory : _this.need_create_ebook,
					words_so_far : _this.need_create_ebook,
					book_chapter_count : _this.need_create_ebook
				}, _this.reset_work_data_properties);
				// recall old work_data
				// 基本上以新資料為準，除非無法取得新資料，才改用舊資料。
				for ( var key in matched) {
					if (skip_cache[key]) {
						// Skip this cache data.
						continue;
					}

					if (!(key in work_data)) {
						// 填入舊的資料。
						work_data[key] = matched[key];

					} else if (typeof work_data[key] !== 'object'
							&& work_data[key] !== matched[key]) {
						library_namespace.info(library_namespace
								.display_align([ [ key + ':', matched[key] ],
										[ '→', work_data[key] ] ]));
					}
				}
				if (matched.last_download) {
					// 紀錄一下上一次下載的資訊。
					work_data.latest_download = matched.last_download;
					matched = matched.last_download.chapter;
					if (matched > _this.start_chapter) {
						// 將開始/接續下載的章節編號。對已下載過的章節，必須配合 .recheck。
						work_data.last_download.chapter = matched;
					}
				}
			}

			/**
			 * 對於章節列表與作品資訊分列不同頁面(URL)的情況，應該另外指定 .chapter_list_URL。 e.g., <code>
			chapter_list_URL : '',
			chapter_list_URL : function(work_id) { return this.work_URL(work_id) + 'chapter/'; },
			chapter_list_URL : function(work_id, work_data) { return [ 'url', { post_data } ]; },
			 </code>
			 */
			if (_this.chapter_list_URL) {
				work_data.chapter_list_URL = work_URL = _this.full_URL(
						_this.chapter_list_URL, work_id, work_data);
				// console.log(work_URL);
				var post_data = null;
				if (Array.isArray(work_URL)) {
					post_data = work_URL[1];
					work_URL = _this.full_URL(work_URL[0]);
				}
				get_URL(work_URL, pre_process_chapter_list_data, _this.charset,
						post_data, Object.assign({
							error_retry : _this.MAX_ERROR_RETRY
						}, _this.get_URL_options));
			} else {
				pre_process_chapter_list_data(XMLHttp);
			}
		}

		// ----------------------------------------------------------

		function pre_process_chapter_list_data(XMLHttp) {
			var html = XMLHttp.responseText;
			if (!html && !_this.skip_get_work_page) {
				var message = _this.id + ': Can not get chapter list page!';
				library_namespace.error(message);
				_this.onerror(message, work_data);
				typeof callback === 'function' && callback(work_data);
				return Work_crawler.THROWED;
			}

			if (false) {
				// reset chapter_count. 此處 chapter (章節)
				// 指的為平台所給的id編號，可能是page，並非"回"、"話"！且可能會跳號！
				/** {ℕ⁰:Natural+0}章節數量 */
				work_data.chapter_count = 0;
				// work_data.chapter_count這個數值在前面skip_cache已經設定為不會更新，因此在這邊不需要重新設定。
			}

			// 注意: 這時可能尚未建立 work_data.directory。
			// 但this.get_chapter_list()若用到work_data[this.KEY_EBOOK].set_cover()，則會造成沒有建立基礎目錄的錯誤。
			library_namespace.debug('Create work_data.directory: '
					+ work_data.directory);
			// 預防(work_data.directory)不存在。
			library_namespace.create_directory(work_data.directory);

			if (_this.is_finished(work_data)) {
				if (false) {
					node_fs.writeFileSync(work_data.directory
					// 已經改成產生報告檔。
					+ 'finished.txt', work_data.status);
				}
				if (work_data.process_status) {
					work_data.process_status = work_data.process_status
							.unique();
					var has_last_saved_date;
					work_data.process_status = work_data.process_status
					// 之前每次都會添加新的資訊...
					.filter(function(status) {
						if (!String(status).startsWith('last saved date: ')) {
							return true;
						}
						if (has_last_saved_date)
							return false;
						has_last_saved_date = true;
						return true;
					});
				}
				if (!work_data.process_status
						|| !work_data.process_status.includes('finished')) {
					set_work_status(work_data, 'finished');
				}
				// cf. work_data.latest_chapter 最新章節,
				// work_data.latest_chapter_url 最新更新章節URL,
				// work_data.last_update 最新更新時間,
				// work_data.some_limited 部份章節需要付費/被鎖住/被限制
				if (work_data.last_update) {
					set_work_status(work_data, 'last updated date: '
							+ work_data.last_update);
				}
				if (work_data.last_saved
				// 已完結的時間報告只記錄一次就夠了。
				&& work_data.process_status.every(function(status) {
					return !String(status).startsWith('last saved date: ');
				})) {
					set_work_status(work_data, 'last saved date: '
							+ (library_namespace.is_Date(work_data.last_saved)
							//
							? work_data.last_saved.format('%Y/%m/%d')
									: work_data.last_saved));
				}
				// TODO: skip finished + no update works
			}

			if (true || _this.need_create_ebook) {
				// 提供給 this.get_chapter_list() 使用。
				if (!('time_zone' in work_data)) {
					// e.g., 9
					work_data.time_zone
					// CeL.application.locale.time_zone_of_language
					= library_namespace
							.time_zone_of_language(work_data.language);
				}
			}

			if (typeof _this.pre_get_chapter_list === 'function') {
				// 處理章節列表分散在多個檔案時的情況。
				// e.g., dajiaochong.js
				_this.pre_get_chapter_list(
				// function(callback, work_data, html, get_label)
				process_chapter_list_data.bind(_this, html), work_data, html,
						get_label);
			} else {
				process_chapter_list_data(html);
			}
		}

		// ----------------------------------------------------------

		// get 目次/完整目錄列表/章節列表
		function process_chapter_list_data(html) {
			// old name: this.get_chapter_count()
			if (typeof _this.get_chapter_list === 'function') {
				try {
					_this.get_chapter_list(work_data, html, get_label);
				} catch (e) {
					library_namespace.error(_this.id
							+ ': .get_chapter_list() throw error');
					_this.onerror(e, work_data);
					typeof callback === 'function' && callback(work_data);
					return Work_crawler.THROWED;
				}
				if (work_data.inverted_order) {
					_this.reverse_chapter_list_order(work_data);
					delete work_data.inverted_order;
				}

			}

			// work_data.chapter_list 為非正規之 chapter data list。
			// e.g., work_data.chapter_list = [ chapter_data,
			// chapter_data={url:'',title:'',date:new Date}, ... ]
			var chapter_list = Array.isArray(work_data.chapter_list)
					&& work_data.chapter_list;

			if (chapter_list) {
				// fill required data from chapter_list

				// 之前已設定 work_data.chapter_count=0
				if (!work_data.chapter_count) {
					// 自 work_data.chapter_list 計算章節數量。
					work_data.chapter_count = chapter_list.length;
				}

				var last_chapter_data = chapter_list.length > 0
						&& chapter_list[chapter_list.length - 1],
				//
				set_attribute = function(attribute, value) {
					if (!work_data[attribute] && value) {
						work_data[attribute] = value;
						// 有些資訊來自章節清單。
						work_data.fill_from_chapter_list = true;
					}
				};

				if (typeof last_chapter_data === 'string') {
					set_attribute('latest_chapter_url', last_chapter_data);
				} else {
					// assert: CeL.is_Object(last_chapter_data)
					set_attribute('latest_chapter_url', last_chapter_data.url);
					set_attribute('latest_chapter', last_chapter_data.title);
					set_attribute('last_update', last_chapter_data.date);
				}

				// free
				last_chapter_data = set_attribute = null;
			}

			if (work_data.chapter_count >= 1) {
				// 標記曾經成功取得章節數量，代表這個部分的代碼運作機制沒有問題。
				_this.got_chapter_count = true;

			} else {
				// console.log(work_data);
				var warning;
				if (work_data.removed) {
					warning = work_id
							+ (work_data.title ? ' ' + work_data.title : '')
							+ ': ' + (work_data.removed || '作品不存在/已被刪除');
				} else {
					warning = work_id
							+ (work_data.title ? ' ' + work_data.title : '')
							// (Did not set work_data.chapter_count)
							// No chapter got! 若是作品不存在就不會跑到這邊了
							+ ': Can not get chapter count! 或許作品已被刪除'
							+ (_this.got_chapter_count ? '' : '或者網站改版')
							+ '了? (' + _this.id + ')';
				}
				_this.onwarning(warning, work_data);

				// 無任何章節可供下載。刪掉前面預建的目錄。
				// 注意：僅能刪除本次操作所添加/改變的檔案。因此必須先確認裡面是空的。不能使用{library_namespace.fs_remove(work_data.directory,,true);}。
				library_namespace.fs_remove(work_data.directory);

				typeof callback === 'function' && callback(work_data);
				return;
			}

			var chapter_list_path = _this.main_directory
			//
			+ _this.cache_directory_name + work_data.directory_name
			// .TOC.htm
			+ '.list.' + Work_crawler.HTML_extension;
			if (_this.preserve_work_page && _this.chapter_list_URL) {
				// 所在目錄應該已經在上一個 _this.preserve_work_page 那個時候建造完畢。
				node_fs.writeFileSync(chapter_list_path, html);
			} else if (_this.preserve_work_page === false) {
				// 明確指定不保留，將刪除已存在的 chapter list page。
				library_namespace.debug('Romove ' + chapter_list_path, 1,
						'process_chapter_list_data');
				library_namespace.remove_file(chapter_list_path);
				if (false) {
					library_namespace.fs_remove(_this.main_directory
							+ _this.cache_directory_name);
				}
			}

			var recheck_flag = 'recheck' in work_data ? work_data.recheck
			// work_data.recheck 可能是程式自行判別的。
			: _this.recheck,
			/** {Integer}章節的增加數量: 新-舊, 當前-上一次的 */
			chapter_added = work_data.chapter_count
					- work_data.last_download.chapter;

			if (recheck_flag === 'multi_parts_changed') {
				recheck_flag = chapter_list
				// 當有多個分部的時候才重新檢查。
				&& chapter_list.part_NO > 1 && 'changed';
			} else if (typeof recheck_flag === 'function') {
				recheck_flag = recheck_flag.call(this, work_data);
			}

			if (recheck_flag
			// _this.get_chapter_list() 中
			// 可能重新設定過 work_data.last_download.chapter。
			&& work_data.last_download.chapter !== _this.start_chapter) {
				library_namespace.debug('已設定 .recheck + 作品曾有內容 / 並非空作品。');

				if (recheck_flag !== 'changed'
						&& typeof recheck_flag !== 'number') {
					// 強制重新更新文件。
					// recheck_flag should be true
					if (typeof recheck_flag !== 'boolean') {
						library_namespace.warn('Unknown .recheck: '
								+ recheck_flag);
					}
					if (!_this.reget_chapter) {
						if (_this.hasOwnProperty('reget_chapter')) {
							library_namespace
									.warn('既然設定了 .recheck，則把 .reget_chapter 設定為 ['
											+ _this.reget_chapter
											+ '] 將無作用！將自動把 .reget_chapter 轉為 true，明確指定 reget_chapter 以重新取得章節內容。。');
						}
						_this.reget_chapter = true;
					}
					// 無論是哪一種，既然是recheck則都得要從頭check並生成資料。
					work_data.reget_chapter = _this.reget_chapter;
					work_data.last_download.chapter = _this.start_chapter;

				} else if ( // 依變更判定是否重新更新文件。
				// for: {Natural}recheck_flag
				recheck_flag > 0 ? chapter_added < 0
				// .recheck 採用一個較大的數字可避免太過經常更新。
				|| chapter_added >= recheck_flag
				// assert: recheck_flag === 'changed'
				: chapter_added !== 0
				// TODO: check .last_update , .latest_chapter
				// 檢查上一次下載的章節名稱而不只是章節數量。
				) {
					library_namespace.debug('作品變更過 / midified，且符合需要更新的條件。');
					library_namespace
							.info('因章節數量有變化，將重新下載/檢查所有章節內容: '
									+ work_data.last_download.chapter
									+ '→'
									+ work_data.chapter_count
									+ ' ('
									+ (work_data.chapter_count > work_data.last_download.chapter ? '+'
											: '')
									+ (work_data.chapter_count - work_data.last_download.chapter)
									+ ')');
					// 重新下載。
					work_data.reget_chapter = true;
					// work_data.regenerate = true;
					work_data.last_download.chapter = _this.start_chapter;

				} else {
					// 不可用 ('reget_chapter' in _this)，會取得 .prototype 的屬性。
					if (!_this.hasOwnProperty('reget_chapter')) {
						work_data.reget_chapter = false;
					}
					// 如果章節刪除與增加，重整結果數量相同，則檢查不到，必須採用 .recheck。
					library_namespace
							.log(_this.id
									+ ': 章節數量'
									+ (chapter_added === 0 ? '無變化，共 '
											+ work_data.chapter_count
											+ ' '
											+ (work_data.chapter_unit || _this.chapter_unit)
											: '變化過小('
													+ chapter_added
													+ ' '
													+ (work_data.chapter_unit || _this.chapter_unit)
													+ ')因此不重新下載')
									+ '，'
									+ (work_data.reget_chapter ? '但已設定下載所有章節內容。'
											: _this.regenerate ? '僅利用 cache 重建資料(如ebook)，不重新下載所有章節內容。'
													: '跳過本作品不處理。'));

					// 採用依變更判定時，預設不重新擷取。
					if (!('reget_chapter' in _this)) {
						work_data.reget_chapter = false;
					}
					if (work_data.reget_chapter || _this.regenerate) {
						// 即使是這一種，還是得要從頭 check cache 並生成資料(如.epub)。
						work_data.last_download.chapter = _this.start_chapter;
					}

				}

			} else if (_this.start_chapter > (work_data.last_download.chapter > Work_crawler.prototype.start_chapter ? work_data.last_download.chapter
					: Work_crawler.prototype.start_chapter)) {
				library_namespace
						.warn('若之前已經下載到最新章節，則指定 start_chapter 時，必須同時設定 recheck！');
			}

			if (!('reget_chapter' in work_data)) {
				// .reget_chapter 為每個作品可能不同之屬性，非全站點共用屬性。
				work_data.reget_chapter = typeof _this.reget_chapter === 'function' ? _this
						.reget_chapter(work_data)
						: _this.reget_chapter;
			}

			if (work_data.last_download.chapter > work_data.chapter_count) {
				library_namespace.warn('章節數量 ' + work_data.chapter_count
						+ ' 比將開始/接續之下載章節編號 ' + work_data.last_download.chapter
						// or: 對於被屏蔽的作品，將會每次都從頭檢查。
						+ ' 還少，或許因為章節有經過重整，或者上次下載時中途增刪過章節。');
				if (_this.move_when_chapter_count_error) {
					var move_to = work_data.directory
					// 先搬移原目錄。
					.replace(/[\\\/]+$/, '.' + (new Date).format('%4Y%2m%2d'));
					// 常出現在 manhuatai, 2manhua。
					library_namespace.warn('將先備分舊內容、移動目錄，而後重新下載！\n'
							+ work_data.directory + '\n→\n' + move_to);
					// TODO: 成壓縮檔。
					library_namespace.fs_move(work_data.directory, move_to);
					// re-create work_data.directory
					library_namespace.create_directory(work_data.directory);
				} else {
					library_namespace.info('將從頭檢查、重新下載。');
				}
				work_data.reget_chapter = true;
				work_data.last_download.chapter = _this.start_chapter;
			}

			work_data.error_images = 0;
			if (work_data.last_download.chapter === _this.start_chapter) {
				work_data.image_count = 0;
			} else {
				delete work_data.image_count;
			}

			if (_this.need_create_ebook && !work_data.reget_chapter
			// 最起碼應該要重新生成電子書。否則會只記錄到最後幾個檢查過的章節。
			&& work_data.last_download.chapter !== work_data.chapter_count) {
				library_namespace.info('將從頭檢查、重新生成電子書。');
				work_data.regenerate = true;
				work_data.last_download.chapter = _this.start_chapter;
			}

			if (typeof callback === 'function' && callback.options
					&& callback.options.get_data_only) {
				// 最終廢棄動作，防止執行 work_data[this.KEY_EBOOK].pack()。
				delete work_data[_this.KEY_EBOOK];
				if (work_data.latest_download) {
					// recover latest download data
					work_data.last_download = work_data.latest_download;
				} else {
					delete work_data.last_download;
				}

				// backup
				_this.save_work_data(work_data);

				callback(work_data);
				return;
			}

			// backup
			_this.save_work_data(work_data);

			if (!work_data.reget_chapter
			//
			&& !_this.regenerate && !work_data.regenerate
			// 還必須已經下載到最新章節。
			&& work_data.last_download.chapter === work_data.chapter_count) {
				// 跳過本作品不處理。
				library_namespace.log('Skip '
						+ work_data.id
						+ (work_data.author ? ' [' + work_data.author + ']'
								: '') + ' ' + work_data.title);
				// 最終廢棄動作，防止執行 work_data[this.KEY_EBOOK].pack()。
				delete work_data[_this.KEY_EBOOK];
				if (typeof callback === 'function') {
					callback(work_data);
				}
				return;
			}

			if (_this.need_create_ebook) {
				// console.log(work_data);
				// console.log(JSON.stringify(work_data));
				create_ebook.call(_this, work_data);
			}

			var message = [
					work_data.id,
					// TODO: {Object}work_data.author
					work_data.author ? ' [' + work_data.author + ']' : '',
					' ',
					work_data.title,
					': ',
					work_data.chapter_count >= 0
					// assert: if chapter count unknown, typeof
					// _this.pre_chapter_URL === 'function'
					? work_data.chapter_count : 'Unknown',
					' ',
					work_data.chapter_unit || _this.chapter_unit,
					'.',
					work_data.status ? ' '
							+ (library_namespace.is_Object(work_data.status) ? JSON
									.stringify(work_data.status)
									: work_data.status)
							: '',
					work_data.last_download.chapter > _this.start_chapter
					//
					? ' 自章節編號第 ' + work_data.last_download.chapter + ' 接續下載。'
							: '' ].join('');
			if (_this.is_finished(work_data)) {
				// 針對特殊狀況提醒。
				library_namespace.info(message);
			} else {
				library_namespace.log(message);
			}

			if (work_URL)
				_this.get_URL_options.headers.Referer = work_URL;
			// 開始下載 chapter。
			work_data.start_downloading_chaper = Date.now();
			pre_get_chapter_data.call(_this, work_data,
					work_data.last_download.chapter, callback);
		}

	}

	// ----------------------------------------------------------------------------

	// const
	var STOP_TASK = {
		stop : true
	},
	// cancel task
	QUIT_TASK = {
		quit : true
	};

	// this.continue_arguments =
	// undefined : 沒有設定特殊控制作業，正常執行或沒有作業執行中。
	// [ STOP_TASK, callback_after_stopped ] : 等待作業暫停中。
	// [ QUIT_TASK, callback_after_quitted ] : 等待作業取消中。
	// [ work_data, chapter_NO, callback ] : 作業已經暫停，等待重啟中。

	// 🛑 Stop Sign
	function is_stopping_now(quit) {
		return Array.isArray(this.continue_arguments)
				&& this.continue_arguments[0] === (quit ? QUIT_TASK : STOP_TASK);
	}

	// callback: 暫停/取消作業之後執行
	function stop_task(quit, callback) {
		if (!this.running) {
			return;
		}

		if (!this.continue_arguments) {
			// set flag to pause / cancel task
			library_namespace.info(this.id + ': 準備設定' + (quit ? '取消' : '暫停')
					+ '下載作業');
			this.continue_arguments = [ quit ? QUIT_TASK : STOP_TASK ];
			if (callback) {
				this.continue_arguments.push(callback);
			}
			// return this.continue_arguments[0];
		}

		if (this.is_stopping_now() || this.is_stopping_now(true)) {
			// 等待作業暫停/取消中，改變作業流程控制設定。
			var _arguments = this.continue_arguments;
			_arguments[0] = quit ? QUIT_TASK : STOP_TASK;
			if (callback) {
				_arguments.push(callback);
			}
			// return _arguments[0];
			return;
		}

		// assert: 作業暫停中， is stopped now
		// assert: this.continue_arguments
		// === [ work_data, chapter_NO, callback ]

		if (!quit) {
			callback && callback();
			// return STOP_TASK;
			return;
		}

		// 作業暫停中，取消作業。必須重啟作業。
		var _arguments = this.continue_arguments;
		this.continue_arguments = [ QUIT_TASK, callback ];
		pre_get_chapter_data.apply(this, _arguments);
		// return QUIT_TASK;
	}

	// resume
	function continue_task(callback) {
		if (!this.continue_arguments) {
			callback && callback(this.running);
			return;
		}

		if (this.is_stopping_now() || this.is_stopping_now(true)) {
			// 等待作業暫停/取消中，改變作業流程控制設定。改成繼續下載作業。
			callback && callback(null, this.continue_arguments);
			this.continue_arguments.forEach(function(callback, index) {
				index > 0 && callback && callback('continue');
			});
			// reset flow control flag
			delete this.continue_arguments;
			return;
		}

		// assert: 作業暫停中， is stopped now
		// assert: this.continue_arguments
		// === [ work_data, chapter_NO, callback ]

		// 作業暫停中，重啟作業。繼續下載作業。
		var _arguments = this.continue_arguments, work_data = _arguments[0];
		// reset flow control flag
		delete this.continue_arguments;
		callback && callback(work_data);
		library_namespace.info(this.id + ': 繼續下載 ['
				+ (work_data.title || work_data.id) + ']');
		pre_get_chapter_data.apply(this, _arguments);
	}

	// @inner
	function pre_get_chapter_data(work_data, chapter_NO, callback) {
		if (this.continue_arguments) {
			// assert: this.is_stopping_now()
			// || this.is_stopping_now(true)

			// console.log(this.continue_arguments);
			var is_quitting = this.is_stopping_now(true);

			if (!is_quitting && !this.is_stopping_now()) {
				// 照理來說不應該會到這邊!
				retrurn;
			}

			library_namespace.warn(this.id + ': '
			// 暫停下載作業, 取消下載作業機制
			+ (is_quitting ? '取消' : '暫停') + '下載 ['
					+ (work_data.title || work_data.id) + ']');

			this.continue_arguments.forEach(function(callback, index) {
				index > 0 && callback && callback(is_quitting);
			});

			// reset flow control flag
			delete this.continue_arguments;

			if (is_quitting) {
				this.running = false;
				if (typeof callback === 'function') {
					callback(work_data);
				}

			} else {
				// stop task
				this.continue_arguments
				// = arguments
				= [ work_data, chapter_NO, callback ];
				this.running = 'stopped';
				// waiting for this.continue_task()
			}
			return;
		}

		// 預防並列執行的時候出現交叉干擾。
		this.running = true;

		var actual_operation = get_chapter_data.bind(this, work_data,
				chapter_NO, callback),
		// this.chapter_time_interval: 下載章節資訊前的等待時間。
		chapter_time_interval = this.get_chapter_time_interval(chapter_NO,
				work_data);

		var next = chapter_time_interval > 0 ? (function() {
			var message = [ this.id, ': ', work_data.title + ': ',
					'下載第' + chapter_NO + '章之章節資訊前先等待 ',
					library_namespace.age_of(0, chapter_time_interval) ],
			// 預估剩餘時間 estimated time remaining
			estimated_time = work_data.chapter_count > chapter_NO
					// this.start_chapter, chapter_NO starts from 1
					&& (work_data.chapter_count - (chapter_NO - 1))
					* (Date.now() - work_data.start_downloading_chaper)
					/ (chapter_NO - (this.start_chapter >= 1 ? this.start_chapter
							: 1));
			if (1e3 < estimated_time && estimated_time < 1e15) {
				message.push('，預估還需 ', library_namespace.age_of(0,
						estimated_time), ' 下載完本作品');
			}
			message.push('...\r');
			process.stdout.write(message.join(''));
			setTimeout(actual_operation, chapter_time_interval);
		}).bind(this)
				: actual_operation;

		if (this.chapter_filter) {
			var chapter_data = work_data.chapter_list
					&& work_data.chapter_list[chapter_NO - 1];

			// console.log(chapter_data);

			// 不區分大小寫。
			var chapter_filter = String(this.chapter_filter).toLowerCase();

			if (chapter_data && chapter_data.title
			// 篩選想要下載的章節標題關鍵字。例如"單行本"。
			&& !chapter_data.title.toLowerCase().includes(chapter_filter)
			//
			&& (!chapter_data.part_title
			// 亦篩選部冊標題。
			|| !chapter_data.part_title.toLowerCase().includes(chapter_filter))) {
				library_namespace.debug('pre_get_chapter_data: Skip '
						+ (chapter_data.part_title ? '['
								+ chapter_data.part_title + '] ' : '') + '['
						+ chapter_data.title
						+ ']: 不在 chapter_filter 所篩範圍內。跳過本章節不下載。');

				// 執行一些最後結尾的動作。
				continue_next_chapter.call(this, work_data, chapter_NO,
						callback);
				return;
			}
		}

		if (typeof this.pre_chapter_URL === 'function') {
			// 在 this.chapter_URL() 之前執行 this.pre_chapter_URL()，
			// 主要用途在取得 chapter_URL 之資料。
			try {
				this.pre_chapter_URL(work_data, chapter_NO, next);
			} catch (e) {
				library_namespace.error(this.id + ': ' + work_data.title
						+ ': Error on chapter ' + chapter_NO);
				this.onerror(e, work_data);
				typeof callback === 'function' && callback(work_data);
				return Work_crawler.THROWED;
			}
		} else {
			next();
		}
	}

	// @see dm5.js for sample of this.get_chapter_list()
	// e.g., work_data.chapter_list = [ chapter_data,
	// chapter_data={url:'',title:'',date:new Date}, ... ]
	function setup_chapter_list(work_data, reset) {
		var chapter_list;
		// reset: reset work_data.chapter_list
		if (reset || !Array.isArray(chapter_list = work_data.chapter_list)) {
			chapter_list = work_data.chapter_list = [];
			// 漫畫目錄名稱不須包含分部號碼。使章節目錄名稱不包含 part_NO。
			// work_data.chapter_list.add_part_NO = false;
		}
		return chapter_list;
	}
	// should be called by this.get_chapter_list()
	// this.set_part(work_data, 'part_title');
	function set_part_title(work_data, part_title, part_NO) {
		var chapter_list = setup_chapter_list(work_data);

		// reset latest NO in part
		delete chapter_list.NO_in_part;

		part_title = get_label(part_title);
		if (part_title) {
			library_namespace.debug(part_title, 1, 'set_part_title');
			chapter_list.part_title = part_title;
			if (part_NO >= 1 && !('add_part_NO' in chapter_list))
				chapter_list.add_part_NO = true;
			// last part NO. part_NO starts from 1
			chapter_list.part_NO = part_NO || (chapter_list.part_NO | 0) + 1;
		} else {
			// reset
			// delete chapter_list.part_NO;
			delete chapter_list.part_title;
		}
	}
	// should be called by this.get_chapter_list()
	// this.add_chapter(work_data, chapter_data);
	//
	// 警告: 您可能必須要重設 work_data.chapter_list
	// e.g., delete work_data.chapter_list;
	function add_chapter_data(work_data, chapter_data) {
		var chapter_list = setup_chapter_list(work_data);
		if (typeof chapter_data === 'string') {
			// treat as chapter_URL
			chapter_data = {
				url : chapter_data
			};
		}

		// assert: {Onject}chapter_data
		if (chapter_list.part_title) {
			// 如果 chapter_data 設定了值，那就用 chapter_data 原先的值。
			if (chapter_data.part_NO !== chapter_list.part_NO
					&& chapter_list.part_NO >= 1) {
				if (chapter_data.part_NO >= 1) {
					library_namespace.warn(
					//
					'add_chapter_data: 原已設定 part_NO: ' + chapter_list.part_NO
					//
					+ '，但在 chapter_data 中又設定  chapter_data.part_NO: '
					//
					+ chapter_data.part_NO + '，兩者相衝突。');
				} else if (chapter_list.add_part_NO !== false) {
					chapter_data.part_NO = chapter_list.part_NO;
				}
			}

			if (chapter_data.part_title !== chapter_list.part_title) {
				if (chapter_data.part_title) {
					library_namespace.warn(
					//
					'add_chapter_data: 原已設定 part_title: '
					//
					+ chapter_list.part_title
					//
					+ '，但在 chapter_data 中又設定  chapter_data.part_title: '
					//
					+ chapter_data.part_title + '，兩者相衝突。');
				} else {
					chapter_data.part_title = chapter_list.part_title;
				}
			}

			if (chapter_data.NO_in_part >= 1) {
				if (chapter_list.NO_in_part >= 1
						&& chapter_list.NO_in_part !== chapter_data.NO_in_part) {
					library_namespace.warn(
					//
					'add_chapter_data: chapter_list.NO_in_part: '
							+ chapter_data.NO_in_part + '→'
							+ chapter_list.NO_in_part);
				}
				chapter_list.NO_in_part = chapter_data.NO_in_part;
			} else {
				chapter_data.NO_in_part = chapter_list.NO_in_part
				// NO_in_part, NO in part starts from 1
				= (chapter_list.NO_in_part | 0) + 1;
			}
		}

		if (false) {
			console.log(chapter_list.length + ': '
					+ JSON.stringify(chapter_data));
		}
		chapter_list.push(chapter_data);
		return chapter_data;
	}
	// set work_data.inverted_order = true;
	// this.reverse_chapter_list_order(work_data);
	function reverse_chapter_list_order(work_data) {
		var chapter_list = work_data.chapter_list;
		if (!Array.isArray(chapter_list) || chapter_list.length === 0) {
			return;
		}

		if (chapter_list.length > 1) {
			library_namespace.debug('轉成由舊至新之順序。', 3,
					'reverse_chapter_list_order');
			chapter_list.reverse();
		}
		// console.log(chapter_list);

		if (!(chapter_list.part_NO >= 1)) {
			return;
		}

		// 調整 NO
		var part_title_now, parts_count_plus_1 = chapter_list.part_NO + 1, chapter_count_plus_1;
		chapter_list.forEach(function(chapter_data, index) {
			if (!(chapter_data.NO_in_part >= 1)) {
				this.onerror('reverse_chapter_list_order: '
				//
				+ 'Invalid NO_in_part: chapter_list[' + index + ']: '
						+ JSON.stringify(chapter_data), work_data);
				typeof callback === 'function' && callback(work_data);
				return Work_crawler.THROWED;
			}

			if (part_title_now !== chapter_data.part_title
					|| !chapter_count_plus_1) {
				part_title_now = chapter_data.part_title;
				chapter_count_plus_1 = chapter_data.NO_in_part + 1;
			}

			chapter_data.NO_in_part = chapter_count_plus_1
					- chapter_data.NO_in_part;

			if (chapter_data.part_NO >= 1) {
				chapter_data.part_NO = parts_count_plus_1
						- chapter_data.part_NO;
			}
			// console.log(JSON.stringify(chapter_data));
		});
	}

	// 對於某些作品，顯示建議重新檢查的提示；以每個作品為單位。
	function confirm_recheck(work_data, prompt) {
		if (this.recheck || work_data.recheck_confirmed) {
			return;
		}
		work_data.recheck_confirmed = true;
		library_namespace.warn((work_data.title || work_data.id) + ': '
				+ prompt
				+ '，建議設置 recheck=multi_parts_changed 選項來避免多次下載時，遇上缺話的情況。');
	}

	// 分析所有數字後的非數字，猜測章節的單位。
	function guess_unit(title_list) {
		var units = library_namespace.null_Object(), PATTERN = /\d+([^\d])/g, matched;
		title_list.forEach(function(title) {
			title = library_namespace.from_Chinese_numeral(title);
			while (matched = PATTERN.exec(title)) {
				if (!(matched[1] in units))
					units[matched[1]] = library_namespace.null_Object();
				units[matched[1]][matched[0]] = null;
			}
		});

		var unit, count = 0;
		Object.keys(units)
		// using array.reduce()
		.forEach(function(_unit) {
			var _count = Object.keys(units[_unit]).length;
			if (count < _count) {
				count = _count;
				unit = _unit;
			}
		});
		return unit;
	}
	/**
	 * 依章節標題來決定章節編號。 本函數將會改變 chapter_data.chapter_NO ！
	 * 
	 * @param {Object|Array}chapter_data
	 *            chapter_data or work_data
	 * @param {Natural}default_NO
	 *            default chapter NO
	 * 
	 * @returns {Natural}章節編號 chapter NO
	 * 
	 * @see parse_chapter_data() @ ck101.js
	 */
	function set_chapter_NO_via_title(chapter_data, default_NO, default_unit) {
		function get_title(chapter_data) {
			return library_namespace.is_Object(chapter_data) ? chapter_data.title
					: chapter_data;
		}

		if (Array.isArray(chapter_data.chapter_list)) {
			// assert: `chapter_data` is work data
			confirm_recheck.call(this, chapter_data, '本作依章節標題來決定章節編號');
			// input sorted work_data, use work_data.chapter_list
			// latest_chapter_NO, start NO
			default_NO |= 0;
			if (!default_unit && chapter_data.chapter_list.length > 1
			//
			&& library_namespace.from_Chinese_numeral) {
				default_unit = guess_unit(chapter_data.chapter_list
						.map(get_title));
			}
			chapter_data.chapter_list.forEach(function(chapter_data) {
				var chapter_NO = this.set_chapter_NO_via_title(chapter_data,
						++default_NO);
				// + 1: 可能有 1 → 1.5
				if (default_NO > chapter_NO + 1) {
					library_namespace.warn('出現章節編號倒置的情況, ' + default_NO + ' → '
					// 逆轉 回退倒置 倒退
					+ chapter_NO + ': ' + chapter_data.title);
				}
				default_NO = chapter_NO;
			}, this);
			return;
		}

		// 處理單一章節。
		// chapter_data={title:'',chapter_NO:1}

		// console.log(chapter_data);
		var title = get_title(chapter_data);
		if (default_unit !== '季') {
			title = title.replace(/四季/g, '');
		}

		if (library_namespace.from_Chinese_numeral)
			title = library_namespace.from_Chinese_numeral(title);

		var matched = title.match(/(?:^|第 ?)(\d{1,3}(?:\.\d)?) ?話/) || title
		// 因為中間的章節可能已經被下架，因此依章節標題來定章節編號。
		.match(/^(?:[＃#] *|(?:Episode|act)[ .:]*)?(\d{1,3})(?:$|[ .\-])/i)
		// 章節編號有prefix，或放在末尾。 e.g., 乙ゲーにトリップした俺♂, たすけてまおうさま @ pixivコミック
		// e.g., へるぷ22, チャプター24後編
		|| title.match(/^[^\d]+(\d{1,2})(?:$|[^\d])/);
		if (matched) {
			// 可能有第0話。
			if (library_namespace.is_Object(chapter_data))
				chapter_data.chapter_NO = default_NO = matched[1] | 0;
			return default_NO;
		}

		// TODO: 神落しの鬼 @ pixivコミック: ニノ巻
		// TODO: 特別編その2

		library_namespace.warn('Can not determine chapter NO from title: '
				+ (title || JSON.stringify(chapter_data))
				+ (default_NO >= 0 ? ' (Set as ' + default_NO + ')' : ''));
		if (library_namespace.is_Object(chapter_data) && default_NO >= 0)
			chapter_data.chapter_NO = default_NO;
		return default_NO;
	}
	// should be called by get_data() or this.pre_parse_chapter_data()
	// this.get_chapter_directory_name(work_data, chapter_NO);
	// this.get_chapter_directory_name(work_data, chapter_NO, chapter_data);
	// this.get_chapter_directory_name(work_data, chapter_NO, chapter_title);
	function get_chapter_directory_name(work_data, chapter_NO, chapter_data,
			no_part) {
		if (typeof chapter_data === 'boolean' && no_part === undefined) {
			// this.get_chapter_directory_name(work_data, chapter_NO, no_part);
			// shift arguments
			no_part = chapter_data;
			chapter_data = null;
		}

		var part, chapter_title;

		if (typeof chapter_data === 'string') {
			// treat chapter_data as chapter_title.
			chapter_title = work_data;

		} else if (library_namespace.is_Object(chapter_data)
				|| Array.isArray(work_data.chapter_list)
				&& library_namespace
						.is_Object(chapter_data = work_data.chapter_list[chapter_NO - 1])) {
			// console.trace(chapter_data);
			if (!no_part && chapter_data.part_title
			//
			&& (Array.isArray(work_data.chapter_list)
			// 當只有一個 part (分部) 的時候，預設不會添上 part 標題，除非設定了 this.add_part。
			&& work_data.chapter_list.part_NO > 1 || this.add_part)) {
				confirm_recheck.call(this, work_data, '本作存有不同的 part');
				part = chapter_data.NO_in_part | 0;
				if (part >= 1) {
					chapter_NO = part;
				}

				part = (work_data.chapter_list.add_part_NO !== false
				// work_data.chapter_list.add_part_NO === false:
				// 漫畫目錄名稱不須包含分部號碼。使章節目錄名稱不包含 part_NO。
				&& chapter_data.part_NO >= 1 ? chapter_data.part_NO.pad(2)
				// 小說才有第一部第二部之分，漫畫分部不會有號碼(part_NO)，因此去掉漫畫目錄名稱名稱之號碼標示。
				// "01 单话 0001 第371回" → "单话 0001 第371回"
				+ ' ' : '') + chapter_data.part_title + ' ';
				part = part.trimStart();
			}
			chapter_title = chapter_data.chapter_title || chapter_data.title;

		} else {
			this.onerror('get_chapter_directory_name: Invalid chapter_data: '
					+ work_data.id + '#' + chapter_NO, work_data);
			typeof callback === 'function' && callback(work_data);
			return Work_crawler.THROWED;
		}

		// assert: !chapter_data || !!chapter_data.title === true
		chapter_title = chapter_title ? chapter_title.trim() : '';

		var chapter_directory_name = (part || '')
		// 檔名 NO 的基本長度（不足補零）。以 chapter_data.chapter_NO 可自定章節編號。
		+ (chapter_data && chapter_data.chapter_NO || chapter_NO).pad(4)
		//
		+ (chapter_title ? ' '
		// 把網頁編碼還原成看得懂的文字。 get_label()
		+ library_namespace.HTML_to_Unicode(chapter_title) : '');

		chapter_directory_name = library_namespace
				.to_file_name(chapter_directory_name);
		return chapter_directory_name;
	}

	// @inner
	function get_chapter_data(work_data, chapter_NO, callback) {
		function get_chapter_URL() {
			var chapter_URL = _this.chapter_URL(work_data, chapter_NO);
			// console.log(work_data);
			// console.log('chapter_URL: ' + chapter_URL);
			chapter_URL = chapter_URL && _this.full_URL(chapter_URL);
			// console.log('chapter_URL: ' + chapter_URL);
			return chapter_URL;
		}

		var _this = this,
		// left: remaining chapter count
		left, image_list, waiting, chapter_label,
		//
		chapter_directory, images_archive, chapter_page_file_name,
		//
		chapter_URL = get_chapter_URL();
		library_namespace.debug(work_data.id + ' ' + work_data.title + ' #'
				+ chapter_NO + '/' + work_data.chapter_count + ': '
				+ chapter_URL, 1, 'get_chapter_data');
		process.title = [
				chapter_NO,
				// '/', work_data.chapter_count,
				' @ ',
				work_data.title || work_data.id,
				Array.isArray(this.work_list_now)
						&& typeof this.work_list_now[this.work_list_now.list_serial - 1] === 'string'
						// .includes(): 可能經過一些變化而不完全一樣
						&& work_data.title
								.includes(this.work_list_now[this.work_list_now.list_serial - 1]
										.trim()) ? ' '
						+ this.work_list_now.list_serial + '/'
						+ this.work_list_now.length : '', ' @ ', this.id ]
				.join('');

		// --------------------------------------

		// 若是已經有下載好的舊目錄風格檔案，就把它轉成新的目錄風格，避免需要重複下載。
		// 過渡時期的措施: 當所有目錄都改成新風格就應該關掉。
		if (false && Array.isArray(work_data.chapter_list)
				&& work_data.chapter_list.part_NO > 1 && !this.add_part) {
			var old_style_directory_path = work_data.directory
					+ this.get_chapter_directory_name(work_data, chapter_NO,
							true);
			if (library_namespace.directory_exists(old_style_directory_path)) {
				library_namespace.move_fso(old_style_directory_path,
						work_data.directory
								+ this.get_chapter_directory_name(work_data,
										chapter_NO));
			}
		}

		// --------------------------------------

		function get_data() {
			process.stdout.write('Get data of chapter ' + chapter_NO
			//
			+ (typeof _this.pre_chapter_URL === 'function' ? ''
			//
			: '/' + work_data.chapter_count) + '...\r');

			// default: 置於 work_data.directory 下。
			var chapter_file_name = work_data.directory
					+ work_data.directory_name + ' ' + chapter_NO.pad(3) + '.'
					+ Work_crawler.HTML_extension;

			function process_images(chapter_data, XMLHttp) {
				// get chapter label, will used as chapter directory name.
				chapter_label = _this.get_chapter_directory_name(work_data,
						chapter_NO, chapter_data, false);
				chapter_directory = work_data.directory + chapter_label;
				library_namespace.debug('先準備好章節目錄: ' + chapter_directory, 1,
						'process_images');
				library_namespace.create_directory(chapter_directory);

				images_archive = new library_namespace.storage.archive(
						work_data.directory + chapter_label + '.'
								+ _this.images_archive_extension);
				// cache
				Object.assign(images_archive, {
					base_directory : work_data.directory,
					file_name : chapter_label + '.'
							+ _this.images_archive_extension,
					work_directory : work_data.directory,
					to_remove : []
				});
				if (library_namespace
						.file_exists(images_archive.archive_file_path)) {
					if (library_namespace.platform.OS === 'darwin'
							&& images_archive.program_type === 'zip') {
						// In Max OS: 直接解開圖片壓縮檔以避免麻煩。
						// Max OS 中，壓縮檔內的檔案路徑包括了目錄名稱，行為表現與其他的應用程式不一致，因此不容易判別。
						// 另外 Max OS 中的壓縮程式缺乏了某些功能。
						process.stdout.write('Extract image files: '
								+ images_archive.file_name + '...\r');
						images_archive.extract({
							cwd : images_archive
						});
					} else {
						// detect if images archive file is existed.
						images_archive.file_existed = true;
						process.stdout.write('Reading '
								+ images_archive.file_name + '...\r');
						images_archive.info();
						if (false && typeof _this.check_images_archive === 'function')
							_this.check_images_archive(images_archive);
					}
				}
				chapter_directory += path_separator;

				chapter_page_file_name = work_data.directory_name + '-'
						+ chapter_label + '.' + Work_crawler.HTML_extension;
				// 注意: 若是沒有 reget_chapter，則 preserve_chapter_page 不應發生效用。
				if (work_data.reget_chapter && _this.preserve_chapter_page) {
					node_fs.writeFileSync(chapter_directory
							+ chapter_page_file_name, XMLHttp.buffer);
				} else if (_this.preserve_chapter_page === false) {
					// 明確指定不保留，將刪除已存在的 chapter page。
					library_namespace.debug('Romove ' + chapter_page_file_name,
							1, 'process_images');
					library_namespace.remove_file(chapter_directory
							+ chapter_page_file_name);
				}
				var message = [ chapter_NO,
				//
				typeof _this.pre_chapter_URL === 'function' ? ''
				//
				: '/' + work_data.chapter_count,
				//
				' [', chapter_label, '] ', left, ' images.',
				// 例如需要收費/被鎖住的章節。 .locked 此章节为付费章节 本章为付费章节
				chapter_data.limited ? ' (本章為需要付費/被鎖住的章節)' : '' ].join('');
				if (chapter_data.limited) {
					// 針對特殊狀況提醒。
					library_namespace.info(message);
					if (!work_data.some_limited) {
						work_data.some_limited = true;
						set_work_status(work_data, 'limited');
					}
				} else {
					library_namespace.log(message);
				}

				if (chapter_URL)
					_this.get_URL_options.headers.Referer = chapter_URL;

				// 正規化/初始化圖像資料
				// http://stackoverflow.com/questions/245840/rename-files-in-sub-directories
				// for /r %x in (*.jfif) do ren "%x" *.jpg
				function normalize_image_data(image_data, index) {
					// set image file path
					function image_file_path_of_chapter_NO(chapter_NO) {
						return chapter_directory + work_data.id + '-'
								+ chapter_NO + '-' + (index + 1).pad(3) + '.'
								+ file_extension;
					}

					library_namespace.debug(chapter_label + ': ' + (index + 1)
							+ '/' + image_list.length, 6,
							'normalize_image_data');
					// console.log(image_data);
					if (!image_data) {
						// 若是沒有設定image_data，那麼就明確的給一個表示有錯誤的。
						return image_list[index] = {
						// 這兩個會在 function get_image() 裡面設定。
						// has_error : true,
						// done : true
						};
					}

					if (typeof image_data === 'string') {
						// image_data 會被用來記錄一些重要的資訊。
						// 若是沒回寫到原先的image_list，那麼將會失去這些資訊。
						image_list[index] = image_data = {
							url : image_data
						};

					}

					if (image_data.file) {
						// image_data.file: 指定圖片要儲存檔的檔名與路徑 file_path。
						// 已經設定過就不再設定 image_data.file。
						return image_data;
					}

					if (typeof image_data.file_name === 'function') {
						// return {String}file name
						image_data.file_name = image_data.file_name(work_data,
								chapter_NO, index);
					}
					if (image_data.file_name) {
						image_data.file = chapter_directory
								+ image_data.file_name;
						// 採用 image_data.file_name 來設定 image_data.file。
						return image_data;
					}

					var file_extension = image_data.file_extension
							|| work_data.image_extension;
					if (!file_extension && image_data.url) {
						// 由圖片的網址來判別可能的延伸檔名。
						var matched = image_data.url.replace(/[?#].*$/, '');
						matched = matched.match(/\.([a-z\d\-_]+)$/i);
						if (matched) {
							matched = matched[1].toLowerCase();
							if (matched in _this.image_types) {
								// e.g., manhuagui.js
								library_namespace.debug('file extension: .'
										+ matched + ' ← ' + image_data.url, 3,
										'get_data');
								file_extension = matched;
							}
						}
					}
					if (!file_extension) {
						// 採用預設的圖片延伸檔名。
						file_extension = _this.default_image_extension;
					}

					// 本來希望若之前沒有分部，現在卻增加了分部，那麼若資料夾中有舊的圖像檔案，可以直接改名。
					// 但由於增加分部之後，chapter_directory已經加上分部名稱，和原先沒有分部情況下資料夾名稱不同，因此抓不到原先的圖像檔案。
					// TODO: 重新命名舊的資料夾。
					var old_image_file_path = image_file_path_of_chapter_NO(chapter_NO),
					// 使圖片檔名中的章節編號等同於資料夾編號。
					// 注意：若是某個章節分成好幾部分，可能造成這些章節中的圖片檔名相同。
					using_chapter_NO = chapter_data.chapter_NO >= 1 ? chapter_data.chapter_NO
							: chapter_data.NO_in_part >= 1
									&& chapter_data.NO_in_part;
					if (using_chapter_NO && using_chapter_NO !== chapter_NO) {
						// 若有分部，則以部編號為主。
						image_data.file = image_file_path_of_chapter_NO(using_chapter_NO);

						// 假如之前已取得過圖片檔案，就把舊圖片改名成新的名稱格式。
						// 例如之前沒有分部，現在卻增加了分部。
						if (!library_namespace.file_exists(image_data.file)
						// && old_image_file_path !==
						// image_data.file
						&& library_namespace.file_exists(old_image_file_path)) {
							library_namespace.move_file(old_image_file_path,
									image_data.file);
						}
					} else {
						image_data.file = old_image_file_path;
					}

					return image_data;
				}

				// console.log(image_list);
				// TODO: 當某 chapter 檔案過多(如1000)，將一次 request 過多 connects 而造成問題。
				if (!_this.one_by_one) {
					// 並行下載。
					image_list.forEach(function(image_data, index) {
						image_data = normalize_image_data(image_data, index);
						_this.get_image(image_data, check_if_done,
								images_archive);
					});
					library_namespace.debug(chapter_label + ': 已派發完工作，開始等待。',
							3, 'get_data');
					waiting = true;
					return;
				}

				// 只有在 this.one_by_one===true 這個時候才會設定 image_list.index
				image_list.index = 0;
				var time_interval = _this.one_by_one !== true
						&& library_namespace.to_millisecond(_this.one_by_one),
				//
				get_next_image = function() {
					// assert: image_list.index < image_list.length
					process.stdout.write(gettext('IMG %1',
							(image_list.index + 1)
									+ (_this.dynamical_count_images ? '' : '/'
											+ image_list.length))
							+ '...\r');
					var image_data = normalize_image_data(
							image_list[image_list.index], image_list.index);
					if (time_interval > 0)
						image_data.time_interval = time_interval;
					_this.get_image(image_data, function(image_data, status) {
						check_if_done(image_data, status);

						// 添加計數器
						if (!(++image_list.index < image_list.length)) {
							return;
						}

						if (!(time_interval > 0)
						// 沒有實際下載動作時，就不用等待了。
						|| status === 'image_downloaded'
								|| status === 'invalid_data') {
							get_next_image();
							return;
						}

						process.stdout.write('process_images: Wait '
								+ library_namespace.age_of(0, time_interval)
								+ ' to get image ' + image_list.index + '/'
								+ image_list.length + '...\r');
						setTimeout(get_next_image, time_interval);
					}, images_archive);
				};
				get_next_image();
			}

			function process_chapter_data(XMLHttp) {
				XMLHttp = XMLHttp || this;
				var html = XMLHttp.responseText;
				if (!html
						&& !_this.skip_get_chapter_page
						&& (!_this.skip_error || get_data.error_count < _this.MAX_ERROR_RETRY)) {
					library_namespace.error((work_data.title || work_data.id)
							+ ': ' + gettext('無法取得第 %1 章的內容。', chapter_NO));
					if (get_data.error_count === _this.MAX_ERROR_RETRY) {
						if (_this.skip_chapter_data_error) {
							library_namespace.warn('process_chapter_data: '
							// Skip this chapter if do not need throw
							+ gettext('跳過 %1 #%2 並接著下載下一章。',
							//
							work_data.title, chapter_NO));
							check_if_done();
							return;
						}
						_this.onerror(_this.id + ': '
								+ _this.MESSAGE_RE_DOWNLOAD, work_data);
						typeof callback === 'function' && callback(work_data);
						return Work_crawler.THROWED;
					}
					get_data.error_count = (get_data.error_count | 0) + 1;
					library_namespace.log('process_chapter_data: '
							+ gettext('Retry %1', get_data.error_count + '/'
									+ _this.MAX_ERROR_RETRY) + '...');
					if (!work_data.reget_chapter) {
						library_namespace
								.warn('因 cache file 壞了(例如為空)，將重新取得 chapter_URL，設定 .reget_chapter。');
						work_data.reget_chapter = true;
					}
					get_data();
					return;
				}

				var chapter_data;
				if (_this.check_chapter_NO) {
					chapter_data = Array.isArray(_this.check_chapter_NO)
					// 檢測所取得內容的章節編號是否相符。
					? html.between(_this.check_chapter_NO[0],
							_this.check_chapter_NO[1])
					// {Function}return chapter NO is OK
					: _this.check_chapter_NO(html);
					var chapter_NO_text = null;
					if (typeof chapter_data !== 'boolean') {
						chapter_NO_text = get_label(chapter_data);
						chapter_data = chapter_NO_text == chapter_NO
								// for yomou only
								|| (chapter_NO_text === '' || chapter_NO_text === undefined)
								&& work_data.status
								&& work_data.status.includes('短編')
					}
					if (!chapter_data) {
						// library_namespace.warn(html);
						library_namespace.warn(work_data.status);
						_this.onerror(new Error(_this.id
								+ ': Bad chapter NO: Should be '
								+ chapter_NO
								+ (chapter_NO_text === null ? '' : ', but get '
										+ JSON.stringify(chapter_NO_text))
								+ ' inside contents.'), work_data);
						typeof callback === 'function' && callback(work_data);
						return Work_crawler.THROWED;
					}
				}

				try {
					// image_data.url 的正確設定方法:
					// = base_URL + encodeURI(CeL.HTML_to_Unicode(url))
					chapter_data = _this.parse_chapter_data
							&& _this.parse_chapter_data(html, work_data,
									get_label, chapter_NO)
							|| Array.isArray(work_data.chapter_list)
							// default chapter_data
							&& work_data.chapter_list[chapter_NO - 1];
					if (chapter_data === _this.REGET_PAGE) {
						// 當重新讀取章節內容的時候，可以改變網址。

						// 需要重新讀取頁面。e.g., 502
						var new_chapter_URL = get_chapter_URL(), chapter_time_interval = _this
								.get_chapter_time_interval(chapter_URL,
										work_data);
						process.stdout.write('process_chapter_data: '
								// 等待幾秒鐘 以重新取得章節內容頁面網址
								+ (chapter_time_interval > 0 ? 'Wait '
										+ library_namespace.age_of(0,
												chapter_time_interval) + ' to '
										: '')
								+ (chapter_URL === new_chapter_URL ? 'reget'
										: 'get') + ' chapter page ['
								+ chapter_URL + ']...\r');
						chapter_URL = new_chapter_URL;
						if (chapter_time_interval > 0) {
							setTimeout(reget_chapter_data,
									chapter_time_interval);
						} else {
							reget_chapter_data();
						}
						return;
					}

				} catch (e) {
					library_namespace.error(_this.id
							+ ': Error on chapter url: ' + chapter_URL);
					_this.onerror(e, work_data);
					typeof callback === 'function' && callback(work_data);
					return Work_crawler.THROWED;
				}
				// console.log(JSON.stringify(chapter_data));
				if (!chapter_data || !(image_list = chapter_data.image_list)
				//
				|| !((left = chapter_data.image_count) >= 1)
				//
				&& !((left = image_list.length) >= 1)) {
					if (!_this.need_create_ebook
					// 雖然是漫畫，但是本章節沒有獲取到任何圖片。
					&& (!chapter_data || !chapter_data.limited
					// 圖片檔案會用其他方式手動下載。
					&& !chapter_data.images_downloaded)) {
						var message = chapter_data.limited ? 'Limited'
								: 'No image got';
						library_namespace.debug(work_data.directory_name + ' #'
								+ chapter_NO + '/' + work_data.chapter_count
								+ ': ' + message);
						set_work_status(work_data, '#' + chapter_NO + ': '
								+ message);
					}
					// 注意: 若是沒有 reget_chapter，則 preserve_chapter_page 不應發生效用。
					if (work_data.reget_chapter && _this.preserve_chapter_page) {
						node_fs.writeFileSync(
						// 依然儲存cache。例如小說網站，只有章節文字內容，沒有圖檔。
						chapter_file_name, XMLHttp.buffer);
					} else if (_this.preserve_chapter_page === false) {
						// 明確指定不保留，將刪除已存在的 chapter page。
						library_namespace.debug('Romove ' + chapter_file_name,
								1, 'process_chapter_data');
						library_namespace.remove_file(chapter_file_name);
					}

					// 模擬已經下載完最後一張圖。
					left = 1;
					check_if_done();
					return;
				}

				// console.log(chapter_data);
				if (left !== image_list.length) {
					library_namespace.error('所登記的圖形數量' + left + '與有圖形列表長度'
							+ image_list.length + '不同！');
					if (left > image_list.length) {
						left = image_list.length;
					}
				}
				if (false && !_this.one_by_one) {
					// 當一次下載上百張相片的時候，就改成一個個下載圖像。
					_this.one_by_one = left > 100;
				}

				if (work_data.image_count >= 0) {
					work_data.image_count += left;
				}

				// 自動填補章節名稱。
				if (!chapter_data.title
						&& Array.isArray(work_data.chapter_list)
						&& library_namespace
								.is_Object(work_data.chapter_list[chapter_NO - 1])) {
					chapter_data.title = work_data.chapter_list[chapter_NO - 1].title;
				}
				// TODO: 自動填補 chapter_data.url。

				if (typeof _this.pre_get_images === 'function') {
					_this.pre_get_images(XMLHttp, work_data, chapter_data,
					// pre_get_images:function(XMLHttp,work_data,chapter_data,callback){;callback();},
					function() {
						process_images(chapter_data, XMLHttp);
					});
				} else {
					process_images(chapter_data, XMLHttp);
				}
			}

			function pre_parse_chapter_data(XMLHttp) {
				// 可能是從 library_namespace.get_URL_cache() 過來的。
				if (XMLHttp && XMLHttp.responseURL) {
					_this.last_fetch_time = Date.now();
				}

				// 對於每一張圖片都得要從載入的頁面獲得資訊的情況，可以參考 hhcool.js, dm5.js。

				if (typeof _this.pre_parse_chapter_data === 'function') {
					// 執行在解析章節資料 process_chapter_data() 之前的作業 (async)。
					// 必須自行保證執行 callback()，不丟出異常、中斷。
					_this.pre_parse_chapter_data(XMLHttp, work_data,
					// pre_parse_chapter_data:function(XMLHttp,work_data,callback,chapter_NO){;callback();},
					process_chapter_data.bind(XMLHttp), chapter_NO);
				} else {
					process_chapter_data(XMLHttp);
				}
			}

			function reget_chapter_data() {
				if (false && typeof chapter_URL !== 'string') {
					console.log(chapter_URL);
				}
				if (_this.skip_get_chapter_page) {
					pre_parse_chapter_data(null_XMLHttp);
					return;
				}
				// library_namespace.info('reget_chapter_data: ' + chapter_URL);
				get_URL(chapter_URL, pre_parse_chapter_data, _this.charset,
						null, Object.assign({
							error_retry : _this.MAX_ERROR_RETRY
						}, _this.get_URL_options));
			}

			if (work_data.reget_chapter) {
				reget_chapter_data();

			} else {
				// 警告: reget_chapter=false 僅適用於小說之類不取得圖片的情形，
				// 因為若有圖片（parse_chapter_data()會回傳chapter_data.image_list），將把chapter_page寫入僅能從chapter_URL取得名稱的於目錄中。
				library_namespace.get_URL_cache(chapter_URL, function(data,
						error, XMLHttp) {
					pre_parse_chapter_data({
						buffer : data,
						responseText : data && data.toString(_this.charset),
						responseURL : XMLHttp && XMLHttp.responseURL
					});
				}, {
					file_name : chapter_file_name,
					encoding : undefined,
					charset : _this.charset,
					get_URL_options : _this.get_URL_options
				});
			}
		}
		get_data();

		// image_data: latest_image_data
		function check_if_done(image_data, status) {
			if (_this.write_image_metadata
			// 將每個圖像的資訊寫入同名(添加.json延伸檔名)的JSON檔。
			&& library_namespace.file_exists(image_data.file)) {
				var chapter_data = work_data.chapter_list
						&& work_data.chapter_list[chapter_NO - 1],
				//
				metadata = Object.assign(library_namespace.null_Object(),
						work_data, chapter_data, image_data);
				delete metadata.chapter_list;
				library_namespace.write_file(image_data.file + '.json',
						metadata);
			}

			--left;

			if (typeof _this.after_get_image === 'function') {
				// 每張圖片下載結束都會執行一次。
				// var latest_image_data = image_list[image_list.index];
				// using: image_data
				_this.after_get_image(image_list, work_data, chapter_NO);
			}

			// this.dynamical_count_images: 動態改變章節中的圖片數量。
			// Dynamically change the number of pictures in the chapter.
			// 只有在 this.one_by_one===true 這個時候才會設定 image_list.index，
			// 因此只在設定了.one_by_one 的時候才有作用，否則就算改變 image_list 也已經來不及處理。
			if (_this.one_by_one && _this.dynamical_count_images) {
				left = image_list.length - image_list.index - 1;
			} else if (Array.isArray(image_list) && image_list.length > 1) {
				process.stdout.write('圖 ' + left + ' left...\r');
				library_namespace.debug(chapter_label + ': ' + left + ' left',
						3, 'check_if_done');
			}
			// console.log('check_if_done: left: ' + left);

			// 須注意若是最後一張圖 get_image()直接 return 了，
			// 此時尚未設定 waiting，因此此處不可以 waiting 判斷！
			if (left > 0) {
				// 還有尚未取得的檔案。
				if (waiting && left < 2) {
					library_namespace.debug('Waiting for:\n'
					//
					+ image_list.filter(function(image_data) {
						return !image_data.done;
					}).map(function(image_data) {
						return image_data.url + '\n→ ' + image_data.file;
					}));
				}
				return;
			}
			// assert: left===0

			// 已下載完本 chapter。

			// 紀錄最後下載的章節計數。
			work_data.last_download.chapter = chapter_NO;

			// 記錄下載錯誤的檔案。
			// TODO: add timestamp, work/chapter/NO, {Array}error code
			// TODO: 若錯誤次數少於限度，則從頭擷取work。
			if (_this.error_log_file && Array.isArray(image_list)) {
				var error_file_logs = [],
				// timestamp_prefix
				log_prefix = (new Date).format('%4Y%2m%2d') + '	';
				image_list.forEach(function(image_data, index) {
					if (image_data.has_error) {
						// 記錄下載錯誤的檔案數量。
						work_data.error_images++;
						error_file_logs.push(log_prefix + image_data.file + '	'
								+ image_data.parsed_url);
					}
				});

				if (error_file_logs.length > 0) {
					error_file_logs.push('');
					var log_directory = _this.main_directory
							+ _this.log_directory_name,
					//
					error_log_file = log_directory + _this.error_log_file,
					//
					error_log_file_backup = _this.error_log_file_backup
							&& log_directory + _this.error_log_file_backup;
					library_namespace.create_directory(
					// 先創建記錄用目錄。
					log_directory);
					if (_this.recheck && error_log_file_backup) {
						// 當從頭開始檢查時，重新設定錯誤記錄檔案。
						library_namespace.move_file(error_log_file,
								error_log_file_backup);
						// 移動完之後註銷檔案名稱以防被覆寫。
						_this.error_log_file_backup = null;
					}
					node_fs.appendFileSync(error_log_file,
					// 產生錯誤紀錄檔。
					error_file_logs.join(library_namespace.env.line_separator));
					set_work_status(work_data, chapter_label + ': '
							+ error_file_logs.length + ' images download error');
				}
			}

			if (_this.archive_images && images_archive
			//
			&& Array.isArray(image_list)
			// 完全沒有出現錯誤才壓縮圖像檔案。
			&& (!_this.archive_all_good_images_only
			//
			|| !image_list.some(function(image_data) {
				return image_data.has_error;
			}))) {
				if (images_archive.to_remove.length > 0) {
					process.stdout.write('Remove '
							+ images_archive.to_remove.length + ' files from ['
							// images_archive.archive_file_path
							+ images_archive.file_name + ']...\r');
					images_archive.remove(images_archive.to_remove.unique());
				}

				var chapter_files = library_namespace
						.read_directory(chapter_directory);
				if (!chapter_files) {
					// e.g., 未設定 this.preserve_chapter_page
				} else if (chapter_files.length === 0
						|| chapter_files.length === 1
						&& chapter_files[0] === chapter_page_file_name) {
					// 只剩下 chapter_page 的時候不再 update，避免磁碟作無用讀取。
					if (chapter_files.length === 1) {
						library_namespace.remove_file(chapter_directory
								+ chapter_page_file_name);
					}
					library_namespace.remove_directory(chapter_directory);
				} else {
					process.stdout.write(
					// create/update image archive: 漫畫下載完畢後壓縮圖像檔案。
					(images_archive.file_existed ? 'Update' : 'Create') + ' ['
					// images_archive.archive_file_path
					+ images_archive.file_name + ']...\r');
					images_archive.update(chapter_directory, {
						// 壓縮圖像檔案之後，刪掉原先的圖像檔案。
						remove : _this.remove_images_after_archive,
						recurse : true
					});
				}

				if (_this.write_chapter_metadata && library_namespace
				// 將每個章節壓縮檔的資訊寫入同名(添加.json延伸檔名)的JSON檔。
				.file_exists(images_archive.archive_file_path)) {
					var chapter_data = work_data.chapter_list
							&& work_data.chapter_list[chapter_NO - 1],
					//
					metadata = Object.assign(library_namespace.null_Object(),
							work_data, chapter_data);
					delete metadata.chapter_list;
					library_namespace.write_file(
							images_archive.archive_file_path + '.json',
							metadata);
				}
			}

			continue_next_chapter.call(_this, work_data, chapter_NO, callback);
		}
	}

	// @inner
	function continue_next_chapter(work_data, chapter_NO, callback) {
		// 這邊不紀錄最後下載的章節數 work_data.last_download.chapter。
		// 因為可能是 pre_get_chapter_data() 篩選排除之後直接被呼叫的。
		// 假如是因篩選排除的，可能有些章節沒有下載到，因此下一次下載的時候應該重新檢查。

		// 紀錄最後成功下載章節或者圖片日期。
		work_data.last_saved = (new Date).toISOString();
		// 紀錄已下載完之 chapter。
		this.save_work_data(work_data);

		if (typeof this.after_download_chapter === 'function') {
			this.after_download_chapter(work_data, chapter_NO);
		}

		// 增加章節計數，準備下載下一個章節。
		++chapter_NO;

		if ('jump_to_chapter' in work_data) {
			if (work_data.jump_to_chapter !== chapter_NO) {
				// work_data.jump_to_chapter 可用來手動設定下一個要取得的章節號碼。
				library_namespace.info(work_data.title + ': jump to chapter '
						+ work_data.jump_to_chapter + ' ← ' + chapter_NO);
				chapter_NO = work_data.jump_to_chapter;
			}
			delete work_data.jump_to_chapter;
		}

		if (chapter_NO > work_data.chapter_count) {
			if (Array.isArray(work_data.chapter_list)
					&& work_data.chapter_list.length === work_data.chapter_count + 1) {
				library_namespace
						.warn('若欲動態增加章節，必須手動增加章節數量: work_data.chapter_count++！');
			}

			library_namespace.log(this.id + ': ' + work_data.directory_name
			// 增加章節數量的訊息。
			+ ': ' + work_data.chapter_count
			//
			+ ' ' + (work_data.chapter_unit || this.chapter_unit)
			// 增加字數統計的訊息。
			+ (work_data.words_so_far > 0 ?
			//
			' (' + work_data.words_so_far + ' words)' : '')
			// 增加漫畫圖片數量的統計訊息。
			+ (work_data.image_count > 0 ?
			//
			', ' + work_data.image_count + ' images' : '')
			//
			+ ' done. ' + (new Date).toISOString() + ' 本作品下載作業結束.');
			if (work_data.error_images > 0) {
				library_namespace.error(this.id + ': '
						+ work_data.directory_name + ': '
						+ work_data.error_images
						+ ' images download error this time.');
			}
			if (typeof callback === 'function') {
				callback(work_data);
			}

		} else {
			// 為了預防太多堆疊，因此使用 setImmediate()。
			setImmediate(pre_get_chapter_data.bind(this, work_data, chapter_NO,
					callback));
		}
	}

	function image_path_to_url(path, server) {
		if (path.includes('://')) {
			return path;
		}

		if (!server.includes('://')) {
			// this.get_URL_options.headers.Host = server;
			server = 'http://' + server;
		}
		return server + path;
	}

	function EOI_error_path(path, XMLHttp) {
		return path.replace(/(\.[^.]*)$/, this.EOI_error_postfix
		// + (XMLHttp && XMLHttp.status ? ' ' + XMLHttp.status : '')
		+ '$1');
	}

	// 下載單一個圖片。
	// callback(image_data, status)
	function get_image(image_data, callback, images_archive) {
		// console.log(image_data);
		if (!image_data || !image_data.file || !image_data.url) {
			if (image_data) {
				image_data.has_error = true;
				image_data.done = true;
			}
			// 注意: 此時 image_data 可能是 undefined
			if (this.skip_error) {
				this.onwarning('未指定圖像資料', image_data);
			} else {
				this.onerror('未指定圖像資料', image_data);
			}
			if (typeof callback === 'function')
				callback(image_data, 'invalid_data');
			return;
		}

		// 檢查實際存在的圖片檔案。
		var image_downloaded = node_fs.existsSync(image_data.file)
				|| this.skip_existed_bad_file
				// 檢查是否已有上次下載失敗，例如server上本身就已經出錯的檔案。
				&& node_fs.existsSync(this.EOI_error_path(image_data.file));

		if (!image_downloaded) {
			if (this.acceptable_types && !image_data.acceptable_types)
				image_data.acceptable_types = this.acceptable_types;
			if (image_data.acceptable_types === 'images') {
				// 將會測試是否已經下載過一切可接受的檔案類別。
				image_data.acceptable_types = Object.keys(this.image_types);
			}

			// 可以接受的副檔名/檔案類別 acceptable file extensions
			// e.g., acceptable_types : [ 'png' ]
			// 當之前下載時發現檔案類別並非預設的、例如JPG檔案時，會將副檔名改為認證的副檔名。但是這樣一來可能就會找不到了。因此需要設定acceptable_types。
			if (Array.isArray(image_data.acceptable_types)) {
				image_downloaded = image_data.acceptable_types.some(function(
						extension) {
					var alternative_filename = image_data.file.replace(
							/\.[a-z\d]+$/, '.' + extension);
					if (node_fs.existsSync(alternative_filename)) {
						image_data.file = alternative_filename;
						return true;
					}
				});
			}
		}

		// 檢查壓縮檔裡面的圖片檔案。
		var image_archived, bad_image_archived;
		if (images_archive && images_archive.fso_path_hash
		// 檢查壓縮檔，看是否已經存在圖像檔案。
		&& image_data.file.startsWith(images_archive.work_directory)) {
			image_archived = image_data.file
					.slice(images_archive.work_directory.length);
			bad_image_archived = images_archive.fso_path_hash[this
					.EOI_error_path(image_archived)];
			if (image_archived && bad_image_archived) {
				images_archive.to_remove.push(bad_image_archived);
			}

			if (false) {
				console.log([ images_archive.fso_path_hash,
						image_data.acceptable_types, image_archived,
						images_archive.fso_path_hash[image_archived] ]);
				throw 123;
			}
			image_downloaded = image_downloaded
					|| images_archive.fso_path_hash[image_archived]
					|| this.skip_existed_bad_file
					// 檢查是否已有上次下載失敗，例如server上本身就已經出錯的檔案。
					&& bad_image_archived;

			if (!image_downloaded
			// 可以接受的副檔名/檔案類別 acceptable file extensions
			&& Array.isArray(image_data.acceptable_types)) {
				image_downloaded = image_data.acceptable_types.some(function(
						extension) {
					var alternative_filename = image_archived.replace(
							/\.[a-z\d]+$/, '.' + extension);
					return images_archive.fso_path_hash[alternative_filename];
				});
			}
		}

		if (image_downloaded) {
			// console.log('get_image: Skip ' + image_data.file);
			image_data.done = true;
			if (typeof callback === 'function')
				callback(image_data, 'image_downloaded');
			return;
		}

		// --------------------------------------

		var _this = this,
		// 漫畫圖片的 URL。
		image_url = image_data.url, server = this.server_list;
		if (server) {
			server = server[server.length * Math.random() | 0];
			image_url = this.image_path_to_url(image_url, server, image_data);
		} else {
			image_url = this.full_URL(image_url);
		}
		image_data.parsed_url = image_url;
		if (!PATTERN_non_CJK.test(image_url)) {
			library_namespace.warn('Need encodeURI: ' + image_url);
			// image_url = encodeURI(image_url);
		}

		if (!image_data.file_length) {
			image_data.file_length = [];
		}

		get_URL(image_url, function(XMLHttp) {
			// console.log(XMLHttp);
			// 圖片數據的內容。
			var contents = XMLHttp.buffer;
			if (_this.image_preprocessor) {
				// 圖片前處理程序 預處理器 image pre-processing
				contents = _this.image_preprocessor(contents, image_data)
						|| contents;
			}

			var has_error = !contents || !(contents.length >= _this.MIN_LENGTH)
					|| (XMLHttp.status / 100 | 0) !== 2, verified_image;
			if (!has_error) {
				image_data.file_length.push(contents.length);
				library_namespace.debug('測試圖像是否完整: ' + image_data.file, 2,
						'get_image');
				var file_type = library_namespace.file_type(contents);
				verified_image = file_type && !file_type.damaged;
				if (verified_image) {
					if (!(file_type.type in _this.image_types)) {
						library_namespace.warn('The file type ['
								+ file_type.type
								+ '] is not image types accepted!\n'
								+ image_data.file);
					}
					if (!image_data.file.endsWith('.' + file_type.extension)
					//
					&& (!file_type.extensions || !file_type.extensions
					// accept '.jpeg' as alias of '.jpg'
					.includes(image_data.file.match(/[^.]*$/)[0]))) {
						// 依照所驗證的檔案格式改變副檔名。
						image_data.file = image_data.file.replace(/[^.]+$/,
						// e.g. .png
						file_type.extension
						// 若是沒有辦法判別延伸檔名，那麼就採用預設的圖片延伸檔名。
						|| _this.default_image_extension);
					}
				}
			}
			// verified_image===true 則必然(!!has_error===false)
			// has_error表示下載過程發生錯誤，光是檔案損毀，不會被當作has_error!
			// has_error則必然(!!verified_image===false)

			if (false) {
				console.log([ _this.skip_error, _this.MAX_ERROR_RETRY,
				//
				has_error, _this.skip_error
				//
				&& image_data.error_count === _this.MAX_ERROR_RETRY ]);
				console.log('error count: ' + image_data.error_count);
			}
			if (verified_image || image_data.is_bad || _this.skip_error
			// 有出問題的話，最起碼都需retry足夠次數。
			&& image_data.error_count === _this.MAX_ERROR_RETRY
			//
			|| _this.allow_EOI_error
			//
			&& image_data.file_length.length > _this.MAX_EOI_ERROR) {
				// console.log(image_data.file_length);
				if (verified_image || image_data.is_bad || _this.skip_error
				// skip error 的話，不管有沒有取得過檔案(包括404圖像不存在)，依然 pass。
				// && image_data.file_length.length === 0
				//
				|| image_data.file_length.cardinal_1()
				// ↑ 若是每次都得到相同的檔案長度，那就當作來源檔案本來就有問題。
				&& (_this.skip_error || _this.allow_EOI_error
				//
				&& image_data.file_length.length > _this.MAX_EOI_ERROR)) {
					// 圖片下載過程結束，不再嘗試下載圖片:要不是過關，要不就是錯誤太多次了。
					var bad_file_path = _this.EOI_error_path(image_data.file,
							XMLHttp);
					if (has_error || image_data.is_bad
							|| verified_image === false) {
						image_data.file = bad_file_path;
						image_data.has_error = true;
						library_namespace.warn('Force saving '
								+ (has_error ? (contents ? 'bad' : 'empty')
										+ ' file as image'
								// assert: (!!verified_image===false)
								// 圖檔損壞: e.g., Do not has EOI
								: 'bad image')
								+ (XMLHttp.status
								// 狀態碼正常就不顯示。
								&& (XMLHttp.status / 100 | 0) !== 2
								//
								? ' (status ' + XMLHttp.status + ')' : '')
								// 顯示 crawler 程式指定的錯誤。
								+ (image_data.is_bad ? ' (error: '
										+ image_data.is_bad + ')' : '')
								+ (contents ? ' ' + contents.length + ' bytes'
										: '') + ': ' + image_data.file + '\n← '
								+ image_url);
						if (!contents
						// 404之類，就算有內容，也不過是錯誤訊息頁面。
						|| (XMLHttp.status / 100 | 0) === 4) {
							contents = '';
						}
					} else {
						// pass, 過關了。
						if (node_fs.existsSync(bad_file_path)) {
							library_namespace
									.info('刪除損壞的舊圖片檔：' + bad_file_path);
							library_namespace.fs_remove(bad_file_path);
						}
						if (bad_image_archived) {
							// 登記壓縮檔內可以刪除的損壞圖檔。
							images_archive.to_remove.push(bad_image_archived);
						}
					}

					var old_file_status, old_archived_file =
					// image_data.has_error?bad_image_archived:image_archived
					image_archived || bad_image_archived;
					try {
						old_file_status = node_fs.statSync(image_data.file);
					} catch (e) {
						// old/bad file not exist
					}

					if (old_archived_file && (!old_file_status
					//
					|| old_archived_file.size > old_file_status.size)) {
						// 壓縮檔內的圖像質量更好的情況，那就採用壓縮檔的。
						if (old_file_status
								&& old_archived_file.size < contents.length) {
							library_namespace.warn('壓縮檔內的圖像質量比目錄中的更好'
							//
							+ (_this.archive_images ? '，但在下載完後將可能在壓縮作業時被覆蓋'
							//
							: '') + '： ' + old_archived_file.path);
						}

						old_file_status = old_archived_file;
					}

					if (!old_file_status
					// 得到更大的檔案，寫入更大的檔案。
					|| !(old_file_status.size >= contents.length)) {
						if (_this.image_post_processor) {
							// 圖片後處理程序 image post-processing
							contents = _this.image_post_processor(contents,
									image_data
							// , images_archive
							)
									|| contents;
						}

						if (!image_data.has_error || _this.preserve_bad_image) {
							library_namespace.debug('保存圖片數據到 HDD 上: '
									+ image_data.file, 1, 'get_image');
							// TODO: 檢查舊的檔案是不是文字檔。例如有沒有包含 HTML 標籤。
							try {
								node_fs
										.writeFileSync(image_data.file,
												contents);
							} catch (e) {
								library_namespace.error(e);
								_this.onerror('無法寫入圖像檔案 [' + image_data.file
								//
								+ ']。這可能肇因於作品資訊 cache 與當前網站上之作品章節結構不同。'
								//
								+ '若您之前曾經下載過本作品的話，請封存原有作品目錄，'
								//
								+ '或將作品資訊 cache 改名之後嘗試全新下載。', image_data);
								if (typeof callback === 'function') {
									callback(image_data,
											'image_file_write_error');
								}
								return Work_crawler.THROWED;
							}
						}
					} else if (old_file_status
							&& old_file_status.size > contents.length) {
						library_namespace.log('存在較大的舊檔 ('
								+ old_file_status.size + '>' + contents.length
								+ ')，將不覆蓋：' + image_data.file);
					}
					image_data.done = true;
					if (typeof callback === 'function')
						callback(image_data/* , 'OK' */);
					return;
				}
			}

			// 有錯誤。下載錯誤時報錯。
			library_namespace.warn(
			// 圖檔損壞: e.g., Do not has EOI
			(verified_image === false ? 'Image damaged: '
					: (XMLHttp.status ? XMLHttp.status + ' ' : '')
							+ '('
							+ (!contents ? 'No contents' : contents.length
									+ ' B'
									+ (contents.length >= _this.MIN_LENGTH ? ''
											: ', too small'))
							+ '): Failed to get image ')
					+ image_url + '\n→ ' + image_data.file);
			if (image_data.error_count === _this.MAX_ERROR_RETRY) {
				image_data.has_error = true;
				// throw new Error(_this.id + ': ' + _this.MESSAGE_RE_DOWNLOAD);
				library_namespace.log(_this.id + ': '
						+ _this.MESSAGE_RE_DOWNLOAD);
				// console.log('error count: ' + image_data.error_count);
				if (contents && contents.length > 10
				//
				&& contents.length < _this.MIN_LENGTH
				// 檔案有驗證過，只是太小時，應該不是 false。
				&& verified_image !== false
				// 就算圖像是完整的，只是比較小，HTTP status code 也應該是 2xx。
				&& (XMLHttp.status / 100 | 0) === 2) {
					library_namespace.warn('或許圖像是完整的，只是過小而未達標，例如幾乎為空白之圖像。'
							+ '您可設定 MIN_LENGTH，如 MIN_LENGTH=' + contents.length
							+ ' 表示允許最小為 ' + contents.length + ' bytes 的圖像；'
							+ '或者先設定 skip_error=true 來忽略圖像錯誤，'
							+ '待取得檔案後，自行更改檔名，去掉錯誤檔名後綴'
							+ JSON.stringify(_this.EOI_error_postfix)
							+ '以跳過此錯誤。');

				} else if (image_data.file_length.length > 1
						&& !image_data.file_length.cardinal_1()) {
					library_namespace.warn('下載所得的圖像大小不同: '
							+ image_data.file_length + '。若非因網站提早截斷連線，'
							+ '那麼您或許需要增長 timeout 來提供足夠的時間下載圖片？');
					// TODO: 提供續傳功能。
					// e.g., for 9mdm.js→dagu.js 魔剑王 第59话 4392-59-011.jpg

				} else if (!_this.skip_error) {
					library_namespace
							.info('若錯誤持續發生，您可以設定 skip_error=true 來忽略圖像錯誤。');
				}

				_this.onerror('圖像下載錯誤', image_data);
				// image_data.done = false;
				if (typeof callback === 'function')
					callback(image_data, 'image_download_error');
				return Work_crawler.THROWED;
				// 網頁介面不可使用process.exit()，會造成白屏
				// process.exit(1);
			}

			image_data.error_count = (image_data.error_count | 0) + 1;
			library_namespace.log('get_image: '
					+ gettext('Retry %1', image_data.error_count + '/'
							+ _this.MAX_ERROR_RETRY) + '...');
			var get_image_again = function() {
				_this.get_image(image_data, callback, images_archive);
			}
			if (image_data.time_interval > 0) {
				process.stdout.write('get_image: Wait '
						+ library_namespace.age_of(0, image_data.time_interval)
						+ ' to retry image [' + image_data.url + ']...\r');
				setTimeout(get_image_again, image_data.time_interval);
			} else
				get_image_again();

		}, 'buffer', null, Object.assign({
			/**
			 * 最多平行取得檔案(圖片)的數量。
			 * 
			 * <code>
			incase "MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 connect listeners added. Use emitter.setMaxListeners() to increase limit"
			</code>
			 */
			max_listeners : 300
		}, image_data.reset_get_URL_options ? null : this.get_URL_options,
				image_data.get_URL_options));
	}

	// --------------------------------------------------------------------------------------------
	// 在取得小說章節內容的時候，若發現有章節被目錄漏掉，則將之補上。

	// 通常應該會被 parse_chapter_data() 呼叫。
	function check_next_chapter(work_data, chapter_NO, html,
			PATTERN_next_chapter) {
		var next_chapter = work_data.chapter_list[chapter_NO],
		// chapter_data.url
		next_chapter_url = next_chapter && next_chapter.url,
		// /下一[章页][：: →]*<a [^<>]*?href="([^"]+.html)"[^<>]*>/
		next_url = html.match(PATTERN_next_chapter ||
		// PTCMS default. e.g., "下一章 →" /下一章[：: →]*/
		// PATTERN_next_chapter: [ all, next chapter url ]
		// e.g., <a href="//read.qidian.com/chapter/abc123">下一章</a>
		/ href=["']([^<>"']+)["'][^<>]*>(?:<button[^<>]*>)?下一[章页]/);
		// console.log(chapter_NO + ': ' + next_url[1]);

		if (next_chapter && next_url

		// 去掉開頭的 "./"。
		&& (next_url = next_url[1].replace(/^(\.\/)+/,
		//
		this.chapter_URL(work_data, chapter_NO).replace(/[^\/]+$/, '')))

		// 有些在目錄上面的章節連結到了錯誤的頁面，只能靠下一頁來取得正確頁面。
		&& next_url !== next_chapter_url
		// 許多網站會把最新章節的下一頁設成章節列表，因此必須排除章節列表的網址。
		&& next_url !== work_data.url
		// && next_url !== './'
		&& next_url !== 'index.html'

		// 符合這些條件的，依然是相同的網址。
		// 照理來說.startsWith()本陳述應該皆為真。
		&& !(next_url.startsWith(work_data.base_url)
		// 檢查正規化規範連結之後是否與本章節相同。
		? (next_url.length < next_chapter_url.length
		//
		? next_url === next_chapter_url.slice(work_data.base_url.length)
		//
		: next_chapter_url === next_url.slice(work_data.base_url.length))
		//
		: (next_url.length < next_chapter_url.length
		//
		? next_chapter_url.endsWith(next_url)
		// 
		: next_url.endsWith(next_chapter_url)))

		) {

			if (false) {
				// 不採用插入的方法，直接改掉下一個章節。
				library_namespace.info(library_namespace.display_align([
						[ 'chapter ' + chapter_NO + ': ', next_chapter_url ],
						[ '→ ', next_url ] ]));
				next_chapter.url = next_url;
			}

			if (work_data.chapter_list.some(function(chapter_data) {
				return chapter_data.url === next_url;
			})) {
				// url 已經在 chapter_list 裡面。
				return;
			}

			var message = 'check_next_chapter: Insert a chapter url after chapter '
					+ chapter_NO + ': ' + next_url
					// 原先下一個章節的 URL 被往後移一個。
					+ (next_chapter_url ? '→' + next_chapter_url : '');
			if (next_chapter_url) {
				// Insert a chapter url
				library_namespace.log(message);
			} else {
				// Append a chapter url at last
				library_namespace.debug(message);
			}

			// 動態增加章節。
			work_data.chapter_list.splice(chapter_NO, 0, {
				// title : '',
				url : next_url
			});
			// 重新設定章節數量。
			work_data.chapter_count = work_data.chapter_list.length;
			return true;
		}
	}

	// --------------------------------------------------------------------------------------------
	// 本段功能須配合 CeL.application.storage.EPUB 並且做好事前設定。
	// 可參照 https://github.com/kanasimi/work_crawler

	function set_last_update_Date(work_data, force) {
		if (!library_namespace.is_Date(work_data.last_update_Date)
				&& typeof work_data.last_update === 'string'
				&& work_data.last_update) {
			var last_update_Date = work_data.last_update;
			// assert: typeof last_update_Date === 'string'
			last_update_Date = last_update_Date.to_Date({
				// 注意: 若此時尚未設定 work_data.time_zone，可能會獲得錯誤的結果。
				zone : work_data.time_zone
			});
			// 注意：不使用 cache。
			if (force || ('time_zone' in work_data))
				work_data.last_update_Date = last_update_Date;
		}
		return work_data.last_update_Date;
	}

	function create_ebook(work_data) {
		if (!this.site_id) {
			this.site_id = this.id;
		}

		set_last_update_Date(work_data, true);

		var ebook_directory = work_data.directory + work_data.directory_name
		// + ' ebook'
		, ebook_files = library_namespace.read_directory(ebook_directory),
		//
		ebook_file_path = ebook_path.call(this, work_data);
		// ebook_file_path = ebook_file_path[0] + ebook_file_path[1];

		if ((!Array.isArray(ebook_files) || !ebook_files.includes('mimetype'))
				// 若是沒有cache，但是有舊的epub檔，那麼就將之解壓縮。
				// 其用意是為了保留媒體檔案與好的舊章節，預防已經無法取得。
				// 由於這個動作，當舊的電子書存在時將不會清場。若有必要清場（如太多冗贅），須自行將舊電子書刪除。
				&& library_namespace.file_exists(ebook_file_path[0]
						+ ebook_file_path[1])) {
			var ebook_archive = new library_namespace.storage.archive(
					ebook_file_path[0] + ebook_file_path[1]);
			process.stdout.write('Extract ebook as cache: ['
			// ebook_archive.archive_file_path
			+ ebook_file_path[1] + ']...\r');
			ebook_archive.extract({
				output : ebook_directory
			});
		}

		// CeL.application.storage.EPUB
		var ebook = new library_namespace.EPUB(ebook_directory, {
			rebuild : this.hasOwnProperty('rebuild_ebook')
			// rebuild: 重新創建, 不使用舊的.opf資料. start over, re-create
			? work_data.rebuild_ebook : work_data.reget_chapter
					|| work_data.regenerate,
			id_type : this.site_id,
			// 以下為 epub <metadata> 必備之元素。
			// 小説ID
			identifier : work_data.id,
			title : work_data.title,
			language : work_data.language || this.language,
			// 作品內容最後編輯時間。
			modified : work_data.last_update_Date
		}), subject = [];
		// keywords 太多雜訊，如:
		// '万古剑神,,万古剑神全文阅读,万古剑神免费阅读,万古剑神txt下载,万古剑神txt全集下载,万古剑神蒙白'
		'status,genre,tags,category,categories,类型'.split(',')
		// 標籤 類別 類型 类型 types
		.forEach(function(type) {
			if (work_data[type])
				subject = subject.concat(work_data[type]);
		});

		ebook.time_zone = work_data.time_zone || this.time_zone;

		// http://www.idpf.org/epub/31/spec/epub-packages.html#sec-opf-dcmes-optional
		ebook.set({
			// 作者名
			creator : work_data.author,
			// 🏷標籤, ジャンル, タグ, キーワード
			subject : subject.unique(),
			// 作品描述: 劇情簡介, synopsis, あらすじ
			description : get_label(work_data.description
			// .description 中不可存在 tag。
			.replace(/\n*<br[^<>]+>\n*/ig, '\n')),
			publisher : work_data.site_name + ' (' + this.base_URL + ')',
			// source URL
			source : work_data.url
		});

		if (work_data.image) {
			// cover image of work
			ebook.set_cover(work_data.image);
		}

		return work_data[this.KEY_EBOOK] = ebook;
	}

	// 找出段落開頭。
	// '&nbsp;' 已經被 normailize_contents() @CeL.EPUB 轉換為 '&#160;'
	var PATTERN_PARAGRAPH_START_CMN = /(^|\n|<\/?(?:br|p)(?:[^a-z][^<>]*)?>)(?:&#160;|[\s　]){4,}([^\s　\n&])/ig,
	//
	PATTERN_PARAGRAPH_START_JP = new RegExp(PATTERN_PARAGRAPH_START_CMN.source
			.replace('{4,}', '{2,}'), PATTERN_PARAGRAPH_START_CMN.flags);

	// 通常應該會被 parse_chapter_data() 呼叫。
	function add_ebook_chapter(work_data, chapter_NO, data) {
		var ebook = work_data && work_data[this.KEY_EBOOK];
		if (!ebook) {
			return;
		}

		if (!data.sub_title) {
			if ('title' in data) {
				// throw '請將 parse_chapter_data() 中章節名稱設定在 sub_title 而非 title!';
				// 當僅設定title時，將之當做章節名稱而非part名稱。
				data.sub_title = data.title;
				delete data.title;
			} else if (work_data.chapter_list
					&& work_data.chapter_list[chapter_NO - 1].title) {
				data.sub_title = work_data.chapter_list[chapter_NO - 1].title;
			}
		}

		if (Array.isArray(data.title)) {
			data.title = data.title.join(' - ');
		}
		// assert: !data.title || typeof data.title === 'string'

		var language = work_data.language
		// e.g., 'cmn-Hans-CN'
		&& work_data.language.match(/^(ja|(?:zh-)?cmn)(?:$|[^a-z])/);
		if (language) {
			language = language[1].replace(/^zh-cmn/, 'cmn');
		}

		var _this = this,
		//
		chapter_data = work_data.chapter_list
				&& work_data.chapter_list[chapter_NO - 1],
		// 卷篇集幕部冊册本/volume/part/book
		part_title = data.title || chapter_data && chapter_data.part_title,
		// 章節名稱 / 篇章名稱 / 章節节回折篇話话頁页/chapter
		chapter_title = data.sub_title || chapter_data
				&& (chapter_data.chapter_title || chapter_data.title),
		//
		file_title = chapter_NO.pad(3) + ' '
				+ (part_title ? part_title + ' - ' : '')
				+ (chapter_title || ''),
		//
		item_data = {
			title : file_title,
			// include images / 自動載入內含資源, 將外部media內部化
			internalize_media : true,
			file : library_namespace.to_file_name(file_title + '.xhtml'),
			// 一般說來必須設定 work_data.chapter_list。
			date : data.date || chapter_data && chapter_data.date,
			// 設定item_data.url可以在閱讀電子書時，直接點選標題就跳到網路上的來源。
			url : data.url
					|| this.full_URL(this.chapter_URL(work_data, chapter_NO)),
			// pass Referer, User-Agent
			get_URL_options : Object.assign({
				error_retry : this.MAX_ERROR_RETRY
			}, this.get_URL_options),
			words_so_far : work_data.words_so_far
		},
		//
		item = {
			title : get_label(part_title || ''),
			sub_title : get_label(chapter_title || ''),
			text : data.text,
			post_processor : function(contents) {
				// 正規化小說章節文字。
				if (language === 'ja') {
					contents = contents.replace(PATTERN_PARAGRAPH_START_JP,
					// 日本語では行頭から一文字の字下げをする。
					'$1　$2');
				} else if (language) {
					// assert: language: "cmn" (中文)
					// TODO: 下載完畢後作繁簡轉換。
					contents = contents.replace(PATTERN_PARAGRAPH_START_CMN,
					// 中文每段落開頭空兩個字。
					'$1　　$2');
				}

				// TODO: 可去除一開始重複的章節標題。

				if (typeof _this.contents_post_processor === 'function') {
					contents = _this.contents_post_processor(contents,
							work_data);
				}

				if (contents.length < _this.MIN_CHAPTER_SIZE) {
					set_work_status(work_data, '#'
							+ chapter_NO
							+ ': '
							+ (contents.length ? '字數過少 (' + contents.length
									+ ')' : '無內容'));
				}
				return contents;
			}
		};
		// library_namespace.log('file_title: ' + file_title);

		item = ebook.add(item_data, item);

		// 登記本作品到本章節總計的字數。
		if (item && !item.error && item_data.word_count > 0) {
			work_data.words_so_far = (work_data.words_so_far || 0)
					+ item_data.word_count;
		}

		return item;
	}

	// 一般小説, 長篇小說
	// @see .chapter_unit
	// [ all, author, title, site name, date, chapter count, work id ]
	var PATTERN_ebook_file = /^\((?:一般|長篇|短篇|言情|日系)?小[說説]\) \[([^\[\]]+)\] ([^\[\]]+) \[(.*?) (\d{8})(?: (\d{1,4})[章節节回折篇話话頁页])?\]\.(.+)\.epub$/i;
	function parse_ebook_name(file_name) {
		library_namespace.debug(file_name, 3, 'parse_ebook_name');
		var matched = typeof file_name === 'string'
				&& file_name.match(PATTERN_ebook_file);
		// console.log(matched);
		if (matched) {
			return {
				file_name : file_name,
				author : matched[1],
				title : matched[2],
				// titles : matched[2].trim().split(' - '),
				site_name : matched[3],
				// e.g., "20170101"
				date : matched[4],
				chapter_count : matched[5],
				// book id in this site
				id : matched[6]
			};
		}
	}

	function get_file_status(file_name, directory) {
		var status = node_fs.lstatSync((directory || '') + file_name);
		status.name = file_name;
		return status;
	}

	// @inner
	// remove duplicate title ebooks.
	// 封存舊的ebooks，移除較小的舊檔案。
	function remove_old_ebooks(only_id) {
		// only_id = undefined;
		if (only_id !== undefined) {
			// assert: {String|Number}only_id
			only_id = only_id.toString();
			var _only_id = this.parse_ebook_name(only_id);
			if (_only_id)
				only_id = _only_id.id;
		}

		var _this = this;

		if (!this.ebook_archive_directory) {
			this.ebook_archive_directory = this.main_directory
					+ this.archive_directory_name;
			if (!library_namespace
					.directory_exists(this.ebook_archive_directory)) {
				library_namespace.create_directory(
				// 先創建封存用目錄。
				this.ebook_archive_directory);
			}
		}

		function for_each_old_ebook(directory, for_old_smaller, for_else_old) {
			var last_id, last_file,
			//
			ebooks = library_namespace.read_directory(directory);
			// console.log(ebooks);

			if (!ebooks) {
				// 照理來說應該在之前已經創建出來了。
				library_namespace.warn('不存在封存檔案用的目錄: '
						+ _this.ebook_archive_directory);
				return;
			}

			ebooks
			// assert: 依 id 舊至新排列
			.sort().map(_this.parse_ebook_name.bind(_this))
			//
			.forEach(function(data) {
				if (!data
				// 僅針對 only_id。
				|| only_id && data.id !== only_id) {
					return;
				}
				// console.log('-'.repeat(60));
				// console.log(data);
				if (!last_id || last_id !== data.id) {
					last_id = data.id;
					last_file = data.file_name;
					return;
				}

				var this_file = get_file_status(
				//
				data.file_name, directory);
				// console.log(this_file);
				if (typeof last_file === 'string') {
					last_file = get_file_status(
					//
					last_file, directory);
				}
				// console.log(last_file);
				// assert: this_file, last_file are all {Object}(file status)

				if (this_file.size >= last_file.size) {
					for_old_smaller(last_file, this_file);
				} else if (for_else_old) {
					for_else_old(last_file, this_file);
				}

				last_file = this_file;
			});
		}

		// 封存較小的ebooks舊檔案。
		for_each_old_ebook(this.main_directory, function(last_file) {
			last_file = last_file.name;
			library_namespace.log(_this.main_directory + last_file
			// 新檔比較大。刪舊檔或將之移至archive。
			+ '\n→ ' + _this.ebook_archive_directory + last_file);
			library_namespace.move_file(
			//
			_this.main_directory + last_file,
			//
			_this.ebook_archive_directory + last_file);

		}, this.milestone_extension && function(last_file) {
			last_file = _this.main_directory + last_file.name;
			var extension = (typeof _this.milestone_extension === 'string'
			// allow .milestone_extension = true
			? _this.milestone_extension : '.milestone') + '$1',
			// 舊檔比較大!!將之標註成里程碑紀念/紀錄。
			rename_to = last_file.replace(/(.[a-z\d\-]+)$/i, extension);
			// assert: PATTERN_ebook_file.test(rename_to) === false
			// 不應再被納入檢測。
			library_namespace.info(library_namespace.display_align({
				'Set milestone:' : last_file,
				'move to →' : rename_to
			}));
			library_namespace.move_file(last_file, rename_to);
		});

		// ✘ 移除.ebook_archive_directory中，較小的ebooks舊檔案。
		// 僅留存最新的一個ebooks舊檔案。
		for_each_old_ebook(this.ebook_archive_directory, function(last_file,
				this_file) {
			library_namespace.info('remove_old_ebooks: '
			// 新檔比較大。刪舊檔。
			+ _this.ebook_archive_directory + last_file.name + ' ('
			// https://en.wikipedia.org/wiki/Religious_and_political_symbols_in_Unicode
			+ this_file.size + ' = ' + last_file.size + '+'
			// ✞ Memorial cross, Celtic cross
			+ (this_file.size - last_file.size) + ')');
			library_namespace.remove_file(
			//
			_this.ebook_archive_directory + last_file.name);
		});
	}

	// ebook_path.call(this, work_data, file_name)
	function ebook_path(work_data, file_name) {
		if (!file_name) {
			file_name =
			// e.g., "(一般小説) [author] title [site 20170101 1話].id.epub"
			[ '(一般小説) [', work_data.author, '] ', work_data.title, ' [',
					work_data.site_name, ' ',
					work_data.last_update_Date.format('%Y%2m%2d'),
					work_data.chapter_count >= 1
					//
					? ' ' + work_data.chapter_count
					//
					+ (work_data.chapter_unit || this.chapter_unit) : '', '].',
					typeof work_data.directory_id === 'function'
					// 自行指定作品放置目錄與 ebook 用的 work id。
					&& work_data.directory_id() || work_data.id, '.epub' ]
					.join('');
		}
		file_name = library_namespace.to_file_name(file_name);
		// assert: PATTERN_ebook_file.test(file_name) === true

		// console.trace('ebook_path: file_name: ' + file_name);
		return [ work_data.ebook_directory || this.main_directory, file_name ];
	}

	function pack_ebook(work_data, file_name) {
		// remove_old_ebooks.call(this);

		var ebook = work_data && work_data[this.KEY_EBOOK];
		if (!ebook) {
			return;
		}

		process.title = '打包 epub: ' + work_data.title + ' @ ' + this.id;
		var file_path = ebook_path.call(this, work_data, file_name);

		// https://github.com/ObjSal/p7zip/blob/master/GUI/Lang/ja.txt
		library_namespace.debug('打包 epub: ' + file_path[1], 1, 'pack_ebook');

		// this: this_site
		ebook.pack(file_path, this.remove_ebook_directory, remove_old_ebooks
				.bind(this, work_data.id));
		// 等待打包...
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	return Work_crawler;
}
