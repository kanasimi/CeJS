/**
 * @name CeL function for downloading PTCMS novels.
 * 
 * @fileoverview 本檔案包含了解析並處理、批量下載中國大陸常見小說軟體系統: PT小说聚合程序 (PTCMS系统) 各個版本的工具。
 * 
 * <code>

 CeL.PTCMS(configuration).start(work_id);

 </code>
 * 
 * TODO: 去掉前後網站廣告
 * 
 * @see https://www.ptcms.com/
 * @see http://down.chinaz.com/test/201210/2252_1.htm 杰奇小说连载系统,
 *      https://zhidao.baidu.com/question/518711125119801445.html 奇文网络小说管理系统
 *      终点小说网站管理系统 露天中文小说网站管理系统 https://zhidao.baidu.com/question/474414436.html
 *      https://www.ptcms.com/ 关关采集器
 * 
 * @see https://github.com/LZ0211/Wedge/tree/master/lib/Sites/plugins
 *      https://github.com/lufengfan/NovelDownloader
 * @see http://www.sodu.cc/default.html
 *      https://kknews.cc/zh-tw/culture/oqyx5.html https://tw.hjwzw.com/
 * @see http://www.76wx.com/ http://www.xssk.net/
 * 
 * @since 2017/6/19 21:15:40 模組化。
 */

// More examples:
// @see https://github.com/kanasimi/work_crawler/blob/master/81xsw.js
// @see https://github.com/kanasimi/work_crawler/blob/master/23us.js
'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.work_crawler.PTCMS',

	require : 'application.net.work_crawler.'
	//
	+ '|application.storage.EPUB.'
	// for CeL.to_file_name()
	+ '|application.net.'
	// for .detect_HTML_language(), .time_zone_of_language()
	+ '|application.locale.',

	// 設定不匯出的子函式。
	no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring

	// --------------------------------------------------------------------------------------------

	var PATTERN_url_for_baidu = /([\d_]+)(?:\.html|\/(?:index\.html)?)?$/;
	if (library_namespace.is_debug()) {
		[ 'http://www.host/123/', 'http://www.host/123/index.html',
				'http://www.host/123.html' ].forEach(function(url) {
			console.assert('123' === 'http://www.host/123/'
					.match(PATTERN_url_for_baidu)[1]);
		});
	}

	var default_configuration = {

		// auto_create_ebook, automatic create ebook
		// MUST includes CeL.application.locale!
		need_create_ebook : true,
		// recheck:從頭檢測所有作品之所有章節。
		// 'changed': 若是已變更，例如有新的章節，則重新下載/檢查所有章節內容。
		recheck : 'changed',

		// one_by_one : true,
		// base_URL : 'http://www.*.com/',
		// charset : 'gbk',

		// 解析 作品名稱 → 作品id get_work()
		// search_URL : '',

		// for 百度站内搜索工具。非百度搜索系統得要自己撰寫。
		parse_search_result : function(html, get_label) {
			// console.log(html);
			var id_data = [],
			// {Array}id_list = [id,id,...]
			id_list = [], get_next_between = html.find_between(
					'<a cpos="title" href="', '</a>'), text;

			while ((text = get_next_between()) !== undefined) {
				// console.log(text);
				var matched = text.between(null, '"').match(
						PATTERN_url_for_baidu);
				// console.log(matched);
				id_list.push(matched[1]);
				matched = text.match(/ title="([^"]+)"/);
				id_data.push(get_label(matched[1]));
			}

			// console.log([ id_list, id_data ]);
			return [ id_list, id_data ];
		},

		// 取得作品的章節資料。 get_work_data()
		// work_URL : function(work_id) { return work_id + '/'; },
		parse_work_data : function(html, get_label, exact_work_data) {
			// console.log(html);
			// 由 meta data 取得作品資訊。
			var work_data = {
				// 必要屬性：須配合網站平台更改。
				title : html.between('og:novel:title" content="', '"')
				// e.g., 88dushu
				|| html.between('og:title" content="', '"')
				// 通常與og:title相同
				|| html.between('og:novel:book_name" content="', '"'),

				// 選擇性屬性：須配合網站平台更改。
				author : html.between('og:novel:author" content="', '"'),
				// e.g., 连载[中], [已]完成
				status : [ html.between('og:novel:status" content="', '"'),
						html.between('og:novel:category" content="', '"') ],
				image : html.between('og:image" content="', '"'),
				last_update :
				//
				html.between('og:novel:update_time" content="', '"')
				// e.g., 630book
				|| html.between('og:novel:update_time" content=\'', "'"),
				latest_chapter : html.between(
						'og:novel:latest_chapter_name" content="', '"'),
				description : get_label(
				//
				html.between('og:description" content="', '"')
				// e.g., 630book
				|| html.between('<div id="intro">', '</div>'))
				// 偶爾會有沒填上描述的書籍。
				|| '',
				language : 'cmn-Hans-CN',
				site_name : get_label(
				//
				html.between('<div class="logo">', '</div>')
				//
				|| html.between('<div class="header_logo">', '</div>')
				// e.g., 630book
				|| html.between('<strong class="logo">', '</strong>'))
			};
			// 由 meta data 取得作品資訊。
			exact_work_data(work_data, html);

			if (/^\d{1,2}-\d{1,2}$/.test(work_data.last_update)) {
				// e.g., 07-01 → 2017-07-01
				work_data.last_update = (new Date).getFullYear() + '-'
						+ work_data.last_update;
			}

			if (work_data.site_name.includes('?$')) {
				// e.g., 88dushu
				work_data.site_name = html.between("AddFavorite('", "'");
			}

			return work_data;
		},
		// 取得包含章節列表的文字範圍。
		// get_chapter_count_contents : function(html) {return html.between();},
		get_chapter_count : function(work_data, html, get_label) {
			// determine base directory of work
			work_data.base_url = work_data.url.endsWith('/') ? work_data.url
					: work_data.url.replace(/\.[^.]+$/, '/');
			if (work_data.base_url.startsWith(this.base_URL)) {
				work_data.base_url = work_data.base_url
						.slice(this.base_URL.length - 1);
			}

			work_data.chapter_list = [];
			if (this.get_chapter_count_contents) {
				html = this.get_chapter_count_contents(html);
			}
			// 分隔符號
			var separator = html.includes('</dd>') ? [ '<dd>', '</dd>' ] : [
					'<li>', '</li>' ];
			html.each_between(separator, function(text) {
				// 取得連結內容。
				text = text.between('<a ', '</a>');
				work_data.chapter_list.push({
					// 從href取得章節的網址。
					url : text.between('href="', '"'),
					// 從title/顯示的文字取得章節的標題。
					title : text.between('title="', '"')
							|| get_label(text.between('>'))
				});
			});
		},

		// 取得每一個章節的內容與各個影像資料。 get_chapter_data()
		chapter_URL : function(work_data, chapter) {
			var url = work_data.chapter_list[chapter - 1].url;
			return url.startsWith('/') ? url : work_data.base_url + url;
		},
		parse_chapter_data : function(html, work_data, get_label, chapter) {
			// e.g., 下一章 →
			var next_url = html.match(/ href="([^"]+.html)"[^<>]*>下一[章页]/),
			//
			next_chapter = work_data.chapter_list[chapter];
			// console.log(chapter + ': ' + next_url[1]);

			if (next_url && next_chapter
			// 有些在目錄上面的章節連結到了錯誤的頁面，只能靠下一頁來取得正確頁面。
			&& (next_chapter.url !== (next_url = next_url[1]))
			// 許多網站會把最新章節的下一頁設成章節列表，因此必須排除章節列表的網址。
			&& next_url !== work_data.url
			// 照理來說本陳述應該皆為真。
			&& (!next_url.startsWith(work_data.base_url)
			// 正規化規範連結。
			|| next_chapter.url !== next_url.slice(work_data.base_url.length))) {
				if (false) {
					library_namespace.info(library_namespace.display_align([
							[ 'chapter ' + chapter + ': ', next_chapter.url ],
							[ '→ ', next_url ] ]));
					next_chapter.url = next_url;
				}
				// insert a url
				work_data.chapter_list.splice(chapter, 0, {
					// title : '',
					url : next_url
				});
			}
			this.add_ebook_chapter(work_data, chapter, {
				sub_title : get_label(html.between('<h1>', '</h1>')),
				text : (html.between('<div id="content">', '</div>')
				// e.g., 88dushu
				|| html.between('<div class="yd_text2">', '</div>')).replace(
						/<script[^<>]*>[^<>]*<\/script>/, '')
			});
		},
		/** 進一步處理書籍之章節內容。例如繁簡轉換、裁剪廣告。 */
		contents_post_processor : function(contents) {
			return contents;
		} && null,
	};

	// --------------------------------------------------------------------------------------------

	function PTCMS_novels(configuration) {
		configuration = configuration ? Object.assign(library_namespace
				.null_Object(), default_configuration, configuration)
				: default_configuration;

		if (!configuration.search_URL && configuration.baidu_cse) {
			// baidu cse id 百度站内搜索工具。
			configuration.search_URL = {
				URL : 'http://zhannei.baidu.com/cse/search?s='
				// &isNeedCheckDomain=1&jump=1 &entry=1
				+ configuration.baidu_cse + '&q=',
				charset : 'UTF-8'
			};
		}

		// 每次呼叫皆創建一個新的實體。
		return new library_namespace.work_crawler(configuration);
	}

	return PTCMS_novels;
}
