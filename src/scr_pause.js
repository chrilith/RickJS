import { struct } from "./c";
import { screen_pausedtxt } from "./dat_screens";

/*
 * Display the pause indicator
 */
export function
screen_pause(pause)
{
  if (pause === true) {
    draw.tilesBank = 0;
    draw.tllst = [...screen_pausedtxt];
    draw_setfb(120, 80);
//#ifdef GFXPC
//    draw_filter = 0xAAAA;
//#endif
    draw_tilesList();
  }
  else {
//#ifdef GFXPC
//    draw_filter = 0xFFFF;
//#endif
    draw_map();
    ent_draw();
    draw_drawStatus();
  }
  game.rects = draw_SCREENRECT;
}


/* eof */

