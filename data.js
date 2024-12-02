/**
 * @name CeL data function
 * @fileoverview 本檔案包含了 data 處理的 functions。
 * @since
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

typeof CeL === 'function' && CeL.run({
	// module name
	name : 'data',

	require : 'data.code.compatibility.|data.native.to_fixed',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var to_fixed = this.r('to_fixed'),
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	/**
	 * null module constructor
	 * 
	 * @class data 處理的 functions
	 */
	var _// JSDT:_module_
	= function() {
		// null module constructor
	};

	/**
	 * for JSDT: 有 prototype 才會將之當作 Class
	 */
	_// JSDT:_module_
	.prototype = {};

	/**
	 * <code>
	eval(uneval(o)): IE 沒有 uneval
	http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone

	way1:
	return YAHOO.lang.JSON.parse( YAHOO.lang.JSON.stringify( obj ) );

	TODO:
	1.
	防止交叉參照版: try
	var a=function(){this.a=1,this.b={a:this.a},this.a={b:this.b};},b=cloneObject(a);
	.or.
	var a={},b;
	a.a={a:1};
	a.b={a:a.a};
	a.a={b:a.b};
	b=cloneObject(a);

	恐須改成
	=new cloneObject();


	2.
	equal()

	 </code>
	 */
	/**
	 * clone object
	 * 
	 * @param object
	 * @param {Boolean}deep
	 *            deep / with trivial
	 * @return
	 * 
	 * @see Object.clone() @ data.native
	 * @since 2008/7/19 11:13:10, 2012/10/16 22:01:12, 2014/5/30 19:35:59.
	 */
	function clone(object, deep) {
		if (!object || typeof object !== 'object')
			// assert: is 純量 / function
			return object;

		if (Array.isArray(object))
			if (deep) {
				var target = [];
				object.forEach(function(o, index) {
					target[index] = clone(o, deep);
				});
				return target;
			} else
				// Array.clone: data.native.clone_Array()
				return Array.clone(object);

		var key = ('clone' in object)
		// test 物件自帶的 clone().
		&& typeof object.clone === 'function';

		if (key)
			// object.clone(deep);
			return object.clone();

		key = library_namespace.is_type(object);
		if (key === 'Date')
			return new Date(object.getTime());

		if (key === 'RegExp')
			// new object.constructor(object)
			return new RegExp(object);

		var value, target = {};
		for (key in object)
			// 不加入非本 instance，為 prototype 的東西。
			if (Object.hasOwn(object, key)) {
				value = object[key];
				// TODO: 預防 loop, 防止交叉參照/循環參照。
				target[key] = deep ? clone(value, deep) : value;
			}
		return target;
	}

	_// JSDT:_module_
	.clone = clone;

	// merge `new_data` to `old_data`, and return merged old_data
	// merge 時，各屬性值以 `old_data` 為基礎，`new_data` 後設定者為準。
	// Will modify old_data!
	function deep_merge_object(old_data, options) {
		var new_data;
		if (Array.isArray(old_data)) {
			// deep_merge_object([old_data, new_data, newer_data, ...,
			// latest data ], options);
			old_data.forEach(function(data, index) {
				if (index === 0) {
					old_data = data;
				} else if (index === this.length - 1) {
					new_data = data;
				} else {
					old_data = deep_merge_object([ old_data, data ], options);
				}
			});
		} else {
			// deep_merge_object(old_data, new_data);
			new_data = options;
		}

		// ----------------------------

		if (typeof old_data !== 'object' || old_data === null || !new_data) {
			return new_data || old_data;
		}

		// ----------------------------

		function merge_property_of_object(sub_new_data, sub_old_data) {
			for ( var property in sub_new_data) {
				// 將 property in sub_new_data 設定至
				// old_value=sub_old_data[property];
				merge_property(property, sub_new_data, sub_old_data);
			}
			return sub_old_data;
		}

		// 以 sub_old_data[property] 為基礎，將 sub_new_data[property] merge/overwrite
		// 到 sub_old_data[property]
		// 最終指定 sub_new_data[property] = old_value;
		function merge_property(property, sub_new_data, sub_old_data) {
			// assert: property in sub_new_data
			var new_value = sub_new_data[property];

			// assert: typeof old_value === 'object'
			if (typeof new_value !== 'object' || !(property in sub_old_data)) {
				// using new_value, overwrite old value
				sub_old_data[property] = new_value;
				return;
			}

			// assert: property in sub_old_data
			var old_value = sub_old_data[property];

			if (Array.isArray(new_value)) {
				if (Array.isArray(old_value)) {
					// 對於 {Object}old_value 先複製到 `old_value`
					Object.keys(new_value).forEach(
					// merge 像 new_value.a=1
					function(sub_property) {
						if (!library_namespace.is_digits(sub_property)) {
							merge_property(sub_property, new_value, old_value);
						}
					});

					old_value.append(new_value);
				} else if (typeof old_value === 'object') {
					// assert: library_namespace.is_Object(old_value)
					merge_property_of_object(new_value, old_value);
				} else {
					// new_value.push(old_value);
					sub_old_data[property] = new_value;
				}
				return;
			}

			// assert: library_namespace.is_Object(old_value) &&
			// library_namespace.is_Object(new_value)

			if (typeof old_value !== 'object') {
				// 考慮 new_value 與 old_value 型態不同的情況。
				sub_old_data[property] = new_value;
			} else {
				merge_property_of_object(new_value, old_value);
			}
		}

		// assert: library_namespace.is_Object(old_data)
		return merge_property_of_object(new_data, old_data);
	}

	_.deep_merge_object = deep_merge_object;

	/**
	 * get the quote index of specified string.<br />
	 * 輸入('"','dh"fdgfg')得到2:指向"的位置.
	 * 
	 * @param {String}string
	 * @param {String}quote
	 *            ['"/]，[/]可能不太適用，除非將/[/]/→/[\/]/
	 * @returns
	 * @since 2004/5/5
	 */
	function index_of_quote(string, quote) {
		var i, l = 0, m;
		if (!quote)
			quote = '"';
		while ((i = string.indexOf(quote, l)) > 0
				&& string.charAt(i - 1) === '\\') {
			m = string.slice(l, i - 2).match(/(\\+)$/);
			if (m && m[1].length % 2)
				break;
			else
				l = i + 1;
		}
		return i;
	}

	/**
	 * <code>
	 {var a=[],b,t='',i;a[20]=4,a[12]=8,a[27]=4,a[29]=4,a[5]=6,a.e=60,a.d=17,a.c=1;alert(a);b=sortValue(a);alert(a+'\n'+b);for(i in b)t+='\n'+b[i]+'	'+a[b[i]];alert(t);}
	 </code>
	 */
	// 依值排出key array…起碼到現在，我還看不出此函數有啥大功用。
	// array,否則會出現error! mode=1:相同value的以','合併,mode=2:相同value的以array填入
	function sortValue(a, mode) {
		var s = [], r = [], i, j, b, k = [];
		// 使用(i in n)的方法，僅有數字的i會自動排序；這樣雖不必用sort()，但數字亦會轉成字串。
		for (i in a)
			if ((b = isNaN(i) ? i : parseFloat(i)),
			//
			typeof s[j = isNaN(j = a[i]) ? j : parseFloat(j)] === 'undefined')
				k.push(j), s[j] = b;
			else if (typeof s[j] === 'object')
				s[j].push(b);
			else
				s[j] = [ s[j], b ];
		// 注意：sort 方法會在原地排序 Array 物件。
		for (i = 0, k.sort(library_namespace.ascending); i < k.length; i++)
			if (typeof (b = s[k[i]]) === 'object')
				if (mode === 1)
					// b.join(',')與''+b效能相同
					r.push(b.join(','));
				else if (mode === 2)
					r.push(b);
				else
					for (j in b)
						r.push(b[j]);
			else
				r.push(b);
		return r;
	}

	/**
	 * <code>
	 2005/7/18 21:26
	 依照所要求的index(sortByIndex_I)對array排序。
	 sortByIndex_Datatype表某index為數字/字串或function
	 先設定sortByIndex_I,sortByIndex_Datatype再使用array.sort(sortByIndex);

	 example:
	var array=[
	'123	avcf	334',
	'131	hj	562',
	'657	gfhj	435',
	'131	ajy	52',
	'345	fds	562',
	'52	gh	435',
	];
	sortByIndex_I=[0,1],sortByIndex_Datatype={0:1,2:1};
	for(i in array)array[i]=array[i].split('	');
	array.sort(sortByIndex);
	alert(array.join('\n'));
	 </code>
	 */
	var sortByIndex_I, sortByIndex_Datatype;
	function sortByIndex(a, b) {
		// alert(a+'\n'+b);
		for (var i = 0, n; i < sortByIndex_I.length; i++)
			if (sortByIndex_Datatype[n = sortByIndex_I[i]]) {
				if (typeof sortByIndex_Datatype[n] === 'function') {
					if (n = sortByIndex_Datatype[n](a[n], b[n]))
						return n;
				} else if (n = a[n] - b[n])
					return n;
			} else if (a[n] != b[n])
				return a[n] > b[n] ? 1 : -1;
		return 0;
	}

	/**
	 * <code>
	 2005/7/18 21:26
	 依照所要求的 index 對 array 排序，傳回排序後的 index array。
	 **假如設定了 separator，array 的元素會先被 separator 分割！

	 example:
	 var array=[
	 '123	avcf	334',
	 '131	hj	562',
	 '657	gfhj	435',
	 '131	ajy	52',
	 '345	fds	562',
	 '52	gh	435',
	 ];
	 alert(getIndexSortByIndex(array,'	',[0,1],[0,2]));
	 alert(array.join('\n'));	//	已被 separator 分割！

	 </code>
	 */
	function getIndexSortByIndex(array, separator, indexArray, isNumberIndex) {
		// 判定與事前準備(設定sortByIndex_I,sortByIndex_Datatype)
		if (typeof indexArray === 'number')
			sortByIndex_I = [ indexArray ];
		else if (typeof indexArray !== 'object'
				|| indexArray.constructor !== Array)
			sortByIndex_I = [ 0 ];
		else
			sortByIndex_I = indexArray;
		var i, sortByIndex_A = [];
		sortByIndex_Datatype = Object.create(null);
		if (typeof isNumberIndex === 'object') {
			if (isNumberIndex.constructor === Array) {
				sortByIndex_Datatype = Object.create(null);
				for (i = 0; i < isNumberIndex.length; i++)
					sortByIndex_Datatype[isNumberIndex[i]] = 1;
			} else
				sortByIndex_Datatype = isNumberIndex;
			for (i in sortByIndex_Datatype)
				if (isNaN(sortByIndex_Datatype[i])
						|| parseInt(sortByIndex_Datatype[i]) !== sortByIndex_Datatype[i])
					delete sortByIndex_Datatype[i];
		}
		if (typeof array !== 'object')
			return;

		// main work: 可以不用重造 array 資料的話..
		for (i in array) {
			if (separator)
				array[i] = array[i].split(separator);
			sortByIndex_A.push(i);
		}
		sortByIndex_A.sort(function(a, b) {
			return sortByIndex(array[a], array[b]);
		});

		/**
		 * <code>
		for: 重造array資料
		var getIndexSortByIndexArray=array;
		for(i in getIndexSortByIndexArray){
			if(separator)getIndexSortByIndexArray[i]=getIndexSortByIndexArray[i].split(separator);
			sortByIndex_A.push(i);
		}
		sortByIndex_A.sort(function (a,b){return sortByIndex(getIndexSortByIndexArray[a],getIndexSortByIndexArray[b]);});
		</code>
		 */

		return sortByIndex_A;
	}

	/**
	 * <code>
	 simpleWrite('char_frequency report3.txt',char_frequency(simpleRead('function.js')+simpleRead('accounts.js')));
	 {var t=reduceCode(simpleRead('function.js')+simpleRead('accounts.js'));simpleWrite('char_frequency source.js',t),simpleWrite('char_frequency report.txt',char_frequency(t));}	//	所費時間：十數秒（…太扯了吧！）
	 </code>
	 */
	_// JSDT:_module_
	.
	/**
	 * 測出各字元的出現率。 普通使用字元@0-127：9-10,13,32-126，reduce後常用：9,32-95,97-125
	 * 
	 * @param {String}
	 *            text 文檔
	 * @return
	 * @_memberOf _module_
	 */
	char_frequency = function char_frequency(text) {
		var i, a, c = [], d, t = '' + text, l = t.length, used = '', unused = '', u1 = -1, u2 = u1;
		for (i = 0; i < l; i++)
			if (c[a = t.charCodeAt(i)])
				c[a]++;
			else
				c[a] = 1;
		for (i = u1; i < 256; i++)
			if (c[i]) {
				if (u2 + 1 === i)
					used += ',' + i, unused += (u2 < 0 ? '' : '-' + u2);
				u1 = i;
			} else {
				if (u1 + 1 === i)
					unused += ',' + i, used += (u1 < 0 ? '' : '-' + u1);
				u2 = i;
			}
		// 若是reduceCode()的程式，通常在120項左右。
		for (i = 0, t = 'used:' + used.substr(1) + '\nunused:'
				+ unused.substr(1) + '\n', d = sortValue(c, 2).reverse(); i < d.length; i++) {
			t += NewLine
					+ (a = d[i])
					+ '['
					+ fromCharCode(a).replace(/\0/g, '\\0').replace(/\r/g,
							'\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t')
					+ ']' + ':	' + (a = c[typeof a === 'object' ? a[0] : a])
					+ '	' + (100 * a / l);
			// .5%以上者←選購
			// if(200*v<l)break;
		}
		alert(t);
		return t;
	};

	/**
	 * <code>
	 flag:
	 (flag&1)==0	HTML tag, 表情符號等不算一個字
	 (flag&1)==1	將 HTML tag 全部消掉
	 (flag&2)==1	連表情符號等也算一個字

	 可讀性/適讀性
	 http://en.wikipedia.org/wiki/Flesch-Kincaid_Readability_Test
	 http://en.wikipedia.org/wiki/Gunning_fog_index
	 Gunning-Fog Index：簡單的來說就是幾年的學校教育才看的懂你的文章，數字越低代表越容易閱讀，若是高於17那表示你的文章太難囉，需要研究生才看的懂，我是6.08，所以要受過6.08年的學校教育就看的懂囉。
	 Flesch Reading Ease：這個指數的分數越高，表示越容易了解，一般標準的文件大約介於60~70分之間。
	 Flesch-Kincaid grade level：和Gunning-Fog Index相似，分數越低可讀性越高，越容易使閱讀者了解，至於此指數和Gunning-Fog Index有何不同，網站上有列出計算的演算法，有興趣的人可以比較比較。

	 DO.normalize(): 合併所有child成一String, may crash IE6 Win!	http://www.quirksmode.org/dom/tests/splittext.html
	 </code>
	 */
	_// JSDT:_module_
	.
	/**
	 * 計算字數 count words. word_count
	 * 
	 * @param {String}
	 *            text 文檔
	 * @param {Number}
	 *            flag 文檔格式/處理方法
	 * 
	 * @return {Number} 字數
	 * 
	 * @see https://zh.wikipedia.org/wiki/User:%E5%B0%8F%E8%BA%8D/Wordcount.js
	 * 
	 * @_memberOf _module_
	 */
	count_word = function count_word(text, flag) {
		var is_HTML = flag & 1;

		// is HTML object
		if (typeof text === 'object')
			if (text.innerText)
				text = text.innerText, is_HTML = false;
			else if (text.innerHTML)
				text = text.innerHTML, is_HTML = true;

		if (typeof text !== 'string')
			return 0;

		// 和perl不同，JScript常抓不到(.*?)之後還接特定字串的東西，大概因為沒有s。(.*?)得改作([\s\S]*?)？
		// 或者該加/img？
		if (is_HTML)
			text = text.replace(/<\!--[\s\S]*?-->/g, '').replace(
					/<[\s\n]*\/?[\s\n]*[a-z][^<>]*>/gi, '');

		if (flag & 2)
			text = text.replace(
			// 連表情符號或 '（~。），' / 破折號 '——' / 刪節號 '……' 等標點符號也算一個字
			/[\+\-–*\\\/?!,;.<>{}\[\]@#$%^&_|"'~`—…、，；。！？：()（）「」『』“”‘’]{2,}/g,
					';');

		return text
		// 去掉注解用的括弧、書名號、專名號、印刷符號等
		.replace(/[()（）《》〈〉＊＃]+/g, '')

		// 將數字改成單一字母。
		.replace(/\d*\.?\d+([^.]|$)/g, '0$1')
		/**
		 * 將整組物理量值加計量單位略縮成單一字母。<br />
		 * The general rule of the International Bureau of Weights and Measures
		 * (BIPM) is that the numerical value always precedes the unit, and a
		 * space is always used to separate the unit from the number, e.g., "23
		 * °C" (not "23°C" or "23° C").
		 * 
		 * @see <a href="http://en.wikipedia.org/wiki/ISO_31-0#Expressions"
		 *      accessdate="2012/7/28 0:42">ISO 31-0</a>, <a
		 *      href="http://lamar.colostate.edu/~hillger/faq.html#spacing"
		 *      accessdate="2012/7/28 0:42">FAQ: Frequently Asked Questions
		 *      about the metric system</a>.
		 */
		.replace(/\d+\s*[a-zA-Z°]+(\s*\/\s*(\d+\s*)?[a-zA-Z°]+)?/g, '0')
		// 長度過長時，極耗時間。e.g., ...\d{500000}...
		// .replace(/\d*\.?\d+\s*[a-zA-Z°]+(\s*\/\s*(\d*\.?\d+\s*)?[a-zA-Z°]+)?/g,'0')

		// https://en.wikipedia.org/wiki/Punctuation_of_English
		// Do not count punctuations of English.
		.replace(/[,;:.?!\-–"'()⟨⟩«»\[\]{}<>$%#@~`^&*\\\/⁄+=|]+/g, '')
		// 將英文、數字、單位等改成單一字母。[.]: 縮寫。[\/]: m/s 之類。
		// a's: 1
		// http://en.wikibooks.org/wiki/Unicode/Character_reference/0000-0FFF
		// http://zh.wikipedia.org/wiki/Unicode%E5%AD%97%E7%AC%A6%E5%88%97%E8%A1%A8
		.replace(/[\wÀ-ÖØ-öø-ȳ]{2,}/g, 'w')

		// date/time or number
		.replace(/[\d:+\-–\.\/,]{2,}/g, '0')
		// 再去掉*全部*空白
		.replace(/[\s\n]+/g, '')
		// return text.length;
		.length;
	};

	_// JSDT:_module_
	.
	/**
	 * 運算式值的二進位表示法
	 * 已最佳化:5.82s/100000次dec_to_bin(20,8)@300(?)MHz,2.63s/100000次dec_to_bin(20)@300(?)MHz
	 * 
	 * @param {Number}
	 *            number number
	 * @param places
	 *            places,字元數,使用前置0來填補回覆值
	 * @return
	 * @example<code>
	{var d=new Date,i,b;for(i=0;i<100000;i++)b=dec_to_bin(20);alert(gDate(new Date-d));}
	</code>
	 * @_memberOf _module_
	 */
	dec_to_bin = function dec_to_bin(number, places) {
		if (places && number + 1 < (1 << places)) {
			var h = '', b = number.toString(2), i = b.length;
			for (; i < places; i++)
				h += '0';
			return h + b;
		}
		// native code 還是最快！
		return number.toString(2);

		if (false) {
			// 上兩代：慢
			// 不用'1:0'，型別轉換比較慢.不用i，多一個變數會慢很多
			var b = '', c = 1;
			for (p = p && n < (p = 1 << p) ? p : n + 1; c < p; c <<= 1)
				b = (c & n ? '1' : '0') + b;
			return b;

			// 上一代：慢
			if (p && n + 1 < (1 << p)) {
				var h = '', c = 1, b = n.toString(2);
				while (c <= n)
					c <<= 1;
				while (c < p)
					c <<= 1, h += '0';
				return h + (n ? n.toString(2) : '');
			}
		}
	};

	/**
	 * <code>
	value	(Array)=value,(Object)value=
	[null]=value	累加=value
	value=[null]	value=''

	type: value type	['=','][int|float|_num_]
	: 前段
		以[']或["]作分隔重定義指定號[=]與分隔號[,]
	: 後段
		數字表累加
		'int'表整數int，累加1
		'float'表示浮點數float，累加.1	bug:應該用.to_fixed()
		不輸入或非數字表示string

	mode
	_.set_Object_value.F.object
	_.set_Object_value.F.array(10進位/當做數字)
	number: key部分之base(10進位，16進位等)

	example:
	set_Object_value('UTCDay','Sun,Mon,Tue,Wed,Thu,Fri,Sat','int');	//	自動從0開始設，UTCDay.Tue=2
	set_Object_value('UTCDay','Sun,Mon,Tue,Wed,Thu,Fri,Sat');	//	UTCDay.Sun=UTCDay.Fri=''
	set_Object_value('add','a=3,b,c,d',2);	//	累加2。add.b=5
	set_Object_value('add','a,b,c,d',1,_.set_Object_value.F.array);	//	add[2]='c'
	set_Object_value('add','4=a,b,c,d',2,_.set_Object_value.F.array);	//	累加2。add[8]='c'

	 </code>
	 */
	_// JSDT:_module_
	.
	/**
	 * 設定object之值，輸入item=[value][,item=[value]..]。<br />
	 * value未設定會自動累加。<br />
	 * 使用前不必需先宣告…起碼在現在的JS版本中
	 * 
	 * @param obj
	 *            object name that need to operate at
	 * @param value
	 *            valueto set
	 * @param type
	 *            累加 / value type
	 * @param mode
	 *            mode / value type
	 * @return
	 * @_memberOf _module_
	 */
	set_Object_value = function set_Object_value(obj, value, type, mode) {
		if (!value || typeof obj !== 'string')
			return;

		var a, b, i = 0, p = '=', sp = ',', e = "if(typeof " + obj
				+ "!='object')" + obj + "=new " + (mode ?
				// "[]":"{}"
				// Array之另一種表示法：[value1,value2,..],
				// Object之另一種表示法：{key1:value1,key2:value2,..}
				"Array" : "Object") + ";",
		// l: item, n: value to 累加
		n, Tint = false, cmC = '\\u002c', eqC = '\\u003d';
		if (type) {
			if (typeof a === 'string') {
				a = type.charAt(0);
				if (a === '"' || a === "'") {
					a = type.split(a);
					p = a[1], sp = a[2], type = a[3];
				}
			}
			if (type === 'int')
				type = 1, Tint = true;
			else if (type === 'float')
				type = .1;
			else if (isNaN(type))
				type = 0;
			else if (type === parseInt(type))
				type = parseInt(type), Tint = true;
			else
				// t被設成累加數
				type = parseFloat(type);
		}
		// else t = 1;

		if (typeof value === 'string')
			value = value.split(sp);
		// escape regex characters from jQuery
		cmC = new RegExp(cmC.replace(
				/([\.\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1"), 'g'),
				eqC = new RegExp(eqC.replace(
						/([\.\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1"),
						'g');

		if (type)
			// n: 現在count到..
			n = -type;

		for (; i < value.length; i++) {
			if (value[i].indexOf(p) === NOT_FOUND)
				// if(v[i].indexOf(p)==NOT_FOUND&&m)v[i]=p+v[i];
				value[i] = mode ? p + value[i] : value[i] + p;
			if (mode && value[i] === p) {
				n += type;
				continue;
			}
			a = value[i].split(p);
			if (!mode && !a[0])
				// 去掉不合理的(Array可能有NaN index，所以不設條件。)
				continue;
			a[0] = a[0].replace(cmC, ',').replace(eqC, '='), a[1] = a[1]
					.replace(cmC, ',').replace(eqC, '=');
			if (type)
				if (mode) {
					if (!a[0])
						a[0] = (n += type);
					else if (!isNaN(b = mode > 0 ? parseInt(a[0], mode) : a[0]))
						n = Tint ? (a[0] = parseInt(b)) : parseFloat(b);
				} else if (!a[1])
					a[1] = (n += type);
				else if (!isNaN(a[1]))
					n = Tint ? parseInt(a[1]) : parseFloat(a[1]);
			if (!type || Tint && isNaN(b = parseInt(a[1]))
					|| isNaN(b = parseFloat(a[1])))
				b = a[1];
			a = a[0];
			e += obj + '['
					+ (!type || isNaN(a) ? library_namespace.dQuote(a) : a)
					+ ']='
					+ (!type || isNaN(b) ? library_namespace.dQuote(b) : b)
					+ ';';
		}

		try {
			// if(o=='kk')alert(e.slice(0,500));
			// 因為沒想到其他方法可存取Global的object，只好使用eval...
			// 可以試試obj=set_Object_value(0,..){this=new Aaaray/Object}
			return library_namespace.eval_code(e);
		} catch (e) {
			library_namespace.error('Error @ ' + obj);
			library_namespace.error(e);
			return;
		}
	};

	_.set_Object_value.F = {
		// object is default
		'object' : 0,
		'array' : -1
	};

	_// JSDT:_module_
	.
	/**
	 * 將字串組分作 Object
	 * 
	 * @param {String}
	 *            value_set 字串組, e.g., 'a=12,b=34'
	 * @param assignment_char
	 *            char to assign values, e.g., '='
	 * @param end_char
	 *            end char of assignment
	 * @return
	 * @since 2006/9/6 20:55, 2010/4/12 23:06:04
	 * @_memberOf _module_
	 */
	split_String_to_Object = function split_String_to_Object(value_set,
			assignment_char, end_char) {
		if (typeof value_set !== 'string' || !value_set)
			return {};

		value_set = value_set.split(end_char || /[,;]/);

		if (!assignment_char)
			assignment_char = /[=:]/;

		var a, o = {}, _e = 0, l = value_set.length;
		for (; _e < l; _e++) {
			// http://msdn.microsoft.com/library/en-us/jscript7/html/jsmthsplit.asp
			a = value_set[_e].split(assignment_char, 2);
			if (false)
				library_namespace.debug(value_set[_e] + '\n' + a[0] + ' '
						+ a[1], 2);
			if (a[0] !== '')
				o[a[0]] = a[1];
		}
		return o;
	};

	/**
	 * <code>
	2003/10/1 15:46
	比較string:m,n從起頭開始相同字元數
	return null: 格式錯誤，-1: !m||!n
	若一開始就不同：0


	TODO:
	
	test starting with
	
	2009/2/7 7:51:58
	看來測試 string 的包含，以 .indexOf() 最快。
	即使是比較 s.length 為極小常數的情況亦復如此
	
	下面是快到慢：
	
	//	long, short
	var contain_substring = [ function(l, s) {
		var a = 0 == l.indexOf(s);
		return a;
	}, function(l, s) {
		return 0 == l.indexOf(s);
	}, function(l, s) {
		return s == l.slice(0, s.length);
	}, function(l, s) {
		return l.match(s);
	}, function(l, s) {
		for (var i = 0; i < s.length; i++)
			if (s.charAt(i) != l.charAt(i))
				return 0;
		return 1;
	} ];

	function test_contain_substring() {
		for (var i = 0; i < contain_substring.length; i++) {
			var t = new Date;
			for (var j = 0; j < 50000; j++) {
				contain_substring[i]('sdfgjk;sh*dn\\fj;kgsamnd nwgu!eoh;nfgsj;g',
						'sdfgjk;sh*dn\\fj;kgsamnd nwgu!');
				contain_substring[i]('sdbf6a89* /23hsauru', 'sdbf6a89* /23');
			}
			sl(i + ': ' + (new Date - t));
		}
	}
	
	
	//	極小常數的情況:
	//	long,short
	var contain_substring = [ function(l, s) {
		var a = 0 == l.indexOf(s);
		return a;
	}, function(l, s) {
		return 0 == l.indexOf(s);
	}, function(l, s) {
		return s == l.slice(0, 1);
	}, function(l, s) {
		return s.charAt(0) == l.charAt(0);
	}, function(l, s) {
		return l.match(/^\//);
	} ];

	function test_contain_substring() {
		for (var i = 0; i < contain_substring.length; i++) {
			var t = new Date;
			for (var j = 0; j < 50000; j++) {
				contain_substring[i]('a:\\sdfg.dfg\\dsfg\\dsfg', '/');
				contain_substring[i]('/dsfg/adfg/sadfsdf', '/');
			}
			sl(i + ': ' + (new Date - t));
		}
	}

	</code>
	 */

	_// JSDT:_module_
	.
	/**
	 * test if 2 string is at the same length.<br />
	 * strcmp: String.prototype.localeCompare
	 * 
	 * @param s1
	 *            string 1
	 * @param s2
	 *            string 2
	 * @return
	 * @_memberOf _module_
	 */
	same_length = function same_length(s1, s2) {
		if (typeof m !== 'string' || typeof n !== 'string')
			return;
		if (!s1 || !s2)
			return 0;

		var i = s1.length, b = 0, s = s2.length;
		if (i < s) {
			if (
			// m === n.slice(0, i = m.length)
			0 === s2.indexOf(s1))
				return i;
		} else if (
		// s2==s1.slice(0,i=s2.length)
		i = s, 0 === s1.indexOf(s2))
			return i;

		// sl('*same_length: start length: '+i);
		while ((i = (i + 1) >> 1) > 1 && (s = s2.substr(b, i))) {
			if (false)
				sl('same_length: ' + i + ',' + b + '; [' + m.substr(b) + '], ['
						+ s + '] of [' + n + ']');
			if (s1.indexOf(s, b) === b)
				b += i;
			if (false) {
				sl('*same_length: ' + i + ',' + b + '; [' + m.charAt(b)
						+ '], [' + n.charAt(b) + '] of [' + n + ']');
				var s_l = i && m.charAt(b) == n.charAt(b) ? b + 1 : b;
				sl('*same_length: ' + s_l + ':' + m.slice(0, s_l) + ',<em>'
						+ m.slice(s_l) + '</em>; ' + n.slice(0, s_l) + ',<em>'
						+ n.slice(s_l) + '</em>');
			}
		}
		return i && s1.charAt(b) === s2.charAt(b) ? b + 1 : b;
	};

	/**
	 * 去除指定字串中重複字元。 remove duplicate characters in a string.
	 * 
	 * @param {String}string
	 *            指定字串。
	 * 
	 * @returns 去除重複字元後之字串。
	 */
	function remove_duplicate_characters(string) {
		string = String(string);
		if (!string)
			return '';

		string = string.split('');
		var i = 0, length = string.length, code_array = [], code;
		for (; i < length; i++) {
			code = string[i].charCodeAt(0);
			if (code in code_array) {
				string[i] = '';
			} else {
				code_array[code] = 1;
			}
		}

		return string.join('');
	}

	_// JSDT:_module_
	.remove_duplicate_characters = remove_duplicate_characters;

	// -----------------------------------------------------------------------------

	/**
	 * 產生將數字轉為 K, M, G 等數量級(order of magnitude)表示方式的轉換器。<br />
	 * 原理:先設好各 symbol 使用之下限，比完大小後使用此 symbol。
	 * 
	 * TODO: full test
	 * 
	 * @param {Array}symbol
	 *            array of {String}symbol
	 * @param {Integer}[base]
	 *            define what power
	 * @param {Integer}[index_of_1]
	 *            純量的 index。no prefix. 這之前的算做小數。
	 * @param {String}intervening
	 *            intervening string, 將插入於數字與 symbol 間。e.g., &nbsp;
	 * @return {Function} 改變表示方式之轉換器。
	 * @return {undefined} 輸入有問題。
	 * @requires to_fixed
	 * @see <a href="http://www.merlyn.demon.co.uk/js-maths.htm#DTS"
	 *      accessdate="2012/8/18 12:17">JRS - JavaScript Maths - J R Stockton</a>
	 * @_memberOf _module_
	 */
	function set_order_prefix(symbol, base, index_of_1, intervening) {
		if (!Array.isArray(symbol) || !symbol.length)
			return;

		if (!base)
			base = 10;
		if (!index_of_1) {
			index_of_1 = 0;
			if (symbol[0])
				symbol.unshift('');
		}

		var magnitude = 1, length = symbol.length, value = new Array(length), index = index_of_1;

		// 先設定好各數量級(order of magnitude)之大小。
		while (++index < length) {
			magnitude *= base;
			value[index] = magnitude;
		}
		if (index_of_1) {
			index = index_of_1;
			magnitude = 1;
			while (index--) {
				magnitude /= base;
				value[index] = magnitude;
			}
		}
		value[index_of_1] = 1;

		if (intervening) {
			for (index = 0; index < length; index++) {
				symbol[index] = intervening + symbol[index];
			}
		}

		library_namespace.debug('magnitude array of base ' + base + ': ['
				+ value + ']', 1, 'set_order_prefix');
		library_namespace.debug('prefixes of base ' + base + ': [' + symbol
				+ ']', 1, 'set_order_prefix');

		// cache 引入: symbol, value, length.

		return (
		/**
		 * 將數字轉為 K, M, G 等數量級(order of magnitude)表示方式。
		 * 
		 * @param {Number}number
		 *            數字純量
		 * @param {Number}digits
		 *            to fixed digit
		 * @type {String}
		 * @return {String} 指定數量級(order of magnitude)表示方式
		 * @requires to_fixed
		 */
		function(number, digits) {
			if (typeof number === 'string')
				number = parseFloat(number.replace(/[, ]/g, ''));
			if (!number || isNaN(number))
				return 0;

			var l = 0, r = length, i;
			// 直接用比的。 inline binary search.
			// while (l < (i = Math.floor((l + r) / 2))) {
			while (l < (i = (l + r) >> 1)) {
				library_namespace.debug('compare: ' + number + ', [' + i + ']'
						+ value[i], 3, 'set_order_prefix');
				if (number < value[i]) {
					r = i;
				} else {
					l = i;
				}
			}
			library_namespace.debug('index: [' + i + '] ' + value[i] + ', '
					+ symbol[i], 2, 'set_order_prefix');

			l = number / value[i];
			return to_fixed.call(l, isNaN(digits) || digits < 0 ? (r = Math
					.floor(l)) < 10 ? 2 : r < 100 ? 1 : 0 : digits)
					+ symbol[i];
		});
	}

	/**
	 * 將數字轉為 K, M, G 等 metric prefix / SI prefix 表示方式，例如 6458 轉成 6.31 K。
	 * 
	 * @example <code>

	CeL.to_1000_prefix(12343454345);
	CeL.to_1000_prefix('12,343,454,345');

	</code>
	 * 
	 * @returns
	 * @see <a href="http://en.wikipedia.org/wiki/Metric_prefix"
	 *      accessdate="2012/8/18 12:9">Metric prefix</a>, <a
	 *      href="http://en.wikipedia.org/wiki/International_System_of_Units"
	 *      accessdate="2012/8/18 12:11">International System of Units</a>, <a
	 *      href="http://www.bipm.org/en/si/si_brochure/chapter3/prefixes.html"
	 *      accessdate="2012/8/18 12:10">BIPM - SI prefixes</a>, <a
	 *      href="http://bmanolov.free.fr/numbers_names.php"
	 *      accessdate="2012/8/18 12:19">Names of LARGE and small Numbers</a>
	 */
	function to_1000_prefix() {
		var s = 'yzafpnμm kMGTPEZY', i = s.indexOf(' ');
		s = s.split('');
		s[i] = '';
		return set_order_prefix(s, 1000, i, ' ');
	}

	/**
	 * 將數字轉為 Ki, Mi, Gi 等 binary prefix 表示方式，例如 1024 轉成 1Ki。
	 * 
	 * @example <code>

	CeL.to_1024_prefix(12343454345);

	</code>
	 * 
	 * @returns
	 * @see <a
	 *      href="http://en.wikipedia.org/wiki/Binary_prefix#IEC_standard_prefixes"
	 *      accessdate="2012/8/18 11:53">Binary prefix</a>
	 */
	function to_1024_prefix() {
		return set_order_prefix(',Ki,Mi,Gi,Ti,Pi,Ei,Zi,Yi'.split(','), 1024, 0,
				' ');
	}

	// 不可以 `byte` 為變數名: JsDoc 會失會失效。
	function to_KiB(bytes, type, use_KB) {
		var expression = use_KB ? library_namespace.to_1000_prefix
				: library_namespace.to_1024_prefix, b = bytes + ' byte'
				+ (bytes > 1 ? 's' : '');
		expression = expression(bytes) + 'B';

		if (type && type.toLowerCase() === 'html') {
			expression = '<span title="' + b + '">' + expression + '</span>';
		} else if (library_namespace.is_Object(type)) {
			expression = {
				span : expression,
				title : b
			};
		} else if (type === '()') {
			expression += ' (' + b + ')';
		}

		return expression;
	}
	function to_KB(bytes, type) {
		return to_KiB(bytes, type, true);
	}

	// old alias: CeL.show_KiB(), CeL.show_KB()
	_.to_KiB = to_KiB;
	_.to_KB = to_KB;

	// TODO: accept '300K' as 300 KiB

	// 設定 lazy evaluation。
	library_namespace.set_initializor(to_1000_prefix);
	library_namespace.set_initializor(to_1024_prefix);

	// -----------------------------------------------------------------------------

	/**
	 * for IE3: mode=1:不取空字串<br />
	 * .split() appears from Internet Explorer 4.0
	 * 
	 * @see <a
	 *      href="http://msdn.microsoft.com/en-us/library/s4esdbwz%28v=VS.85%29.aspx"
	 *      accessdate="2010/4/16 20:4">Version Information (Windows Scripting -
	 *      JScript)</a>
	 */
	function StringToArray(s, mode) {
		var a = [], last = 0, i;
		while ((i = s.indexOf(sp, last)) !== NOT_FOUND) {
			if (mode === 0 || last !== i)
				a[a.length] = s.slice(last, i);
			last = i + 1;
		}
		if (mode === 0 || last !== s.length)
			a[a.length] = s.slice(last);
		return a;
	}

	// for IE3: 去除s之空白,包括字與字之間的
	function disposeSpace(s) {
		if (!s)
			return s;
		var r = "", i, last;
		while ((i = s.indexOf(' ', last)) !== NOT_FOUND)
			r += s.slice(last, i), last = i + 1;
		r += s.slice(last);
		return r;
	}

	// for IE3: 以label,mode:m置換s,先找到先贏
	// 輸入t['$k']=..會有問題，需用t['\\$k']=..
	function changeV(s, l, m) {
		var i, r, re, t; // var I='';
		if (!m)
			m = 'g';
		if (s && (t = l ? l : label))
			for (i in t) {
				// I+=', '+i+'='+t[i];
				re = new RegExp(i, m);
				// r=s.replace(re,t[i]);s=r;
				s = s.replace(re, t[i]);
			}
		// pLog(I.substr(2));
		// pLog('changeV:'+s);
		return s;
	}

	/**
	 * <code>
	// 以label置換s,先找到先贏
	function changeV(s) {
		for (var i, j = 0; j < labelN.length; j++)
			if ((i = s.indexOf(labelN[j])) != NOT_FOUND)
				s = s.slice(0, i) + labelV[j] + s.slice(i + labelN[j].length)
				, j = 0; // search again from beginning
		return s;
	}
	 </code>
	 */

	_// JSDT:_module_
	.get_Object_value = function(o) {
		// if (Array.isArray(o)) return o;

		// if (!library_namespace.is_Object(o)) return;
		var i, l = [];
		for (i in o)
			l.push(o[i]);
		return l;
	};

	_// JSDT:_module_
	.
	/**
	 * 互換/reverse key/value pairs.
	 * 
	 * @example <code>
	swap_key_value({A:1,B:2,s:4,t:[]}, [], /^[A-Z_\-\d]+$/) === [,'A','B']
	</code>
	 * @param {Object|object}pairs
	 *            key/value pairs
	 * @param {Object|Array}[base]
	 *            把互換結果放在 base
	 * @param {RegExp}[key_filter]
	 *            僅放入符合的 key
	 * @returns
	 */
	swap_key_value = function(pairs, base, key_filter) {
		if (!base)
			base = {};

		var k;
		if (library_namespace.is_type(key_filter, 'RegExp')) {
			for (k in pairs)
				if (key_filter.test(k))
					base[pairs[k]] = k;
		} else
			for (k in pairs)
				base[pairs[k]] = k;

		return base;
	};

	if (library_namespace.dependency_chain)
		_.dependency_chain = library_namespace.dependency_chain;

	/**
	 * new_Array=[,,]: 可以使用 Array 常值中的空白元素來建立零星稀疏的陣列。
	 */

	// ---------------------------------------------------------------------//
	// UTF-8 char and bytes.
	/**
	 * 計算指定 UTF-8 char code 之 bytes。
	 * 
	 * TODO:<br />
	 * 加快速度。
	 * 
	 * @param {Number}code
	 *            指定之 UTF-8 char code。
	 * @returns {Number} 指定 UTF-8 char code 之 bytes。
	 * @see https://en.wikipedia.org/wiki/UTF-8#Description
	 */
	function bytes_of_UTF8_char_code(code) {
		return code < 0x0080 ? 1 : code < 0x0800 ? 2 : code < 0x10000 ? 3
				: code < 0x200000 ? 4 : code < 0x4000000 ? 5
						: code < 0x80000000 ? 6 : 7;
	}

	/**
	 * 計算指定 UTF-8 text 之 bytes。
	 * 
	 * TODO:<br />
	 * use Buffer.byteLength
	 * 
	 * @param {String}text
	 *            指定之 UTF-8 text。
	 * @returns {Number} 指定 UTF-8 text 之 bytes。
	 */
	function byte_count_of_UTF8(text) {
		var i = 0, length = text.length, bytes = 0;
		for (; i < length; i++)
			bytes += bytes_of_UTF8_char_code(text.charCodeAt(i));
		return bytes;
	}

	/**
	 * 將 UTF-8 text 截成指定 byte 長度。
	 * 
	 * @param {String}text
	 *            指定之 UTF-8 text。
	 * @param {Number}byte_length
	 *            指定之 byte 長度。
	 * @returns {String} UTF-8 text, length <= byte_length.
	 */
	function cut_UTF8_by_bytes(text, byte_length) {
		var i = 0, length = text.length;
		for (; byte_length > 0 && i < length; i++) {
			byte_length -= bytes_of_UTF8_char_code(text.charCodeAt(i));
			if (byte_length < 0)
				i--;
		}
		return i === length ? text : text.slice(0, i);
	}

	_.bytes_of_char_code = bytes_of_UTF8_char_code;
	_.byte_count = byte_count_of_UTF8;
	_.cut_by_bytes = cut_UTF8_by_bytes;

	// ---------------------------------------------------------------------//
	// for bencode & torrent file data.

	/**
	 * [ key_1, value_1, key_2, value_2, key_3, value_3 ]<br /> →<br /> {
	 * key_1: value_1, key_2: value_2, key_3: value_3 }
	 * 
	 * @param {Array}list
	 *            list to convert
	 * 
	 * @returns {Object} pair Object converted
	 * @since 2014/7/21 23:17:32
	 */
	function list_to_Object(list) {
		var i = 0, length = list.length, pair = Object.create(null);
		if (length % 2 !== 0)
			library_namespace.warn('list_to_Object: The length (' + length
					+ ') of list is not an even number!');

		for (; i < length; i += 2) {
			if (typeof list[i] !== 'string')
				library_namespace.warn(
				// Set key to non-string type. e.g., integer
				'Set (' + (typeof list[i]) + ') [' + list[i] + '] as key.');
			if (list[i] in pair)
				library_namespace.warn('Duplicated key: [' + list[i] + ']');

			library_namespace.debug('pair[' + list[i] + '] = [' + list[i + 1]
					+ ']', 3);
			pair[list[i]] = list[i + 1];
		}

		return pair;
	}

	/**
	 * parse bencode data
	 * 
	 * @param {String}data
	 *            bencode data
	 * @param {Object}[status]
	 *            get the parse status
	 * @param {Boolean}[is_ASCII]
	 *            若設定為真，則當作 ASCII 處理。若設定為假，則當作 UTF-8 處理。
	 * 
	 * @returns
	 * 
	 * @see https://zh.wikipedia.org/wiki/Bencode
	 * 
	 * @since 2014/7/21 23:17:32
	 */
	function parse_bencode(data, status, is_ASCII) {

		function make_end() {
			// assert: object_now === queue.pop()
			if ((tmp = object_now) !== queue.pop()) {
				library_namespace.error('Bad data structure!');
				// assert: queue.length === 0
				if (queue !== object_now)
					// 回存。
					queue.push(object_now);
			} else {
				if (tmp.d)
					tmp = list_to_Object(tmp);
				// assert: queue.length > 0
				(object_now = queue.at(-1)).push(tmp);
			}
		}

		// 盡可能不動到 data，因為 data 可能很大。
		var index = 0, tmp, queue = [],
		// 即使在 data 有缺陷的情況下，也盡可能解析出資料。
		// 因此先將 data 設定成 list。
		object_now = queue,
		// 為了多行程，因此這些 pattern 應該放在函數內，不可為 global 為其他行程存取。
		PATTERN_controller = /(.*?)([ldei\d])/g,
		// 為了盡快 match，所以盡可能選擇可能 match 的 pattern，之後再來檢查是否相符。
		PATTERN_integer = /(-?\d*)(\D)/g, PATTERN_string_length = /(\d*)(\D)/g;

		for (;;) {
			PATTERN_controller.lastIndex = index;
			if (!(tmp = PATTERN_controller.exec(data))) {
				if (index < data.length)
					library_namespace.error('Last data skipped! ('
							+ data.slice(index) + ')');
				break;
			}

			if (tmp[1]) {
				index += tmp[1].length;
				// control char should be next char.
				library_namespace.error('Some data skipped! (' + tmp[1] + ')');
			}

			switch (tmp[2]) {
			case 'l':
				// list 列表
			case 'd':
				// dictionary 關聯數組
				++index;
				queue.push(object_now = []);
				if (tmp[2] === 'd')
					object_now.d = true;
				break;
			case 'e':
				// ending
				++index;
				make_end();
				break;

			case 'i':
				// integer 整數
				PATTERN_integer.lastIndex = ++index;
				tmp = PATTERN_integer.exec(data);
				if (tmp && tmp[2] === 'e') {
					// 確定為 /i\d+e/
					if (!tmp[1])
						library_namespace
								.error('No integer specified ("ie" instead of /i\d+e/)!');
					else if (PATTERN_integer.lastIndex !== index
							+ tmp[0].length)
						library_namespace.error('Some integer data skipped! ('
								+ data.slice(index, PATTERN_integer.lastIndex
										- tmp[0].length) + ')');
					object_now.push(parseInt(tmp[1]));
					index = PATTERN_integer.lastIndex;
				} else {
					// fatal error
					library_namespace.error('Bad integer format! Exit parse!');
					index = data.length;
				}
				break;

			default:
				// assert: 接下來是 string (\d+:.+) 字串
				PATTERN_string_length.lastIndex = index;
				tmp = PATTERN_string_length.exec(data);
				if (tmp && tmp[2] === ':') {
					// 確定為 /\d+:/
					if (!tmp[1] || !(tmp[1] | 0))
						library_namespace.error('No string length specified! ('
								+ tmp[1] + ')');
					else if (PATTERN_string_length.lastIndex !== index
							+ tmp[0].length)
						library_namespace.error('Some string data skipped! ('
								+ data.slice(index,
										PATTERN_string_length.lastIndex
												- tmp[0].length) + ')');
					if ((index = PATTERN_string_length.lastIndex)
							+ (tmp = tmp[1] | 0) > data.length)
						library_namespace.error(
						//
						'The end of string is beyond the end of data! (ask '
						// remaining
						+ (index + tmp) + ' - data left ' + data.length
								+ ' = lost ' + (index + tmp - data.length)
								+ ')');
					// tmp: length of string.
					library_namespace.debug(index + '+' + tmp, 3);
					if (is_ASCII) {
						object_now.push(data.substr(index, tmp));
						index += tmp;
					} else {
						// 對 UTF-8 (non-ASCII string) 特別處理:
						// 此時因取得 Unicode，所指定之 length >= 實際 length。
						tmp = cut_UTF8_by_bytes(data.substr(index, tmp), tmp);
						object_now.push(tmp);
						index += tmp.length;
					}
				} else {
					// fatal error
					library_namespace.error('Bad string format! Exit parse!');
					index = data.length;
				}
			}
		}

		if (queue.length > 1)
			library_namespace.warn('Illegal data: 有錯誤或缺陷!');
		while (queue.length > 1 && Array.isArray(queue.at(-1)))
			make_end();

		if (status)
			if (queue.length !== 1)
				status.error = true;

		return queue.length === 1 ? queue[0] : queue;
	}

	/**
	 * parse torrent file data
	 * 
	 * @example <code>

	 // @ JScript
	CeL.run('data', function () {
		// http://www.ubuntu.com/download/alternative-downloads
		CeL.log(CeL.parse_torrent('http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-i386.iso.torrent', true));
	});

	 * </code>
	 * 
	 * @param {String}path
	 *            torrent file path.
	 * @param {Boolean}name_only
	 *            get the torrent name only.
	 * 
	 * @returns {Object} torrent file data
	 * @since 2014/7/21 23:17:32
	 */
	function parse_torrent(path, name_only) {
		// 注意:此方法不可跨 domain!
		// JScript 下，XMLHttpRequest 會將檔案當作 UTF-8 讀取。
		var data = library_namespace.get_file(path);
		var status = Object.create(null);
		if (!data || data.charAt(0) !== 'd') {
			library_namespace.error((data ? 'Illegal' : 'Cannot get')
					+ ' torrent data of [' + path + ']!');
			return;
		}
		library_namespace.debug(data, 4);

		if (name_only) {
			// a fast way to get torrent name.
			var PATTERN_name = /4:name(\d{1,4}):/, matched = data
					.match(PATTERN_name), index;
			if (matched && (matched = matched[1] | 0) > 0) {
				library_namespace.debug('[' + path + '] length: ' + matched, 3);
				// fix for non-ASCII chars, it will be change to Unicode,
				// and the real length <= length specified.
				if (false) {
					// assert: 'piece length' 恰好在 PATTERN_name 之後。
					index = data.indexOf('12:piece lengthi')
							- PATTERN_name.lastIndex;
					return data.substr(PATTERN_name.lastIndex, index > 0 ? Math
							.min(index, matched) : matched);
				}
				return cut_UTF8_by_bytes(data.substr(PATTERN_name.lastIndex,
						matched), matched);
			}
			return;
		}

		data = parse_bencode(data, status);

		return data;
	}

	_.list_to_Object = list_to_Object;
	_.parse_bencode = parse_bencode;
	_.parse_torrent = parse_torrent;

	// ---------------------------------------------------------------------//

	function is_natural(value) {
		return value >= 1 && Math.floor(value) === value;
	}
	// is_non_negative
	function is_natural_or_0(value) {
		return value >= 0 && Math.floor(value) === value;
	}
	function is_integer(value) {
		return Math.floor(value) === value;
	}
	import_options.filters = {
		number : {
			range : function in_range(value) {
				return (typeof this[0] !== 'number' || this[0] <= value)
						&& (typeof this[1] !== 'number' || value <= this[1]);
			},

			// 自然數 natural numbers ℕ*, ℕ+, ℕ>0, ℤ+
			natural : is_natural,
			'ℕ' : is_natural,
			'natural+0' : is_natural_or_0,
			// 'ℕ0'
			'ℕ+0' : is_natural_or_0,
			// 整數
			integer : is_integer,
			'ℤ' : is_integer
		},
		string : {
			IPv4 : /^[12]?\d{1,2}\.[12]?\d{1,2}\.[12]?\d{1,2}\.[12]?\d{1,2}$/,

			// RFC2822 :
			// http://regexlib.com/DisplayPatterns.aspx
			// /^(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
			email :
			// http://www.regular-expressions.info/email.html
			// /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+([a-z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b$/i,
			/^[a-z0-9+_~-]+(\.[a-z0-9+_~-]+)*@([a-z\d]([a-z\d-]*[a-z\d])?\.)+([a-z]{2}|com|org|net)\b$/i,

			// 十進位小數
			decimal : /^[+\-]?(?:\d+|\d*\.\d+)$/,
			// 數字
			digits : library_namespace.is_digits
		}
	};

	/**
	 * @inner
	 */
	function string_options_to_normalizer(string_normalizer) {
		var normalizer = Object.create(null);

		string_normalizer.split('|').forEach(function(type) {
			var matched = type.match(/^([a-z]+):([\s\S]+)$/);
			if (!matched) {
				normalizer[type] = true;
				return;
			}

			type = matched[1];
			// condition
			var _normalizer = matched[2];
			if (_normalizer in import_options.filters[type]) {
				_normalizer = import_options.filters[type][_normalizer];

			} else if (type === 'number' && (matched = _normalizer.match(
			// @see CeL.date.parse_period.PATTERN
			// [ all, min, max ]
			/([+\-]?\d+(?:\.\d+)?)?\s*[–~－—─～〜﹣至]\s*([+\-]?\d+(?:\.\d+)?)?/))) {
				_normalizer = import_options.filters[type]
				// this: [ min, max ]
				.range.bind([ matched[1] && +matched[1],
				//
				matched[2] && +matched[2] ]);

			} else if (type === 'string') {
				matched = _normalizer.match(library_namespace.PATTERN_RegExp);
				if (matched) {
					_normalizer = new RegExp(matched[1], matched[2]);
				} else {
					_normalizer = _normalizer.split(';');
				}

			} else {
				library_namespace.warn('import_options: Invalid normalizer: '
				//
				+ _normalizer);
			}

			normalizer[type] = _normalizer;
		});

		return normalizer;
	}

	/**
	 * 將 options 裡面可使用之選項（依照 options_normalizer 之定義），篩選、正規化並提取至 target。
	 * 
	 * @param {Object}options
	 * @param {Object|String|Function}options_normalizer
	 *            options allowed
	 * @param {Object}[target]
	 *            target options to modify
	 * @returns
	 * 
	 * @see function verify_arg(key, value)
	 * @see function generate_argument_condition(condition) @ CeL.application.net.work_crawler.arguments
	 * @see _.default_verify_pattern @ CeL.interact.form.select_input
	 */
	function import_options(options, options_normalizer, target) {
		options = library_namespace.setup_options(options);
		if (!target) {
			target = Object.create(null);
		}

		for ( var key in options) {
			var value = options[key];
			var normalizer = options_normalizer && options_normalizer[key];
			if (typeof normalizer === 'string') {
				// e.g., 'boolean|string:changed;multi_parts_changed'
				normalizer = string_options_to_normalizer(normalizer);
				// console.trace(normalizer);
			}

			if (typeof normalizer === 'object') {
				var type = Array.isArray(value) ? 'Array'
				//
				: library_namespace.is_RegExp(value) ? 'RegExp'
				//
				: library_namespace.is_Date(value) ? 'Date' : null;
				if (!type || !(type in normalizer)
						&& !((type = type.toLowerCase()) in normalizer)) {
					type = typeof value;
				}

				if (type in normalizer) {
					normalizer = normalizer[type];
				} else {
					// invalid value type
					continue;
				}
			}

			if (normalizer === undefined && options_normalizer) {
				// invalid key / parameter name
				continue;
			}

			if (typeof normalizer === 'function') {
				value = normalizer(value);
			} else if (!fit_filter(normalizer, value)) {
				// treat normalizer as filter
				// invalid value
				continue;
			}

			if (value !== import_options.INVALID
			// && value !== undefined
			) {
				target[key] = value;
			}
		}

		// console.trace(target);
		return target;
	}

	import_options.INVALID = {
		invalid_value : true
	};

	_.import_options = import_options;

	/**
	 * validity value
	 * 
	 * generate_filter: fit_filter.bind(null, filter)
	 * 
	 * @param {Function|RegExp|Array}filter
	 * @param value
	 *            value to test
	 * 
	 * @returns value fits the filter
	 * 
	 * @see function receive() @ CeL.application.net.wiki.page
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text#pattern
	 */
	function fit_filter(filter, value) {
		// if (filter === true) return true;
		if (typeof filter === 'boolean' || filter === null
				|| typeof filter === 'undefined')
			return filter;

		// 驗證 pattern
		if (library_namespace.is_RegExp(filter))
			return filter.test(value);

		if (typeof filter === 'function')
			return filter(value);

		if (typeof filter === 'string') {
			return filter === value;
			// return filter.includes(value);
			// return String(value).includes(filter);
		}

		// e.g., ['A','B','C']
		if (Array.isArray(filter))
			return filter.includes(value);

		if (false && library_namespace.is_Object(filter))
			return value in filter;

		throw new TypeError('Invalid filter');
	}

	_.fit_filter = fit_filter;

	// ---------------------------------------------------------------------//

	return (_// JSDT:_module_
	);
}
