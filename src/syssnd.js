/*
 * RickJS, a JavaScript port of XRick
 *
 * This source file is based on the folliwing files:
 * - xrick/src/syssnd.c
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


let isAudioActive = false;


export function
syssnd_init()
{
	console.log("syssnd_init()");
	// TODO
}

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
export function
syssnd_play(sound, loop)
{
  let c;

  if (!isAudioActive) return -1;
  if (sound === null) return -1;

  c = 0;
/*  SDL_mutexP(sndlock);
  while ((channel[c].snd != sound || channel[c].loop == 0) &&
	 channel[c].loop != 0 &&
	 c < SYSSND_MIXCHANNELS)
    c++;
  if (c == SYSSND_MIXCHANNELS)
    c = -1;

  IFDEBUG_AUDIO(
    if (channel[c].snd == sound && channel[c].loop != 0)
      sys_printf("xrick/sound: already playing %s on channel %d - resetting\n",
		 sound->name, c);
    else if (c >= 0)
      sys_printf("xrick/sound: playing %s on channel %d\n", sound->name, c);
    );

  if (c >= 0) {
    channel[c].loop = loop;
    channel[c].snd = sound;
    channel[c].buf = sound->buf;
    channel[c].len = sound->len;
  }
  SDL_mutexV(sndlock);*/

	console.log("syssnd_play(%s) %dx", sound, loop);
  return c;
}
