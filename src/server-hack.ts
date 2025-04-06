import type { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
	// Checks for the number of arguments given to the script
	if (ns.args.length !== 1) {
		ns.print(`ERROR: ${ns.args.length} arguments given. Requires 1 (hostname)`);
		ns.ui.openTail();
		ns.exit();
	}

	const target = ns.args[0] as string;

	// Check if the target server is valid

	// Check if server has grow/hack/weak scripts

	// Check if server ports are open

	const moneyThresh = ns.getServerMaxMoney(target);
	const securityThresh = ns.getServerMinSecurityLevel(target);

	while (true) {
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			// If the server's security level is above our threshold, weaken it
			await ns.weaken(target);
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			// If the server's money is less than our threshold, grow it
			await ns.grow(target);
		} else {
			// Otherwise, hack it
			await ns.hack(target);
		}
	}
}
