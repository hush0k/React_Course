// 2 — Arrays
let numbers = [3, 7, 2, 10, 5];

console.log(numbers.map(number => number*2));
console.log(numbers.filter(number => number > 5));
console.log(numbers.find(number => number > 5));
console.log(numbers.reduce((acc, num) => acc + num, 0));
console.log(numbers.includes(10))

