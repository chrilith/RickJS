/*
 * RickJS, a JavaScript port of XRick
 *
 * This source file is based on the folliwing files:
 * - xrick/src/sysvid.c
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

import { rect_t } from "../include/rects";
import { SYSVID_WIDTH, SYSVID_HEIGHT } from "../include/system";
import { as_const } from "./c";

export const sysvid = {
	fb: null /* frame buffer */,
	fader: null
};
const SCREENRECT = as_const(rect_t(0, 0, SYSVID_WIDTH, SYSVID_HEIGHT, null));

let screen, buffer;

/*
 * Initialize screen
 */
function
initScreen(w, h/*, bpp, flags*/)
{
	var s = new G.Screen(w, h);
	G.Screen.setActive(s);
	s.enableFiltering(false);
	s.setStretch(s.STRETCH_UNIFORM);

	return s;
}

export function
sysvid_setGamePalette()
{
	console.log("sysvid_setGamePalette()");
	// TODO
}

/*
 * Initialise video
 */
export function
sysvid_init()
{
	// TODO: zoom
	screen = initScreen(SYSVID_WIDTH, SYSVID_HEIGHT);

	/*
   * create v_ frame buffer
   */
	sysvid.fb = new G.Surface(SYSVID_WIDTH, SYSVID_HEIGHT);

	// Gamalto specific to handle true color mode
	buffer = sysvid.fb;
	sysvid.fader = new GE.Fader(sysvid.fb, new G.Color(), 150);
}

/*
 * Shutdown video
 */
export function
sysvid_shutdown()
{
//  free(sysvid_fb);
  sysvid.fb = null;
	console.log("sysvid_shutdown()");
//  SDL_Quit();
}


/*
 * Update screen
 * NOTE errors processing ?
 */
export function
sysvid_update(rects)
{
	if (rects == null)
		return;

	const rs = [];
	while (rects) {
		rs.push(new G.Rect(rects.x, rects.y, rects.width, rects.height));
		rects = rects.next;
	}
	screen.redraw(buffer, 0, 0, rs);
	screen.refresh();
}

/*
 * Clear screen
 * (077C)
 */
export function
sysvid_clear()
{
	sysvid.fb.renderer.fillRect(null, new G.Color(0,0,0));
}

/*
 * Gamalto
 */
export function
sysvid_fadeStart()
{
	sysvid.fader.reset();
	buffer = sysvid.fader.surface;
}

export function
sysvid_fadeEnd()
{
	buffer = sysvid.fb;
}

/* eof */
