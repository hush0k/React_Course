students = [
    {id: 1, name: "Sayat", age: 22, grades: [79, 77, 75, 84]},
    {id: 2, name: "Kanysh", age: 21, grades: [97, 87, 96, 95]},
    {id: 3, name: "Baha", age: 22, grades: [80, 74, 78, 84]},
    {id: 4, name: "Era", age: 22, grades: [88, 85, 80, 87]},
    {id: 5, name: "Muha", age: 21, grades: [99, 95, 98, 100]},
]

let getAverage = (grades) => grades.reduce((sum, number) => sum + number, 0) / grades.length;
let getStudentAverage = (student) => getAverage(student.grades);
let getStudentsAverage = (students) => {
    let studentsGrades = students.map(student => getAverage(student.grades));
    return studentsGrades.reduce((sum, number) => sum + number, 0) / studentsGrades.length;
}

let PASS_SCORE = 80
console.log(getStudentsAverage(students));

let getPassedStundets = (students) => students.filter(student => getStudentAverage(student) > PASS_SCORE)
console.log(getPassedStundets(students));

let getStudentNames = (students) => students.map(student => student.name);
console.log(getStudentNames(students));

let findStudent = (students, id) => students.find(student => student.id === id);
console.log(findStudent(students, 1));

let fullInformation = students.map(student => ({
    ...student, passed: getStudentAverage(student) > PASS_SCORE,
}));

console.log(fullInformation);
