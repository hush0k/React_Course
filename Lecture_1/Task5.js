// 5 — Values and References
original = {name: 'Alice', score: 10}
copy = original

copy.score = 20
console.log(original) // original also changed, I think because copy is refferencing to original but not create new object

let newCopy = { ...original };
newCopy.score = 0;
console.log(original);


user1 = {name: 'Alice', address: {city: 'Almaty'}}
user1Copy = { ...user1 }
user1Copy.address.city = 'Astana';
console.log(user1); //printed Astana потому что объект address уже другой объект а не user1. Поэтому как в первом примере там берется именно ссылка на объект address

user1Copy2 = { ...user1, address: { ...address }};
user1Copy2.address.city = 'Shymkent';
console.log(user1);

