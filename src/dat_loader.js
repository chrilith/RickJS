import { pic_congrats, pic_haf, pic_splash  } from "./dat_picST";
import { sprites_data, sprites_init } from "./dat_spritesST";
import { tiles_data, tiles_init } from "./dat_tilesST";

const path = "../data";
let data;

export async function dat_init() {
	data = new G.BitmapLibrary();

	data.pushItem(pic_congrats, `${path}/congrat.png`);
	data.pushItem(pic_haf, `${path}/haf.png`);
	data.pushItem(pic_splash, `${path}/title.png`);

	data.pushItem(tiles_data, `${path}/tiles.png`);
	data.pushItem(sprites_data, `${path}/sprites.png`);

	await data.load();

	tiles_init(dat_get(tiles_data));
 	sprites_init(dat_get(sprites_data));
}

export function dat_get(name) {
	return data.getItem(name);
}
