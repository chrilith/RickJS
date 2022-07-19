var MAP_NBR_MAPS = 0x05,
	MAP_NBR_SUBMAPS = 0x2F,
	MAP_NBR_CONNECT = 0x99,
	MAP_NBR_BNUMS = 0x1FD8,
	MAP_NBR_BLOCKS = 0x0100,
	MAP_NBR_MARKS = 0x020B,
	MAP_NBR_EFLGC = 0x0020,

/*
 * map row definitions, for three zones : hidden top, screen, hidden bottom
 * the three zones compose map_map, which contains the definition of the
 * current portion of the submap.
 */
	MAP_ROW_HTTOP = 0x00,
	MAP_ROW_HTBOT = 0x07,
	MAP_ROW_SCRTOP = 0x08,
	MAP_ROW_SCRBOT = 0x1F,
	MAP_ROW_HBTOP = 0x20,
	MAP_ROW_HBBOT = 0x27,

/*
 * flags for map_marks[].ent ("yes" when set)
 *
 * MAP_MARK_NACT: this mark is not active anymore.
 */
	MAP_MARK_NACT = (0x80),

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
	MAP_EFLG_VERT = (0x80),
	MAP_EFLG_SOLID = (0x40),
	MAP_EFLG_SPAD = (0x20),
	MAP_EFLG_WAYUP = (0x10),
	MAP_EFLG_FGND = (0x08),
	MAP_EFLG_LETHAL = (0x04),
	MAP_EFLG_CLIMB = (0x02),
	MAP_EFLG_01 = (0x01);

(function() {
	/*
	 * global vars
	 */
	World.map = [];	// [0x2C][0x20];
	World.eflg = [];	// [0x100];
	World.frow = 0;
	World.tilesBank = 0;

	for (var n = 0; n < 0x2C; n++) {
		World.map[n] = [];
		for (var m = 0; m < 0x20; m++) {
			World.map[n][m] = 0;
		}
	}

	/*
	 * Fill in map_map with tile numbers by expanding blocks.
	 *
	 * add map_submaps[].bnum to map_frow to find out where to start from.
	 * We need to /4 map_frow to convert from tile rows to block rows, then
	 * we need to *8 to convert from block rows to block numbers (there
	 * are 8 blocks per block row). This is achieved by *2 then &0xfff8.
	 */
	World.expand = function() {
		var i, j, k, l;
		var row = 0, col = 0;
		var pbnum = 0;

		pbnum = World.submaps[Game.submap].bnum + ((2 * World.frow) & 0xfff8);
		row = col = 0;

		for (i = 0; i < 0x0b; i++) {  /* 0x0b rows of blocks */
			for (j = 0; j < 0x08; j++) {  /* 0x08 blocks per row */
				for (k = 0, l = 0; k < 0x04; k++) {  /* expand one block */
					World.map[row][col++] = World.blocks[World.bnums[pbnum]][l++];
					World.map[row][col++] = World.blocks[World.bnums[pbnum]][l++];
					World.map[row][col++] = World.blocks[World.bnums[pbnum]][l++];
					World.map[row][col]   = World.blocks[World.bnums[pbnum]][l++];
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
	World.init = function() {
		/*sys_printf("xrick/map_init: map=%#04x submap=%#04x\n", g_map, game_submap);*/
		World.tilesBank = (World.submaps[Game.submap].page == 1) ? 2 : 1;

		World.eflg_expand((World.submaps[Game.submap].page == 1) ? 0x10 : 0x00);
		World.expand();
		Ent.reset();
		Ent.actvis(World.frow + MAP_ROW_SCRTOP, World.frow + MAP_ROW_SCRBOT);
		Ent.actvis(World.frow + MAP_ROW_HTTOP, World.frow + MAP_ROW_HTBOT);
		Ent.actvis(World.frow + MAP_ROW_HBTOP, World.frow + MAP_ROW_HBBOT);
	}

	/*
	 * Expand entity flags for this map
	 *
	 * ASM 1117
	 */
	World.eflg_expand = function(offs) {
		var i, j, k;

		for (i = 0, k = 0; i < 0x10; i++) {
			j = World.eflg_c[offs + i++];
			while (j--) World.eflg[k++] = World.eflg_c[offs + i];
		}
	}

	/*
	 * Chain (sub)maps
	 *
	 * ASM 0c08
	 * return: TRUE/next submap OK, FALSE/map finished
	 */
	World.chain = function() {
		var c, t;

		Game.chsm = 0;
		ESbonus.counting = false;

		/* find connection */
		c = World.submaps[Game.submap].connect;
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
		for (c = World.submaps[Game.submap].connect; ; c++) {
			if (World.connect[c].dir == 0xff) {
				sys_panic("(map_chain) can not find connector\n");
			}
			if (World.connect[c].dir != Game.dir) { continue; }
			t = (Ent.ents[1].y >> 3) + World.frow - World.connect[c].rowout;
			if (t < 3) { break; }
		}

		/* got it */
	/*	IFDEBUG_MAPS(
		  sys_printf("xrick/maps: chain frow=%#04x y=%#06x\n",
				 map_frow, ent_ents[1].y);
		  sys_printf("xrick/maps: chain connect=%#04x rowout=%#04x - ",
				 c, map_connect[c].rowout);
		  );
	*/

		if (World.connect[c].submap == 0xff) {
			/* no next submap - request next map */
	/*		IFDEBUG_MAPS(
			  sys_printf("chain to next map\n");
			  );*/
			return false;

		} else {
		/* next submap */
	/*	IFDEBUG_MAPS(
		  sys_printf("chain to submap=%#04x rowin=%#04x\n",
			 map_connect[c].submap, map_connect[c].rowin);
		  );*/
		World.frow = World.frow - World.connect[c].rowout + World.connect[c].rowin;
		Game.submap = World.connect[c].submap;
	/*	IFDEBUG_MAPS(
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
	World.resetMarks = function() {
		var i;

		for (i = 0; i < MAP_NBR_MARKS; i++) {
			World.marks[i].ent &= ~MAP_MARK_NACT;
		}
	}

/* EOF */
})();
