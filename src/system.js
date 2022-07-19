/*
 * RickJS, a JavaScript port of XRick
 *
 * This source file is based on the folliwing files:
 * - xrick/src/system.c
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

import { sysarg_init, sysarg } from "./sysarg";
import { sysvid_init } from "./sysvid";
import { syssnd_init } from "./syssnd";

let /*U32*/ ticks_base = 0;	// static

/*
 * Return number of microseconds elapsed since first call
 */
export function
sys_gettime()
{
	// See static above
	let ticks;

	ticks = Date.now();

	if (!ticks_base) {
		ticks_base = ticks;
	}

	return ticks - ticks_base;
}


/*
 * Sleep a number of microseconds
 */
export function
sys_sleep(s)
{
	console.log("sys_sleep(%d)", s);
  //SDL_Delay(s);
}

/*
 * Initialize system
 */
export function
sys_init(argc, argv)
{
	sysarg_init(argc, argv);
	sysvid_init();
//#ifdef ENABLE_JOYSTICK
//	sysjoy_init();
//#endif
//#ifdef ENABLE_SOUND
	if (sysarg.args_nosound === 0) {
		syssnd_init();
	}
//#endif
//	atexit(sys_shutdown);
//	signal(SIGINT, exit);
//	signal(SIGTERM, exit);
}

/*
 * Shutdown system
 */
export function
sys_shutdown()
{
//#ifdef ENABLE_SOUND
	syssnd_shutdown();
//#endif
//#ifdef ENABLE_JOYSTICK
//	sysjoy_shutdown();
//#endif
	sysvid_shutdown();
}

/* eof */
