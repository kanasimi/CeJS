/**
 * @name CeL module for downloading syosetu.com novels.
 * 
 * @fileoverview 本檔案包含了批量下載小説家になろう/小説を読もう！的工具。
 * 
 * TODO: なろう小説API https://dev.syosetu.com/man/api/
 * 
 * <code>

CeL.yomou().start(work_id);

</code>
 * 
 * @see 小説投稿サイト https://matome.naver.jp/odai/2139450042041120001
 *      http://www.akatsuki-novels.com/novels/ranking_total
 *      http://www.mai-net.net/bbs/sst/sst.php?act=list&cate=all&page=1
 *      https://github.com/whiteleaf7/narou https://github.com/59naga/naroujs
 *      https://github.com/59naga/scrape-narou
 * 
 * @since 2017/2/22 0:18:34 模組化。
 */

// More examples:
// @see https://github.com/kanasimi/work_crawler/blob/master/yomou.js
// @see https://github.com/kanasimi/work_crawler/blob/master/noc.js
'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.work_crawler.sites.yomou',

	require : 'application.net.work_crawler.'
	//
	+ '|application.storage.EPUB.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring

	// --------------------------------------------------------------------------------------------

	var default_configuration = {
		// auto_create_ebook, automatic create ebook
		// MUST includes CeL.application.locale!
		need_create_ebook : true,
		// recheck:從頭檢測所有作品之所有章節與所有圖片。不會重新擷取圖片。對漫畫應該僅在偶爾需要從頭檢查時開啟此選項。default:false
		// recheck='changed': 若是已變更，例如有新的章節，則重新下載/檢查所有章節內容。否則只會自上次下載過的章節接續下載。
		recheck : 'changed',

		site_name : '小説を読もう！',
		base_URL : 'https://yomou.syosetu.com/',
		novel_base_URL : 'https://ncode.syosetu.com/',

		// 解析 作品名稱 → 作品id get_work()
		search_URL : 'search.php?order=hyoka&word=',
		parse_search_result : function(html, get_label) {
			// console.log(html);
			var id_data = [],
			// {Array}id_list = [id,id,...]
			id_list = [],
			// 2019/6/24 目前僅有 ミッドナイトノベルズ 採用這個 header
			header = '<article class="search_novel">';
			if (!html.includes(header))
				header = '<div class="novel_h">';

			html.each_between(header, '</a>', function(text) {
				id_list.push(text
						.between(' href="' + this.novel_base_URL, '/"'));
				id_data.push(get_label(text.between('/">')));
			}, this);

			return [ id_list, id_data ];
		},

		// 取得作品的章節資料。 get_work_data()
		work_URL : function(work_id) {
			return this.novel_base_URL + 'novelview/infotop/ncode/' + work_id
					+ '/';
		},
		parse_work_data : function(html, get_label) {
			var work_data = Object.create(null);
			html.between('<table', '<div id="ad_s_box">')
			//
			.each_between('<tr>', '</tr>', function(text) {
				work_data[get_label(text.between('<th', '</th>').between('>'))]
				//
				= get_label(text.between('<td', '</td>').between('>'));
			});
			// console.log(work_data);

			work_data = Object.assign({
				// 必要屬性：須配合網站平台更改。
				title : get_label(html.between('dc:title="', '"')),

				// 選擇性屬性：須配合網站平台更改。
				// e.g., 连载中, 連載中
				// <span id="noveltype">完結済</span>全1部
				// <span id="noveltype_notend">連載中</span>全1部
				status : [ html.between('<span id="noveltype', '<')
						.between('>') ],
				author : work_data.作者名,
				last_update : work_data.最終話掲載日 || work_data.掲載日,
				description : work_data.あらすじ
			}, work_data);

			// 此兩者為未分割的字串。
			if (work_data.ジャンル)
				work_data.genre = work_data.ジャンル.split(/\s+/);
			if (work_data.キーワード) {
				// No キーワード:
				// https://novel18.syosetu.com/novelview/infotop/ncode/n3731fh/
				work_data.tags = work_data.キーワード.split(/\s+/);
			}

			return work_data;
		},
		// 對於章節列表與作品資訊分列不同頁面(URL)的情況，應該另外指定.chapter_list_URL。
		chapter_list_URL : function(work_id) {
			return this.novel_base_URL + work_id + '/';
		},
		get_chapter_list : function get_chapter_list(work_data, html) {
			// TODO: 對於單話，可能無目次。
			if (!work_data.next_chapter_list_NO)
				work_data.chapter_list = [];
			html.between('<div class="index_box">', '<div id="novel_footer">')
			//
			.each_between('<dl class="novel_sublist2">', '</dl>',
			//
			function(text) {
				var matched = text.match(
				// [ , href, inner ]
				/ href="\/[^\/]+\/([^ "<>]+)[^<>]*>(.+?)<\/a>/);
				if (!matched) {
					throw text;
				}

				var chapter_data = {
					url : matched[1].replace(/^\.\//, ''),
					// 掲載日
					date : [ text.match(/>\s*(2\d{3}[年\/][^"<>]+?)</)[1]
					//
					.to_Date({
						zone : work_data.time_zone
					}) ],
					title : matched[2]
				};
				if (matched = text.match(/ title="(2\d{3}[年\/][^"<>]+?)改稿"/)) {
					chapter_data.date.push(matched[1].to_Date({
						zone : work_data.time_zone
					}) || matched[1]);
				}
				work_data.chapter_list.push(chapter_data);
				// console.log(chapter_data);
			});

			if (work_data.chapter_list.length === 0
					&& html.includes('<div id="novel_honbun"')) {
				// 短編小説
				work_data.chapter_list.push({
					url : this.chapter_list_URL(work_data.id),
					// 掲載日
					date : [ work_data.last_update.to_Date({
						zone : work_data.time_zone
					}) ],
					title : work_data.title
				});
			}

			// 2024/1/31 之前改版
			var matched = html.between('<div class="novelview_pager">',
					'</div>');
			matched = matched && matched
			// <a href="/n2710db/?p=3" class="novelview_pager-next">次へ</a>
			.match(/<a href="([^"]+)" class="novelview_pager-next">次へ/);
			if (matched) {
				work_data.next_chapter_list_URL = this.novel_base_URL
						+ matched[1].replace(/^\//, '');
			}
		},

		// 取得每一個章節的各個影像內容資料。 get_chapter_data()
		chapter_URL : function(work_data, chapter_NO) {
			var url = work_data.chapter_list[chapter_NO - 1].url;
			if (url.includes('://')) {
				// e.g., 短編小説
				return url;
			}
			return this.chapter_list_URL(work_data.id) + url;
		},
		// 檢測所取得內容的章節編號是否相符。
		check_chapter_NO : [ '<div id="novel_no">', '/' ],
		parse_chapter_data : function(html, work_data, get_label, chapter_NO) {
			var
			/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
			NOT_FOUND = ''.indexOf('_'),
			//
			text = html.between('<div id="novel_color">',
					'</div><!--novel_color-->'),
			//
			index = text.indexOf('<div id="novel_p"');
			if (index === NOT_FOUND
			//
			&& (index = text.indexOf('<div id="novel_honbun"')) === NOT_FOUND) {
				// gettext_config:{"id":"unable-to-parse-chapter-data-and-get-chapter-content-text"}
				throw new Error('無法解析章節資料並取得章節內容文字！');
			}
			text = text.slice(index);
			text = text.between(null, {
				// 後半段的"次の話"
				tail : '<div class="novel_bn">'
			}) || text;

			var links = [], ebook = work_data[this.KEY_EBOOK];

			text.each_between('<a ', '</a>', function(text) {
				var matched = text.match(/(?:^| )href="([^"<>]+)"/);
				// @see https://ncode.syosetu.com/n8611bv/49/
				// e.g., <a href="https://11578.mitemin.net/i00000/"
				if (matched && matched[1].includes('.mitemin.net')) {
					// 下載mitemin.net的圖片
					links.push(matched[1]);
				}
			});

			links.forEach(function(url) {
				// 登記有url正處理中，須等待。
				ebook.downloading[url] = url;
				library_namespace.get_URL(url, function(XMLHttp) {
					delete ebook.downloading[url];
					if (!XMLHttp || !XMLHttp.responseText) {
						return;
					}
					var matched = XMLHttp.responseText
							.match(/<a href="([^"<>]+)" target="_blank">/);
					if (matched) {
						// 因為.add()會自動添加.downloading並在事後檢查.on_all_downloaded，因此這邊不用再檢查。
						ebook.add({
							url : matched[1]
						});
					} else {
						library_namespace.error({
							// gettext_config:{"id":"unable-to-extract-image-url-from-link-in-chapter-content-$1"}
							T : [ '無法從章節內容中之連結抽取出圖片網址：%1', url ]
						});
					}
				});
			});

			var series_title = get_label(
			//
			html.between('<p class="series_title">', '</p>'));
			if (series_title) {
				ebook.set([ {
					meta : null,
					name : "calibre:series",
					content : series_title = get_label(series_title)
				} ]);
			}
			this.add_ebook_chapter(work_data, chapter_NO, {
				title : html.between('<p class="chapter_title">', '</p>')
				// 短編小説
				|| series_title,
				sub_title : html.between('<p class="novel_subtitle">', '</p>')
				// 短編小説
				|| html.between('<p class="novel_title">', '</p>'),
				text : text
			});
		}
	};

	// --------------------------------------------------------------------------------------------

	function new_syosetu_crawler(configuration) {
		if (configuration && configuration.isR18) {
			// 放在這邊，避免覆蓋原設定。
			if (!configuration.novel_base_URL)
				configuration.novel_base_URL = 'https://novel18.syosetu.com/';
			configuration.search_URL = configuration.search_URL
			// 解析 作品名稱 → 作品id get_work()
			// search/search/search.php hyoka: 総合ポイントの高い順 総合評価の高い順
			|| 'search/search/?order=hyoka&word=';
		}

		configuration = configuration ? Object.assign(Object.create(null),
				default_configuration, configuration) : default_configuration;

		// 每次呼叫皆創建一個新的實體。
		var crawler = new library_namespace.work_crawler(configuration);

		if (crawler.isR18) {
			// for なろうの関連サイト/R-18サイト 年齢確認
			// https://static.syosetu.com/sub/nl/view/js/event/redirect_ageauth.js
			crawler.setup_value('cookie', 'over18=yes');
		}

		if (false) {
			crawler.data_of(work_id, function(work_data) {
				console.log(work_data);
			});
		}

		return crawler;
	}

	return new_syosetu_crawler;
}
