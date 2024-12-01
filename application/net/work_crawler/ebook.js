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
		no_extend : 'this,*',

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

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	// --------------------------------------------------------------------------------------------

	// 在下載/獲取小說章節內容的時候，若發現有章節被目錄漏掉，則將之補上。

	// 通常應該會被 parse_chapter_data() 呼叫。
	function check_next_chapter(work_data, chapter_NO, html,
			PATTERN_next_chapter) {
		// /下一[章页][：: →]*<a [^<>]*?href="([^"]+.html)"[^<>]*>/
		var next_url = html && html.match(PATTERN_next_chapter ||
		// PTCMS default. e.g., "下一章 →" /下一章[：: →]*/
		// PATTERN_next_chapter: [ all, next chapter url ]
		/**
		 * <code>
		<a href="//read.qidian.com/chapter/abc123">下一章</a>

		https://www.fxnzw.com/fxnread/45100_8000445.html
		<a hidefocus href="/fxnread/45100_8000446.html" title="第二章 正一宗 最仙遊">【下一章】</a>
		</code>
		 */
		/ href=["']([^<>"']+)["'][^<>]*>(?:<button[^<>]*>)?【?下一[章页]/);
		// console.log(chapter_NO + ': ' + next_url[1]);

		if (!next_url)
			return;

		// 去掉開頭的 "./"。
		next_url = new library_namespace.URI(next_url[1],
		// TODO: {Array}this.chapter_URL()
		this.chapter_URL(work_data, chapter_NO).replace(/[^\/]+$/, ''))
				.toString();
		if (!next_url
		// https://www.xiaoshubao.net/read/463699/713.html 我的超能力每周刷新 新书计划！
		// <a href="javascript:alert('已经是最后一章了');">下一章</a>
		|| next_url.startsWith('javascript:')) {
			return;
		}

		var full_next_url = this.full_URL(next_url),
		//
		next_chapter = work_data.chapter_list[chapter_NO],
		// chapter_data.url
		next_chapter_url = next_chapter && next_chapter.url;

		if (next_chapter_url && !next_chapter_url.startsWith('/')
		// e.g., '123.htm', '123/123.htm'
		&& !next_chapter_url.includes('://')) {
			next_chapter_url = this.chapter_URL(work_data, chapter_NO).replace(
					/[^\/]*$/, next_chapter_url);
		}

		if (false) {
			console.trace([ full_next_url, work_data.url, next_chapter_url,
					this.full_URL(next_chapter_url) ]);
		}
		if (full_next_url === work_data.url
		// 許多網站會把最新章節的下一頁設成章節列表，因此必須排除章節列表的網址。
		|| full_next_url === work_data.chapter_list_URL
		// 有些在目錄上面的章節連結到了錯誤的頁面，只能靠下一頁來取得正確頁面。
		|| full_next_url === this.full_URL(next_chapter_url)) {
			return;
		}

		if (false) {
			// 不採用插入的方法，直接改掉下一個章節。
			library_namespace.info(library_namespace.display_align([
			// gettext_config:{"id":"chapter-$1"}
			[ gettext('章節編號%1：', chapter_NO), next_chapter_url ],
					[ '→ ', next_url ] ]));
			next_chapter.url = next_url;
		}

		if (work_data.chapter_list.some(function(chapter_data) {
			return chapter_data.url === next_url
					|| chapter_data.url === full_next_url;
		})) {
			// url 已經在 chapter_list 裡面。
			return;
		}

		var this_chapter_data = work_data.chapter_list[chapter_NO - 1];
		var message = [ 'check_next_chapter: ', {
			// gettext_config:{"id":"insert-a-chapter-url-after-chapter-$1-$2"}
			T : [ 'Insert a chapter url after chapter %1: %2', chapter_NO
			//
			+ (this_chapter_data && this_chapter_data.url
			//
			? ' (' + this_chapter_data.url + ')' : ''),
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

		// 動態插入章節。
		var chapter_data_to_insert = {
			// title : '',
			url : next_url
		};
		// Copy attributes
		[ 'part_title' ].forEach(function(key) {
			var value = this_chapter_data[key];
			if (value)
				chapter_data_to_insert[key] = value;
		});
		work_data.chapter_list.splice(chapter_NO, 0, chapter_data_to_insert);
		// 重新設定章節數量。
		work_data.chapter_count = work_data.chapter_list.length;
		return true;
	}

	// --------------------------------------------------------------------------------------------
	// 本段功能須配合 CeL.application.storage.EPUB 並且做好事前設定。
	// 可參照 https://github.com/kanasimi/work_crawler

	// extract "繁簡轉換 cache.7z" or "繁簡轉換 cache.zip"
	function extract_convert_cache_directory(work_data) {
		var cache_directory = work_data.convert_options.cache_directory
				.replace(/[\\\/]$/, '');
		if (library_namespace.directory_exists(cache_directory)) {
			library_namespace.info('extract_convert_cache_directory: '
			// 語言轉換 TAG_text_converted
			// gettext_config:{"id":"overwrite-the-files-in-the-cache-directory-$1-for-traditional-and-simplified-chinese-conversions"}
			+ gettext('將覆寫繁簡中文轉換快取目錄 [%1] 中的檔案。', cache_directory));
		}

		var cache_archive_file = cache_directory + '.7z';
		if (!library_namespace.file_exists(cache_archive_file)
				&& !library_namespace.file_exists(
				//
				cache_archive_file = cache_directory + '.zip')) {
			return;
		}

		cache_archive_file = new library_namespace.storage.archive(
				cache_archive_file);
		return new Promise(function(resolve, reject) {
			library_namespace.log_temporary({
				// gettext_config:{"id":"decompress-the-cache-files-for-traditional-and-simplified-chinese-conversions-$1"}
				T : [ '解壓縮繁簡中文轉換快取檔案：[%1]。',
						cache_archive_file.archive_file_path ]
			});
			cache_archive_file.extract({
				// 解壓縮 "!short_sentences_word_list.json" 時會跳出 prompt。
				yes : true,
				output : work_data.directory
			}, function(data, error) {
				error ? reject(error) : resolve(data);
			});
		});
	}

	function archive_convert_cache_directory(work_data) {
		var cache_directory = work_data.convert_options.cache_directory
				.replace(/[\\\/]$/, '');
		var cache_archive_file = cache_directory + '.7z';

		// 若無新的繁簡轉換資訊，不動到原先的壓縮檔。
		// 一般來說不需要: 沒新檔案時，7zip 本來就不會更新壓縮檔。
		if (this.leave_convert_cache_file_alone_when_no_news) {
			var new_convert_cache_file_count = work_data.new_convert_cache_file_count;
			delete work_data.new_convert_cache_file_count;
			// console.trace(new_convert_cache_file_count);
			if (!new_convert_cache_file_count) {
				// console.trace(cache_directory);
				// TODO: Only remove files in the archive file.
				library_namespace.remove_directory(cache_directory, true);
				return;
			}
		}

		cache_archive_file = new library_namespace.storage.archive(
				cache_archive_file);
		return new Promise(function(resolve, reject) {
			library_namespace.log_temporary({
				// gettext_config:{"id":"compress-the-cache-files-for-traditional-and-simplified-chinese-conversions-$1"}
				T : [ '壓縮繁簡中文轉換快取檔案：[%1]。',
						cache_archive_file.archive_file_path ]
			});
			cache_archive_file.update(cache_directory, {
				only_when_newer_exists : 'file',
				level : 'max',
				remove : true,
				recurse : true
			}, function(data, error) {
				error ? reject(error) : resolve(data);
			});
		});
	}

	// ----------------------------------------------------

	/**
	 * <code>

	內文的標題更為完整。
	https://www.69shuba.com/txt/47114/32996074	第265章 夫君，我们去钓鱼嘛~感动的凤眠，莫比乌斯环？韩厉与圆鼎器灵

	包含特殊字元，但標題與內文的標題同樣完整。
	https://www.69shuba.com/txt/39164/26818931	第124章 【骨魔】（求订阅~）

	https://www.69shuba.com/txt/51594/33701770	请公子斩妖 第240章 封口费 【感谢“春江花月夜&nbsp;&nbsp;”的盟主】
	第240章 封口费 【感谢“春江花月夜&emsp;”的盟主】

	https://www.69shuba.com/txt/51594/33706686	请公子斩妖 第767章 小朋友 【感谢“长安”的盟主打赏】
	&emsp;&emsp;第767章 小朋友 【感谢“长々安”的盟主打赏】

	https://www.69shuba.com/txt/51594/33707465	请公子斩妖 第848章 无名古佛 【感谢“wangyao023”的盟主打赏】
	&emsp;&emsp;第848章 无名古佛 【感谢“wangyao-023”的盟主打赏】

	https://www.piaotian.com/html/14/14431/10164343.html	道诡异仙 第434章 北风
	&nbsp;&nbsp;&nbsp;&nbsp;第434章 北风

	https://www.piaotian.com/html/9/9051/5938845.html	超神机械师 011 天若有情天亦老，我为萧哥***

	https://www.piaotian.com/html/14/14431/10565524.html	道诡异仙 第1027章 番外1 感谢白银盟主（李火旺0402生
	&nbsp;&nbsp;&nbsp;&nbsp;第1027章 番外1 感谢白银盟主（李火旺0402生日快乐）的打赏。<br/><br/>

	https://www.69xinshu.com/txt/47093/34685221	我爲長生仙 > 第385章 吾名泰一！
	&emsp;&emsp;第385章 吾名——泰一！

	https://www.69xinshu.com/txt/47093/35513904	我为长生仙 > 第516章 真娲皇之子！（三更求月票）
	&emsp;&emsp;第516章 真·娲皇之子！（三更求月票）

	https://www.69shu.pro/txt/42242/28563223	如此堕怠，怎能成仙 > 第12章 你穿越到了修真世界，前方有一道悬崖，你选择：跳/不跳
	&emsp;&emsp;第12章 你穿越到了修真世界，前方有一道悬崖，你选择：跳不跳

	https://www.piaotia.com/html/15/15579/11116769.html	我在田宗剑道成仙 第140章 最难甚解（加2）
	&nbsp;&nbsp;&nbsp;&nbsp;第140章 __最难甚解（加2）<br /><br />

	https://www.piaotia.com/html/15/15579/11117183.html	我在田宗剑道成仙 第554章 鉴天镜地书姜思白
	&nbsp;&nbsp;&nbsp;&nbsp;第554章 鉴天镜+地书+姜思白<br /><br />

	https://69shuba.cx/txt/52895/34488506	别人練級我修仙，苟到大乘再出山 > 第99章 人生模拟器30版本，新一批的能量介质！
	第99章 人生模拟器3.0版本，新一批的能量介质！

	https://69shuba.cx/txt/52895/34767212	别人练级我修仙，苟到大乘再出山 > 159.第157章 顶级嘲讽，小小的也很可爱哦（5k）
	第157章 顶级嘲讽，小小的也很可爱哦!（5k）

	</code>
	 */
	/** {RegExp}標題中的特殊字元。 */
	trim_start_title.PATTERN_special_chars = /[~\/+!\-—々·\s_.]|&nbsp;|&emsp;/g;
	/** {RegExp}非內容。例如空白字元或HTML標籤。 */
	trim_start_title.PATTERN_non_content = /<\/?\w[^<>]*>|\s+/g;
	/** {RegExp}搜尋新行新段落用。 */
	trim_start_title.PATTERN_new_line = /<br(?:[\s\/][^<>]*)?>|\n|<\/?p(?:\s[^<>]*)?>/i;

	// 當文章內文以章節標題起始時，去除一開始重複的章節標題。
	function trim_start_title(text, chapter_data) {
		// const
		var title;
		if (chapter_data.title) {
			title = chapter_data.title;
		} else if (typeof chapter_data === 'string' && chapter_data) {
			title = chapter_data;
		} else {
			return text;
		}
		if (false && !/第.+章/.test(title)) {
			console.trace(chapter_data);
			return text;
		}

		// old method
		if (false) {
			text = text.replace(new RegExp(/^(?:&nbsp;|\s)*/.source
					+ library_namespace.to_RegExp_pattern(title)
					+ /\s*(?:<br(?:[\s\/][^<>]*)?>)+/.source), '');
		}

		/** {Number}第一行結束的index @ text。 */
		var first_line_end_index = 0;
		/** {String}第一行的內容。 */
		var first_line;
		// 採用 first_line 這個麻煩的方法是為了盡量減少計算 index 的消耗。
		while (true) {
			var _first_line_end_index = text.slice(first_line_end_index)
					.search(trim_start_title.PATTERN_new_line);
			if (_first_line_end_index === NOT_FOUND) {
				// 去掉最先頭的空白字元後，所有內容只剩一行。
				first_line_end_index = text.length;
				first_line = text;
				break;
			}
			if (_first_line_end_index === 0) {
				first_line_end_index++;
				continue;
			}
			first_line_end_index += _first_line_end_index;
			first_line = text.slice(0, first_line_end_index);
			if (first_line.replace(trim_start_title.PATTERN_non_content, '') !== '')
				break;
			if (false) {
				console.trace([ 'first_line 僅含有空白字元。', first_line,
						first_line_end_index, _first_line_end_index ]);
			}
		}

		var special_chars_count = 0, full_title;
		var title_start_index = first_line.indexOf(title);
		var new_text;

		if (title_start_index === NOT_FOUND) {
			var matched = title.match(/(第.+章)([\s_]+)/);
			if (matched && first_line.includes(matched[1])) {
				// e.g., https://www.piaotia.com/html/15/15301/10626057.html
				// title: "第1章 山下少年",
				// first_line: "\n&nbsp;&nbsp;&nbsp;&nbsp;第1章山下少年"
				// 內文中的標題去掉了空白字元。
				new_text = text.replace(matched[1], matched[0]);
				first_line = first_line.replace(matched[1], matched[0]);
				first_line_end_index += matched[2].length;
				// re-check
				title_start_index = first_line.indexOf(title);
			}
		}
		// console.trace([ title, title_start_index, first_line ]);

		if (title_start_index === NOT_FOUND) {
			// assert: 第一行不包含與 title 完全相同之標題。

			var first_line_trimmed = first_line.replace(
					trim_start_title.PATTERN_special_chars, '');
			special_chars_count = first_line.length - first_line_trimmed.length;
			// assert: special_chars_count >= 0
			if (special_chars_count === 0) {
				// 第一行不含有特殊字元。
				// ** 不檢查標題比起內文標題更為完整的情況。
				return text;
			}

			// 標題 → 去除特殊字元後的標題。
			var title_trimmed = title.replace(
					trim_start_title.PATTERN_special_chars, '');
			title_start_index = first_line_trimmed.indexOf(title_trimmed);
			if (false) {
				console.trace([ title_trimmed, title_start_index,
						first_line_trimmed ]);
			}
			if (title_start_index === NOT_FOUND) {
				// 第一行不包含去除特殊字元後的標題。
				// 正文不以標題起始。
				return text;
			}

			full_title = first_line.slice(title_start_index, title_start_index
					+ title_trimmed.length + special_chars_count);
			if (full_title.replace(trim_start_title.PATTERN_special_chars, '') !== title_trimmed) {
				// 正文標題前後尚有特殊符號?
				// e.g., first_line.slice(0, title_start_index)
				// !== first_line_trimmed.slice(0, title_start_index)
				return text;
			}

			// 正文以標題加上特殊符號起始的情況。
		}

		// ----------------------------

		/** {String}標題之前的內容。 */
		var content_before_title = library_namespace.HTML_to_Unicode(first_line
				.slice(0, title_start_index));
		content_before_title = content_before_title.replace(
				trim_start_title.PATTERN_non_content, '');
		// console.trace([ content_before_title ]);

		// 正文標題前面還有東西就不去除。
		if (content_before_title)
			return text;

		// ----------------------------

		// 正文以標題起始的一般情況。
		var content_after_title = first_line.slice(title_start_index
				+ (full_title || title).length);
		// console.trace([ content_after_title ]);

		/**
		 * <code>

		https://www.piaotian.com/html/5/5982/3239153.html	随波逐流之一代军师 外传 清梵曲
		&nbsp;&nbsp;&nbsp;&nbsp;清梵曲作者：加兰<br/><br/>

		</code>
		 */
		if (content_after_title.includes('作者')) {
			return text;
		}

		/**
		 * <code>

		https://www.quanben5.com/n/wanming/11557.html	晚明 第九章 秦淮渔唱
		<p>第九章秦淮渔唱末更的钟鼓声远远传来，陈新精神抖擞的早早起床，

		</code>
		 */
		// /[\u4e00-\u9fa5]/: 匹配中文字 RegExp。
		if (/^.*?[，。！]/.test(content_after_title)) {
			return text;
		}

		if (content_after_title) {
			// console.trace([ full_title, title, content_after_title ]);
			full_title = (full_title || title) + content_after_title;
		}

		// ----------------------------

		if (full_title && (full_title = full_title.trim())
				&& full_title !== title && chapter_data.title === title) {
			chapter_data.title = library_namespace.HTML_to_Unicode(full_title)
					.trim()
					// 取單一空白即可。
					.replace(/(第.+章)((\s)[\s_]+)/, '$1$3');
			if (title.covers(chapter_data.title)) {
				// title 比 full_title 更完整。
				chapter_data.title = title;
			} else {
				library_namespace.log(library_namespace.display_align([
				// @see gettext_config:{"id":"work_data.chapter_title"}
				[ gettext('章節標題：'), JSON.stringify(title) ],
				// 第一行包含完整標題，改成完整標題。
				[ '→', JSON.stringify(chapter_data.title) ] ]));
			}
			// title = full_title;
		}

		if (false && title.includes('—')) {
			console.trace([ full_title, title, title_start_index, first_line,
					content_before_title, content_after_title ]);
		}
		if (!new_text)
			new_text = text;
		if (!full_title)
			full_title = title;
		// new_text 可能以空白字元、<br />、<p> 起始，因此需要重新計算 index。
		// e.g., https://www.69xinshu.com/txt/47093/34685221
		title_start_index = new_text.indexOf(full_title);
		if (!(title_start_index >= 0)) {
			throw new Error('trim_start_title: Text not includes title ['
					+ full_title + ']: ' + new_text.slice(0, 200));
		}
		// 切掉 full_title。
		new_text = new_text.slice(title_start_index + full_title.length);
		/**
		 * <code>

		https://www.quanben5.com/n/huidaoshangouquzhongtian/26783.html	回到山沟去种田 第一章 辞职
		<p>第一章辞职</p><p>“老天爷！你是不是要这样玩我！”</p>

		</code>
		 */
		new_text = new_text
				.replace(/^(?:\s*<(\w)+>\s*<\/(\1)>)*\s*<\/\w+>/, '');
		if (false && title.includes('—')) {
			console.trace([ title_start_index, new_text.slice(0, 200) ]);
		}

		return new_text;
	}

	// text = CeL.work_crawler.trim_start_title(text, chapter_data);
	Work_crawler.trim_start_title = trim_start_title;

	// --------------------------------------------------------------------------------------------

	/**
	 * 回復網路小說一般性的被審核屏蔽文字。去除一般性敏感文字審查及過濾功能 censorship, censored text。 Calling
	 * inside parse_chapter_data()
	 * 
	 * @example<code>
	text = CeL.work_crawler.fix_general_censorship(text);
	</code>
	 */
	function fix_general_censorship(text) {
		text = text

		/**
		 * <code>

		// https://www.piaotian.com/html/13/13793/9355310.html	我只想安静的做个苟道中人 第一百七十六章：你想要什么？（第一更！求订阅！）
		艹亻尔女马的郑荆山！
		扌喿扌喿扌喿！！！
		// avoid: "那位少女馬上眼前一亮"	劍仙三千萬-第六十六章武宗

		// https://www.piaotian.com/html/13/13793/9355285.html	我只想安静的做个苟道中人 第一百五十一章：厉仙子的大长腿。（第二更！求订阅！）
		艹亻也女马白勺！

		// https://www.piaotian.com/html/13/13793/9355452.html	我只想安静的做个苟道中人 第四十八章：再来一次。（第四更！求订阅！）
		接着就开始被厉师姐采衤卜……

		// https://www.piaotian.com/html/13/13793/9355454.html	我只想安静的做个苟道中人 第五十章：太刺激了。（第一更！求订阅！）
		这是要在光天化日之下里予占戈？

		</code>
		 */
		.replace(/(艹|扌喿)?(亻尔|亻也)女马(白勺)?/g, function(all, 操, 你他, 的) {
			// [[wikt:zh:肏你媽]]
			return (操 ? '操' : '') + (你他 === '亻尔' ? '你' : '他') + '妈'
			//
			+ (的 ? '的' : '');
		}).replace(/亻尔/g, '你').replace(/扌喿/g, '操')
		// 采衣卜 采衤卜
		.replace(/采[衣衤]卜/g, '採补').replace(/衤卜/g, '补').replace(/里予占戈/g, '野战')
		//
		.replace(/米青丬士/g, '精壮').replace(/口申口今/g, '呻吟').replace(/月几月夫/g, '肌肤')
		// 那月匈……
		.replace(/那月匈/g, '那胸')
		// 孚乚汁
		.replace(/酉禾月匈/g, '酥胸').replace(/酉禾孚乚/g, '酥乳').replace(/孚乚/g, '乳')
		// 谷欠念 谷欠望 情谷欠
		.replace(/谷欠([念望])/g, '欲$1').replace(/([情])谷欠/g, '$1欲')
		// 冫夌辱
		.replace(/冫夌/g, '凌')
		// 忄青趣
		.replace(/忄青/g, '情')
		// 女干氵?掳掠
		.replace(/女干氵\??/g, '奸淫')
		// 女干情 禁女干乱 女干夫氵女彐
		.replace(/女干([情乱夫])/g, '奸$1')
		// 女干夫氵女彐
		.replace(/氵\??女彐/g, '淫婦')
		// http://www.shuyy8.cc/read/43486/27152132.html 我在修仙界长生不死 第四百二十六章 建元隆庆
		// 大忠似女干，大女干似忠，
		.replace(/大忠似女干/g, '大忠似奸').replace(/大女干似忠/g, '大奸似忠')
		// 钅肖魂入骨
		.replace(/钅肖魂/g, '销')
		// 忄夬感
		.replace(/忄夬/g, '快')
		// 衤果体 衤果露
		.replace(/衤果/g, '裸')

		/**
		 * <code>

		// https://www.piaotian.com/html/13/13793/10232511.html	我只想安静的做个苟道中人 第四十一章：龙后有赏！（四合一大章！求订阅！）
		沦落到在整个大地上东躲xz，
		// http://www.shuyy8.cc/read/43486/27152005.html	我在修仙界长生不死 第二百九十四章 左右逢源
		元婴魔君任凭怎么东躲XZ，

		</code>
		 */
		.replace(/东躲xz/ig, '东躲西藏')

		// 被无尽虚空的混乱力量绞杀，
		.replace(/混\*{2}力量/g, '混乱力量')

		/**
		 * <code>

		// 肉眼凡胎
		// https://www.piaotian.com/html/14/14229/9757030.html	修仙三百年突然发现是武侠 第一百二十五章 飞剑千里取人头
		我渡法马上就要彻底蜕去这**凡胎，成就罗汉金身了！

		被无尽虚空的混乱力量绞杀，
		乱

		</code>
		 */
		.replace(/([^*])\*{2}(力量|凡胎)/g, '$1肉体$2')

		/**
		 * <code>

		// https://www.piaotian.com/html/14/14229/9785496.html	修仙三百年突然发现是武侠 第一百四十八章 心魔蛊惑，恭请九火炎龙！
		意味着这个猜测**不离十。

		</code>
		 */
		.replace(/([^*])\*{2}不离十/g, '$1八九不离十')
		/**
		 * <code>

		// https://www.ptwxz.com/html/6/6682/3851642.html	最仙遊 正文 第一百二十六章 强敌 （谢盟更之一）
		其所说十有*为真。

		</code>
		 */
		.replace(/十有\*{1,2}([^*])/g, '十有八九$1')

		// 赤裸裸
		.replace(/\*{2,4}裸/g, '赤裸裸').replace(/赤\*{2,4}/g, '赤裸裸')

		// 有心血来潮示警。
		.replace(/心血\*{2,4}/g, '心血来潮')

		// 真会阴沟里翻船
		.replace(/\*{2,4}沟里/g, '会阴沟里')

		/**
		 * TODO<code>

		// https://www.quanben5.com/n/gouzaixianwuquqichangsheng/10.html	《苟在仙武娶妻长生》第010章 照顾师兄妻女
		// https://www.quanben5.com/n/sutongxiuxian_/82.html	速通修仙！ 第八十二章 怎么，你不服气吗
		// https://www.quanben5.com/n/sutongxiuxian_/76.html	速通修仙！ 第七十六章 杀魔女，踩剑仙
		在云床上大笑了起来

		</code>
		 */
		.replace(/(躺在|躺到|[病云])\*{2,4}/g, '$1床上')

		// 还是成圣的诱惑太大了。 女儿国国王的诱惑再大，
		.replace(/\*{2,4}(太大|再大)/g, '诱惑$1')

		// 电流向四面八方激射，精准连接到天花板、
		.replace(/激\*{3}准/, '激射，精准')

		/**
		 * TODO<code>

		// 板荡识诚臣
		荡

		// 很有诱惑力。
		诱惑
		// 以大法力睁开天眼，
		大法
		// 造个竞技场不就能让他们发泄精力吗，
		泄精

		更是将战火推到了最高潮。
		战争刚刚开始，便已经进入高潮。
		高潮

		这次轮到季长生的眼角狠狠抽动了一下。
		抽动

		才能长驱直入，
		长驱直入

		猛男

		季长生欣慰的看了曹子铭一眼，感觉自己果然调教有方。
		燃灯确实调教出了一个好妖怪。
		调教

		看到眼前不出意外的骚动，
		骚动

		这个就叫做爱情的信任。
		做爱

		但还要有面对种种突发情况随机应变的能力，
		发情

		李嫦曦一拍自己修长的玉腿，
		玉腿

		// https://www.quanben5.com/n/gouzaixianwuquqichangsheng/8.html	《苟在仙武娶妻长生》第008章 老祖又又纳妾了
		人**满
		人口爆满

		大罗强者无需正常交合，
		否则怎么刚好卡死让她和季长生只是神魂交合？
		交合

		也未必需要繁衍交欢，
		交欢

		但还要有面对种种突发情况随机应变的能力，
		发情

		而且他自忖既然季长生已经被曹孟德叫破身份，
		破身

		很有可能会阴沟里翻船
		会阴

		太阴道友此来何意？
		阴道

		都是王母娘娘的命根子。
		命根子

		肯定已经在和三葬法师颠鸾倒凤了。
		颠鸾倒凤

		菊花厂的工程师看到了都得流泪。
		菊花

		还那么……风骚，
		风骚

		眼眸深处却闪过赤裸裸的欲望。
		欲望

		迷魂烟可曾带着。
		迷魂

		</code>
		 */

		// 淫威 淫邪
		.replace(/([^*])\*{2}([威邪])/g, '$1淫$2')
		// 荒淫无道
		.replace(/([荒])\*{2}/g, '$1淫')
		// 富贵不能淫
		.replace(/(富贵不能)\*{2}/g, '$1淫')
		// 奸夫淫妇
		.replace(/奸夫\*{2}妇/g, '奸夫淫妇')
		// 贪淫乐祸

		// 真武荡魔
		.replace(/真武\*{1,2}魔/g, '真武荡魔')
		// 荡漾 荡平 荡尽天下不平事 荡魔杵 倾家荡产
		.replace(/([^*])\*{2}([漾平尽产]|魔杵|然无存)/g, '$1荡$2')
		// 坦坦荡荡
		.replace(/(空|浩浩|坦坦)\*{2,4}/g, '$1荡荡')
		// 回荡 震荡
		.replace(/([回坦震晃扫激涤浩闯游飘])\*{2}/g, '$1荡')
		// 赤诚坦荡 风流浪荡 前些天正好出现过浪**涌之相，
		.replace(/浪\*{2}([^涌])/g, '浪荡$1')
		// 能惊动大法师的， 但平白请动大法师，
		// 大法
		// 这里不再那条不敢乱动乱拿规矩的范畴之内了，
		// 这里不再那条不敢**动**拿规矩的范畴之内了，
		// 同时发动欲望能力干扰射击。
		// 欲望
		.replace(/([^惊发请*]动)\*{2}/g, '$1荡')
		// 低低凹凹随流荡，

		;

		return text;
	}

	Work_crawler.fix_general_censorship = fix_general_censorship;

	var PATTERN_AD_cfwx
	/**
	 * <code>

	// xshuyaya.js
	http://www.shuyy8.com/read/1242/1276110.html
	<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;看最仙遊最新章节到长风文学
	http://www.shuyy8.com/read/1242/1276134.html
	<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;｜长｜风｜文学 [c][f][w][x].net<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;
	http://www.shuyy8.com/read/1242/1276125.html
	抓起手边血曜石就跑，**长**风**文学 女子吐口献血，
	http://www.shuyy8.com/read/1242/1276140.html
	而这两百人—长—风—文学 {c}{f}{w}{x}.net中，
	http://www.shuyy8.com/read/1242/1276147.html
	你们两位牛鼻子就;长;风;文学 cf＋在这里歇息片刻，
	http://www.shuyy8.com/read/1242/1276151.html
	我刚才长风文学<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;摸了什么……
	http://www.shuyy8.com/read/1242/1276152.html
	你需。长.风。文学 要做几件事。
	http://www.shuyy8.com/read/1242/1276155.html
	这？长？风？文学 cfwx. net才是林烦最大的优点。
	http://www.shuyy8.com/read/1242/1276163.html
	离开了木屋，—长—风—文学 {c}{f}{w}{x}.net回到迷雾之中。
	http://www.shuyy8.com/read/1242/1276167.html
	竹剑堂御剑一%长%风%文学　百单八口，
	http://www.shuyy8.com/read/1242/1276168.html
	三三＊长＊风＊文学 真人反问：
	http://www.shuyy8.com/read/1242/1276179.html
	我就先打《长〈风《文学　死你，
	http://www.shuyy8.com/read/1242/1276184.html
	入紫箫／长／风／文学 殿者，
	http://www.shuyy8.com/read/1242/1276237.html
	来此地［长][风］文学 斩妖除魔。
	http://www.shuyy8.com/read/1242/1276191.html
	五人｛长}{风｝文学 www{cf][wx}net用了隐身术从云端落下，
	http://www.shuyy8.com/read/1242/1276131.html
	没｀长｀风｀文学｀有神通，
	http://www.shuyy8.com/read/1242/1276134.html
	所以属于前者。”<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;｜长｜风｜文学 [c][f][w][x].net<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;“另外一种最厉害，
	http://www.shuyy8.com/read/1242/1276143.html
	在供奉们的要求之下&lt;长&gt;&lt;风&gt;文学 ，
	http://www.shuyy8.com/read/1242/1276156.html
	你和他单对单的话＝长＝风＝文学＝www＝cfwx＝net？

	// piaotian.js
	https://www.ptwxz.com/html/6/6682/3908558.html
	<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;!长!风!文学“来了。”天恒旗杀毒虫效率高，
	https://www.ptwxz.com/html/6/6682/3976684.html
	斜风子不能出现在十面埋～≯长～≯风～≯文～≯学，w⊥↓＋et伏中，
	https://www.ptwxz.com/html/6/6682/4007822.html
	不能怪6长6风6文6学，w↘□□et她，

	</code>
	 */
	= /([\u0020-\u00ff—＋＝。？＊《〈｛｝［］／｜｀～≯]*)长[\u0020-\u00ff—＋＝。？＊《〈｛｝［］／｜｀～≯]{0,20}风[\u0020-\u00ff—＋＝。？＊《〈｛｝［］／｜｀～≯]{0,20}文[\u0020-\u00ff—＋＝。？＊《〈｛｝［］／｜｀～≯]{0,20}学(?:，[\u0020-\u00ff—＋＝　⊥↓↘□]+?et|｀?[\u0020-\u00ff—＋＝　]*)/g;

	/**
	 * 去除網路小說的一般性廣告。 Calling inside parse_chapter_data()
	 * 
	 * @example<code>
	text = CeL.work_crawler.fix_general_ADs(text);
	</code>
	 */
	function fix_general_ADs(text) {
		text = text.replace(
		// <br(?:[\s\/][^<>]*)?>
		/(?:<br[^<>]*>)*(?:&nbsp;)*看[^\s\n<>]+?最新章节到[^\s\n<>]+?文学\s*/, '');

		text = text.replace(PATTERN_AD_cfwx, function(all, previous) {
			// 必須保留前面的換行。 e.g., http://www.shuyy8.com/read/1242/1276134.html
			var matched = previous.match(/[\s\S]+&nbsp;/);
			return matched ? matched[0] : '';
		});
		if (false) {
			// 长风文学网 http://www.cfwx.org/
			text = text.replace(/(..)长\1风\1文\1?学\s*/g, '').replace(
					/(.)长\1风\1文\1?学\s*/g, '');
		}

		/**
		 * <code>

		// xshuyaya.js
		http://www.shuyy8.cc/read/43486/27151902.html	我在修仙界长生不死 第一百九十五章 一剑断山
		<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;饭团看书<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;

		</code>
		 */
		text = text
				.replace(/(?:<br[^<>]*>)*(?:&nbsp;)*饭团看书(?=<br[^<>]*>)/g, '');

		/**
		 * <code>

		// xshuyaya.js
		// http://www.shuyyw.com/read/24334/16566634.html	苍青之剑 第十三章 小孩子听不懂大道理
		诺菈和埃莉诺的.asxs.就比你们高出不知道多少，

		// piaotian.js
		// https://www.ptwxz.com/html/14/14466/10115811.html	女主从书里跑出来了怎么办 第四百三十三章 复更
		你们都是住在.asxs.的吗？

		</code>
		 */
		text = text.replace(/\.asxs\./g, '起点');

		/**
		 * <code>

		// https://www.69shuba.com/txt/47114/31439934	苟在仙武娶妻长生 第1章 老祖又纳妾了
		&emsp;&emsp;(本章完)

		// https://www.69shuba.com/txt/51594/33699515	请公子斩妖 第1章 楚梁
		&emsp;&emsp;(本章完)
		<br /><br />

		// https://www.piaotia.com/html/12/12788/9021489.html	开局奖励一亿条命 第826章 逃得掉吗
		<br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;(本章完)<br/><br/>

		// https://www.xxbiquke.net/74_74304/39344627.html	仙人只想躺着 第一百七十二章云间临神州，威仪万万里。
		<p class="content_detail">
		(本章完)
		</p>

		</code>
		 */
		text = text.replace(
				/\(本章完\)(?:<br[^<>]*>|\s)*(<\/p>)?(?:<br[^<>]*>|\s)*$/, '$1');

		return text;
	}

	Work_crawler.fix_general_ADs = fix_general_ADs;

	// ----------------------------------------------------

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

	// gettext_config:{"id":"language-conversion"}
	var TAG_text_converted = '語言轉換';
	function create_ebook(work_data, options) {
		// var forced_recreate = options && options.forced_recreate;

		// 檢查 ebook 先備條件。 check_ebook_prerequisites
		var cecc = this.convert_text_language_using
				&& this.convert_text_language_using.cecc;
		// console.trace(cecc);
		if (cecc && cecc.load_text_to_check) {
			// console.trace(work_data);
			if (false && work_data.original_work_title
					&& work_data.title !== work_data.original_work_title) {
				library_namespace.warn('create_ebook: 標題變種:\n\t'
						+ work_data.title + '\n\t'
						+ work_data.original_work_title);
			}
			var promise_load_text_to_check = cecc.load_text_to_check({
				// 設定 work_title 可載入 watch_target.* 辭典修訂測試集。
				work_title : work_data.title,
				// input_title : work_data.input_title,
				// .original_work_title: 有些字典檔檔名以沒加料的作品名稱為準。
				original_work_title : work_data.original_work_title,
				convert_to_language : this.convert_to_language
			}, {
				reset : true
			});
			if (library_namespace.is_thenable(promise_load_text_to_check)) {
				// console.trace(promise_load_text_to_check);
				// 先初始化完畢後再重新執行。
				return promise_load_text_to_check.then(create_ebook.bind(this,
						work_data));
			}
		}

		work_data.convert_options = {
			work_title : work_data.title,
			original_work_title : work_data.original_work_title,
			// only for debug CeCC 繁簡轉換。
			cache_directory : library_namespace
					.append_path_separator(work_data.directory + '繁簡轉換 cache'),
			cache_file_for_short_sentences : true,

			// default (undefined) or 'word': 每個解析出的詞單獨作 zh_conversion。
			// 'combine': 結合未符合分詞辭典規則之詞一併轉換。converter 必須有提供輸入陣列的功能。
			// false: 按照原始輸入，不作 zh_conversion。
			forced_convert_mode : 'combine',

			// 檢查辭典檔的規則。debug 用，會拖累效能。
			// check_dictionary : true,

			// 不檢查/跳過通同字/同義詞，通用詞彙不算錯誤。用於無法校訂原始文件的情況。
			// skip_check_for_synonyms : true,

			// 超過此長度才創建個別的 cache 檔案，否則會放在 .cache_file_for_short_sentences。
			min_cache_length : 20
		};

		if (this.leave_convert_cache_file_alone_when_no_news) {
			work_data.new_convert_cache_file_count = 0;
			work_data.convert_options.before_save_cache_file = function(
					cache_file_path, content, is_short_sentences) {
				// console.trace(cache_file_path);
				work_data.new_convert_cache_file_count++;
			};
		}

		if (this.convert_to_language
				&& (!options || !options.no_extract_convert_cache_directory)) {
			extract_convert_cache_directory(work_data);
			// work_data.convert_cache_directory_extracted = Date.now();
			if (false) {
				var promise_extract_convert_cache_directory = extract_convert_cache_directory(work_data);
				if (promise_extract_convert_cache_directory) {
					// 先初始化完畢後再重新執行。
					return promise_extract_convert_cache_directory
							.then(create_ebook.bind(this, work_data, {
								// 跳過不需要的前置作業。
								no_extract_convert_cache_directory : true
							}));
				}
			}
		}

		// return needing to wait language converted
		var text_list = [ work_data.title, TAG_text_converted,
		// 執行到這邊可能還沒取得這兩個數值。
		work_data.author, work_data.site_name ];
		// console.trace('Convert: ' + text_list);
		// 先測試是否使用 asynchronous 的 LTP server。
		var promise_of_language_convert = this.cache_converted_text(text_list,
		// 盡可能只使用 cache，不去動到 LTP server。
		Object.assign({
			skip_server_test : true
		}, work_data.convert_options));
		if (promise_of_language_convert) {
			// 先初始化完畢後再重新執行。
			// 注意: 這會造成 create_ebook() 這邊之前的程式碼執行兩遍!
			return promise_of_language_convert.then(create_ebook.bind(this,
			// 跳過不需要的前置作業。本次執行不再重複解開 cache 檔，但仍需要
			// cecc.load_text_to_check() 以載入作品的特設檢核。
			work_data, Object.assign({
				no_extract_convert_cache_directory : true
			}, options)));
		}

		// ebook 先備條件檢查完畢。
		// ------------------------------------------------

		if (!this.site_id) {
			this.site_id = this.id;
		}

		crawler_namespace.set_last_update_Date(work_data, true);

		// console.trace(work_data);
		var ebook_directory = work_data.directory + work_data.directory_name
		// + ' ebook'
		, ebook_files = library_namespace.read_directory(ebook_directory),
		//
		ebook_file_path = ebook_path.call(this, work_data, null, {
		// allow_non_cache : true
		});
		// ebook_file_path = ebook_file_path[0] + ebook_file_path[1];

		if (!this.discard_old_ebook_file
		// 有舊的檔案存在就不覆寫。
		&& (!Array.isArray(ebook_files) || !ebook_files.includes('mimetype'))) {
			if (library_namespace.file_exists(ebook_file_path[0]
					+ ebook_file_path[1])) {
				// 若是沒有cache，但是有舊的epub檔，那麼就將之解壓縮。
				// 其用意是為了保留媒體檔案與好的舊章節，預防已經無法下載/獲取。
				// 由於這個動作，當舊的電子書存在時將不會清場。若有必要清場（如太多冗贅），須設定.discard_old_ebook_file或自行將舊電子書刪除。
				var ebook_archive = ebook_file_path[0] + ebook_file_path[1];
				ebook_archive = new library_namespace.storage.archive(
						ebook_archive);
				library_namespace.log_temporary({
					// ebook_archive.archive_file_path
					// gettext_config:{"id":"extract-ebook-as-cache-$1"}
					T : [ 'Extract ebook as cache: [%1]', ebook_file_path[1] ]
				});
				ebook_archive.extract({
					output : ebook_directory
				});
			} else if (this.regenerate) {
				library_namespace.warn('create_ebook: '
						+ '設定了 .regenerate，但不存在可用的舊電子書！');
			}
		}

		// library_namespace.log('using CeL.application.storage.EPUB');
		var ebook = new library_namespace.EPUB(ebook_directory, {
			rebuild : Object.hasOwn(this, 'rebuild_ebook')
			// rebuild: 重新創建, 不使用舊的.opf資料. start over, re-create
			? work_data.rebuild_ebook : work_data.reget_chapter
					|| work_data.regenerate,
			id_type : this.site_id,
			// 以下為 epub <metadata> 必備之元素。
			// 小説ID
			identifier : work_data.id,
			title : this.convert_text_language(work_data.title, {
				// Will used in ebook_path()
				persistence : true
			}),
			language : this.convert_to_language ? 'zh-'
					+ library_namespace.gettext
							.to_standard(this.convert_to_language)
					: work_data.language || this.language,
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
		if (this.convert_to_language) {
			subject.push(this.convert_text_language(TAG_text_converted),
			//
			gettext.get_alias(this.convert_to_language));
		}
		subject = subject.unique();

		var setup_ebook_options = {
			ebook : ebook,
			subject : subject,
			description : crawler_namespace.get_label(work_data.description
			// .description 中不可存在 tag。
			.replace(/\n*<br(?:[\s\/][^<>]*)?>\n*/ig, '\n'))
		};

		text_list = [ work_data.author, setup_ebook_options.description,
				work_data.site_name ];
		text_list.append(subject);
		// 將 ebook 相關作業納入 {Promise}，可保證先添加完章節資料、下載完資源再 pack_ebook()。
		promise_of_language_convert = this.cache_converted_text(text_list,
				work_data.convert_options)
				|| Promise.resolve();
		return ebook.working_promise = promise_of_language_convert
				.then(setup_ebook.bind(this, work_data, setup_ebook_options));
	}

	// @inner only called by create_ebook()
	function setup_ebook(work_data, options) {
		var ebook = options.ebook, subject = options.subject
				.map(this.convert_text_language.bind(this));
		ebook.time_zone = work_data.time_zone || this.time_zone;

		// http://www.idpf.org/epub/31/spec/epub-packages.html#sec-opf-dcmes-optional
		ebook.set({
			// 作者名
			creator : this.convert_text_language(work_data.author),
			// 🏷標籤, ジャンル genre, タグ, キーワード
			subject : subject,
			// 作品描述: 劇情簡介, synopsis, あらすじ
			description : this.convert_text_language(options.description),
			publisher : this.convert_text_language(work_data.site_name) + ' ('
					+ this.base_URL + ')',
			// source URL
			source : work_data.url
		});

		if (this.vertical_writing || this.RTL_writing) {
			if (this.RTL_writing === undefined) {
				this.RTL_writing = typeof this.vertical_writing === 'string' ? /rl$/
						.test(this.vertical_writing)
						: !!this.vertical_writing;
			}
			ebook.set_writing_mode(this.vertical_writing, this.RTL_writing);
		}

		if (work_data.image) {
			// cover image of work
			ebook.set_cover(this.full_URL(work_data.image));
		}

		return work_data[this.KEY_EBOOK] = ebook;
	}

	// 通常應該會被 parse_chapter_data() 呼叫。
	function add_ebook_chapter(work_data, chapter_NO, data) {
		var ebook = work_data && work_data[this.KEY_EBOOK];
		if (!ebook) {
			return;
		}

		// 可用來移除廣告。
		if (this.pre_add_ebook_chapter) {
			// 去除掉中間插入的廣告連結。
			// 修正這個網站的語法錯誤。
			// 去除掉結尾的廣告。
			this.pre_add_ebook_chapter(data/* , work_data, chapter_NO */);
		}

		if (typeof data === 'string') {
			data = {
				text : data
			};
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

		var chapter_data = Array.isArray(work_data.chapter_list)
				&& work_data.chapter_list[chapter_NO - 1],
		// 卷篇集幕部冊册本輯/volume/part/book
		part_title = crawler_namespace.get_label(data.title || chapter_data
				&& chapter_data.part_title || ''),
		// 章節名稱 / 篇章名稱 / 章節节回折篇話话頁页/chapter/section
		chapter_title = crawler_namespace.get_label(data.sub_title
				|| chapter_data
				&& (chapter_data.chapter_title || chapter_data.title) || '');

		var options = {
			chapter_data : chapter_data,
			part_title : part_title,
			chapter_title : chapter_title
		};

		// console.trace(work_data.convert_options);

		data.text = library_namespace.HTML_to_Unicode(
		// 清理 HTML tags 以減少其對 this.convert_text_language() 的影響。
		// TODO: <p> @ qidian.js
		library_namespace.EPUB.normailize_contents(data.text
		// remove all new-lines
		.replace(/[\r\n]+/g, '')
		// "<br />", "<br/>" → "\n"
		.replace(/\s*<br(?:[\s\/][^<>]*)?>[\r\n]*/ig, '\n')
		// .trim()
		), true);

		data.text = data.text
		// 清除最後的 <p></p>
		.replace(/(?:<(\w+)[^<>]*>\s*<\/\1>\s*)+$/g, '');

		// console.log(data.text);

		// return needing to wait language converted
		var text_list = [ part_title, chapter_title, data.text ];
		// console.trace(work_data.convert_options);
		// 下載完畢後作繁簡轉換。
		var promise_of_language_convert = this.cache_converted_text(text_list,
				work_data.convert_options);
		if (promise_of_language_convert) {
			if (false) {
				console.trace('Convert-1 ' + part_title + '§' + chapter_title
						+ ': ' + chapter_data.url + '\n'
						+ library_namespace.string_digest(data.text));
				console.trace(library_namespace.string_digest(text_list));
				promise_of_language_convert.chapter_title = chapter_title;
				console.trace(promise_of_language_convert);
			}
			library_namespace.log_temporary({
				T : [ this.convert_to_language === 'TW'
				// gettext_config:{"id":"convert-simplified-chinese-to-traditional-chinese-«$1»"}
				? '將簡體中文轉換成繁體中文：《%1》'
				// gettext_config:{"id":"convert-traditional-chinese-to-simplified-chinese-«$1»"}
				: '将繁体中文转换成简体中文：《%1》',
				//
				part_title ? part_title + '§' + chapter_title : chapter_title ]
			});
			process.title = gettext(this.convert_to_language === 'TW'
			// gettext_config:{"id":"traditionalize-$1"}
			? '繁化: %1'
			// gettext_config:{"id":"simplify-$1"}
			: '简化: %1', chapter_title) + ' @ ' + this.id;
			return ebook.working_promise = ebook.working_promise
			//
			.then(function() {
				if (false) {
					console.trace('Convert-2 ' + part_title + '§'
							+ chapter_title + ': ' + chapter_data.url + '\n'
							+ library_namespace.string_digest(data.text));
					console.log(promise_of_language_convert);
				}

				return promise_of_language_convert
				/**
				 * <code>
				.then(function(text_list) {
					console.trace('Convert-3 '
					//
					+ part_title + '§' + chapter_title
					//
					+ ': ' + chapter_data.url + '\n'
					//
					+ library_namespace.string_digest(data.text));
					console.trace(text_list);
				})
				</code>
				 */
				.then(
				// TODO: 這邊失敗，例如 timeout 的話，會直接跳到最後一章並且出現錯誤。
				add_ebook_chapter_actual_work.bind(this, work_data, chapter_NO,
						data, options));
			}.bind(this));
		} else {
			if (false) {
				console.trace('Add content ' + part_title + '§' + chapter_title
						+ ': ' + library_namespace.string_digest(data.text));
			}
			// 將 ebook 相關作業納入 {Promise}，可保證先添加完章節資料、下載完資源再 pack_ebook()。
			return ebook.working_promise = ebook.working_promise
					.then(add_ebook_chapter_actual_work.bind(this, work_data,
							chapter_NO, data, options));
		}
	}

	// 找出段落開頭。
	// '&nbsp;' 已經被 normailize_contents() @CeL.EPUB 轉換為 '&#160;'
	var PATTERN_PARAGRAPH_START_CMN = /(^|\n|<\/?(?:br|p)(?:[^\w][^<>]*)?>)(?:&#160;|[\s　]){4,}([^\s　\n&])/ig,
	//
	PATTERN_PARAGRAPH_START_JP = new RegExp(PATTERN_PARAGRAPH_START_CMN.source
			.replace('{4,}', '{2,}'), PATTERN_PARAGRAPH_START_CMN.flags);

	// @inner only called by add_ebook_chapter_actual_work()
	function handle_indentation(contents, PATTERN_PARAGRAPH_START, indent) {
		// console.trace(contents);

		// assert: /^\s*$/.test(indent)
		if (indent) {
			contents = contents.replace(PATTERN_PARAGRAPH_START, '$1' + indent
					+ '$2');
		}

		// e.g., "<p>..."
		if (!contents.startsWith('<')) {
			var indent_hash = Object.create(null);
			Array.from(contents.matchAll(/<(?:br)[^<>]*>(\s+)/g))
			// 處理文章開頭的縮排/內縮。
			.forEach(function(matched) {
				if (!indent_hash[matched[1]])
					indent_hash[matched[1]] = 1;
				else
					indent_hash[matched[1]]++;
			});

			var max_count = 0, majority_indent;
			for ( var indent in indent_hash) {
				if (max_count < indent_hash[indent]) {
					max_count = indent_hash[indent];
					majority_indent = indent;
				}
			}
			// console.trace([ indent_hash, max_count, majority_indent ]);
			if (majority_indent) {
				contents = majority_indent + contents;
			}
		}

		return contents;
	}

	// @inner only called by add_ebook_chapter(work_data, chapter_NO, data)
	function add_ebook_chapter_actual_work(work_data, chapter_NO, data, options) {
		var chapter_data = options.chapter_data, part_title = options.part_title, chapter_title = options.chapter_title;

		// @see epub_hans_to_hant.js
		if (this.convert_to_language) {
			if (false) {
				console.trace('Get cache of ' + part_title + '§'
						+ chapter_title + ': '
						+ library_namespace.string_digest(data.text));
			}
			part_title = this.convert_text_language(part_title);
			chapter_title = this.convert_text_language(chapter_title);
			if (false) {
				console.trace('→ ' + part_title + '§' + chapter_title);
			}
			data.original_text = data.text;
			data.text = this.convert_text_language(data.text);
			data.text = data.text.replace(
			// TODO: 把半形標點符號轉換為全形標點符號
			/["'](?:zh-(?:cmn-)?|cmn-)?(?:Hans-)?CN["']/ig,
			// "zh-TW"
			'"zh-cmn-Hant-TW"');
			this.clear_converted_text_cache({
				text : data.original_text
			});
			// free
			delete data.original_text;
		}

		data.text = data.text
		// recover HTML tags
		.replace(/\n/g, '<br />');

		// 一開始就該定一個不太需要改變的位數。
		// 不少小說超過1000個章節。
		var file_title = chapter_NO.pad(work_data.chapter_NO_pad_digits || 4)
				+ ' '
				+ (part_title ? part_title
						+ library_namespace.EPUB.prototype.title_separator : '')
				+ chapter_title;

		var item_data = {
			title : file_title,
			// include images / 自動載入內含資源, 將外部media內部化
			internalize_media : true,
			file : library_namespace.to_file_name(file_title + '.xhtml'),
			// 一般說來必須設定 work_data.chapter_list。
			date : data.date || chapter_data && chapter_data.date,
			// 設定 item_data.url 可以在閱讀電子書時，直接點選標題就跳到網路上的來源。
			url : data.url
					|| this.full_URL(this.chapter_URL(work_data, chapter_NO)),
			// pass Referer, User-Agent
			get_URL_options : Object.assign({
				error_retry : this.MAX_ERROR_RETRY
			}, this.get_URL_options),
			words_so_far : work_data.words_so_far,
			hide_chapter_information : this.hide_chapter_information
		};

		var _this = this;
		var language = work_data.language
		// e.g., 'cmn-Hans-CN'
		&& work_data.language.match(/^(ja|(?:zh-)?cmn)(?:$|[^\w])/)
		// e.g., xshuyaya.js
		|| this.language && [ , this.language ];
		if (language) {
			language = language[1].replace(/^zh-cmn/, 'cmn');
		}

		var item = {
			title : part_title,
			sub_title : chapter_title,
			// contents
			text : data.text,
			post_processor : function(contents) {
				// console.log([ language, contents ]);
				// 正規化小說章節文字。

				// 處理縮排/內縮。
				if (language === 'ja') {
					contents = handle_indentation(contents,
					// 日本語では行頭から一文字の字下げをする。
					PATTERN_PARAGRAPH_START_JP, '　');
				} else if (/^cmn/.test(language)) {
					contents = handle_indentation(contents,
					// 中文每段落開頭空兩個字。
					PATTERN_PARAGRAPH_START_CMN, '　　');
				} else {
					library_namespace.warn('add_ebook_chapter_actual_work: '
							+ 'Unknown language: ' + language);
				}

				if (typeof _this.contents_post_processor === 'function') {
					contents = _this.contents_post_processor(contents,
							work_data);
				}

				if (contents.length < _this.MIN_CHAPTER_SIZE) {
					crawler_namespace.set_work_status(work_data, '§'
					//
					+ chapter_NO + ': '
					// gettext_config:{"id":"too-few-words-($1-characters)"}
					+ (contents.length ? gettext('字數太少（%1 個{{PLURAL:%1|字元}}）',
					// gettext_config:{"id":"no-content"}
					contents.length) : 'No content'));
				}
				return contents;
			}
		};
		// library_namespace.log('file_title: ' + file_title);

		var ebook = work_data && work_data[this.KEY_EBOOK];
		item = ebook.add(item_data, item);

		// 登記本作品到本章節總計的字數。
		function count_words_so_far(item) {
			if (item && !item.error && item_data.word_count > 0) {
				work_data.words_so_far = (work_data.words_so_far || 0)
						+ item_data.word_count;
			}
			// console.trace(work_data.words_so_far);
		}
		if (library_namespace.is_thenable(item)) {
			item = item.then(count_words_so_far);
		} else {
			count_words_so_far(item);
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
					// gettext_config:{"id":"there-is-no-directory-for-archive-files-$1"}
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
			rename_to = last_file.replace(/(.[\w\-]+)$/i, extension);
			// assert: PATTERN_ebook_file.test(rename_to) === false
			// 不應再被納入檢測。
			library_namespace.info(library_namespace.display_align([
			// Set milestone: 日本小說網站有時會商業化，將之前的作品內容大幅刪除。這時若刪掉舊檔，就會失去這些內容。
			// gettext_config:{"id":"preserve"}
			[ gettext('保留舊檔：'), last_file ],
			// gettext_config:{"id":"move-to-→"}
			[ gettext('搬移至 →'), rename_to ] ]));
			library_namespace.move_file(last_file, rename_to);
		});

		// ✘ 移除.ebook_archive_directory中，較小的ebooks舊檔案。
		// 僅留存最新的一個ebooks舊檔案。
		for_each_old_ebook(this.ebook_archive_directory, function(last_file,
				this_file) {
			library_namespace.info([ {
				// gettext_config:{"id":"removed-old-files"}
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
	function ebook_path(work_data, file_name, options) {
		// options = library_namespace.setup_options(options);
		if (!file_name) {
			if (!work_data.author || !work_data.site_name) {
				library_namespace.error('ebook_path: ' + '尚未設定作者('
						+ work_data.author + ')或下載站點(' + work_data.site_name
						+ ')，可能導致先前 cache 無用。');
			}
			// e.g., "(一般小説) [author] title [site 20170101 1話].id.epub"
			file_name = [ '(一般小説) [',
			//
			this.convert_text_language(work_data.author), '] ',
			// , options
			this.convert_text_language(work_data.title), ' [',
			//
			this.convert_text_language(work_data.site_name
			// , options
			), work_data.last_update_Date
			//
			? ' ' + work_data.last_update_Date.format('%Y%2m%2d') : '',
			//
			work_data.chapter_count >= 1
			//
			? ' ' + work_data.chapter_count
			//
			+ (work_data.chapter_unit || this.chapter_unit)
			//
			: '', ']', this.RTL_writing ? ' ('
			//
			+ (/^ja/.test(work_data.language) ? '縦書き' : '縱書') + ')' : '',
			//
			this.convert_to_language ? ' ('
			//
			+ library_namespace.gettext.to_standard(this.convert_to_language)
			//
			+ ')' : '', '.',
			//
			typeof work_data.directory_id === 'function'
			// 自行指定作品放置目錄與 ebook 用的 work id。
			&& work_data.directory_id() || work_data.id, '.epub' ];

			file_name = file_name.join('');
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

		ebook.working_promise = ebook.working_promise.then(pack_up_ebook.bind(
				this, work_data, file_name));

		if (this.convert_to_language) {
			ebook.working_promise = ebook.working_promise
			//
			.then(this.clear_converted_text_cache.bind(this, true))
			//
			.then(archive_convert_cache_directory.bind(this, work_data));
		}

		ebook.working_promise = ebook.working_promise.then(
		//
		library_namespace.null_function, function(error) {
			library_namespace.error(error);
			// re-throw
			throw error;
		});

		return ebook.working_promise;
	}

	function pack_up_ebook(work_data, file_name) {
		var file_path = ebook_path.call(this, work_data, file_name);

		var cecc = this.convert_text_language_using
				&& this.convert_text_language_using.cecc;
		// console.trace(cecc);
		if (cecc && cecc.report_text_to_check) {
			cecc.report_text_to_check({
				convert_to_language : this.convert_to_language
			});
		}

		// gettext_config:{"id":"archive-epub-ebook-$1"}
		process.title = gettext('打包 epub 電子書：%1', work_data.title) + ' @ '
				+ this.id;
		// https://github.com/ObjSal/p7zip/blob/master/GUI/Lang/ja.txt
		library_namespace.debug({
			// gettext_config:{"id":"archive-epub-ebook-$1"}
			T : [ '打包 epub 電子書：%1', file_path[1] ]
		}, 1, 'pack_ebook');

		var ebook = work_data && work_data[this.KEY_EBOOK];

		// this: this_work_crawler
		return ebook.pack(file_path, this.remove_ebook_directory,
				remove_old_ebooks.bind(this, work_data.id));
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
