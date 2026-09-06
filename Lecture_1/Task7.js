// 7 — Functions as Values
function add(a, b) {
    return a + b;
}
function multiply(a, b) {
    return a * b;
}

function calculate(a, b, operation) {
    return operation(a, b);
}

console.log(calculate(5, 5, add));
console.log(calculate(5, 5, multiply));

//Can functions be stored in variables?  Yes так как функция в конечном итоге возвращяет какую то переменную или объект. Поэтому его можно сохранить
//Can functions be passed to other functions? Да можно
//What is the difference between add and add()? add это ссылка на саму функцию а add() это выполнение функции

