async function getModules() {
  const response = await fetch("https://proyectoestadiabackend.onrender.com/api/modules");
  const data = await response.json();
  return data;
}

function showLoader() {
  document.getElementById('loader').style.display = 'flex';
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
}

document.addEventListener("DOMContentLoaded", async () => {
  showLoader();

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("userId");
  const permissions = urlParams.get("permissions");
  const sucursalesContainer = document.querySelector("main.sucursales-container");

  try {
    const modules = await getModules();

    for (const module of modules) {
      const moduleElement = document.createElement("div");
      moduleElement.classList.add("sucursal-card");

      const img = document.createElement("img");
      img.src = module.logo || "../img/default.png";

      const h2 = document.createElement("h2");
      h2.textContent = `Módulo: ${module.name}`;

      const p = document.createElement("p");
      p.textContent = `Descripción: ${module.description || "Sin descripción"}`;

      const viewBtn = document.createElement("a");
      viewBtn.classList.add("ver-btn");
      viewBtn.href = `sucursal.html?moduleId=${module.id}&userId=${userId}&moduleName=${module.name}&permissions=${permissions}`;
      viewBtn.textContent = "Ver trabajadores";

      const editBtn = document.createElement("button");
      editBtn.classList.add("editar-btn");
      editBtn.textContent = "Editar módulo";
      editBtn.onclick = () => editarModulo(module);

      moduleElement.appendChild(img);
      moduleElement.appendChild(h2);
      moduleElement.appendChild(p);
      moduleElement.appendChild(viewBtn);
      moduleElement.appendChild(editBtn);
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
        <input type="file" accept="image/*" id="swal-input3" class="swal2-input">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Agregar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const nombre = document.getElementById("swal-input1").value.trim();
        const descripcion = document.getElementById("swal-input2").value.trim();
        const image = document.getElementById("swal-input3").files[0];

        if (!nombre) {
          Swal.showValidationMessage("El nombre es obligatorio");
          return false;
        }

        return { name: nombre, description: descripcion, image: image };
      }
    });

    if (formValues) {
      try {
        showLoader();
        const formData = new FormData();
        formData.append("name", formValues.name);
        formData.append("description", formValues.description);
        if ((image = formValues.image)) {
            formData.append("photo", image);
        }
        const response = await fetch("https://proyectoestadiabackend.onrender.com/api/modules", {
          method: "POST",
          body: formData
        });

        const result = await response.json();

        if (response.ok) {
          Swal.fire("¡Sucursal agregada!", "Se creó correctamente", "success").then(() => {
            location.reload();
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

async function editarModulo(module) {
  const { value: formValues } = await Swal.fire({
    title: "Editar Módulo",
    html: `
        <input id="swal-edit-nombre" class="swal2-input" placeholder="Nombre" value="${module.name}">
        <input id="swal-edit-desc" class="swal2-input" placeholder="Descripción" value="${module.description || ""}">
        <input type="file" accept="image/*" id="swal-edit-img" class="swal2-input">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const nombre = document.getElementById("swal-edit-nombre").value.trim();
      const descripcion = document.getElementById("swal-edit-desc").value.trim();
      const image = document.getElementById("swal-edit-img").files[0];

      if (!nombre) {
        Swal.showValidationMessage("El nombre es obligatorio");
        return false;
      }

      return { name: nombre, description: descripcion, image: image };
    }
  });

  if (formValues) {
    try {
      showLoader();
      const formData = new FormData();
      formData.append("name", formValues.name);
      formData.append("description", formValues.description);
      if ((image = formValues.image)) {
        formData.append("photo", image);
      }
      const response = await fetch(`https://proyectoestadiabackend.onrender.com/api/modules/${module.id}`, {
        method: "PUT",
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire("¡Actualizado!", "El módulo fue actualizado correctamente", "success").then(() => {
          location.reload();
        });
      } else {
        throw new Error(result.message || "No se pudo actualizar el módulo");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Hubo un problema al actualizar el módulo", "error");
    } finally {
      hideLoader();
    }
  }
}
