import { CONTROL_EXIT, CONTROL_FIRE } from "../include/control";
import { SCREEN_DONE, SCREEN_EXIT, SCREEN_RUNNING,
				 SCREEN_TIMEOUT } from "../include/screens";
import { control } from "./control";
import { screen_gameovertxt } from "./dat_screens";
import { draw, draw_SCREENRECT, draw_setfb, draw_tilesList } from "./draw";
import { game, game_setmusic } from "./game";
import { sys_gettime, sys_sleep } from "./system";
import { sysvid_clear } from "./sysvid";

/*
 * Display the game over screen
 *
 * return: SCREEN_RUNNING, SCREEN_DONE, SCREEN_EXIT
 */
let seq = 0;
let period = 0;
let tm = 0;

export function
screen_gameover()
{
//	static U8 seq = 0;
//	static U8 period = 0;
//#ifdef GFXST
//	static U32 tm = 0;
//#endif
//#ifdef ENABLE_SOUND
//	static sound_t *snd;
//	static U8 chan;
//#endif

	if (seq === 0) {
		draw.tilesBank = 0;
		seq = 1;
		period = game.period; /* save period, */
		game.period = 50;     /* and use our own */
//#ifdef ENABLE_SOUND
		game_setmusic("sounds/gameover.wav", 1);
//#endif
	}

	switch (seq) {
	case 1:  /* display banner */
//#ifdef GFXST
		sysvid_clear();
		tm = sys_gettime();
//#endif
		draw.tllst = [...screen_gameovertxt];
		draw_setfb(120, 80);
//#ifdef GFXPC
//		draw_filter = 0xAAAA;
//#endif
		draw_tilesList();

		game.rects = draw_SCREENRECT;
		seq = 2;
		break;

	case 2:  /* wait for key pressed */
		if (control.status & CONTROL_FIRE)
			seq = 3;
//#ifdef GFXST
		else if (sys_gettime() - tm > SCREEN_TIMEOUT)
			seq = 4;
//#endif
		else
			sys_sleep(50);
		break;

	case 3:  /* wait for key released */
		if (!(control.status & CONTROL_FIRE))
			seq = 4;
		else
			sys_sleep(50);
		break;
	}

	if (control.status & CONTROL_EXIT)  /* check for exit request */
		return SCREEN_EXIT;

	if (seq === 4) {  /* we're done */
		sysvid_clear();
		seq = 0;
		game.period = period;
		return SCREEN_DONE;
	}

  return SCREEN_RUNNING;
}

/* eof */

