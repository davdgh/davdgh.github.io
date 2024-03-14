const textarea1 = document.getElementById("textarea1");
const textarea2 = document.getElementById("textarea2");
const encriptar = document.getElementById("encriptar");
const desencriptar = document.getElementById("desencriptar");
const copiar = document.getElementById("copiar");
const caracteresValidos = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "K", "l", "m", "n", "ñ", "o", "p",
    "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", " ", ";", ",", "-", "_", "\n"
];

encriptar.addEventListener("click", () => {
    const texto = textarea1.value;
    if(!esValidoTodo(texto)){
        alert("Carácter no válido encontrado");
        return;
    }
    const textoEncriptado = Encriptar(texto);
    textarea2.value = textoEncriptado;
});

function esValidoTodo(texto){
    for(let i = 0; i < texto.length; i++){
        const subTexto = texto.substr(i, 1);
        if(!caracteresValidos.includes(subTexto)){
            return false;
        }
    }
    return true;
}

desencriptar.addEventListener("click", () => {
    const texto = textarea1.value;
    if(!esValidoTodo(texto)){
        alert("Carácter no válido encontrado");
        return;
    }
    const textoDesencriptado = Desencriptar(texto);
    textarea2.value = textoDesencriptado;
});

function Encriptar(texto){
    let textoEncriptado = "";
    for(let i = 0; i < texto.length; i++){
        const subTexto = texto.substr(i, 1);
        switch(subTexto){
            case "a":
                textoEncriptado += "ai";
                break;
            case "e":
                textoEncriptado += "enter";
                break;
            case "i":
                textoEncriptado += "imes";
                break;
            case "o":
                textoEncriptado += "ober";
                break;
            case "u":
                textoEncriptado += "ufat"
                break;
            default:
                textoEncriptado += subTexto;
                break;
        }
    }
    return textoEncriptado;
}
function Desencriptar(texto){
    let textoDesencriptado = "";
    const subTexto = texto;
    for(let i = 0; i < texto.length; i++){
        if(subTexto.substr(i, 2) === "ai"){
            textoDesencriptado += "a";
            i++;
        }else if(subTexto.substr(i, 4) === "imes"){
            textoDesencriptado += "i";
            i += 3;
        }else if(subTexto.substr(i, 4) === "ober"){
            textoDesencriptado += "o";
            i += 3;
        }else if(subTexto.substr(i, 4) === "ufat"){
            textoDesencriptado += "u";
            i += 3;
        }else if(subTexto.substr(i, 5) === "enter"){
            textoDesencriptado += "e";
            i += 4;
        }else{
            textoDesencriptado += subTexto.substr(i, 1);
        }
    }
    return textoDesencriptado;
}
copiar.addEventListener("click", copiarTexto);
function copiarTexto(){
    let textoCopiado = textarea2.value;
    if(textoCopiado === ""){
        alert("No se encontró ningún texto");
        return;
    }
    navigator.clipboard.writeText(textoCopiado)
    .then(() => {
        alert("Texto copiado al portapapeles");
    })
    .catch(err => {
        console.error('Error al copiar el texto: ', err);
        alert("Error al copiar el texto. Por favor, cópielo manualmente.");
    });

    textarea1.value = "";
    textarea2.value = "";
}
