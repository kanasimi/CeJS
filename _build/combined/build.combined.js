﻿/**
 * @name CeJS builer for standalone version
 * 
 * @fileoverview Tool to build standalone version of CeJS library.
 * 
 * @since 2022/9/14 16:37:38, 2022/9/21 12:16:1
 */

/*

node build.combined.js __profile_name__

TODO:
https://kinsta.com/blog/minify-javascript/

*/

'use strict';
// 'use asm';

const default_language = 'en';

globalThis.CeL = {
	env: {
		default_domain: default_language,
		// at least on older Chrome Browser additional dependancies failed to load
		// https://github.com/kanasimi/CeJS/issues/37#issuecomment-1254476627
		// Forced loading of compatibility modules. 強制載入相容性模組。
		force_including_compatibility_module: true,
	}
};

require('./_CeL.loader.nodejs.js');
//console.log(CeL);

// --------------------------------------------------------------------------------------------

const profiles = {
	CeJS_wiki: {
		combined_script_file_path: 'CeJS_wiki/CeJS_wiki.js',
		exclude_modules: new Set(['application.platform.nodejs', 'application/locale/resources/cmn-Hant-TW.js']),
		// 載入操作維基百科的主要功能。
		include_modules: [['application.net.wiki',], () => {
			CeL.gettext.load_domain(default_language, true);
		}]
	}
}

const profile = profiles[process.argv[2]
	// default profile name
	|| 'CeJS_wiki'];

if (!profile) {
	console.error(`No valid profile name provided.`);
	process.exit(1);
}

// --------------------------------------------------------------------------------------------

const library_build_script_name = CeL.get_script_name();

CeL.run(profile.include_modules, build_standalone_version);

function build_standalone_version() {
	const combined_file_contents = [], external_file_contents = [];
	const named_codes_loaded = CeL.get_modules_loaded();
	const all_named_code_data = CeL.get_named_code();
	const named_code_ids_left = new Set(Object.keys(all_named_code_data));
	//console.log(CeL.Class);
	//console.trace(Object.keys(named_codes_loaded));
	//console.trace(CeL.get_module_path());
	combined_file_contents.push(`
/*
	本檔案為自動生成，請勿手動編輯！
	The main script file: ${profile.combined_script_file_path}
		is auto created by auto-generate tool: ${library_build_script_name}(.js) @ ${(new Date).toISOString()}.
*/
`, CeL.get_file(CeL.get_module_path()));

	function add_code_of_id(id) {
		const declaration = all_named_code_data[id];
		named_code_ids_left.delete(id);
		named_code_ids_left.delete(declaration.URL);
		let module_name = declaration.module_name || id;
		if (module_name.startsWith(CeL.env.library_base_path)) {
			module_name = module_name.slice(CeL.env.library_base_path.length);
		}
		module_name = module_name.replace(/\\/g, '/');
		if (profile.exclude_modules.has(module_name))
			return;

		CeL.info(module_name + ':	' + declaration.URL);
		let file_contents = CeL.get_file(declaration.URL);
		let module_code;
		file_contents = file_contents.replace(/\n\s*function\s*module_code\s*\([\s\S]+$/, function (all) {
			module_code = all;
			return '';
		});
		if (module_code) {
			file_contents = file_contents.replace(/(\s*code\s*:\s*)module_code(\W)/, function (all, front, tail) {
				return front + module_code + tail;
			});
		}
		(declaration.module_name ? combined_file_contents : external_file_contents).push('// ' + module_name, file_contents);
		return module_name;
	}

	for (const id of named_codes_loaded) {
		add_code_of_id(id);
	}

	for (let id of profile.exclude_modules.keys()) {
		id = CeL.to_module_name(id);
		const declaration = all_named_code_data[id];
		named_code_ids_left.delete(id);
		const URL = declaration?.URL || CeL.get_module_path(id);
		//console.trace([id, Object.keys(declaration), URL]);
		named_code_ids_left.delete(URL);
	}

	for (const id of named_code_ids_left) {
		const module_name = add_code_of_id(id);
		named_codes_loaded.push(module_name);
	}

	combined_file_contents.splice(1, 0, `
(function () {
	const _golbal = typeof globalThis === 'object' ? globalThis : golbal;
	_golbal.CeL = _golbal.CeL || {};
	if (_golbal.CeL.initializer) {
		_golbal.CeL._initializer = _golbal.CeL.initializer;
		delete _golbal.CeL.initializer;
	}
	_golbal.CeL.env = { default_domain : ${JSON.stringify(CeL.gettext.default_domain)} };
	_golbal.CeL.skip_loading_modules = ${JSON.stringify(named_codes_loaded)};
})();
`);

	external_file_contents.push(`
CeL.gettext.load_domain(${JSON.stringify(CeL.gettext.default_domain)});
CeL.run(CeL.get_old_namespace()?._initializer);
`);

	const node_fs = require('fs');
	node_fs.writeFileSync(profile.combined_script_file_path, combined_file_contents.join('\n') + '\n' + external_file_contents.join('\n'));
}
