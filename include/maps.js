import { create_struct } from "../src/c";

export const MAP_NBR_MARKS = 0x020B;

/*
 * map row definitions, for three zones : hidden top, screen, hidden bottom
 * the three zones compose map_map, which contains the definition of the
 * current portion of the submap.
 */
export const MAP_ROW_HTTOP = 0x00;
export const MAP_ROW_HTBOT = 0x07;
export const MAP_ROW_SCRTOP = 0x08;
export const MAP_ROW_SCRBOT = 0x1F;
export const MAP_ROW_HBTOP = 0x20;
export const MAP_ROW_HBBOT = 0x27;

/*
 * main maps
 */
const struct_map_t = [
	"x", "y",		/* initial position for rick */
	"row",			/* initial map_map top row within the submap */
	"submap",		/* initial submap */
	"tune"			/* map tune */
];
export function map_t(...values) {
	return create_struct(struct_map_t, values);
}

/*
 * sub maps
 */
const struct_submap_t = [
  "page",            /* tiles page */
  "bnum",            /* first block number */
  "connect",         /* first connection */
  "mark"             /* first entity mark */
];
export function submap_t(...values) {
	return create_struct(struct_submap_t, values);
}

/*
 * connections
 */
const struct_connect_t = [
  "dir",
  "rowout",
  "submap",
  "rowin"
];
export function connect_t(...values) {
	return create_struct(struct_connect_t, values);
}

/*
 * blocks - one block is 4 by 4 tiles.
 */
// typedef U8 block_t[0x10];
export function block_t(...values) {
	return values;
}

/*
 * flags for map_marks[].ent ("yes" when set)
 *
 * MAP_MARK_NACT: this mark is not active anymore.
 */
export const MAP_MARK_NACT = (0x80);

/*
 * mark structure
 */
const struct_mark_t = [
  "row",
  "ent",
  "flags",
  "xy",  /* bits XXXX XYYY (from b03) with X->x, Y->y */
  "lt"   /* bits XXXX XNNN (from b04) with X->trig_x, NNN->lat & trig_y */
];
export function mark_t(...values) {
	return create_struct(struct_mark_t, values);
}

/*
 * flags for map_eflg[map_map[row][col]]  ("yes" when set)
 *
 * MAP_EFLG_VERT: vertical move only (usually on top of _CLIMB).
 * MAP_EFLG_SOLID: solid block, can't go through.
 * MAP_EFLG_SPAD: super pad. can't go through, but sends entities to the sky.
 * MAP_EFLG_WAYUP: solid block, can't go through except when going up.
 * MAP_EFLG_FGND: foreground (hides entities).
 * MAP_EFLG_LETHAL: lethal (kill entities).
 * MAP_EFLG_CLIMB: entities can climb here.
 * MAP_EFLG_01:
 */
export const MAP_EFLG_VERT = (0x80);
export const MAP_EFLG_SOLID = (0x40);
export const MAP_EFLG_SPAD = (0x20);
export const MAP_EFLG_WAYUP = (0x10);
export const MAP_EFLG_FGND = (0x08);
export const MAP_EFLG_LETHAL = (0x04);
export const MAP_EFLG_CLIMB = (0x02);
export const MAP_EFLG_01 = (0x01);
