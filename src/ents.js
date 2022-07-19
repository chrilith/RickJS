import { _S16, _U8 } from "./c";
import { ENT_FLG_STOPRICK, ENT_FLG_LETHALR, ENT_LETHAL,
	ENT_FLG_TRIGBOMB, ENT_FLG_TRIGBULLET, ENT_FLG_TRIGSTOP, ENT_FLG_TRIGRICK } from "../include/ents";
import { E_RICK_STSTOP, E_RICK_STRST } from "../include/e_rick";
import { e_rick_action } from "./e_rick";
import { e_bomb } from "./e_bomb";
import { map_submaps, map_marks } from "./dat_maps";
import { game } from "./game";
import { MAP_MARK_NACT } from "../include/maps";
import { ent_entdata } from "./dat_ents";
import { map } from "./maps";
import { ent } from "../include/ents";
import { e_them_t1a_action, e_them_t1b_action, e_them_t2_action,
				 e_them_z_action, e_them_t3_action } from "./e_them";
import { e_bullet_action } from "./e_bullet";
import { e_bomb_action } from "./e_bomb";
import { e_box_action } from "./e_box";
import { e_bonus_action } from "./e_bonus";
import { e_sbonus_start, e_sbonus_stop } from "./e_sbonus";
import { draw, draw_sprite2, draw_clipms, draw_spriteBackground } from "./draw";
import { rects_free, rects_new } from "./rects";
import { DRAW_XYMAP_SCRLEFT, DRAW_XYMAP_SCRTOP } from "../include/draw";

/*
 * global vars
 */
// See include/ents.js

/*
 * prototypes
 */
//static void ent_addrect(S16, S16, U16, U16);
//static U8 ent_creat1(U8 *);
//static U8 ent_creat2(U8 *, U16);


/*
 * Reset entities
 *
 * ASM 2520
 */
export
function ent_reset()
{
  let i;

  E_RICK_STRST(E_RICK_STSTOP);
  e_bomb.lethal = false;

  ent.ents[0].n = 0;
  for (i = 2; ent.ents[i].n != 0xff; i++)
    ent.ents[i].n = 0;
}


/*
 * Create an entity on slots 4 to 8 by using the first slot available.
 * Entities of type e_them on slots 4 to 8, when lethal, can kill
 * other e_them (on slots 4 to C) as well as rick.
 *
 * ASM 209C
 *
 * e: anything, CHANGED to the allocated entity number.
 * return: TRUE/OK FALSE/not
 */
function
ent_creat1(e)
{
  /* look for a slot */
  for (e = 0x04; e < 0x09; e++)
    if (ent.ents[e].n == 0) {  /* if slot available, use it */
      ent.ents[e].c1 = 0;
      return { e, returns: true };
    }

  return { e, returns: false };
}


/*
 * Create an entity on slots 9 to C by using the first slot available.
 * Entities of type e_them on slots 9 to C can kill rick when lethal,
 * but they can never kill other e_them.
 *
 * ASM 20BC
 *
 * e: anything, CHANGED to the allocated entity number.
 * m: number of the mark triggering the creation of the entity.
 * ret: TRUE/OK FALSE/not
 */
function
ent_creat2(e, m)
{
  /* make sure the entity created by this mark is not active already */
  for (e = 0x09; e < 0x0c; e++)
    if (ent.ents[e].n != 0 && ent.ents[e].mark == m)
      return { e, returns: false };

  /* look for a slot */
  for (e = 0x09; e < 0x0c; e++)
    if (ent.ents[e].n == 0) {  /* if slot available, use it */
      ent.ents[e].c1 = 2;
      return { e, returns: true };
    }

  return { e, returns: false };
}

/*
 * Process marks that are within the visible portion of the map,
 * and create the corresponding entities.
 *
 * absolute map coordinate means that they are not relative to
 * map_frow, as any other coordinates are.
 *
 * ASM 1F40
 *
 * frow: first visible row of the map -- absolute map coordinate
 * lrow: last visible row of the map -- absolute map coordinate
 */
export function
ent_actvis(frow, lrow)
{
	let m;
	let e;
	let y, tmp;

	/*
	* go through the list and find the first mark that
	* is visible, i.e. which has a row greater than the
	* first row (marks being ordered by row number).
	*/
	for (m = map_submaps[game.submap].mark;
		map_marks[m].row != 0xff && map_marks[m].row < frow;
		m++);

	if (map_marks[m].row == 0xff)  /* none found */
		return;

	/*
	* go through the list and process all marks that are
	* visible, i.e. which have a row lower than the last
	* row (marks still being ordered by row number).
	*/
	for (;
		map_marks[m].row != 0xff && map_marks[m].row < lrow;
		m++) {

		/* ignore marks that are not active */
		if (map_marks[m].ent & MAP_MARK_NACT)
			continue;

		/*
		 * allocate a slot to the new entity
		 *
		 * slot type
		 *  0   available for e_them (lethal to other e_them, and stops entities
		 *      i.e. entities can't move over them. E.g. moving blocks. But they
		 *      can move over entities and kill them!).
		 *  1   xrick
		 *  2   bullet
		 *  3   bomb
		 * 4-8  available for e_them, e_box, e_bonus or e_sbonus (lethal to
		 *      other e_them, identified by their number being >= 0x10)
		 * 9-C  available for e_them, e_box, e_bonus or e_sbonus (not lethal to
		 *      other e_them, identified by their number being < 0x10)
		 *
		 * the type of an entity is determined by its .n as detailed below.
		 *
		 * 1               xrick
		 * 2               bullet
		 * 3               bomb
		 * 4, 7, a, d      e_them, type 1a
		 * 5, 8, b, e      e_them, type 1b
		 * 6, 9, c, f      e_them, type 2
		 * 10, 11          box
		 * 12, 13, 14, 15  bonus
		 * 16, 17          speed bonus
		 * >17             e_them, type 3
		 * 47              zombie
		 */

		if (!(map_marks[m].flags & ENT_FLG_STOPRICK)) {
			if (map_marks[m].ent >= 0x10) {
				/* boxes, bonuses and type 3 e_them go to slot 4-8 */
				/* (c1 set to 0 -> all type 3 e_them are sleeping) */
				tmp = ent_creat1(e); e = tmp.e;	// should be pointer => *e
				if (!tmp.returns) { continue; }
			}
			else {
				/* type 1 and 2 e_them go to slot 9-c */
				/* (c1 set to 2) */
				tmp = ent_creat2(e, m); e = tmp.e;	// should be pointer => *e
				if (!tmp.returns) { continue; }
			}
		}
		else {
			/* entities stopping rick (e.g. blocks) go to slot 0 */
			if (ent.ents[0].n) continue;
			e = 0;
			ent.ents[0].c1 = 0;
		}

    /*
     * initialize the entity
     */
    ent.ents[e].mark = m;
    ent.ents[e].flags = map_marks[m].flags;
    ent.ents[e].n = map_marks[m].ent;

    /*
     * if entity is to be already running (i.e. not asleep and waiting
     * for some trigger to move), then use LETHALR i.e. restart flag, right
     * from the beginning
     */
    if (ent.ents[e].flags & ENT_FLG_LETHALR)
      ent.ents[e].n |= ENT_LETHAL;

    ent.ents[e].x = map_marks[m].xy & 0xf8;

    y = (map_marks[m].xy & 0x07) + (map_marks[m].row & 0xf8) - map.frow;
    y <<= 3;
    if (!(ent.ents[e].flags & ENT_FLG_STOPRICK))
      y += 3;
    ent.ents[e].y = y;

    ent.ents[e].xsave = ent.ents[e].x;
    ent.ents[e].ysave = ent.ents[e].y;

    /*ent.ents[e].w0C = 0;*/  /* in ASM code but never used */

    ent.ents[e].w = ent_entdata[map_marks[m].ent].w;
    ent.ents[e].h = ent_entdata[map_marks[m].ent].h;
    ent.ents[e].sprbase = ent_entdata[map_marks[m].ent].spr;
    ent.ents[e].sprite = _U8(ent_entdata[map_marks[m].ent].spr);
    ent.ents[e].step_no_i = ent_entdata[map_marks[m].ent].sni;
    ent.ents[e].trigsnd = _U8(ent_entdata[map_marks[m].ent].snd);

    /*
     * FIXME what is this? when all trigger flags are up, then
     * use .sni for sprbase. Why? What is the point? (This is
     * for type 1 and 2 e_them, ...)
     *
     * This also means that as long as sprite has not been
     * recalculated, a wrong value is used. This is normal, see
     * what happens to the falling guy on the right on submap 3:
     * it changes when hitting the ground.
     */
const ENT_FLG_TRIGGERS =
(ENT_FLG_TRIGBOMB|ENT_FLG_TRIGBULLET|ENT_FLG_TRIGSTOP|ENT_FLG_TRIGRICK)
    if ((ent.ents[e].flags & ENT_FLG_TRIGGERS) == ENT_FLG_TRIGGERS
	&& e >= 0x09)
      ent.ents[e].sprbase = _U8(ent_entdata[map_marks[m].ent].sni & 0x00ff);
//#undef ENT_FLG_TRIGGERS

		//ent.ents[e].sprite = ent.ents[e].sprbase; UPGRADE: presnet un other JS versiON???
    ent.ents[e].trig_x = map_marks[m].lt & 0xf8;
    ent.ents[e].latency = (map_marks[m].lt & 0x07) << 5;  /* <<5 eq *32 */

    ent.ents[e].trig_y = 3 + 8 * ((map_marks[m].row & 0xf8) - map.frow +
				  (map_marks[m].lt & 0x07));

    ent.ents[e].c2 = 0;
    ent.ents[e].offsy = 0;
    ent.ents[e].ylow = 0;

    ent.ents[e].front = false;

  }
}


/*
 * Add a tile-aligned rectangle containing the given rectangle (indicated
 * by its MAP coordinates) to the list of rectangles. Clip the rectangle
 * so it fits into the display zone.
 */
function
ent_addrect(x, y, width, height)
{
  let x0, y0;
  let w0, h0;
	let tmp;

  /*sys_printf("rect %#04x,%#04x %#04x %#04x ", x, y, width, height);*/

  /* align to tiles */
  x0 = _S16(x & 0xfff8);
  y0 = _S16(y & 0xfff8);
  w0 = width;
  h0 = height;
  if (x - x0) w0 = (w0 + (x - x0)) | 0x0007;
  if (y - y0) h0 = (h0 + (y - y0)) | 0x0007;

  /* clip */

  if ((tmp = draw_clipms(x0, y0, w0, h0)).returns) {  /* do not add if fully clipped */
    /*sys_printf("-> [clipped]\n");*/
    return;
  }
	x0 = tmp.x;
	y0 = tmp.y;
	w0 = tmp.width;
	h0 = tmp.height;

  /*sys_printf("-> %#04x,%#04x %#04x %#04x\n", x0, y0, w0, h0);*/

//#ifdef GFXST
  y0 += 8;
//#endif

  /* get to screen */
  x0 -= DRAW_XYMAP_SCRLEFT;
  y0 -= DRAW_XYMAP_SCRTOP;

  /* add rectangle to the list */
  ent.rects = rects_new(x0, y0, w0, h0, ent.rects);
}


/*
 * Draw all entities onto the frame buffer.
 *
 * ASM 07a4
 *
 * NOTE This may need to be part of draw.c. Also needs better comments,
 * NOTE and probably better rectangles management.
 */
let ch3 = false;
export function
ent_draw()
{
  let i;
//#ifdef ENABLE_CHEATS
//  static U8 ch3 = FALSE;
//#endif
  let dx, dy;

  draw.tilesBank = map.tilesBank;

  /* reset rectangles list */
  rects_free(ent.rects);
  ent.rects = null;

  /*sys_printf("\n");*/

  /*
   * background loop : erase all entities that were visible
   */
  for (i = 0; ent.ents[i].n != 0xff; i++) {
//#ifdef ENABLE_CHEATS
    if (ent.ents[i].prev_n && (ch3 || ent.ents[i].prev_s))
//#else
//    if (ent.ents[i].prev_n && ent.ents[i].prev_s)
//#endif
      /* if entity was active, then erase it (redraw the map) */
      draw_spriteBackground(ent.ents[i].prev_x, ent.ents[i].prev_y);
  }

  /*
   * foreground loop : draw all entities that are visible
   */
  for (i = 0; ent.ents[i].n != 0xff; i++) {
    /*
     * If entity is active now, draw the sprite. If entity was
     * not active before, add a rectangle for the sprite.
     */
//#ifdef ENABLE_CHEATS
    if (ent.ents[i].n && (game.cheat3 || ent.ents[i].sprite))
//#else
//    if (ent.ents[i].n && ent.ents[i].sprite)
//#endif
      /* If entitiy is active, draw the sprite. */
      draw_sprite2(ent.ents[i].sprite,
		   ent.ents[i].x, ent.ents[i].y,
		   ent.ents[i].front);
  }

  /*
   * rectangles loop : figure out which parts of the screen have been
   * impacted and need to be refreshed, then save state
   */
  for (i = 0; ent.ents[i].n != 0xff; i++) {
//#ifdef ENABLE_CHEATS
    if (ent.ents[i].prev_n && (ch3 || ent.ents[i].prev_s)) {
//#else
//    if (ent.ents[i].prev_n && ent.ents[i].prev_s) {
//#endif
      /* (1) if entity was active and has been drawn ... */
//#ifdef ENABLE_CHEATS
      if (ent.ents[i].n && (game.cheat3 || ent.ents[i].sprite)) {
//#else
//      if (ent.ents[i].n && ent.ents[i].sprite) {
//#endif
				/* (1.1) ... and is still active now and still needs to be drawn, */
				/*       then check if rectangles intersect */
				dx = Math.abs(ent.ents[i].x - ent.ents[i].prev_x);
				dy = Math.abs(ent.ents[i].y - ent.ents[i].prev_y);
				if (dx < 0x20 && dy < 0x16) {
					/* (1.1.1) if they do, then create one rectangle */
					ent_addrect((ent.ents[i].prev_x < ent.ents[i].x)
								? ent.ents[i].prev_x : ent.ents[i].x,
								(ent.ents[i].prev_y < ent.ents[i].y)
								? ent.ents[i].prev_y : ent.ents[i].y,
								dx + 0x20, dy + 0x15);
				}
				else {
					/* (1.1.2) else, create two rectangles */
					ent_addrect(ent.ents[i].x, ent.ents[i].y, 0x20, 0x15);
					ent_addrect(ent.ents[i].prev_x, ent.ents[i].prev_y, 0x20, 0x15);
				}
      }
      else
				/* (1.2) ... and is not active anymore or does not need to be drawn */
				/*       then create one single rectangle */
				ent_addrect(ent.ents[i].prev_x, ent.ents[i].prev_y, 0x20, 0x15);
    }
//#ifdef ENABLE_CHEATS
    else if (ent.ents[i].n && (game.cheat3 || ent.ents[i].sprite)) {
//#else
//    else if (ent.ents[i].n && ent.ents[i].sprite) {
//#endif
      /* (2) if entity is active and needs to be drawn, */
      /*     then create one rectangle */
      ent_addrect(ent.ents[i].x, ent.ents[i].y, 0x20, 0x15);
    }

    /* save state */
    ent.ents[i].prev_x = ent.ents[i].x;
    ent.ents[i].prev_y = ent.ents[i].y;
    ent.ents[i].prev_n = ent.ents[i].n;
    ent.ents[i].prev_s = ent.ents[i].sprite;
  }

//#ifdef ENABLE_CHEATS
  ch3 = game.cheat3;
//#endif
}


/*
 * Clear entities previous state
 *
 */
export function
ent_clprev()
{
  let i;

  for (i = 0; ent.ents[i].n != 0xff; i++)
    ent.ents[i].prev_n = 0;
}

/*
 * Table containing entity action function pointers.
 */
const ent_actf = [
  null,        /* 00 - zero means that the slot is free */
  e_rick_action,   /* 01 - 12CA */
  e_bullet_action,  /* 02 - 1883 */
  e_bomb_action,  /* 03 - 18CA */
  e_them_t1a_action,  /* 04 - 2452 */
  e_them_t1b_action,  /* 05 - 21CA */
  e_them_t2_action,  /* 06 - 2718 */
  e_them_t1a_action,  /* 07 - 2452 */
  e_them_t1b_action,  /* 08 - 21CA */
  e_them_t2_action,  /* 09 - 2718 */
  e_them_t1a_action,  /* 0A - 2452 */
  e_them_t1b_action,  /* 0B - 21CA */
  e_them_t2_action,  /* 0C - 2718 */
  e_them_t1a_action,  /* 0D - 2452 */
  e_them_t1b_action,  /* 0E - 21CA */
  e_them_t2_action,  /* 0F - 2718 */
  e_box_action,  /* 10 - 245A */
  e_box_action,  /* 11 - 245A */
  e_bonus_action,  /* 12 - 242C */
  e_bonus_action,  /* 13 - 242C */
  e_bonus_action,  /* 14 - 242C */
  e_bonus_action,  /* 15 - 242C */
  e_sbonus_start,  /* 16 - 2182 */
  e_sbonus_stop  /* 17 - 2143 */
];


/*
 * Run entities action function
 *
 */
export function
ent_action()
{
  let i, k;
/*
  IFDEBUG_ENTS(
    sys_printf("xrick/ents: --------- action ----------------\n");
    for (i = 0; ent.ents[i].n != 0xff; i++)
      if (ent.ents[i].n) {
	sys_printf("xrick/ents: slot %#04x, entity %#04x", i, ent.ents[i].n);
	sys_printf(" (%#06x, %#06x), sprite %#04x.\n",
		   ent.ents[i].x, ent.ents[i].y, ent.ents[i].sprite);
      }
    );
*/
  for (i = 0; ent.ents[i].n != 0xff; i++) {
    if (ent.ents[i].n) {
      k = ent.ents[i].n & 0x7f;
      if (k === 0x47)
				e_them_z_action(i);
      else if (k >= 0x18)
        e_them_t3_action(i);
      else
				ent_actf[k](i);
    }
  }
}


/* eof */
