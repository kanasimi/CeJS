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
		no_extend : '*',

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
		var next_chapter = work_data.chapter_list[chapter_NO],
		// chapter_data.url
		next_chapter_url = next_chapter && next_chapter.url,
		// /下一[章页][：: →]*<a [^<>]*?href="([^"]+.html)"[^<>]*>/
		next_url = html && html.match(PATTERN_next_chapter ||
		// PTCMS default. e.g., "下一章 →" /下一章[：: →]*/
		// PATTERN_next_chapter: [ all, next chapter url ]
		// e.g., <a href="//read.qidian.com/chapter/abc123">下一章</a>
		/ href=["']([^<>"']+)["'][^<>]*>(?:<button[^<>]*>)?下一[章页]/);
		// console.log(chapter_NO + ': ' + next_url[1]);

		if (next_chapter && next_url

		// 去掉開頭的 "./"。
		&& (next_url = next_url[1].replace(/^(\.\/)+/,
		// TODO: {Array}this.chapter_URL()
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
						[ gettext('章節編號%1：', chapter_NO), next_chapter_url ],
						[ '→ ', next_url ] ]));
				next_chapter.url = next_url;
			}

			if (work_data.chapter_list.some(function(chapter_data) {
				return chapter_data.url === next_url;
			})) {
				// url 已經在 chapter_list 裡面。
				return;
			}

			var message = work_data.chapter_list[chapter_NO - 1];
			message = [ 'check_next_chapter: ', {
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

	function create_ebook(work_data) {
		if (!this.site_id) {
			this.site_id = this.id;
		}

		crawler_namespace.set_last_update_Date(work_data, true);

		var ebook_directory = work_data.directory + work_data.directory_name
		// + ' ebook'
		, ebook_files = library_namespace.read_directory(ebook_directory),
		//
		ebook_file_path = ebook_path.call(this, work_data);
		// ebook_file_path = ebook_file_path[0] + ebook_file_path[1];

		if ((!Array.isArray(ebook_files) || !ebook_files.includes('mimetype'))
				// 若是沒有cache，但是有舊的epub檔，那麼就將之解壓縮。
				// 其用意是為了保留媒體檔案與好的舊章節，預防已經無法下載/獲取。
				// 由於這個動作，當舊的電子書存在時將不會清場。若有必要清場（如太多冗贅），須自行將舊電子書刪除。
				&& library_namespace.file_exists(ebook_file_path[0]
						+ ebook_file_path[1])) {
			var ebook_archive = new library_namespace.storage.archive(
					ebook_file_path[0] + ebook_file_path[1]);
			process.stdout.write(gettext('Extract ebook as cache: [%1]',
			// ebook_archive.archive_file_path
			ebook_file_path[1]) + '...\r');
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

		ebook.time_zone = work_data.time_zone || this.time_zone;

		// http://www.idpf.org/epub/31/spec/epub-packages.html#sec-opf-dcmes-optional
		ebook.set({
			// 作者名
			creator : work_data.author,
			// 🏷標籤, ジャンル genre, タグ, キーワード
			subject : subject.unique(),
			// 作品描述: 劇情簡介, synopsis, あらすじ
			description : crawler_namespace.get_label(work_data.description
			// .description 中不可存在 tag。
			.replace(/\n*<br[^<>]*>\n*/ig, '\n')),
			publisher : work_data.site_name + ' (' + this.base_URL + ')',
			// source URL
			source : work_data.url
		});

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

		var language = work_data.language
		// e.g., 'cmn-Hans-CN'
		&& work_data.language.match(/^(ja|(?:zh-)?cmn)(?:$|[^a-z])/);
		if (language) {
			language = language[1].replace(/^zh-cmn/, 'cmn');
		}

		var _this = this,
		//
		chapter_data = Array.isArray(work_data.chapter_list)
				&& work_data.chapter_list[chapter_NO - 1],
		// 卷篇集幕部冊册本輯/volume/part/book
		part_title = data.title || chapter_data && chapter_data.part_title,
		// 章節名稱 / 篇章名稱 / 章節节回折篇話话頁页/chapter/section
		chapter_title = data.sub_title || chapter_data
				&& (chapter_data.chapter_title || chapter_data.title),
		//
		file_title = chapter_NO.pad(3)
				+ ' '
				+ (part_title ? part_title
						+ library_namespace.EPUB.prototype.title_separator : '')
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
			title : crawler_namespace.get_label(part_title || ''),
			sub_title : crawler_namespace.get_label(chapter_title || ''),
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
					crawler_namespace.set_work_status(work_data, '§'
							+ chapter_NO
							+ ': '
							+ (contents.length ? gettext('字數過少（%1字元）',
									contents.length) : '無內容'));
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
			[ '保留舊檔：', last_file ], [ 'move to →', rename_to ] ]));
			library_namespace.move_file(last_file, rename_to);
		});

		// ✘ 移除.ebook_archive_directory中，較小的ebooks舊檔案。
		// 僅留存最新的一個ebooks舊檔案。
		for_each_old_ebook(this.ebook_archive_directory, function(last_file,
				this_file) {
			library_namespace.info([ {
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

		process.title = gettext('打包 epub 電子書：%1', work_data.title + ' @ '
				+ this.id);
		var file_path = ebook_path.call(this, work_data, file_name);

		// https://github.com/ObjSal/p7zip/blob/master/GUI/Lang/ja.txt
		library_namespace.debug({
			T : [ '打包 epub 電子書：%1', file_path[1] ]
		}, 1, 'pack_ebook');

		// this: this_site
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
