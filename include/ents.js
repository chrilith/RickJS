/*
 * RickJS, a JavaScript port of XRick
 *
 * This source file is based on the folliwing files:
 * - xrick/include/ents.h
 *
 * Copyright (C) 1998-2002 BigOrno (bigorno@bigorno.net). All rights reserved.
 * Copyright (C) 2012-2022 Chrilith (me@chrilith.com). All rights reserved.
 *
 * The use and distribution terms for this software are contained in the file
 * named README, which can be found in the root of this distribution. By
 * using this software in any fashion, you are agreeing to be bound by the
 * terms of this license.
 *
 * You must not remove this notice, or any other, from this software.
 */

import { create_struct } from "../src/c";

export function ENT_XRICK() { return ent.ents[1]; }

export const ENT_ENTSNUM = 0x0c;

/*
 * flags for ent_ents[e].n  ("yes" when set)
 *
 * ENT_LETHAL: is entity lethal?
 */
export const ENT_LETHAL = 0x80;

/*
 * flags for ent_ents[e].flag  ("yes" when set)
 *
 * ENT_FLG_ONCE: should the entity run once only?
 * ENT_FLG_STOPRICK: does the entity stops rick (and goes to slot zero)?
 * ENT_FLG_LETHALR: is entity lethal when restarting?
 * ENT_FLG_LETHALI: is entity initially lethal?
 * ENT_FLG_TRIGBOMB: can entity be triggered by a bomb?
 * ENT_FLG_TRIGBULLET: can entity be triggered by a bullet?
 * ENT_FLG_TRIGSTOP: can entity be triggered by rick stop?
 * ENT_FLG_TRIGRICK: can entity be triggered by rick?
 */
export const ENT_FLG_ONCE = 0x01;
export const ENT_FLG_STOPRICK = 0x02;
export const ENT_FLG_LETHALR = 0x04;
export const ENT_FLG_LETHALI = 0x08;
export const ENT_FLG_TRIGBOMB = 0x10;
export const ENT_FLG_TRIGBULLET = 0x20;
export const ENT_FLG_TRIGSTOP = 0x40;
export const ENT_FLG_TRIGRICK = 0x80;

const struct_ent_t = [
  "n",          /* b00 */
  /*U8 b01;*/   /* b01 in ASM code but never used */
  "x",          /* b02 - position */
  "y",          /* w04 - position */
  "sprite",     /* b08 - sprite number */
  /*U16 w0C;*/  /* w0C in ASM code but never used */
  "w",          /* b0E - width */
  "h",          /* b10 - height */
  "mark",       /* w12 - number of the mark that created the entity */
  "flags",      /* b14 */
  "trig_x",     /* b16 - position of trigger box */
  "trig_y",     /* w18 - position of trigger box */
  "xsave",      /* b1C */
  "ysave",      /* w1E */
  "sprbase",    /* w20 */
  "step_no_i",  /* w22 */
  "step_no",    /* w24 */
  "c1",         /* b26 */
  "c2",         /* b28 */
	"ylow",       /* b2A */
  "offsy",      /* w2C */
  "latency",    /* b2E */
  "prev_n",     /* new */
  "prev_x",     /* new */
  "prev_y",     /* new */
  "prev_s",     /* new */
  "front",      /* new */
  "trigsnd"     /* new */
];
export function ent_t(...values) {
	const base = {
		get seq() { return this.c1; },	// e_bonus.c
		set seq(x) { this.c1 = x; },
		get cnt() { return this.c1; },	// e_box.c
		set cnt(x) { this.c1 = x; },
		get flgclmb() { return this.c1; },	// e_them.c
		set flgclmb(x) { this.c1 = x; },
		get offsx() { return this.c1; },	// e_them.c
		set offsx(x) { this.c1 = x; },
		get sproffs() { return this.c1; },	// e_them.c
		set sproffs(x) { this.c1 = x; },
		get step_count() { return this.c2; },	// e_them.c
		set step_count(x) { this.c2 = x; },
		get offsx2() { return this.c2; },	// e_them.c
		set offsx2(x) { this.c2 = x; }
	};
	return create_struct(struct_ent_t, values, base);
}
export function ent_t_array(size) {
	const values = Array(struct_ent_t.length).fill(0);
	const result = Array(size)
	for (let i = 0; i < size; i++) {
		result[i] = ent_t(...values);
	}
	return result;
}


const struct_entdata_t = [
	"w", "h",
	"spr", "sni",
	"trig_w", "trig_h",
	"snd"
];
export function entdata_t(...values) {
	return create_struct(struct_entdata_t, values);
}

const struct_mvstep_t	= [
	"count",
	"dx", "dy"
];
export function mvstep_t(...values) {
	return create_struct(struct_mvstep_t, values);
}

export const ent = {
	ents: ent_t_array(ENT_ENTSNUM + 1),
	rects: null
};
