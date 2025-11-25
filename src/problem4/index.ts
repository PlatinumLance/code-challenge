/*
    Complexity
    Time: O(n)
    Space: O(n)
*/
function sum_to_n_a (n: number) {
    let sum: number = 0;
    for (let i:number = 1; i <= n; i++) {
        sum += i;
    }

    return sum;
}

/*
    Complexity
    Time: O(1)
    Space: O(1)
*/
function sum_to_n_b (n: number) {
    return (n*(n + 1)) / 2;
}

/*
    Complexity
    Time: O(n)
    Space: O(n)
*/
function sum_to_n_c (n: number): number {
    if (n <= 1) {
        return n;
    }

    return n + sum_to_n_c(n - 1);
}

function main() {
    const input = process.argv[2];

    if(!input) {
        console.log("Error: Please provide a number as an argument");
        return;
    }

    const n = Number(input);

    if(!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
        console.error("Error: Please provide a non-negative integer.");
        return;
    }

    console.log(`Input n = ${n}`);

    console.log("sum_to_n_a:", sum_to_n_a(n));
    console.log("sum_to_n_b:", sum_to_n_b(n));
    console.log("sum_to_n_c:", sum_to_n_c(n));
}

main();