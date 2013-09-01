//	usage:
//	node "path/to/node.demo.js"

// require("path/to/_for include/node.loader.js");
//require("D:\\USB\\cgi-bin\\lib\\JS\\_for include\\node.loader.js");
require("../../_for include/node.loader.js");

CeL.run('data.math', function() {
	var n1 = 123, n2 = 234;
	CeL.log('GCD(' + n1 + ', ' + n2 + ') = ' + CeL.GCD(n1, n2));
});
