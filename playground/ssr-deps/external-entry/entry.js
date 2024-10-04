// Module with state, to check that it is properly externalized and
// not bundled in the optimized deps
let msg;
export function setMessage(externalMsg) {
	msg = externalMsg;
}
export default function getMessage() {
	return msg;
}
