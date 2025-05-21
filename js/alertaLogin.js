document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('correo').value.trim();
  const password = document.getElementById('contraseña').value.trim();

  if (!email || !password) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos vacíos',
      text: 'Por favor completa todos los campos.'
    });
    return;
  }

  try {
    const response = await fetch('https://proyectoestadiabackend.onrender.com/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Inicio de sesión exitoso',
        text: `Bienvenido, ${data.name || 'usuario'}`
      }).then(() => {
        // Puedes guardar token si viene en la respuesta: localStorage.setItem('token', data.token);
        // Redirigir según el tipo de usuario:
        if (data.permissions === 'admin') {
          window.location.href = `./html/admin.html?userId=${data.id}`;
        } else {
          window.location.href = `./html/perfil.html?userId=${data.id}`; // o la vista correspondiente
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error de inicio de sesión',
        text: data.message || data.error || 'Correo o contraseña incorrectos.'
      });
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error de conexión',
      text: 'No se pudo conectar con el servidor. Intenta más tarde.'
    });
  }
});
