import { control } from "./control";
import { game, game_setmusic } from "./game";
import { sysvid, sysvid_clear, sysvid_fadeStart, sysvid_fadeEnd } from "./sysvid";
import { draw, draw_SCREENRECT, draw_setfb, draw_tilesSubList, draw_tilesList, draw_tile, draw_sprite } from "./draw";
import { map_maps } from "./dat_maps";
import { screen_imapsteps, screen_imapsl, screen_imapsofs, screen_imaptext } from "./dat_screens";
import { rect_t } from "../include/rects";
import { CONTROL_FIRE, CONTROL_EXIT } from "../include/control";
import { SCREEN_EXIT, SCREEN_DONE, SCREEN_RUNNING } from "../include/screens";
import { sys_sleep } from "./system";
import { struct } from "./c";

/*
 * local vars
 */
let step;              /* current step */
let count;             /* number of loops for current step */
let run;               /* 1 = run, 0 = no more step */
let flipflop;          /* flipflop for top, bottom, left, right */
let spnum;             /* sprite number */
let spx, spdx;         /* sprite x position and delta */
let spy, spdy;         /* sprite y position and delta */
let spbase, spoffs;    /* base, offset for sprite numbers table */
let seq = 0;           /* anim sequence */

let fading;

// FIXME: like draw_setfb() with +8, +16???
const anim_rect = rect_t( 120 + 8, 16 + 16, 64, 64, null ); /* anim rectangle */

/*
 * Map introduction
 *
 * ASM: 1948
 *
 * return: SCREEN_RUNNING, SCREEN_DONE, SCREEN_EXIT
 */
export function
screen_introMap(timer)
{
  switch (seq) {
		case 0:
			sysvid_clear();
	/*
#ifdef GFXPC
			draw_tilesBank = 1;
			draw_filter = 0xAAAA;
#endif*/
//#ifdef GFXST
			draw.tilesBank = 0;
//#endif
			draw.tllst = [...screen_imaptext[game.map]];
			draw_setfb(32 + 8, 0 + 16);
			draw_tilesSubList();

			draw_setfb(32 + 8, 96 + 16); // +2???
//#ifdef GFXPC
//    draw_filter = 0x5555;
//#endif
			draw_tilesList();

			game.rects = null;

//#ifdef GFXPC
//    draw_filter = 0xFFFF;
//#endif

			init();
			nextstep();
			drawcenter();
			drawtb();
			drawlr();
			drawsprite();
			control.last = 0;

			game.rects = draw_SCREENRECT;

//#ifdef ENABLE_SOUND
			game_setmusic(map_maps[game.map].tune, 1);
//#endif

			seq = 1;
			fading = GE.Fader.IN;
			sysvid_fadeStart();
			break;
		case 1:  /* top and bottom borders */
			drawtb();
			game.rects = anim_rect;
			seq = 2;
			break;
		case 2:  /* background and sprite */
			anim();
			drawcenter();
			drawsprite();
			game.rects = anim_rect;
			seq = 3;
			break;
		case 3:  /* all borders */
			drawtb();
			drawlr();
			game.rects = anim_rect;
			seq = 1;
			break;
		case 4:  /* wait for key release */
			if (!(control.status & CONTROL_FIRE))
				seq = 5;
			else
				sys_sleep(50); /* .5s */
			break;
  }

  if (control.status & CONTROL_FIRE) {  /* end as soon as key pressed */
    seq = 4;
		fading = GE.Fader.OUT;
		sysvid_fadeStart();
	}

	if (fading) {
		game.rects = draw_SCREENRECT;
		if (!sysvid.fader.update(timer, fading)) {
			fading = sysvid_fadeEnd();
		}
	}

  if (control.status & CONTROL_EXIT) {  /* check for exit request */
    return SCREEN_EXIT;
	}

  if (seq === 5 && !fading) {  /* end as soon as key pressed */
    sysvid_clear();
    seq = 0;
		return SCREEN_DONE;
  } else {
    return SCREEN_RUNNING;
	}
}


/*
 * Display top and bottom borders (0x1B1F)
 *
 */
function
drawtb()
{
  let i;

  flipflop++;
  if (flipflop & 0x01) {
    draw_setfb(128 + 8, 16 + 16);
    for (i = 0; i < 6; i++)
      draw_tile(0x40);
    draw_setfb(128 + 8, 72 + 16);
    for (i = 0; i < 6; i++)
      draw_tile(0x06);
  }
  else {
    draw_setfb(128 + 8, 16 + 16);
    for (i = 0; i < 6; i++)
      draw_tile(0x05);
    draw_setfb(128 + 8, 72 + 16);
    for (i = 0; i < 6; i++)
      draw_tile(0x40);
  }
}


/*
 * Display left and right borders (0x1B7C)
 *
 */
function
drawlr()
{
  let i;

  if (flipflop & 0x02) {
    for (i = 0; i < 8; i++) {
      draw_setfb(120 + 8, 16 + i * 8 + 16);
      draw_tile(0x04);
      draw_setfb(176 + 8, 16 + i * 8 + 16);
      draw_tile(0x04);
    }
  }
  else {
    for (i = 0; i < 8; i++) {
      draw_setfb(120 + 8, 16 + i * 8 + 16);
      draw_tile(0x2B);
      draw_setfb(176 + 8, 16 + i * 8 + 16);
      draw_tile(0x2B);
    }
  }
}


/*
 * Draw the sprite (0x19C6)
 *
 */
function
drawsprite()
{
  draw_sprite(spnum, 128 + ((spx << 1) & 0x1C) + 8, 24 + (spy << 1) + 16);
}


/*
 * Draw the background (0x1AF1)
 *
 */
function
drawcenter()
{
  const tn0 = [ 0x07, 0x5B, 0x7F, 0xA3, 0xC7 ];
  let i, j, tn;

  tn = tn0[game.map];
  for (i = 0; i < 6; i++) {
    draw_setfb(128 + 8, (24 + 8 * i) + 16);
    for (j = 0; j < 6; j++)
      draw_tile(tn++);
  }
}


/*
 * Next Step (0x1A74)
 *
 */
function
nextstep()
{
  if (screen_imapsteps[step].count) {
    count = screen_imapsteps[step].count;
    spdx = screen_imapsteps[step].dx;
    spdy = screen_imapsteps[step].dy;
    spbase = screen_imapsteps[step].base;
    spoffs = 0;
    step++;
  }
  else {
    run = 0;
  }
}


/*
 * Anim (0x1AA8)
 *
 */
function
anim()
{
  let i;

  if (run) {
    i = screen_imapsl[spbase + spoffs];
    if (i == 0) {
      spoffs = 0;
      i = screen_imapsl[spbase];
    }
    spnum = i;
    spoffs++;
    spx += spdx;
    spy += spdy;
    count--;
    if (count == 0)
      nextstep();
  }
}


/*
 * Initialize (0x1A43)
 *
 */
function
init()
{
  run = 0; run--;
  step = screen_imapsofs[game.map];
  spx = screen_imapsteps[step].dx;
  spy = screen_imapsteps[step].dy;
  step++;
  spnum = 0; /* NOTE spnum in [8728] is never initialized ? */
}

/* eof */
