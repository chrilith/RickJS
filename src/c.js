export function create_struct(props, values, base) {
    const struct = base || {};
    for (let i = 0; i < values.length; i++) {
        struct[props[i]] = values[i];
    }
    return struct;
}

export function as_const(obj) {
	return Object.freeze(obj);
}

export function create_array(...sizes) {
	const result = Array(sizes[0]);

	if (sizes.length === 2) {
		for (let i = 0; i < result.length; i++) {
			result[i] = Array(sizes[1]);
		}
	}

	return result;
}

export function sprintf(s, format, ...vargs) {
	const result = format.replace(/{(\d+)}/g, (match, capture) => {
		const index = Number(capture);
		return index < vargs.length ? vargs[index] : match;
	});
	for (let i = 0; i < Math.min(s.length, result.length); i++) {
		s[i] = result[i];
	}
}

export function plusplus(arr) {
	const c = arr.shift();
	return typeof c === "number" ? c : c.charCodeAt(0);
}

export function $(obj) {
	return {...obj};
}

export function _STR(arr) {
	return arr.reduce((r, c) => r + String.fromCharCode(c), "");
}

export function _U8(val) {
	return val & 0xff;
}

export function _S16(val) {
	return G.Convert.toInt16(val);
}

export function _U16(val) {
	return G.Convert.toUint16(val);
}
