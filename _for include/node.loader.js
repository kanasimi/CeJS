/**
 * @name framework loader for node.js.
 * 
 * See _CeL.loader.nodejs.js for a example that is simple to use.
 * 
 * @example
 * 
 * for including: <code>

require("./path/to/node.loader.js");

</code>
 * 
 * @since 2011/11/26 23:33:32
 * @see http://nodejs.org/
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Shells
 */

'use strict';

// ---------------------------------------------------------------------//

// console.trace(global.CeL);

try {
	// http://nodejs.org/api/globals.html
	// node.js requires this method to setup REALLY global various:
	// require isn't actually a global but rather local to each module.
	if (typeof CeL !== 'function' && (typeof CeL !== 'object' || !CeL))
		Function('return this')().CeL = {};
	// main lib path relative to the loader script.
	CeL.library_path = '../ce.js';
	if (false && !globalThis.require && typeof require === 'funtion')
		globalThis.require = require;

	(function() {
		// 若非 absolute path，則將之改為 absolute path，
		// 否則 setup_library_base_path() 會抓不到。
		if (!/^([A-Z]:)?[\\\/]/i.test(CeL.library_path)
		// @snowpack: 例如 __filename ===
		// /pwikiapi-test-main\node_moduleswikiapi\node_modulescejs_for include
		// && /\.js/.test(__filename)
		) {
			// 這裡 __filename 是 loader 本身之 path。
			CeL.library_path = __filename
					.replace(/[^\\\/]+$/, CeL.library_path);
		}

		var script_code = [], fs = require('fs'),
		// http://nodejs.org/api/fs.html#fs.readFileSync
		main_lib_binary = fs.readFileSync(CeL.library_path
		// The encoding can be 'utf8', 'ascii', or 'base64'.
		// http://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options
		// , 'utf8'
		),
		// pass the first 2 bytes (BOM)
		i = 2, l =
		// 10
		main_lib_binary.length;

		if (false)
			console.log([ CeL.library_path, typeof main_lib_binary.length,
					main_lib_binary.length ]);

		// a simplified .get_file() for UTF-32.
		for (; i < l;) {
			// console.log(main_lib_binary[i] + ',' + main_lib_binary[i + 1]);
			script_code.push(String.fromCharCode(main_lib_binary[i++] + 256
					* main_lib_binary[i++]));
		}

		CeL.library_code = script_code.join('');

		if (false) {
			console.log(script_code.length);
			// console.log(script_code.slice(0, 30));
			console.log('[' + script_code.slice(0, 300)
			// .replace(/[\x00-\x1f]/g, '.')
			.replace(/[\u0100-\uffff]/g, '.')
			// .charCodeAt(0)
			+ ']');
		}

	})();

	eval(CeL.library_code);
	if (false) {
		console.log('CeL === globalThis.CeL: ' + (CeL === globalThis.CeL));
		console.log('typeof CeL: ' + typeof CeL);
		console.log('CeL: ' + CeL);
		console.log('CeL.set_debug: ' + CeL.set_debug);
	}

	// delete cache.
	delete CeL.get_old_namespace().script_code;

	// for npm
	module.exports = CeL;

} catch (e) {
	console.error(e);
}

// CeL.run('application.platform.nodejs', 'data.CSV');

if (false && typeof CeL === 'function') {
	CeL.set_debug();

	if (false)
		console.log(CeL.get_file('data.js').slice(0, 300).replace(
				/[\u0100-\uffff]/g, '.'));

	CeL.run('data.math', function() {
		var n1 = 123, n2 = 234;
		CeL.log('GCD(' + n1 + ', ' + n2 + ') = ' + CeL.GCD(n1, n2));
	});
}
