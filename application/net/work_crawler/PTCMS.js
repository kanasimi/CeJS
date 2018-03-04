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

	var default_configuration = {

		// auto_create_ebook, automatic create ebook
		// MUST includes CeL.application.locale!
		need_create_ebook : true,
		// recheck:從頭檢測所有作品之所有章節。
		// 'changed': 若是已變更，例如有新的章節，則重新下載/檢查所有章節內容。
		recheck : 'changed',

		// base_URL : 'http://www.*.com/',
		// charset : 'gbk',

		// 解析 作品名稱 → 作品id get_work()
		// search_URL : '',

		// 取得作品的章節資料。 get_work_data()
		// work_URL : function(work_id) {
		// /** @see this.work_URL in CeL.application.net.work_crawler */ },
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

			if (this.get_chapter_count_contents) {
				html = this.get_chapter_count_contents(html);
			}

			work_data.chapter_list = [];
			var part_title, matched,
			// 章節以及篇章連結的模式。
			// [ all, tag name, attributes, 連結內容 HTML ]
			PATTERN_chapter = /<(li|dd|dt)([^<>]*)>(.*?)<\/\1>/g;
			while (matched = PATTERN_chapter.exec(html)) {
				if (matched[1] === 'dt' ||
				// e.g., 88dushu
				matched[1] === 'li' && matched[2].includes('class="fj"')) {
					part_title = get_label(matched[3]);
					if (part_title.includes('最新章节') && part_title.length > 20) {
						// e.g., 《...》最新章节（提示：已启用缓存技术，最新章节可能会延时显示，登录书架即可实时查看。）
						// e.g., ...最新章节列表 (本页已经缓存，请加入书架查看...最新章节)
						part_title = 'pass';
					} else if (part_title.includes('正文')) {
						// e.g., 《...》正文卷, 《...》正文
						part_title = '';
					}
					// console.log(part_title);

				} else if (part_title !== 'pass'
				// 取得連結內容。
				&& (matched = matched[3].between('<a ', '</a>'))) {
					var chapter_data = {
						// 從href取得章節的網址。
						url : matched.between('href="', '"'),
						part_title : part_title,
						// 從title/顯示的文字取得章節的標題。
						title : matched.between('title="', '"')
								|| get_label(matched.between('>'))
					};
					work_data.chapter_list.push(chapter_data);
				}
			}
		},

		// 取得每一個章節的內容與各個影像資料。 get_chapter_data()
		chapter_URL : function(work_data, chapter_NO) {
			var url = work_data.chapter_list[chapter_NO - 1].url;
			return url.startsWith('/') ? url : work_data.base_url + url;
		},
		parse_chapter_data : function(html, work_data, get_label, chapter_NO) {
			// 在取得小說章節內容的時候，若發現有章節被目錄漏掉，則將之補上。
			this.check_next_chapter(work_data, chapter_NO, html,
					this.PATTERN_next_chapter);

			var chapter_data = work_data.chapter_list[chapter_NO - 1];
			this.add_ebook_chapter(work_data, chapter_NO, {
				title : chapter_data.part_title,
				sub_title : get_label(html.between('<h1>', '</h1>'))
				// || get_label(html.between('<H1>', '</H1>'))
				// || chapter_data.title
				,
				text : (html.between('<div id="content">', '</div>')
				// 去除掉廣告。
				// e.g., 88dushu
				|| html.between('<div class="yd_text2">', '</div>')).replace(
						/<script[^<>]*>[^<>]*<\/script>/g, '')
			});
		}
	};

	// --------------------------------------------------------------------------------------------

	function new_PTCMS_novels_crawler(configuration) {
		configuration = configuration ? Object.assign(library_namespace
				.null_Object(), default_configuration, configuration)
				: default_configuration;

		// 每次呼叫皆創建一個新的實體。
		return new library_namespace.work_crawler(configuration);
	}

	return new_PTCMS_novels_crawler;
}
