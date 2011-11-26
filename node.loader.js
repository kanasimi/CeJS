/**
 * @name framework loader for node.js.
 * @example runnung under shell:<br />
 *          <code>
 * node node.loader.js
 * </code>
 * @since 2011/11/26 23:33:32
 */

try {
	// main lib path
	var main_lib_script = 'ce.js';

	(function() {

		var fs = require('fs'),
		// http://nodejs.org/docs/latest/api/fs.html#fs.readFileSync
		main_lib_binary = fs
				.readFileSync(/[\\\/]/.test(main_lib_script) ? main_lib_script
						: __filename.replace(/[^\\\/]+$/, main_lib_script)
				// encoding can be 'utf8', 'ascii', or 'base64'.
				// , 'binary'
				),
		// pass the first 2 bytes (BOM)
		i = 2, l =
		// 10
		main_lib_binary.length;

		// console.log(typeof main_lib_binary.length);

		for (main_lib_script = []; i < l;) {
			// console.log(main_lib_binary[i] + ',' + main_lib_binary[i + 1]);
			main_lib_script.push(String.fromCharCode(main_lib_binary[i++] + 256
					* main_lib_binary[i++]));
		}

		main_lib_script = main_lib_script.join('');

		if (0) {
			console.log(main_lib.length);
			// console.log(main_lib.slice(0, 30));
			console.log('[' + main_lib.slice(0, 300)
			// .replace(/[\x00-\x1f]/g, '.')
			.replace(/[\u0100-\uffff]/g, '.')
			// .charCodeAt(0)
			+ ']');
		}

	})();

	eval(main_lib_script);
	main_lib_script = null;
	// console.log('CeL: ' + typeof CeL);

	CeL.set_debug();

} catch (e) {
	// TODO: handle exception
}

if (typeof CeL === 'function') {
	if(0)
		console.log(CeL.get_file('data.js')
			.slice(0, 300)
			.replace(/[\u0100-\uffff]/g, '.'));

	CeL.set_run( [ 'data.math', 'data.native' ], function() {
		console.log(123);
	});
}
