//	usage:
//	node "path/to/node.demo.js"

'use strict';

// ----------------------------------------------------------------------------
// For node.js loading. Copy from /node.loader.js/.

// ----------------------------------------------------------------------------
// Load CeJS library. For node.js loading.
// Copy/modified from "/_for include/node.loader.js".
'D:\\USB\\cgi-bin\\lib\\JS|C:\\USB\\cgi-bin\\lib\\JS|H:\\cgi-bin\\lib\\JS|/home/kanashimi/www/cgi-bin/lib/JS|../..'
// 載入泛用（非特殊目的使用）之功能。
.split('|').some(function(path) {
	if (path.charAt(0) === '#') {
		// path is a comment
		return;
	}
	try {
		// accessSync() throws if any accessibility checks fail, and does
		// nothing otherwise.
		require('fs').accessSync(path);
		var loader = '/_for include/node.loader.js';
		require(path + (path.indexOf('/') !== -1 ? loader
		//
		: loader.replace(/\//g, '\\')));
		return true;
	} catch (e) {
		// try next path
	}
});

// ----------------------------------------------------------------------------
// Load module.

// CeL.env.no_catch = true;
// CeL.set_debug(2);
CeL.run([ 'interact.DOM', 'application.debug' ]);

// ----------------------------------------------------------------------------

CeL.run('data.math', function() {
	var n1 = 123, n2 = 234;
	CeL.log('GCD(' + n1 + ', ' + n2 + ') = ' + CeL.GCD(n1, n2));
});
