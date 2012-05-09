/*
 * RickJS, a JavaScript port of XRick
 *
 * This source file is based on the folliwing files:
 * - xrick/src/sysarg.c
 *
 * Copyright (C) 1998-2002 BigOrno (bigorno@bigorno.net). All rights reserved.
 * Copyright (C) 2012 Chrilith (me@chrilith.com). All rights reserved.
 *
 * The use and distribution terms for this software are contained in the file
 * named README, which can be found in the root of this distribution. By
 * using this software in any fashion, you are agreeing to be bound by the
 * terms of this license.
 *
 * You must not remove this notice, or any other, from this software.
 */

(function() {

	Sysarg.args_map = 0;
	Sysarg.args_submap = 0;

	/*
	 * Read and process arguments
	 */
	Sysarg.init = function() {
		var argv = new G.CommandLine();
	
		if (argv.hasParam("map")) {
			//if (++i == argc) sysarg_fail("missing map number");
			Sysarg.args_map = parseInt(argv.getParam("map"), 10) - 1;
	//		if (sysarg_args_map < 0 || sysarg_args_map >= MAP_NBR_MAPS-1)
	//			sysarg_fail("invalid map number");
		}
	
		if (argv.hasParam("submap")) {
	//		if (++i == argc) sysarg_fail("missing submap number");
			Sysarg.args_submap = parseInt(argv.getParam("submap"), 10) - 1;
	//		if (sysarg_args_submap < 0 || sysarg_args_submap >= MAP_NBR_SUBMAPS)
	//			sysarg_fail("invalid submap number");
		}
	
		/* this is dirty (sort of) */
		if (Sysarg.args_submap > 0 && Sysarg.args_submap < 9) {
			Sysarg.args_map = 0;
		}

		if (Sysarg.args_submap >= 9 && Sysarg.args_submap < 20) {
			Sysarg.args_map = 1;
		}

		if (Sysarg.args_submap >= 20 && Sysarg.args_submap < 38) {
			Sysarg.args_map = 2;
		}

		if (Sysarg.args_submap >= 38) {
			Sysarg.args_map = 3;
		}

		if (Sysarg.args_submap == 9 ||
			Sysarg.args_submap == 20 ||
			Sysarg.args_submap == 38) {

			Sysarg.args_submap = 0;
		}
	}

/* EOF */
})();
