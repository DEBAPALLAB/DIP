// Watts-Strogatz small-world graph: 12 nodes, k≈8, p=0.15
// Each agent has ~4 direct connections forming a ring + rewired shortcuts
export const NETWORK: [number, number][] = [
    [0, 1], [0, 2], [0, 9],
    [1, 2], [1, 4], [1, 11],
    [2, 3], [2, 8],
    [3, 4], [3, 10],
    [4, 5], [4, 11],
    [5, 6], [5, 7],
    [6, 7], [6, 8],
    [7, 8], [7, 9],
    [8, 9],
    [9, 10],
    [10, 11],
    [11, 0],
];

/**
 * Returns the list of neighbor IDs for a given agent ID.
 */
export function getNeighbors(agentId: number): number[] {
    return NETWORK
        .filter(([a, b]) => a === agentId || b === agentId)
        .map(([a, b]) => (a === agentId ? b : a));
}
