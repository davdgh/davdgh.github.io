async function getModules() {
    const response = await fetch("https://proyectoestadiabackend.onrender.com/api/modules" ,{
        method: 'GET'
    });

    const data = await response.json();

    return data;
}

function showLoader() {
  document.getElementById('loader').style.display = 'flex';
  console.log("Se entró al loader");
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
  console.log("Se acabó el loader");
}

document.addEventListener("DOMContentLoaded", async () => {
    showLoader();
    // Obtiene todos los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);

    const userId = urlParams.get("userId");
    const permissions = urlParams.get("permissions");

    const sucursalesContainer = document.querySelector("main.sucursales-container");

    try {
        const modules = await getModules();

        for (const module of modules) {
            const moduleElement = document.createElement("div");
            moduleElement.classList.add("sucursal-card");
            const h2 = document.createElement("h2");
            const p = document.createElement("p");
            const a = document.createElement("a");
            a.classList.add("ver-btn");
            a.href = `sucursal.html?moduleId=${module.id}&userId=${userId}&moduleName=${module.name}&permissions=${permissions}`;
            a.textContent = "Ver trabajadores";

            h2.textContent = `Módulo: ${module.name}`;
            p.textContent = `Descripción: ${module.description || "Sin descripción"}`;
            moduleElement.appendChild(h2);
            moduleElement.appendChild(p);
            moduleElement.appendChild(a);
            sucursalesContainer.appendChild(moduleElement);
        }
    } catch (error) {
        console.error(error);
    } finally {
        hideLoader();
    }

    document.getElementById("btnAgregarSucursal").addEventListener("click", async () => {
        const { value: formValues } = await Swal.fire({
        title: "Agregar Nueva Sucursal",
        html: `
        <input id="swal-input1" class="swal2-input" placeholder="Nombre de la sucursal">
        <input id="swal-input2" class="swal2-input" placeholder="Descripción (opcional)">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Agregar",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
        const nombre = document.getElementById("swal-input1").value.trim();
        const descripcion = document.getElementById("swal-input2").value.trim();

        if (!nombre) {
            Swal.showValidationMessage("El nombre es obligatorio");
            return false;
        }

            return { name: nombre, description: descripcion };
        }
    });

    if (formValues) {
        try {
            showLoader();

            const response = await fetch("https://proyectoestadiabackend.onrender.com/api/modules", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formValues)
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire("¡Sucursal agregada!", "Se creó correctamente", "success").then(() => {
                    location.reload(); // Recargar para mostrar la nueva sucursal
                });
            } else {
                throw new Error(result.message || "No se pudo crear la sucursal");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Hubo un problema al crear la sucursal", "error");
        } finally {
            hideLoader();
        }
    }
    });
});