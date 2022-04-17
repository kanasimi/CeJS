/**
 * @name CeL module for downloading qTcms version 20170501-20190606010315
 *       comics.
 * 
 * @fileoverview 本檔案包含了解析並處理、批量下載中國大陸常見漫畫管理系統: 晴天漫画CMS (晴天漫画系统 晴天漫画程序, 晴天新漫画系统)
 *               PC端网站 + 手机端网站(行動版 mobile version) 的工具。
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
	name : 'application.net.work_crawler.sites.qTcms2017',

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

		// 所有的子檔案要修訂註解說明時，應該都要順便更改在CeL.application.net.comic中Comic_site.prototype內的母comments，並以其為主體。

		// 因為要經過轉址，所以一個圖一個圖來。
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
			// console.log(html);
			var id_list = [], id_data = [];
			html.each_between('<li class="title">', '</li>', function(token) {
				// console.log(token);
				var matched = token.match(
				// [ id, title ]
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
			var data = eval(html.between('(', {
				tail : ')'
			}));
			// console.log(data);
			return [ data, data ];
		},
		id_of_search_result : function(data) {
			// console.log(data);

			// PC version: .u: webdir + classid1pinyin + titlepinyin + "/"
			// webdir: "/"
			// classid1pinyin: latin + "/"
			// titlepinyin: latin
			var matched = data.u
			// mobile version
			|| data.url;
			matched = matched.match(/(?:\/|^)([a-z]+)\/([a-z\-\d]+)\/$/);

			// assert: !!matched === true
			if (!this.common_catalog)
				return matched[1] + '_' + matched[2];

			// assert: this.common_catalog === matched[1]
			return matched[2];
		},
		title_of_search_result : 't',

		// --------------------------------------
		// for mobile version

		// 解析 作品名稱 → 作品id get_work()
		search_URL_mobile : function(work_title) {
			return [ 'statics/qingtiancms.ashx', {
				action : 'GetWapSear1',
				key : work_title
			} ];
		},
		parse_search_result_mobile : function(html, get_label) {
			/**
			 * @example <code>
			{"result": 1000,"msg": "提交成功","data": [{name:'读书成圣',last_update_chapter_name:'014 禁忌十八式',last_updatetime:'',types:'',authors:'',url:'/rexue/dushuchengsheng/'}],"page_data": ""}
			</code>
			 */
			// console.log(JSON.stringify(html));
			var data;
			try {
				eval('data=' + html);
				data = data.data;
			} catch (e) {
				// e.g., "{err!}"
				data = [];
			}
			// console.log(data);
			return [ data, data ];
		},
		title_of_search_result_mobile : 'name',

		// --------------------------------------

		// 取得作品的章節資料。 get_work_data()
		work_URL : function(work_id) {
			return (this.common_catalog ? this.common_catalog + '/' + work_id
			// replace only the first '_' to '/'
			: work_id.replace('_', '/')) + '/';
		},
		parse_work_data : function(html, get_label, extract_work_data) {
			// console.log(html);
			var work_data = html.between('qingtiancms_Details=', ';var');
			if (work_data) {
				/**
				 * PC version:
				 * 
				 * @example <code>
				var qingtiancms_Details={G_mubanpage:".html",id:"6638",hits:"9454",webdir:"/",pinglunid:"10",pinglunid1:"",pinglunid2:"cytdbnhsU",pinglunid3:"prod_1368b8102b9177303c660debbbbd257c",title:"读书成圣",classid1pinyin:"rexue/",titlepinyin:"dushuchengsheng"};var uyan_config = {'su':'/6638/'};
				</code>
				 */
				eval('work_data=' + work_data);
			} else {
				// dagu.js: has NO `qingtiancms_Details`
				work_data = Object.create(null);
			}

			// PC version: nokiacn.js, iqg365.js, 733dm.js
			extract_work_data(work_data, html.between(
			// <div class="cy_title">\n <h1>相合之物</h1>
			'<h1>', ' id="comic-description">'),
					/<span>([^<>：]+)：([\s\S]*?)<\/span>/g);

			// PC version: 360taofu.js
			extract_work_data(work_data, html.between(
			// <div class="mh-date-info fl">\n <div class="mh-date-info-name">
			'<div class="mh-date-info', '<div class="work-author">'),
			// <span class="one"> 作者： <em>... </span>
			// <span> 人气： <em... </span>
			// 人气： 收藏数： 吐槽： 状态：
			/<span[^<>]*>([^<>：]+)：([\s\S]*?)<\/span>/g);

			// PC version 共通
			extract_work_data(work_data, html.between(
			// <div class="cy_zhangjie">...<div class="cy_zhangjie_top">
			'<div class="cy_zhangjie_top">',
			// <div class="cy_plist" id="play_0">
			' class="cy_plist"'), /<p>([^<>：]+)：([\s\S]*?)<\/p>/g);

			// PC version, mobile version 共通
			extract_work_data(work_data, html);

			Object.assign(work_data, this.is_mobile ? {
				// 必要屬性：須配合網站平台更改。
				last_update : html.between('<span class="date">', '</span>'),

				// 選擇性屬性：須配合網站平台更改。

				// 網頁中列的description比meta中的完整。
				description : get_label(html.between(
				// 友绘漫画网
				// <p class="txtDesc autoHeight">介绍:...</p>
				'<p class="txtDesc autoHeight">', '</p>'))
			} : {
				// 避免覆寫
				qTid : work_data.id,

				// 必要屬性：須配合網站平台更改。
				title : work_data.title
				// nokiacn.js, iqg365.js, 733dm.js
				|| get_label(html.between('<h1>', '</h1>')),
				author : work_data.作者,
				status : work_data.状态,
				last_update : work_data.更新时间,
				latest_chapter : work_data.最新话,
				latest_chapter_url : html.between('最新话：<a href="', '"'),

				// 選擇性屬性：須配合網站平台更改。
				评分 : work_data.评分 || get_label(html.between(
				// 360taofu.js: <p class="fl">评分：<strong class="ui-text-orange"
				// id="comicStarDis">...</p>
				' id="comicStarDis">', '</p>')),

				// 網頁中列的description比meta中的完整。
				description : get_label(html.between(
				// nokiacn.js, iqg365.js, 733dm.js
				// <p id="comic-description">...</p>
				' id="comic-description">', '</')) || get_label(html.between(
				// 360taofu.js: <div id="workint" class="work-ov">
				' id="workint"', '</div>').between('>'))
			});

			// console.log(work_data);
			return work_data;
		},
		get_chapter_list : function(work_data, html, get_label) {
			html = html.between('<div class="cy_plist', '</div>')
			// mobile version: <div id="list">
			// <ul class="Drama autoHeight" id="mh-chapter-list-ol-0">
			// 88bag.js: <div id="list" >
			|| html.between('<div id="list"', '</ul>');
			// console.log(html);

			/**
			 * <code>
			76.js: <li><a target="_blank" href="/chuanyue/tangyinzaiyijie/351280.html"><p>杀手唐寅</p><i></i></a></li>
			</code>
			 */
			var matched, PATTERN_chapter =
			// matched: [ all, url, inner ]
			/<li><a [^<>]*?href="([^<>"]+)"[^<>]*>([\s\S]+?)<\/li>/g;

			work_data.chapter_list = [];
			while (matched = PATTERN_chapter.exec(html)) {
				var chapter_data = {
					url : matched[1],
					title : get_label(matched[2])
				};
				work_data.chapter_list.push(chapter_data);
			}
			// PC version, mobile version 共通
			work_data.chapter_list.reverse();
			// console.log(work_data.chapter_list);
		},

		parse_chapter_data : function(html, work_data, get_label, chapter_NO) {
			// modify from mh160.js
			// console.log(html);

			var chapter_data = html.between('qTcms_S_m_murl_e="', '"');
			// console.log(chapter_data);
			if (chapter_data) {
				// 對於非utf-8編碼之中文，不能使用 atob()
				// e.g., http://www.aikanmh.cn/xuanhuan/zhutianji/499631.html
				chapter_data = base64_decode(chapter_data)
						.split("$qingtiandy$");
			}
			if (!Array.isArray(chapter_data)) {
				library_namespace.warn({
					// gettext_config:{"id":"unable-to-parse-chapter-data-for-«$1»-§$2"}
					T : [ '無法解析《%1》§%2 之章節資料！', work_data.title, chapter_NO ]
				});
				return;
			}
			// console.log(chapter_data);
			// console.log(JSON.stringify(chapter_data));
			// console.log(chapter_data.length);
			// library_namespace.set_debug(6);

			// e.g., http://m.88bag.net/rexue/zuomeigongyu/36279.html
			// @see
			// http://m.88bag.net/template/wap1/css/d7s/js/show.20170501.js?20190722091626
			if (chapter_data.length === 1
					&& /^(--|\+)https?:\/\//.test(chapter_data[0])) {
				chapter_data = {
					limited : chapter_data[0].startsWith('+') ? '对不起,该章节已经下架!!本站仅提供检索服务,请尊重作品版权'
							: '请点击下方链接开始观看本期漫画：' + chapter_data[0].slice(2)
				};
				return chapter_data;
			}

			// 設定必要的屬性。
			chapter_data = {
				image_list : chapter_data.map(function(url) {
					// 2019/10/20: 採用 base64_decode() 取代 atob() 後，
					// aikanmh 不可再 encodeURI()。
					// url = encodeURI(url);

					// 获取当前图片 function f_qTcms_Pic_curUrl_realpic(v)
					// http://www.xatxwh.com/template/skin1/css/d7s/js/show.20170501.js?20190117082944

					// f_qTcms_Pic_curUrl() → f_qTcms_Pic_curUrl_realpic(v) @
					// http://www.nokiacn.net/template/skin2/css/d7s/js/show.20170501.js?20180805095630

					if (this.for_each_image) {
						// 733dm.js
						// for_each_image:function(url,parameters,base64_encode){return(url);}
						url = this.for_each_image(url, {
							qTcms_S_m_id : html
									.between('qTcms_Pic_m_if="', '"'),
							qTcms_S_p_id : html.between('qTcms_S_p_id="', '"')
						}, base64_encode);
					} else if (url.startsWith('/')) {
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
						url = (this.qTcms_m_indexurl
						// this.qTcms_m_indexurl: e.g., 517.js
						|| html.between('qTcms_m_indexurl="', '"') || '/')
								+ "statics/pic/?p="
								+ escape(url)
								+ "&picid="
								+ html.between('qTcms_S_m_id="', '"')
								+ "&m_httpurl="
								+ escape(base64_decode(html.between(
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

	// http://www.aikanmh.cn/template/skin1/css/d7s/js/show.20170501.js?20191014154954
	function utf8_decode(str_data) {
		var tmp_arr = [], i = 0, ac = 0, c1 = 0, c2 = 0, c3 = 0;
		str_data += '';
		while (i < str_data.length) {
			c1 = str_data.charCodeAt(i);
			if (c1 < 128) {
				tmp_arr[ac++] = String.fromCharCode(c1);
				i++;
			} else if ((c1 > 191) && (c1 < 224)) {
				c2 = str_data.charCodeAt(i + 1);
				tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6)
						| (c2 & 63));
				i += 2;
			} else {
				c2 = str_data.charCodeAt(i + 1);
				c3 = str_data.charCodeAt(i + 2);
				tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12)
						| ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return tmp_arr.join('');
	}

	// 對於非utf-8編碼之中文，不能使用 atob()
	function base64_decode(data) {
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, dec = "", tmp_arr = [];
		if (!data) {
			return data;
		}
		data += '';
		do {
			h1 = b64.indexOf(data.charAt(i++));
			h2 = b64.indexOf(data.charAt(i++));
			h3 = b64.indexOf(data.charAt(i++));
			h4 = b64.indexOf(data.charAt(i++));
			bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
			o1 = bits >> 16 & 0xff;
			o2 = bits >> 8 & 0xff;
			o3 = bits & 0xff;
			if (h3 == 64) {
				tmp_arr[ac++] = String.fromCharCode(o1);
			} else if (h4 == 64) {
				tmp_arr[ac++] = String.fromCharCode(o1, o2);
			} else {
				tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
			}
		} while (i < data.length);
		dec = tmp_arr.join('');
		dec = utf8_decode(dec);
		return dec;
	}

	// ------------------------------------------

	function utf8_encode(argString) {
		var string = (argString + '');
		var utftext = "";
		var start, end;
		var stringl = 0;
		start = end = 0;
		stringl = string.length;
		for (var n = 0; n < stringl; n++) {
			var c1 = string.charCodeAt(n);
			var enc = null;
			if (c1 < 128) {
				end++;
			} else if (c1 > 127 && c1 < 2048) {
				enc = String.fromCharCode((c1 >> 6) | 192)
						+ String.fromCharCode((c1 & 63) | 128);
			} else {
				enc = String.fromCharCode((c1 >> 12) | 224)
						+ String.fromCharCode(((c1 >> 6) & 63) | 128)
						+ String.fromCharCode((c1 & 63) | 128);
			}
			if (enc !== null) {
				if (end > start) {
					utftext += string.substring(start, end);
				}
				utftext += enc;
				start = end = n + 1;
			}
		}
		if (end > start) {
			utftext += string.substring(start, string.length);
		}
		return utftext;
	}

	// btoa()
	function base64_encode(data) {
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = "", tmp_arr = [];
		if (!data) {
			return data;
		}
		data = utf8_encode(data + '');
		do {
			o1 = data.charCodeAt(i++);
			o2 = data.charCodeAt(i++);
			o3 = data.charCodeAt(i++);
			bits = o1 << 16 | o2 << 8 | o3;
			h1 = bits >> 18 & 0x3f;
			h2 = bits >> 12 & 0x3f;
			h3 = bits >> 6 & 0x3f;
			h4 = bits & 0x3f;
			tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3)
					+ b64.charAt(h4);
		} while (i < data.length);
		enc = tmp_arr.join('');
		switch (data.length % 3) {
		case 1:
			enc = enc.slice(0, -2) + '==';
			break;
		case 2:
			enc = enc.slice(0, -1) + '=';
			break;
		}
		return enc;
	}

	// --------------------------------------------------------------------------------------------

	function new_qTcms2017_comics_crawler(configuration) {
		var using_configuration = Object.clone(default_configuration);

		if (configuration.using_web_search) {
			Object.assign(using_configuration, {
				search_URL : using_configuration.search_URL_web,
				parse_search_result :
				//
				using_configuration.parse_search_result_web,
				id_of_search_result : null,
				title_of_search_result : null
			});
		} else if (configuration.is_mobile === undefined) {
			using_configuration.is_mobile = configuration.base_URL
					.includes('://m.');
			if (using_configuration.is_mobile) {
				Object.assign(using_configuration, {
					search_URL : using_configuration.search_URL_mobile,
					parse_search_result :
					//
					using_configuration.parse_search_result_mobile,
					title_of_search_result :
					//
					using_configuration.title_of_search_result_mobile
				});
			}
		}

		// 每次呼叫皆創建一個新的實體。
		return new library_namespace.work_crawler(Object.assign(
				using_configuration, configuration));
	}

	return new_qTcms2017_comics_crawler;
}
