
class SuffixTreeNode {
    constructor(parent = null, depth = 0, suffixStart = null) {
        this.children = new Map();
        this.parent = parent;
        this.depth = depth;
        this.suffixStart = suffixStart;
    }
}

class SuffixTree {
    constructor(text) {
        this.text = Array.from(text);
        this.root = new SuffixTreeNode();
        this.leaves = new Array(this.text.length);

        for (let i = 0; i < this.text.length; i++) {
            this.insertSuffix(i);
        }
    }

    insertSuffix(start) {
        let node = this.root;
        let pos = start;
        const text = this.text;

        while (pos < text.length) {
            const edge = node.children.get(text[pos]);

            if (!edge) {
                const leaf = new SuffixTreeNode(
                    node,
                    node.depth + text.length - pos,
                    start
                );

                node.children.set(text[pos], {
                    start: pos,
                    end: text.length,
                    child: leaf
                });

                this.leaves[start] = leaf;
                return;
            }

            let common = 0;

            while (
                edge.start + common < edge.end &&
                pos + common < text.length &&
                text[edge.start + common] === text[pos + common]
            ) {
                common++;
            }

            if (common === edge.end - edge.start) {
                pos += common;
                node = edge.child;
                continue;
            }

            const split = new SuffixTreeNode(
                node,
                node.depth + common
            );

            node.children.set(text[edge.start], {
                start: edge.start,
                end: edge.start + common,
                child: split
            });

            split.children.set(text[edge.start + common], {
                start: edge.start + common,
                end: edge.end,
                child: edge.child
            });

            edge.child.parent = split;

            pos += common;

            const leaf = new SuffixTreeNode(
                split,
                split.depth + text.length - pos,
                start
            );

            split.children.set(text[pos], {
                start: pos,
                end: text.length,
                child: leaf
            });

            this.leaves[start] = leaf;
            return;
        }
    }

    lcp(startA, startB) {
        let a = this.leaves[startA];
        let b = this.leaves[startB];

        const ancestors = new Set();

        while (a !== null) {
            ancestors.add(a);
            a = a.parent;
        }

        while (!ancestors.has(b)) {
            b = b.parent;
        }

        return b.depth;
    }
}

function findLongestPalindrome(str) {
    const chars = Array.from(str);
    const n = chars.length;

    if (n === 0) {
        return "";
    }

    const used = new Set(chars);

    function uniqueSymbol() {
        for (let code = 1; code <= 0x10FFFF; code++) {
            if (code >= 0xD800 && code <= 0xDFFF) {
                continue;
            }

            const symbol = String.fromCodePoint(code);

            if (!used.has(symbol)) {
                used.add(symbol);
                return symbol;
            }
        }

        throw new Error("Не удалось найти разделитель");
    }

    const separator = uniqueSymbol();
    const terminal = uniqueSymbol();
    const reversed = [...chars].reverse();

    const combined = [
        ...chars,
        separator,
        ...reversed,
        terminal
    ].join("");

    const tree = new SuffixTree(combined);

    let bestStart = 0;
    let bestLength = 1;

    function update(start, length) {
        if (length > bestLength) {
            bestStart = start;
            bestLength = length;
        }
    }

    for (let center = 0; center < n; center++) {
        const maxRadius = Math.min(center, n - center - 1);

        if (maxRadius === 0) {
            continue;
        }

        const reverseStart = n + 1 + (n - center);

        const radius = Math.min(
            tree.lcp(center + 1, reverseStart),
            maxRadius
        );

        update(center - radius, 2 * radius + 1);
    }

    for (let center = 1; center < n; center++) {
        const maxRadius = Math.min(center, n - center);

        if (maxRadius === 0) {
            continue;
        }

        const reverseStart = n + 1 + (n - center);

        const radius = Math.min(
            tree.lcp(center, reverseStart),
            maxRadius
        );

        update(center - radius, 2 * radius);
    }

    return chars.slice(
        bestStart,
        bestStart + bestLength
    ).join("");
}

const examples = [
    "babad",
    "cbbd",
    "abba",
    "aaaa",
    "abc",
    "racecar",
    ""
];

for (const str of examples) {
    console.log(
        `Строка: "${str}" -> Палиндром: "${findLongestPalindrome(str)}"`
    );
}
