import { as_const, plusplus, _S16 } from "./c";
import { rect_t } from "../include/rects";
import { SYSVID_WIDTH, SYSVID_HEIGHT } from "../include/system";
import { dat_get } from "./dat_loader";
import { tiles } from "./dat_tilesST";
import { sprites } from "./dat_spritesST";
import { sysvid } from "./sysvid";
import { map } from "./maps";
import { TILES_BULLET, TILES_BOMB, TILES_RICK } from "../include/tiles";
import { game } from "./game";
import { DRAW_XYMAP_HBTOP, DRAW_XYMAP_SCRLEFT, DRAW_XYMAP_SCRTOP } from "../include/draw";

/*
 * counters positions (pixels, screen)
 */
const DRAW_STATUS_BULLETS_X = 0x68;
const DRAW_STATUS_BOMBS_X = 0xA8;
//#ifdef GFXST
const DRAW_STATUS_SCORE_X = 0x20;
const DRAW_STATUS_LIVES_X = 0xF0;
const DRAW_STATUS_Y = 0;
//#endif

/*
 * public vars
 */
export const draw = {
	/*U8*/ tllst: 0,     /* pointer to tiles list */
	/*U8*/ tilesBank: 0  /* tile number offset */
};
export const draw_STATUSRECT = rect_t(
  DRAW_STATUS_SCORE_X, DRAW_STATUS_Y,
  DRAW_STATUS_LIVES_X + 6 * 8 - DRAW_STATUS_SCORE_X, 8,
  null
);
export const draw_SCREENRECT = as_const(rect_t( 0, 0, SYSVID_WIDTH, SYSVID_HEIGHT, null ));

/*
 * private vars
 */
let fb = new G.Vector2();     /* frame buffer pointer */



/*
 * Set the frame buffer pointer
 *
 * x, y: position (pixels, screen)
 */
export function draw_setfb(x, y) {
	fb.x = x;
	fb.y = y;
}


/*
 * Clip to map screen
 *
 * x, y: position (pixels, map) CHANGED clipped
 * width, height: dimension CHANGED clipped
 * return: TRUE if fully clipped, FALSE if still (at least partly) visible
 */
export function
draw_clipms(x, y, width, height)
{
  if (x < 0) {
    if (x + width < 0)
      return { returns: true, x, y, width, height };
    else {
      width += x;
      x = 0;
    }
  }
  else {
    if (x > 0x0100)
			return { returns: true, x, y, width, height };
    else if (x + width > 0x0100) {
      width = 0x0100 - x;
    }
  }

  if (y < DRAW_XYMAP_SCRTOP) {
    if ((y + height) < DRAW_XYMAP_SCRTOP)
			return { returns: true, x, y, width, height };
    else {
      height += y - DRAW_XYMAP_SCRTOP;
      y = DRAW_XYMAP_SCRTOP;
    }
  }
  else {
    if (y >= DRAW_XYMAP_HBTOP)
			return { returns: true, x, y, width, height };
    else if (y + height > DRAW_XYMAP_HBTOP)
      height = DRAW_XYMAP_HBTOP - y;
  }

  return { returns: false, x, y, width, height };
}


/*
 * Draw a list of tiles onto the frame buffer
 * start at position indicated by fb ; at the end of each (sub)list,
 * perform a "carriage return + line feed" i.e. go back to the initial
 * position then go down one tile row (8 pixels)
 *
 * ASM 1e33
 * fb: CHANGED (see above)
 * draw_tllst: CHANGED points to the element following 0xfe/0xff end code
 */
export function draw_tilesList() {
	let t;

	t = fb.clone();
	while (draw_tilesSubList() !== 0xFE) {  /* draw sub-list */
		t.y += 8/* * SYSVID_WIDTH*/;  /* go down one tile i.e. 8 lines */
		fb = t.clone();
	}
}


/*
 * Draw a list of tiles onto the frame buffer -- same as draw_tilesList,
 * but accept an immediate string as parameter. Note that the string needs
 * to be properly terminated with 0xfe (\376) and 0xff (\377) chars.
 */
export function
draw_tilesListImm(list)
{
	if (typeof list === "string") {
		list = list.split('');
	}
  draw.tllst = [...list];
  draw_tilesList();
}


/*
 * Draw a sub-list of tiles onto the frame buffer
 * start at position indicated by fb ; leave fb pointing to the next
 * tile to the right of the last tile drawn
 *
 * ASM 1e41
 * fpb: CHANGED (see above)
 * draw_tllst: CHANGED points to the element following 0xfe/0xff end code
 * returns: end code (0xfe : end of list ; 0xff : end of sub-list)
 */
export function draw_tilesSubList() {
	let i;

  i = plusplus(draw.tllst);
  while (i !== 0xFF && i !== 0xFE) {  /* while not end */
    draw_tile(i);  /* draw tile */
    i = plusplus(draw.tllst);
  }
  return i;
}


/*
 * Draw a tile
 * at position indicated by fb ; leave fb pointing to the next tile
 * to the right of the tile drawn
 *
 * ASM 1e6c
 * tlnbr: tile number
 * draw_filter: CGA colors filter
 * fb: CHANGED (see above)
 */
export function
draw_tile(tileNumber)
{
	tiles.data[draw.tilesBank].draw(sysvid.fb.renderer, fb.x, fb.y, tileNumber);
	fb.x += 8;  /* next tile */
}


/*
 * Draw a sprite
 *
 * foobar
 */
//#ifdef GFXST
export function
draw_sprite(number, x, y)
{
  draw_setfb(x, y);
	sprites.data.draw(sysvid.fb.renderer, fb.x, fb.y, number);
}
//#endif


/*
 * Draw a sprite
 *
 * NOTE re-using original ST graphics format
 */
//#ifdef GFXST
export function
draw_sprite2(number, x, y, front)
{
  let d = 0;   /* sprite data */
  let x0, y0;  /* clipped x, y */
  let w, h;    /* width, height */
  let g,       /* sprite data offset*/
    r, c,      /* row, column */
    i,         /* frame buffer shifter */
    im;        /* tile flag shifter */
  let flg;     /* tile flag */
	let tmp;

  x0 = x;
  y0 = y;
  w = 0x20;
  h = 0x15;

  if ((tmp = draw_clipms(x0, y0, w, h)).returns)  /* return if not visible */
    return;
	x0 = tmp.x;
	y0 = tmp.y;
	w = tmp.width;
	h = tmp.height;

  g = 0;
	sysvid.fb.enableClipping(new G.Rect(x0 - DRAW_XYMAP_SCRLEFT, y0 - DRAW_XYMAP_SCRTOP + 8, w, h));
  draw_setfb(x0 - DRAW_XYMAP_SCRLEFT, y0 - DRAW_XYMAP_SCRTOP + 8);
	draw_sprite(number, fb.x, fb.y);
	sysvid.fb.disableClipping();
/*
  for (r = 0; r < 0x15; r++) {
    if (r >= h || y + r < y0) continue;

    i = 0x1f;
    im = x - (x & 0xfff8);
    flg = map.eflg[map.map[(y + r) >> 3][(x + 0x1f)>> 3]];

//#ifdef ENABLE_CHEATS
function LOOP(N, C0, C1) {
    d = sprites.data[number][g + N];
    for (c = C0; c >= C1; c--, i--, d >>= 4, im--) {
      if (im == 0) {
				flg = map.eflg[map.map[(y + r) >> 3][(x + c) >> 3]];
				im = 8;
      }
      if (c >= w || x + c < x0) continue;
      if (!front && !game.cheat3 && (flg & MAP_EFLG_FGND)) continue;
      if (d & 0x0F) fb[i] = (fb[i] & 0xF0) | (d & 0x0F);
      if (game.cheat3) fb[i] |= 0x10;
    }
}*/
/*#else
#define LOOP(N, C0, C1) \
    d = sprites_data[number][g + N]; \
    for (c = C0; c >= C1; c--, i--, d >>= 4, im--) { \
      if (im == 0) { \
	flg = map_eflg[map_map[(y + r) >> 3][(x + c) >> 3]]; \
	im = 8; \
      } \
      if (!front && (flg & MAP_EFLG_FGND)) continue; \
      if (c >= w || x + c < x0) continue; \
      if (d & 0x0F) fb[i] = (fb[i] & 0xF0) | (d & 0x0F); \
    }
#endif
*/
 /* LOOP(3, 0x1f, 0x18);
    LOOP(2, 0x17, 0x10);
    LOOP(1, 0x0f, 0x08);
    LOOP(0, 0x07, 0x00);

//#undef LOOP

    fb += SYSVID_WIDTH;
    g += 4;
  }
*/
}

//#endif


/*
 * Redraw the map behind a sprite
 * align to tile column and row, and clip
 *
 * x, y: sprite position (pixels, map).
 */
export function
draw_spriteBackground(x, y)
{
  let r, c;
  let rmax, cmax;
  let xmap, ymap;	// S16
  let xs, ys;
	let tmp;

  /* aligne to column and row, prepare map coordinate, and clip */
  xmap = _S16(x & 0xFFF8);
  ymap = _S16(y & 0xFFF8);
  cmax = (x - xmap == 0 ? 0x20 : 0x28);  /* width, 4 tl cols, 8 pix each */
  rmax = (y & 0x04) ? 0x20 : 0x18;  /* height, 3 or 4 tile rows */
  if ((tmp = draw_clipms(xmap, ymap, cmax, rmax)).returns)  /* don't draw if fully clipped */
    return;
	xmap = tmp.x;
	ymap = tmp.y;
	cmax = tmp.width;
	rmax = tmp.height;

  /* get back to screen */
  xs = xmap - DRAW_XYMAP_SCRLEFT;
  ys = ymap - DRAW_XYMAP_SCRTOP;
  xmap >>= 3;
  ymap >>= 3;
  cmax >>= 3;
  rmax >>= 3;

  /* draw */
  for (r = 0; r < rmax; r++) {  /* for each row */
//#ifdef GFXPC
//    draw_setfb(xs, ys + r * 8);
//#endif
//#ifdef GFXST
    draw_setfb(xs, 8 + ys + r * 8);
//#endif
    for (c = 0; c < cmax; c++) {  /* for each column */
      draw_tile(map.map[ymap + r][xmap + c]);
    }
  }
}


/*
 * Draw entire map screen background tiles onto frame buffer.
 *
 * ASM 0af5, 0a54
 */
export function
draw_map()
{
  let i, j;

  draw.tilesBank = map.tilesBank;

  for (i = 0; i < 0x18; i++) {  /* 0x18 rows */
//#ifdef GFXPC
//    draw_setfb(0x20, (i * 8));
//#endif
//#ifdef GFXST
    draw_setfb(0x20, 8 + (i * 8));
//#endif
    for (j = 0; j < 0x20; j++)  /* 0x20 tiles per row */
      draw_tile(map.map[i + 8][j]);
  }
}


/*
 * Draw status indicators
 *
 * ASM 0309
 */
export function
draw_drawStatus()
{
  let i;
  let sv;
  const s = [0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0xfe];

  draw.tilesBank = 0;

  for (i = 5, sv = game.score; i >= 0; i--) {
    s[i] = 0x30 + ((sv | 0) % 10);
    sv /= 10;
  }
  draw.tllst = [...s];

  draw_setfb(DRAW_STATUS_SCORE_X, DRAW_STATUS_Y);
  draw_tilesList();

  draw_setfb(DRAW_STATUS_BULLETS_X, DRAW_STATUS_Y);
  for (i = 0; i < game.bullets; i++)
    draw_tile(TILES_BULLET);

  draw_setfb(DRAW_STATUS_BOMBS_X, DRAW_STATUS_Y);
  for (i = 0; i < game.bombs; i++)
    draw_tile(TILES_BOMB);

  draw_setfb(DRAW_STATUS_LIVES_X, DRAW_STATUS_Y);
  for (i = 0; i < game.lives; i++)
    draw_tile(TILES_RICK);
}


/*
 * Draw info indicators
 */
//#ifdef ENABLE_CHEATS
export function
draw_infos()
{
  draw.tilesBank = 0;

//#ifdef GFXPC
//  draw_filter = 0xffff;
//#endif

  draw_setfb(0x00 , DRAW_STATUS_Y);
  draw_tile(game.cheat1 ? 'T' : '@');
  draw_setfb(0x08, DRAW_STATUS_Y);
  draw_tile(game.cheat2 ? 'N' : '@');
  draw_setfb(0x10, DRAW_STATUS_Y);
  draw_tile(game.cheat3 ? 'V' : '@');
}
//#endif


/*
 * Clear status indicators
 */
export function
draw_clearStatus()
{
  let i;

//#ifdef GFXPC
//  draw_tilesBank = map_tilesBank;
//#endif
//#ifdef GFXST
  draw.tilesBank = 0;
//#endif
  draw_setfb(DRAW_STATUS_SCORE_X, DRAW_STATUS_Y);
  for (i = 0; i < DRAW_STATUS_LIVES_X/8 + 6 - DRAW_STATUS_SCORE_X/8; i++) {
//#ifdef GFXPC
//    draw_tile(map_map[MAP_ROW_SCRTOP + (DRAW_STATUS_Y / 8)][i]);
//#endif
//#ifdef GFXST
    draw_tile('@');
//#endif
  }
}


/*
 * Draw a picture
 */
//#ifdef GFXST
export function
draw_pic(x, y, w, h, pic)
{
	sysvid.fb.renderer.drawBitmapSection(dat_get(pic), x, y, new G.Rect(0, 0, w, h));
}
//#endif


/*
 * Draw a bitmap
 */
/*export function
draw_img(i)
{
  let k;

  draw_setfb(0, 0);
  if (i->ncolors > 0)
    sysvid_setPalette(i->colors, i->ncolors);
  for (k = 0; k < SYSVID_WIDTH * SYSVID_HEIGHT; k++)
    fb[k] = i->pixels[k];
}
*/

/* eof */
