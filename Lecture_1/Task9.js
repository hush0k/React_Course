// 9 — Closure
function createCoutner(){
    let counter = 0;

    function increment() {
        counter++;
        console.log(counter);
    }
    return increment;
}

const counter = createCoutner()
counter()
counter()
const counter2 = createCoutner()
counter2()
counter2()


function createAdder(value){
    let total = value

    function adderTo(val) {
        total += val
        console.log(total)
        return total
    }
    return adderTo;
}

const adderFive = createAdder(5);
adderFive(10)
adderFive(20)

// функция "запоминает", в каком окружении она родилась, и берёт с собой доступ к тем переменным, даже если попадёт в другое место кода

