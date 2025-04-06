import type { NS, Server } from '@ns';

type ServerNode = {
	server: Server;
	parent: ServerNode | undefined;
	children: ServerNode[];
};

export async function main(ns: NS): Promise<void> {
	ns.disableLog('scan');
	ns.clearLog();

	if (ns.args.length !== 1) {
		ns.print(`ERROR: ${ns.args.length} arguments given. Requires 1 (hostname)`);
		ns.ui.openTail();
		ns.exit();
	}

	const homeServer = {
		server: ns.getServer('home'),
		parent: undefined,
		children: new Array<ServerNode>(),
	} as ServerNode;

	// Preform a bfs to find the path to the target server
	const queue = new Array<ServerNode>();
	const visited = new Array<string>();

	queue.push(homeServer);
	visited.push('home');

	while (queue.length > 0) {
		const u = queue.shift();

		for (const serv of ns.scan(u?.server.hostname)) {
			if (!visited.find((s) => s === serv)) {
				const n = {
					server: ns.getServer(serv),
					parent: u,
					children: new Array<ServerNode>(),
				} as ServerNode;

				// Add n to the parent node's children array
				n.parent?.children.push(n);

				// Found the target server
				if (serv === ns.args[0]) {
					let cur = n;
					let ret = `connect ${serv}; `;

					while (cur.parent) {
						ret = `connect ${cur.parent.server.hostname}; ${ret}`;
						cur = cur.parent;
					}

					ns.tprint(ret);
					ns.exit();
				}

				queue.push(n);
				visited.push(serv);
			}
		}
	}

	// Fails to find the target server
	ns.ui.openTail();
	ns.print(`Could not find hostname ${ns.args[0]}`);
}
