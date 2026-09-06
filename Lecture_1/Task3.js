// 3 — Arrays of Objects
let students = [
    {id: 1, name: "Anna", grade: 85},
    {id: 2, name: "John", grade: 62},
    {id: 3, name: "Sara", grade: 91},
    {id: 4, name: "Mike", grade: 55},
]

let goodStudents = students.filter(student => student.grade >= 70)
console.log(goodStudents);

let names = students.map(student => student.name);
console.log(names);

let  thirdId = students.filter(student => student.id === 3);
console.log(thirdId);

let highestGrade = students.reduce((max, curr) => curr.grade > max.grade ? curr : max);
console.log(`Max grade: ${highestGrade.grade}`);

let average = students.reduce((total, curr) => total + curr.grade, 0) / students.length;
console.log(`Average grade: ${average}`);

// здесь ...student это копирование всех полей каждого студента в новый объект
let new_students = students.map(student => ({
    ...student, passed: student.grade >= 70
}));
console.log(new_students);

