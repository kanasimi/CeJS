/**
 * @name CeL module for downloading SinMH CMS? comics.
 * 
 * @fileoverview 本檔案包含了解析並處理、批量下載中國大陸常見漫畫管理系統: 可能是 圣樱漫画管理系统 (圣樱CMS) 2013年版 的工具。
 * 
 * TODO: https://m.999comics.com/
 * 
 * <code>

 CeL.SinMH2013(configuration).start(work_id);

 </code>
 * 
 * modify from archive/2manhua.js
 * 
 * 57mh 介面程式碼類似於 999comics。manhuagui 似乎是在這基礎上經過修改？ 57mh 這一批介面外觀與
 * CeL.application.net.work_crawler.sites.SinMH 類似，但介面程式碼有些差距。或可稱為
 * CeL.application.net.work_crawler.sites.SinMH2013 或
 * CeL.application.net.work_crawler.sites.SMH。
 * 
 * @see https://www.999comics.com/static/scripts/main.js?v=1.0 MHD (MHD: 漫画岛
 *      http://www.manhuadao.com/book/baiqianjiadeyaoguaiwangzi/)
 *      http://www.wuqimh.com/templates/wuqi/default/scripts/main.js?v=1.0.3 MHW
 *      https://cf.hamreus.com/scripts_tw/main_EB87BCACAD66FA68CA738D0C925DC508.js
 *      main_EB87BCACAD66FA68CA738D0C925DC508.js 末: SMH = { update: "2013/4/1" }
 * 
 * @since 2019/6/18 6:13:11 模組化 MHD模板?
 */

// More examples:
// @see
// https://github.com/kanasimi/work_crawler/blob/master/comic.cmn-Hans-CN/57mh.js
'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.work_crawler.sites.SinMH2013',

	require : 'application.net.work_crawler.'
	//
	+ '|application.net.work_crawler.sites.SinMH.',

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

		// 本站常常無法取得圖片，因此得多重新檢查。
		// recheck:從頭檢測所有作品之所有章節與所有圖片。不會重新擷取圖片。對漫畫應該僅在偶爾需要從頭檢查時開啟此選項。
		// recheck : true,
		// 當無法取得chapter資料時，直接嘗試下一章節。在手動+監視下recheck時可併用此項。
		// skip_chapter_data_error : true,

		// 36145 前任攻略 19话 057.jpg
		// {Natural}MIN_LENGTH:最小容許圖案檔案大小 (bytes)。
		MIN_LENGTH : 400,

		// 當圖像檔案過小，或是被偵測出非圖像(如不具有EOI)時，依舊強制儲存檔案。
		skip_error : true,

		// one_by_one : true,

		// base_URL : '',

		// 取得伺服器列表。
		// use_server_cache : true,
		// http://www.5qmh.com/templates/wuqi/default/scripts/configs.js?v=1.0.3
		server_URL : 'templates/wuqi/default/scripts/configs.js',
		parse_server_list : function(html) {
			// console.log(html);
			var server_list = [];
			Object.values(JSON.parse(
			// var pageConfig = { 'host': { ...
			html.replace(/^[^{]+/, '').replace(/[^}]+$/, '')
			//
			.replace(/'/g, '"')).host)
			//
			.forEach(function(_server_list) {
				_server_list.forEach(function(server) {
					if (server) {
						if (!server.endsWith('/'))
							server += '/';
						server_list.push(server);
					}
				});
			});
			return server_list;
		},

		// 解析 作品名稱 → 作品id get_work()
		search_URL : 'handler/suggest?cb=_&key=',
		parse_search_result : function(html) {
			// console.log(html);
			// e.g.,
			// _([{"id":"28015","t":"民工勇者","u":"/comic/28015/","cid":"/comic/28015/0208","ct":"207话","s":"0"},{"id":"28093","t":"无敌勇者王(民工勇者)","u":"/comic/28093/","cid":"/comic/28093/02","ct":"199话","s":"0"}])
			var id_data = html ? JSON.parse(html.between('(').replace(
					/\)[^)]*$/, '')) : [];
			return [ id_data, id_data ];
		},
		id_of_search_result : function(cached_data) {
			return cached_data.id | 0;
		},
		title_of_search_result : 't',

		// 取得作品的章節資料。 get_work_data()
		work_URL : function(work_id) {
			// e.g., http://www.5qmh.com/28437/
			return work_id + '/';
		},
		parse_work_data : library_namespace.SinMH.default_configuration.parse_work_data,
		get_chapter_list : function(work_data, html, get_label) {
			// console.log(html);
			work_data.chapter_list = [];
			var matched, part_title, part_NO = 0, page,
			// 2017/7/22: 57mh.js 章節編號順序為 21 43 65.
			// e.g., 银魂 http://www.wuqimh.com/8/
			// matched: [ all, part_title, page inner ]
			PATTERN_page = /<h4><span>(.+?)<\/span><\/h4>|<ul (?:style="display:block;")?>([\s\S]+?)<\/ul>/g,
			/**
			 * e.g., 57mh.js 只發現過多page頁面，沒有發現過多part <code>

			<h4><span>单话</span></h4><div class="chapter-page cf mt10" id="chpater-page-1"><ul>
			<li ><a href="javascript:;" title="第1页">第1页<i></i></a></li>
			...
			<li class="on"><a href="javascript:;" title="第7页">第7页<i></i></a></li>
			</ul></div>

			<div class="chapter-list cf mt10" id="chpater-list-1"><ul >
			<li><a href="/8/065.html" title="155话" class="status0" target="_blank"><span>155话<i>21p</i></span></a></li>
			...
			</ul></div>

			</code>
			 * 
			 * e.g., 999comics.js 只發現過多part，沒有發現過多page頁面 <code>

			<h4><span>單話</span></h4>
			<div class="chapter-list cf mt10">
			<ul style="display:block;">
			<li><a href="/comic/26060/72192e0511125993c37cbd5264c971b6.html" title="第371回" class="status0" target="_blank"><span>371回</span></a></li>
			...
			</ul>
			</div><h4><span>番外篇</span></h4>
			<div class="chapter-list cf mt10">
			<ul style="display:block;">
			<li><a href="/comic/26060/b0da0b7c0767f1332684a0ae111b3696.html" title="Jump next出張篇" class="status0" target="_blank"><span>Jump</span></a></li>
			...
			</ul>
			</div>

			</code> 單話 番外篇 單行本
			 * 
			 * <code>

			<li><a href="/comic/25652/072.html" title="72回 碧霞坠" class="status0" target="_blank"><span>72回<i>14p</i></span></a></li>

			</code>
			 */
			PATTERN_chapter =
			// matched: [ all, href, title, inner ]
			/<li><a href="([^"<>]+)" title="([^"<>]+)"[^<>]*>(.+?)<\/a><\/li>/g;
			while (page = PATTERN_page.exec(html)) {
				if (page[1]) {
					part_title = get_label(page[1]);
					part_NO++;
					// library_namespace.info('part_title: ' + part_title);
					continue;
				}

				page = page[2];
				// console.log(page);
				var chapter_list = [];
				while (matched = PATTERN_chapter.exec(page)) {
					matched[2] = matched[2].trim();
					if (matched[3] = matched[3].between('<i>', '</i>')) {
						// add page count
						matched[2] = matched[2] + ' ' + matched[3];
					}
					chapter_list.push({
						part : part_title,
						part_NO : part_NO,
						title : get_label(matched[2]),
						url : encodeURI(matched[1])
					});
				}
				if (!this.no_need_to_revert)
					chapter_list = chapter_list.reverse();
				work_data.chapter_list.append(chapter_list);
			}

			work_data.chapter_list.part_NO = part_NO;

			return;

			// 已被棄置的排序方法。
			work_data.chapter_list
					.sort(function(chapter_data_1, chapter_data_2) {
						var matched_1 = chapter_data_1.url.match(/(\d+)\.htm/),
						// 依照.url排序。
						matched_2 = chapter_data_2.url.match(/(\d+)\.htm/);
						if (matched_1 && matched_2) {
							return matched_1[1] - matched_2[1];
						}
						return chapter_data_1.url < chapter_data_2.url ? -1 : 1;
						// 依照.title排序。
						return chapter_data_1.title < chapter_data_2.title ? -1
								: 1;
					});
		},

		parse_chapter_data : function(html, work_data, get_label, chapter_NO) {
			// decode chapter data
			function decode(code) {
				code = eval(code).replace(/^[^=]+/, 'code');
				return eval(code);
			}

			var chapter_data = html
					.match(/[>;\n\s]var\s+cInfo\s*=\s*(\{[\s\S]+?\})[;\n]/);
			if (chapter_data) {
				// 999comics.js
				// console.log(chapter_data[1]);
				eval('chapter_data=' + chapter_data[1]);
				// https://www.999comics.com/static/scripts/core2.js?v=20180206
				// preload: function(t) {...}
				// r("<img />")[0].src = "//www.999comics.com/g.php?"+o.cid+'/'+
				// o.fs[i - 1]
				chapter_data.fs = chapter_data.fs.map(function(i) {
					return this.full_URL('g.php?'
					//
					+ chapter_data.cid + '/' + i);
				}, this);
			} else if (chapter_data = html.between(
					'<script type="text/javascript">eval', '\n')) {
				// 57mh.js
				chapter_data = decode(chapter_data);
			}
			if (!chapter_data) {
				library_namespace.warn({
					// gettext_config:{"id":"unable-to-parse-chapter-data-for-«$1»-§$2"}
					T : [ '無法解析《%1》§%2 之章節資料！', work_data.title, chapter_NO ]
				});
				return;
			}
			// console.log(chapter_data);

			// 設定必要的屬性。
			chapter_data.title = get_label(html.between('<h2>', '</h2>'));
			chapter_data.image_count = chapter_data.fc;
			chapter_data.image_list = chapter_data.fs;
			if (!chapter_data.fs.at(-1)) {
				// for http://www.5qmh.com/6908/0296.html?p=9
				chapter_data.fs.pop();
				chapter_data.image_count--;
			}

			return chapter_data;
		}

	};

	// --------------------------------------------------------------------------------------------

	function new_SinMH2013_comics_crawler(configuration) {
		configuration = configuration ? Object.assign(Object.create(null),
				default_configuration, configuration) : default_configuration;

		// 每次呼叫皆創建一個新的實體。
		return new library_namespace.work_crawler(configuration);
	}

	return new_SinMH2013_comics_crawler;
}
