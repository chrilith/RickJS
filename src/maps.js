import { create_array, _U8 } from "./c";
import { map_submaps, map_marks, map_eflg_c, map_blocks, map_bnums, map_connect } from "./dat_maps";
import {
	MAP_NBR_MARKS, MAP_MARK_NACT,
	MAP_ROW_SCRTOP, MAP_ROW_SCRBOT,
	MAP_ROW_HTTOP, MAP_ROW_HTBOT,
	MAP_ROW_HBTOP, MAP_ROW_HBBOT } from "../include/maps";
import { game } from "./game";
import { ent_reset, ent_actvis } from "./ents";
import { ent } from "../include/ents";
import { e_sbonus } from "./e_sbonus";

/*
 * global vars
 */
export const map = {
	map: create_array(0x2C, 0x20),
	eflg: create_array(0x100),
	frow: 0,
	tilesBank: 0
};


/*
 * Fill in map_map with tile numbers by expanding blocks.
 *
 * add map_submaps[].bnum to map_frow to find out where to start from.
 * We need to /4 map_frow to convert from tile rows to block rows, then
 * we need to *8 to convert from block rows to block numbers (there
 * are 8 blocks per block row). This is achieved by *2 then &0xfff8.
 */
export function
map_expand()
{
  let i, j, k, l;
  let row, col;
  let pbnum;

  pbnum = map_submaps[game.submap].bnum + ((2 * map.frow) & 0xfff8);
  row = col = 0;
console.log("START", map_submaps[game.submap].bnum, map.frow)
	for (i = 0; i < 0x0b; i++) {  /* 0x0b rows of blocks */
    for (j = 0; j < 0x08; j++) {  /* 0x08 blocks per row */
      for (k = 0, l = 0; k < 0x04; k++) {  /* expand one block */

//console.log(i, j, k, l, row, col, pbnum)
				map.map[row][col++] = map_blocks[map_bnums[pbnum]][l++];
				map.map[row][col++] = map_blocks[map_bnums[pbnum]][l++];
				map.map[row][col++] = map_blocks[map_bnums[pbnum]][l++];
				map.map[row][col]   = map_blocks[map_bnums[pbnum]][l++];
				row += 1; col -= 3;
			}
      row -= 4; col += 4;
      pbnum++;
    }
    row += 4; col = 0;
  }
}


/*
 * Initialize a new submap
 *
 * ASM 0cc3
 */
export function
map_init()
{
	/*sys_printf("xrick/map_init: map=%#04x submap=%#04x\n", g_map, game_submap);*/

	map.tilesBank = (map_submaps[game.submap].page === 1) ? 2 : 1;

	map_eflg_expand((map_submaps[game.submap].page === 1) ? 0x10 : 0x00);
	map_expand();
	ent_reset();
	ent_actvis(map.frow + MAP_ROW_SCRTOP, map.frow + MAP_ROW_SCRBOT);
	ent_actvis(map.frow + MAP_ROW_HTTOP, map.frow + MAP_ROW_HTBOT);
	ent_actvis(map.frow + MAP_ROW_HBTOP, map.frow + MAP_ROW_HBBOT);
}


/*
 * Expand entity flags for this map
 *
 * ASM 1117
 */
export function
map_eflg_expand(offs)
{
	let i, j, k;

	for (i = 0, k = 0; i < 0x10; i++) {
		j = map_eflg_c[offs + i++];
		while (j--) map.eflg[k++] = map_eflg_c[offs + i];
	}
}


/*
 * Chain (sub)maps
 *
 * ASM 0c08
 * return: TRUE/next submap OK, FALSE/map finished
 */
export function
map_chain()
{
  let c, t;

  game.chsm = 0;
  e_sbonus.counting = false;

  /* find connection */
  c = map_submaps[game.submap].connect;
  t = 3;
/*
  IFDEBUG_MAPS(
    sys_printf("xrick/maps: chain submap=%#04x frow=%#04x .connect=%#04x %s\n",
	       game_submap, map_frow, c,
	       (game_dir == LEFT ? "-> left" : "-> right"));
  );
*/
  /*
   * look for the first connector with compatible row number. if none
   * found, then panic
   */
  for (c = map_submaps[game.submap].connect; ; c++) {
    if (map_connect[c].dir === 0xff)
      sys_panic("(map_chain) can not find connector\n");
    if (map_connect[c].dir != game.dir) continue;
    t = (ent.ents[1].y >> 3) + map.frow - map_connect[c].rowout;
    if (t < 3) break;
  }

  /* got it */
/*  IFDEBUG_MAPS(
    sys_printf("xrick/maps: chain frow=%#04x y=%#06x\n",
	       map_frow, ent_ents[1].y);
    sys_printf("xrick/maps: chain connect=%#04x rowout=%#04x - ",
	       c, map_connect[c].rowout);
    );
*/
  if (map_connect[c].submap === 0xff) {
    /* no next submap - request next map */
/*    IFDEBUG_MAPS(
      sys_printf("chain to next map\n");
      );*/
    return false;
  }
  else  {
    /* next submap */
/*    IFDEBUG_MAPS(
      sys_printf("chain to submap=%#04x rowin=%#04x\n",
		 map_connect[c].submap, map_connect[c].rowin);
      );*/
		map.frow = _U8(map.frow - map_connect[c].rowout + map_connect[c].rowin);
    game.submap = map_connect[c].submap;
/*    IFDEBUG_MAPS(
      sys_printf("xrick/maps: chain frow=%#04x\n",
		 map_frow);
      );*/
    return true;
  }
}


/*
 * Reset all marks, i.e. make them all active again.
 *
 * ASM 0025
 *
 */
export function
map_resetMarks()
{
	let i;
	for (i = 0; i < MAP_NBR_MARKS; i++)
		map_marks[i].ent &= ~MAP_MARK_NACT;
}


/* eof */
