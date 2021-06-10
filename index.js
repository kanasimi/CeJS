/**
 * @name CeL frontend for npm of node.js.
 * 
 * @fileoverview 本檔案用於在 npm (node.js) 中 require 本 library。
 * 
 * @example <code>

# npm install cejs

# node
> const CeL = require('cejs');
> CeL.run('data.math', function() { var n1 = 123, n2 = 234; CeL.log('GCD(' + n1 + ', ' + n2 + ') = ' + CeL.GCD(n1, n2)); });

// MUST run `npm rebuild cejs` after modify package.json.

# npm update cejs

# npm uninstall cejs


 * </code>
 * 
 * @since 2015/10/17 14:5:49
 */

'use strict';

if (typeof window !== "object") {
	// Normal node.js module
	module.exports = require('./_for include/node.loader.js');

} else if (typeof document === "object" && document === window.document) {
	/**
	 * assert: is Snowpack
	 * 
	 * @example <code>

	// Since Snowpack cannot read utf-8 or utf-16 script file now,
	// you MUST create a web server, and set main_script_URL.
	//window.CeL = { main_script_URL: 'https://localhost/path/to/ce.js' };
	// Default URL to ce.js is https://kanasimi.github.io/CeJS/ce.js

	import cejs from 'cejs';
	cejs.then(CeL_module => import('wikiapi')).then(Wikiapi_module => main_process(Wikiapi_module.default));
	
	async function main_process(Wikiapi) {
		const wiki = new Wikiapi({ project: 'en', origin: '*' });
		const page_data = await wiki.page('ABC');
		console.log(page_data);
	}

	 * </code>
	 * 
	 * @since 2021/6/5 7:57:26
	 */

	var cejs_node = document.createElement("script");
	cejs_node.setAttribute('src', window.CeL && window.CeL.main_script_URL
	// `http://localhost:8080/node_modules/cejs/ce.js` do not work
	|| 'https://kanasimi.github.io/CeJS/ce.js');
	cejs_node.setAttribute('type', 'text/javascript');
	document.head.appendChild(cejs_node);
	window.CeL = {
		initializer : function() {
			// console.log('CeL loaded');
			cejs_node.resolve(CeL);
			// free
			cejs_node.resolve = null;
			cejs_node = null;
		}
	};

	// module.exports = require('./_for include/node.loader.js');
	module.exports = new Promise(function(resolve, reject) {
		cejs_node.resolve = resolve;
	});
}
