function showLoader() {
    document.getElementById('loader').style.display = 'flex';
    console.log("Se entró al loader");
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
    console.log("Se acabó el loader");
}

function renderPayrollCards(data, container) {
    container.textContent = "";

    data.forEach(employee => {
        const card = document.createElement("div");
        card.classList.add("card-trabajador");

        const nombre = document.createElement("h3");
        nombre.textContent = employee.name;
        card.appendChild(nombre);

        const codigo = document.createElement("p");
        codigo.textContent = `Código: ${employee.code}`;
        card.appendChild(codigo);

        const listaDias = document.createElement("div");
        listaDias.classList.add("horario");
        listaDias.innerHTML = `<h4>Días trabajados:</h4>`;

        employee.results.forEach(dia => {
            const diaDiv = document.createElement("div");
            diaDiv.classList.add("dia");
            diaDiv.innerHTML = `
                <strong>${dia.dayName}</strong> - ${dia.date || ''} |
                Entrada: ${dia.realEntry || '-'} |
                Salida: ${dia.realExit || '-'} |
                Horas: ${dia.hours.toFixed(2)} |
                ${dia.observations ? `Observaciones: ${dia.observations} | ` : ""}
                Letra: ${dia.letter || '-'}
            `;

            if (!dia.realEntry && !dia.realExit) {
                const justificacionDiv = document.createElement("div");
                justificacionDiv.innerHTML = `
                <label>Justificar inasistencia:
                    <input type="text" name="justificacion-${dia.dayName}-${employee.code}" placeholder="Ej. FT">
                </label>
                `;
                diaDiv.appendChild(justificacionDiv);
            }

            if (dia.hours >= 11) {
                const extrasDiv = document.createElement("div");
                extrasDiv.innerHTML = `
                <label>
                    <input type="checkbox" name="horasExtras-${dia.dayName}-${employee.code}" data-horas="${dia.hours}"> ¿Pagar horas extras?
                </label>
                `;
                diaDiv.appendChild(extrasDiv);
            }

            listaDias.appendChild(diaDiv);
        });

        card.appendChild(listaDias);

        const gastosCXC = document.createElement("div");
        gastosCXC.classList.add("gastos-cxc");
        gastosCXC.innerHTML = `<h4>Gastos por CXC</h4>`;

        const btnAddGasto = document.createElement("button");
        btnAddGasto.textContent = "+ Agregar gasto";
        btnAddGasto.classList.add("edit-btn");
        btnAddGasto.addEventListener("click", () => {
            const gasto = document.createElement("div");
            gasto.innerHTML = `
                <input type="text" name="concepto" placeholder="Concepto">
                <input type="number" name="monto" placeholder="Monto a descontar" step="0.01">
            `;
            gastosCXC.appendChild(gasto);
        });

        gastosCXC.appendChild(btnAddGasto);
        card.appendChild(gastosCXC);

        const totales = document.createElement("div");
        totales.innerHTML = `
            <p><strong>Horas Totales:</strong> ${employee.totalHours.toFixed(2)}</p>
            <p><strong>Días efectivos trabajados:</strong> ${employee.effectiveDaysWorked}</p>
            <p><strong>Pago por hora:</strong> $${employee.pagoPorHora}</p>
            <p><strong>Pago diario:</strong> $${employee.pagoDiario}</p>
            <p><strong>Pago base:</strong> $${employee.pago.toFixed(2)}</p>
        `;
        card.appendChild(totales);
        container.appendChild(card);
    });

    const btnExportar = document.createElement("button");
    btnExportar.textContent = "Exportar a Excel";
    btnExportar.classList.add("excel-btn");
    document.querySelector("main").appendChild(btnExportar);
}

function exportPayrollToExcel(data, container) {
    const exportData = [];

    data.forEach(employee => {
        let firstRow = true;
        let totalExtras = 0;
        let totalGastos = 0;

        employee.results.forEach(dia => {
            const card = [...container.children].find(c => c.querySelector("h3").textContent === employee.name);
            const justInput = card.querySelector(`[name="justificacion-${dia.dayName}-${employee.code}"]`);
            const extrasChk = card.querySelector(`[name="horasExtras-${dia.dayName}-${employee.code}"]`);
            const justificacion = justInput ? justInput.value.trim() : '';
            const horasExtras = extrasChk && extrasChk.checked ? parseFloat(extrasChk.dataset.horas || 0) : 0;
            const extraPago = horasExtras * employee.pagoPorHora;

            totalExtras += extraPago;

            exportData.push({
                Nombre: firstRow ? employee.name : '',
                Código: firstRow ? employee.code : '',
                Fecha: dia.date || '',
                Día: dia.dayName,
                Entrada: dia.realEntry || '-',
                Salida: dia.realExit || '-',
                Horas: parseFloat(dia.hours.toFixed(2)),
                Observación: dia.observations,
                Letra: dia.letter || '-',
                Justificación: justificacion,
                "Horas Extras Pagadas": extraPago.toFixed(2)
            });

            firstRow = false;
        });

        const card = [...container.children].find(c => c.querySelector("h3").textContent === employee.name);
        const montoInputs = card.querySelectorAll('input[name="monto"]');
        montoInputs.forEach(input => {
            totalGastos += parseFloat(input.value || 0);
        });

        const pagoFinal = employee.pago + totalExtras - totalGastos;

        exportData.push({
            Nombre: employee.name,
            Código: employee.code,
            Fecha: 'TOTAL',
            "Pago Base": employee.pago.toFixed(2),
            "Total Gastos": totalGastos.toFixed(2),
            "Horas Extras Pagadas": totalExtras.toFixed(2),
            "Pago Final": pagoFinal.toFixed(2)
            });
        });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nomina Detallada");
    XLSX.writeFile(workbook, "nomina_detallada.xlsx");
}

document.addEventListener("click", async () => {
    // Obtiene todos los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);

    // Obtiene el valor específico de 'moduleId'
    const moduleId = urlParams.get('moduleId');
    const userId = urlParams.get("userId");
    const moduleName = urlParams.get("moduleName");
    const permissions = urlParams.get("permissions");

    const container = document.querySelector(".nomina");
    const btnAsistencia = document.querySelector(".btn-asist");

    btnAsistencia.addEventListener("click", async () => {
        const inputFile = document.getElementById("asistencia");
        const formData = new FormData();
        const asistencia = inputFile.files[0];

        if (!asistencia || asistencia.type !== "text/plain") {
            Swal.fire({
                title: "Error",
                text: !asistencia ? "Por favor selecciones un archivo" : "Por favor, selecciona un archivo de texto (.txt) con la asistencia",
                icon: "error"
            });
            return;
        }

        formData.append("assistance", asistencia);

        showLoader();

        try {
            const response = await fetch(`https://proyectoestadiabackend.onrender.com/api/modules/${moduleId}/payroll?userId=${userId}&permissions=${permissions}`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            hideLoader();

            if (!response.ok) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al obtener los datos de la nómina'
                });
                return;
            }

            renderPayrollCards(data, container);

            const btnExcel = document.querySelector(".excel-btn");
            btnExcel.addEventListener("click", () => exportPayrollToExcel(data, container));
        } catch(error) {
            console.error(error);
            Swal.fire({
                title: "Error",
                text: "Ocurrió un error al procesar la asistencia",
                icon: "error"
            });
        } finally {
            hideLoader();
        }
    });
});