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

        const toggleBtn = document.createElement("button");
        toggleBtn.classList.add("toggle-info");
        toggleBtn.textContent = "Mostrar detalles";
        toggleBtn.addEventListener("click", () => {
            const card = toggleBtn.closest('.card-trabajador');
            const divInfo = card.querySelector(".div-nomina");

            divInfo.classList.toggle("collapsed");

            if (divInfo.classList.contains('collapsed')) {
                toggleBtn.textContent = 'Mostrar información';
            } else {
                toggleBtn.textContent = 'Ocultar información';
            }
        });
        card.appendChild(toggleBtn);

        const divTabla = document.createElement("div");
        divTabla.classList.add("div-nomina", "collapsed");
        
        const tabla = document.createElement("table");
        tabla.classList.add("tabla-nomina");

        tabla.innerHTML = `
            <thead>
                <tr>
                    <th>Día</th>
                    <th>Fecha</th>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Horas</th>
                    <th>Observaciones</th>
                    <th>Letra</th>
                    <th>Justificación</th>
                    <th>Horas extras</th>
                    <th>Descuento (concepto/monto)</th>
                    <th>Pago extra (concepto/monto)</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = tabla.querySelector("tbody");

        employee.results.forEach(dia => {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${dia.dayName}</td>
                <td>${dia.date || '-'}</td>
                <td>${dia.realEntry || '-'}</td>
                <td>${dia.realExit || '-'}</td>
                <td>${dia.hours.toFixed(2)}</td>
                <td>${dia.observations || '-'}</td>
                <td>${dia.letter || '-'}</td>
                <td>
                    <input type="text" name="justificacion-${dia.dayName}-${employee.code}" placeholder="Ej. FT">
                </td>
                <td>
                    ${(dia.hours >= 10) ? `
                        <label>
                            <input type="checkbox" name="horasExtras-${dia.dayName}-${employee.code}" data-horas="${dia.hours}">
                            Pagar
                        </label>
                    ` : '-'}
                </td>
                <td>
                    <input type="text" name="descConcepto-${dia.dayName}-${employee.code}" placeholder="Concepto">
                    <input type="number" name="descMonto-${dia.dayName}-${employee.code}" placeholder="$" step="0.01">
                </td>
                <td>
                    <input type="text" name="pagoExtraConcepto-${dia.dayName}-${employee.code}" placeholder="Concepto">
                    <input type="number" name="pagoExtraMonto-${dia.dayName}-${employee.code}" placeholder="$" step="0.01">
                </td>
            `;

            tbody.appendChild(fila);
        });

        divTabla.appendChild(tabla);
        card.appendChild(divTabla);

        const totales = document.createElement("div");
        totales.classList.add("resumen-pago");
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

        let pagoFinal = 0;
        let totalDescuentos = 0;
        let totalExtras = 0;
        let totalHorasExtras = 0;

        employee.results.forEach(dia => {
            const info = getEmployeePayrollInfo(container, dia, employee);

            totalDescuentos += info.discountAmount;
            totalExtras += info.extraPayAmount;
            pagoFinal += info.pagoDia;
            totalHorasExtras += info.extraPago;

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
                Justificación: info.justificacion,
                "Descripción de descuento": info.discountDescription,
                "Monto del descuento": info.discountAmount,
                "Descripción del pago extra": info.extraPayDescription,
                "Monto del pago extra": info.extraPayAmount,
                "Pago del día": info.pagoDia
            });

            firstRow = false;
        });

        const diasRetardados = Math.floor(employee.totalR2R3 / 3);
        const descuentoRetardos = employee.pagoDiario * diasRetardados;
        pagoFinal -= descuentoRetardos;

        exportData.push({
            Nombre: employee.name,
            Código: employee.code,
            Fecha: 'TOTAL',
            "Pago semanal": parseFloat(employee.semanalSalary.toFixed(2)),
            "Descuento por retardos": parseFloat(descuentoRetardos.toFixed(2)),
            "Total de descuentos": parseFloat(totalDescuentos.toFixed(2)),
            "Total de extras": parseFloat(totalExtras.toFixed(2)),
            "Horas Extras Pagadas": parseFloat(totalHorasExtras.toFixed(2)),
            "Pago Final": parseFloat(pagoFinal.toFixed(2))
        });
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nomina Detallada");
    XLSX.writeFile(workbook, "nomina_detallada.xlsx");
}

function getEmployeePayrollInfo(container, dia, employee) {
    const card = [...container.children].find(c => c.querySelector("h3").textContent === employee.name);
    const justInput = card.querySelector(`[name="justificacion-${dia.dayName}-${employee.code}"]`);
    const discountDescription = card.querySelector(`[name="descConcepto-${dia.dayName}-${employee.code}"]`).value;
    const discountAmount = parseFloat(card.querySelector(`[name="descMonto-${dia.dayName}-${employee.code}"]`).value || "0");
    const extraPayDescription = card.querySelector(`[name="pagoExtraConcepto-${dia.dayName}-${employee.code}"]`).value;
    const extraPayAmount = parseFloat(card.querySelector(`[name="pagoExtraMonto-${dia.dayName}-${employee.code}"]`).value || "0");
    const extrasChk = card.querySelector(`[name="horasExtras-${dia.dayName}-${employee.code}"]`);
    const justificacion = justInput ? justInput.value.trim() : "";
    const horasExtras = extrasChk && extrasChk.checked ? Math.max(0, parseInt(extrasChk.dataset.horas || 0) - 9) : 0;
    const extraPago = horasExtras * employee.pagoPorHora;

    let pagoDia = extraPago + extraPayAmount - discountAmount;

    console.log({ empleado: employee.name, justificacion, dia: dia.dayName, trabajado: dia.fullWorked ? "Sí" : "No" });
    console.log(`Soy el empleado: ${employee.name} y mi pago inicial es: ${pagoDia}`);

    if (justificacion || dia.fullWorked) {
        console.log(`Soy el empleado: ${employee.name} y me pagaron completo el día: ${dia.dayName}`);
        pagoDia += employee.pagoDiario;
    } else if (dia.hours > 0 && dia.hours < 9) {
        console.log(`Soy el empleado: ${employee.name} y me pagaron por horas el día: ${dia.dayName} y trabajé: ${dia.hours}`);
        pagoDia += employee.pagoPorHora * Math.floor(dia.hours);
    }

    return { discountDescription, discountAmount, extraPayDescription, extraPayAmount, justificacion, extraPago, pagoDia };
}

function calculatePayroll(data, container) {
    data.forEach(employee => {
        employee.results.forEach(dia => {
            const payrollInfo = getEmployeePayrollInfo(container, dia, employee);
            const pagoBase = employee.pago;
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
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