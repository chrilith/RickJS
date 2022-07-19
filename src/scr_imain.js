import { sprintf, struct } from "./c";
import { game, game_setmusic } from "./game";
import { draw, draw_SCREENRECT, draw_pic, draw_tilesList, draw_setfb } from "./draw";
import { sysvid, sysvid_clear, sysvid_fadeStart, sysvid_fadeEnd } from "./sysvid";
import { sys_gettime } from "./system";
import { pic_splash, pic_haf } from "./dat_picST";
import { control } from "./control";
import { CONTROL_FIRE, CONTROL_EXIT } from "../include/control";
import { SCREEN_RUNNING, SCREEN_TIMEOUT, SCREEN_DONE } from "../include/screens";

// static in screen_introMain()
let /*U8*/ seq = 0;
let /*U8*/ seen = 0;
let /*U8*/ first = true;
let /*U8*/ period = 0;
let /*U32*/ tm = 0;
let /*U8*/ i, s = Array(32);
let fading;

/*
 * Main introduction
 *
 * return: SCREEN_RUNNING, SCREEN_DONE, SCREEN_EXIT
 */
export function
screen_introMain(timer)
{
	// See static above

	if (seq === 0) {
    draw.tilesBank = 0;
    if (first === true) {
      seq = 1;
    } else {
      seq = 4;
		}
    period = game.period;
    game.period = 50;
    game.rects = draw_SCREENRECT;
//#ifdef ENABLE_SOUND
		game_setmusic("sounds/tune5.wav", -1);
//#endif
  }

  switch (seq) {
		case 1:  /* display Rick Dangerous title and Core Design copyright */
			if (fading) {
				break;
			}
			sysvid_clear();
			tm = sys_gettime();
	/*
#ifdef GFXPC
			/* Rick Dangerous title //
			draw_tllst = (U8 *)screen_imainrdt;
			draw_setfb(32, 16);
			draw_filter = 0xaaaa;
			draw_tilesList();

			/* Core Design copyright + press space to start //
			draw_tllst = (U8 *)screen_imaincdc;
			draw_setfb(64, 80);
			draw_filter = 0x5555;
			draw_tilesList();
#endif
	*/
//#ifdef GFXST
			draw_pic(0, 0, 0x140, 0xc8, pic_splash);
//#endif

			seq = 2;
			fading = GE.Fader.IN;
			sysvid_fadeStart();
			break;

		case 2:  /* wait for key pressed or timeout */
			if (control.status & CONTROL_FIRE) {
				seq = 3;
			} else if (sys_gettime() - tm > SCREEN_TIMEOUT) {
				seen++;
				seq = 4;

				fading = GE.Fader.OUT;
				sysvid_fadeStart();
			}
			break;

		case 3:  /* wait for key released */
			if (!(control.status & CONTROL_FIRE)) {
				if (seen++ === 0) {
					seq = 4;
				} else {
					seq = 7;

					fading = GE.Fader.OUT;
					sysvid_fadeStart();
				}
			}
			break;

		case 4:  /* dispay hall of fame */
			if (fading) {
				break;
			}
			sysvid_clear();
			tm = sys_gettime();

			/* hall of fame title *//*
#ifdef GFXPC
			draw_tllst = (U8 *)screen_imainhoft;
			draw_setfb(32, 0);
			draw_filter = 0xaaaa;
			draw_tilesList();
#endif*/
//#ifdef GFXST
			draw_pic(64, 4, 0x140, 0x20, pic_haf);
//#endif

			/* hall of fame content */
			draw_setfb(56, 40);
//#ifdef GFXPC
//   	draw_filter = 0x5555;
//#endif
			for (i = 0; i < 8; i++) {
				const tmp  = `00${game.hscores[i].score}`;	// %06d
				const game_hscores_i_score = tmp.substring(tmp.length - 6, tmp.length);

				sprintf(s, "{0}@@@....@@@{1}",
					game_hscores_i_score, game.hscores[i].name);
				s[26] = '\xFF'; s[27] = '\xFF'; s[28] = '\xFE'; // \377 \377 \376
				draw.tllst = [...s];
				draw_tilesList();
			}

			seq = 5;
			fading = GE.Fader.IN;
			sysvid_fadeStart();
			break;

		case 5:  /* wait for key pressed or timeout */
			if (control.status & CONTROL_FIRE) {
				seq = 6;
			} else if (sys_gettime() - tm > SCREEN_TIMEOUT) {
				seen++;
				seq = 1;

				fading = GE.Fader.OUT;
				sysvid_fadeStart();
			}
			break;

		case 6:  /* wait for key released */
			if (!(control.status & CONTROL_FIRE)) {
				if (seen++ == 0) {
					seq = 1;
				} else {
					seq = 7;

					fading = GE.Fader.OUT;
					sysvid_fadeStart();
				}
			}
			break;
  }

	if (fading) {
		game.rects = draw_SCREENRECT;
		if (!sysvid.fader.update(timer, fading)) {
			fading = sysvid_fadeEnd();
			// Loop directly to prevent flipping
			if (seq !== 7) {
				screen_introMain(timer);
			}
		}
	}

  if (control.status & CONTROL_EXIT) { /* check for exit request */
    return SCREEN_EXIT;
	}

  if (seq == 7) {  /* we're done */
    sysvid_clear();
    seq = 0;
    seen = 0;
    first = false;
    game.period = period;
    return SCREEN_DONE;
  } else {
    return SCREEN_RUNNING;
	}
}

/* eof */


