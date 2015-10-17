/**
 * @name CeL frontend for node.js.
 * 
 * @fileoverview 本檔案用於在 npm (node.js) 中 require 本 library。
 * 
 * @example <code>

# npm install cejs

# node
> require('cejs');
> CeL.run('data.math', function() { var n1 = 123, n2 = 234; CeL.log('GCD(' + n1 + ', ' + n2 + ') = ' + CeL.GCD(n1, n2)); });

// MUST run `npm rebuild cejs` after modify package.json.

# npm update cejs

# npm uninstall cejs


 * </code>
 * 
 * @since 2015/10/17 14:5:49
 */

'use strict';

module.exports = require('./_for include/node.loader.js');
