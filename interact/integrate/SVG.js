
/**
 * @name	CeL SVG function
 * @fileoverview
 * 本檔案包含了 SVG 的 functions。
 * @since	
 */


/*
TODO
對無顯示 SVG 的多一項警告。

ASCIIsvg.js
http://www1.chapman.edu/~jipsen/svg/asciisvg.html
*/

'use strict';
if (typeof CeL === 'function')
CeL.run(
{
name:'interact.integrate.SVG',
require : 'data.code.compatibility.|data.native.|data.native.to_fixed|interact.DOM.XML_node|interact.DOM.set_attribute|interact.DOM.remove_all_child|interact.DOM.set_class|data.split_String_to_Object',
code : function(library_namespace) {
	
//	requiring
var XML_node = this.r('XML_node'), set_attribute = this.r('set_attribute'), remove_all_child = this.r('remove_all_child'), set_class = this.r('set_class'), split_String_to_Object = this.r('split_String_to_Object'), to_fixed = this.r('to_fixed');


// ============================================================================
//	definition of module SVG

/*

TODO:
animation
.add_image
*/

//	in 運算子會檢查物件是否有名稱為 property 的屬性。它也會檢查物件的原型，查看 property 是否屬於原型鏈結的一部分。如果 property 是在物件或原型鏈結中，則 in 運算子會傳回 true，否則會傳回 false。	http://msdn2.microsoft.com/zh-tw/library/11e33275(VS.80).aspx

//g_SVG[generateCode.dLK]='set_attribute,XML_node,remove_all_child';//removeNode

/**
 * module SVG 物件之 constructor。<br />
 * 設定 SVG document fragment 並將之插入網頁中。

 * @class	generation of Scalable Vector Graphics<br />
 * 輔助繪圖的基本功能物件，生成 SVG 操作函數。
 * @since	2006/12/7,10-12
 * @deprecated	Use toolkit listed below instead:<br />
 * <a href="http://code.google.com/p/svgweb/" accessdate="2009/11/15 16:34" title="svgweb - Project Hosting on Google Code">svgweb</a><br />
 * <a href="https://launchpad.net/scour" accessdate="2009/11/15 16:35" title="Scour - Cleaning SVG Files in Launchpad">Scour</a>

 * @constructor
 * @param	{int} _width	width of the canvas
 * @param	{int} _height	height of the canvas
 * @param	{color String} [_backgroundColor]	background color of the canvas (UNDO)
 * @requires	set_attribute,XML_node,remove_all_child//removeNode
 * @_type	_module_
 * @_return	{_module_} _module_ object created

 * @see	<a href="http://www.w3.org/TR/SVG/" accessdate="2009/11/15 16:31">Scalable Vector Graphics (SVG) 1.1 Specification</a><br />
 * <a href="http://zvon.org/xxl/svgReference/Output/" accessdate="2009/11/15 16:31">SVG 1.1 reference with examples</a><br />
 * <a href="http://www.permadi.com/tutorial/jsFunc/index.html" accessdate="2009/11/15 16:31" title="Introduction and Features of JavaScript &quot;Function&quot; Objects">Introduction and Features of JavaScript &quot;Function&quot; Objects</a><br />
 * <a href="http://volity.org/wiki/index.cgi?SVG_Script_Tricks" accessdate="2009/11/15 16:31">Volity Wiki: SVG Script Tricks</a><br />
 * <a href="http://pilat.free.fr/english/routines/js_dom.htm" accessdate="2009/11/15 16:31">Javascript SVG et DOM</a>
 */
var _// JSDT:_module_
= function SVG(_width, _height, _backgroundColor){
 var _f = _, _s;
/*
 if(!_f.createENS()){
  // detect SVG support
  // http://modernizr.com/
  //alert('Your browser doesn't support SVG!');
  return;
 }
*/

 _s=	//	raw
	arguments.length===1 && arguments[0] && typeof arguments[0]==='object' && arguments[0].tagName.toLowerCase()==='svg'
	?arguments[0]
	:_f.createNode('svg')
	;
 if(!_s || !_s.createSVGRect) {
	 // doesn't support SVG
	 library_namespace.debug('The browser does not support SVG. 您的瀏覽器不支援 SVG，或是 SVG 動態繪圖功能已被關閉。');
	 return;
 }

 /**
  * SVG document fragment
  * @property
  * @see	<a href="http://www.w3.org/TR/SVG/struct.html#NewDocument" accessdate="2009/11/15 16:53">Defining an SVG document fragment: the 'svg' element</a>
  */
 this.svg=_s;

 //	http://www.w3.org/TR/SVG/struct.html#DefsElement	http://www.svgbasics.com/defs.html
 _s.appendChild(this.defs=_f.createNode('defs'));	//	raw

 //	調整大小。
 this.setSize(_width,_height);
 //	set_attribute(_s,{xmlns:_f.NS.SVG});
 set_attribute(_s,{xmlns:'http://www.w3.org/2000/svg'});
 //	may cause error! should use .setAttributeNS()??
 _s.setAttribute('xmlns:xlink','http://www.w3.org/1999/xlink');
 //viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"

 /**
  * 包含了插入元件的原始資訊。<br />
  * Use {@link #addContain} to add contains.
  * @property
  * @type	Array
  */
 this.contains = [];
 /**
  * 所插入之網頁元素
  * @property
  */
 this.div = null;

 //document.body.appendChild(this.svg);
 return this;//return this.createNode(_nodeN);
};
//_.NS={SVG:'http://www.w3.org/2000/svg',XLink:'http://www.w3.org/1999/xlink'};
_.defaultColor = '#222';

_// JSDT:_module_
.
/**
 * default stroke width. 單位: px
 * 
 * @unit px
 * @type Number
 * @_memberOf _module_
 */
defaultStrokeWidth = .5;	

//_.defaultColor='#444';_.defaultStrokeWidth=1;

_// JSDT:_module_
.
/**
 * 所有造出 id 之 prefix
 * @type	string
 * @_memberOf	_module_
 */
idPrefix =
	// +'_SVG_';
	library_namespace.to_module_name(this.id) + '.';

// _.bout closure.
//_.createENS=document.createElementNS?function(){return document.createElementNS(arguments[0],arguments[1]);}:null;
_// JSDT:_module_
.
/**
 * create SVG document fragment (only for .createNode)
 * @param _ns	namespaceURI
 * @param _qn	qualifiedName
 * @param _a	propertyA
 * @param _i	innerObj
 * @return
 * @_memberOf	_module_
 * @function
 * @private
 */
createENS = function(_ns, _qn, _a, _i) {
	return (
		// document.createElementNS?XML_node(_ns+':'+_qn,_a,0,_i):null;
		XML_node(_ns + ':' + _qn, _a, 0, _i));
};

_// JSDT:_module_
.
/**
 * create SVG document fragment 元件(component)。<br />
 * SVG 之 document fragment 與 HTML 不同 namespace，因此我們需要使用到 <a href="http://www.w3.org/2000/svg">http://www.w3.org/2000/svg</a> 來作為 XML elements 的 namespace。為了未來的兼容性，我們將這個功能獨立出來。
 * @param _nodeN	node/tag name
 * @param {hash|string}_a	attribute/property
 * @param _i	inner object
 * @return	node created or null
 * @_memberOf	_module_
 * @private
 * @function
 */
createNode = function(_nodeN, _a, _i) {
 //return this.createENS?this.createENS('svg',_nodeN||'svg'):null;
 return _.createENS('svg', _nodeN || 'svg', _a, _i);

 //	Error: uncaught exception: [Exception... "Illegal operation on WrappedNative prototype object"  nsresult: "0x8057000c (NS_ERROR_XPC_BAD_OP_ON_WN_PROTO)"  location: "JS frame :: file:///C:/kanashimi/www/cgi-bin/program/tmp/JavaScript%20Framework/dojo/dojo-0.4.0-ajax/a.htm :: anonymous :: line 29"  data: no]
 //	http://www.codingforums.com/archive/index.php?t-94573.html	When you do var x = document.getElementById and then x('hello') you are executing the function x in the context of the window object instead of the document object. Gecko probably utilizes the scoping of the document object to access some internal methods to execute getElementById, which the window object doesn't have.
 //	http://developer.mozilla.org/en/docs/Safely_accessing_content_DOM_from_chrome	http://developer.mozilla.org/en/docs/Working_around_the_Firefox_1.0.3_DHTML_regression	http://www.codingforums.com/archive/index.php?t-68554.html
 // OK?
 //return this.createENS?this.createENS.call(document,'svg',_nodeN||'svg'):null;
 // fault:
 //return this.createENS===document.createElementNS?document.createElementNS('svg',_nodeN||'svg'):this.createENS?this.createENS('svg',_nodeN||'svg'):null;
 //return this.createENS?(alert(this.createENS===document.createElementNS),Function.apply(this.createENS,['svg',(_nodeN||'svg')])):null;
 //return this.createENS?(alert(this.createENS===document.createElementNS),this.createENS.apply(document.createElementNS,['svg',(_nodeN||'svg')])):null;
};
/*
_.createLink=function(_ref){
 return this.createENS('xLink','xlink:href');
};
*/

_// JSDT:_module_
.
/**
 * 從 id 獲得 node
 * @param id	id
 * @return	node
 * @_memberOf	_module_
 * @private
 */
getNodeById = function(id) {
	// return this.svg.getElementById(_i);//useless?

	// lookupPrefix()
	return document.getElementById(id);
};

_// JSDT:_module_
.
/**
 * get a random ID to use.
 * @param tag	tag name(nodeType)
 * @return	a random ID
 * @_memberOf	_module_
 * @private
 */
getRandomID = function(tag) {
	if (typeof tag === 'object')
		tag = tag.tagName/* nodeType */;
	var _j;
	while (_.getNodeById(_j = _.idPrefix + tag + '_'
			+ String(Math.random()).slice(2, 6)))
		;
	return _j;
};
_// JSDT:_module_
.
/**
 * give a random ID to the specified node.
 * @param _n	node
 * @return	id of the specified node
 * @_memberOf	_module_
 * @private
 */
setRandomID = function(_n) {
	if (_n && typeof _n === 'object') {
		/**
		 * id of the specified node
		 * @inner
		 * @ignore
		 */
		var _i = set_attribute(_n, 'id');
		if (!_i)
			set_attribute(_n, {
				id : _i = _.getRandomID(_n)
			});
		return _i;
	}
};

_// JSDT:_module_
.
/**
 * 改變 text
 * @param text_node	text object
 * @param text	change to this text
 * @return
 * @_memberOf	_module_
 * @see
 * <a href="http://www.w3.org/TR/SVG/text.html" accessdate="2009/12/15 0:2">Text - SVG 1.1 - 20030114</a>
 * <tref xlink:href="#ReferencedText" />
 */
changeText = function(text_node, text) {
	//if (typeof remove_all_child === 'function')
	//	remove_all_child(text_node);
	//else throw new Error(1, 'changeText: function remove_all_child is not included!');
	remove_all_child(text_node);

	if (text)
		text_node.appendChild(document.createTextNode(text));
	//else removeNode(_textO);
};

_// JSDT:_module_
.
addTitle = function(_o, _t_d) {
	if (_t)
		_o.appendChild(this.createNode('title', 0, _t));
	// A more descriptive label should be put in a <desc> child element
	if (_t)
		_o.appendChild(this.createNode('desc', 0, _t));
};


/*	transform	http://www.w3.org/TR/SVG/coords.html#TransformAttribute	http://archive.dojotoolkit.org/nightly/tests/gfx/test_image.html
recommend for performance reasons to use transformation matrices whenever possible.	http://www.mecxpert.de/svg/transform.html
 * @memberOf	module SVG
 */
_// JSDT:_module_
.
setTransform = function(_o, _t) {
	//	TODO
	throw new Error(1, 'setTransform: Not Yet Implemented!');
	set_attribute(_o, {
				transform : _t
			});
};

// ============================================================================
//	definition of module SVG object

var prototype = {

/**
 * 顯現 this module SVG object
 * @param _v	visible
 * @return	this module SVG object
 * @_memberOf	_module_
 */
show : function(_v) {
	var _d = this.div;
	if (this.svg)
		if (_d) {// _s.parentNode
			_d.style.display = typeof _v === 'undefined' ? _d.style.display === 'none' ? 'block'
					: 'none'
						: _v ? 'block' : 'none'; // block怪怪的
		} else if (_v || typeof _v === 'undefined')
			this.div = XML_node('div', 0, [ document.body ],
					this.svg);
	return this;
},
setAttribute : function() {
	this.svg && this.svg.setAttribute(arguments);
	return this;
},
//setDimensions
/**
 * 調整 canvas 大小。
 * @unit	px
 * @param {Integer} _width	width in px
 * @param {Integer} _height	height in px
 * @return	this module SVG object
 * @_memberOf	_module_
 */
setSize : function(_width, _height) {
	_width = parseInt(_width) || 0;
	_height = parseInt(_height) || 0;

	if (_width > 0 && _height > 0)
		set_attribute(this.svg, {
			width : _width,
			height : _height
		});

	return this;
},
getSize : function() {
	return set_attribute(this.svg, 'width,height');
},

/**
 * 將本 Object 附在 _n 上(attach to node)
 * @param _n	HTML/SVG object
 * @return
 */
attach : function(_n) {
	if (this.svg) {

		if (typeof _n === 'string')
			_n = _.getNodeById(_n);

		if (!_n)
			return this;

		var _t = _n.tagName.toLowerCase();
		if (_t === 'svg')
			//	TODO: 若不想創建新 node..
			return new _(_n);

		if (_t === 'div') {
			//if(this.div){TODO: 原先已經 attach}
			this.div = _n;
			_n.appendChild(this.svg);
		}

	}

	return this;
},

get_XML : function() {
	var _t = document.createElement('div'), _x, _s = this.svg;

	if (!_s)
		// error!
		return;

	//	TODO: 效率不高!
	_t.appendChild(_s = _s.cloneNode(true));
	_x = _t.innerHTML;
	_t.removeChild(_s);
	// 確保在此環境下 create 出來的會被 destory
	_t = null;
	// ugly hack
	// &lt;?xml version="1.0" encoding="UTF-8" standalone="no"?&gt;
	_x = _x.replace(/(\s)(href=['"])/g, '$1xlink:$2');

	return _x;
},

/**
 * 清除 canvas<br />
 * 很可能會出問題!
 * @return	this SVG
 * @_memberOf	_module_
 * @since	2009/12/18 21:17:09
 */
clean : function() {
	var s = this.svg;
	//	[0]: <defs>
	while (s.childNodes.length > 1)
		//library_namespace.debug(s.childNodes.length + ',' + s.lastChild),
		s.removeChild(s.lastChild);

	// 保留 <defs>，remove childrens of <defs>
	//remove_all_child(s.lastChild, 1);
	s = s.lastChild;
	while (s.hasChildNodes())
		//library_namespace.debug(s.childNodes.length + ',' + s.lastChild),
		s.removeChild(s.lastChild);

	return this;
},

/*
usage:
lastAdd.onclick = SVG_object.removeSelf;
*/
removeSelf : function () {
	try {
		this.parentNode.removeChild(this);
	} catch (e) {
	}
	return false;
},

/**
 * 創建本物件之 SVG 群組。<br />
 * 利用 SVG 群組我們可以同時操作多個 SVG elements。
 * @param {hash|string}_a	attribute/property
 * @param _i	inner object
 * @return	this SVG
 * @_memberOf	_module_
 */
createGroup : function(_a, _i) {
	var _g = _.createNode('g', _a, _i);
	this.group = _g;
	return this;
},
/**
 * 綁定 SVG elements 至本物件群組。<br />
 * 這函數將已存在的 SVG elements 綁定至本物件之群組中。若群組不存在，則創建出一個。
 * @param _n	node
 * @return	this module SVG object
 * @_memberOf	_module_
 */
attachGroup : function(_n) {
	if (!this.group)
		this.createGroup();
	this.group.appendChild(_n);
	return this;
},

createSymbol : function(_a, _i) {
	var _s = _.createNode('symbol', _a, _i);
	this.symbol = _s;
	return this;
},
attachSymbol : function(_n) {
	if (!this.symbol)
		this.createSymbol();
	this.symbol.appendChild(_n);
	return this;
},

setFill : function() {
	//	TODO
	throw new Error(1, 'setFill: Not Yet Implemented!');
},
setStroke : function() {
	//	TODO
	throw new Error(1, 'setStroke: Not Yet Implemented!');
},
setShape : function() {
	//	TODO
	throw new Error(1, 'setShape: Not Yet Implemented!');
},
setTransform : function() {
	//	TODO
	throw new Error(1, 'setTransform: Not Yet Implemented!');
},

//<animateMotion>,<animateColor>

/**
 * 最後一個增加的 instance
 * @_memberOf	_module_
 */
lastAdd: null,
/**
 * 最後一個增加的 definition
 * @_memberOf	_module_
 */
lastAddDefs: null,
/**
 * 增加 SVG element。<br />
 * 結合 .prototype.addDefs 與 .prototype.addUse，作完定義後隨即使用之。
 * @param _n	tagName(nodeType)
 * @param {hash|string} _a	attribute/property
 * @param _i	inner object
 * @return
 * @_memberOf	_module_
 */
addNode : function(_n, _a, _i) {
	if (typeof _n === 'string')
		_n = _.createNode(_n, _a, _i);
	if (_n) {
		this.addDefs(_n);
		this.addUse(_n);
	}
	return this;
},

/**
 * 增加 SVG 定義。<br />
 * SVG 規範中聲明，SVG 的 &lt;use&gt; element 不能引用外部文件或其 elements。因此我們在創建實例之前，需要先在本物件中作定義。
 * @param _n	node
 * @return
 * @_memberOf	_module_
 */
addDefs : function(_n) {
	// var _d=this.defs;
	if (_n) {
		_.setRandomID(_n);
		this.defs.appendChild(this.lastAddDefs = _n);
	}
	return this;
},
/**
 * 增加 SVG 實例。<br />
 * 利用本物件中之定義創建實例並增添至本物件中。<br />
 * 在裝載 b.svg 時，將 a.svg 中的 defs 中的圖元裝載到 b.svg 中（文件上是兩者是保持獨立的，但在內存中將二者合二為一），這樣就可以在b.svg中直接引用這些圖元了。<br />
 * SVG 規範中聲明，SVG 的 &lt;use&gt; element 不能引用外部文件或其 elements。因此我們在創建實例之前，需要先在本物件中作定義。
 * @param _i	id
 * @param _a
 * @return
 * @_memberOf	_module_
 */
addUse : function(_i, _a) {
	var _s = this.svg, _o = _.createNode('use', _a);
	if (_o && _s && _i) {
		if (typeof _i === 'object')
			_i = _.setRandomID(_i);
		set_attribute(_o, {
			'xlink:href' : '#' + _i
		});
		_s.appendChild(this.lastAdd = _o);
	}
	return this;
},

/**
 * 增加插入的元件。<br />
 * 應該用 <a href="http://www.w3.org/TR/SVG/struct.html#SymbolElement">symbol</a>
 * @param _o	object reference
 * @param _type	type of this component
 * @param [propertyO]	other properties
 * @return
 * @requires	split_String_to_Object
 * @_memberOf	_module_
 */
addContain : function(_o, _type, propertyO) {
	if (_type && this.contains) {
		if (typeof propertyO === 'string')
			propertyO = split_String_to_Object(propertyO);
		if (propertyO.o || propertyO.t)
			this.contains.push( {
				o : _o,
				t : _type,
				p : propertyO
			});
		else
			propertyO.o = _o, propertyO.t = _type, this.contains
			.push(propertyO);
	}
	return this;
},


/**
 * 繪製直線。<br />
 * 此函數利用 _.eNode 造出直線元件之後，再用 .prototype.addNode 將之插入本物件中。
 * @param _left
 * @param _top
 * @param _width
 * @param _height
 * @param _color
 * @param _strokeWidth
 * @return
 * @_memberOf	_module_
 */
addLine : function(_left, _top, _width, _height, _color, _strokeWidth) {
	var _l = _.createNode('line', {
		x1 : _top,
		y1 : _left,
		x2 : _top + _width,
		y2 : _left + _height,
		stroke : _color || this.addLine.defaultColor,
		'stroke-width' : _strokeWidth || _.defaultStrokeWidth
	});
	if (_l && this.svg) {
		//this.svg.appendChild(_l);
		this.addNode(_l);
	}
	return this;
},


/**
 * 繪製曲線路徑。<br />
 * 此函數利用 _.eNode 造出路徑元件之後再用 .prototype.addNode 將之插入本物件中。
 * @param _d
 * @param _color
 * @param _strokeWidth
 * @param _fill
 * @return
 * @_memberOf	_module_
 */
addPath : function(_d, _color, _strokeWidth, _fill) {
	var _p = _.createNode('path', {
		d : _d,
		stroke : _color || this.addLine.defaultColor,
		'stroke-width' : _strokeWidth || _.defaultStrokeWidth,
		fill : _fill || 'none'
	});
	if (_p && this.svg)
		this.addNode(_p);
	return this;
},


//xml:space="default|preserve"
/**
 * 添加文字。<br />
 * 此函數利用 _.eNode 造出文字元件之後再用 .prototype.addNode 將之插入本物件中。
 * @param _text
 * @param _left
 * @param _baseLine
 * @param {Object}style
 *            drawing style
 * @return
 * @_memberOf	_module_
 */
addText : function(_text, _left, _baseLine, style) {
	if (!library_namespace.is_Object(style))
		if (typeof style === 'string' && style)
			style = { color : style };
		else
			style = {};

	if (style.color)
		this.addText.defaultColor = style.color;
	else
		style.color = this.addText.defaultColor;

	if (/^[^\s#]+$/.test(style.font) && !style['font-family'])
		// TODO: 還有問題
		style['font-family'] = style.font;

	if (style['font-family'])
		this.addText.defaultFont = style['font-family'];
	else if (this.addText.defaultFont)
		style['font-family'] = this.addText.defaultFont;

	//if (!style['font-size']) style['font-size'] = this.addText.defaultCharWidthPx + 'px';

 //	http://www.w3.org/TR/SVG/text.html	<tref xlink:href="#ReferencedText" />
 //var _o=document.createTextNode(_text);
 //var _o=_.createNode('tspan',{x:_left,y:_baseLine,stroke:style.color||this.addText.defaultColor,style:style['font-family']?'font-family:"'+style['font-family']+'"':null},_text);
 //this.addNode(_.createNode('text',{x:_left,y:_baseLine,stroke:style.color||this.addText.defaultColor,style:style['font-family']?'font-family:"'+style['font-family']+'"':null},_o));
 //this.lastAdd=_o;

	var i, s = [], fill = style.fill || style.color || this.addText.defaultColor,
	//
	stroke = style.stroke || style.color || this.addText.defaultColor;
	for (i in style)
		s.push(i+':'+style[i]);
	style=s.join(';');

	// ugly hack: 說是_baseLine，其實還是會再往下一點點。
	_baseLine -= 2;
	this.addNode(_.createNode('text', {
		x : _left,
		y : _baseLine,
		fill : fill,
		stroke : stroke,
		style : style
	}, _text));
	//(text|g).pointer-events="none": Make text unselectable

/*	本法為標準，但FF尚未支援。
 var _s=this.svg,_i=_.getRandomID('text')_.SVG.createNode('text',{id:_i},_text);
 this.addDefs(this.lastAddDefs=_o);
 _o=_.createNode('text',{x:_left,y:_baseLine,stroke:style.color||this.addText.defaultColor,style:style.font?'font-family:"'+style.font+'"':null},0,_t=_.createNode('tref'));
 _t.setAttributeNS('xLink','xlink:href','#'+_i);
 _o.appendChild(_t);
 _s.appendChild(this.lastAdd=_o);
*/

	return this;
},

/**
 * add digital number
 * @param _text
 * @param _left
 * @param _baseLine
 * @param _tW
 * @param {Object}style
 *            drawing style
 * @return
 * @see
 * _left: http://www.w3.org/TR/SVG/text.html#TSpanElementXAttribute
 */
addNum : function(_text, _left, _baseLine, _tW, style) {
	if (typeof _text !== 'string')
		_text = String(_text);

	if (_text) {
		if(!/^\s*[+\-]?(?:\d+,)*\d*(?:\.\d+)?\s*$/.test(_text))
			library_namespace.debug({
				// gettext_config:{"id":"illegal-$1-$2"}
				T: [ 'Illegal %1: [%2]', 'number', _text ]
			}, 2, 'SVG.addNum');
		
		//	說是_baseLine，其實還是會再往下一點點。
		_baseLine -= 2;
		if (!_tW)
			_tW = this.addText.defaultCharWidthPx;

		var _o = [], _i = 0, _s = this.svg, skipped = 0, character, skip_this, decimal_point_added;
		for (; _i < _text.length; _i++) {
			// _text.split('')
			//	讓數字本身對齊，小數點(radix point/decimal point)作為附加。
			character = _text.charAt(_i);
			// 是否 skip space, 不計算此 char 之寬度。
			skip_this = character === '.' || character === ',';
			if (skip_this && _i)
				skipped++;

			//	skip spaces.
			if (character !== ' ')
				_o.push(_.createNode('tspan', {
					x : _left + (_i - skipped) * _tW + (skip_this && _i ? this.addText.defaultCharMinWidthPx : 0),
					stroke : (skip_this ? decimal_point_added ? style && style.error_dot || '#f00' : (decimal_point_added = true, style && style.dot || '#0bf') : ''),
					style : (skip_this ? 'font-weight:bold;' : '')
					//, y:_baseLine
				}, character));
		}

		if (_s) {
			if (!library_namespace.is_Object(style))
				if (typeof style === 'string' && style)
					style = { color : style };
				else
					style = {};

			_s.appendChild(this.lastAdd = _.createNode('text', {
				y : _baseLine,
				stroke : style.color || this.addText.defaultColor,
				style : //'font-size:' + this.addText.defaultCharWidthPx + 'px;' + 
						(style.font ? 'font-family:"' + style.font + '";' : '')
			}, _o));
		}
	}
	return this;
},


addTitle : function(title, object) {
	if (title) {
		if (!object)
			object = this.lastAdd;
		// using SVG <title> tag.
		object.appendChild(_.createNode('title', null, title));
	}
	return this;
},

/**
 * add parallel graph
 * @param _ds
 * @param _h
 * @param _d
 * @param _us
 * @param tramA
 * @return
 * @since	2006/12/18 0:35
 */
addParallelG : function(_ds, _h, _d, _us, tramA) {
	if (_ds && _h) {
		if (isNaN(_us) || _us === '')
			_us = _ds;
		set_attribute(this
				.addPath('M' + _ds + ',' + _h + ' H0 L' + (_d || 0)
						+ ',0' + (_us ? ' h' + _us : '') + ' z'), {
			transform : tramA
		}); //	0==''
	}
	return this;
},

lastQuadrilateral : null,
lastQuadrilateralDefs : null,
/**
 * 畫簡單長方形或平行四邊形、梯形
 * @param _ds
 * @param _h
 * @param _d
 * @param _us
 * @param tramA
 * @return
 * @see	<a href="http://zh.wikipedia.org/wiki/%E5%B9%B3%E8%A1%8C%E5%9B%9B%E8%BE%B9%E5%BD%A2">平行四邊形</a>
 * @_memberOf	_module_
 */
addQuadrilateral:function(_ds,_h,_d,_us,tramA){	//	down side,height,upper distance,upper side
 this.addParallelG(_ds,_h,_d,_us,tramA).addContain(this.lastQuadrilateralDefs=this.lastAddDefs,'quadrilateral',{down_side:_ds,hight:_h,distance:_d,upper_side:_us});
 this.lastQuadrilateral = this.lastAdd;	//	set_attribute(s.lastQuadrilateral,'fill=none');
 return this;
},

lastTriangle : null,
lastTriangleDefs : null,
/**
 * 畫簡單三角形
 * @since	2006/12/17 12:38
 * @param _ds
 * @param _h
 * @param _d
 * @param tramA
 * @return
 * @_memberOf	_module_
 */
addTriangle : function(_ds, _h, _d, tramA) {
	this.addParallelG(_ds, _h, _d, 0, tramA).addContain(
			this.lastTriangleDefs = this.lastAddDefs, 'triangle', {
				down_side : _ds,
				hight : _h,
				distance : _d
			});
	this.lastTriangle = this.lastAdd;
	return this;
},


/**
 * 繪製橢圓曲線。<br />
 * 此函數利用 _.eNode 造出橢圓曲線元件之後，再用 .prototype.addNode 將之插入本物件中。
 * @param _rx
 * @param _ry
 * @param _cx
 * @param _cy
 * @param _color
 * @param _strokeWidth
 * @param _fill
 * @param tramA
 * @return
 * @_memberOf	_module_
 */
addEllipsePath : function(_rx, _ry, _cx, _cy, _color, _strokeWidth,
		_fill, tramA) {
	if (_rx) {
		var _e, _p = {
				rx : _rx,
				ry : _ry,
				cx : _cx,
				cy : _cy,
				stroke : _color || this.addEllipsePath.defaultColor,
				'stroke-width' : _strokeWidth || _.defaultStrokeWidth,
				fill : _fill || 'none',
				transform : tramA
		};

		if (!_ry)
			_e = 'circle', _p.r = _rx;
		else
			_e = 'ellipse', _p.rx = _rx, _p.ry = _ry;

		_e = _.createNode(_e, _p);

		if (_e && this.svg)
			this.addNode(_e);
	}
	return this;
},


lastCircle : null,
lastCircleDefs : null,
/**
 * 繪製圓形。<br />
 * 此函數利用 _.type.addEllipsePath 來畫簡單圓形。
 * @param _r	半徑 radius
 * @param _cx
 * @param _cy
 * @return
 * @_memberOf	_module_
 */
addCircle : function(_r, _cx, _cy, _color, _strokeWidth, _fill) {
	if (_r >= 0)
		this.addEllipsePath(_r, '', _cx, _cy, _color, _strokeWidth, _fill).addContain(
				this.lastCircleDefs = this.lastAddDefs, 'circle', {
					r : _r
				});
	return this;
},

lastEllipse : null,
lastEllipseDefs : null,
/**
 * 繪製簡單圓形/橢圓。<br />
 * 此函數利用 .prototype.addEllipsePath 來畫簡單橢圓。
 * @param _rx
 * @param _ry
 * @param _cx
 * @param _cy
 * @return
 * @_memberOf	_module_
 */
addEllipse : function(_rx, _ry, _cx, _cy, color) {
	if (_rx) {
		this.addEllipsePath(_rx, _ry, _cx, _cy, color).addContain(
				this.lastEllipseDefs = this.lastAddDefs, 'ellipse',
				{
					rx : _rx,
					ry : _ry
				});
		this.lastEllipse = this.lastAdd;
	}
	return this;
},


/**
 * 繪製矩形。<br />
 * 此函數利用 _.eNode 造出矩形路徑元件之後，再用 .prototype.addNode 將之插入本物件中。
 * @param _w
 * @param _h
 * @param _x
 * @param _y
 * @param _color
 * @param _strokeWidth
 * @param _fill
 * @param tramA
 * @return
 * @_memberOf	_module_
 */
addRect : function(_w, _h, _x, _y, _color, _strokeWidth, _fill,
		tramA) {
	this.addNode(_.createNode('rect', {
		width : _w,
		height : _h,
		x : _x,
		y : _y,
		stroke : _color || this.addRect.defaultColor,
		'stroke-width' : _strokeWidth || _.defaultStrokeWidth,
		fill : _fill || 'none',
		transform : tramA
	}));
	return this;
},


/**
 * 繪製多邊形。<br />
 * 此函數利用 _.eNode 造出多邊形路徑元件之後再用 .prototype.addNode 將之插入本物件中。
 * @param {Array} _pA	array of integer pair [x1,y1,x2,y2,x3,y3,..]
 * @param _color
 * @param _strokeWidth
 * @param _fill
 * @param tramA
 * @return
 * @_memberOf	_module_
 */
addPolyline : function(_pA, _color, _strokeWidth, _fill, tramA) {
	var _i = 0, _p = [];
	while (_i < _pA.length)
		_p.push(_pA[_i++] + ',' + _pA[_i++]);
	this.addNode(_.createNode('polyline', {
		points : _p.join(' '),
		stroke : _color || this.addRect.defaultColor,
		'stroke-width' : _strokeWidth || _.defaultStrokeWidth,
		fill : _fill || 'none',
		transform : tramA
	}));
	return this;
},


addImage : function() {
	//	TODO
	throw new Error(1, 'addImage: Not Yet Implemented!');
},

/**
 * 功能正常嗎？
 * @return	{Boolean} 功能正常
 */
status_OK : function() {
	// !!: dual-unary operator
	return !!this.svg;
}

};	//	_.prototype={

//other manual setting
prototype.addLine.defaultColor = _.defaultColor;
prototype.addPath.defaultColor = _.defaultColor;
prototype.addText.defaultColor = _.defaultColor;
prototype.addText.defaultFont = null;
prototype.addText.defaultCharWidthPx = 10;
prototype.addText.defaultCharMinWidthPx = 7;
prototype.addEllipsePath.defaultColor = _.defaultColor;
prototype.addRect.defaultColor = _.defaultColor;
prototype.addPolyline.defaultColor = _.defaultColor;

Object.assign(_.prototype, prototype);

prototype = null;

//	↑definition of module SVG object

//	↑definition of module SVG
// ============================================================================


/**#@+
 * @_description	use {@link _module_} to draw:
 */

/*
draw_circle[generateCode.dLK]
	=draw_ellipse[generateCode.dLK]
	=draw_triangle[generateCode.dLK]
	=draw_quadrilateral[generateCode.dLK]
	='g_SVG';
*/

_// JSDT:_module_
.
/**
 * 繪製圓形。
 * @since	2006/12/19 18:05
 * @param _r
 * @param {SVG}[SVG_object]
 *            SVG object
 * @param _color
 * @param _fill
 * @return	module SVG object
 * @_memberOf	_module_
 */
draw_circle = function(_r, SVG_object, _color, _fill) {
	var g_SVG = library_namespace.SVG;
	if (_r
			&& (SVG_object || (SVG_object = new g_SVG(
					(_r + g_SVG.defaultStrokeWidth) * 2,
					(_r + g_SVG.defaultStrokeWidth) * 2).show()))
					&& SVG_object.status_OK()) {
		SVG_object.addCircle(_r, _r + g_SVG.defaultStrokeWidth, _r
				+ g_SVG.defaultStrokeWidth);
		return SVG_object;
	}
};
_// JSDT:_module_
.
/**
 * 繪製橢圓。
 * @param _rx
 * @param _ry
 * @param {SVG}[SVG_object]
 *            SVG object
 * @param _color
 * @param _fill
 * @return	module SVG object
 * @_memberOf	_module_
 */
draw_ellipse = function(_rx, _ry, SVG_object, _color, _fill) {
	var g_SVG = library_namespace.SVG;
	if (_rx
			&& _ry
			&& (SVG_object || (SVG_object = new g_SVG(
					(_rx + g_SVG.defaultStrokeWidth) * 2,
					(_ry + g_SVG.defaultStrokeWidth) * 2).show()))
					&& SVG_object.status_OK()) {
		SVG_object.addEllipse(_rx, _ry, _rx + g_SVG.defaultStrokeWidth, _ry
				+ g_SVG.defaultStrokeWidth);
		return SVG_object;
	}
};


_// JSDT:_module_
.
/**
 * 畫簡單梯形。
 * @since	2006/12/17 12:38
 * @requires	split_String_to_Object,set_attribute,XML_node,removeNode,remove_all_child,g_SVG,draw_quadrilateral
 * @param _ds
 * @param _h
 * @param _d
 * @param _us
 * @param {SVG}[SVG_object]
 *            SVG object
 * @param _color
 * @param _fill
 * @return	module SVG object
 * @_memberOf	_module_
 */
draw_quadrilateral = function(_ds, _h, _d, _us, SVG_object, _color, _fill) {
	var g_SVG = library_namespace.SVG;
	if (isNaN(_us) || _us === '')
		_us = _ds;
	if (_ds
			&& _h
			&& (SVG_object || (SVG_object = new g_SVG((_ds > _d + _us ? _ds : _d
					+ _us)
					+ g_SVG.defaultStrokeWidth, _h
					+ g_SVG.defaultStrokeWidth).show()))
					&& SVG_object.status_OK()) {
		set_attribute(SVG_object.addQuadrilateral(_ds, _h, _d, _us).lastQuadrilateral,
				{
			stroke : _color,
			fill : _fill
				});
		return SVG_object;
	}
};

_// JSDT:_module_
.
/**
 * 畫簡單三角形。
 * @since	2006/12/17 12:38
 * @requires	split_String_to_Object,set_attribute,XML_node,removeNode,remove_all_child,g_SVG,draw_triangle
 * @param _ds
 * @param _h
 * @param _d
 * @param {SVG}[SVG_object]
 *            SVG object
 * @param _color
 * @param _fill
 * @return	module SVG object
 * @_memberOf	_module_
 */
draw_triangle = function(_ds, _h, _d, SVG_object, _color, _fill) {
	var g_SVG = library_namespace.SVG;
	if (_ds
			&& _h
			&& (SVG_object || (SVG_object = new g_SVG((_ds > _d ? _ds : _d)
					+ g_SVG.defaultStrokeWidth, _h
					+ g_SVG.defaultStrokeWidth).show()))
					&& SVG_object.status_OK()) {
		set_attribute(SVG_object.addTriangle(_ds, _h, _d).lastTriangleDefs, {
			stroke : _color,
			fill : _fill
		});
		return SVG_object;
	}
};

/*
draw_addition[generateCode.dLK]
	=draw_multiplication[generateCode.dLK]
	=draw_long_division[generateCode.dLK]
	='g_SVG,draw_scale';
*/

/**
 * default 畫筆。
 * @inner
 * @private
 */
var draw_scale = {
		/**
		 * text width
		 * @inner
		 * @private
		 */
		tW : 10,
		/**
		 * text height
		 * @inner
		 * @private
		 */
		tH : 2 * (10/* tW */- 2),
		/**
		 * 小數點。
		 * TODO:
		 * Run-time inclusion.
		 * 
		 * @inner
		 * @private
		 */
		ds : library_namespace.is_included('application.locale') ? library_namespace.gettext.numeral.decimal_mark() : '.',
		/**
		 * width of decimal separator
		 */
		dsw : 4,
		/**
		 * line height
		 * @inner
		 * @private
		 */
		lH : 4,
		/**
		 * margin left
		 * @inner
		 * @private
		 */
		mL : 0,
		/**
		 * margin top
		 * @inner
		 * @private
		 */
		mT : 0,
		/**
		 * 直式除法除號弧寬, division arc width
		 * @inner
		 * @private
		 */
		division_arc_width : 10
};


/**
 * 以小數點為準對齊數字。<br>
 * 會改變 {Array}lines!
 * 
 * @param {Array}lines
 *            numbers, text,.. 本 Array 會被改變!
 * @param {String}[type]
 *            tab stop. 定位點/定位方法。<br>
 *            left, center, right, decimal. 靠左定位/置中定位/靠右定位/對齊小數點定位.<br>
 * 
 * @returns {Array} 對齊後的 list。
 * 
 * @see <a
 *      href="http://office.microsoft.com/en-us/word-help/set-tab-stops-or-clear-them-HA101854821.aspx"
 *      accessdate="2012/9/19 19:16">Set tab stops or clear them</a>,<br>
 *      <a href="http://en.wikipedia.org/wiki/Decimal" accessdate="2012/9/19
 *      19:23">Decimal</a>
 */
function align_number(lines, type) {
	type = String(type).toLowerCase();
	var decimal_tab = type === 'decimal', i = 0, length, line, regular_line, separator_index,
	//
	max_left_length = 0, max_right_length = 0,
	// ** 計算 max_padding_length 可能造成頗大成本! 不如放棄。
	// max_padding_length = 0,
	//
	left_length = 0, right_length = 0,
	//
	left_length_Array = [], right_length_Array = [];
	if (!Array.isArray(lines) || (length = lines.length) < 2)
		return lines;

	// phase 1: 遍歷 list 以測定最大長度。
	for (; i < length; i++) {
		if (typeof (line = lines[i]) !== 'string')
			line = String(line);
		line = line.trim();
		// /^[+\-]?(?:\d+,)*\d*(?:\.\d+)?$/

		if (decimal_tab) {
			// 去掉/省略 comma 逗號 ','。
			regular_line = line.replace(/,/g, '');

			separator_index = regular_line.indexOf('.');
			// 省略 separator。
			if (separator_index === -1) {
				left_length = regular_line.length;
				right_length = 0;
			} else {
				left_length = separator_index;
				// -1: 省略 separator。
				right_length = regular_line.length - separator_index - 1;
			}

			// 紀錄 length。
			left_length_Array.push(left_length);
			//	對齊小數點後位數, count/Number of decimal places.
			right_length_Array.push(right_length);

			if (max_left_length < left_length)
				max_left_length = left_length;
			// else if (max_padding_length < max_left_length - left_length)
			// max_padding_length = max_left_length - left_length;

			if (max_right_length < right_length)
				max_right_length = right_length;
			// else if (max_padding_length < max_right_length - right_length)
			// max_padding_length = max_right_length - right_length;
		} else {
			// 去掉/省略 comma 逗號 ',', '.'。
			regular_line = line.replace(/[,.\xA0]/g, '');
			left_length_Array.push(left_length = regular_line.length);
			if (max_left_length < left_length)
				max_left_length = left_length;
		}

	}

	// phase 2: 遍歷 list 以補足不夠的長度。
	if (// max_padding_length
	max_right_length || max_left_length) {
		switch (type) {
		case 'decimal':
			regular_line = function() {
				lines[i] = line
						.slice(0, max_left_length - left_length_Array[i])
						+ lines[i]
						+ line.slice(0, max_right_length
								- right_length_Array[i]);
			};
			break;
		case 'left':
			regular_line = function() {
				lines[i] += line.slice(0, max_right_length
						- left_length_Array[i]);
			};
			break;
		case 'center':
			regular_line = function() {
				right_length = max_right_length - left_length_Array[i];
				left_length = Math.floor(right_length / 2);
				lines[i] = line.slice(0, left_length) + lines[i]
						+ line.slice(0, right_length - left_length);
			};
			break;
		case 'right':
		default:
			regular_line = function() {
				lines[i] = line.slice(0, max_right_length
						- left_length_Array[i])
						+ lines[i];
			};
		}
		for (i = 0, line = ' '.repeat(Math.max(
		// max_padding_length
		max_right_length, max_left_length)); i < length; i++)
			regular_line();
	}

	return lines;
}
_// JSDT:_module_
.
align_number = align_number;

function handle_comma(number) {
	return Number(typeof number === 'string' ? number.replace(/,/g, '') : number);
}


//	加減乘除四則運算

//draw_scale.tH=22,draw_scale.tW=12;	//	for print
/**
 * 利用 module SVG 物件來演示整數、小數的直式加法/直式減法 (columnar addition)。<br>
 * TODO: 進位。
 * 
 * @param {Number}number1
 *            被加數
 * @param {Number}number2
 *            加數
 * @param {SVG}[SVG_object]
 *            SVG object
 * @param {Object}[style]
 *            drawing style
 * 
 * @return {SVG} module SVG object
 * 
 * @since 2006/12/26 17:47 整數的直式加減法。<br>
 *        2012/9/19 21:27:14 重構:小數的直式加減法。
 * 
 * @see <a href="http://www.ctan.org/pkg/xlop" accessdate="2012/9/19
 *      20:30">package xlop</a>
 * 
 * @_memberOf _module_
 */
function draw_addition(number1, number2, SVG_object, style) {
	if (!number1 && !number2)
		return SVG_object;

	//	檢查與設定 SVG_object。
	if (SVG_object && SVG_object.status_OK())
		SVG_object.clean();
	else if (!(SVG_object = new library_namespace.SVG).show().status_OK())
		return null;

	var width, operator = '+',
	//
	numbers = number2,
	//
	text_width = draw_scale.tW, text_height = draw_scale.tH,
	//
	line_height = draw_scale.lH,
	//
	margin_left = draw_scale.mL, margin_top = draw_scale.mT;

	//	檢測是加是減。
	if (number2 < 0 || /^\s*-/.test(number2)) {
		operator = '-';
		number2 = number2 < 0 ? -number2 : String(number2).replace(/^\s*-/, '');
	}

	numbers = align_number([ number1, number2,
	                         to_fixed.call(handle_comma(number1) + handle_comma(numbers)) ], 'decimal');

	// text_width/2 operator text_width/2 max_number_length(被加數===加數)
	width = (2 + numbers[0].replace(/[,.\xA0]/g, '').length) * text_width;

	// TODO: 讓 IE8 顯示起來像 111+111=222, 而非 +111111222。
	// 被加數+加數=和
	return SVG_object.setSize(
	// margin_left text_width/2 operator text_width/2 max_number_length(被加數===加數) margin_left
	2 * margin_left + width,
	// margin_top 被加數 加數 line_height 和 margin_top
	2 * margin_top + 3 * text_height + line_height)

	// 被加數
	.addNum(numbers[0], number1 = margin_left + 2 * text_width, margin_top + text_height, text_width, style)
	// + : \s operator(加號) \s 加數
	.addText(operator, margin_left + text_width / 2, margin_top + 2 * text_height, style)
	// 加數
	.addNum(numbers[1], number1, margin_top + 2 * text_height, text_width, style)
	// = 橫直線
	.addPath('M' + margin_left + ',' + (margin_top + 2 * text_height + line_height / 2)
			+ ' H' + width)
	// 和
	.addNum(numbers[2], number1, margin_top + 3 * text_height + line_height, text_width, style);
}
_// JSDT:_module_
.
draw_addition = draw_addition;

/**
 * 呼叫 draw_subtraction 來演示直式減法。因為直式加減法的運算與機制過程非常相似，因此我們以 draw_addition()
 * 來一併的處理這兩個相似的運算過程。
 * 
 * @param {Number}number1
 *            被減數
 * @param {Number}number2
 *            減數
 * @param {SVG}[SVG_object]
 *            SVG object
 * @param {Object}[style]
 *            drawing style
 * 
 * @return {SVG} module SVG object
 * 
 * @since 2006/12/26 17:47 整數的直式加減法。
 * 
 * @_memberOf _module_
 */
function draw_subtraction(number1, number2, SVG_object, style) {
	return draw_addition(number1, '-' + number2, SVG_object, style);
};
_// JSDT:_module_
.
draw_subtraction = draw_subtraction;


/**
 * 利用 module SVG 物件來演示直式乘法。<br />
 * TODO: 2.0*3.0
 * 
 * @param {Number}number1
 *            被乘數
 * @param {Number}number2
 *            乘數
 * @param {SVG}[SVG_object]
 *            SVG object
 * @param {Object}[style]
 *            drawing style
 * 
 * @return {SVG} module SVG object
 * 
 * @since 2006/12/26 17:47 整數的直式乘法。<br>
 *        2012/9/19 23:53:42 重構:小數的直式乘法:數字向右對齊。積的小數位數，是 (被乘數+乘數) 的小數位數。
 * 
 * @see <a href="http://203.71.239.19/math/courses/cs04/M4_6.php"
 *      accessdate="2010/1/20 18:5">小數篇：小數的乘法</a>
 * 
 * @_memberOf _module_
 */
function draw_multiplication(number1, number2, SVG_object, style) {
	if (!number1 && !number2)
		return SVG_object;

	//	檢查與設定 SVG_object。
	if (SVG_object && SVG_object.status_OK())
		SVG_object.clean();
	else if (!(SVG_object = new library_namespace.SVG).show().status_OK())
		return null;

	var i = 0, l, digit, padding = '', width,
	//
	numbers = [ number1, number2,
	            to_fixed.call(handle_comma(number1) * handle_comma(number2)) ],
	//
	text_width = draw_scale.tW, text_height = draw_scale.tH,
	//
	line_height = draw_scale.lH,
	//
	margin_left = draw_scale.mL, margin_top = draw_scale.mT;

	// 直接改成整數乘法，增快速度並避免 <a href="http://en.wikipedia.org/wiki/Round-off_error" accessdate="2012/9/19 22:21" title="Round-off error">round-off error</a>。
	number1 = handle_comma(String(number1).replace(/\./, ''));
	number2 = String(handle_comma(String(number2).replace(/[\-.]/g, '')));

	//	先把各項算出來。
	l = number2.length;
	if (l > 1)
		for (; l > 0; padding += '_')
			if (digit = Number(number2.charAt(--l)))
				numbers.push(number1 * digit + padding);

	numbers = align_number(numbers, 'right');

	// margin_left text_width/2 operator(×) text_width/2 max_number_length margin_left
	width = (2 + numbers[0].replace(/[,.\xA0]/g, '').length) * text_width;

	// TODO: 讓 IE8 顯示起來像 111+111=222, 而非 +111111222。
	// 被乘數×乘數=積
	SVG_object.setSize(
	// margin_left text_width/2 operator(×) text_width/2 max_number_length margin_left
	2 * margin_left + width,
	// margin_top 被乘數 乘數 line_height (numbers.length-3) line_height 積 margin_top
	2 * margin_top + numbers.length * text_height + 2 * line_height)

	// 被乘數
	.addNum(numbers[0], number1 = margin_left + 2 * text_width,
			margin_top + text_height, text_width, style)
	// × : \s operator(乘號) \s 乘數
	.addText('×', margin_left + text_width / 2, margin_top + 2 * text_height, style)
	// 乘數
	.addNum(numbers[1], number1, margin_top + 2 * text_height, text_width, style)
	// = 橫直線
	.addPath('M' + margin_left + ',' + (margin_top + 2 * text_height + line_height / 2)
			+ ' H' + width);

	l = numbers.length;
	if (l === 3) {
		SVG_object
		// 積
		.addNum(numbers[2], number1,
				margin_top + 3 * text_height + line_height, text_width, style);

	} else {
		// = 橫直線
		SVG_object.addPath('M' + margin_left + ',' + (margin_top + (numbers.length - 1) * text_height + 3 * line_height / 2)
								+ ' H' + width)
		// 積
		.addNum(numbers[2], number1, margin_top + numbers.length * text_height + 2 * line_height, text_width, style);

		for (i = 3, padding = margin_top + 2 * text_height + line_height; i < l; i++)
			SVG_object.addNum(numbers[i].replace(/_/g, ' '), number1, padding += text_height, text_width, style);
	}
	return SVG_object;
};
_// JSDT:_module_
.
draw_multiplication = draw_multiplication;

//draw_long_division[generateCode.dLK]='g_SVG,set_class';//split_String_to_Object,set_attribute,XML_node,removeNode,remove_all_child,g_SVG,draw_long_division


/*

test:
000.000007
.0007
.7
7.
34
1.1
1000.0001
21.0001
21000.21
1700000
69999.9999


*/

/**
 * 利用 module SVG 物件來展示<a href="http://en.wikipedia.org/wiki/Long_division"
 * title="long division">直式整數/小數除法</a>。<br />
 * 
 * 小數除法:<br />
 * 把除數轉化成整數: 同時右移除數與被除數的小數點。<br />
 * 商的小數點 與 轉化後 被除數的小數點對齊。<br />
 * 餘數的小數點 與 原來 被除數的小數點對齊。
 * 
 * TODO: 尚有許多 bug。<br />
 * .2/.5
 * 
 * TODO: 換基底。
 * 
 * @param {Number}dividend
 *            被除數
 * @param {Number}divisor
 *            除數
 * @param {Integer}[decimal_places]
 *            TODO: 小數直式除法: 商需要計算到的小數點後位數。<br />
 *            Count/number of decimal places.<br />
 *            How many digits after the decimal separator.
 * @param {SVG}[SVG_object]
 *            SVG object
 * @param {Object}style
 *            drawing style
 * 
 * @return module SVG object
 * 
 * @example <code>
 * // include module
 * CeL.run('net.SVG');
 * 
 * //	way 1
 * var SVG_object = new CeL.SVG;
 * SVG_object.attach('panel_for_SVG').show(1);
 * CeL.draw_long_division(452, 34, SVG_object);
 * // You can also put here.
 * //SVG_object.attach('panel_for_SVG').show(1);
 * 
 * //	way 2
 * var SVG_object = CeL.draw_long_division(100000, 7);
 * SVG_object.attach('panel_for_SVG').show(1);
 * 
 * // 另一次顯示
 * CeL.draw_long_division(100, 7, SVG_object);
 * 
 * // 另一次顯示
 * CeL.draw_long_division(699.999, '.000537', 2, SVG_object);
 * </code>
 * 
 * @since 2006/12/11-12 11:36 整數的直式除法。<br />
 *        2012/9/22 22:39:02 小數的直式除法。
 * 
 * @see http://www.calculatorsoup.com/calculators/math/longdivision.php
 * 
 * @_memberOf _module_
 */
function draw_long_division(dividend, divisor, decimal_places, SVG_object,
		style) {
	if (!dividend || !divisor)
		return;

	// 轉正，去除雜物。
	dividend = String(dividend).replace(/\s+$|^[\s\-]+/g, '').replace(/^\./,
			'0.');
	divisor = String(divisor).replace(/\s+$|^[\s\-]+/, '').replace(/^\./, '0.');

	var g_SVG = library_namespace.SVG,
	// 運算時真正使用的值。去除 ',', space 等雜物。原先的 dividend, divisor 將被當作 human-readable
	// string 展示。
	dividend_value = dividend.replace(/[,\s]/g, ''),
	//
	divisor_value = divisor.replace(/[,\s]/g, ''),
	// 暫存用 index。
	index,
	//
	text_width = draw_scale.tW,
	//
	text_height = draw_scale.tH,
	//
	line_height = draw_scale.lH,
	//
	margin_left = draw_scale.mL,
	//
	margin_top = draw_scale.mT,
	//
	division_arc_width = draw_scale.division_arc_width,
	// 被除數 box 的 x。
	// margin_left divisor division_arc
	base_x = margin_left + divisor.replace(/[\s.,]/g, '').length * text_width
			+ division_arc_width,
	// 被除數 box 已經填到的 y。
	base_y = margin_top + 2 * text_height + line_height;

	// -----------------------------------------------------------

	// 規範/正規化 decimal places。
	if (decimal_places && g_SVG === decimal_places.constructor) {
		// skip decimal_places.
		style = SVG_object;
		SVG_object = decimal_places;
		decimal_places = undefined;
	} else if (!(0 <= decimal_places && decimal_places < 20))
		decimal_places = undefined;

	// 檢查與設定 SVG_object。
	if (SVG_object && SVG_object.status_OK())
		SVG_object.clean();
	else if (!(SVG_object = new g_SVG).show().status_OK())
		return null;

	var original_answer = to_fixed.call(dividend_value / divisor_value);
	library_namespace.debug('計算 ' + dividend_value + ' / ' + divisor_value + ' = ' + original_answer, 1, 'draw_long_division');

	index = dividend_value.indexOf('.');
	// 被除數原先的整數位數。
	var dividend_decimal_places = index === -1 ? dividend_value.length : index;
	// 將被除數轉成{String}整數。
	dividend_value = dividend_value.replace(/\./, '');

	index = divisor_value.indexOf('.');
	// 除數需要右移成整數的位數。
	// 把除數轉化成整數時，同時右移除數與被除數小數點的位數。
	var moved_places = index === -1 ? 0 : divisor_value.length - index - 1;

	// 將除數轉成{Integer}整數。
	divisor_value = Number(divisor_value.replace(/\./g, ''));

	if (isNaN(decimal_places = Number(decimal_places))) {
		//	若可整除，則盡量算到最後，否則僅算到商為整數。
		calculate_length = Number(dividend_value);
		if (Number(dividend_value + '0'.repeat(19 - dividend_value.length)) % divisor_value) {
			//	無法整除，則僅算到商為整數。
			decimal_places = 0;
		} else {
			//	若可整除，則盡量算到最後。
			decimal_places = String(original_answer).match(/\.(\d+)/);
			decimal_places = decimal_places ? decimal_places[1].length : 0;
		}
		library_namespace.debug('自動判別商需要計算到的小數點後位數: start with ['+decimal_places+'] '+calculate_length+'/'+divisor_value, 2, 'draw_long_division');
	}

	var
	// 總共應計算的位數。
	calculate_length = dividend_decimal_places + moved_places + decimal_places,
	// 填補用 space.
	spaces = ' '.repeat(calculate_length);

	// TODO: check 轉換過的除數/被除數有問題.

	library_namespace.debug([ '被除數 3 區段: 原被除數/餘數對齊的小數點 ', {
		em : dividend_decimal_places
	}, ' → 商對齊的小數點 ', {
		em : moved_places
	}, ' → 商需要計算到的小數點後位數 ', {
		em : decimal_places
	}, {
		br : null
	}, '總共應計算的位數 ', {
		em : calculate_length
	} ], 2, 'draw_long_division');

	// -----------------------------------------------------------

	var
	/**
	 * 商 quotient.
	 * 
	 * @inner
	 * @ignore
	 */
	quotient = '',
	/**
	 * 餘數 remainder.
	 * 
	 * @inner
	 * @ignore
	 */
	remainder = 0,
	// 已經計算過。
	already_added,
	//
	left_align = function(n) {
		n = String(n)
			// 減去小數點等雜物本身所佔位數。
			.replace(/[\-\s,\xA0.]/g, '');
		return spaces.slice(0, index + 1 - n.length) + n;
	};

	SVG_object
	// 除數 divisor
	.addNum(divisor + (moved_places ? '.' : ''), margin_left, base_y,
			text_width, style);

	if (false)
		SVG_object.show(1).addNode(
				'path',
				{
					d : 'M' + (bx + (dividend_value.length + 1) * tW) + ','
							+ (by - lH / 2 - tH) + 'H' + (bx - tW) + ' a' + tW
							/ 2 + ',' + (lH + tH) + ' 0 0,1-' + tW / 2 + ','
							+ (lH + tH),
					stroke : '#000',
					style : 'fill:none;'
				});

	// division arc 與每次遞歸之橫線長。
	var line_length = Math.max(calculate_length, dividend_value.length) * text_width;

	// division_arc
	SVG_object.addPath('M' + (base_x - (text_width + division_arc_width) / 2)
			+ ',' + (base_y + line_height / 2) + ' a' + text_width / 2 + ','
			+ (line_height + text_height) + ' 0 0,0 ' + text_width / 2 + ',-'
			+ (line_height + text_height) + ' h'
			+ (line_length + division_arc_width / 2));

	// 每次遞歸之橫線。
	SVG_object.addDefs(g_SVG.createNode('line', {
		x1 : 0,
		y1 : 0,
		x2 : line_length,
		y2 : 0,
		// 'stroke-width':'1px',
		stroke : SVG_object.addLine.defaultColor
	}));
	var line = SVG_object.lastAddDefs;

	if (SVG_object.div)
		// SVG_object.div.className='long_division';
		set_class(SVG_object.div, 'long_division');

	// 用 symbol??
	SVG_object.addContain(0, 'long_division', {
		dividend : dividend,
		divisor : divisor
	});

	// -----------------------------------------------------------
	// main loop: 一個個處理 dividend_value 的 character。
	index = 0;
	for ( var next_remainder, multiple; index < calculate_length; index++) {
		// i: 被除數處理到第幾位。
		if (index < dividend_value.length) {
			remainder = 10 * remainder + Number(dividend_value.charAt(index));
		} else {
			// 沒餘數，不用算了。
			if (remainder === 0) {
				if (decimal_places)
					//	確保 decimal_places 為正確之數值。
					decimal_places -= calculate_length - index;
				break;
			}
			// 填充 '0'。
			remainder *= 10;
		}

		// 下一個餘數。
		next_remainder = remainder % divisor_value;
		// 本位數之商是否為非 0?
		if (next_remainder === remainder)
			// 不夠除，再添加到夠減的位數。
			quotient += '0';
		else {
			// 本次除去之倍數。
			multiple = remainder - next_remainder;
			if (false) {
				library_namespace.debug('<br />[' + left_align(multiple)
						+ ']<br />[' + left_align(next_remainder) + ']');
				library_namespace.assert(multiple / divisor_value < 10)
			}

			if (already_added)
				SVG_object.addNum(left_align(remainder), base_x, base_y += 2
						* text_height + line_height, text_width, style);
			else
				already_added = true;

			SVG_object
			//
			.addNum(left_align(multiple), base_x, base_y + text_height,
					text_width, style)
			// 每次遞歸之橫線。
			.addUse(line, {
				x : base_x,
				y : base_y + text_height + line_height / 2
			});

			quotient += multiple / divisor_value;
			remainder = next_remainder;
		}
	}

	index--;
	remainder = left_align(remainder) + dividend_value.slice(index + 1);
	if (remainder.length > dividend_decimal_places) {
		remainder = (remainder.slice(0, dividend_decimal_places) + '.' + remainder
				.slice(dividend_decimal_places)).replace(/ \./, '0.').replace(
				/\.( +)/, function($0, $1) {
					return '.' + '0'.repeat($1.length);
				});
	}
	if (dividend_decimal_places + moved_places > quotient.length) {
		//	補足應有之位數。
		quotient += spaces.slice(0, dividend_decimal_places + moved_places - quotient.length);
	}
	quotient = quotient
		//	去除首幾位之 0。
		.replace(/^(0+)([^.])/, function($0, $1, $2) {
			return ' '.repeat($1.length) + $2;
		});

	library_namespace.debug([ 'quotient: [', quotient, ']', {
		br : null
	}, 'remainder: [', remainder, ']' ], 2, 'draw_long_division');

	// 驗算。
	if (false)
		library_namespace
				.debug(Number(dividend_decimal_places < dividend_value.length ? dividend_value
						.slice(0, dividend_decimal_places)
						+ '.' + dividend_value.slice(dividend_decimal_places)
						: dividend_value)
				//
				===
				//
				(Number(remainder) + to_fixed.call(quotient * (moved_places ?
				// error on 0.1/0.007
				String(divisor_value).slice(0,
						String(divisor_value).length - moved_places)
						+ '.'
						+ String(divisor_value).slice(
								String(divisor_value).length - moved_places)
						: divisor_value))));

	if (decimal_places) {
		//	增添商的小數點。
		quotient = quotient.slice(0, quotient.length - decimal_places)
				//	.\d → 0.\d
				.replace(/\s+$/, function($0){return '0'.repeat($0.length);})
				//	去除首幾位之 0。
				.replace(/^(0+)([^.])/, function($0, $1, $2) {
					return ' '.repeat($1.length) + $2;
				})
				+ '.'
				//	.\s+ → .0+
				+ quotient.slice(quotient.length - decimal_places)
				.replace(/^\s+/, function($0){return '0'.repeat($0.length);});
	} else {
		quotient = quotient.replace(/\s+$/g, function($0){return '0'.repeat($0.length);});
	}

	// 為 dividend_value 被除數添加移動後的小數點，第二個小數點。
	if (moved_places || dividend_decimal_places < dividend_value.length) {
		if (dividend_value.length < calculate_length)
			dividend_value += '0'.repeat(calculate_length - dividend_value.length);
		dividend_value = dividend_value.slice(0, dividend_decimal_places)
				+ '.'
				+ dividend_value.slice(dividend_decimal_places,
						dividend_decimal_places + moved_places) + '.'
				+ dividend_value.slice(dividend_decimal_places + moved_places);
	}

	// -----------------------------------------------------------

	base_y += 2 * text_height + line_height;

	SVG_object
	// 被除數 dividend
	.addNum(dividend_value, base_x, margin_top + 2 * text_height + line_height,
			text_width, style)
	// 商 quotient
	.addNum(quotient, base_x, margin_top + text_height, text_width, { dot : '#f00' })
	// 餘數 remainder
	.addNum(remainder, base_x, base_y, text_width, style)
	// 調整大小。
	.setSize(base_x +line_length + margin_left, 2 * margin_top + base_y);

	return SVG_object;
}
_// JSDT:_module_
.
draw_long_division = draw_long_division;


/**#@-*/
//	↑@memberOf	module SVG






return (
	_// JSDT:_module_
);
}


});

