/**
 * @name WWW work crawler sub-functions
 * 
 * @fileoverview WWW work crawler functions: part of ebook
 * 
 * @since 2019/10/13 拆分自 CeL.application.net.work_crawler
 */

'use strict';

// --------------------------------------------------------------------------------------------

if (typeof CeL === 'function') {
	// 忽略沒有 Windows Component Object Model 的錯誤。
	CeL.env.ignore_COM_error = true;

	CeL.run({
		// module name
		name : 'application.net.work_crawler.ebook',

		require : 'application.net.work_crawler.',

		// 設定不匯出的子函式。
		no_extend : 'this,*',

		// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
		code : module_code
	});
}

function module_code(library_namespace) {

	// requiring
	var Work_crawler = library_namespace.net.work_crawler, crawler_namespace = Work_crawler.crawler_namespace;

	var gettext = library_namespace.locale.gettext,
	/** node.js file system module */
	node_fs = library_namespace.platform.nodejs && require('fs');

	// --------------------------------------------------------------------------------------------

	// 在下載/獲取小說章節內容的時候，若發現有章節被目錄漏掉，則將之補上。

	// 通常應該會被 parse_chapter_data() 呼叫。
	function check_next_chapter(work_data, chapter_NO, html,
			PATTERN_next_chapter) {
		// /下一[章页][：: →]*<a [^<>]*?href="([^"]+.html)"[^<>]*>/
		var next_url = html && html.match(PATTERN_next_chapter ||
		// PTCMS default. e.g., "下一章 →" /下一章[：: →]*/
		// PATTERN_next_chapter: [ all, next chapter url ]
		// e.g., <a href="//read.qidian.com/chapter/abc123">下一章</a>
		/ href=["']([^<>"']+)["'][^<>]*>(?:<button[^<>]*>)?下一[章页]/);
		// console.log(chapter_NO + ': ' + next_url[1]);

		if (!next_url)
			return;

		// 去掉開頭的 "./"。
		next_url = new library_namespace.URI(next_url[1],
		// TODO: {Array}this.chapter_URL()
		this.chapter_URL(work_data, chapter_NO).replace(/[^\/]+$/, ''))
				.toString();
		if (!next_url)
			return;

		var full_next_url = this.full_URL(next_url),
		//
		next_chapter = work_data.chapter_list[chapter_NO],
		// chapter_data.url
		next_chapter_url = next_chapter && next_chapter.url;

		if (next_chapter_url && !next_chapter_url.startsWith('/')
		// e.g., '123.htm', '123/123.htm'
		&& !next_chapter_url.includes('://')) {
			next_chapter_url = this.chapter_URL(work_data, chapter_NO).replace(
					/[^\/]*$/, next_chapter_url);
		}

		if (false) {
			console.trace([ full_next_url, work_data.url, next_chapter_url,
					this.full_URL(next_chapter_url) ]);
		}
		if (full_next_url === work_data.url
		// 許多網站會把最新章節的下一頁設成章節列表，因此必須排除章節列表的網址。
		|| full_next_url === work_data.chapter_list_URL
		// 有些在目錄上面的章節連結到了錯誤的頁面，只能靠下一頁來取得正確頁面。
		|| full_next_url === this.full_URL(next_chapter_url)) {
			return;
		}

		if (false) {
			// 不採用插入的方法，直接改掉下一個章節。
			library_namespace.info(library_namespace.display_align([
			// gettext_config:{"id":"chapter-$1"}
			[ gettext('章節編號%1：', chapter_NO), next_chapter_url ],
					[ '→ ', next_url ] ]));
			next_chapter.url = next_url;
		}

		if (work_data.chapter_list.some(function(chapter_data) {
			return chapter_data.url === next_url
					|| chapter_data.url === full_next_url;
		})) {
			// url 已經在 chapter_list 裡面。
			return;
		}

		var message = work_data.chapter_list[chapter_NO - 1];
		message = [ 'check_next_chapter: ', {
			// gettext_config:{"id":"insert-a-chapter-url-after-chapter-$1-$2"}
			T : [ 'Insert a chapter url after chapter %1: %2', chapter_NO
			//
			+ (message && message.url ? ' (' + message.url + ')' : ''),
			//
			next_url ]
		},
		// 原先下一個章節的 URL 被往後移一個。
		next_chapter_url ? ' → ' + next_chapter_url : '' ];
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

	// --------------------------------------------------------------------------------------------
	// 本段功能須配合 CeL.application.storage.EPUB 並且做好事前設定。
	// 可參照 https://github.com/kanasimi/work_crawler

	// extract "繁簡轉換 cache.7z" or "繁簡轉換 cache.zip"
	function extract_convert_cache_directory(work_data) {
		var cache_directory = work_data.convert_options.cache_directory
				.replace(/[\\\/]$/, '');
		if (library_namespace.directory_exists(cache_directory)) {
			library_namespace.info('extract_convert_cache_directory: '
			// 語言轉換 TAG_text_converted
			// gettext_config:{"id":"overwrite-the-files-in-the-cache-directory-$1-for-traditional-and-simplified-chinese-conversions"}
			+ gettext('將覆寫繁簡中文轉換快取目錄 [%1] 中的檔案。', cache_directory));
		}

		var cache_archive_file = cache_directory + '.7z';
		if (!library_namespace.file_exists(cache_archive_file)
				&& !library_namespace.file_exists(
				//
				cache_archive_file = cache_directory + '.zip')) {
			return;
		}

		cache_archive_file = new library_namespace.storage.archive(
				cache_archive_file);
		return new Promise(function(resolve, reject) {
			library_namespace.log_temporary({
				// gettext_config:{"id":"decompress-the-cache-files-for-traditional-and-simplified-chinese-conversions-$1"}
				T : [ '解壓縮繁簡中文轉換快取檔案：[%1]。',
						cache_archive_file.archive_file_path ]
			});
			cache_archive_file.extract({
				// 解壓縮 "!short_sentences_word_list.json" 時會跳出 prompt。
				yes : true,
				output : work_data.directory
			}, function(data, error) {
				error ? reject(error) : resolve(data);
			});
		});
	}

	function archive_convert_cache_directory(work_data) {
		var cache_directory = work_data.convert_options.cache_directory
				.replace(/[\\\/]$/, '');
		var cache_archive_file = cache_directory + '.7z';

		cache_archive_file = new library_namespace.storage.archive(
				cache_archive_file);
		return new Promise(function(resolve, reject) {
			library_namespace.log_temporary({
				// gettext_config:{"id":"compress-the-cache-files-for-traditional-and-simplified-chinese-conversions-$1"}
				T : [ '壓縮繁簡中文轉換快取檔案：[%1]。',
						cache_archive_file.archive_file_path ]
			});
			cache_archive_file.update(cache_directory, {
				only_when_newer_exists : 'file',
				level : 'max',
				remove : true,
				recurse : true
			}, function(data, error) {
				error ? reject(error) : resolve(data);
			});
		});
	}

	// ----------------------------------------------------

	function set_last_update_Date(work_data, force) {
		if (!library_namespace.is_Date(work_data.last_update_Date)
				&& typeof work_data.last_update === 'string'
				&& work_data.last_update) {
			var last_update_Date = work_data.last_update;
			// assert: typeof last_update_Date === 'string'

			var matched = last_update_Date
			// dm5.js: "02月27号"
			.match(/^(\d{1,2})[-/月](\d{1,2})[日号]?$/);
			if (matched) {
				// for month-date. e.g., '02-11'
				last_update_Date = '/' + matched[1] + '/' + matched[2];
				var year = (new Date).getFullYear(), date = year
						+ last_update_Date;
				last_update_Date = Date.parse(date) > Date.now() ? (year - 1)
						+ last_update_Date : date;
			}

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

	// gettext_config:{"id":"language-conversion"}
	var TAG_text_converted = '語言轉換';
	function create_ebook(work_data, options) {
		// var forced_recreate = options && options.forced_recreate;

		// 檢查 ebook 先備條件。 check_ebook_prerequisites
		var cecc = this.convert_text_language_using
				&& this.convert_text_language_using.cecc;
		// console.trace(cecc);
		if (cecc && cecc.load_text_to_check) {
			var promise_load_text_to_check = cecc.load_text_to_check({
				work_title : work_data.title,
				convert_to_language : this.convert_to_language
			}, {
				reset : true
			});
			if (library_namespace.is_thenable(promise_load_text_to_check)) {
				// console.trace(promise_load_text_to_check);
				// 先初始化完畢後再重新執行。
				return promise_load_text_to_check.then(create_ebook.bind(this,
						work_data));
			}
		}

		work_data.convert_options = {
			work_title : work_data.title,
			// only for debug CeCC 繁簡轉換。
			cache_directory : library_namespace
					.append_path_separator(work_data.directory + '繁簡轉換 cache'),
			cache_file_for_short_sentences : true,

			// default (undefined) or 'word': 每個解析出的詞單獨作 zh_conversion。
			// 'combine': 結合未符合分詞辭典規則之詞一併轉換。converter 必須有提供輸入陣列的功能。
			// false: 按照原始輸入，不作 zh_conversion。
			forced_convert_mode : 'combine',

			// 檢查辭典檔的規則。debug 用，會拖累效能。
			// check_dictionary : true,

			// 不檢查/跳過通同字/同義詞，通用詞彙不算錯誤。用於無法校訂原始文件的情況。
			// skip_check_for_synonyms : true,

			// 超過此長度才創建個別的 cache 檔案，否則會放在 .cache_file_for_short_sentences。
			min_cache_length : 20
		};

		if (this.convert_to_language
				&& (!options || !options.no_extract_convert_cache_directory)) {
			extract_convert_cache_directory(work_data);
			// work_data.convert_cache_directory_extracted = Date.now();
			if (false) {
				var promise_extract_convert_cache_directory = extract_convert_cache_directory(work_data);
				if (promise_extract_convert_cache_directory) {
					// 先初始化完畢後再重新執行。
					return promise_extract_convert_cache_directory
							.then(create_ebook.bind(this, work_data, {
								// 跳過不需要的前置作業。
								no_extract_convert_cache_directory : true
							}));
				}
			}
		}

		// return needing to wait language converted
		var text_list = [ work_data.title, TAG_text_converted,
		// 執行到這邊可能還沒取得這兩個數值。
		work_data.author, work_data.site_name ];
		// console.trace('Convert: ' + text_list);
		// 先測試是否使用 asynchronous 的 LTP server。
		var promise_language_convert = this.cache_converted_text(text_list,
		// 盡可能只使用 cache，不去動到 LTP server。
		Object.assign({
			skip_server_test : true
		}, work_data.convert_options));
		if (promise_language_convert) {
			// 先初始化完畢後再重新執行。
			// 注意: 這會造成 create_ebook() 這邊之前的程式碼執行兩遍!
			return promise_language_convert.then(create_ebook.bind(this,
			// 跳過不需要的前置作業。本次執行不再重複解開 cache 檔，但仍需要
			// cecc.load_text_to_check() 以載入作品的特設檢核。
			work_data, Object.assign({
				no_extract_convert_cache_directory : true
			}, options)));
		}

		// ebook 先備條件檢查完畢。
		// ------------------------------------------------

		if (!this.site_id) {
			this.site_id = this.id;
		}

		crawler_namespace.set_last_update_Date(work_data, true);

		var ebook_directory = work_data.directory + work_data.directory_name
		// + ' ebook'
		, ebook_files = library_namespace.read_directory(ebook_directory),
		//
		ebook_file_path = ebook_path.call(this, work_data, null, {
		// allow_non_cache : true
		});
		// ebook_file_path = ebook_file_path[0] + ebook_file_path[1];

		if ((!Array.isArray(ebook_files) || !ebook_files.includes('mimetype'))
				&& !this.discard_old_ebook_file
				&& library_namespace.file_exists(ebook_file_path[0]
						+ ebook_file_path[1])) {
			// 若是沒有cache，但是有舊的epub檔，那麼就將之解壓縮。
			// 其用意是為了保留媒體檔案與好的舊章節，預防已經無法下載/獲取。
			// 由於這個動作，當舊的電子書存在時將不會清場。若有必要清場（如太多冗贅），須設定.discard_old_ebook_file或自行將舊電子書刪除。
			var ebook_archive = new library_namespace.storage.archive(
					ebook_file_path[0] + ebook_file_path[1]);
			library_namespace.log_temporary({
				// ebook_archive.archive_file_path
				// gettext_config:{"id":"extract-ebook-as-cache-$1"}
				T : [ 'Extract ebook as cache: [%1]', ebook_file_path[1] ]
			});
			ebook_archive.extract({
				output : ebook_directory
			});
		}

		// library_namespace.log('using CeL.application.storage.EPUB');
		var ebook = new library_namespace.EPUB(ebook_directory, {
			rebuild : Object.hasOwn(this, 'rebuild_ebook')
			// rebuild: 重新創建, 不使用舊的.opf資料. start over, re-create
			? work_data.rebuild_ebook : work_data.reget_chapter
					|| work_data.regenerate,
			id_type : this.site_id,
			// 以下為 epub <metadata> 必備之元素。
			// 小説ID
			identifier : work_data.id,
			title : this.convert_text_language(work_data.title, {
				// Will used in ebook_path()
				persistence : true
			}),
			language : this.convert_to_language ? 'zh-'
					+ library_namespace.gettext
							.to_standard(this.convert_to_language)
					: work_data.language || this.language,
			// 作品內容最後編輯時間。
			modified : work_data.last_update_Date
		}), subject = [];
		// keywords,キーワード 太多雜訊，如:
		// '万古剑神,,万古剑神全文阅读,万古剑神免费阅读,万古剑神txt下载,万古剑神txt全集下载,万古剑神蒙白'
		// category: PTCMS
		// ジャンル,キーワード: yomou.js (此兩者為未分割的字串。)
		'status,genre,tags,category,categories,类型,カテゴリ'.split(',')
		// 標籤 類別 類型 类型 types
		.forEach(function(type) {
			if (work_data[type])
				subject = subject.concat(work_data[type]);
		});
		if (this.convert_to_language) {
			subject.push(this.convert_text_language(TAG_text_converted),
			//
			gettext.get_alias(this.convert_to_language));
		}
		subject = subject.unique();

		var setup_ebook_options = {
			ebook : ebook,
			subject : subject,
			description : crawler_namespace.get_label(work_data.description
			// .description 中不可存在 tag。
			.replace(/\n*<br[^<>]*>\n*/ig, '\n'))
		};

		text_list = [ work_data.author, setup_ebook_options.description,
				work_data.site_name ];
		text_list.append(subject);
		// 將 ebook 相關作業納入 {Promise}，可保證先添加完章節資料、下載完資源再 pack_ebook()。
		promise_language_convert = this.cache_converted_text(text_list,
				work_data.convert_options)
				|| Promise.resolve();
		return ebook.working_promise = promise_language_convert
				.then(setup_ebook.bind(this, work_data, setup_ebook_options));
	}

	// @inner only called by create_ebook()
	function setup_ebook(work_data, options) {
		var ebook = options.ebook, subject = options.subject
				.map(this.convert_text_language.bind(this));
		ebook.time_zone = work_data.time_zone || this.time_zone;

		// http://www.idpf.org/epub/31/spec/epub-packages.html#sec-opf-dcmes-optional
		ebook.set({
			// 作者名
			creator : this.convert_text_language(work_data.author),
			// 🏷標籤, ジャンル genre, タグ, キーワード
			subject : subject,
			// 作品描述: 劇情簡介, synopsis, あらすじ
			description : this.convert_text_language(options.description),
			publisher : this.convert_text_language(work_data.site_name) + ' ('
					+ this.base_URL + ')',
			// source URL
			source : work_data.url
		});

		if (this.vertical_writing || this.RTL_writing) {
			if (this.RTL_writing === undefined) {
				this.RTL_writing = typeof this.vertical_writing === 'string' ? /rl$/
						.test(this.vertical_writing)
						: !!this.vertical_writing;
			}
			ebook.set_writing_mode(this.vertical_writing, this.RTL_writing);
		}

		if (work_data.image) {
			// cover image of work
			ebook.set_cover(this.full_URL(work_data.image));
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

		// 可用來移除廣告。
		if (this.pre_add_ebook_chapter) {
			// 去除掉中間插入的廣告連結。
			// 修正這個網站的語法錯誤。
			// 去除掉結尾的廣告。
			this.pre_add_ebook_chapter(data/* , work_data, chapter_NO */);
		}

		if (typeof data === 'string') {
			data = {
				text : data
			};
		}

		if (!data.sub_title) {
			if ('title' in data) {
				// throw '請將 parse_chapter_data() 中章節名稱設定在 sub_title 而非 title!';
				// 當僅設定title時，將之當做章節名稱而非part名稱。
				data.sub_title = data.title;
				delete data.title;
			} else if (Array.isArray(work_data.chapter_list)
					&& work_data.chapter_list[chapter_NO - 1].title) {
				data.sub_title = work_data.chapter_list[chapter_NO - 1].title;
			}
		}

		if (Array.isArray(data.title)) {
			data.title = data.title
					.join(library_namespace.EPUB.prototype.title_separator);
		}
		// assert: !data.title || typeof data.title === 'string'

		var chapter_data = Array.isArray(work_data.chapter_list)
				&& work_data.chapter_list[chapter_NO - 1],
		// 卷篇集幕部冊册本輯/volume/part/book
		part_title = crawler_namespace.get_label(data.title || chapter_data
				&& chapter_data.part_title || ''),
		// 章節名稱 / 篇章名稱 / 章節节回折篇話话頁页/chapter/section
		chapter_title = crawler_namespace.get_label(data.sub_title
				|| chapter_data
				&& (chapter_data.chapter_title || chapter_data.title) || '');

		var options = {
			chapter_data : chapter_data,
			part_title : part_title,
			chapter_title : chapter_title
		};

		// console.trace(work_data.convert_options);

		data.text = library_namespace.HTML_to_Unicode(
		// 處理 HTML tags 以減少其對 this.convert_text_language() 的影響。
		// TODO: <p> @ qidian.js
		library_namespace.EPUB.normailize_contents(data.text
		// remove all new-lines
		.replace(/[\r\n]+/g, '')
		// "<br />", "<br/>" → "\n"
		.replace(/\s*<br(?:[^\w<>][^<>]*)?>[\r\n]*/ig, '\n')
		// .trim()
		), true);
		// console.log(data.text);

		// return needing to wait language converted
		var text_list = [ part_title, chapter_title, data.text ];
		// console.trace(work_data.convert_options);
		var promise_language_convert = this.cache_converted_text(text_list,
				work_data.convert_options);
		if (promise_language_convert) {
			return ebook.working_promise = ebook.working_promise
			//
			.then(function() {
				return promise_language_convert.then(
				// TODO: 這邊失敗，例如 timeout 的話，會直接跳到最後一章並且出現錯誤。
				add_ebook_chapter_actual_work.bind(this, work_data, chapter_NO,
						data, options));
			}.bind(this));
		} else {
			// 將 ebook 相關作業納入 {Promise}，可保證先添加完章節資料、下載完資源再 pack_ebook()。
			return ebook.working_promise = ebook.working_promise
					.then(add_ebook_chapter_actual_work.bind(this, work_data,
							chapter_NO, data, options));
		}
	}

	// @inner only called by add_ebook_chapter(work_data, chapter_NO, data)
	function add_ebook_chapter_actual_work(work_data, chapter_NO, data, options) {
		var chapter_data = options.chapter_data, part_title = options.part_title, chapter_title = options.chapter_title;

		// @see epub_hans_to_hant.js
		if (this.convert_to_language) {
			part_title = this.convert_text_language(part_title);
			chapter_title = this.convert_text_language(chapter_title);
			library_namespace.log_temporary({
				T : [ this.convert_to_language === 'TW'
				// gettext_config:{"id":"convert-simplified-chinese-to-traditional-chinese-«$1»"}
				? '將簡體中文轉換成繁體中文：《%1》'
				// gettext_config:{"id":"convert-traditional-chinese-to-simplified-chinese-«$1»"}
				: '将繁体中文转换成简体中文：《%1》', chapter_title ]
			});
			process.title = gettext(this.convert_to_language === 'TW'
			// gettext_config:{"id":"traditionalize-$1"}
			? '繁化: %1'
			// gettext_config:{"id":"simplify-$1"}
			: '简化: %1', chapter_title) + ' @ ' + this.id;
			data.original_text = data.text;
			data.text = this.convert_text_language(data.text)
			// TODO: 把半形標點符號轉換為全形標點符號
			.replace(/["'](?:zh-(?:cmn-)?|cmn-)?(?:Hans-)?CN["']/ig,
			// "zh-TW"
			'"zh-cmn-Hant-TW"');
			this.clear_converted_text_cache({
				text : data.original_text
			});
			// free
			delete data.original_text;
		}

		data.text = data.text
		// recover HTML tags
		.replace(/\n/g, '<br />');

		// 一開始就該定一個不太需要改變的位數。
		// 不少小說超過1000個章節。
		var file_title = chapter_NO.pad(work_data.chapter_NO_pad_digits || 4)
				+ ' '
				+ (part_title ? part_title
						+ library_namespace.EPUB.prototype.title_separator : '')
				+ chapter_title;

		var item_data = {
			title : file_title,
			// include images / 自動載入內含資源, 將外部media內部化
			internalize_media : true,
			file : library_namespace.to_file_name(file_title + '.xhtml'),
			// 一般說來必須設定 work_data.chapter_list。
			date : data.date || chapter_data && chapter_data.date,
			// 設定 item_data.url 可以在閱讀電子書時，直接點選標題就跳到網路上的來源。
			url : data.url
					|| this.full_URL(this.chapter_URL(work_data, chapter_NO)),
			// pass Referer, User-Agent
			get_URL_options : Object.assign({
				error_retry : this.MAX_ERROR_RETRY
			}, this.get_URL_options),
			words_so_far : work_data.words_so_far
		};

		var _this = this;
		var language = work_data.language
		// e.g., 'cmn-Hans-CN'
		&& work_data.language.match(/^(ja|(?:zh-)?cmn)(?:$|[^a-z])/)
		// e.g., xshuyaya.js
		|| this.language && [ , this.language ];
		if (language) {
			language = language[1].replace(/^zh-cmn/, 'cmn');
		}

		var item = {
			title : part_title,
			sub_title : chapter_title,
			// contents
			text : data.text,
			post_processor : function(contents) {
				// console.log([ language, contents ]);
				// 正規化小說章節文字。
				if (language === 'ja') {
					contents = contents.replace(PATTERN_PARAGRAPH_START_JP,
					// 日本語では行頭から一文字の字下げをする。
					'$1　$2');
				} else if (language) {
					// assert: language: "cmn" (中文)
					// TODO: 下載完畢後作繁簡轉換。
					// TODO: 處理內縮。
					// TODO: 處理文章開頭的內縮。
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
					crawler_namespace.set_work_status(work_data, '§'
					//
					+ chapter_NO + ': '
					// gettext_config:{"id":"too-few-words-($1-characters)"}
					+ (contents.length ? gettext('字數過少（%1字元）',
					// gettext_config:{"id":"no-content"}
					contents.length) : 'No content'));
				}
				return contents;
			}
		};
		// library_namespace.log('file_title: ' + file_title);

		var ebook = work_data && work_data[this.KEY_EBOOK];
		item = ebook.add(item_data, item);

		// 登記本作品到本章節總計的字數。
		function count_words_so_far(item) {
			if (item && !item.error && item_data.word_count > 0) {
				work_data.words_so_far = (work_data.words_so_far || 0)
						+ item_data.word_count;
			}
			// console.trace(work_data.words_so_far);
		}
		if (library_namespace.is_thenable(item)) {
			item = item.then(count_words_so_far);
		} else {
			count_words_so_far(item);
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
				// titles :
				// matched[2].trim().split(library_namespace.EPUB.prototype.title_separator),
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
				library_namespace.warn({
					// gettext_config:{"id":"there-is-no-directory-for-archive-files-$1"}
					T : [ '不存在封存檔案用的目錄：%1', _this.ebook_archive_directory ]
				});
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
			library_namespace.info(library_namespace.display_align([
			// Set milestone: 日本小說網站有時會商業化，將之前的作品內容大幅刪除。這時若刪掉舊檔，就會失去這些內容。
			// gettext_config:{"id":"preserve"}
			[ gettext('保留舊檔：'), last_file ],
			// gettext_config:{"id":"move-to-→"}
			[ gettext('搬移至 →'), rename_to ] ]));
			library_namespace.move_file(last_file, rename_to);
		});

		// ✘ 移除.ebook_archive_directory中，較小的ebooks舊檔案。
		// 僅留存最新的一個ebooks舊檔案。
		for_each_old_ebook(this.ebook_archive_directory, function(last_file,
				this_file) {
			library_namespace.info([ {
				// gettext_config:{"id":"removed-old-files"}
				T : '移除舊檔案：'
			},
			// 新檔比較大。刪舊檔。
			_this.ebook_archive_directory + last_file.name + ' ('
			// https://en.wikipedia.org/wiki/Religious_and_political_symbols_in_Unicode
			+ this_file.size + ' = ' + last_file.size + '+'
			// ✞ Memorial cross, Celtic cross
			+ (this_file.size - last_file.size) + ')' ]);
			library_namespace.remove_file(
			//
			_this.ebook_archive_directory + last_file.name);
		});
	}

	// ebook_path.call(this, work_data, file_name)
	function ebook_path(work_data, file_name, options) {
		if (!file_name) {
			if (!work_data.author || !work_data.site_name) {
				library_namespace
						.error('ebook_path: 尚未設定作者或下載站點，可能導致先前 cache 無用。');
			}
			// e.g., "(一般小説) [author] title [site 20170101 1話].id.epub"
			file_name = [
					'(一般小説) [',
					this.convert_text_language(work_data.author
					// , options
					),
					'] ',
					this.convert_text_language(work_data.title),
					' [',
					this.convert_text_language(work_data.site_name
					// , options
					),
					' ',
					work_data.last_update_Date.format('%Y%2m%2d'),
					work_data.chapter_count >= 1
					//
					? ' ' + work_data.chapter_count
					//
					+ (work_data.chapter_unit || this.chapter_unit) : '',
					']',
					this.RTL_writing ? ' ('
							+ (/^ja/.test(work_data.language) ? '縦書き' : '縱書')
							+ ')' : '',
					this.convert_to_language ? ' ('
							+ library_namespace.gettext.to_standard(
							//
							this.convert_to_language) + ')' : '', '.',
					typeof work_data.directory_id === 'function'
					// 自行指定作品放置目錄與 ebook 用的 work id。
					&& work_data.directory_id() || work_data.id, '.epub' ];

			file_name = file_name.join('');
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

		ebook.working_promise = ebook.working_promise.then(pack_up_ebook.bind(
				this, work_data, file_name));

		if (this.convert_to_language) {
			ebook.working_promise = ebook.working_promise
					.then(archive_convert_cache_directory.bind(this, work_data));
		}

		ebook.working_promise = ebook.working_promise.then(
		//
		library_namespace.null_function, function(error) {
			library_namespace.error(error);
			// re-throw
			throw error;
		});

		return ebook.working_promise;
	}

	function pack_up_ebook(work_data, file_name) {
		var file_path = ebook_path.call(this, work_data, file_name);

		this.clear_converted_text_cache(true);
		var cecc = this.convert_text_language_using
				&& this.convert_text_language_using.cecc;
		// console.trace(cecc);
		if (cecc && cecc.report_text_to_check) {
			cecc.report_text_to_check({
				convert_to_language : this.convert_to_language
			});
		}

		// gettext_config:{"id":"archive-epub-ebook-$1"}
		process.title = gettext('打包 epub 電子書：%1', work_data.title) + ' @ '
				+ this.id;
		// https://github.com/ObjSal/p7zip/blob/master/GUI/Lang/ja.txt
		library_namespace.debug({
			// gettext_config:{"id":"archive-epub-ebook-$1"}
			T : [ '打包 epub 電子書：%1', file_path[1] ]
		}, 1, 'pack_ebook');

		var ebook = work_data && work_data[this.KEY_EBOOK];

		// this: this_work_crawler
		ebook.pack(file_path, this.remove_ebook_directory, remove_old_ebooks
				.bind(this, work_data.id));
		// 等待打包...
	}

	// --------------------------------------------------------------------------------------------

	// export 導出.

	// @inner
	Object.assign(crawler_namespace, {
		set_last_update_Date : set_last_update_Date,
		create_ebook : create_ebook
	});

	// @instance
	Object.assign(Work_crawler.prototype, {
		// for CeL.application.storage.EPUB
		// auto_create_ebook, automatic create ebook
		// MUST includes CeL.application.locale!
		// need_create_ebook : true,
		KEY_EBOOK : 'ebook',
		milestone_extension : true,
		add_ebook_chapter : add_ebook_chapter,
		pack_ebook : pack_ebook,
		/** 在包裝完電子書之後，把電子書目錄整個刪掉。 請注意：必須先安裝 7-Zip **18.01 以上的版本**。 */
		remove_ebook_directory : true,
		/** 章節數量無變化時，依舊利用 cache 重建資料(如ebook)。 */
		// regenerate : true,
		/** 進一步處理書籍之章節內容。例如繁簡轉換、錯別字修正、裁剪廣告。 */
		contents_post_processor : function(contents, work_data) {
			return contents;
		} && null,
		// 話: 日文
		// 「卷」為漫畫單行本，「話」為雜誌上的連載，「卷」包含了以往雜誌上所有發行的「話」
		chapter_unit : '話',
		parse_ebook_name : parse_ebook_name,

		// 在獲取小說章節內容的時候，若發現有章節被目錄漏掉，則將之補上。
		check_next_chapter : check_next_chapter
	});

	// 不設定(hook)本 module 之 namespace，僅執行 module code。
	return library_namespace.env.not_to_extend_keyword;
}
