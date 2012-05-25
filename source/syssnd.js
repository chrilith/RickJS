/*
 * RickJS, a JavaScript port of XRick
 *
 * This source file is based on the folliwing files:
 * - xrick/src/syssnd.c
 *
 * Copyright (C) 1998-2002 BigOrno (bigorno@bigorno.net). All rights reserved.
 * Copyright (C) 2012 Chrilith (me@chrilith.com). All rights reserved.
 *
 * The use and distribution terms for this software are contained in the file
 * named README, which can be found in the root of this distribution. By
 * using this software in any fashion, you are agreeing to be bound by the
 * terms of this license.
 *
 * You must not remove this notice, or any other, from this software.
 */

(function() {
	/*
	 * Play a sound
	 *
	 * loop: number of times the sound should be played, -1 to loop forever
	 * returns: channel number, or -1 if none was available
	 *
	 * NOTE if sound is already playing, simply reset it (i.e. can not have
	 * twice the same sound playing -- tends to become noisy when too many
	 * bad guys die at the same time).
	 */
	Syssnd.play = function(name, loop) {
		// TODO
		var snd = Snd.getItem(name);
		if (snd) {
			snd.play();
		}
	}

	/*
	 * Pause
	 *
	 * pause: TRUE or FALSE
	 * clear: TRUE to cleanup all sounds and make sure we start from scratch
	 */
	Syssnd.pause = function(pause, clear) {
		// TODO
	}

	/*
	 * Stop a sound
	 */
	Syssnd.stopsound = function(sound) {
			if (!sound) { return; }
		var mus = Snd.getItem(sound);
		if (mus) {
			mus.pause();
		}
	}

	/*
	 * Load a sound.
	 */
	Syssnd.load = function(name) {
		return name;
	}

/* EOF */
})();
