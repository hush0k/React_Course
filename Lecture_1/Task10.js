// 10 — Destructuring, Spread and Rest
numbers = [10, 20, 30, 40]
const [ first, second ] = numbers;
console.log(first, second)

user = { id: 1, name: 'Anna', age: 21 }
const { name } =user
console.log(name);

newNumbers = [ ...numbers ]
newNumbers.push(50)
console.log(newNumbers)

newUser = { ...user }
newUser.age = 22
newUser.email = 'anna01@gmail.com'
console.log(newUser)

spreadedArray = [ ...numbers, ...newNumbers ]
console.log(spreadedArray)

function sum(...numbers) {
    return numbers.reduce((sum, number) => sum + number, 0);
}
console.log(sum(...spreadedArray));

//spread разбирает элементы на отдельные части, rest наоборот собирает
// отдельные элементы в едино и выводит.

