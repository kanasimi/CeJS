//<![CDATA[

/**
 * @name	library run time 骨幹檔
 * @fileoverview
 * library run time 骨幹架構檔。<br />
 * ce.js = structure.js (this file) with base.js + module.js + initialization.js
 * @since	2010/1/8 22:21:36
 */


/**<code>

// 在特殊環境下之處置：

try {
	// 在特殊環境下，設置 library base path。
	Function('return this')().CeL = {
		//loader_script : 'node',
		//loader_arguments : [],

		// main lib path relative to the loader script.
		library_path : 'path/to/ce.js'
	};

	// CeL.library_code = 'library code';

	eval(CeL.library_code);

	// delete cache.
	delete CeL.get_old_namespace().script_code;
} catch (e) {
	//console.error(e);
}



// 在特殊環境下，設置 CeL.log。
CeL.log.function_to_call = function (message) { method_to_log(message); };

//CeL.run('data.code.compatibility');

</code>*/

/**
 * ECMA-262 5th edition, ECMAScript 5 strict mode
 * http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
 * http://davidflanagan.com/Talks/es5/slides.html
 * http://kangax.github.com/es5-compat-table/
 */
'use strict';

if (typeof CeL !== 'function') {

/**
 * @name	JavaScript framework: CeL base loader
 * @fileoverview
 * Colorless echo JavaScript kit/library base loader.
 * 本檔案包含了呼叫其他 library (函式庫)需要用到的 function，以及常用 base functions。<br />
 * A JavaScript module framework that is simple to use.<br />
 * 本計畫希望能建立一個能簡單上手的 JavaScript 模組架構。
 * <br />
 * 2002-, kanashimi <kanasimi@gmail.com>.<br />
 * <br />
 * This file is in tab wide of 4 chars, documentation with JsDoc Toolkit (<a href="http://code.google.com/p/jsdoc-toolkit/wiki/TagReference">tags</a>).<br />
 * <br />
 * <br />Please visit <a href="http://lyrics.meicho.com.tw/program/">Colorless echo program room</a> for more informations.
 * @since	自 function.js 0.2 改寫
 * @since	JavaScript 1.2
 * @since	2010/1/9 00:01:52 建立
 * @author	kanasimi@gmail.com
 * @version	$Id: ce.js,v 0.2 2009/11/26 18:37:11 kanashimi $
 */

// The "Id" above: see [http://ms11.voip.edu.tw/~mac/research/document/rcs.htm RCS IdKeyword]
// https://dywang.csie.cyut.edu.tw/dywang/linuxProgram/node118.html


/**<code>
引用：參照
function addCode

CeL.module


駝峰式大小寫命名規則 CamelCase → embedded_underscore/Snake case


單一JS引用：
//	[function.js]_iF
function _iF(){}_iF.p='HKCU\\Software\\Colorless echo\\function.js.path';if(typeof WScript=="object")try{eval(getU((new ActiveXObject("WScript.Shell")).RegRead(_iF.p)));}catch(e){}
function getU(p,enc){var o;try{o=new ActiveXObject('Microsoft.XMLHTTP');}catch(e){o=new XMLHttpRequest();}if(o)with(o){open('GET',p,false);if(enc&&o.overrideMimeType)overrideMimeType('text/xml;charset='+enc);send(null);return responseText;}}
//	[function.js]End


初始化：參照
initialization of function.js

http://www.w3school.com.cn/html5/html5_script.asp
<script type="text/javascript" async="true" src="path/to/function.js"></script>
<script type="application/javascript;version=1.7" async="true" src="path/to/function.js"></script>

JSDoc:
	http://code.google.com/p/jsdoc-toolkit/w/list
	http://jsdoc.sourceforge.net/

Doxygen:
	http://www.doxygen.nl/
	https://zh.wikipedia.org/wiki/Doxygen

Javadoc:
	http://java.sun.com/j2se/javadoc/writingdoccomments/

VSdoc:
	JScript IntelliSense in Visual Studio
	http://weblogs.asp.net/bleroy/archive/2007/04/23/the-format-for-javascript-doc-comments.aspx
	http://blogs.msdn.com/b/webdevtools/archive/2008/11/07/hotfix-to-enable-vsdoc-js-intellisense-doc-files-is-now-available.aspx
	Create JScript XML Code Comments
	http://msdn.microsoft.com/zh-tw/library/bb514138.aspx
	http://blog.miniasp.com/post/2010/04/Visual-Studio-2010-jQuery-Development-Tips.aspx

</code>*/



/**<code>
TODO

本 library 大量使用了 arguments.callee，但這與 ECMAScript design principles 不甚相符，需要避免。
	http://stackoverflow.com/questions/103598/why-was-the-arguments-callee-caller-property-deprecated-in-javascript
	http://wiki.ecmascript.org/doku.php?id=es3.1:design_principles


reset environment (__defineSetter__, __defineGetter__, ..)
in case of
	<a href="http://haacked.com/archive/2009/06/25/json-hijacking.aspx" accessdate="2009/12/2 0:7">JSON Hijacking</a>,
	<a href="http://blog.miniasp.com/post/2009/11/JavaScript-JSON-Hijacking.aspx" accessdate="2009/12/2 0:18">在 Web 2.0 時代必須重視 JavaScript/JSON Hijacking 攻擊</a>,
	etc.
</code>*/


//try{


//	add base.js


////==========================================================================================================================================================//


//	add module.js


////===========================================================================================================================================================//


//	add dependency_chain.js


////===========================================================================================================================================================//

//	add initialization.js



//}catch(e){WScript.Echo('There are some error in function.js!\n'+e.message);throw e;}



//CeL.run('code.log');
//CeL.warn('test_print: ' + CeL.code.log.Class);

}

//]]>

