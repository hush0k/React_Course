// 6 — Functions
function isEvenFunction(number) {
    return number % 2 === 0;
}
let isEven = (number) => number % 2 === 0;
console.log(isEven(12312));
console.log(isEvenFunction(12482));

let getFullName = (firstName, lastName) => `${firstName} ${lastName}`;
console.log(getFullName('Alice', 'Jhonse'));

let calculatePrice = (price, quantity) => price * quantity;
console.log(calculatePrice(12, 43));

let calculateDiscont = (price, percent) => price * percent / 100;
console.log(calculateDiscont(100, 43));

let getMax = (number1, number2) => number1 >= number2 ? number1 : number2;
console.log(getMax(100, 123));
