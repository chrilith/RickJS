import { screen_imapsteps_t } from "../include/screens";

/*
 * map intro, sprites lists
 */
export const screen_imapsl = [
  0x1b, 0x00,
  0x1c, 0x1d, 0x00,
  0x01, 0x00,
  0x02, 0x03, 0x04, 0x05, 0x06, 0x00,
  0x1e, 0x00,
  0x0d, 0x00,
  0x13, 0x14, 0x00,
  0x1f, 0x00
];

/*
 * map intro, steps
 */
export const screen_imapsteps = [
  screen_imapsteps_t( 0x0000, 0x0002, 0x0002, 0x0000 ),

  screen_imapsteps_t( 0x000b, 0x0000, 0x0001, 0x0000 ),
	screen_imapsteps_t( 0x0008, 0x0001, 0x0000, 0x0002 ),

  screen_imapsteps_t( 0x0000, 0x0000, 0x000c, 0x0000 ),

  screen_imapsteps_t( 0x000a, 0x0000, 0x0000, 0x0005 ),
  screen_imapsteps_t( 0x0006, 0x0002, 0x0000, 0x0007 ),
  screen_imapsteps_t( 0x0005, 0x0000, 0x0000, 0x0005 ),

  screen_imapsteps_t( 0x0000, 0x0006, 0x0000, 0x0000 ),

  screen_imapsteps_t( 0x000c, 0x0000, 0x0001, 0x0000 ),
  screen_imapsteps_t( 0x0005, 0x0000, 0x0000, 0x000d ),

  screen_imapsteps_t( 0x0000, 0x000c, 0x000c, 0x0000 ),

  screen_imapsteps_t( 0x0005, 0x0000, 0x0000, 0x0005 ),
  screen_imapsteps_t( 0x000a, 0x0000, 0x0000, 0x000f ),
  screen_imapsteps_t( 0x000c, 0xffff, 0x0000, 0x0011 ),
  screen_imapsteps_t( 0x0005, 0x0000, 0x0000, 0x000f ),

  screen_imapsteps_t( 0x0000, 0x0006, 0x0001, 0x0000 ),

  screen_imapsteps_t( 0x000a, 0x0000, 0x0000, 0x0014 ),
  screen_imapsteps_t( 0x0006, 0x0000, 0x0001, 0x0014 ),
  screen_imapsteps_t( 0x0005, 0x0000, 0x0000, 0x0014 ),
  screen_imapsteps_t( 0x0003, 0x0001, 0x0000, 0x0014 ),
  screen_imapsteps_t( 0x0006, 0xffff, 0x0000, 0x0014 ),
  screen_imapsteps_t( 0x0003, 0x0000, 0xffff, 0x0014 ),

  screen_imapsteps_t( 0x0000, 0x0000, 0x0000, 0x0000 )
];

/*
 * map intro, step offset per map
 */
export const screen_imapsofs = [
  0x00, 0x03, 0x07, 0x0a, 0x0f
];

/*
 * map intro, text
 * (from ds + 0x8810 + 0x2000, 0x2138, 0x2251, 0x236a, 0x2464)
 *
 * \xFE=0xfe \xFF=0xff
 */
const screen_imaptext_amazon = "\
@@@@@SOUTH@AMERICA@1945@@@@@@@\xFF\
RICK@DANGEROUS@CRASH@LANDS@HIS\xFF\
@PLANE@OVER@THE@AMAZON@WHILE@@\xFF\
@SEARCHING@FOR@THE@LOST@GOOLU@\xFF\
@@@@@@@@@@@@TRIBE.@@@@@@@@@@@@\xFF\xFF\
@BUT,@BY@A@TERRIBLE@TWIST@OF@@\xFF\
FATE@HE@LANDS@IN@THE@MIDDLE@OF\xFF\
@@@A@BUNCH@OF@WILD@GOOLUS.@@@@\xFF\xFF\
@@CAN@RICK@ESCAPE@THESE@ANGRY@\xFF\
@@@AMAZONIAN@ANTAGONISTS@?@@@@\xFE";

const screen_imaptext_egypt = "\
@@@@EGYPT,@SOMETIMES@LATER@@@@\xFF\
RICK@HEADS@FOR@THE@PYRAMIDS@AT\xFF\
@@@@THE@REQUEST@OF@LONDON.@@@@\xFF\xFF\
HE@IS@TO@RECOVER@THE@JEWEL@OF@\xFF\
ANKHEL@THAT@HAS@BEEN@STOLEN@BY\xFF\
FANATICS@WHO@THREATEN@TO@SMASH\xFF\
@IT,@IF@A@RANSOM@IS@NOT@PAID.@\xFF\xFF\
CAN@RICK@SAVE@THE@GEM,@OR@WILL\xFF\
HE@JUST@GET@A@BROKEN@ANKHEL@?@\xFE";

const screen_imaptext_castle = "\
@@@@EUROPE,@LATER@THAT@WEEK@@@\xFF\
@@RICK@RECEIVES@A@COMMUNIQUE@@\xFF\
@@FROM@BRITISH@INTELLIGENCE@@@\xFF\
@@ASKING@HIM@TO@RESCUE@ALLIED@\xFF\
@PRISONERS@FROM@THE@NOTORIOUS@\xFF\
@@@@SCHWARZENDUMPF@CASTLE.@@@@\xFF\xFF\
@@RICK@ACCEPTS@THE@MISSION.@@@\xFF\xFF\
@@@BUT@CAN@HE@LIBERATE@THE@@@@\xFF\
@CRUELLY@CAPTURED@COOMANDOS@?@\xFE";

const screen_imaptext_missile = "\
@@@@@@EUROPE,@EVEN@LATER@@@@@@\xFF\
RICK@LEARNS@FROM@THE@PRISONERS\xFF\
@THAT@THE@ENEMY@ARE@TO@LAUNCH@\xFF\
AN@ATTACK@ON@LONDON@FROM@THEIR\xFF\
@@@@@SECRET@MISSILE@BASE.@@@@@\xFF\xFF\
WITHOUT@HESITATION,@HE@DECIDES\xFF\
@@@TO@INFILTRATE@THE@BASE.@@@@\xFF\xFF\
CAN@RICK@SAVE@LONDON@IN@TIME@?\xFE";

const screen_imaptext_muchlater = "\
@@@LONDON,@MUCH,@MUCH@LATER@@@\xFF\
@RICK@RETURNS@TO@A@TRIUMPHANT@\xFF\
@@WELCOME@HOME@HAVING@HELPED@@\xFF\
@@@@SECURE@ALLIED@VICTORY.@@@@\xFF\xFF\
BUT,@MEANWHILE,@IN@SPACE,@THE@\xFF\
@@@MASSED@STARSHIPS@OF@THE@@@@\xFF\
@@@BARFIAN@EMPIRE@ARE@POISED@@\xFF\
@@@@@TO@INVADE@THE@EARTH.@@@@@\xFF\xFF\
@WHAT@WILL@RICK@DO@NEXT@...@?@\xFE";

export const screen_imaptext =
[ screen_imaptext_amazon,
  screen_imaptext_egypt,
  screen_imaptext_castle,
  screen_imaptext_missile,
  screen_imaptext_muchlater
].map((s) => s.split(''));

/*
 * main intro, hall of fame title
 * (from ds + 0x8810 + 0x2642)
 */
export const screen_imainhoft =
[ 0x2f, 0x2f, 0x2f, 0x2f, 0x2f, 0xd4, 0xb7, 0xb1,
  0xac, 0xc6, 0x2f, 0xc6, 0x2f, 0x2f, 0xa4, 0xac,
  0x9b, 0xc1, 0x2f, 0x9b, 0xc1, 0xb1, 0xac, 0xb6,
  0xbd, 0x9b, 0xc1, 0x2f, 0x2f, 0x2f, 0x2f, 0x2f,
  0xff,
  0x2f, 0x2f, 0x2f, 0x2f, 0x2f, 0xb2, 0xb3, 0xb2,
  0xb3, 0xad, 0x2f, 0xad, 0x2f, 0x2f, 0xa6, 0xae,
  0xc2, 0xc3, 0x2f, 0xc2, 0xc3, 0xb2, 0xb3, 0xbe,
  0xbf, 0xc2, 0xc3, 0x2f, 0x2f, 0x2f, 0x2f, 0x2f,
  0xff,
  0x2f, 0x2f, 0x2f, 0x2f, 0x2f, 0x9f, 0xc0, 0xb4,
  0xb5, 0xaf, 0xc4, 0xaf, 0xc4, 0x2f, 0xa7, 0xb0,
  0xb4, 0x2f, 0x2f, 0xb4, 0x2f, 0xb4, 0xb5, 0xb4,
  0xb5, 0xaf, 0xc4, 0x2f, 0x2f, 0x2f, 0x2f, 0x2f,
  0xfe
];

/*
 * main intro, Rick Dangerous title
 * (from ds + 0x8810 + 0x27a1)
 */
export const screen_imainrdt =
[ 0x2f, 0x2f, 0x2f, 0x9b, 0x9c, 0xa1, 0xa4, 0xa5,
  0xa9, 0xaa, 0x2f, 0x9b, 0xac, 0xb1, 0xac, 0xb6,
  0xb7, 0xa4, 0xa5, 0x9b, 0xc1, 0x9b, 0x9c, 0xa4,
  0xac, 0xc6, 0xc7, 0xc8, 0xc9, 0x2f, 0x2f, 0x2f,
  0xff,
  0x2f, 0x2f, 0x2f, 0x9d, 0x9e, 0xa2, 0xa6, 0x2f,
  0x9d, 0xab, 0x2f, 0xad, 0xae, 0xb2, 0xb3, 0xb8,
  0xb9, 0xa6, 0xbb, 0xc2, 0xc3, 0x9d, 0x9e, 0xa6,
  0xae, 0xad, 0xae, 0xca, 0xcb, 0x2f, 0x2f, 0x2f,
  0xff,
  0x2f, 0x2f, 0x2f, 0x9f, 0xa0, 0xa3, 0xa7, 0xa8,
  0x9f, 0xa0, 0x2f, 0xaf, 0xb0, 0xb4, 0xb5, 0x9f,
  0xba, 0xa7, 0xbc, 0xaf, 0xc4, 0x9f, 0xa0, 0xa7,
  0xb0, 0xc5, 0xb0, 0xcc, 0xb0, 0x2f, 0x2f, 0x2f,
  0xfe
];

/*
 * congratulations
 * (from ds + 0x8810 + 0x257d)
 */
export const screen_congrats =
[ 0xa4, 0xa5, 0xa4, 0xac, 0xb6, 0xb7, 0xa4, 0xa5,
  0x9b, 0x9c, 0xb1, 0xac, 0xcd, 0xce, 0xc6, 0xc7,
  0xd3, 0x2f, 0xb1, 0xac, 0xcd, 0xce, 0xa1, 0xa4,
  0xac, 0xb6, 0xb7, 0xc8, 0xc9, 0x2f, 0xd5, 0xd6,
  0xff,
  0xa6, 0x2f, 0xa6, 0xae, 0xb8, 0xb9, 0xa6, 0xbb,
  0x9d, 0x9e, 0xb2, 0xb3, 0xcf, 0xd0, 0xad, 0xae,
  0xad, 0x2f, 0xb2, 0xb3, 0xcf, 0xd0, 0xa2, 0xa6,
  0xae, 0xb8, 0xb9, 0xca, 0xcb, 0x2f, 0xd7, 0xd8,
  0xff,
  0xa7, 0xa8, 0xa7, 0xb0, 0x9f, 0xba, 0xa7, 0xbc,
  0x9f, 0xa0, 0xb4, 0xb5, 0xd1, 0xd2, 0xc5, 0xb0,
  0xaf, 0xc4, 0xb4, 0xb5, 0xd1, 0xd2, 0xa3, 0xa7,
  0xb0, 0x9f, 0xba, 0xcc, 0xb0, 0x2f, 0xd9, 0xda,
  0xfe
];

/*
 * main intro, Core Design copyright text
 * (from ds + 0x8810 + 0x2288)
 *
 * \xFE=0xfe \xFF=0xff
 */
export const screen_imaincdc = "\
@@@@@@@@@@@@@@@@@@@\xFF\xFF\
(C)@1989@CORE@DESIGN\xFF\xFF\xFF\
@PRESS@SPACE@TO@START\xFE".split('');

/*
 * gameover
 * (from ds + 0x8810 + 0x2864)
 *
 * \xFE=0xfe \xFF=0xff
 */
export const screen_gameovertxt = "\
@@@@@@@@@@@\xFF\
@GAME@OVER@\xFF\
@@@@@@@@@@@\xFE".split('');

/*
 * paused
 *
 * \xFE=0xfe \xFF=0xff
 */
export const screen_pausedtxt = "\
@@@@@@@@@@\xFF\
@@PAUSED@@\xFF\
@@@@@@@@@@\xFE".split('');

/* eof */



