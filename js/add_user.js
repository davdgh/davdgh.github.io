const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

document.addEventListener("DOMContentLoaded", () => {
    // Obtiene todos los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);

    // Obtiene el valor específico de 'moduleId'
    const moduleId = urlParams.get('moduleId');
    const userId = urlParams.get("userId");

    const btn_back = document.querySelector(".back-btn");

    btn_back.addEventListener("click", () => window.location.href = `sucursal.html?moduleId=${moduleId}&userId=${userId}`);

    const scheduleContainer = document.getElementById('scheduleContainer');

    // Generar inputs para cada día
    days.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.innerHTML = `
            <label>${day}:</label>
            <label style="color: gray;">
                Hora de entrada:
                <input type="time" name="entry-${day}" placeholder="Hora entrada">
            </label>
            <label style="color: gray;">
                Hora de salida:
                <input type="time" name="exit-${day}" placeholder="Hora salida">
            </label>
        `;
        scheduleContainer.appendChild(dayDiv);
    });

    document.getElementById('addUserForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData();

        // Datos simples
        formData.append('name', form.name.value);
        formData.append('role', form.role.value);
        formData.append('permissions', form.permissions.value);
        formData.append('code', form.code.value);
        formData.append('email', form.email.value);
        formData.append('password', form.password.value);
        formData.append('semanalSalary', parseFloat(form.semanalSalary.value));

        // Foto
        const photoFile = form.photo.files[0];
        if (photoFile) {
            formData.append('photo', photoFile);
        }

        const schedule = days.map(day => {
            const entry = form[`entry-${day}`]?.value || undefined;
            const exit = form[`exit-${day}`]?.value || undefined;
            return {
                dayName: day.toLowerCase(),
                entryHour: entry,
                exitHour: exit
            };
        });

        // Agregamos el horario como JSON dentro del FormData
        formData.append('schedule', JSON.stringify(schedule));

        let userId;

        try {
            const response = await fetch('https://proyectoestadiabackend.onrender.com/api/users', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Trabajador agregado correctamente.'
                });
                userId = result.user.id;
                form.reset();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || JSON.stringify(result.error) || 'Error al agregar trabajador.'
                });
                return;
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo conectar con el servidor.'
            });
            return;
        }

        try {
            const response = await fetch(`https://proyectoestadiabackend.onrender.com/api/modules/${moduleId}`, {
                method: 'GET'
            });
            const result = await response.json();
            console.log({ result, userId, employees: result.employees });
            result.employees.push(userId);
            const response2 = await fetch(`https://proyectoestadiabackend.onrender.com/api/modules/${moduleId}`,  {
                method: 'PUT',
                body: JSON.stringify(result),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result2 = await response2.json();
            if (!response2.ok) {
                console.log({ result2 })
            }
        } catch(error) {
            console.error({ error });
        }
    });
});