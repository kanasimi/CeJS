/**
 * @name framework loader for node.js.
 * 
 * @fileoverview Example to include CeL (CeJS) in node.js. node.js 下之 CeL
 *               簡易加載器。本檔僅包括含入並運用 node.loader.js 的最精簡程式碼。
 * 
 * usage: See ../README.md
 */

typeof CeL !== 'function' && (function() {
	"use strict";

	var CeL_path_file = './_CeL.path.txt', node_fs = require('fs'),
	//
	CeL_path_list = node_fs.readFileSync(CeL_path_file);
	if (!CeL_path_list || !(CeL_path_list = CeL_path_list.toString())) {
		console.error(
		//
		'Please set the absolute path list of CeL library in the file ['
		//
		+ CeL_path_file + ']!');
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
			// accessSync() throws if any accessibility checks fail, and does
			// nothing otherwise.
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
	if (typeof use_cejs_mudule === 'boolean'
	// Set "global.use_cejs_mudule = true;" if you need to do so anyway.
	&& use_cejs_mudule && typeof CeL !== 'function') {
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

// CeL.run([ 'data.code.compatibility' ]);
