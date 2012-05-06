/* const
 ********/
var ENT_XRICK,			// defined later

	ENT_NBR_ENTDATA = 0x4a,
	ENT_NBR_SPRSEQ = 0x88,
	ENT_NBR_MVSTEP = 0x310,

	ENT_ENTSNUM = 0x0c,

/*
 * flags for ent_ents[e].n  ("yes" when set)
 *
 * ENT_LETHAL: is entity lethal?
 */
	ENT_LETHAL = 0x80,

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
	ENT_FLG_ONCE = 0x01,
	ENT_FLG_STOPRICK = 0x02,
	ENT_FLG_LETHALR = 0x04,
	ENT_FLG_LETHALI = 0x08,
	ENT_FLG_TRIGBOMB = 0x10,
	ENT_FLG_TRIGBULLET = 0x20,
	ENT_FLG_TRIGSTOP = 0x40,
	ENT_FLG_TRIGRICK = 0x80;

(function() {
	/*
	 * global vars
	 */
	Ent.ents/*[ENT_ENTSNUM + 1]*/ = [];
	for (var n = 0; n < ENT_ENTSNUM + 1; n++) {
		Ent.ents[n] = {
			n: 0,			/* b00 */
			/*b01: 0,*/	/* b01 in ASM code but never used */
			x: 0,			/* b02 - position */
			y: 0,			/* w04 - position */
			sprite: 0,	/* b08 - sprite number */
			/*w0C: 0,*/	/* w0C in ASM code but never used */
			w: 0,			/* b0E - width */
			h: 0,			/* b10 - height */
			mark: 0,		/* w12 - number of the mark that created the entity */
			flags: 0,		/* b14 */
			trig_x: 0,	/* b16 - position of trigger box */
			trig_y: 0,	/* w18 - position of trigger box */
			xsave: 0,		/* b1C */
			ysave: 0,		/* w1E */
			sprbase: 0,	/* w20 */
			step_no_i: 0,	/* w22 */
			step_no: 0,	/* w24 */
			c1: 0,		/* b26 */
			c2: 0,		/* b28 */
			ylow: 0,		/* b2A */
			offsy: 0,		/* w2C */
			latency: 0,	/* b2E */
			prev_n: 0,	/* new */
			prev_x: 0,	/* new */
			prev_y: 0,	/* new */
			prev_s: 0,	/* new */
			front: 0,		/* new */
			trigsnd: 0,	/* new */
			
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
			get offsxx() { return this.c2; },	// e_them.c
			set offsxx(x) { this.c2 = x; }
		};
	}
	
	Ent.rects = null;
	
	ENT_XRICK = Ent.ents[1];
	E_RICK_ENT = Ent.ents[E_RICK_NO];
	E_BULLET_ENT = Ent.ents[E_BULLET_NO];
	E_BOMB_ENT = Ent.ents[E_BOMB_NO];
	
	/*
	 * Reset entities
	 *
	 * ASM 2520
	 */
	Ent.reset = function() {
		var i;
	
		E_RICK_STRST(E_RICK_STSTOP);
		EBomb.lethal = false;
		
		Ent.ents[0].n = 0;
		for (i = 2; Ent.ents[i].n != 0xff; i++) {
			Ent.ents[i].n = 0;
		}
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
	function ent_creat1(e) {
		/* look for a slot */
		for (e = 0x04; e < 0x09; e++) {
			if (Ent.ents[e].n == 0) {  /* if slot available, use it */
				Ent.ents[e].c1 = 0;
				return { returns: true, e: e };
			}
		}
		
		return { returns: false, e: e };
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
   function ent_creat2(e, m) {
	   /* make sure the entity created by this mark is not active already */
	   for (e = 0x09; e < 0x0c; e++) {
		   if (Ent.ents[e].n != 0 && Ent.ents[e].mark == m) {
			   return { returns: false, e: e };
		   }
	   }
	   
	   /* look for a slot */
	   for (e = 0x09; e < 0x0c; e++) {
		   if (Ent.ents[e].n == 0) {  /* if slot available, use it */
			   Ent.ents[e].c1 = 2;
			   return { returns: true, e: e };
		   }
	   }
	   
	   return { returns: false, e: e };
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
	Ent.actvis = function(frow, lrow) {
		var m,
			e,
			y, tmp;
	
		/*
		* go through the list and find the first mark that
		* is visible, i.e. which has a row greater than the
		* first row (marks being ordered by row number).
		*/
		for (m = Map.submaps[Game.submap].mark;
			Map.marks[m].row != 0xff && Map.marks[m].row < frow;
			m++) {};
	
		if (Map.marks[m].row == 0xff) { /* none found */
			return;
		}
	
		/*
		* go through the list and process all marks that are
		* visible, i.e. which have a row lower than the last
		* row (marks still being ordered by row number).
		*/
		for (;
			Map.marks[m].row != 0xff && Map.marks[m].row < lrow;
			m++) {
	
			/* ignore marks that are not active */
			if (Map.marks[m].ent & MAP_MARK_NACT) {
				continue;
			}
	
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
	
			if (!(Map.marks[m].flags & ENT_FLG_STOPRICK)) {
				if (Map.marks[m].ent >= 0x10) {
					/* boxes, bonuses and type 3 e_them go to slot 4-8 */
					/* (c1 set to 0 -> all type 3 e_them are sleeping) */
					tmp = ent_creat1(e); e = tmp.e;	// should be pointer => *e
					if (!tmp.returns) { continue; }
				} else {
					/* type 1 and 2 e_them go to slot 9-c */
					/* (c1 set to 2) */
					tmp = ent_creat2(e, m); e = tmp.e;	// should be pointer => *e
					if (!tmp.returns) { continue; }
				}
			} else {
				/* entities stopping rick (e.g. blocks) go to slot 0 */
				if (Ent.ents[0].n) { continue; }
				e = 0;
				Ent.ents[0].c1 = 0;
			}
		
			/*
			 * initialize the entity
			 */
			Ent.ents[e].mark = m;
			Ent.ents[e].flags = Map.marks[m].flags;
			Ent.ents[e].n = Map.marks[m].ent;
		
			/*
			 * if entity is to be already running (i.e. not asleep and waiting
			 * for some trigger to move), then use LETHALR i.e. restart flag, right
			 * from the beginning
			 */
			if (Ent.ents[e].flags & ENT_FLG_LETHALR) {
				Ent.ents[e].n |= ENT_LETHAL;
			}
		
			Ent.ents[e].x = Map.marks[m].xy & 0xf8;
		
			y = (Map.marks[m].xy & 0x07) + (Map.marks[m].row & 0xf8) - Map.frow;
			y <<= 3;
			if (!(Ent.ents[e].flags & ENT_FLG_STOPRICK)) {
				y += 3;
			}
			Ent.ents[e].y = y;

			Ent.ents[e].xsave = Ent.ents[e].x;
			Ent.ents[e].ysave = Ent.ents[e].y;
		
			/*Ent.ents[e].w0C = 0;*/  /* in ASM code but never used */
		
			Ent.ents[e].w = Ent.entdata[Map.marks[m].ent].w;
			Ent.ents[e].h = Ent.entdata[Map.marks[m].ent].h;
			Ent.ents[e].sprbase = Ent.entdata[Map.marks[m].ent].spr;
			Ent.ents[e].sprite = Ent.entdata[Map.marks[m].ent].spr % 256; // (U8)
			Ent.ents[e].step_no_i = Ent.entdata[Map.marks[m].ent].sni;
			Ent.ents[e].trigsnd = Ent.entdata[Map.marks[m].ent].snd % 256; // (U8)

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
var ENT_FLG_TRIGGERS =
		(ENT_FLG_TRIGBOMB|ENT_FLG_TRIGBULLET|ENT_FLG_TRIGSTOP|ENT_FLG_TRIGRICK);
			if ((Ent.ents[e].flags & ENT_FLG_TRIGGERS) == ENT_FLG_TRIGGERS
			&& e >= 0x09) {
				Ent.ents[e].sprbase = (Ent.entdata[Map.marks[m].ent].sni & 0x00ff) % 256; // (U8)
			}
//#undef ENT_FLG_TRIGGERS
		
			Ent.ents[e].trig_x = Map.marks[m].lt & 0xf8;
			Ent.ents[e].latency = (Map.marks[m].lt & 0x07) << 5;  /* <<5 eq *32 */
		
			Ent.ents[e].trig_y = 3 + 8 * ((Map.marks[m].row & 0xf8) - Map.frow +
									(Map.marks[m].lt & 0x07));
		
			Ent.ents[e].c2 = 0;
			Ent.ents[e].offsy = 0;
			Ent.ents[e].ylow = 0;
			Ent.ents[e].front = false;
		}
	}

	/*
	 * Add a tile-aligned rectangle containing the given rectangle (indicated
	 * by its MAP coordinates) to the list of rectangles. Clip the rectangle
	 * so it fits into the display zone.
	 */
	Ent.addrect = function(x, y, width, height) {
		var x0, y0;
		var w0, h0;
	
		/*sys_printf("rect %#04x,%#04x %#04x %#04x ", x, y, width, height);*/
		
		/* align to tiles */
		x0 = x & 0xfff8;
		y0 = y & 0xfff8;
		w0 = width;
		h0 = height;
		if (x - x0) { w0 = (w0 + (x - x0)) | 0x0007; }
		if (y - y0) { h0 = (h0 + (y - y0)) | 0x0007; }
	
		/* clip */
		var tmp = Draw.clipms(x0, y0, w0, h0);
		if (tmp.returns) {  /* do not add if fully clipped */
			/*sys_printf("-> [clipped]\n");*/
			return;
		}
		x0 = tmp.x;
		y0 = tmp.y;
		w0 = tmp.width;
		h0 = tmp.height;
	
		/*sys_printf("-> %#04x,%#04x %#04x %#04x\n", x0, y0, w0, h0);*/
	
		y0 += 8;
	
		/* get to screen */
		x0 -= DRAW_XYMAP_SCRLEFT;
		y0 -= DRAW_XYMAP_SCRTOP;
	
		/* add rectangle to the list */
		Ent.rects = Rects.create(x0, y0, w0, h0, Ent.rects);
	}
	
	/*
	 * Draw all entities onto the frame buffer.
	 *
	 * ASM 07a4
	 *
	 * NOTE This may need to be part of draw.c. Also needs better comments,
	 * NOTE and probably better rectangles management.
	 */
	Ent.draw = function() {
		var i;
		var dx, dy;
	
		Draw.tilesBank = Map.tilesBank;
	
		/* reset rectangles list */
		Rects.free(Ent.rects);
		Ent.rects = null;
	
		/*sys_printf("\n");*/
	
		/*
		 * background loop : erase all entities that were visible
		 */
		for (i = 0; Ent.ents[i].n != 0xff; i++) {
			if (Ent.ents[i].prev_n && Ent.ents[i].prev_s) {
				/* if entity was active, then erase it (redraw the map) */
				Draw.spriteBackground(Ent.ents[i].prev_x, Ent.ents[i].prev_y);
			}
		}
	
		/*
		 * foreground loop : draw all entities that are visible
		 */
		for (i = 0; Ent.ents[i].n != 0xff; i++) {
			/*
			 * If entity is active now, draw the sprite. If entity was
			 * not active before, add a rectangle for the sprite.
			 */
			if (Ent.ents[i].n && Ent.ents[i].sprite) {
				/* If entitiy is active, draw the sprite. */
				Draw.sprite2(Ent.ents[i].sprite,
					Ent.ents[i].x, Ent.ents[i].y,
					Ent.ents[i].front);
			}
		}
	
		/*
		 * rectangles loop : figure out which parts of the screen have been
		 * impacted and need to be refreshed, then save state
		 */
		for (i = 0; Ent.ents[i].n != 0xff; i++) {
			if (Ent.ents[i].prev_n && Ent.ents[i].prev_s) {
				/* (1) if entity was active and has been drawn ... */
				if (Ent.ents[i].n && Ent.ents[i].sprite) {
					/* (1.1) ... and is still active now and still needs to be drawn, */
					/*       then check if rectangles intersect */
					dx = Math.abs(Ent.ents[i].x - Ent.ents[i].prev_x);
					dy = Math.abs(Ent.ents[i].y - Ent.ents[i].prev_y);

					if (dx < 0x20 && dy < 0x16) {
						/* (1.1.1) if they do, then create one rectangle */
						Ent.addrect((Ent.ents[i].prev_x < Ent.ents[i].x)
							? Ent.ents[i].prev_x : Ent.ents[i].x,
							 (Ent.ents[i].prev_y < Ent.ents[i].y)
							? Ent.ents[i].prev_y : Ent.ents[i].y,
							dx + 0x20, dy + 0x15);
					} else {
						/* (1.1.2) else, create two rectangles */
						Ent.addrect(Ent.ents[i].x, Ent.ents[i].y, 0x20, 0x15);
						Ent.addrect(Ent.ents[i].prev_x, Ent.ents[i].prev_y, 0x20, 0x15);
					}
				} else {
					/* (1.2) ... and is not active anymore or does not need to be drawn */
					/*       then create one single rectangle */
					Ent.addrect(Ent.ents[i].prev_x, Ent.ents[i].prev_y, 0x20, 0x15);
				}
			} else if (Ent.ents[i].n && Ent.ents[i].sprite) {
				/* (2) if entity is active and needs to be drawn, */
				/*     then create one rectangle */
				Ent.addrect(Ent.ents[i].x, Ent.ents[i].y, 0x20, 0x15);
			}

			/* save state */
			Ent.ents[i].prev_x = Ent.ents[i].x;
			Ent.ents[i].prev_y = Ent.ents[i].y;
			Ent.ents[i].prev_n = Ent.ents[i].n;
			Ent.ents[i].prev_s = Ent.ents[i].sprite;
		}
	}
	
	/*
	 * Clear entities previous state
	 *
	 */
	Ent.clprev = function() {
		var i;
		
		for (i = 0; Ent.ents[i].n != 0xff; i++) {
			Ent.ents[i].prev_n = 0;
		}
	}

	/*
	 * Table containing entity action function pointers.
	 */
	Ent.actf = [
		null,        /* 00 - zero means that the slot is free */
		ERick.action,   /* 01 - 12CA */
		EBullet.action,  /* 02 - 1883 */
		EBomb.action,  /* 03 - 18CA */
		EThem.t1a_action,  /* 04 - 2452 */
		EThem.t1b_action,  /* 05 - 21CA */
		EThem.t2_action,  /* 06 - 2718 */
		EThem.t1a_action,  /* 07 - 2452 */
		EThem.t1b_action,  /* 08 - 21CA */
		EThem.t2_action,  /* 09 - 2718 */
		EThem.t1a_action,  /* 0A - 2452 */
		EThem.t1b_action,  /* 0B - 21CA */
		EThem.t2_action,  /* 0C - 2718 */
		EThem.t1a_action,  /* 0D - 2452 */
		EThem.t1b_action,  /* 0E - 21CA */
		EThem.t2_action,  /* 0F - 2718 */
		EBox.action,  /* 10 - 245A */
		EBox.action,  /* 11 - 245A */
		EBonus.action,  /* 12 - 242C */
		EBonus.action,  /* 13 - 242C */
		EBonus.action,  /* 14 - 242C */
		EBonus.action,  /* 15 - 242C */
		ESbonus.start,  /* 16 - 2182 */
		ESbonus.stop  /* 17 - 2143 */
	];
	
	/*
	 * Run entities action function
	 *
	 */
	Ent.action = function() {
		var i, k;
	
	/*
	  IFDEBUG_ENTS(
		sys_printf("xrick/ents: --------- action ----------------\n");
		for (i = 0; ent_ents[i].n != 0xff; i++)
		  if (ent_ents[i].n) {
		sys_printf("xrick/ents: slot %#04x, entity %#04x", i, ent_ents[i].n);
		sys_printf(" (%#06x, %#06x), sprite %#04x.\n",
			   ent_ents[i].x, ent_ents[i].y, ent_ents[i].sprite);
		  }
		);
	*/
		for (i = 0; Ent.ents[i].n != 0xff; i++) {
			if (Ent.ents[i].n) {
				k = Ent.ents[i].n & 0x7f;
				if (k == 0x47) {
					EThem.z_action(i);
				} else if (k >= 0x18) {
					EThem.t3_action(i);
				} else {
if (!Ent.actf[k])
	console.log("Ent.actf", k, Ent.actf[k]);

					Ent.actf[k](i);
				}
			}
		}
	}

/* EOF */
})();
