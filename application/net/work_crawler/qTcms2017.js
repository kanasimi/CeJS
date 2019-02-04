/**
 * @name CeL module for downloading qTcms 20170501 version comics.
 * 
 * @fileoverview 本檔案包含了解析並處理、批量下載中國大陸常見漫畫管理系統: 晴天漫画CMS (晴天漫画系统 晴天漫画程序, 晴天新漫画系统)
 *               的工具。
 * 
 * <code>

 CeL.qTcms2017(configuration).start(work_id);

 </code>
 * 
 * modify from 9mdm.js→dagu.js, mh160.js
 * 
 * @see qTcms 晴天漫画程序 晴天漫画系统 http://manhua.qingtiancms.com/
 * 
 * @since 2019/2/3 模組化。
 */

// More examples:
// @see comic.cmn-Hans-CN/nokiacn.js
'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.work_crawler.qTcms2017',

	require : 'application.net.work_crawler.'
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

		// 所有的子檔案要修訂註解說明時，應該都要順便更改在CeL.application.net.comic中Comic_site.prototype內的母comments，並以其為主體。

		// one_by_one : true,
		// base_URL : '',

		// fs.readdirSync('.').forEach(function(d){if(/^\d+\s/.test(d))fs.renameSync(d,'manhua-'+d);})
		// fs.readdirSync('.').forEach(function(d){if(/^manhua-/.test(d))fs.renameSync(d,d.replace(/^manhua-/,''));})
		// 所有作品都使用這種作品類別catalog前綴。
		// common_catalog : 'manhua',

		// 規範 work id 的正規模式；提取出引數中的作品id 以回傳。
		extract_work_id : function(work_information) {
			if ((this.common_catalog ? /^[a-z\-\d]+$/ : /^[a-z]+_[a-z\-\d]+$/)
					.test(work_information))
				return work_information;
		},

		// --------------------------------------
		// search comic via web page

		// 解析 作品名稱 → 作品id get_work()
		search_URL_web : 'statics/search.aspx?key=',
		parse_search_result_web : function(html, get_label) {
			// console.log(html);
			html = html.between('<div class="cy_list">', '</div>');
			var id_list = [], id_data = [];
			html.each_between('<li class="title">', '</li>', function(token) {
				// console.log(token);
				var matched = token.match(
				//
				/<a href="\/([a-z]+\/[a-z\-\d]+)\/"[^<>]*?>([^<>]+)/);
				// console.log(matched);
				if (this.common_catalog
				// 去掉所有不包含作品類別catalog前綴者。
				&& !matched[1].startsWith(this.common_catalog + '/'))
					return;
				id_list.push(this.common_catalog
				//
				? matched[1].slice((this.common_catalog + '/').length)
				// catalog/latin name
				: matched[1].replace('/', '_'));
				id_data.push(get_label(matched[2]));
			}, this);
			// console.log([ id_list, id_data ]);
			return [ id_list, id_data ];
		},

		// --------------------------------------
		// default: search comic via API
		// copy from 360taofu.js

		// 解析 作品名稱 → 作品id get_work()
		search_URL : function(work_title) {
			return [ 'statics/qingtiancms.ashx', {
				cb : 'jQuery' + ('1.7.2' + Math.random()).replace(/\D/g, "")
				// @see .expando
				+ '_' + Date.now(),
				key : work_title,
				action : 'GetSear1',
				_ : Date.now()
			} ];
		},
		parse_search_result : function(html, get_label) {
			// console.log(html);
			html = eval(html.between('(', {
				tail : ')'
			}));
			// console.log(html);
			return [ html, html ];
		},
		id_of_search_result : function(data) {
			// .u: webdir + classid1pinyin + titlepinyin + "/"
			// webdir: "/"
			// classid1pinyin: latin + "/"
			// titlepinyin: latin
			var matched = data.u.match(/(?:\/|^)([a-z]+)\/([a-z\-\d]+)\/$/);

			// assert: !!matched === true
			if (!this.common_catalog)
				return matched[1] + '_' + matched[2];

			// assert: this.common_catalog === matched[1]
			return matched[2];
		},
		title_of_search_result : 't',

		// --------------------------------------

		// 取得作品的章節資料。 get_work_data()
		work_URL : function(work_id) {
			return (this.common_catalog ? this.common_catalog + '/' + work_id
			// replace only the first '_' to '/'
			: work_id.replace('_', '/')) + '/';
		},
		parse_work_data : function(html, get_label, extract_work_data) {
			// console.log(html);
			var work_data;
			eval('work_data=' + html.between('qingtiancms_Details=', ';var'));

			// nokiacn.js, iqg365.js
			extract_work_data(work_data, html.between(
			// <div class="cy_title">\n <h1>相合之物</h1>
			'<h1>', ' id="comic-description">'),
					/<span>([^<>：]+)：([\s\S]*?)<\/span>/g);

			// 360taofu.js
			extract_work_data(work_data, html.between(
			// <div class="mh-date-info fl">\n <div class="mh-date-info-name">
			'<div class="mh-date-info', '<div class="work-author">'),
			// <span class="one"> 作者： <em>... </span>
			// <span> 人气： <em... </span>
			// 人气： 收藏数： 吐槽： 状态：
			/<span[^<>]*>([^<>：]+)：([\s\S]*?)<\/span>/g);

			// 共通
			extract_work_data(work_data, html.between(
			// <div class="cy_zhangjie">...<div class="cy_zhangjie_top">
			'<div class="cy_zhangjie_top">',
			// <div class="cy_plist" id="play_0">
			' class="cy_plist"'), /<p>([^<>：]+)：([\s\S]*?)<\/p>/g);

			extract_work_data(work_data, html);

			Object.assign(work_data, {
				// 避免覆寫
				qTid : work_data.id,

				// 必要屬性：須配合網站平台更改。
				title : work_data.title
				// nokiacn.js, iqg365.js
				|| get_label(html.between('<h1>', '</h1>')),
				author : work_data.作者,
				status : work_data.状态,
				last_update : work_data.更新时间,

				// 選擇性屬性：須配合網站平台更改。
				latest_chapter : work_data.最新话,

				评分 : work_data.评分 || get_label(html.between(
				// 360taofu.js: <p class="fl">评分：<strong class="ui-text-orange"
				// id="comicStarDis">...</p>
				' id="comicStarDis">', '</p>')),

				// 網頁中列的description比meta中的完整。
				description : get_label(html.between(
				// nokiacn.js, iqg365.js
				// <p id="comic-description">...</p>
				' id="comic-description">', '</')) || get_label(html.between(
				// 360taofu.js: <div id="workint" class="work-ov">
				' id="workint"', '</div>').between('>'))
			});

			// console.log(work_data);
			return work_data;
		},
		get_chapter_list : function(work_data, html, get_label) {
			html = html.between('<div class="cy_plist', '</div>');

			var matched, PATTERN_chapter =
			//
			/<li><a href="([^<>"]+)"[^<>]*>([\s\S]+?)<\/li>/g;

			work_data.chapter_list = [];
			while (matched = PATTERN_chapter.exec(html)) {
				var chapter_data = {
					url : matched[1],
					title : get_label(matched[2])
				};
				work_data.chapter_list.push(chapter_data);
			}
			work_data.chapter_list.reverse();
			// console.log(work_data.chapter_list);
		},

		parse_chapter_data : function(html, work_data) {
			// modify from mh160.js

			var chapter_data = html.between('qTcms_S_m_murl_e="', '"');
			if (chapter_data) {
				// 對於非utf-8編碼之中文，不能使用 atob()???
				chapter_data = atob(chapter_data).split("$qingtiandy$");
			}
			if (!chapter_data) {
				CeL.log('無法解析資料！');
				return;
			}
			// console.log(JSON.stringify(chapter_data));
			// console.log(chapter_data.length);
			// CeL.set_debug(6);

			// 設定必要的屬性。
			chapter_data = {
				image_list : chapter_data.map(function(url) {
					url = encodeURI(url);

					// 获取当前图片 function f_qTcms_Pic_curUrl_realpic(v)
					// http://www.xatxwh.com/template/skin1/css/d7s/js/show.20170501.js?20190117082944

					// f_qTcms_Pic_curUrl() → f_qTcms_Pic_curUrl_realpic(v) @
					// http://www.nokiacn.net/template/skin2/css/d7s/js/show.20170501.js?20180805095630
					if (url.startsWith('/')) {
						// e.g., nokiacn.js
						var image_base_url = this.image_base_url;
						if (!image_base_url && image_base_url !== '') {
							// default: url = qTcms_m_weburl + url;
							image_base_url = html.between('qTcms_m_weburl="',
									'"');
						}
						url = image_base_url + url;

					} else if (html.between('qTcms_Pic_m_if="', '"') !== "2") {
						// e.g.,
						// http://www.nokiacn.net/lianai/caozuo100/134257.html
						url = url.replace(/\?/gi, "a1a1")
								.replace(/&/gi, "b1b1").replace(/%/gi, "c1c1");
						url = (html.between('qTcms_m_indexurl="', '"') || '/')
								+ "statics/pic/?p="
								+ escape(url)
								+ "&picid="
								+ html.between('qTcms_S_m_id="', '"')
								+ "&m_httpurl="
								+ escape(atob(html.between(
										'qTcms_S_m_mhttpurl="', '"')));
						// Should get Status Code: 302 Found
					}

					return {
						url : url
					};
				}, this)
			};
			// console.log(JSON.stringify(chapter_data));

			return chapter_data;
		}

	};

	// --------------------------------------------------------------------------------------------

	function new_qTcms2017_comics_crawler(configuration) {
		configuration = configuration ? Object.assign(library_namespace
				.null_Object(), default_configuration, configuration)
				: default_configuration;

		// 每次呼叫皆創建一個新的實體。
		return new library_namespace.work_crawler(configuration);
	}

	return new_qTcms2017_comics_crawler;
}
