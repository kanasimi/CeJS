// Example to include CeL (CeJS) in node.js. node.js 下之 CeL 簡易加載器。

/*

To set the loader as split files:
# Copy this file to the target directory and set to read-only.
# Set the path list to search the library base to (CeL_path_file), one per line.
# to use in script file: <code>
//global.use_cejs_mudule = true;
require('./_CeL.loader.nodejs.js');
</code>


To set the loader in a single script file:
# Copy all codes below to the front of the script.
# Set the CeL_path_list to the paths to search the library base, split by '|'.
@see _test suite/misc/node.demo.js


*/

typeof CeL !== 'function' && (function() {
	"use strict";

	var CeL_path_file = './_CeL.path.txt', node_fs = require('fs'),
	//
	CeL_path_list = node_fs.readFileSync(CeL_path_file);
	if (!CeL_path_list || !(CeL_path_list = CeL_path_list.toString())) {
		console.error('Please set the absolute path list of CeL library in the file [' + CeL_path_file + ']!');
		return;
	}

	// ----------------------------------------------------------------------------
	// Load CeJS library. For node.js loading.
	// Copy/modified from "/_for include/_CeL.loader.nodejs.js".
	CeL_path_list.split(CeL_path_list.includes('\n') ? /\r?\n/ : '|')
	// 載入泛用（非特殊目的使用）之功能。
	.some(function(path) {
		if (path.charAt(0) === '#') {
			// path is a comment
			return;
		}
		try {
			// accessSync() throws if any accessibility checks fail, and does nothing otherwise.
			node_fs.accessSync(path);
			var loader = '/_for include/node.loader.js';
			require(path + (path.indexOf('/') !== -1 ? loader
			//
			: loader.replace(/\//g, '\\')));
			return true;
		} catch (e) {
			// try next path
		}
	});

	// If no latest version found, try to use cejs module instead.
	// Set "global.use_cejs_mudule = true;" if you need to do so anyway.
	if (typeof use_cejs_mudule === 'boolean' && use_cejs_mudule
	&& typeof CeL !== 'function') {
		try {
			require('cejs');
			console.log('Load cejs module, require("cejs") instead!');
			return;

		} catch (e) {
		}

		console.error('Failed to load CeL!');
		// No CeJS library.
		throw '請先安裝 CeJS library:\nnpm install cejs';
	}

	if (typeof CeL !== 'function') {
		console.error('Failed to load CeL!');
	}

})();

// ----------------------------------------------------------------------------
// Load module.

// CeL.env.no_catch = true;
// CeL.set_debug(2);

//CeL.run([ 'data.code.compatibility' ]);
