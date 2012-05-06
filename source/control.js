/*
 * RickJS, a JavaScript port of XRick
 *
 * This source file is based on the folliwing files:
 * - xrick/src/control.c
 * - xrick/src/control.h
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

/*
 * constants
 */
var CONTROL_UP = 0x08,
	CONTROL_DOWN = 0x04,
	CONTROL_LEFT = 0x02,
	CONTROL_RIGHT = 0x01,
	CONTROL_PAUSE = 0x80,
	CONTROL_END = 0x40,
	CONTROL_EXIT = 0x20,
	CONTROL_FIRE = 0x10;

(function() {

	Control.status = 0;
	Control.last = 0;
	Control.active = true;

/* EOF */
})();
