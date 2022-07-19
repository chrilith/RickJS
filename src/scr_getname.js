import { CONTROL_DOWN, CONTROL_EXIT, CONTROL_FIRE, CONTROL_LEFT,
				 CONTROL_RIGHT, CONTROL_UP } from "../include/control";
import { SCREEN_DONE, SCREEN_RUNNING } from "../include/screens";
import { _STR } from "./c";
import { control } from "./control";
import { draw, draw_SCREENRECT, draw_setfb, draw_tile,
				 draw_tilesListImm } from "./draw";
import { game } from "./game";
import { sys_gettime, sys_sleep } from "./system";
import { sysvid_clear } from "./sysvid";

/*
 * local vars
 */
let seq = 0;
let x, y, p;
const name = Array(10);

const TILE_POINTER = 0x3A; // '\072';
const TILE_CURSOR = 0x3B; // '\073';
const TOPLEFT_X = 116;
const TOPLEFT_Y = 64;
const NAMEPOS_X = 120;
const NAMEPOS_Y = 160;
const AUTOREPEAT_TMOUT = 100;


/*
 * Get name
 *
 * return: 0 while running, 1 when finished.
 */
let tm = 0;

export function
screen_getname()
{
//  static U32 tm = 0;
  let i, j;

  if (seq === 0) {
    /* figure out if this is a high score */
    if (game.score < game.hscores[7].score)
      return SCREEN_DONE;

    /* prepare */
    draw.tilesBank = 0;
//#ifdef GFXPC
//    draw_filter = 0xffff;
//#endif
    for (i = 0; i < 10; i++)
      name[i] = '@';
    x = y = p = 0;
    game.rects = draw_SCREENRECT;
    seq = 1;
  }

  switch (seq) {
  case 1:  /* prepare screen */
    sysvid_clear();
//#ifdef GFXPC
//    draw_setfb(32, 8);
//    draw_filter = 0xaaaa; /* red */
//    draw_tilesListImm(screen_congrats);
//#endif
    draw_setfb(76, 40);
//#ifdef GFXPC
//    draw_filter = 0xffff; /* yellow */
//#endif
    draw_tilesListImm("PLEASE@ENTER@YOUR@NAME\xFE");
//#ifdef GFXPC
//    draw_filter = 0x5555; /* green */
//#endif
    for (i = 0; i < 6; i++)
      for (j = 0; j < 4; j++) {
				draw_setfb(TOPLEFT_X + i * 8 * 2, TOPLEFT_Y + j * 8 * 2);
				draw_tile('A'.charCodeAt(0) + i + j * 6);
      }
    draw_setfb(TOPLEFT_X, TOPLEFT_Y + 64);
//#ifdef GFXST
    draw_tilesListImm("Y@Z@.@@@\x3C\xFB\xFC\xFD\xFE");
//#endif
//#ifdef GFXPC
//    draw_tilesListImm((U8 *)"Y@Z@.@@@\074@\075@\376");
//#endif
    name_draw();
    pointer_show(true);
    seq = 2;
    break;

  case 2:  /* wait for key pressed */
    if (control.status & CONTROL_FIRE)
      seq = 3;
    if (control.status & CONTROL_UP) {
      if (y > 0) {
				pointer_show(false);
				y--;
				pointer_show(true);
				tm = sys_gettime();
      }
      seq = 4;
    }
    if (control.status & CONTROL_DOWN) {
      if (y < 4) {
				pointer_show(false);
				y++;
				pointer_show(true);
				tm = sys_gettime();
      }
      seq = 5;
    }
    if (control.status & CONTROL_LEFT) {
      if (x > 0) {
				pointer_show(false);
				x--;
				pointer_show(true);
				tm = sys_gettime();
      }
      seq = 6;
    }
    if (control.status & CONTROL_RIGHT) {
      if (x < 5) {
				pointer_show(false);
				x++;
				pointer_show(true);
				tm = sys_gettime();
      }
      seq = 7;
    }
    if (seq === 2)
      sys_sleep(50);
    break;

  case 3:  /* wait for FIRE released */
    if (!(control.status & CONTROL_FIRE)) {
      if (x == 5 && y == 4) {  /* end */
				i = 0;
				while (game.score < game.hscores[i].score)
					i++;
				j = 7;
				while (j > i) {
					game.hscores[j].score = game.hscores[j - 1].score;
					//for (x = 0; x < 10; x++)
						game.hscores[j].name/*[x]*/ = game.hscores[j - 1].name/*[x]*/;
					j--;
				}
				game.hscores[i].score = game.score;
				//for (x = 0; x < 10; x++)
					game.hscores[i].name/*[x]*/ = _STR(name)/*[x]*/;
				seq = 99;
      }
      else {
				name_update();
				name_draw();
				seq = 2;
      }
    }
    else
      sys_sleep(50);
    break;

  case 4:  /* wait for UP released */
    if (!(control.status & CONTROL_UP) ||
				sys_gettime() - tm > AUTOREPEAT_TMOUT)
      seq = 2;
    else
      sys_sleep(50);
    break;

  case 5:  /* wait for DOWN released */
    if (!(control.status & CONTROL_DOWN) ||
				sys_gettime() - tm > AUTOREPEAT_TMOUT)
      seq = 2;
    else
      sys_sleep(50);
    break;

  case 6:  /* wait for LEFT released */
    if (!(control.status & CONTROL_LEFT) ||
				sys_gettime() - tm > AUTOREPEAT_TMOUT)
      seq = 2;
    else
      sys_sleep(50);
    break;

  case 7:  /* wait for RIGHT released */
    if (!(control.status & CONTROL_RIGHT) ||
				sys_gettime() - tm > AUTOREPEAT_TMOUT)
      seq = 2;
    else
      sys_sleep(50);
    break;

  }

  if (control.status & CONTROL_EXIT)  /* check for exit request */
    return SCREEN_EXIT;

  if (seq === 99) {  /* seq 99, we're done */
    sysvid_clear();
    seq = 0;
    return SCREEN_DONE;
  }
  else
    return SCREEN_RUNNING;
}


function
pointer_show(show)
{
  draw_setfb(TOPLEFT_X + x * 8 * 2, TOPLEFT_Y + y * 8 * 2 + 8);
//#ifdef GFXPC
//  draw_filter = 0xaaaa; /* red */
//#endif
  draw_tile((show === true)?TILE_POINTER:'@'.charCodeAt(0));
}

function
name_update()
{
  let i;

  i = x + y * 6;
  if (i < 26 && p < 10)
    name[p++] = 'A'.charCodeAt(0) + i;
  if (i == 26 && p < 10)
    name[p++] = '.'.charCodeAt(0);
  if (i == 27 && p < 10)
    name[p++] = '@'.charCodeAt(0);
  if (i == 28 && p > 0) {
    p--;
  }
}

function
name_draw()
{
  let i;

  draw_setfb(NAMEPOS_X, NAMEPOS_Y);
//#ifdef GFXPC
//  draw_filter = 0xaaaa; /* red */
//#endif
  for (i = 0; i < p; i++)
    draw_tile(name[i]);
  for (i = p; i < 10; i++)
    draw_tile(TILE_CURSOR);

//#ifdef GFXST
  draw_setfb(NAMEPOS_X, NAMEPOS_Y + 8);
  for (i = 0; i < 10; i++)
    draw_tile('@');
  draw_setfb(NAMEPOS_X + 8 * (p < 9 ? p : 9), NAMEPOS_Y + 8);
  draw_tile(TILE_POINTER);
//#endif
}


/* eof */
