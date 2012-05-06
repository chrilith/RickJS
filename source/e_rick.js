/* const
 ********/
var E_RICK_STSTOP = 0x01,
	E_RICK_STSHOOT = 0x02,
	E_RICK_STCLIMB = 0x04,
	E_RICK_STJUMP = 0x08,
	E_RICK_STZOMBIE = 0x10,
	E_RICK_STDEAD = 0x20,
	E_RICK_STCRAWL = 0x40,

	E_RICK_NO = 1,
	E_RICK_ENT;	// defined later

function E_RICK_STSET(X) { ERick.state |= (X); }
function E_RICK_STTST(X) { return (ERick.state & (X)); }
function E_RICK_STRST(X) { ERick.state &= ~(X); }

(function() {

	/*
	 * public vars
	 */
	ERick.stop_x = 0;
	ERick.stop_y = 0;
	ERick.state = 0;

	/*
	 * local vars
	 */
	var scrawl,	
		trigger = false,
		offsx,
		ylow,
		offsy,
		seq = 0,	// must be set
		save_crawl,
		save_x, save_y;

	/*
	 * Box test
	 *
	 * ASM 113E (based on)
	 *
	 * e: entity to test against (corresponds to SI in asm code -- here DI
	 *    is assumed to point to rick).
	 * ret: TRUE/intersect, FALSE/not.
	 */
	ERick.boxtest = function(e) {
		/*
		 * rick: x+0x05 to x+0x11, y+[0x08 if rick's crawling] to y+0x14
		 * entity: x to x+w, y to y+h
		 */
	
		if (E_RICK_ENT.x + 0x11 < Ent.ents[e].x ||
			E_RICK_ENT.x + 0x05 > Ent.ents[e].x + Ent.ents[e].w ||
			E_RICK_ENT.y + 0x14 < Ent.ents[e].y ||
			E_RICK_ENT.y + (E_RICK_STTST(E_RICK_STCRAWL) ? 0x08 : 0x00) > Ent.ents[e].y + Ent.ents[e].h - 1) {
			return false;
		} else {
			return true;
		}
	}

	/*
	 * Go zombie
	 *
	 * ASM 1851
	 */
	ERick.gozombie = function() {
		/* already zombie? */
		if (E_RICK_STTST(E_RICK_STZOMBIE)) { return; }
	
		E_RICK_STSET(E_RICK_STZOMBIE);
		offsy = -0x0400;
		offsx = (E_RICK_ENT.x > 0x80 ? -3 : +3);
		ylow = 0;
		E_RICK_ENT.front = true;
	}
	
	/*
	 * Action sub-function for e_rick when zombie
	 *
	 * ASM 17DC
	 */
	ERick.z_action = function() {
		var i;
	
		/* sprite */
		E_RICK_ENT.sprite = (E_RICK_ENT.x & 0x04) ? 0x1A : 0x19;
	
		/* x */
		E_RICK_ENT.x += offsx;

		/* y */
		i = (E_RICK_ENT.y << 8) + offsy + ylow;
		E_RICK_ENT.y = i >> 8;
		offsy += 0x80;
		ylow = i % 256;	// type = U8
	
		/* dead when out of screen */
		if (E_RICK_ENT.y < 0 || E_RICK_ENT.y > 0x0140) {
			E_RICK_STSET(E_RICK_STDEAD);
		}
	}
	
	/*
	 * Action sub-function for e_rick.
	 *
	 * ASM 13BE
	 */
	ERick.action2 = function() {
		var env0, env1;
		var x, y;
		var i, tmp;
	
		E_RICK_STRST(E_RICK_STSTOP|E_RICK_STSHOOT);
	
		/* if zombie, run dedicated function and return */
		if (E_RICK_STTST(E_RICK_STZOMBIE)) {
			ERick.z_action();
			return;
		}
	
		/* climbing? */
		if (E_RICK_STTST(E_RICK_STCLIMB)) {
			goto_climbing();
			return;
		}
	
		/*
		* NOT CLIMBING
		*/
		E_RICK_STRST(E_RICK_STJUMP);
	
		/* calc y */
		i = (E_RICK_ENT.y << 8) + offsy + ylow;
		y = i >> 8;
	
		/* test environment */
		tmp = U.envtest(E_RICK_ENT.x, y, E_RICK_STTST(E_RICK_STCRAWL), env0, env1);
		env0 = tmp.rc0;
		env1 = tmp.rc1;
	
		/* stand up, if possible */
		if (E_RICK_STTST(E_RICK_STCRAWL) && !env0) {
			E_RICK_STRST(E_RICK_STCRAWL);
		}
	
		/* can move vertically? */
		if (env1 & (offsy < 0 ?
						MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD :
						MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP)) {
			goto_vert_not();
			return;
		}
	
		/*
		* VERTICAL MOVE
		*/
		E_RICK_STSET(E_RICK_STJUMP);
	
		/* killed? */
		if (env1 & MAP_EFLG_LETHAL) {
			ERick.gozombie();
			return;
		}
	
		/* save */
		E_RICK_ENT.y = y;
		ylow = i % 256;	// type = U8
	
		/* climb? */
		if ((env1 & MAP_EFLG_CLIMB) &&
				(Control.status & (CONTROL_UP|CONTROL_DOWN))) {
			offsy = 0x0100;
			E_RICK_STSET(E_RICK_STCLIMB);
			return;
		}
	
		/* fall */
		offsy += 0x0080;
		if (offsy > 0x0800) {
			offsy = 0x0800;
			ylow = 0;
		}
	
		/*
		* HORIZONTAL MOVE
		*/
		goto_horiz();
		function goto_horiz() {
			/* should move? */
			if (!(Control.status & (CONTROL_LEFT|CONTROL_RIGHT))) {
				seq = 2; /* no: reset seq and return */
				return;
			}
		
			if (Control.status & CONTROL_LEFT) {  /* move left */
				x = E_RICK_ENT.x - 2;
				Game.dir = LEFT;
				if (x < 0) {  /* prev submap */
					Game.chsm = true;
					E_RICK_ENT.x = 0xe2;
					return;
				}
			} else {  /* move right */
				x = E_RICK_ENT.x + 2;
				Game.dir = RIGHT;
				if (x >= 0xe8) {  /* next submap */
					Game.chsm = true;
					E_RICK_ENT.x = 0x04;
					return;
				}
			}
		
			/* still within this map: test environment */
			tmp = U.envtest(x, E_RICK_ENT.y, E_RICK_STTST(E_RICK_STCRAWL), env0, env1);
			env0 = tmp.rc0;
			env1 = tmp.rc1;
		
			/* save x-position if it is possible to move */
			if (!(env1 & (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP))) {
				E_RICK_ENT.x = x;
				if (env1 & MAP_EFLG_LETHAL) { ERick.gozombie(); }
			}		
		}
		/* end */
		return;
	
		/*
		 * NO VERTICAL MOVE
		 */
		goto_vert_not();
		function goto_vert_not() {
			if (offsy < 0) {
				/* not climbing + trying to go _up_ not possible -> hit the roof */
				E_RICK_STSET(E_RICK_STJUMP);  /* fall back to the ground */
				E_RICK_ENT.y &= 0xF8;
				offsy = 0;
				ylow = 0;
				goto_horiz();
				return;
			}
	
			/* else: not climbing + trying to go _down_ not possible -> standing */
			/* align to ground */
			E_RICK_ENT.y &= 0xF8;
			E_RICK_ENT.y |= 0x03;
			ylow = 0;
	
			/* standing on a super pad? */
			if ((env1 & MAP_EFLG_SPAD) && offsy >= 0X0200) {
				offsy = (Control.status & CONTROL_UP) ? 0xf800 : 0x00fe - offsy;
				goto_horiz();
				return;
			}
	
			offsy = 0x0100;  /* reset*/
	
			/* standing. firing ? */
			if (scrawl || !(Control.status & CONTROL_FIRE)) {
				goto_firing_not();
				return;
			}
	
			/*
			 * FIRING
			 */
			if (Control.status & (CONTROL_LEFT|CONTROL_RIGHT)) {  /* stop */
				if (Control.status & CONTROL_RIGHT) {
					Game.dir = RIGHT;
					ERick.stop_x = E_RICK_ENT.x + 0x17;
				} else {
					Game.dir = LEFT;
					ERick.stop_x = E_RICK_ENT.x;
				}
				ERick.stop_y = E_RICK_ENT.y + 0x000E;
				E_RICK_STSET(E_RICK_STSTOP);
				return;
			}
	
			if (Control.status == (CONTROL_FIRE|CONTROL_UP)) {  /* bullet */
				E_RICK_STSET(E_RICK_STSHOOT);
				/* not an automatic gun: shoot once only */
				if (trigger) {
					return;
				} else {
					trigger = true;
				}
				/* already a bullet in the air ... that's enough */
				if (E_BULLET_ENT.n) {
					return;
				}
				/* else use a bullet, if any available */
				if (!Game.bullets) {
					return;
				}
				if (!Game.cheat1) {
					Game.bullets--;
				}
				/* initialize bullet */
				EBullet.init(E_RICK_ENT.x, E_RICK_ENT.y);
				return;
			}
	
			trigger = false; /* not shooting means trigger is released */
			seq = 0; /* reset */
	
			if (Control.status == (CONTROL_FIRE|CONTROL_DOWN)) {  /* bomb */
				/* already a bomb ticking ... that's enough */
				if (E_BOMB_ENT.n) {
					return;
				}
				if (!Game.cheat1) {
					Game.bombs--;
				}
				/* else use a bomb, if any available */
				if (!Game.bombs) {
					return;
				}
				
				/* initialize bomb */
				EBomb.init(E_RICK_ENT.x, E_RICK_ENT.y);
				return;
			}
		}
		return;
	
		/*
		 * NOT FIRING
		 */
		goto_firing_not();
		function goto_firing_not() {
			if (Control.status & CONTROL_UP) {  /* jump or climb */
				if (env1 & MAP_EFLG_CLIMB) {  /* climb */
					E_RICK_STSET(E_RICK_STCLIMB);
					return;
				}
				offsy = -0x0580;  /* jump */
				ylow = 0;
				goto_horiz();
				return;
			}
	
			if (Control.status & CONTROL_DOWN) {  /* crawl or climb */
				if ((env1 & MAP_EFLG_VERT) &&  /* can go down */
						!(Control.status & (CONTROL_LEFT|CONTROL_RIGHT)) &&  /* + not moving horizontaly */
						(E_RICK_ENT.x & 0x1f) < 0x0a) {  /* + aligned -> climb */
	
					E_RICK_ENT.x &= 0xf0;
					E_RICK_ENT.x |= 0x04;
					E_RICK_STSET(E_RICK_STCLIMB);
				} else {  /* crawl */
					E_RICK_STSET(E_RICK_STCRAWL);
					goto_horiz();
					return;
				}		
			}
			goto_horiz();
			return;
		}
		return;
	
		/*
		 * CLIMBING
		 */
		goto_climbing();
		function goto_climbing() {
			var tmp;
			
			/* should move? */
			if (!(Control.status & (CONTROL_UP|CONTROL_DOWN|CONTROL_LEFT|CONTROL_RIGHT))) {
				seq = 0; /* no: reset seq and return */
				return;
			}
	
			if (Control.status & (CONTROL_UP|CONTROL_DOWN)) {
				/* up-down: calc new y and test environment */
				y = E_RICK_ENT.y + ((Control.status & CONTROL_UP) ? -0x02 : 0x02);
				tmp = U.envtest(E_RICK_ENT.x, y, E_RICK_STTST(E_RICK_STCRAWL), env0, env1);
				env0 = tmp.rc0;
				env1 = tmp.rc1;

				if (env1 & (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP) &&
						!(Control.status & CONTROL_UP)) {
					/* FIXME what? */
					E_RICK_STRST(E_RICK_STCLIMB);
					return;
				}
	
				if (!(env1 & (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP)) ||
						(env1 & MAP_EFLG_WAYUP)) {
					/* ok to move, save */
					E_RICK_ENT.y = y;
					if (env1 & MAP_EFLG_LETHAL) {
						ERick.gozombie();
						return;
					}
	
					if (!(env1 & (MAP_EFLG_VERT|MAP_EFLG_CLIMB))) {
						/* reached end of climb zone */
						offsy = (Control.status & CONTROL_UP) ? -0x0300 : 0x0100;
						E_RICK_STRST(E_RICK_STCLIMB);
						return;
					}
				}
			}
	
			if (Control.status & (CONTROL_LEFT|CONTROL_RIGHT)) {
				/* left-right: calc new x and test environment */
				if (Control.status & CONTROL_LEFT) {
					x = E_RICK_ENT.x - 0x02;
					if (x < 0) {  /* (i.e. negative) prev submap */
						Game.chsm = true;
						/*6dbd = 0x00;*/
						E_RICK_ENT.x = 0xe2;
						return;
					}
				} else {
					x = E_RICK_ENT.x + 0x02;
					if (x >= 0xe8) {  /* next submap */
						Game.chsm = true;
						/*6dbd = 0x01;*/
						E_RICK_ENT.x = 0x04;
						return;
					}
				}
		
				tmp = U.envtest(x, E_RICK_ENT.y, E_RICK_STTST(E_RICK_STCRAWL), env0, env1);
				env0 = tmp.rc0;
				env1 = tmp.rc1;

				if (env1 & (MAP_EFLG_SOLID|MAP_EFLG_SPAD)) return;
				E_RICK_ENT.x = x;
				if (env1 & MAP_EFLG_LETHAL) {
					ERick.gozombie();
					return;
				}
		
				if (env1 & (MAP_EFLG_VERT|MAP_EFLG_CLIMB)) return;
				E_RICK_STRST(E_RICK_STCLIMB);
				if (Control.status & CONTROL_UP) {
					offsy = -0x0300;
				}
			}
		}
	}
	
	/*
	 * Action function for e_rick
	 *
	 * ASM 12CA
	 */
	var static_stopped = false;	// static
	ERick.action = function() {
//		static U8 stopped = FALSE; /* is this the most elegant way? */

		ERick.action2();
	
		scrawl = E_RICK_STTST(E_RICK_STCRAWL);
	
		if (E_RICK_STTST(E_RICK_STZOMBIE)) {
			return;
		}
	
		/*
		 * set sprite
		 */
	
		if (E_RICK_STTST(E_RICK_STSTOP)) {
			E_RICK_ENT.sprite = (Game.dir ? 0x17 : 0x0B);
			if (!static_stopped) {
				//syssnd_play(WAV_STICK, 1);
				static_stopped = true;
			}
			return;
		}
	
		static_stopped = false;
	
		if (E_RICK_STTST(E_RICK_STSHOOT)) {
			E_RICK_ENT.sprite = (Game.dir ? 0x16 : 0x0A);
			return;
		}
	
		if (E_RICK_STTST(E_RICK_STCLIMB)) {
			E_RICK_ENT.sprite = (((E_RICK_ENT.x ^ E_RICK_ENT.y) & 0x04) ? 0x18 : 0x0c);
			seq = (seq + 1) & 0x03;
			//if (seq == 0) syssnd_play(WAV_WALK, 1);
			return;
		}
	
		if (E_RICK_STTST(E_RICK_STCRAWL)) {
			E_RICK_ENT.sprite = (Game.dir ? 0x13 : 0x07);
			if (E_RICK_ENT.x & 0x04) E_RICK_ENT.sprite++;
			seq = (seq + 1) & 0x03;
			//if (seq == 0) syssnd_play(WAV_CRAWL, 1);
			return;
		}
	
		if (E_RICK_STTST(E_RICK_STJUMP)) {
			E_RICK_ENT.sprite = (Game.dir ? 0x15 : 0x06);
			return;
		}
	
		seq++;
	
		if (seq >= 0x14) {
			//syssnd_play(WAV_WALK, 1);
			seq = 0x04;
		} else if (seq == 0x0C) {
			//syssnd_play(WAV_WALK, 1);
		}
	
		E_RICK_ENT.sprite = (seq >> 2) + 1 + (Game.dir ? 0x0c : 0x00);
	}

	/*
	 * Save status
	 *
	 * ASM part of 0x0BBB
	 */
	ERick.save = function() {
		save_x = E_RICK_ENT.x;
		save_y = E_RICK_ENT.y;
		save_crawl = E_RICK_STTST(E_RICK_STCRAWL);
		/* FIXME
		 * save_C0 = E_RICK_ENT.b0C;
		 * plus some 6DBC stuff?
		 */
	}

	/*
	 * Restore status
	 *
	 * ASM part of 0x0BDC
	 */
	ERick.restore = function() {
		E_RICK_ENT.x = save_x;
		E_RICK_ENT.y = save_y;
		E_RICK_ENT.front = false;
		if (save_crawl) {
			E_RICK_STSET(E_RICK_STCRAWL);
		} else {
			E_RICK_STRST(E_RICK_STCRAWL);
		}
		/* FIXME
		 * E_RICK_ENT.b0C = save_C0;
		 * plus some 6DBC stuff?
		 */
	}

/* EOF */
})();
