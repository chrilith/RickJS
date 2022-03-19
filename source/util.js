
(function() {
	
	/*
	 * Full box test.
	 *
	 * ASM 1199
	 *
	 * e: entity to test against.
	 * x,y: coordinates to test.
	 * ret: TRUE/(x,y) is within e's space, FALSE/not.
	 */
	U.fboxtest = function(e, x, y) {
		if (Ent.ents[e].x >= x ||
			Ent.ents[e].x + Ent.ents[e].w < x ||
			Ent.ents[e].y >= y ||
			Ent.ents[e].y + Ent.ents[e].h < y) {
	
			return false;
		} else {
			return true;
		}
	}

	/*
	 * Box test (then whole e2 is checked agains the center of e1).
	 *
	 * ASM 113E
	 *
	 * e1: entity to test against (corresponds to DI in asm code).
	 * e2: entity to test (corresponds to SI in asm code).
	 * ret: TRUE/intersect, FALSE/not.
	 */
	
	U.boxtest = function(e1, e2) {
		/* rick is special (may be crawling) */
		if (e1 == E_RICK_NO) {
			return ERick.boxtest(e2);
		}
	
		/*
		 * entity 1: x+0x05 to x+0x011, y to y+0x14
		 * entity 2: x to x+ .w, y to y+ .h
		 */
		if (Ent.ents[e1].x + 0x11 < Ent.ents[e2].x ||
			Ent.ents[e1].x + 0x05 > Ent.ents[e2].x + Ent.ents[e2].w ||
			Ent.ents[e1].y + 0x14 < Ent.ents[e2].y ||
			Ent.ents[e1].y > Ent.ents[e2].y + Ent.ents[e2].h - 1) {
	
			return false;
		} else {
			return true;
		}
	}
	 
	/*
	 * Compute the environment flag.
	 *
	 * ASM 0FBC if !crawl, else 103E
	 *
	 * x, y: coordinates where to compute the environment flag
	 * crawl: is rick crawling?
	 * rc0: anything CHANGED to the environment flag for crawling (6DBA)
	 * rc1: anything CHANGED to the environment flag (6DAD)
	 */
	
	U.envtest = function(x, y, crawl, rc0, rc1) {
	
		var i, xx;
		
		/* prepare for ent #0 test */
		Ent.ents[ENT_ENTSNUM].x = x;
		Ent.ents[ENT_ENTSNUM].y = y;
	
		i = 1;
		if (!crawl) i++;
		if (y & 0x0004) i++;
	
		x += 4;
		xx = x % 256; /* FIXME? */ // (U8)x
	
		x = x >> 3;  /* from pixels to tiles */
		y = y >> 3;  /* from pixels to tiles */
	
		rc0 = 0;
		rc1 = 0;
	
		if (xx & 0x07) {  /* tiles columns alignment */
		
			if (crawl) {
				rc0 |= (World.eflg[World.map[y][x]] &
					(MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP));
				rc0 |= (World.eflg[World.map[y][x + 1]] &
					(MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP));
				rc0 |= (World.eflg[World.map[y][x + 2]] &
					(MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP));
				y++;
			}
	
			do {
				rc1 |= (World.eflg[World.map[y][x]] &
					(MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_FGND|
						MAP_EFLG_LETHAL|MAP_EFLG_01));
				rc1 |= (World.eflg[World.map[y][x + 1]] &
					(MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_FGND|
						MAP_EFLG_LETHAL|MAP_EFLG_CLIMB|MAP_EFLG_01));
				rc1 |= (World.eflg[World.map[y][x + 2]] &
					(MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_FGND|
						MAP_EFLG_LETHAL|MAP_EFLG_01));
				y++;
			} while (--i > 0);
	
			rc1 |= (World.eflg[World.map[y][x]] &
				(MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP|MAP_EFLG_FGND|
				 MAP_EFLG_LETHAL|MAP_EFLG_01));
			rc1 |= (World.eflg[World.map[y][x + 1]]);
			rc1 |= (World.eflg[World.map[y][x + 2]] &
				(MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP|MAP_EFLG_FGND|
				 MAP_EFLG_LETHAL|MAP_EFLG_01));
		} else {
	
			if (crawl) {
				rc0 |= (World.eflg[World.map[y][x]] &
					(MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP));
				rc0 |= (World.eflg[World.map[y][x + 1]] &
					(MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP));
				y++;
			}
	
			do {
				rc1 |= (World.eflg[World.map[y][x]] &
					(MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_FGND|
						MAP_EFLG_LETHAL|MAP_EFLG_CLIMB|MAP_EFLG_01));
				rc1 |= (World.eflg[World.map[y][x + 1]] &
					(MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_FGND|
						MAP_EFLG_LETHAL|MAP_EFLG_CLIMB|MAP_EFLG_01));
				y++;
			} while (--i > 0);
			
			rc1 |= (World.eflg[World.map[y][x]]);
			rc1 |= (World.eflg[World.map[y][x + 1]]);
		}
	
		/*
		 * If not lethal yet, and there's an entity on slot zero, and (x,y)
		 * boxtests this entity, then raise SOLID flag. This is how we make
		 * sure that no entity can move over the entity that is on slot zero.
		 *
		 * Beware! When game_cheat2 is set, this means that a block can
		 * move over rick without killing him -- but then rick is trapped
		 * because the block is solid.
		 */
		if (!(rc1 & MAP_EFLG_LETHAL)
			&& Ent.ents[0].n
			&& U.boxtest(ENT_ENTSNUM, 0)) {
	
			rc1 |= MAP_EFLG_SOLID;
		}
		
		return { rc0: rc0, rc1: rc1 };
	}
	
	/*
	 * Check if x,y is within e trigger box.
	 *
	 * ASM 126F
	 * return: FALSE if not in box, TRUE if in box.
	 */
	U.trigbox = function(e, x, y) {
		var xmax, ymax;
		
		xmax = Ent.ents[e].trig_x + (Ent.entdata[Ent.ents[e].n & 0x7F].trig_w << 3);
		ymax = Ent.ents[e].trig_y + (Ent.entdata[Ent.ents[e].n & 0x7F].trig_h << 3);
		
		if (xmax > 0xFF) xmax = 0xFF;
		
		if (x <= Ent.ents[e].trig_x || x > xmax ||
			y <= Ent.ents[e].trig_y || y > ymax) {
			return false;
		} else {
			return true;
		}
	}

	
/* EOF */
})();
