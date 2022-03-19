/* const
 ********/
var E_BULLET_NO  = 2,
	E_BULLET_ENT	// defined later;

(function() {

	/*
	 * public vars (for performance reasons)
	 */
	EBullet.offsx = 0;
	EBullet.xc = EBullet.yc = 0;
	
	/*
	 * Initialize bullet
	 */
	EBullet.init = function(x, y) {
		E_BULLET_ENT.n = 0x02;
		E_BULLET_ENT.x = x;
		E_BULLET_ENT.y = y + 0x0006;
		if (Game.dir == LEFT) {
			EBullet.offsx = -0x08;
			E_BULLET_ENT.sprite = 0x21;
		} else {
			EBullet.offsx = 0x08;
			E_BULLET_ENT.sprite = 0x20;
		}
		Syssnd.play("WAV_BULLET", 1);
	}

	/*
	 * Entity action
	 *
	 * ASM 1883, 0F97
	 */
	EBullet.action = function(/*UNUSED(U8 e)*/) {
		/* move bullet */
		E_BULLET_ENT.x += EBullet.offsx;
		
		if (E_BULLET_ENT.x <= -0x10 || E_BULLET_ENT.x > 0xe8) {
			/* out: deactivate */
			E_BULLET_ENT.n = 0;

		} else {
			/* update bullet center coordinates */
			EBullet.xc = E_BULLET_ENT.x + 0x0c;
			EBullet.yc = E_BULLET_ENT.y + 0x05;
			if (World.eflg[World.map[EBullet.yc >> 3][EBullet.xc >> 3]] &
					MAP_EFLG_SOLID) {
				/* hit something: deactivate */
				E_BULLET_ENT.n = 0;
			}
		}
	}
	
/* EOF */
})();
