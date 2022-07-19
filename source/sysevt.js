
(function() {
	/* local
	 ********/
	var gamepad, MAN = G.EventManager,
		eventMan = new G.EventManager(MAN.BIT_KEYBOARD/*|MAN.BIT_KBICADE*/);

	function TSTBIT(b) {
		return (Control.status && b) == b;
	}
	function SETBIT(b) {
		Control.status |= (b);
	}
	function CLRBIT(b) {
		Control.status &= ~(b);
	}

	function processGamepad() {
		if (!gamepad) { return; }

		CLRBIT(CONTROL_UP);
		CLRBIT(CONTROL_DOWN);
		CLRBIT(CONTROL_LEFT);
		CLRBIT(CONTROL_RIGHT);
		CLRBIT(CONTROL_FIRE);

		if (gamepad.buttons[0]) {
			SETBIT(CONTROL_FIRE);
		}

		if (gamepad.axes[0] || gamepad.axes[1]) {
			var v = new G.Vector(gamepad.axes[0], gamepad.axes[1]),
				a = v.getAngle() * 180 / Math.PI,
				s = v.getLength();

			a = (a + 22.5) % 360 / 45 | 0;

			if (a == 0) {
				SETBIT(CONTROL_UP);
			} else if (a == 1) {
				SETBIT(CONTROL_UP);
				SETBIT(CONTROL_RIGHT);
			} else if (a == 2) {
				SETBIT(CONTROL_RIGHT);
			} else if (a == 3) {
				SETBIT(CONTROL_RIGHT);
				SETBIT(CONTROL_DOWN);
			} else if (a == 4) {
				SETBIT(CONTROL_DOWN);
			} else if (a == 5) {
				SETBIT(CONTROL_DOWN);
				SETBIT(CONTROL_LEFT);
			} else if (a == 6) {
				SETBIT(CONTROL_LEFT);
			} else if (a == 7) {
				SETBIT(CONTROL_LEFT);
				SETBIT(CONTROL_UP);
			}
		}
	}

	function processEvent(event) {
		var key, E = G.Event;

		switch (event.type) {
			case E.KEYDOWN:
				key = event.keyCode;

				if (key == E.K_UP || key == E.K_ICADE_UP) {
					SETBIT(CONTROL_UP);
					Control.last = CONTROL_UP;

				} else if (key == E.K_DOWN || key == E.K_ICADE_DOWN) {
					SETBIT(CONTROL_DOWN);
					Control.last = CONTROL_DOWN;

				} else if (key == E.K_LEFT || key == E.K_ICADE_LEFT) {
					SETBIT(CONTROL_LEFT);
					Control.last = CONTROL_LEFT;

				} else if (key == E.K_RIGHT || key == E.K_ICADE_RIGHT) {
					SETBIT(CONTROL_RIGHT);
					Control.last = CONTROL_RIGHT;

				} else if (key == 'P'.charCodeAt(0) || key == E.K_ICADE_FIRE4) {
					SETBIT(CONTROL_PAUSE);
					Control.last = CONTROL_PAUSE;

				} else if (key == E.K_ESCAPE || key == E.K_ICADE_FIREX2) {
					SETBIT(CONTROL_END);
					Control.last = CONTROL_END;
/*
				} else if (key == syskbd_xtra) {
					SETBIT(CONTROL_EXIT);
					Control.last = CONTROL_EXIT;
*/
				} else if (key == E.K_SPACE || key == E.K_ICADE_FIRE1) {
					SETBIT(CONTROL_FIRE);
					Control.last = CONTROL_FIRE;
				}
				break;

			case E.KEYUP:
				key = event.keyCode;

				if (key == E.K_UP || key == E.K_ICADE_UP) {
					CLRBIT(CONTROL_UP);
					Control.last = CONTROL_UP;

				} else if (key == E.K_DOWN || key == E.K_ICADE_DOWN) {
					CLRBIT(CONTROL_DOWN);
					Control.last = CONTROL_DOWN;

				} else if (key == E.K_LEFT || key == E.K_ICADE_LEFT) {
					CLRBIT(CONTROL_LEFT);
					Control.last = CONTROL_LEFT;

				} else if (key == E.K_RIGHT || key == E.K_ICADE_RIGHT) {
					CLRBIT(CONTROL_RIGHT);
					Control.last = CONTROL_RIGHT;

				} else if (key == 'P'.charCodeAt(0) || key == E.K_ICADE_FIRE4) {
					CLRBIT(CONTROL_PAUSE);
					Control.last = CONTROL_PAUSE;

				} else if (key == 'S'.charCodeAt(0) || key == E.K_ICADE_FIREX1) {
					Sysvid.toggle_scanlines();

				} else if (key == E.K_ESCAPE || key == E.K_ICADE_FIREX2) {
					CLRBIT(CONTROL_END);
					Control.last = CONTROL_END;
/*
				} else if (key == syskbd_xtra) {
					CLRBIT(CONTROL_EXIT);
					Control.last = CONTROL_EXIT;
*/
				} else if (key == E.K_SPACE || key == E.K_ICADE_FIRE1) {
					CLRBIT(CONTROL_FIRE);
					Control.last = CONTROL_FIRE;
				}
				break;
		}
	}

	/* global
	 *********/
	Sysevt.init = function() {
/*		var pad = document.getElementById("gamepad"),
			s1, s2, S = G.Shape;

		if (G.TouchGamepad.isSupported()) {
			pad.style.display = "block";
			gamepad = new G.TouchGamepad("pad", pad);
			if (pad.offsetHeight == 120) {
				s1 = new G.Circle(65, 0, 55);
				s2 = new G.Circle(-50, 0, 30);
			} else {
				s1 = new G.Circle(100, 0, 90);
				s2 = new G.Circle(-100, 0, 40);
			}
			gamepad.addAxes(s1, S.ALIGN_LEFT | S.ALIGN_MIDDLE);
			gamepad.addButton(s2, S.ALIGN_RIGHT | S.ALIGN_MIDDLE);
			gamepad.setActive(true);
		}
*/
	}

	Sysevt.poll = function() {
		var e;

		if (!gamepad || (!gamepad.connected)) {
			while ((e = eventMan.poll())) {
				processEvent(e);
			}
		} else {
			processGamepad();
		}
	}

	Sysevt.wait = function() {
		Sysevt.poll();
	}

/* EOF */
})();
