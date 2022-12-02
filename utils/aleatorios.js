exports.elementoAleatorio = (array) => {
    return array[Math.floor(Math.random()*array.length)];
} 

exports.aleatorioRetira = (array) => {
    let index = Math.floor(Math.random()*array.length);
    let elemento =  array[index];
    array.splice(index, 1);
    return elemento;
}

exports.numeroAleatorio = (max) => {
    return Math.floor(Math.random() * max)  + 1;
}