/* const
 ********/
var TYPE_1A = (0x00),
	TYPE_1B = (0xff);

(function() {
	/*
	 * public vars
	 */
	EThem.rndseed = 0;


	/*
	 * local vars
	 */
	var e_them_rndnbr = 0;

	/*
	 * Check if entity boxtests with a lethal e_them i.e. something lethal
	 * in slot 0 and 4 to 8.
	 *
	 * ASM 122E
	 *
	 * e: entity slot number.
	 * ret: TRUE/boxtests, FALSE/not
	 */
	U.themtest = function(e) {
	  var i;

		if ((Ent.ents[0].n & ENT_LETHAL) && U.boxtest(e, 0)) {
			return true;
		}

		for (i = 4; i < 9; i++) {
			if ((Ent.ents[i].n & ENT_LETHAL) && U.boxtest(e, i)) {
				return true;
			}
		}

		return false;
	}

	/*
	 * Go zombie
	 *
	 * ASM 237B
	 */

	EThem.gozombie = function(e) {
	//#define offsx c1
		Ent.ents[e].n = 0x47;  /* zombie entity */
		Ent.ents[e].front = true;
		Ent.ents[e].offsy = -0x0400;	// CHECKME: should be like Rick?
		Syssnd.play("WAV_DIE", 1);

		Game.score += 50;
		if (Ent.ents[e].flags & ENT_FLG_ONCE) {
			/* make sure entity won't be activated again */
			World.marks[Ent.ents[e].mark].ent |= MAP_MARK_NACT;
		}
		Ent.ents[e].offsx = (Ent.ents[e].x >= 0x80 ? -0x02 : 0x02);
	//#undef offsx
	}

	/*
	 * Action sub-function for e_them _t1a and _t1b
	 *
	 * Those two types move horizontally, and fall if they have to.
	 * Type 1a moves horizontally over a given distance and then
	 * u-turns and repeats; type 1b is more subtle as it does u-turns
	 * in order to move horizontally towards rick.
	 *
	 * ASM 2242
	 */
	EThem.t1_action2 = function(e, type) {
	//#define offsx c1
	//#define step_count c2
		var i;
		var x, y;
		var env0, env1, tmp;
		/* by default, try vertical move. calculate new y */
		i = (Ent.ents[e].y << 8) + Ent.ents[e].offsy + Ent.ents[e].ylow;
		y = i >> 8;

		/* deactivate if outside vertical boundaries */
		/* no need to test zero since e_them _t1a/b don't go up */
		/* FIXME what if they got scrolled out ? */
		if (y > 0x140) {
			Ent.ents[e].n = 0;
			return;
		}

		/* test environment */
		tmp = U.envtest(Ent.ents[e].x, y, false, env0, env1);
		env0 = tmp.rc0;
		env1 = tmp.rc1;

		if (!(env1 & (MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP))) {
			/* vertical move possible: falling */
			if (env1 & MAP_EFLG_LETHAL) {
				/* lethal entities kill e_them */
				EThem.gozombie(e);
				return;
			}
			/* save, cleanup and return */
			Ent.ents[e].y = y;
			Ent.ents[e].ylow = i  & 0xff; //(U8)
			Ent.ents[e].offsy += 0x0080;
			if (Ent.ents[e].offsy > 0x0800) {
				Ent.ents[e].offsy = 0x0800;
			}
			return;
		}

		/* vertical move not possible. calculate new sprite */
		Ent.ents[e].sprite = Ent.ents[e].sprbase
			+ Ent.sprseq[(Ent.ents[e].x & 0x1c) >> 3]
			+ (Ent.ents[e].offsx < 0 ? 0x03 : 0x00);

		/* reset offsy */
		Ent.ents[e].offsy = 0x0080;

		/* align to ground */
		Ent.ents[e].y &= 0xfff8;
		Ent.ents[e].y |= 0x0003;

		/* latency: if not zero then decrease and return */
		if (Ent.ents[e].latency > 0) {
			Ent.ents[e].latency--;
			return;
		}

		/* horizontal move. calculate new x */
		if (Ent.ents[e].offsx == 0) {  /* not supposed to move -> don't */
			return;
		}

		x = Ent.ents[e].x + Ent.ents[e].offsx;
		if (Ent.ents[e].x < 0 || Ent.ents[e].x > 0xe8) {
			/*  U-turn and return if reaching horizontal boundaries */
			Ent.ents[e].step_count = 0;
			Ent.ents[e].offsx = -Ent.ents[e].offsx;
			return;
		}

		/* test environment */
		tmp = U.envtest(x, Ent.ents[e].y, false, env0, env1);
		env0 = tmp.rc0;
		env1 = tmp.rc1;

		if (env1 & (MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP)) {
			/* horizontal move not possible: u-turn and return */
			Ent.ents[e].step_count = 0;
			Ent.ents[e].offsx = -Ent.ents[e].offsx;
			return;
		}

		/* horizontal move possible */
		if (env1 & MAP_EFLG_LETHAL) {
			/* lethal entities kill e_them */
			EThem.gozombie(e);
			return;
		}

		/* save */
		Ent.ents[e].x = x;

		/* depending on type, */
		if (type == TYPE_1B) {
			/* set direction to move horizontally towards rick */
			if ((Ent.ents[e].x & 0x1e) != 0x10) { /* prevents too frequent u-turns */
				return;
			}
			Ent.ents[e].offsx = (Ent.ents[e].x < E_RICK_ENT.x) ? 0x02 : -0x02;
			return;
		} else {
			/* set direction according to step counter */
			Ent.ents[e].step_count++;
			/* FIXME why trig_x (b16) ?? */
			if ((Ent.ents[e].trig_x >> 1) > Ent.ents[e].step_count) {
				return;
			}
		}

		/* type is 1A and step counter reached its limit: u-turn */
		Ent.ents[e].step_count = 0;
		Ent.ents[e].offsx = -Ent.ents[e].offsx;
	//#undef offsx
	//#undef step_count
	}

	/*
	 * ASM 21CF
	 */
	EThem.t1_action = function(e, type) {
		EThem.t1_action2(e, type);

		/* lethal entities kill them */
		if (U.themtest(e)) {
			EThem.gozombie(e);
			return;
		}

		/* bullet kills them */
		if (E_BULLET_ENT.n &&
				U.fboxtest(e, E_BULLET_ENT.x + (EBullet.offsx < 0 ? 0 : 0x18),
				E_BULLET_ENT.y)) {

			E_BULLET_ENT.n = 0;
			EThem.gozombie(e);
			return;
		}

		/* bomb kills them */
		if (EBomb.lethal && EBomb.hit(e)) {
			EThem.gozombie(e);
			return;
		}

		/* rick stops them */
		if (E_RICK_STTST(E_RICK_STSTOP) &&
				U.fboxtest(e, ERick.stop_x, ERick.stop_y)) {
			Ent.ents[e].latency = 0x14;
		}

		/* they kill rick */
		if (ERick.boxtest(e)) {
			ERick.gozombie();
		}
	}

	/*
	 * Action function for e_them _t1a type (stays within boundaries)
	 *
	 * ASM 2452
	 */
	EThem.t1a_action = function(e) {
		EThem.t1_action(e, TYPE_1A);
	}


	/*
	 * Action function for e_them _t1b type (runs for rick)
	 *
	 * ASM 21CA
	 */
	EThem.t1b_action = function(e) {
		EThem.t1_action(e, TYPE_1B);
	}

	/*
	 * Action function for e_them _z (zombie) type
	 *
	 * ASM 23B8
	 */
	EThem.z_action = function(e) {
	//#define offsx c1
		var i;

		/* calc new sprite */
		Ent.ents[e].sprite = Ent.ents[e].sprbase
			+ ((Ent.ents[e].x & 0x04) ? 0x07 : 0x06);

		/* calc new y */
		i = (Ent.ents[e].y << 8) + Ent.ents[e].offsy + Ent.ents[e].ylow;

		/* deactivate if out of vertical boundaries */
		if (Ent.ents[e].y < 0 || Ent.ents[e].y > 0x0140) {
			Ent.ents[e].n = 0;
			return;
		}

		/* save */
		Ent.ents[e].offsy += 0x0080;
		Ent.ents[e].ylow = i & 0xff; // ylow > U8
		Ent.ents[e].y = i >> 8;

		/* calc new x */
		Ent.ents[e].x += Ent.ents[e].offsx;

		/* must stay within horizontal boundaries */
		if (Ent.ents[e].x < 0) {
			Ent.ents[e].x = 0;
		}
		if (Ent.ents[e].x > 0xe8) {
			Ent.ents[e].x = 0xe8;
		}
	//#undef offsx
	}

	/*
	 * Action sub-function for e_them _t2.
	 *
	 * Must document what it does.
	 *
	 * ASM 2792
	 */
	var static_bx,	// 	static U16 bx;
		static_cx;	// static U16 cx;
	EThem.t2_action2 = function(e) {
	//#define flgclmb c1
	//#define offsx c2 => offsxx
		var i;
		var x, y, yd;
		var env0, env1, tmp;

		/*
		 * vars required by the Black Magic (tm) performance at the
		 * end of this function.
		 */
		// bx, cx...
		// static U8 *bl = (U8 *)&bx;
		// static U8 *bh = (U8 *)&bx + 1;
		// static U8 *cl = (U8 *)&cx;
		// static U8 *ch = (U8 *)&cx + 1;
		// static U16 *sl = (U16 *)&e_them_rndseed;
		// static U16 *sh = (U16 *)&e_them_rndseed + 2;

		/*sys_printf("e_them_t2 ------------------------------\n");*/

		/* latency: if not zero then decrease */
		if (Ent.ents[e].latency > 0) { Ent.ents[e].latency--; }

		/* climbing? */
		if (Ent.ents[e].flgclmb != true) {
			goto_climbing_not();
			return;
		}

		/* CLIMBING */

		/*sys_printf("e_them_t2 climbing\n");*/

		/* latency: if not zero then return */
		if (Ent.ents[e].latency > 0) { return; }

		/* calc new sprite */
		Ent.ents[e].sprite = Ent.ents[e].sprbase + 0x08 +
			(((Ent.ents[e].x ^ Ent.ents[e].y) & 0x04) ? 1 : 0);

		/* reached rick's level? */
		if ((Ent.ents[e].y & 0xfe) != (E_RICK_ENT.y & 0xfe)) {
			goto_ymove();
			return;
		}

		goto_xmove();
		function goto_xmove() {
			/* calc new x and test environment */
			Ent.ents[e].offsxx = (Ent.ents[e].x < E_RICK_ENT.x) ? 0x02 : -0x02;
			x = Ent.ents[e].x + Ent.ents[e].offsxx;
			tmp = U.envtest(x, Ent.ents[e].y, false, env0, env1);
			env0 = tmp.rc0;
			env1 = tmp.rc1;

			if (env1 & (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP)) {
				return;
			}
			if (env1 & MAP_EFLG_LETHAL) {
				e_them_gozombie(e);
				return;
			}

			Ent.ents[e].x = x;
			if (env1 & (MAP_EFLG_VERT|MAP_EFLG_CLIMB)) { /* still climbing */
				return;
			}
			goto_climbing_not();  /* not climbing anymore */
		}

		function goto_ymove() {
			/* calc new y and test environment */
			yd = Ent.ents[e].y < E_RICK_ENT.y ? 0x02 : -0x02;
			y = Ent.ents[e].y + yd;
			if (y < 0 || y > 0x0140) {
				Ent.ents[e].n = 0;
				return;
			}
			tmp = U.envtest(Ent.ents[e].x, y, false, env0, env1);
			env0 = tmp.rc0;
			env1 = tmp.rc1;
			if (env1 & (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP)) {
				if (yd < 0) {
					goto_xmove();  /* can't go up */
					return;
				} else {
					goto_climbing_not();  /* can't go down */
					return;
				}
			}
			/* can move */
			Ent.ents[e].y = y;
			if (env1 & (MAP_EFLG_VERT|MAP_EFLG_CLIMB)) { /* still climbing */
				return;
			}
			goto_climbing_not();
		}

		/* NOT CLIMBING */

		function goto_climbing_not() {
			/*sys_printf("e_them_t2 climbing NOT\n");*/

			Ent.ents[e].flgclmb = false;  /* not climbing */

			/* calc new y (falling) and test environment */
			i = (Ent.ents[e].y << 8) + Ent.ents[e].offsy + Ent.ents[e].ylow;
			y = i >> 8;
			tmp = U.envtest(Ent.ents[e].x, y, false, env0, env1);
			env0 = tmp.rc0;
			env1 = tmp.rc1;

			if (!(env1 & (MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP))) {
				/*sys_printf("e_them_t2 y move OK\n");*/
				/* can go there */
				if (env1 & MAP_EFLG_LETHAL) {
					EThem.gozombie(e);
					return;
				}
				if (y > 0x0140) {  /* deactivate if outside */
					Ent.ents[e].n = 0;
					return;
				}
				if (!(env1 & MAP_EFLG_VERT)) {
					/* save */
					Ent.ents[e].y = y;
					Ent.ents[e].ylow = i  & 0xff; // U8
					Ent.ents[e].offsy += 0x0080;
					if (Ent.ents[e].offsy > 0x0800) {
						Ent.ents[e].offsy = 0x0800;
					}
					return;
				}
				if (((Ent.ents[e].x & 0x07) == 0x04) && (y < E_RICK_ENT.y)) {
					/*sys_printf("e_them_t2 climbing00\n");*/
					Ent.ents[e].flgclmb = true;  /* climbing */
					return;
				}
			}

			/*sys_printf("e_them_t2 ymove nok or ...\n");*/
			/* can't go there, or ... */
			Ent.ents[e].y = (Ent.ents[e].y & 0xf8) | 0x03;  /* align to ground */
			Ent.ents[e].offsy = 0x0100;
			if (Ent.ents[e].latency != 0) {
				return;
			}

			if ((env1 & MAP_EFLG_CLIMB) &&
				((Ent.ents[e].x & 0x0e) == 0x04) &&
					(Ent.ents[e].y > E_RICK_ENT.y)) {
				/*sys_printf("e_them_t2 climbing01\n");*/
				Ent.ents[e].flgclmb = true;  /* climbing */
				return;
			}

			/* calc new sprite */
			Ent.ents[e].sprite = Ent.ents[e].sprbase +
				Ent.sprseq[(Ent.ents[e].offsxx < 0 ? 4 : 0) +
				((Ent.ents[e].x & 0x0e) >> 3)];
			/*sys_printf("e_them_t2 sprite %02x\n", ent_ents[e].sprite);*/

			/* */
			if (Ent.ents[e].offsxx == 0) {
				Ent.ents[e].offsxx = 2;
			}
			x = Ent.ents[e].x + Ent.ents[e].offsxx;
			/*sys_printf("e_them_t2 xmove x=%02x\n", x);*/
			if (x < 0xe8) {
				tmp = U.envtest(x, Ent.ents[e].y, false, env0, env1);
				env0 = tmp.rc0;
				env1 = tmp.rc1;

				if (!(env1 & (MAP_EFLG_VERT|MAP_EFLG_SOLID|MAP_EFLG_SPAD|MAP_EFLG_WAYUP))) {
					Ent.ents[e].x = x;
					if ((x & 0x1e) != 0x08) {
						return;
					}

					/*
					 * Black Magic (tm)
					 *
					 * this is obviously some sort of randomizer to define a direction
					 * for the entity. it is an exact copy of what the assembler code
					 * does but I can't explain.
					 */

					// JS adapatation...
					var sl = ((EThem.rndseed & 0xFFFF0000) >> 16),
						sh = ((EThem.rndseed & 0x0000FFFF) >> 0);
					static_bx = (e_them_rndnbr + sh + sl + 0x0d) & 0xFFFF;	// U16
					static_cx = sh;
					var bl = ((static_bx & 0xFF00) >> 8),
						bh = ((static_bx & 0x00FF) >> 0),
						cl = ((static_cx & 0xFF00) >> 8),
						ch = ((static_cx & 0x00FF) >> 0);

					bl ^= ch;
					bl ^= cl;
					bl ^= bh;
					static_bx = ((bl << 8) | (bh));
					e_them_rndnbr = static_bx;

					Ent.ents[e].offsxx = (bl & 0x01) ? -0x02 : 0x02;

					/* back to normal */
					return;
				}
			}

			/* U-turn */
			/*sys_printf("e_them_t2 u-turn\n");*/
			if (Ent.ents[e].offsxx == 0) {
				Ent.ents[e].offsxx = 2;
			} else {
				Ent.ents[e].offsxx = -Ent.ents[e].offsxx;
			}
		}
	//#undef offsx => offsxx
	}

	/*
	 * Action function for e_them _t2 type
	 *
	 * ASM 2718
	 */
	EThem.t2_action = function(e) {
		EThem.t2_action2(e);

		/* they kill rick */
		if (ERick.boxtest(e)) {
			ERick.gozombie();
		}

		/* lethal entities kill them */
		if (U.themtest(e)) {
			EThem.gozombie(e);
			return;
		}

		/* bullet kills them */
		if (E_BULLET_ENT.n &&
				U.fboxtest(e, E_BULLET_ENT.x + (EBullet.offsx < 0 ? 0 : 0x18),
				E_BULLET_ENT.y)) {
			E_BULLET_ENT.n = 0;
			EThem.gozombie(e);
			return;
		}

		/* bomb kills them */
		if (EBomb.lethal && EBomb.hit(e)) {
			EThem.gozombie(e);
			return;
		}

		/* rick stops them */
		if (E_RICK_STTST(E_RICK_STSTOP) &&
				U.fboxtest(e, ERick.stop_x, ERick.stop_y)) {
			Ent.ents[e].latency = 0x14;
		}
	}

	/*
	 * Action sub-function for e_them _t3
	 *
	 * FIXME always starts asleep??
	 *
	 * Waits until triggered by something, then execute move steps from
	 * ent_mvstep with sprite from ent_sprseq. When done, either restart
	 * or disappear.
	 *
	 * Not always lethal ... but if lethal, kills rick.
	 *
	 * ASM: 255A
	 */
	EThem.t3_action2 = function(e) {
	//#define sproffs c1
	//#define step_count c2
		var i;
		var x, y;

		while (1) {

			/* calc new sprite */
			i = Ent.sprseq[Ent.ents[e].sprbase + Ent.ents[e].sproffs];
			if (i == 0xff) {
				i = Ent.sprseq[Ent.ents[e].sprbase];
			}
			Ent.ents[e].sprite = i;

			if (Ent.ents[e].sproffs != 0) {  /* awake */

				/* rotate sprseq */
				if (Ent.sprseq[Ent.ents[e].sprbase + Ent.ents[e].sproffs] != 0xff) {
					Ent.ents[e].sproffs++;
				}
				if (Ent.sprseq[Ent.ents[e].sprbase + Ent.ents[e].sproffs] == 0xff) {
					Ent.ents[e].sproffs = 1;
				}

				if (Ent.ents[e].step_count < Ent.mvstep[Ent.ents[e].step_no].count) {
					/*
					 * still running this step: try to increment x and y while
					 * checking that they remain within boudaries. if so, return.
					 * else switch to next step.
					 */
					Ent.ents[e].step_count++;
					x = Ent.ents[e].x + Ent.mvstep[Ent.ents[e].step_no].dx;

					/* check'n save */
					if (x > 0 && x < 0xe8) {
						Ent.ents[e].x = x;
						/*FIXME*/
						/*
						y = ent_mvstep[Ent.ents[e].step_no].dy;
						if (y < 0)
							y += 0xff00;
						y += Ent.ents[e].y;
						*/
						y = Ent.ents[e].y + Ent.mvstep[Ent.ents[e].step_no].dy;
						if (y > 0 && y < 0x0140) {
							Ent.ents[e].y = y;
							return;
						}
					}
				}

				/*
				 * step is done, or x or y is outside boundaries. try to
				 * switch to next step
				 */
				Ent.ents[e].step_no++;
				if (Ent.mvstep[Ent.ents[e].step_no].count != 0xff) {
					/* there is a next step: init and loop */
					Ent.ents[e].step_count = 0;
				} else {
					/* there is no next step: restart or deactivate */
					if (!E_RICK_STTST(E_RICK_STZOMBIE) &&
						!(Ent.ents[e].flags & ENT_FLG_ONCE)) {

						/* loop this entity */
						Ent.ents[e].sproffs = 0;
						Ent.ents[e].n &= ~ENT_LETHAL;
						if (Ent.ents[e].flags & ENT_FLG_LETHALR)
						Ent.ents[e].n |= ENT_LETHAL;
						Ent.ents[e].x = Ent.ents[e].xsave;
						Ent.ents[e].y = Ent.ents[e].ysave;
						if (Ent.ents[e].y < 0 || Ent.ents[e].y > 0x140) {
							Ent.ents[e].n = 0;
							return;
						}
					} else {
						/* deactivate this entity */
						Ent.ents[e].n = 0;
						return;
					}
				}
			} else {  /* Ent.ents[e].sprseq1 == 0 -- waiting */
				/* ugly GOTOs */

				/* something triggered the entity: wake up */
				/* initialize step counter */
				function goto_wakeup() {
					if (E_RICK_STTST(E_RICK_STZOMBIE)) {
						return;
					}
					/*
					* FIXME the sound should come from a table, there are 10 of them
					* but I dont have the table yet. must rip the data off the game...
					* FIXME is it 8 of them, not 10?
					* FIXME testing below...
					*/
					Syssnd.play("WAV_ENTITY" + ((Ent.ents[e].trigsnd & 0x1F) - 0x14), 1);
					/*syssnd_play(WAV_ENTITY[0], 1);*/

					Ent.ents[e].n &= ~ENT_LETHAL;
					if (Ent.ents[e].flags & ENT_FLG_LETHALI) {
						Ent.ents[e].n |= ENT_LETHAL;
					}
					Ent.ents[e].sproffs = 1;
					Ent.ents[e].step_count = 0;
					Ent.ents[e].step_no = Ent.ents[e].step_no_i;
					return;
				}

				if (Ent.ents[e].flags & ENT_FLG_TRIGRICK) {  /* reacts to rick */
					/* wake up if triggered by rick */
					if (U.trigbox(e, E_RICK_ENT.x + 0x0C, E_RICK_ENT.y + 0x0A)) {
						goto_wakeup();
						return;
					}
				}

				if (Ent.ents[e].flags & ENT_FLG_TRIGSTOP) {  /* reacts to rick "stop" */
					/* wake up if triggered by rick "stop" */
					if (E_RICK_STTST(E_RICK_STSTOP) &&
							U.trigbox(e, ERick.stop_x, ERick.stop_y)) {
						goto_wakeup();
						return;
					}
				}

				if (Ent.ents[e].flags & ENT_FLG_TRIGBULLET) {  /* reacts to bullets */
					/* wake up if triggered by bullet */
					if (E_BULLET_ENT.n && U.trigbox(e, EBullet.xc, EBullet.yc)) {
						E_BULLET_ENT.n = 0;
						goto_wakeup();
						return;
					}
				}

				if (Ent.ents[e].flags & ENT_FLG_TRIGBOMB) {  /* reacts to bombs */
					/* wake up if triggered by bomb */
					if (EBomb.lethal && U.trigbox(e, EBomb.xc, EBomb.yc)) {
						goto_wakeup();
						return;
					}
				}
				/* not triggered: keep waiting */
				return;
			}
		}
	//#undef step_count
	}

	/*
	 * Action function for e_them _t3 type
	 *
	 * ASM 2546
	 */
	EThem.t3_action = function(e) {
		EThem.t3_action2(e);

		/* if lethal, can kill rick */
		if ((Ent.ents[e].n & ENT_LETHAL) &&
				!E_RICK_STTST(E_RICK_STZOMBIE) && ERick.boxtest(e)) {  /* CALL 1130 */
			ERick.gozombie();
		}
	}


/* EOF */
})();
