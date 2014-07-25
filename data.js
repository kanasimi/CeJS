
/**
 * @name	CeL data function
 * @fileoverview
 * 本檔案包含了 data 處理的 functions。
 * @since	
 */


'use strict';
typeof CeL === 'function' && CeL.run({
name:'data',
require : 'data.native.to_fixed',
code : function(library_namespace) {

//requiring
var to_fixed;
eval(this.use());


/**
 * null module constructor
 * @class	data 處理的 functions
 */
var _// JSDT:_module_
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
_// JSDT:_module_
.prototype = {
};


var NOT_FOUND = -1;


/*
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

*/
/**
 * clone object<br />
 * Object.clone()
 * 
 * @param object
 * @param {Boolean}deep
 *            deep / with trivial
 * @return
 * @since 2008/7/19 11:13:10, 2012/10/16 22:01:12, 2014/5/30 19:35:59.
 */
function clone(object, deep) {
	if (!object || typeof object !== 'object')
		// assert: is 純量 / function
		return object;

	if (Array.isArray(object))
		if (deep) {
			var target = [];
			object.forEach(function (o, index) {
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
		if (object.hasOwnProperty(key)) {
			value = object[key];
			// TODO: 預防 loop, 防止交叉參照/循環參照。
			target[key] = deep ? clone(value, deep) : value;
		}
	return target;
}

_// JSDT:_module_
.
clone = clone;


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
	while ((i = string.indexOf(quote, l)) > 0 && string.charAt(i - 1) === '\\') {
		m = string.slice(l, i - 2).match(/(\\+)$/);
		if (m && m[1].length % 2)
			break;
		else
			l = i + 1;
	}
	return i;
}




//{var a=[],b,t='',i;a[20]=4,a[12]=8,a[27]=4,a[29]=4,a[5]=6,a.e=60,a.d=17,a.c=1;alert(a);b=sortValue(a);alert(a+'\n'+b);for(i in b)t+='\n'+b[i]+'	'+a[b[i]];alert(t);}
//	依值排出key array…起碼到現在，我還看不出此函數有啥大功用。
//	array,否則會出現error!	mode=1:相同value的以','合併,mode=2:相同value的以array填入
function sortValue(a, mode) {
	var s = [], r = [], i, j, b, k = [];
	// 使用(i in n)的方法，僅有數字的i會自動排序；這樣雖不必用sort()，但數字亦會轉成字串。
	for (i in a)
		if ((b = isNaN(i) ? i : parseFloat(i)),
		//
		typeof s[j = isNaN(j = a[i]) ? j : parseFloat(j)] == 'undefined')
			k.push(j), s[j] = b;
		else if (typeof s[j] == 'object')
			s[j].push(b);
		else
			s[j] = [ s[j], b ];
	// sort 方法會在原地排序 Array 物件
	for (i = 0, k.sort(function(a, b) {
		return a - b;
	}); i < k.length; i++)
		if (typeof (b = s[k[i]]) == 'object')
			if (mode == 1)
				// b.join(',')與''+b效能相同
				r.push(b.join(','));
			else if (mode == 2)
				r.push(b);
			else
				for (j in b)
					r.push(b[j]);
		else
			r.push(b);
	return r;
}


/*	2005/7/18 21:26
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
*/
var sortByIndex_I, sortByIndex_Datatype;
function sortByIndex(a, b) {
	// alert(a+'\n'+b);
	for (var i = 0, n; i < sortByIndex_I.length; i++)
		if (sortByIndex_Datatype[n = sortByIndex_I[i]]) {
			if (typeof sortByIndex_Datatype[n] == 'function') {
				if (n = sortByIndex_Datatype[n](a[n], b[n]))
					return n;
			} else if (n = a[n] - b[n])
				return n;
		} else if (a[n] != b[n])
			return a[n] > b[n] ? 1 : -1;
	return 0;
}

/*	2005/7/18 21:26
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

*/
function getIndexSortByIndex(array, separator, indexArray, isNumberIndex) {
	//	判定與事前準備(設定sortByIndex_I,sortByIndex_Datatype)
	if (typeof indexArray === 'number') sortByIndex_I = [indexArray];
	else if (typeof indexArray !== 'object' || indexArray.constructor != Array) sortByIndex_I = [0];
	else sortByIndex_I = indexArray;
	var i, sortByIndex_A = [];
	sortByIndex_Datatype = library_namespace.null_Object();
	if (typeof isNumberIndex == 'object') {
		if (isNumberIndex.constructor == Array) {
			sortByIndex_Datatype = library_namespace.null_Object();
			for (i = 0; i < isNumberIndex.length; i++) sortByIndex_Datatype[isNumberIndex[i]] = 1;
		} else sortByIndex_Datatype = isNumberIndex;
		for (i in sortByIndex_Datatype)
			if (isNaN(sortByIndex_Datatype[i]) || parseInt(sortByIndex_Datatype[i]) != sortByIndex_Datatype[i]) delete sortByIndex_Datatype[i];
	}
	if (typeof array != 'object') return;

	//	main work: 可以不用重造 array 資料的話..
	for (i in array) {
		if (separator) array[i] = array[i].split(separator);
		sortByIndex_A.push(i);
	}
	sortByIndex_A.sort(function (a, b) { return sortByIndex(array[a], array[b]); });

	/*	for: 重造array資料
	var getIndexSortByIndexArray=array;
	for(i in getIndexSortByIndexArray){
	if(separator)getIndexSortByIndexArray[i]=getIndexSortByIndexArray[i].split(separator);
	sortByIndex_A.push(i);
	}
	sortByIndex_A.sort(function (a,b){return sortByIndex(getIndexSortByIndexArray[a],getIndexSortByIndexArray[b]);});
	*/

	return sortByIndex_A;
}


//simpleWrite('char_frequency report3.txt',char_frequency(simpleRead('function.js')+simpleRead('accounts.js')));
//{var t=reduceCode(simpleRead('function.js')+simpleRead('accounts.js'));simpleWrite('char_frequency source.js',t),simpleWrite('char_frequency report.txt',char_frequency(t));}	//	所費時間：十數秒（…太扯了吧！）
_// JSDT:_module_
.
/**
 * 測出各字元的出現率。 普通使用字元@0-127：9-10,13,32-126，reduce後常用：9,32-95,97-125
 * 
 * @param {String} text
 *            文檔
 * @return
 * @_memberOf _module_
 */
char_frequency=function (text) {
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
	//	若是reduceCode()的程式，通常在120項左右。
	for (i = 0, t = 'used:' + used.substr(1) + '\nunused:' + unused.substr(1)
			+ '\n', d = sortValue(c, 2).reverse(); i < d.length; i++) {
		t += NewLine
				+ (a = d[i])
				+ '['
				+ fromCharCode(a).replace(/\0/g, '\\0').replace(/\r/g, '\\r')
						.replace(/\n/g, '\\n').replace(/\t/g, '\\t') + ']'
				+ ':	' + (a = c[typeof a === 'object' ? a[0] : a]) + '	'
				+ (100 * a / l);
		//if(200*v<l)break;	//	.5%以上者←選購
	}
	alert(t);
	return t;
};

/*	
flag:
	(flag&1)==0	表情符號等不算一個字
	(flag&1)==1	連表情符號等也算一個字
	(flag&2)==1	將 HTML tag 全部消掉

可讀性/適讀性
http://en.wikipedia.org/wiki/Flesch-Kincaid_Readability_Test
http://en.wikipedia.org/wiki/Gunning_fog_index
Gunning-Fog Index：簡單的來說就是幾年的學校教育才看的懂你的文章，數字越低代表越容易閱讀，若是高於17那表示你的文章太難囉，需要研究生才看的懂，我是6.08，所以要受過6.08年的學校教育就看的懂囉。
Flesch Reading Ease：這個指數的分數越高，表示越容易了解，一般標準的文件大約介於60~70分之間。
Flesch-Kincaid grade level：和Gunning-Fog Index相似，分數越低可讀性越高，越容易使閱讀者了解，至於此指數和Gunning-Fog Index有何不同，網站上有列出計算的演算法，有興趣的人可以比較比較。

DO.normalize(): 合併所有child成一String, may crash IE6 Win!	http://www.quirksmode.org/dom/tests/splittext.html
*/
_// JSDT:_module_
.
/**
 * 計算字數 count words.
 * 
 * @param {String} text
 *            文檔
 * @param {Number} flag	文檔格式/處理方法
 * @return	{Number} 字數 
 * @_memberOf _module_
 */
count_word = function(text, flag) {
	var is_HTML = flag & 2;

	//	is HTML object
	if (typeof text === 'object')
		if (text.innerText)
			text = text.innerText, is_HTML = false;
		else if (text.innerHTML)
			text = text.innerHTML, is_HTML = true;

	if (typeof text !== 'string')
		return 0;

	//	和perl不同，JScript常抓不到(.*?)之後還接特定字串的東西，大概因為沒有s。(.*?)得改作([\s\S]*?)？ 或者該加/img？
	if (is_HTML)
		text = text
				.replace(/<!--([\s\S]*?)-->/g, '')
				.replace(/<[\s\n]*\/?[\s\n]*[a-z][^<>]*>/gi, '');

	if (flag & 1)
		//	連表情符號或 '（~。），' / 破折號　'——' /　刪節號 '……' 等標點符號也算一個字
		text = text.replace(/[\+\-–*\\\/?!,;.<>{}\[\]@#$%^&_|"'~`—…、，；。！？：()（）「」『』“”‘’]{2,}/g, ';');

	return text
			//	去掉注解用的括弧、書名號、專名號、印刷符號等
			.replace(/[()（）《》〈〉＊＃]+/g, '')
			//	將整組物理量值加計量單位略縮成單一字母。
			//	The general rule of the International Bureau of Weights and Measures (BIPM) is that the numerical value always precedes the unit, and a space is always used to separate the unit from the number, e.g., "23 °C" (not "23°C" or "23° C").
			//	<a href="http://en.wikipedia.org/wiki/ISO_31-0#Expressions" accessdate="2012/7/28 0:42">ISO 31-0</a>,
			//	<a href="http://lamar.colostate.edu/~hillger/faq.html#spacing" accessdate="2012/7/28 0:42">FAQ: Frequently Asked Questions about the metric system</a>.
			.replace(/\d*\.?\d+\s*[a-zA-Z°]+(\s*\/\s*(\d*\.?\d+\s*)?[a-zA-Z°]+)?/g, '0')
			//	將英文、數字、單位等改成單一字母。[.]: 縮寫。[\/]: m/s 之類。
			//	http://en.wikibooks.org/wiki/Unicode/Character_reference/0000-0FFF
			//	http://zh.wikipedia.org/wiki/Unicode%E5%AD%97%E7%AC%A6%E5%88%97%E8%A1%A8
			.replace(/[\wÀ-ÖØ-öø-ȳ\-–'.]{2,}/g, 'w')
			//	date/time or number
			.replace(/[\d:+\-–\.\/,]{2,}/g, '0')
			//	再去掉*全部*空白
			.replace(/[\s\n]+/g, '')
			.length;
};







_// JSDT:_module_
.
/**
 * 運算式值的二進位表示法	已最佳化:5.82s/100000次dec_to_bin(20,8)@300(?)MHz,2.63s/100000次dec_to_bin(20)@300(?)MHz
 * @param {Number} number	number
 * @param places	places,字元數,使用前置0來填補回覆值
 * @return
 * @example
 * {var d=new Date,i,b;for(i=0;i<100000;i++)b=dec_to_bin(20);alert(gDate(new Date-d));}
 * @_memberOf	_module_
 */
dec_to_bin = function(number, places) {
	if (places && number + 1 < (1 << places)) {
		var h = '', b = number.toString(2), i = b.length;
		for (; i < places; i++)
			h += '0';
		return h + b;
	}
	//	native code 還是最快！
	return number.toString(2);

	//	上兩代：慢	var b='',c=1;for(p=p&&n<(p=1<<p)?p:n+1;c<p;c<<=1)b=(c&n?'1':'0')+b;return b;	//	不用'1:0'，型別轉換比較慢.不用i，多一個變數會慢很多
	//	上一代：慢	if(p&&n+1<(1<<p)){var h='',c=1,b=n.toString(2);while(c<=n)c<<=1;while(c<p)c<<=1,h+='0';return h+(n?n.toString(2):'');}
};





/*
	value	(Array)=value,(Object)value=
	[null]=value	累加=value
	value=[null]	value=''

	type: value type	['=','][int|float|_num_]
	*前段
		以[']或["]作分隔重定義指定號[=]與分隔號[,]
	*後段
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

*/
_// JSDT:_module_
.
/**
 * 設定object之值，輸入item=[value][,item=[value]..]。
 * value未設定會自動累加。
 * 使用前不必需先宣告…起碼在現在的JS版本中
 * @param obj	object name that need to operate at
 * @param value	valueto set
 * @param type	累加 / value type
 * @param mode	mode / value type
 * @return
 * @_memberOf	_module_
 */
set_Object_value = function(obj, value, type, mode) {
	if (!value || typeof o !== 'string')
		return;

	var a, b, i = 0, p = '=', sp = ',', e = "if(typeof " + obj + "!='object')"
			+ obj + "=new " + (mode ?
				//	"[]":"{}"
				//	Array之另一種表示法：[value1,value2,..], Object之另一種表示法：{key1:value1,key2:value2,..}
				"Array" : "Object")
			+ ";",
		//	l: item, n: value to 累加
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
		else if (type == parseInt(type))
			type = parseInt(type), Tint = true;
		else
			type = parseFloat(type); // t被設成累加數
	}
	//else t=1;

	if (typeof value === 'string')
		value = value.split(sp);
	// escape regex characters from jQuery
	cmC = new RegExp(cmC.replace(
			/([\.\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1"), 'g'),
			eqC = new RegExp(eqC.replace(
					/([\.\\\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1"), 'g');

	if (type)
		//	n: 現在count到..
		n = -type;

	for (; i < value.length; i++) {
		if (value[i].indexOf(p) === NOT_FOUND)
			value[i] = mode ? p + value[i] : value[i] + p;// if(v[i].indexOf(p)==NOT_FOUND&&m)v[i]=p+v[i];//
			if (mode && value[i] === p) {
				n += type;
				continue;
			}
			a = value[i].split(p);
			if (!mode && !a[0])
				//	去掉不合理的(Array可能有NaN index，所以不設條件。)
				continue;
			a[0] = a[0].replace(cmC, ',').replace(eqC, '='), a[1] = a[1].replace(
					cmC, ',').replace(eqC, '=');
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
					e += obj + '[' + (!type || isNaN(a) ? dQuote(a) : a) + ']='
						+ (!type || isNaN(b) ? dQuote(b) : b) + ';';
	}

	try {
		//if(o=='kk')alert(e.slice(0,500));
		//	因為沒想到其他方法可存取Global的object，只好使用eval..可以試試obj=set_Object_value(0,..){this=new Aaaray/Object}
		return library_namespace.eval_code(e);
	} catch (e) {
		library_namespace.err('Error @ ' + obj);
		library_namespace.err(e);
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
 * @param {String} value_set	字串組, e.g., 'a=12,b=34'
 * @param assignment_char	char to assign values, e.g., '='
 * @param end_char	end char of assignment
 * @return
 * @since	2006/9/6 20:55, 2010/4/12 23:06:04
 * @_memberOf	_module_
 */
split_String_to_Object = function(value_set, assignment_char, end_char) {
	if (typeof value_set !== 'string' || !value_set)
		return {};

	value_set = value_set.split(end_char || /[,;]/);

	if (!assignment_char)
		assignment_char = /[=:]/;

	var a, o = {}, _e = 0, l = value_set.length;
	for (; _e < l; _e++) {
		//	http://msdn.microsoft.com/library/en-us/jscript7/html/jsmthsplit.asp
		a = value_set[_e].split(assignment_char, 2);
		//library_namespace.debug(value_set[_e] + '\n' + a[0] + ' ' + a[1], 2);
		if (a[0] !== '')
			o[a[0]] = a[1];
	}
	return o;
};






/*	2003/10/1 15:46
	比較string:m,n從起頭開始相同字元數
	return null: 格式錯誤，-1: !m||!n
	若一開始就不同：0


TODO:

test starting with

2009/2/7 7:51:58
看來測試 string 的包含，以 .indexOf() 最快。
即使是比較 s.length 為極小常數的情況亦復如此

下面是快到慢：

//	long,short
var contain_substring=[
function(l,s){
 var a=0==l.indexOf(s);
 return a;
}
,function(l,s){
 return 0==l.indexOf(s);
}
,function(l,s){
 return s==l.slice(0,s.length);
}
,function(l,s){
 return l.match(s);
}
,function(l,s){
 for(var i=0;i<s.length;i++)
  if(s.charAt(i)!=l.charAt(i))return 0;
 return 1;
}
];

function test_contain_substring(){
 for(var i=0;i<contain_substring.length;i++){
  var t=new Date;
  for(var j=0;j<50000;j++){
   contain_substring[i]('sdfgjk;sh*dn\\fj;kgsamnd nwgu!eoh;nfgsj;g','sdfgjk;sh*dn\\fj;kgsamnd nwgu!');
   contain_substring[i]('sdbf6a89* /23hsauru','sdbf6a89* /23');
  }
  sl(i+': '+(new Date-t));
 }
}


//	極小常數的情況:
//	long,short
var contain_substring=[
function(l,s){
 var a=0==l.indexOf(s);
 return a;
}
,function(l,s){
 return 0==l.indexOf(s);
}
,function(l,s){
 return s==l.slice(0,1);
}
,function(l,s){
 return s.charAt(0)==l.charAt(0);
}
,function(l,s){
 return l.match(/^\//);
}
];

function test_contain_substring(){
 for(var i=0;i<contain_substring.length;i++){
  var t=new Date;
  for(var j=0;j<50000;j++){
   contain_substring[i]('a:\\sdfg.dfg\\dsfg\\dsfg','/');
   contain_substring[i]('/dsfg/adfg/sadfsdf','/');
  }
  sl(i+': '+(new Date-t));
 }
}


*/

_// JSDT:_module_
.
/**
 * test if 2 string is at the same length.
 * strcmp: String.prototype.localeCompare
 * @param s1	string 1
 * @param s2	string 2
 * @return
 * @_memberOf	_module_
 */
same_length = function(s1, s2) {
	if (typeof m !== 'string' || typeof n !== 'string')
		return;
	if (!s1 || !s2)
		return 0;

	var i = s1.length, b = 0, s = s2.length;
	if (i < s) {
		if (
				//m === n.slice(0, i = m.length)
				0 === s2.indexOf(s1))
			return i;
	} else if (
			//s2==s1.slice(0,i=s2.length)
			i = s, 0 === s1.indexOf(s2))
		return i;

	//sl('*same_length: start length: '+i);
	while ((i = (i + 1) >> 1) > 1 && (s = s2.substr(b, i)))
		//{sl('same_length: '+i+','+b+'; ['+m.substr(b)+'], ['+s+'] of ['+n+']');
		if (s1.indexOf(s, b) === b)
			b += i;
	//sl('*same_length: '+i+','+b+'; ['+m.charAt(b)+'], ['+n.charAt(b)+'] of ['+n+']');
	//var s_l=i&&m.charAt(b)==n.charAt(b)?b+1:b;
	//sl('*same_length: '+s_l+':'+m.slice(0,s_l)+',<em>'+m.slice(s_l)+'</em>; '+n.slice(0,s_l)+',<em>'+n.slice(s_l)+'</em>');
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
.
remove_duplicate_characters = remove_duplicate_characters;

//-----------------------------------------------------------------------------


/**
 * 產生將數字轉為 K, M, G 等數量級(order of magnitude)表示方式的轉換器。<br />
 * 原理:先設好各 symbol 使用之下限，比完大小後使用此 symbol。<br />
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

	library_namespace.debug('magnitude array of base ' + base + ': [' + value
			+ ']', 1, 'set_order_prefix');
	library_namespace.debug('prefixes of base ' + base + ': [' + symbol + ']',
			1, 'set_order_prefix');

	// cache 引入: symbol, value, length.

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
	return function(number, digits) {
		if (typeof number === 'string')
			number = parseFloat(number.replace(/[, ]/g, ''));
		if (!number || isNaN(number))
			return 0;

		var l = 0, r = length, i;
		// 直接用比的。 inline binary search.
		//while (l < (i = Math.floor((l + r) / 2))) {
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
		return to_fixed.call(l,
				isNaN(digits) || digits < 0 ? (r = Math.floor(l)) < 10 ? 2
						: r < 100 ? 1 : 0 : digits)
				+ symbol[i];
	};
};

/**
 * 將數字轉為 K, M, G 等 metric prefix / SI prefix 表示方式，例如 6458 轉成 6.31 K。
 * 
 * @example <code>
 * CeL.to_1000_prefix(12343454345);
 * CeL.to_1000_prefix('12,343,454,345');
 * </code>
 * 
 * @returns
 * @see <a href="http://en.wikipedia.org/wiki/Metric_prefix"
 *      accessdate="2012/8/18 12:9">Metric prefix</a>, <a
 *      href="http://en.wikipedia.org/wiki/International_System_of_Units"
 *      accessdate="2012/8/18 12:11">International System of Units</a>, <a
 *      href="http://www.bipm.org/en/si/si_brochure/chapter3/prefixes.html"
 *      accessdate="2012/8/18 12:10">BIPM - SI prefixes</a>, <a
 *      href="http://bmanolov.free.fr/numbers_names.php" accessdate="2012/8/18
 *      12:19">Names of LARGE and small Numbers</a>
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
 * CeL.to_1024_prefix(12343454345);
 * </code>
 * 
 * @returns
 * @see <a
 *      href="http://en.wikipedia.org/wiki/Binary_prefix#IEC_standard_prefixes"
 *      accessdate="2012/8/18 11:53">Binary prefix</a>
 */
function to_1024_prefix() {
	return set_order_prefix(',Ki,Mi,Gi,Ti,Pi,Ei,Zi,Yi'.split(','), 1024, 0, ' ');
}

function show_KiB(byte, type, use_KB) {
	var expression = use_KB ? library_namespace.to_1000_prefix
			: library_namespace.to_1024_prefix, b = byte + ' byte'
			+ (byte > 1 ? 's' : '');
	expression = expression(byte) + 'B';

	if (type.toLowerCase() === 'html') {
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
function show_KB(bytes, type) {
	return show_KiB(bytes, type, true);
}

_.show_KiB = show_KiB;
_.show_KB = show_KB;

//	設定 lazy evaluation。
library_namespace.set_initializor(to_1000_prefix);
library_namespace.set_initializor(to_1024_prefix);


//-----------------------------------------------------------------------------


// for IE3: mode=1:不取空字串
//	.split() appears from Internet Explorer 4.0
//	<a href="http://msdn.microsoft.com/en-us/library/s4esdbwz%28v=VS.85%29.aspx" accessdate="2010/4/16 20:4">Version Information (Windows Scripting - JScript)</a>
function StringToArray(s, mode) {
	var a = [], last = 0, i;
	while ((i = s.indexOf(sp, last)) != NOT_FOUND) {
		if (mode == 0 || last != i)
			a[a.length] = s.slice(last, i);
		last = i + 1;
	}
	if (mode == 0 || last != s.length)
		a[a.length] = s.slice(last);
	return a;
}

// for IE3: 去除s之空白,包括字與字之間的
function disposeSpace(s) {
	if (!s) return s;
	var r = "", i, last;
	while ((i = s.indexOf(' ', last)) != NOT_FOUND)
		r += s.slice(last, i), last = i + 1;
	r += s.slice(last);
	return r;
}

// for IE3: 以label,mode:m置換s,先找到先贏
//輸入t['$k']=..會有問題，需用t['\\$k']=..
function changeV(s, l, m) {
	var i, r, re, t; //var I='';
	if (!m) m = 'g';
	if (s && (t = l ? l : label)) for (i in t) {
		//I+=', '+i+'='+t[i];
		re = new RegExp(i, m);
		s = s.replace(re, t[i]); //r=s.replace(re,t[i]);s=r;
	}
	//pLog(I.substr(2));
	//pLog('changeV:'+s);
	return s;
}

/*
//以label置換s,先找到先贏
function changeV(s) {
	for (var i, j = 0; j < labelN.length; j++)
		if ((i = s.indexOf(labelN[j])) != NOT_FOUND)
			s = s.slice(0, i) + labelV[j] + s.slice(i + labelN[j].length)
			, j = 0; //research from begin
	return s;
}
*/



_// JSDT:_module_
.
get_Object_value = function(o) {
	//if (Array.isArray(o)) return o;

	//if (!library_namespace.is_Object(o)) return;
	var i, l = [];
	for(i in o)
		l.push(o[i]);
	return l;
};

_// JSDT:_module_
.
/**
 * 互換/reverse key/value pairs.
 * @example <code>
 * swap_key_value({A:1,B:2,s:4,t:[]}, [], /^[A-Z_\-\d]+$/) === [,'A','B']
 * </code>
 * @param {Object|object}pairs	key/value pairs
 * @param {Object|Array}[base]	把互換結果放在 base
 * @param {RegExp}[key_filter]	僅放入符合的 key
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

/*
new_Array=[,,]:	可以使用 Array 常值中的空白元素來建立零星稀疏的陣列。
*/

//---------------------------------------------------------------------//
// see data.native.String_to_RegExp


/**
 * 主要目的：解析文字 source 成 Object，以及用來作 convert。
 * 
 * TODO:<br />
 * 整合 application.OS.Windows.file.cacher
 * 
 * @example <code>

// example 1
var conversion = new CeL.pair(CeL.get_file(path));
text = conversion.convert(text);


// example 2
CeL.run([ 'data.file', 'application.OS.Windows.file' ]);
var cache_file = 'work.codes/get_work_information.cache.txt', cache_pair,
// target encoding
target_encoding = 'UTF-8';

cache_pair = new CeL.pair(null, {
	path : cache_file,
	encoding : target_encoding,
	remove_comments : true
});

cache_pair.add([ [ 'key 1', 'value 1' ] ]);

CeL.log(cache_pair.select('key 1'));

cache_pair.save_new();

 * </code>
 * 
 * @param {Object|Array}source
 * @param {Object}options
 */
function Pair(source, options) {
	if (!is_Pair(this)) {
		library_namespace.warn('Pair: Please use (pair = new Pair()) instead of (pair = Pair())!');
		return new Pair(source, options);
	}

	var is_clone = is_Pair(source);
	if (is_clone)
		// library_namespace.is_Object(source) @ Firefox
		// assert: library_namespace.is_Object(source.pair);
		// assert: Array.isArray(source.keys);
		Object.assign(this, source);

	if (library_namespace.is_Object(options)) {
		// 單一 instance 僅能設定一個 flag。
		// Pair.prototype.add() 不設定 .flag。

		// e.g., flag.
		Object.assign(this, options);
	} else 
		// 前置處理。
		options = library_namespace.null_Object();

	if (!Array.isArray(this.new_keys))
		this.new_keys = [];

	// Warning: 手動設定 .keys, .pair 非常危險!
	if (!library_namespace.is_Object(this.pair)) {
		// initialization.
		this.pair = library_namespace.null_Object();
		this.keys = [];

		if (options.path)
			this.add_path(options);

		if (source)
			this.add(source, options);

	} else if (!Array.isArray(this.keys)) {
		if (options.path)
			this.add_path(options);

		if (!options.no_key)
			this.keys = Object.keys(this.pair);

	} else if (is_clone) {
		this.pair = Object.assign(library_namespace.null_Object(), this.pair);
		this.keys = this.keys.slice();
		if (!options.no_sort)
			this.keys.sort(options.compare_function || this.compare_function);
	}
}

// if the value is instance of Pair
function is_Pair(value) {
	return value && value.constructor === Pair;
}

library_namespace.set_method(Pair, {
	is_pair : is_Pair,

	to_Object : function(source) {
		return (new Pair(source, {
			no_key : true
		})).pair;
	},

	// 排除/移除注解 (//, /* */)。
	// strip/remove javascript comments.
	// @see http://vrana.github.io/JsShrink/
	// @see http://trinithis.awardspace.com/commentStripper/stripper.html
	// @see http://upshots.org/javascript/javascript-regexp-to-remove-comments
	// @see http://marijnhaverbeke.nl//uglifyjs
	remove_comments : function(text) {
		// 僅作最簡單之處理，未考量: "// .. /*", "// .. */", "// /* .. */",
		// 以及 RegExp, "", '' 中注解的情況!
		return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\r\n]*/g, '');
	}
});

library_namespace.set_method(Pair.prototype, {
	add : function(source, options) {
		var pair = this.pair, keys = this.keys;

		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = library_namespace.null_Object();

		if (options.no_key)
			keys = false;

		if (library_namespace.is_Object(source)) {
			if (keys)
				this.keys = keys = Object.keys(Object.assign(pair, source));

		} else {
			if (typeof source === 'string') {
				if (options.remove_comments)
					source = Pair.remove_comments(source);
				// 順便正規化。
				var separator = options.field_separator || this.field_separator;
				if (!separator) {
					// 偵測是 key=value,key=value，
					// 或 key \t value \n key \t value
					if (/[\r\n]/.test(source))
						separator = /[\r\n]+/;
					else if (separator = source.match(/[,;|]/))
						separator = separator[0];
					if (separator)
						library_namespace.debug('Use field separator: [' + separator + ']', 2, 'Pair.add');
				}
				if (separator)
					source = source.split(separator);
				else {
					library_namespace.warn('Pair.add: Can not determine the field separator!');
					source = [ source ];
				}
			}

			if (Array.isArray(source)) {
				var length = source.length,
				// options: 僅納入 key 與 value 不同之 pair。
				unique = options.unique,
				// key / value 分隔符號。
				separator = options.separator || this.separator,
				//
				new_keys = !options.path && this.new_keys,
				//
				item_processor = typeof options.item_processor === 'function' ? options.item_processor
						: null;

				if (!separator && typeof source[0] === 'string') {
					// 遍歷 source 以偵測是 key=value,key=value，
					// 或 key \t value \n key \t value
					for (var i = 0; i < length; i++)
						if (typeof source[i] === 'string'
						&& (separator = source[i].match(/[^\n]([\t=])[^\n]/))) {
							separator = separator[1];
							library_namespace.debug('Use assignment sign: ' + new RegExp(separator), 3, 'Pair.add');
							break;
						}
					if (!separator)
						throw new Error('Pair.add: No assignment sign detected! 請手動指定！');
				}

				library_namespace.debug('Add ' + source.length + ' pairs..', 3, 'Pair.add');
				source.forEach(function(item) {
					if (item_processor)
						item = item_processor(item);
					if (typeof item === 'string')
						item = item.split(separator);
					var key = item[0], value = item[1];
					if (key) {
						library_namespace.debug('adding [' + key + '] → [' + value + ']',
								source.length > 200 ? 3 : 2, 'Pair.add');
						if (key === value) {
							library_namespace.debug('沒有改變的項目：[' + key + ']');
							if (unique)
								return;
							// 可能是為了確保不被改變而設定。
						}
						if (key in pair)
							if (value == pair[key])
								return;
							else
								// 後來覆蓋前面的。
								library_namespace.warn('Pair.add: Duplicated key [' + key
										+ '], value will be change: [' + pair[key] + '] → [' + value + ']');
						pair[key] = value;
						if (keys)
							keys.push(key);
						if (new_keys)
							new_keys.push(key);
					}
				});
			}
		}

		// 排序：長的 key 排前面。
		// 會造成的問題：若 key 為 RegExp 之 source 時，.length 不代表可能 match 之長度。
		// e.g., '([\d〇一二三四五六七八九])米'
		if (keys && !options.no_sort)
			keys.sort(options.compare_function || this.compare_function);

		return this;
	},

	add_path : function(options) {
		var source;
		try {
			// 注意:此方法不可跨 domain!
			source = library_namespace.get_file(this.path);
		} catch (e) {
			// TODO: handle exception
		}
		if (source) {
			if (!options || !options.path)
				options = Object.assign({
					path : this.path
				}, options);
			// 載入 resource。
			this.add(source, options);
		} else
			library_namespace.warn(
			//
			'Pair.add_path: Can not get contents of [' + this.path
					+ ']!');
		return this;
	},

	save : function(path, encoding, save_new) {
		if (!library_namespace.write_file)
			throw new Error('Please include application.OS.Windows.file first!');

		if (path !== this.path)
			path = this.path;
		else if (!save_new && this.remove_comments)
				library_namespace.warn('移除注解後再存檔，會失去原先的注解！請考慮設定 save_new flag。');

		if (!encoding)
			encoding = library_namespace.guess_encoding
			&& library_namespace.guess_encoding(path)
			|| library_namespace.open_format.TristateTrue;
		library_namespace.debug([ '(' + encoding, ') [', path, ']' ], 2, 'Pair.save');

		var _t = this, pair = this.pair, line, data = [],
		//
		separator = this.separator || '\t';
		if (save_new) {
			// 與之前的紀錄分行。
			data.push('');
			this.new_keys.forEach(function (key) {
				if (Array.isArray(line = pair[key]))
					line = line.join(separator);
				data.push(key + separator + line);
			});
			// reset (.new_keys).
			this.new_keys = [];
			if (data.length === 1)
				data = [];
		} else
			for (var key in pair) {
				if (Array.isArray(line = pair[key]))
					line = line.join(separator);
				data.push(key + separator + line);
			}
		if (data.length > 0) {
			library_namespace.debug([ save_new ? 'Appending ' : 'Writing ',
					data.length, ' data to (' + encoding, ') [', path, ']' ], 2, 'Pair.save');
			library_namespace.debug(data.join('<br />'), 3, 'Pair.save');
			library_namespace.write_file(path,
					//
					data.join(this.field_separator || library_namespace.env.line_separator), encoding,
					//
					save_new ? library_namespace.IO_mode.ForAppending : undefined);
		}

		library_namespace.log([ data.length, ' new records saved. [', {
			// 重新紀錄.
			a : 'save again',
			href : '#',
			onclick : function() {
				_t.save(path, encoding, save_new);
				return false;
			}
		}, ']' ]);

		// release memory.
		data = null;
		return this;
	},

	save_new : function(path, encoding) {
		return this.save(path, encoding, true);
	},

	pattern : function(flag) {
		try {
			return new RegExp(this.keys.join('|'), flag || 'g');
		} catch (e) {
			// @IE，當 keys 太多太長時，
			// 若是使用 new RegExp(keys.join('|'), 'g') 的方法，
			// 可能出現 "記憶體不足" 之問題。
		}
	},

	get_keys : function(rebuild) {
		if (rebuild || !Array.isArray(this.keys)) {
			var pair = this.pair, keys = [];
			for (var key in pair)
				keys.push(key);
			// 排序：長的 key 排前面。
			// 會造成的問題：若 key 為 RegExp 之 source 時，.length 不代表可能 match 之長度。
			// e.g., '([\d〇一二三四五六七八九])米'
			keys.sort(this.compare_function);
			this.keys = keys;
		}
		return this.keys;
	},

	for_each : function(operator, options) {
		var pair = this.pair;
		if (Array.isArray(this.keys))
			this.keys.forEach(function(key) {
				operator(key, pair[key]);
			});
		else
			for (var key in pair)
				operator(key, pair[key]);
		return this;
	},

	select : function(selector, options) {
		var pair = this.pair, key, value;

		if (typeof selector !== 'function') {
			var target = selector || options && options.target;
			if (!target)
				return;

			library_namespace.debug('target: ' + target + ', options: ' + options, 3);
			if (options === true)
				return pair[target];

			if (library_namespace.is_RegExp(target))
				selector = function() {
					return target.test(key) && value;
				};
			else {
				var flag = this.flag;
				selector = function() {
					var reg;
					try {
						reg = typeof flag === 'function' ? flag(key)
								: new RegExp(key, flag);
					} catch (e) {
						// Error key?
						library_namespace.err('Pair.select: key ' + (reg || '[' + key + ']')
								+ ': ' + e.message);
					}
					return reg.test(target) && value;
				};
			}
		}

		if (Array.isArray(this.keys))
			for (var i = 0, keys = this.keys, length = keys.length; i < length; i++) {
				if (value = selector(key = keys[i], pair[key]))
					return value;
			}
		else
			for (key in pair) {
				if (value = selector(key, pair[key]))
					return value;
			}
	},

	// convert from key to value.
	convert : function(text) {
		text = String(text);
		var pair = this.pair, flag = this.flag;
		if (library_namespace.is_debug(2)) {
			library_namespace.debug('Convert ' + text.length
					+ ' characters, using ' + this.keys.length
					+ ' pairs with flag [' + flag + '].', 1, 'Pair.convert');
			library_namespace.debug('keys of pairs: '
					+ this.keys.slice(0, library_namespace.is_debug(3) ? 200
							: 20) + '..', 2, 'Pair.convert');
		}

		this.for_each(function(key, value) {
			var reg;
			try {
				reg = typeof flag === 'function' ? flag(key)
						: new RegExp(key, flag);
				text = text.replace(reg, value);
			} catch (e) {
				// Error key?
				library_namespace.err('Pair.convert: ' + (reg || '[' + key + ']')
						+ ' → [' + value + ']: ' + e.message);
			}
		});
		return text;
	},

	reverse : function(options) {
		// 前置處理。
		if (!library_namespace.is_Object(options))
			options = library_namespace.null_Object();

		var this_pair = this.pair, pair = library_namespace.null_Object(), keys = [], key, value, is_number = options.is_number;
		for (value in this_pair)
			if ((key = this_pair[value]) || key === '') {
				if (key in pair)
					library_namespace.warn('Pair.reverse: duplicated key ['
							+ key + ']');
				else {
					pair[key] = is_number ? +value : value;
					keys.push(key);
				}
			}

		if (!options.no_sort)
			keys.sort(options.compare_function || this.compare_function);

		this.keys = keys;
		this.new_keys = keys.slice();
		this.pair = pair;
		return this;
	},

	clone : function(options) {
		return new Pair(this, options);
	},

	compare_function : function(key_1, key_2) {
		// long → short
		return key_2.length - key_1.length;
	},

	/**
	 * {String} key-value 分隔符號.
	 */
	//separator : '\t',
	/**
	 * {String} 欄位分隔符號.
	 */
	//field_separator : /[\r\n]+/,

	// default RegExp flags: global match
	flag : 'g'
});

_.pair = Pair;

//---------------------------------------------------------------------//
// UTF-8 char and bytes.

/**
 * 計算指定 UTF-8 char code 之 bytes。<br />
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


//---------------------------------------------------------------------//
// for bencode & torrent file data.

/**
 * [ key_1, value_1, key_2, value_2, key_3, value_3 ]<br /> →<br /> { key_1:
 * value_1, key_2: value_2, key_3: value_3 }
 * 
 * @param {Array}list
 *            list to convert
 * 
 * @returns {Object} pair Object converted
 * @since 2014/7/21 23:17:32
 */
function list_to_Object(list) {
	var i = 0, length = list.length, pair = library_namespace.null_Object();
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

		library_namespace.debug('pair[' + list[i] + '] = [' + list[i + 1] + ']', 3);
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
			library_namespace.err('Bad data structure!');
			// assert: queue.length === 0
			if (queue !== object_now)
				// 回存。
				queue.push(object_now);
		} else {
			if (tmp.d)
				tmp = list_to_Object(tmp);
			// assert: queue.length > 0
			(object_now = queue[queue.length - 1]).push(tmp);
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
				library_namespace.err('Last data skipped! (' + data.slice(index) + ')');
			break;
		}

		if (tmp[1]) {
			index += tmp[1].length;
			// control char should be next char.
			library_namespace.err('Some data skipped! (' + tmp[1] + ')');
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
					library_namespace.err('No integer specified ("ie" instead of /i\d+e/)!');
				else if (PATTERN_integer.lastIndex !== index + tmp[0].length)
					library_namespace.err('Some integer data skipped! ('
							+ data.slice(index, PATTERN_integer.lastIndex
									- tmp[0].length) + ')');
				object_now.push(parseInt(tmp[1]));
				index = PATTERN_integer.lastIndex;
			} else {
				// fatal error
				library_namespace.err('Bad integer format! Exit parse!');
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
					library_namespace.err('No string length specified! (' + tmp[1] + ')');
				else if (PATTERN_string_length.lastIndex !== index
						+ tmp[0].length)
					library_namespace.err('Some string data skipped! ('
							+ data.slice(index, PATTERN_string_length.lastIndex
									- tmp[0].length) + ')');
				if ((index = PATTERN_string_length.lastIndex)
						+ (tmp = tmp[1] | 0) > data.length)
					library_namespace.err(
					//
					'The end of string is beyond the end of data! (ask '
					//
					+ (index + tmp) + ' - data left ' + data.length
							+ ' = lost ' + (index + tmp - data.length) + ')');
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
				library_namespace.err('Bad string format! Exit parse!');
				index = data.length;
			}
		}
	}

	if (queue.length > 1)
		library_namespace.warn('Illegal data: 有錯誤或缺陷!');
	while (queue.length > 1 && Array.isArray(queue[queue.length - 1]))
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
	var data = library_namespace.get_file(path), status = library_namespace.null_Object();
	if (!data || data.charAt(0) !== 'd') {
		library_namespace.err((data ? 'Illegal' : 'Can not get') + ' torrent data of ['
				+ path + ']!');
		return;
	}
	library_namespace.debug(data, 4);

	if (name_only) {
		// a fast way to get torrent name.
		var PATTERN_name = /4:name(\d{1,4}):/, matched = data.match(PATTERN_name), index;
		if (matched && (matched = matched[1] | 0) > 0) {
			library_namespace.debug('[' + path + '] length: ' + matched, 3);
			// fix for non-ASCII chars, it will be change to Unicode,
			// and the real length <= length specified.
			if (false) {
				// assert: 'piece length' 恰好在 PATTERN_name 之後。
				index = data.indexOf('12:piece lengthi') - PATTERN_name.lastIndex;
				return data.substr(PATTERN_name.lastIndex,
						index > 0 ? Math.min(index, matched) : matched);
			}
			return cut_UTF8_by_bytes(data.substr(PATTERN_name.lastIndex, matched), matched);
		}
		return;
	}

	data = parse_bencode(data, status);

	return data;
}


_.list_to_Object = list_to_Object;
_.parse_bencode = parse_bencode;
_.parse_torrent = parse_torrent;


//---------------------------------------------------------------------//

return (
	_// JSDT:_module_
);
}


});
