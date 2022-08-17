/**
 * @name CeL module for downloading manhuadb comics.
 * 
 * @fileoverview 本檔案包含了解析並處理、批量下載中國大陸漫畫網站 漫画DB 平臺 的工具。
 * 
 * modify from 9mdm.js→dagu.js
 * 
 * 由於 漫画DB 系列網站下載機制較複雜，下載圖片功能為獨立撰寫出來，不支援 achive_images 功能。
 * 
 * <code>

 CeL.manhuadb(configuration).start(work_id);

 </code>
 * 
 * @since 2021/4/9 19:42:20 模組化。
 */

// More examples:
// @see
// https://github.com/kanasimi/work_crawler/blob/master/comic.cmn-Hans-CN/manhuadb.js
// https://github.com/kanasimi/work_crawler/blob/master/comic.cmn-Hans-CN/manhuacat.js
'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.work_crawler.sites.manhuadb',

	require : 'application.net.work_crawler.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring

	// --------------------------------------------------------------------------------------------

	// manhuadb.js:
	// <a class="fixed-a-es" target="_blank" href="/manhua/000/....html"
	// title="第01回">第01回</a>
	//
	// <div class="align-self-center pr-2"><h3 class="h4 mb-0 font-weight-normal
	// comic_version_title">[辉夜姬想让人告白~天才们的恋爱头脑战~ 连载]</h3></div>

	// manhuacat.js:
	// <a class="fixed-a-es"
	// href="https://www.manhuacat.com/manga/475/523727.html"
	// title="第03话">第03话</a>
	//
	// <h2 class="h2 mb-0 font-weight-normal comic_version_title">单话</h2>

	// [ all, chapter url, title, part title tag name, part title ]
	var PATTERN_chapter = /<li[\s\S]+?<a [^<>]*?href="([^<>"]+)"[^<>]*? title="([^<>"]+)"|<(h[23])[^<>]*>(.+?)<\/\3>/g;

	var default_configuration = {

		// 本站常常無法取得圖片，因此得多重新檢查。
		// recheck:從頭檢測所有作品之所有章節與所有圖片。不會重新擷取圖片。對漫畫應該僅在偶爾需要從頭檢查時開啟此選項。
		// recheck : true,
		// 當有多個分部的時候才重新檢查。
		recheck : 'multi_parts_changed',
		// 當無法取得chapter資料時，直接嘗試下一章節。在手動+監視下recheck時可併用此項。
		// skip_chapter_data_error : true,

		// allow .jpg without EOI mark.
		// allow_EOI_error : true,
		// 當圖像檔案過小，或是被偵測出非圖像(如不具有EOI)時，依舊強制儲存檔案。
		// e.g., 736 黄昏流星群/单行本 0005
		// [黄昏流星群][弘兼宪史][尖端][volink]Vol_005/736-5-005.jpg
		skip_error : true,

		// 單行本圖片較多且大，因此採用一個圖一個圖取得的方式。
		one_by_one : true,
		// 下載圖片的逾時ms數。若逾時時間太小（如10秒），下載大檔案容易失敗。
		timeout : 90 * 1000,

		// reget_image_page : true,

		// 解析 作品名稱 → 作品id get_work()
		search_URL : 'search?q=',
		PATTERN_search : /<a href="\/manhua\/(\d+)" title="([^<>"]+)"/,
		parse_search_result : function(html, get_label) {
			// console.log(html);
			var PATTERN_search = this.PATTERN_search;
			var id_list = [], id_data = [];
			html.each_between('<div class="comicbook-index', '</div>',
					function(token) {
						// console.log(token);
						var matched = token.match(PATTERN_search);
						id_list.push(matched[1]);
						id_data.push(get_label(matched[2]));
					});
			return [ id_list, id_data ];
		},

		// 取得作品的章節資料。 get_work_data()
		work_URL : function(work_id) {
			return 'manhua/' + work_id;
		},
		parse_work_data : function(html, get_label, extract_work_data) {
			// console.log(html);
			var work_data = {
				// 必要屬性：須配合網站平台更改。

				// 選擇性屬性：須配合網站平台更改。
				// 漫画出版信息
				publish : get_label(html.between(
						'<div class="comic-pub-data-section', '</div>')
						.between('>')),
				// 概要 synopsis
				description : get_label(html.between(
				// manhuadb.js:
				'<div class="comic_detail_content">', '</div>')
				// manhuacat.js:
				|| html.between('<p class="comic_story">', '</p>')
				//
				.between('漫画简介：'))
			};

			extract_work_data(work_data, html);
			extract_work_data(work_data, html,
					/<th scope="row">([^<>]+)<\/th>([\s\S]*?)<\/td>/g);

			Object.assign(work_data, {
				title : work_data.book_name
			});

			// console.log(work_data);
			return work_data;
		},
		add_part : true,
		get_chapter_list : function(work_data, html, get_label) {
			// <div class="comic-toc-section bg-white p-3">
			// e.g., 一拳超人
			var part_title_list = html.between('<div class="comic-toc-section',
					'</ul>').all_between('<li', '</li>').map(function(token) {
				return get_label(token.between('>')).replace(/列表$/, '');
			});
			// console.log(part_title_list);

			// <div class="tab-content" id="comic-book-list">
			html = html.between(' id="comic-book-list">', '<script ').between(
					null, {
						tail : '</ol>'
					});

			var matched, part_NO = 0, part_title, PATTERN_title = new RegExp(
					work_data.title + '\\s*'), NO_in_part;

			work_data.chapter_list = [];
			while (matched = PATTERN_chapter.exec(html)) {
				// delete matched.input;
				// console.log(matched);
				if (matched[4]) {
					part_title = get_label(matched[3]).replace(PATTERN_title,
							'').replace(/\[\]/g, '');
					part_title = part_title_list[part_NO++];
					NO_in_part = 0;
					continue;
				}
				++NO_in_part;
				var chapter_data = {
					// 漫畫目錄名稱不須包含分部號碼。使章節目錄名稱不包含 part_NO。
					// part_NO : part_NO,
					part_title : part_title,
					NO_in_part : NO_in_part,
					chapter_NO : NO_in_part,
					url : matched[1],
					title : get_label(matched[2])
				};
				work_data.chapter_list.push(chapter_data);
				continue;

				// ----------------------------------
				// 以下: 若是存在舊格式的檔案就把它移成新格式。
				// @deprecated
				// console.log(chapter_data);

				// chapter_data.title = chapter_data.title.replace('文传', '文傳');
				var old_directory = work_data.directory
						+ work_data.chapter_list.length
						// 4: @see chapter_directory_name
						// @ CeL.application.net.work_crawler.chapter
						.pad(work_data.chapter_NO_pad_digits || 4)
						+ ' '
						+ (chapter_data.title.includes('[') ? chapter_data.title
								: '[' + chapter_data.title + ']'),
				//
				new_directory = work_data.directory + part_title + ' '
						+ NO_in_part.pad(work_data.chapter_NO_pad_digits || 4)
						+ ' ' + chapter_data.title;
				if (library_namespace.directory_exists(old_directory)) {
					library_namespace.move_fso(old_directory, new_directory);
				}

				var old_archive = old_directory + '.'
						+ this.images_archive_extension;
				if (library_namespace.file_exists(old_archive)) {
					library_namespace.log(old_archive + '\n→ ' + new_directory);
					var images_archive = new library_namespace.storage.archive(
							old_archive);
					images_archive.extract({
						cwd : images_archive
					});
					library_namespace.move_fso(old_directory, new_directory);
					library_namespace.remove_file(old_archive);
				}
			}

			work_data.inverted_order = this.inverted_order;
			// console.log(work_data.chapter_list);
			// console.log(work_data);
		},

		decode_chapter_data : function(chapter_data) {
			return JSON.parse(atob(chapter_data));
		},
		pre_parse_chapter_data
		// 執行在解析章節資料 process_chapter_data() 之前的作業 (async)。
		// 必須自行保證執行 callback()，不丟出異常、中斷。
		: function(XMLHttp, work_data, callback, chapter_NO) {
			// console.log(XMLHttp);
			// console.log(work_data);
			// console.log(work_data.chapter_list);
			var chapter_data = work_data.chapter_list[chapter_NO - 1],
			//
			html = XMLHttp.responseText, _this = this, image_page_list = [];
			// console.log(html);

			chapter_data.title = html.between('<h2 class="h4 text-center">',
					'</h2>')
					|| chapter_data.title;
			var matched = chapter_data.title.match(/^\[([^\[\]]+)\]$/);
			if (matched)
				chapter_data.title = matched[1];

			// --------------------------------------

			// 2019/9/17 漫画DB 網站改版
			matched = html.between(" img_data = '", "';")
					// manhuacat.js
					|| html.between(' img_data = "', '"')
					// 2019/9/17 5:0
					|| html.between('localStorage.setItem("data:"', ');')
							.between("'", {
								tail : "'"
							});
			if (matched) {
				// console.log(atob(matched));
				// console.log(chapter_data);

				// 2020/4 漫画DB 網站改版
				// @see https://www.manhuadb.com/assets/js/vg-read.js
				var image_prefix = this.image_prefix
						|| html.between(' data-host="', '"')
						+ html.between(' data-img_pre="', '"');
				// console.log(image_prefix);

				// img_data is base64 encoded, need to do base64 decode before
				// json
				// decode
				chapter_data.image_list = this.decode_chapter_data(matched)
				// assert: Array.isArray(chapter_data.image_list);
				.map(function(image_data) {
					return {
						url : encodeURI(image_prefix
						//
						+ (image_data.img || image_data))
					};
				});
				// console.log(chapter_data.image_list);
				callback();
				return;
			}

			// --------------------------------------

			html.between('id="page-selector"', '</select>').each_between(
			//
			'<option value="', '</option>', function(token) {
				image_page_list.push({
					title : token.between('>'),
					url : token.between(null, '"')
				});
			});
			var image_count = image_page_list.length;
			// console.log(image_page_list);

			if (!(image_count >= 0)) {
				throw work_data.title + ' #' + chapter_NO + ' '
						+ chapter_data.title + ': Cannot get image count!';
			}

			// 將過去的 chapter_data.image_list cache 於 work_data.image_list。
			if (work_data.image_list) {
				chapter_data.image_list = work_data.image_list[chapter_NO - 1];
				if (!this.reget_image_page && chapter_data.image_list
						&& chapter_data.image_list.length === image_count) {
					library_namespace.debug(work_data.title + ' #' + chapter_NO
							+ ' ' + chapter_data.title + ': Already got '
							+ image_count + ' images.');
					chapter_data.image_list = chapter_data.image_list
					// .slice() 重建以節省記憶體用量。
					.slice().map(function(image_data) {
						// 僅保留網址資訊，節省記憶體用量。
						return typeof image_data === 'string' ? image_data
						// else assert: library_namespace.is_Object(image_data)
						: image_data.url;
					});
					callback();
					return;
				}
			} else {
				work_data.image_list = [];
			}

			function extract_image(XMLHttp) {
				var html = XMLHttp.responseText,
				//
				url = html.between('<img class="img-fluid"', '>').between(
						' src="', '"');
				library_namespace.debug('Add image '
						+ chapter_data.image_list.length + '/' + image_count
						+ ': ' + url, 2, 'extract_image');
				if (!url && !_this.skip_error) {
					_this.onerror('No image url got: #'
							+ chapter_data.image_list.length + '/'
							+ image_count);
				}
				// 僅保留網址資訊，節省記憶體用量。
				chapter_data.image_list.push(url);
			}

			chapter_data.image_list = [];
			if (image_count > 0)
				extract_image(XMLHttp);

			library_namespace.run_serial(function(run_next, image_NO, index) {
				var image_page_url
				//
				= _this.full_URL(image_page_list[index - 1].url);
				// console.log('Get #' + index + ': ' + image_page_url);
				library_namespace.log_temporary('Get image data page of §'
						+ chapter_NO + ': ' + image_NO + '/' + image_count);
				library_namespace.get_URL(image_page_url, function(XMLHttp) {
					extract_image(XMLHttp);
					run_next();
				}, _this.charset, null, Object.assign({
					error_retry : _this.MAX_ERROR_RETRY
				}, _this.get_URL_options));
			}, image_count, 2, function() {
				work_data.image_list[chapter_NO - 1] = chapter_data.image_list
				// .slice() 重建以節省記憶體用量。
				.slice();
				callback();
			});
		},
		parse_chapter_data : function(html, work_data, get_label, chapter_NO) {
			var chapter_data = work_data.chapter_list[chapter_NO - 1];
			// console.log(chapter_data);

			// 已在 pre_parse_chapter_data() 設定完 {Array}chapter_data.image_list
			return chapter_data;
		}

	};

	// --------------------------------------------------------------------------------------------

	function new_manhuadb_comics_crawler(configuration, callback, initializer) {
		configuration = configuration ? Object.assign(Object.create(null),
				default_configuration, configuration) : default_configuration;

		// 每次呼叫皆創建一個新的實體。
		var crawler = new library_namespace.work_crawler(configuration);

		if (typeof initializer === 'function') {
			initializer(crawler);
		}

		if (!crawler.decoder_URL) {
			// e.g., comic.cmn-Hans-CN/manhuadb.js
			return crawler;
		}

		// e.g., comic.cmn-Hans-CN/manhuacat.js
		library_namespace.get_URL_cache(crawler.decoder_URL, function(contents,
				error) {
			var LZString;
			contents = contents.replace(/var\s+(LZString)/, '$1');
			eval(contents);
			crawler.LZString = LZString;
			callback(crawler);
		}, {
			directory : crawler.main_directory
		});

	}

	return new_manhuadb_comics_crawler;
}
