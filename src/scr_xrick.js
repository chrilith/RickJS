import { sysvid_clear, sysvid_setGamePalette } from "./sysvid";
import { SCREEN_EXIT, SCREEN_DONE, SCREEN_RUNNING } from "../include/screens";
import { CONTROL_EXIT } from "../include/control";
import { control } from "./control";
import { draw_SCREENRECT } from "./draw"
import { game, game_setmusic } from "./game";
import { struct } from "./c";

let seq = 0;
let wait = 0;

/*
 * Display XRICK splash screen
 *
 * return: SCREEN_RUNNING, SCREEN_DONE, SCREEN_EXIT
 */
export function
screen_xrick()
{


	if (seq === 0) {
		sysvid_clear();
//	draw_img(IMG_SPLASH);
		game.rects = draw_SCREENRECT;
		seq = 1;
	}

	switch (seq) {
		case 1:  /* wait */
			if (wait++ > 0x2) {
//#ifdef ENABLE_SOUND
				game_setmusic("sounds/bullet.wav", 1);
//#endif
				seq = 2;
				wait = 0;
			}
			break;

		case 2:  /* wait */
			if (wait++ > 0x20) {
				seq = 99;
				wait = 0;
			}
			break;
	}

	if (control.status & CONTROL_EXIT)  /* check for exit request */
		return SCREEN_EXIT;

	if (seq === 99) {  /* we're done */
		sysvid_clear();
		sysvid_setGamePalette();
		seq = 0;
		return SCREEN_DONE;
	}

	return SCREEN_RUNNING;
}
