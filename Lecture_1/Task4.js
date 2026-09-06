// 4 — Objects
let user = {
    id: 2912,
    name: 'Kanysh',
    age: 21,
    address: {
        city: 'Almaty',
        street: 'Esenova',
    }
}

console.log(`User name is: ${user.name}. His address is: ${user.address.city}, ${user.address.street}`);
user.age = 23;
user.email = 'kanyshomirzak@gmail.com';

delete user.address.street;

const { name, age } = user;
console.log(`User age is: ${age} and name is ${name}`);

const { address: { city } } = user;
console.log(`User adress street: ${city}`)

const { name: userName } = user;
console.log(`User name is: ${userName}`);
