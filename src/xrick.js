/*
 * RickJS, a JavaScript port of XRick
 *
 * This source file is based on the folliwing files:
 * - xrick/src/xrick.c
 *
 * Copyright (C) 1998-2002 BigOrno (bigorno@bigorno.net). All rights reserved.
 * Copyright (C) 2012-2022 Chrilith (me@chrilith.com). All rights reserved.
 *
 * The use and distribution terms for this software are contained in the file
 * named README, which can be found in the root of this distribution. By
 * using this software in any fashion, you are agreeing to be bound by the
 * terms of this license.
 *
 * You must not remove this notice, or any other, from this software.
 */

import { sys_init } from "./system";
import { game_run } from "./game";
import { dat_init } from "./dat_loader";

import { sysarg } from "./sysarg";

/*
 * main
 */
export async function main(argc, argv) {
	console.log("Running xrick...");
	sys_init(argc, argv);
/*	if (sysarg_args_data) {
		data_setpath(sysarg_args_data);
	} else {
		data_setpath("data.zip");
	}*/
	await dat_init();
	game_run();
/*	data_closepath();
	sys_shutdown();*/
	return 0;
}

/* eof */
