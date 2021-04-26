/**
 * @name CeL file function for XML
 * @fileoverview 本檔案包含了處理 XML file 的 functions。
 * @since
 */

// More examples: see /_test suite/test.js
'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	// application.storage.format.EPUB
	name : 'data.XML',

	require : '',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// nothing required

	/**
	 * null module constructor
	 * 
	 * @class XML 操作相關之 function。
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
	 parse XML document
	 http://www.adp-gmbh.ch/web/js/msxmldom/methods_properties.html
	 http://www.w3pop.com/learn/view/doc/transform_XML/
	 http://www.vacant-eyes.jp/Tips/txml/030.aspx
	 http://www.klstudio.com/post/94.html
	 http://xmljs.sourceforge.net/
	 ajaxslt	http://code.google.com/p/ajaxslt/

	 flag:	dcba in binary
	 isFP:
	 a==0	view as text
	 a==1	view as filename	If you want to parse a local file, You can use XSLT as well.
	 rX:
	 b==0	return dom.documentElement object
	 b==1	return dom object
	 fast:
	 c==0	normal speed
	 c==1	faster: ignore check

	 to use:
	 filtered_node=return_nodes.selectSingleNode("/tag1/tag2[tag3='1041']")
	 nodes.selectSingleNode("~").Text;
	 nodes.item(0).text;
	 node.getAttribute("~");
	 node.attributes(0).firstChild.nodeValue.valueOf()
	 node.attributes.item(0).firstChild.nodeValue.valueOf()
	 node.attributes.getNamedItem("~").nodeValue.valueOf()
	 ..

	 getXML():
	 loadXML(getU('全省空白價目表.xml')).getElementsByTagName("Worksheet").length


	 TODO:
	 可參考 JKL.ParseXML, http://doctype.googlecode.com/svn/trunk/goog/dom/xml.js
	 postXML()和parseXML(text/HTML object/array)方法
	 MSXML2.XSLTemplate

	 libXmlRequest Library
	 r=document.implementation.createDocument("",XMLtext,null);
	 r.appendChild(r.createElement(XMLtext));


	 string = (new XMLSerializer()).serializeToString(xmlobject);

	 </code>
	 */
	function loadXML(XMLtext, flag) {
		var dom,
		// xmlDoc,
		isFP = flag % 2, rX, fast;

		if (window.DOMParser) {
			dom = (new DOMParser).parseFromString(XMLtext,
			// 'application/xml'
			'text/xml');
			if (!dom.documentElement
					|| dom.documentElement.tagName === 'parsererror') {
				throw new Error(
						dom.documentElement.firstChild.data
								+ '\n'
								+ dom.documentElement.firstChild.nextSibling.firstChild.data);
			}
			return dom;
		}

		if (typeof ActiveXObject === 'undefined') {
			dom = document.createElement('div');
			dom.innerHTML = XMLtext;
			return dom;
		}

		try {
			/**
			 * ActiveXObject is supported
			 * 
			 * フリースレッド DOM ドキュメントを使用すれば、ファイルを共有アプリケーション状態に取り込むことができます。
			 * 
			 * フリースレッド モデルの欠点の 1
			 * つは、未使用のメモリのクリーンアップにおける待ち時間が増大し、それ以降の操作のパフォーマンスに影響を及ぼすということです
			 * (実際にはクリーンアップが遅れているだけなのに、これをメモリ リークとして報告してくる人もいます)。
			 * 
			 * @see http://www.microsoft.com/japan/msdn/columns/xml/xml02212000.aspx
			 */
			dom = new ActiveXObject("Microsoft.FreeThreadedXMLDOM");
		} catch (e) {
			// CreateObject("Microsoft.XMLDOM");
			// MSXML3.DOMDocument,MSXML2.DOMDocument,MSXML.DOMDocument,
			// Msxml2.DOMDocument.6.0,Msxml2.DOMDocument.5.0,Msxml2.DOMDocument.4.0,MSXML4.DOMDocument,Msxml2.DOMDocument.3.0
			dom = new ActiveXObject("Microsoft.XMLDOM");
		}

		if (!dom)
			throw new Error(1, 'No parser!');

		flag >>= 1;
		rX = flag % 2;
		flag >>= 1;
		fast = flag % 2;

		// faster:
		// 既定の 「レンタル」 スレッディング モデルを使用する方法です (このスレッディング モデルでは、DOM ドキュメントは一度に 1
		// つのスレッドからしか使用できません)。
		// http://www.microsoft.com/japan/msdn/columns/xml/xml02212000.aspx
		if (fast)
			dom.validateOnParse = dom.resolveExternals = dom.preserveWhiteSpace = false;

		if (isFP) {
			// 'false'
			dom.async = false;
			// DTD Validation
			// dom.validateOnParse=true;
			dom.load(XMLtext);
		} else
			dom.loadXML(XMLtext);
		if (Number(dom.parseError)) {
			// return null;
			throw dom.parseError;
		}
		// with(dom.parseError)errorCode,reason,line
		return rX ? dom : dom.documentElement;
	}

	_.loadXML = loadXML;

	// untested
	// TODO:
	// (new XSLTProcessor()).importStylesheet(XMLF);
	// libXmlRequest Library
	// applyXSLT[generateCode.dLK]='loadXML';
	function applyXSLT(XMLF, XSLTF) {
		return loadXML(XSLTF, 1 + 2).transformNode(loadXML(XSLTF, 1 + 2));
	}

	// ↑XMLHttp set ==================

	/**
	 * XML declaration, xml header.
	 * 
	 * @param {String}[encoding]
	 *            encoding
	 * @param {String}[version]
	 *            XML version
	 * 
	 * @returns {String} XML declaration
	 */
	function XML_declaration(encoding, version) {
		var declaration = '<?xml version="' + (version || '1.0') + '"';
		if (encoding) {
			// e.g., "UTF-8", "UTF-16"
			declaration += ' encoding="' + encoding + '"';
		}
		return declaration + '?>';
	}

	_.XML_declaration = XML_declaration;

	/**
	 * 設定 node 之 attributes。
	 * 
	 * @param {Object}node
	 *            已設定過 tag name 之 node
	 * @param {String}attributes
	 *            attributes to set
	 * @param {Function}[numeralize]
	 *            only needed if you want to numeralize the properties
	 * 
	 * @inner
	 */
	function set_attributes(node, attributes, numeralize) {
		if (!attributes)
			// 可能為 undefined
			return;
		var matched,
		//
		attribute_pattern = /([^\s=]+)\s*(?:=\s*(?:"((?:\\.|[^"\\]+)+)"|'((?:\\.|[^'\\]+)+)'|(\S+)))?/g;
		while (matched = attribute_pattern.exec(attributes)) {
			var value = matched[2] || matched[3];
			// unescape
			value ? value.replace(/\\(.)/g, '$1') : matched[4];
			if (numeralize)
				value = numeralize(value);
			node[matched[1]] = value;
		}
	}

	/**
	 * 將 node 下之 tag 當作 attribute。<br />
	 * 警告: 這會 lost 一些屬性。
	 * 
	 * @param {Object}nodes
	 *            node list
	 * @param {Object}[root]
	 *            XML document root to put value
	 * @returns {Object} XML document root
	 */
	function tag_to_attribute(nodes, root) {

		if (Array.isArray(nodes)) {
			if (!root)
				root = {};
			nodes.forEach(function(node) {
				tag_to_attribute(node, root);
			});

		} else if (typeof nodes === 'object') {
			if (!root)
				root = {};
			for ( var tag in nodes) {
				root[tag] = tag_to_attribute(nodes[tag]);
				break;
			}

		} else if (nodes || nodes === 0)
			root = nodes;

		return root;
	}

	_.tag_to_attribute = tag_to_attribute;

	// text declaration of XML.
	var PATTERN_XML_declaration = /^\s*<\?xml(?:\s[^<>?]*)?\?>\s*/,
	// XML 之 tag name 應允許 ":"。
	// 無 end-tag 之 node (empty-element tag) pattern。
	// http://www.w3.org/TR/REC-xml/#sec-starttags
	// [ , tag name, attributes ]
	PATTERN_EMPTY = /<([^\0-\-;->\s]+)(\s[^<>]*?)?\/>/,
	// end-tag 之 pattern
	// [ , last children, tag name ]
	PATTERN_END = /^([\S\s]*?)<\/([^\0-\-;->\s]+)\s*>/;

	/**
	 * parse XML to JSON.
	 * 
	 * @param {String}XML
	 *            XML text
	 * @param {Object}[options]
	 *            options<br />
	 *            {Boolean|Function}options.numeralize(text): only needed if you
	 *            want to numeralize the properties
	 * 
	 * @returns {Array|Object|String} XML nodes
	 */
	function XML_to_JSON(XML, options) {
		if (!XML) {
			return XML;
		}

		// 前置處理。
		if (!library_namespace.is_Object(options)) {
			options = Object.create(null);
		}

		// console.log(XML);
		if (!options.preserve_declaration) {
			// 去除起首之 declaration。
			XML = XML.replace(PATTERN_XML_declaration, '');
		}

		var nodes = [ XML ],
		//
		numeralize = options.numeralize,
		//
		skip_spaces = options.skip_spaces;

		if (numeralize && typeof numeralize !== 'function') {
			numeralize = function(string) {
				return isNaN(string) ? string : +string;
			};
		}

		for (var index = 0, matched; index < nodes.length; index++) {
			if (typeof nodes[index] !== 'string')
				continue;

			// 'f<n/>e' → 'f', {n:null}, 'e'
			if (matched = nodes[index].match(PATTERN_EMPTY)) {
				// 本次要建構的 node。
				var node = {},
				//
				tail = nodes[index].slice(matched.index + matched[0].length);
				if (tail)
					nodes.splice(index + 1, 0, node,
							numeralize ? numeralize(tail) : tail);
				else
					nodes.splice(index + 1, 0, node);
				if (tail = nodes[index].slice(0, matched.index))
					nodes[index] = numeralize ? numeralize(tail) : tail;
				else
					nodes.splice(index, 1);
				node[matched[1]] = null;
				set_attributes(node, matched[2], numeralize);
				// reset index to search next one
				index--;
				continue;
			}

			// 'f<n>c</n>e' → 'f', {n:'c'}, 'e'
			// 'f<N>', {n:'c'}, '</N>e' → 'f', {N : {n:'c'}}, 'e'
			if (matched = nodes[index].match(PATTERN_END)) {
				// 前溯查找 node start.
				// tag_pattern: [ , attributes, first child ]
				for (var i = index, tag_pattern = new RegExp('<' + matched[2]
					// TODO: parse "<br/>"
						+ '(\\s[^<>]*)?>([\\S\\s]*?)$'), tag_matched; i >= 0; i--) {
					if (typeof nodes[i] !== 'string')
						continue;

					if (tag_matched = (i === index ? matched[1] : nodes[i])
							.match(tag_pattern)) {
						// assert: tail <= 0
						var tail = matched[0].length - nodes[index].length;

						// 設定好 node's 殘餘值。

						// 檢查是否需切割。

						// 切割 end: 'f</n>e'
						// → matched[1] = 'f' | matched[1].length
						// | '</n>' | matched[0].length
						// | nodes[index] = 'e'
						if (tail < 0) {
							// -(tail length) → {String}tail
							tail = nodes[index].slice(tail);
							if (numeralize)
								tail = numeralize(tail);
							if (i === index)
								// 直接添加一個當下一 node。
								nodes.splice(i + 1, 0, tail);
							else
								nodes[index] = tail;
							if (tail === 0)
								// 預防之後的判斷失誤。
								tail = String(tail);
						}
						// 切割 start: 'f<n>e'
						// → nodes[i] = 'f' | tag_matched.index
						// | tag_matched[1] = '<n>' | nodes[i].length -
						// tag_matched[2].length
						// | tag_matched[2] = 'e'
						// 盡量晚點 copy。
						if (tag_matched.index > 0) {
							// has head
							nodes[i] = nodes[i].slice(0, tag_matched.index);
							if (numeralize)
								nodes[i] = numeralize(nodes[i]);
						}

						// 本次要建構的 node。
						var node = {},
						// 切割出 node
						children = nodes.splice(
						// 自此添加新 node。
						i + (tag_matched.index === 0 ? 0 : 1),
						// 前後皆無東西，使其整組消失。
						index - i
						// 使 head 整組消失。
						+ (tag_matched.index === 0 ? 1 : 0)
						// 不同 node 且有 tail 則少刪一個。
						- (i !== index && tail ? 1 : 0), node);
						// 去掉頭尾多切割出的部分。
						if (tag_matched.index === 0) {
							// head srction 從一開始就是 tag，因此直接將之除掉。
							children.shift();
						}
						if (i !== index && !tail) {
							// end srction 到結尾都是 end tag，因此直接將之除掉。
							children.pop();
						}

						// setup tag name & children
						if (skip_spaces) {
							tag_matched[2] = tag_matched[2].trim();
							matched[1] = matched[1].trim();
						}
						if (tag_matched[2]) {
							// add first children @ last of head srction
							children
									.unshift(numeralize ? numeralize(tag_matched[2])
											: tag_matched[2]);
						}
						if (i !== index && matched[1]) {
							// add last children @ head of end srction
							children.push(numeralize ? numeralize(matched[1])
									: matched[1]);
						}
						// node's first property: node[tag name] = children
						node[matched[2]] = children.length === 0 ? null
								: children.length === 1 ? children[0]
										: children;
						set_attributes(node, tag_matched[1], numeralize);
						// reset index to search next one
						index = i + (tag_matched.index === 0 ? 0 : 1);
						break;
					}
					// else: 再往前找。
				}
				if (false && i < 0) {
					library_namespace.error('parse error: ' + nodes[i]);
				}
			}
		}

		if (skip_spaces
				&& typeof nodes.at(-1) === 'string'
				&& !(nodes[nodes.length - 1] = nodes.at(-1).trim())) {
			// 最後一個 node 為 spaces。
			nodes.pop();
		}
		if (nodes.length === 0)
			nodes = null;
		else if (nodes.length === 1)
			nodes = numeralize ? numeralize(nodes[0]) : nodes[0];

		if (options.tag_as_attribute)
			nodes = tag_to_attribute(nodes);

		return nodes;
	}

	// _.XML_to_JSON = XML_to_JSON;

	/**
	 * 以遞歸方式將 nodes 轉成 XML。
	 * 
	 * @example<code>

	 to_XML({a:12,b:34})
	 // <a b="34">12</a>

	 to_XML({a:[2,3,{r:{t:'e'}}],b:34})
	 // <a b="34">23<r><t>e</t></r></a>

	 * </code>
	 * 
	 * @param {Object}nodes
	 *            node list
	 * @param {Object}[options]
	 *            options<br />
	 *            {Boolean}options.no_empty: no empty-element tags.
	 * 
	 * @returns {String}XML
	 */
	function to_XML(nodes, options) {
		if (Array.isArray(nodes)) {
			return nodes.map(function(node) {
				return to_XML(node, options);
			}).join(options && options.separator || '');
		}

		if (typeof nodes === 'object') {
			var node = [], tag, name;
			for (name in nodes) {
				if (tag) {
					node.push(' ' + name + '="'
							+ String(nodes[name]).replace(/"/g, '\\"') + '"');
				} else {
					node.push('<' + name);
					tag = name;
				}
			}
			name = nodes[tag];
			name = name || name === 0
			// 用遞歸的方式處理children。
			? to_XML(name, options) : options && options.no_empty ? '' : name;
			node.push(name || name === '' ? '>' + name + '</' + tag + '>'
			// e.g., name = null, undefined
			: ' />');
			return node.join(options && options.separator || '');
		}

		return name || name === 0 ? String(nodes) : nodes;
	}

	/**
	 * 將 nodes 轉成 XML (frontend)
	 * 
	 * @param {Object}nodes
	 *            node list
	 * @param {Object}[options]
	 *            options<br />
	 *            {Boolean}options.declaration: 是否加上起首之 declaration。<br />
	 *            deprecated: options.no_declaration
	 * 
	 * @returns {String}XML
	 */
	function JSON_to_XML(nodes, options) {
		var XML = to_XML(nodes, options);

		if (options && (options === true || options.declaration)) {
			// 加上起首之 declaration。
			XML = XML_declaration("UTF-8")
					+ (options && options.separator || '') + XML;
		}

		return XML;
	}

	// _.JSON_to_XML = JSON_to_XML;

	library_namespace.set_method(JSON, {
		to_XML : JSON_to_XML,
		from_XML : XML_to_JSON
	});

	// TODO: XML search

	return (_// JSDT:_module_
	);
}
