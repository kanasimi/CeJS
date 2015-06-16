//	usage:
//	node "path/to/node.demo.js"

'use strict';

// ----------------------------------------------------------------------------
// For node.js loading. Copy from /node.loader.js/.
// 載入泛用（非特殊目的使用）之功能。
'D:\\USB\\cgi-bin\\lib\\JS|C:\\USB\\cgi-bin\\lib\\JS|H:\\cgi-bin\\lib\\JS|/home/kanashimi/www/cgi-bin/lib/JS'
//
.split('|')
//
.some(function(path) {
	if (path.charAt(0) !== '#' && require('fs').existsSync(path)) {
		var loader = '/_for include/node.loader.js';
		require(path
		//
		+ (path.indexOf('/') !== -1 ? loader : loader.replace(/\//g, '\\')));
		return true;
	}
});
// ----------------------------------------------------------------------------

CeL.run([ 'interact.DOM', 'application.debug' ]);

// ----------------------------------------------------------------------------

CeL.run('data.math', function() {
	var n1 = 123, n2 = 234;
	CeL.log('GCD(' + n1 + ', ' + n2 + ') = ' + CeL.GCD(n1, n2));
});
