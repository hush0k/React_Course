users = [
    {name: "Anna", age: 30},
    {name: "Brian", age: 28, address:{country: "Portugal", city: "Lissabon"}},
    {name: "Mbappe", age: 18},
    {name: "Mary", age: 23, address:{ country: "Russia", city: "Moskow"}},
    {name: "Ronaldo", age: 58, address:{ country: "Kazakhstan", city: "Almaty"}},
    {name: "Belingam", age: 19},
    {name: "Monesy", age: 75, address:{ country: "France", city: "Paris"}},
]

users.forEach(user => {
    console.log(user.address?.city);
})

users.forEach(user => {
    console.log(user.address?.city ?? "City not specified");
})

// Различие || и ?? в том что ?? реагирует только в том случае если значение
// null or undefied а || на все falsy к примеру 0 "" NaN null undefied