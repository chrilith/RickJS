
import { create_struct } from "../src/c";

const struct_rect_t = [
	"x", "y",
	"width", "height",
	"next"
];
export function rect_t(...values) {
	return create_struct(struct_rect_t, values);
}
