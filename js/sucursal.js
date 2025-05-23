async function getEmployees(moduleId) {
    const response = await fetch(`https://proyectoestadiabackend.onrender.com/api/modules/${moduleId}`, {
        method: 'GET',
    });

    const data = await response.json();

    return data.employees;
}

async function getEmployee(userId) {
    const response = await fetch(`https://proyectoestadiabackend.onrender.com/api/users/${userId}`, {
        method: 'GET',
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

async function ActualizarUsuario(e) {
    e.preventDefault();
    showLoader();
    const btn = e.target;

    // Obtiene todos los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);

    // Obtiene el valor específico de 'moduleId'
    const moduleId = urlParams.get('moduleId');
    const userId = urlParams.get("userId");
    const moduleName = urlParams.get("moduleName");

    const days = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
    const formData = new FormData();

    const form = btn.closest(".card-trabajador");

    const idEmployee = form.querySelector('[name="id"]').value;

    formData.append("email", form.querySelector('[name="email"]').value || undefined);
    formData.append("code", form.querySelector('[name="code"]').value || undefined);
    //formData.append("active", form.querySelector('[name="active"]').value === "true");
    formData.append("semanalSalary", parseFloat(form.querySelector('[name="semanalSalary"]').value) || undefined);

    const schedule = days.map(day => {
        const entry = form.querySelector(`[name="entry-${day}"]`).value || undefined;
        const exit = form.querySelector(`[name="exit-${day}"]`).value || undefined;
        return {
            dayName: day.toLowerCase(),
            entryHour: entry,
            exitHour: exit
        }
    });

    formData.append("schedule", JSON.stringify(schedule));

    const inputPhoto = form.querySelector('[name="photo"]');
    const photo = inputPhoto.files[0];
    if (photo) {
        formData.append("photo", photo);
    }

    try {
        const response = await fetch(`https://proyectoestadiabackend.onrender.com/api/users/${idEmployee}`, {
            method: 'PUT',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            hideLoader();
            await Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Trabajador actualizado correctamente.'
            });
            window.location.href = `sucursal.html?moduleId=${moduleId}&userId=${userId}&moduleName=${moduleName}`;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message || JSON.stringify(result.error) || 'Error al agregar trabajador.'
            });
        }

    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al actualizar el usuario'
        })
    } finally {
        hideLoader();
    }

}

document.addEventListener("DOMContentLoaded", async () => {
    showLoader();

    // Obtiene todos los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);

    // Obtiene el valor específico de 'moduleId'
    const moduleId = urlParams.get('moduleId');
    const userId = urlParams.get("userId");
    const moduleName = urlParams.get("moduleName");
    const permissions = urlParams.get("permissions");

    document.querySelector("h1").textContent = moduleName;

    const btn_back = document.querySelector(".back-btn");

    btn_back.addEventListener("click", () => window.location.href=`admin.html?userId=${userId}`);

    const btn_adduser = document.querySelector(".add-user");

    btn_adduser.addEventListener("click", () => window.location.href=`add_user.html?moduleId=${moduleId}&userId=${userId}`);

    const listaTrabajadores = document.querySelector("main.trabajadores-container");

    try {
        const employeesIds = await getEmployees(moduleId);
    
        let employees = [];
    
        for (const employeeId of employeesIds) {
            const employee = await getEmployee(employeeId);
            employees.push(employee);
        }
    
        for (const employee of employees) {
            const cardTrabajador = document.createElement("div");
            cardTrabajador.classList.add("card-trabajador");

            const img = document.createElement("img");
            img.alt = `Foto de ${employee.name}`;
            img.classList.add("foto-trabajador");
            img.src = employee.photo;

            const nombre = document.createElement("h3");
            nombre.classList.add("nombre-trabajador");
            nombre.textContent = employee.name;

            // Botón de toggle
            const toggleBtn = document.createElement("button");
            toggleBtn.classList.add("toggle-info");
            toggleBtn.textContent = "Mostrar detalles";

            // Contenedor de la info colapsable
            const info = document.createElement("div");
            info.classList.add("info", "collapsed"); // <- inicia colapsado

            info.innerHTML += `
                <input type="hidden" value="${employee.id}" name="id">
                <label>
                    Correo
                    <input type="email" value="${employee.email}" name="email">
                </label>
                <label>
                    Código
                    <input type="text" value="${employee.code || "Sin código"}" name="code">
                </label>
                <label>
                    Estado
                    <select name="active">
                        <option value="true" selected>Activo</option>
                        <option value="false">Inactivo</option>
                    </select>
                </label>
                <label>
                    Salario semanal
                    <input type="number" value="${employee.semanalSalary}" name="semanalSalary">
                </label>
            `;

            const horario = document.createElement("div");
            horario.classList.add("horario");
            const h4 = document.createElement("h4");
            h4.textContent = "Horario";
            horario.appendChild(h4);

            for (const horarioDia of employee.schedule) {
                const divDia = document.createElement("div");
                divDia.classList.add("dia");
                divDia.innerHTML = `
                    <span>${horarioDia.dayName}</span>
                    <input type="time" value="${horarioDia.entryHour}" name="entry-${horarioDia.dayName}">
                    <input type="time" value="${horarioDia.exitHour}" name="exit-${horarioDia.dayName}">
                `;
                horario.appendChild(divDia);
            }

            info.appendChild(horario);

            const inputImg = document.createElement("label");
            inputImg.innerHTML = `
                Seleccionar nueva foto
                <input type="file" accept="image/*" name="photo" />
            `;
            info.appendChild(inputImg)

            const btnEditar = document.createElement("button");
            btnEditar.classList.add("edit-btn");
            btnEditar.textContent = "Editar";
            btnEditar.addEventListener("click", ActualizarUsuario);
            info.appendChild(btnEditar);

            toggleBtn.addEventListener("click", () => {
                const card = toggleBtn.closest('.card-trabajador');
                const info = card.querySelector('.info');
                
                info.classList.toggle('collapsed');

                // Cambiar el texto del botón opcionalmente
                if (info.classList.contains('collapsed')) {
                    toggleBtn.textContent = 'Mostrar información';
                } else {
                    toggleBtn.textContent = 'Ocultar información';
                }
            });

            cardTrabajador.appendChild(img);
            cardTrabajador.appendChild(nombre);
            cardTrabajador.appendChild(info);
            cardTrabajador.appendChild(toggleBtn);
            listaTrabajadores.appendChild(cardTrabajador);

        }
    } catch(error) {
        console.log({ error });
    } finally {
        hideLoader();
    }

    const btnCalcularNomina = document.querySelector('.calc-nom');

    btnCalcularNomina.addEventListener('click', () => window.location.href = `calcNom.html?userId=${userId}&moduleName=${moduleName}&permissions=${permissions}&moduleId=${moduleId}`);
});
