// 1 — Variables and Data Types

let studentName = 'Kanysh'; // primitive string
let studentAge= 21; // primitive number
let isActive = true; // primitive boolan
let courses = ['Math', 'History', 'English']; // reference type string array
let address = 'Esenova 43'; // primitive string
let phoneNumber; //this will be undefine and primitive

console.log(`The name of the student is ${studentName} and type is String`);
console.log(`The age of the student is ${studentAge} and type is Number`);
console.log(`The active status of the student is ${isActive} and type is Boolean`);
console.log(`The courses of the student is ${courses} and type is array`);
console.log(`The address of the student is ${address} and type is String`);
console.log(`The phone nuber of the student is ${phoneNumber}`);


// What is the difference between let and const? const он не изменяемы после объявление, а let можно изменить в любое время. Const используют для того чтобы не изменить некоторые данные случайно если точно знаешь что он не должен быть изменен
// What does typeof null return? object это исторический баг который тянется с первой версии js
// What are JavaScript primitive types? string number boolean null undefined bigint symbol
