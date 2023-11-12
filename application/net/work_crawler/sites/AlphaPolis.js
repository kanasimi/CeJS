/**
 * @name CeL module for downloading AlphaPolis user novels / comics.
 * 
 * @fileoverview 本檔案包含了解析並處理、批量下載 アルファポリス - 電網浮遊都市 - 小説 / 漫画 的工具。
 * 
 * <code>

 CeL.AlphaPolis({
 // configuration
 site : '' || CeL.get_script_name()
 }).start(work_id);

 </code>
 * 
 * @since 2020/7/18 5:31:55 模組化。
 */

// More examples:
// @see
// https://github.com/kanasimi/work_crawler/blob/master/novel.ja-JP/AlphaPolis.js
// https://github.com/kanasimi/work_crawler/blob/master/comic.ja-JP/AlphaPolis_user_manga.js
// https://github.com/kanasimi/work_crawler/blob/master/comic.ja-JP/AlphaPolis_official_manga.js
'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.work_crawler.sites.AlphaPolis',

	require : 'application.net.work_crawler.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring

	// --------------------------------------------------------------------------------------------

	var default_configuration = {

		// 當網站不允許太過頻繁的訪問/access時，可以設定下載之前的等待時間(ms)。
		// 模仿實際人工請求。
		// chapter_time_interval : '5s',

		base_URL : 'https://www.alphapolis.co.jp/',

		// @deprecated: novel
		// till 20170619, use POST. 20170620 AlphaPolis 改版, use UTF-8.
		search_URL_2016_to_20170619 : function(work_title) {
			return [ 'top/search/', {
				// 2: 小説
				'data[tab]' : 2,
				'data[refer]' : work_title
			} ];
		},

		// 解析 作品名稱 → 作品id get_work()
		search_URL : function(work_title) {
			return 'search?category='
					+ this.work_type.split('/').reverse().join('_') + '&query='
					+ encodeURIComponent(work_title.replace(/\s+\d+$/, ''));
		},
		// for AlphaPolis_user_manga.js , AlphaPolis_official_manga.js
		parse_search_result : function(html, get_label) {
			// console.log(html);
			var _this = this, id_data = [],
			// {Array}id_list = [id,id,...]
			id_list = [];
			html.each_between(' class="title">', '</a>', function(text) {
				// console.log(text);
				var id = text.between(' href="/' + _this.work_type + '/', '"');
				if (id) {
					id_list.push(id.replace(/\//, '-'));
					id_data.push(get_label(text.between('>')));
				}
			});
			// console.log([ id_list, id_data ]);
			return [ id_list, id_data ];
		},

		// 取得作品的章節資料。 get_work_data()
		work_URL : function(work_id) {
			return this.work_type + '/' + work_id.replace('-', '/');
		},
		// for AlphaPolis.js , AlphaPolis_user_manga.js
		parse_work_data : function(html, get_label, extract_work_data) {
			// console.trace(html);
			var work_data = {
				// 必要屬性：須配合網站平台更改。
				// 2019/8/16 19:0 改版。
				title : get_label(html.between('<h1 class="title">', '</h1>')
						|| html.between('<h2 class="title">', '</h1>')),

				// 選擇性屬性：須配合網站平台更改。
				// e.g., 连载中, 連載中
				status : [],
				// get the first <div class="author">...</div>
				author : get_label(html.between('<div class="author">', '</a>')),
				last_update : get_label(html.between('<th>更新日時</th>', '</td>')),
				description : get_label(
						html.between('<div class="abstract">', '</div>'))
						.replace(/\n{2}/g, '\n'),
				ranking : get_label(html.between('<div class="ranking">',
				// also category
				'</div>')).replace(/\t/g, '').replace(/\n{3}/g, '\0').replace(
						/\n/g, ' ').split('\0'),
				// site_name : 'アルファポリス'
				language : html.between('data-lang="', '"') || 'ja-JP'

			}, PATTERN, matched;

			if (work_data.title === 'Not Found' && !work_data.author) {
				// 對於已經失效的作品，直接中斷下載。
				throw work_data.title;
			}

			if (work_data.site_name) {
				// "アルファポリス - 電網浮遊都市 - " → "アルファポリス"
				work_data.site_name = work_data.site_name.replace(/ +- .+/, '');
			}

			// 2019/1 才發現改 pattern 了。
			PATTERN = /<span class="tag">([\s\S]+?)<\/span>/g;
			while (matched = PATTERN.exec(html.between(
					'<div class="content-tags">', '</div>'))) {
				work_data.status.push(get_label(matched[1]));
			}

			html.between('<div class="content-statuses">', '</div>')
			// additional tags
			.each_between(' class="content-status', '<',
			//
			function(text) {
				work_data.status.push(get_label(text.between('>')));
			});
			work_data.status = work_data.status.unique();

			// <h2>作品の情報</h2>
			extract_work_data(work_data, html,
					/<th>([\s\S]+?)<\/th>[\s\n]*<td[^<>]*>([\s\S]+?)<\/td>/g);

			extract_work_data(work_data, html);

			if (work_data.image
			// ignore site default image
			&& work_data.image.endsWith('\/ogp.png')) {
				delete work_data.image;
			}

			/**
			 * <code>

			<div class="http-error section">
			<h1 class="h1">ページが見つかりません</h1>

			<p class="error">
			ご指定のページは削除されたか、URLが変更になった可能性があります。<br/>
			ご迷惑をおかけして申し訳ありませんが、<a href="https://www.alphapolis.co.jp">トップページ</a>からアクセスしなおしてください。<br/>
			</p>
			</div>

			</code>
			 */
			matched = html
					.between('<div class="http-error section">', '</div>');
			if (matched) {
				matched = get_label(matched.between('<h1 class="h1">', '</h1>')
						|| matched);
				delete work_data.title;
				work_data.removed = matched;
			}

			// console.log(work_data);
			return work_data;
		},
		// for AlphaPolis.js , AlphaPolis_user_manga.js
		get_chapter_list : function(work_data, html, get_label) {
			work_data.chapter_list = [];
			var _this = this;
			html = html.between('<div class="nav">', '<div class="freespace">');
			html = html.between('<div class="episodes">') || html;

			var matched, last_index, chapter_text_list = [], last_data;
			var PATTERN_chapter = /<div class="chapter-rental[\s\S]*?<h3>([\s\S]+?)<\/h3>|<div class="rental-episode([\s\S]*?<h3>[\s\S]+?)<\/h3>|(<div class="episode)|<h3>([\s\S]+?)<\/h3>/g;
			while (matched = PATTERN_chapter.exec(html)) {
				if (last_index > 0) {
					if (false) {
						console.log([ last_index, matched.index,
								PATTERN_chapter.lastIndex,
								html.slice(last_index, matched.index) ]);
					}
					last_data.push(html.slice(last_index, matched.index));
					chapter_text_list.push(last_data);
				}
				last_index = PATTERN_chapter.lastIndex;
				for (var index = 1;; index++) {
					if (matched[index]) {
						last_data = [ index, matched[index] ];
						break;
					}
				}
			}
			if (!last_data && work_data.removed) {
				return;
			}
			last_data.push(html.slice(last_index));
			chapter_text_list.push(last_data);
			// console.trace(chapter_text_list.slice(0));

			chapter_text_list.forEach(function(data, index) {
				if (data[0] === 4) {
					_this.set_part(work_data, get_label(data[1]));
					return;
				}

				if (data[0] === 1) {
					_this.set_part(work_data, get_label(data[1]));
					return;
				}

				if (data[0] === 2) {
					var chapter_data = {
						url : data[1].between(' href="', '"'),
						title : get_label(data[1].between('<h3>')),
						limited : data[1].between('<div class="rental-price">',
								'</div>')
								|| data[1].between('<div class="rental-info">',
										'</div>')
					};
					chapter_data.limited = chapter_data.limited.between(
							'alt="', '"')
							|| chapter_data.limited;
					if (!chapter_data.limited)
						_this.add_chapter(work_data, chapter_data);
					return;
				}

				var text = data[2];
				// console.log(text);
				// assert: data[0] === 3
				var chapter_data = {
					url : text.between(' href="', '"'),
					date : text.between('<span class="open-date">', '</span>')
					//
					.to_Date({
						zone : work_data.time_zone
					}),
					title : get_label(text.between(' class="title">',
					/**
					 * <code>
					<span class="title"><span class="bookmark-dummy"></span>人物設定②神様関連</span>
					</code>
					 */
					'<span class="open-date">'))
				};
				if (!chapter_data.url.includes('://')) {
					chapter_data.url = '/' + _this.work_type + '/'
							+ chapter_data.url;
				}
				_this.add_chapter(work_data, chapter_data);
			});

			// console.log(work_data.chapter_list);
		},

		// for AlphaPolis_user_manga.js , AlphaPolis_official_manga.js
		parse_chapter_data : function(html, work_data, get_label, chapter_NO) {
			// console.log(html);
			var chapter_data = work_data.chapter_list[chapter_NO - 1];
			Object.assign(chapter_data, {
				// 設定必要的屬性。
				title : get_label(html.between('<h2 class="episode-title">',
						'</h2>')
						|| html.between('<h2>', '</h2>')),
				image_list : []
			});

			html.each_between('_pages.push("', '"', function(url) {
				if (url.includes('://'))
					chapter_data.image_list.push(url);
			});

			return chapter_data;
		}
	};

	// --------------------------------------------------------------------------------------------

	function new_AlphaPolis_crawler(configuration, callback, initializer) {
		// library_namespace.set_debug(9);
		configuration = configuration ? Object.assign(Object.create(null),
				default_configuration, configuration) : default_configuration;

		if (configuration.need_create_ebook) {
			library_namespace.run([ 'application.storage.EPUB'
			// CeL.detect_HTML_language()
			, 'application.locale' ]);
		}

		// 每次呼叫皆創建一個新的實體。
		var crawler = new library_namespace.work_crawler(configuration);

		// for 年齢確認 eternityConfirm()
		crawler.setup_value('cookie', [ 'confirm='
				+ Math.floor(Date.now() / 1000)
				// location.hostname
				+ ';domain=' + crawler.base_URL.match(/\/\/([^\/]+)/)[1]
				+ ';path=/;' ]);

		return crawler;
	}

	return new_AlphaPolis_crawler;
}
