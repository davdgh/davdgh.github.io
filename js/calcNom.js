function showLoader() {
  document.getElementById('loader').style.display = 'flex';
  console.log("Se entró al loader");
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
  console.log("Se acabó el loader");
}

document.addEventListener("DOMContentLoaded", async () => {
    // Obtiene todos los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);

    // Obtiene el valor específico de 'moduleId'
    const moduleId = urlParams.get('moduleId');
    const userId = urlParams.get("userId");
    const moduleName = urlParams.get("moduleName");
    const permissions = urlParams.get("permissions");

    const btnAsistencia = document.querySelector(".btn-asist");
    btnAsistencia.addEventListener("click", async () => {
        const formData = new FormData();
        const inputFile = document.getElementById("asistencia");
        const file = inputFile.files[0];

        if (!file) {
            Swal.fire({
                title: "Error",
                text: "No se ha seleccionado un archivo",
                icon: "error"
            });
            return;
        } else if (file.type !== "text/plain") {
            Swal.fire({
                title: "Error",
                text: "El archivo seleccionado no es un archivo de texto plano",
                icon: "error"
            });
            return;
        }

        formData.append("assistance", file);

        const divNomina = document.querySelector(".nomina");
        showLoader();

        try {
            const response = await fetch(`https://proyectoestadiabackend.onrender.com/api/modules/${moduleId}/payroll?userId=${userId}&permissions=${permissions}`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if(!response.ok) {
                hideLoader();
                Swal.fire({
                    title: "Error",
                    text: "No se pudo generar la asistencia",
                    icon: "error"
                });
                return;
            }

            console.log({ data });
            divNomina.textContent = JSON.stringify(data);
        } catch(error) {
            console.error(error);
            Swal.fire({
                title: "Error",
                text: "Ocurrió un error al intentar leer el archivo y convertirlo",
                icon: "error"
            });
        } finally {
            hideLoader();
        }
    });
});