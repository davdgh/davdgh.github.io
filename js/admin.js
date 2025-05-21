async function getModules() {
    const response = await fetch("https://proyectoestadiabackend.onrender.com/api/modules" ,{
        method: 'GET'
    });

    const data = await response.json();

    return data;
}

document.addEventListener("DOMContentLoaded", async () => {
    // Obtiene todos los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);

    const userId = urlParams.get("userId");

    const sucursalesContainer = document.querySelector("main.sucursales-container");
    const modules = await getModules();

    for (const module of modules) {
        const moduleElement = document.createElement("div");
        moduleElement.classList.add("sucursal-card");
        const h2 = document.createElement("h2");
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.classList.add("ver-btn");
        a.href = `sucursal.html?moduleId=${module.id}&userId=${userId}&moduleName=${module.name}`;

        h2.textContent = `Módulo: ${module.name}`;
        p.textContent = `Descripción: ${module.description || "Sin descripción"}`;
        moduleElement.appendChild(h2);
        moduleElement.appendChild(p);
        moduleElement.appendChild(a);
        sucursalesContainer.appendChild(moduleElement);
    }
});