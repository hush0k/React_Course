// 8 — Scope
const message = "global"
console.log(message)
function newFunction() {
    const message = "function"
    console.log(message)
    if (message === "function") {
        const message = "block"
        console.log(message)
        var word1 = "var word"
        let word2 = "let word"
        const word3 = "const word"
    }
}
newFunction();
//console.log(word1, word2, word3) здесь они не выходят так как они объявлены в function scope а это global

// Global scope — переменная объявлена вне всех функций и блоков, доступна отовсюду в коде
// Function scope — переменная видна только внутри функции, где объявлена, наружу не выходит
// Block scope — переменная видна только внутри блока { } (if, for, while), умирает на границе блока
// var — function scope, можно переприсвоить и объявить заново, hoisting с undefined
// let — block scope, можно переприсвоить, нельзя объявить заново, hoisting но TDZ
// const — block scope, НЕЛЬЗЯ переприсвоить, нельзя объявить заново
