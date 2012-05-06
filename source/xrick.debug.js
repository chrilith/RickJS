(function() {

	var all  = document.getElementsByTagName('script'),
		path = all[all.length - 1].src,
		dir	 = path.substr(0, path.indexOf("xrick.debug.js"));
		
		document.write(' \
			<script src="' + dir + 'xrick.js"></script> \
			<script src="' + dir + 'system.js"></script> \
			<script src="' + dir + 'sysvid.js"></script> \
			<script src="' + dir + 'sysevt.js"></script> \
			<script src="' + dir + 'game.js"></script> \
			<script src="' + dir + 'draw.js"></script> \
			<script src="' + dir + 'maps.js"></script> \
			<script src="' + dir + 'control.js"></script> \
			<script src="' + dir + 'screens.js"></script> \
			<script src="' + dir + 'scr_gameover.js"></script> \
			<script src="' + dir + 'scr_getname.js"></script> \
			<script src="' + dir + 'scr_xrick.js"></script> \
			<script src="' + dir + 'scr_imain.js"></script> \
			<script src="' + dir + 'scr_imap.js"></script> \
			<script src="' + dir + 'scr_pause.js"></script> \
			<script src="' + dir + 'dat_maps.js"></script> \
			<script src="' + dir + 'dat_screens.js"></script> \
			<script src="' + dir + 'dat_spritesST.js"></script> \
			<script src="' + dir + 'dat_ents.js"></script> \
			<script src="' + dir + 'e_rick.js"></script> \
			<script src="' + dir + 'e_sbonus.js"></script> \
			<script src="' + dir + 'e_bomb.js"></script> \
			<script src="' + dir + 'e_bonus.js"></script> \
			<script src="' + dir + 'e_box.js"></script> \
			<script src="' + dir + 'e_them.js"></script> \
			<script src="' + dir + 'e_bullet.js"></script> \
			<script src="' + dir + 'ents.js"></script> \
			<script src="' + dir + 'rects.js"></script> \
			<script src="' + dir + 'scroller.js"></script> \
			<script src="' + dir + 'tiles.js"></script> \
			<script src="' + dir + 'util.js"></script> \
	');

})();
