/* const
 ********/
var	SYSVID_WIDTH	= 320;
	SYSVID_HEIGHT	= 200;

(function() {
	/* local
	 ********/
	var screen, scanlines = false;

	/* global
	 *********/
	Sysvid.SCREENRECT = new G.Rect(0, 0, SYSVID_WIDTH, SYSVID_HEIGHT);
	
	function init_screen(w, h/*, bpp, flags*/) {
		var s = new G.Screen(SYSVID_WIDTH, SYSVID_HEIGHT);
		s.setActive();
		s.enableFiltering(false);
		return s;
	}
	
	Sysvid.setPalette = function() {
	}

	Sysvid.restorePalette = function() {
	}
	
	Sysvid.setGamePalette = function() {
//		Sysvid.setPalette();
	}

	Sysvid.init = function() {
		screen = init_screen(SYSVID_WIDTH, SYSVID_HEIGHT);
		Sysvid.fb = new G.Surface(SYSVID_WIDTH, SYSVID_HEIGHT);
	}
	
	Sysvid.update = function(rects) {
		if (rects == null) {
			return;
		}
		screen.redraw(Sysvid.fb, 0, 0, rects);
	}

	Sysvid.toggle_scanlines = function(isOn) {
		scanlines = !scanlines;
		if (scanlines) {
			screen.setScanlines(50, 5);			
		} else {
			screen.setScanlines();
		}
	}

	Sysvid.clear = function() {
		Sysvid.fb.renderer.fillRect(null, new G.Color(0,0,0));
	}

/* EOF */
})();