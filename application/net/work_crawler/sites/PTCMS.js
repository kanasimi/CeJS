/**
 * @name CeL module for downloading PTCMS novels.
 * 
 * @fileoverview 本檔案包含了解析並處理、批量下載中國大陸常見小說管理系統: PT小说聚合程序 (PTCMS系统) 各個版本的工具。
 * 
 * <code>

 CeL.PTCMS(configuration).start(work_id);

 </code>
 * 
 * TODO: 去掉前後網站廣告。
 * 
 * @see https://www.ptcms.com/
 * @see http://down.chinaz.com/test/201210/2252_1.htm 杰奇小说连载系统 杰奇原创文学系统,
 *      https://zhidao.baidu.com/question/518711125119801445.html 奇文网络小说管理系统
 *      终点小说网站管理系统 露天中文小说网站管理系统 https://zhidao.baidu.com/question/474414436.html
 *      https://www.ptcms.com/ 关关采集器
 * 
 * @see https://github.com/LZ0211/Wedge/tree/master/lib/Sites/plugins
 *      https://github.com/lufengfan/NovelDownloader
 *      https://github.com/unclezs/NovelHarvester
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
	name : 'application.net.work_crawler.sites.PTCMS',

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

	function is_server_error(result) {
		// TODO: 81xsw 有時會 403，需要重新再擷取一次。

		return result in {
			// 88dus 有時會 502，需要重新再擷取一次。
			'502 Bad Gateway' : true,
			// 630book 有時會 503，需要重新再擷取一次。
			'503 Service Unavailable' : true,
			// 630book 有時會 "500 - 内部服务器错误。"
			'服务器错误' : true
		};
	}

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

		// for 笔趣阁
		parse_search_result_biquge : function(html, get_label) {
			// console.log(html);
			var matched = html
					.match(/og:url" content="[^<>"]+?\/(?:\d+_)?(\d+)\/?"/);
			if (matched) {
				// assert: 直接跳到了作品頁面。
				return [ [ +matched[1] ],
						[ get_label(html.between('og:title" content="', '"')) ] ];
			}

			matched = html.match(/blockcontent">([\s\S]+)<\/div>/);
			if (matched) {
				/**
				 * <code>

				// xbiquge.cc.js:
				<div class="blocktitle">出现错误！</div><div class="blockcontent"><div style="padding: 10px"><br /> 错误原因：对不起，两次搜索的间隔时间不得少于 30 秒<br /><br /> 请 <a href="javascript:history.back(1)">返 回</a> 并修正<br /><br /></div><div style="width: 100%; text-align: right; line-height: 200%; padding-right: 10px;">[<a href="javascript:window.close()">关闭本窗口</a>]</div></div>

				</code>
				 */
				matched = get_label(matched[1]).replace(/\n[\s\S]*/, '');
				library_namespace.error(matched);
			}

			// console.trace(html);
			var id_list = [], id_data = [];
			html.each_between('<li>', '</li>', function(text) {
				matched = text.match(
				/**
				 * <code>

				// biquge.js:
				<span class="s2"><a href="https://www.xs.la/211_211278/" target="_blank">
				万古剑神</a>
				</span>

				// xbiquge.js:
				<span class="s2"><a href="http://www.xbiquge.cc/book/24276/">元尊</a></span>


				// xbiquke.js
				<span class="s1">1</span>
				<span class="s2">
				    <a href="/29_29775/" target="_blank">
				        我真不是邪神走狗
				    </a>
				</span>
				<span class="s4">
				    <a href="/author/29775/">
				        万劫火
				    </a>
				</span>
				<span class="s3">
				    <a style="color: Red;" href="/29_29775/22709468.html" target="_blank" title="番外·童年（一）">
				    番外·童年（一）</a>
				</span>
				
				<span class="s6">2021-11-26 02:30:39</span>


				</code>
				 */
				/<a href="[^<>"]*?\/(?:\d+_)?(\d+)\/"[^<>]*>([\s\S]+?)<\/a>/);
				// console.log([ text, matched ]);
				if (matched) {
					id_list.push(+matched[1]);
					id_data.push(get_label(matched[2]));
				}
			});
			// console.trace(id_list, id_data);
			return [ id_list, id_data ];
		},

		// 取得作品的章節資料。 get_work_data()
		// work_URL : function(work_id) {
		// /** @see this.work_URL in CeL.application.net.work_crawler */ },
		parse_work_data : function(html, get_label, extract_work_data) {
			// console.log(html);
			// 由 meta data 取得作品資訊。
			var work_data = {
				// 必要屬性：須配合網站平台更改。
				title : html.between('og:novel:title" content="', '"')
				// e.g., 88dushu.js
				|| html.between('og:title" content="', '"')
				// 通常與og:title相同
				|| html.between('og:novel:book_name" content="', '"'),

				// 選擇性屬性：須配合網站平台更改。
				author : html.between('og:novel:author" content="', '"'),
				// e.g., 连载[中], [已]完成
				status : html.between('og:novel:status" content="', '"'),
				category : html.between('og:novel:category" content="', '"'),
				// https://www.booktxt.net/: '<div id="fmimg">'
				image : html.between('<div id="fmimg">', '</div>').between(
						'<img src="', '"')
						// general
						|| html.between('og:image" content="', '"'),
				last_update :
				//
				html.between('og:novel:update_time" content="', '"')
				// e.g., 630book
				|| html.between('og:novel:update_time" content=\'', "'"),
				latest_chapter : html.between(
						'og:novel:latest_chapter_name" content="', '"'),
				description : get_label(
				// e.g., 630book, biqizw.js
				html.between('<div id="intro">', '</div>')
				/**
				 * <code>

				// https://www.ecxs.net/book/3740/
				<p class="text-muted" id="bookIntro" style="height:200px;"><a href="javascript:;" id="bookIntroMore" class="badge" data-isExpand="no">展开<i class="fa fa-angle-double-down fa-fw"></i></a><img class="img-thumbnail pull-left visible-xs" style="margin:0 5px 0 0" alt="长生：开局一条命，修为全靠苟" src="https://www.ecxs.net/images/nocover.jpg" title="长生：开局一条命，修为全靠苟" width="80" height="120" /> &nbsp;&nbsp;【长生流修仙、轻松诙谐】 ...<br /></p>

				</code>
				 */
				|| html.between(' id="bookIntro"', '</p></div>')
				//
				.between('<img ').between('>'))
				// 偶爾會有沒填上描述的書籍。
				|| '',
				language : 'cmn-Hans-CN',
				site_name : get_label(
				//
				html.between('<div class="logo">', '</div>')
				//
				|| html.between('<div class="header_logo">', '</div>')
				// e.g., 630book
				|| html.between('<strong class="logo">', '</strong>')
				/**
				 * <code>

				// https://www.ecxs.net/book/3740/
				<a class="navbar-brand" href="/">烟草小说网</a>

				</code>
				 */
				|| html.between('class="navbar-brand" href="/">', '</a>'))
			};
			// 由 meta data 取得作品資訊。
			extract_work_data(work_data, html);

			if (is_server_error(work_data.title)) {
				return this.REGET_PAGE;
			}

			if (this.extract_work_data) {
				// e.g., xbiquke.js
				this.extract_work_data(work_data, html, get_label,
						extract_work_data);
			}

			if (/^\d{1,2}-\d{1,2}$/.test(work_data.last_update)) {
				// e.g., 07-01 → 2017-07-01
				work_data.last_update = (new Date).getFullYear() + '-'
						+ work_data.last_update;
			}

			if (work_data.site_name.includes('?$')) {
				// e.g., 88dushu.js
				work_data.site_name = html.between("AddFavorite('", "'");
			}

			if (work_data.image
			// 處理特殊圖片: ignore site default image
			// https://www.ecxs.net/images/nocover.jpg
			&& work_data.image.includes('nocover.jpg')) {
				delete work_data.image;
			}

			if (this.parse_work_data_postfix)
				this.parse_work_data_postfix(html, get_label, work_data);

			// console.log(work_data);
			return work_data;
		},
		// 取得包含章節列表的文字範圍。
		// get_chapter_list_contents : function(html) {return html.between();},
		get_chapter_list : function(work_data, html, get_label) {
			// determine base directory of work
			work_data.base_url = work_data.url.endsWith('/') ? work_data.url
			//
			: /\.[^./]+$/.test(work_data.url) ? work_data.url.replace(
					/\.[^./]+$/, '/')
			// e.g., ecxs.js
			: work_data.url + '/';
			if (work_data.base_url.startsWith(this.base_URL)) {
				work_data.base_url = work_data.base_url
						.slice(this.base_URL.length - 1);
			}
			// console.trace(work_data);

			if (this.get_chapter_list_contents) {
				html = this.get_chapter_list_contents(html);
			}
			// console.log(html);

			work_data.chapter_list = [];
			var part_title, matched,
			// 章節以及篇章連結的模式。
			// [ all, tag name, attributes, 連結內容 HTML ]
			PATTERN_chapter = /<(li|dd|dt)([^<>]*)>([\s\S]*?)<\/\1>/g;
			while (matched = PATTERN_chapter.exec(html)) {
				if (false) {
					delete matched.input;
					console.log(matched);
				}

				if (matched[1] === 'dt' ||
				// e.g., 88dushu.js
				matched[1] === 'li' && matched[2].includes('class="fj"')) {
					part_title = get_label(matched[3]);
					if (part_title.includes('最新章节') && part_title.length > 20) {
						// e.g., 《...》最新章节（提示：已启用缓存技术，最新章节可能会延时显示，登录书架即可实时查看。）
						// e.g., ...最新章节列表 (本页已经缓存，请加入书架查看...最新章节)
						part_title = 'pass';
					} else if (part_title.includes('正文')) {
						// e.g., 《...》正文卷, 《...》正文
						part_title = '';
					} else {
						// this.set_part(work_data, part_title);
					}
					// console.log(part_title);

				} else if (part_title !== 'pass'
				// 取得連結內容。
				&& (matched = matched[3].between('<a ', '</a>'))) {
					var chapter_data = {
						// 從href取得章節的網址。
						url : matched.between('href="', '"')
						// xbiquge.js: 交錯使用 "", ''
						|| matched.between("href='", "'")
						// booktxt.js: 交錯使用 "", ''
						|| matched.between('href ="', '"'),
						part_title : part_title,
						// 從title/顯示的文字取得章節的標題。
						title : matched.between('title="', '"')
								|| get_label(matched.between('>'))
					};
					if (chapter_data.title.startsWith(work_data.title)) {
						chapter_data.title = chapter_data.title.slice(
								work_data.title.length).trimStart();
					}
					// this.add_chapter(work_data, chapter_data);
					work_data.chapter_list.push(chapter_data);
				}
			}

			// console.log(work_data.chapter_list);
		},

		// 取得每一個章節的內容與各個影像資料。 get_chapter_data()
		chapter_URL : function(work_data, chapter_NO) {
			var url = work_data.chapter_list[chapter_NO - 1].url;
			// console.trace(url);
			url = url.startsWith('/') || url.includes('://') ? url
					: work_data.base_url + url;
			// console.trace(url);
			return url;
		},
		parse_chapter_data : function(html, work_data, get_label, chapter_NO) {
			if (!html && this.skip_error === true) {
				// Skip empty chapter
				return;
			}

			var has_next_page_to_merge
			// 在取得小說章節內容的時候，若發現有章節被目錄漏掉，則將之補上。
			= this.check_next_chapter(work_data, chapter_NO, html,
					this.PATTERN_next_chapter);

			var chapter_data = work_data.chapter_list[chapter_NO - 1],
			//
			sub_title = get_label(html.between('<h1>', '</h1>'))
			// || get_label(html.between('<H1>', '</H1>'))
			// || chapter_data.title
			, text = (html
			// general: <div id="content">
			// xbiquge.js: <div id="content" name="content">
			.between('<div id="content"', '</div>').between('>')
			// 去除掉廣告。
			// e.g., 88dushu.js
			|| html.between('<div class="yd_text2">', '</div>')).replace(
					/<script[^<>]*>[^<>]*<\/script>/g, '');

			// --------------------------------------------
			// 有些頁面過幾秒重讀就能獲得資料。
			var KEY_interval_cache = 'original_chapter_time_interval';
			if (is_server_error(sub_title) && text.length < 2000) {
				this[KEY_interval_cache] = this.chapter_time_interval;
				// 當網站不允許太過頻繁的訪問/access時，可以設定下載之前的等待時間(ms)。
				this.chapter_time_interval = 10 * 1000;
				return this.REGET_PAGE;
			}
			if (KEY_interval_cache in this) {
				// recover time interval
				if (this[KEY_interval_cache] > 0) {
					this.chapter_time_interval = this[KEY_interval_cache];
				} else {
					delete this.chapter_time_interval;
				}
				delete this[KEY_interval_cache];
			}
			// --------------------------------------------

			if (sub_title.startsWith(work_data.title)) {
				sub_title = sub_title.slice(work_data.title.length).trimStart();
			}

			if (this.remove_ads) {
				text = this.remove_ads(text, chapter_data);
				if (typeof text !== 'string') {
					library_namespace.error('parse_chapter_data: '
							+ '.remove_ads() do not return {String}!');
				}
			}
			// console.log(text);

			this.add_ebook_chapter(work_data, chapter_NO, {
				title : chapter_data.part_title,
				sub_title : sub_title,
				text : text
			});
		}

	};

	// --------------------------------------------------------------------------------------------

	function new_PTCMS_novels_crawler(configuration) {
		configuration = configuration ? Object.assign(Object.create(null),
				default_configuration, configuration) : default_configuration;

		if (configuration.parse_search_result === 'biquge') {
			configuration.parse_search_result = configuration.parse_search_result_biquge;
		}

		// 每次呼叫皆創建一個新的實體。
		return new library_namespace.work_crawler(configuration);
	}

	return new_PTCMS_novels_crawler;
}
