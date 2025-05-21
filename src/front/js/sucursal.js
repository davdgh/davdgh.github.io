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

document.addEventListener("DOMContentLoaded", async () => {
    // Obtiene todos los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);

    // Obtiene el valor específico de 'moduleId'
    const moduleId = urlParams.get('moduleId');
    const userId = urlParams.get("userId");
    const moduleName = urlParams.get("moduleName");

    document.querySelector("h1").textContent = moduleName;

    const btn_back = document.querySelector(".back-btn");

    btn_back.addEventListener("click", () => window.location.href=`admin.html?userId=${userId}`);

    const btn_adduser = document.querySelector(".add-user");

    btn_adduser.addEventListener("click", () => window.location.href=`add_user.html?moduleId=${moduleId}&userId=${userId}`);

    const listaTrabajadores = document.querySelector("main.trabajadores-container");

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
        cardTrabajador.appendChild(img);
        const info = document.createElement("div");
        info.classList.add("info");
        info.innerHTML += `
            <label>
            Nombre
                <input type="text" placeholder="Nombre completo" value="${employee.name}">
            </label>
            <label>
                Correo
                <input type="email" placeholder="Correo" value="${employee.email}">
            </label>
            <label>
                Código
                <input type="number" placeholder="Código" value="${employee.code || "Sin código"}">
            </label>
            <label>
                Estado
                <select>
                    <option value="true" selected>Activo</option>
                    <option value="false">Inactivo</option>
                </select>
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
                <span>${horarioDia.dayName}</span><input type="time" value="${horarioDia.entryHour}"><input type="time" value="${horarioDia.exitHour}">
            `;
            horario.appendChild(divDia);
        }
        info.appendChild(horario);
        const btnEditar = document.createElement("button");
        btnEditar.classList.add("edit-btn");
        btnEditar.textContent = "Editar";
        info.appendChild(btnEditar);
        cardTrabajador.appendChild(info);
        listaTrabajadores.appendChild(cardTrabajador);
    }
});