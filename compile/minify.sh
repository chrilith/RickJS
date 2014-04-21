#!/bin/sh

# Minify using Google Closure Compiler
# https://developers.google.com/closure/compiler/

java -jar compiler.jar \
	--js=../source/xrick.js \
	--js=../source/system.js \
	--js=../source/sysarg.js \
	--js=../source/sysvid.js \
	--js=../source/sysevt.js \
	--js=../source/syssnd.js \
	--js=../source/game.js \
	--js=../source/draw.js \
	--js=../source/maps.js \
	--js=../source/control.js \
	--js=../source/screens.js \
	--js=../source/scr_gameover.js \
	--js=../source/scr_getname.js \
	--js=../source/scr_xrick.js \
	--js=../source/scr_imain.js \
	--js=../source/scr_imap.js \
	--js=../source/scr_pause.js \
	--js=../source/dat_maps.js \
	--js=../source/dat_screens.js \
	--js=../source/dat_spritesST.js \
	--js=../source/dat_ents.js \
	--js=../source/e_rick.js \
	--js=../source/e_sbonus.js \
	--js=../source/e_bomb.js \
	--js=../source/e_bonus.js \
	--js=../source/e_box.js \
	--js=../source/e_them.js \
	--js=../source/e_bullet.js \
	--js=../source/ents.js \
	--js=../source/rects.js \
	--js=../source/scroller.js \
	--js=../source/tiles.js \
	--js=../source/util.js \
\
	--language_in=ECMASCRIPT5 \
	--js_output_file=xrick.min.js #\

#	--summary_detail_level=3 \
#	--warning_level=VERBOSE
