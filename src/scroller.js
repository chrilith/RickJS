import { draw_drawStatus, draw_map, draw_SCREENRECT } from "./draw";
import { SCROLL_DONE, SCROLL_PERIOD, SCROLL_RUNNING } from "../include/scroller";
import { MAP_ROW_HBBOT, MAP_ROW_HBTOP, MAP_ROW_HTBOT, MAP_ROW_HTTOP,
				 MAP_ROW_SCRBOT, MAP_ROW_SCRTOP } from "../include/maps";
import { ent_draw, ent_actvis } from "./ents";
import { map, map_expand } from "./maps";
import { game } from "./game";
import { ent } from "../include/ents";
import { struct, _U8 } from "./c";

let period;

/*
 * Scroll up
 *
 */
let n1 = 0;

export function
scroll_up()
{
  let i, j;
//  static U8 n = 0;

  /* last call: restore */
  if (n1 === 8) {
    n1 = 0;
    game.period = period;
    return SCROLL_DONE;
  }

  /* first call: prepare */
  if (n1 === 0) {
    period = game.period;
    game.period = SCROLL_PERIOD;
  }

  /* translate map */
  for (i = MAP_ROW_SCRTOP; i < MAP_ROW_HBBOT; i++)
    for (j = 0x00; j < 0x20; j++)
      map.map[i][j] = map.map[i + 1][j];

  /* translate entities */
  for (i = 0; ent.ents[i].n != 0xFF; i++) {
    if (ent.ents[i].n) {
      ent.ents[i].ysave -= 8;
      ent.ents[i].trig_y -= 8;
      ent.ents[i].y -= 8;
      if (ent.ents[i].y & 0x8000) {  /* map coord. from 0x0000 to 0x0140 */
/*	IFDEBUG_SCROLLER(
	  sys_printf("xrick/scroller: entity %#04X is gone\n", i);
	  );*/
				ent.ents[i].n = 0;
      }
    }
  }

  /* display */
  draw_map();
  ent_draw();
  draw_drawStatus();
  map.frow = _U8(++map.frow);

  /* loop */
  if (n1++ === 7) {
    /* activate visible entities */
    ent_actvis(map.frow + MAP_ROW_HBTOP, map.frow + MAP_ROW_HBBOT);

    /* prepare map */
    map_expand();

    /* display */
    draw_map();
    ent_draw();
    draw_drawStatus();
  }

  game.rects = draw_SCREENRECT;

  return SCROLL_RUNNING;
}

/*
 * Scroll down
 *
 */
let n2 = 0;

export function
scroll_down()
{
  let i, j;
//  static U8 n = 0;

  /* last call: restore */
  if (n2 === 8) {
    n2 = 0;
    game.period = period;
    return SCROLL_DONE;
  }

  /* first call: prepare */
  if (n2 === 0) {
    period = game.period;
    game.period = SCROLL_PERIOD;
  }

  /* translate map */
  for (i = MAP_ROW_SCRBOT; i > MAP_ROW_HTTOP; i--)
    for (j = 0x00; j < 0x20; j++)
      map.map[i][j] = map.map[i - 1][j];

  /* translate entities */
  for (i = 0; ent.ents[i].n != 0xFF; i++) {
    if (ent.ents[i].n) {
      ent.ents[i].ysave += 8;
      ent.ents[i].trig_y += 8;
      ent.ents[i].y += 8;
      if (ent.ents[i].y > 0x0140) {  /* map coord. from 0x0000 to 0x0140 */
/*	IFDEBUG_SCROLLER(
	  sys_printf("xrick/scroller: entity %#04X is gone\n", i);
	  );*/
				ent.ents[i].n = 0;
      }
    }
  }

  /* display */
  draw_map();
  ent_draw();
  draw_drawStatus();
  map.frow = _U8(--map.frow);

  /* loop */
  if (n2++ === 7) {
    /* activate visible entities */
    ent_actvis(map.frow + MAP_ROW_HTTOP, map.frow + MAP_ROW_HTBOT);

    /* prepare map */
    map_expand();

    /* display */
    draw_map();
    ent_draw();
    draw_drawStatus();
  }

  game.rects = draw_SCREENRECT;

  return SCROLL_RUNNING;
}

/* eof */
