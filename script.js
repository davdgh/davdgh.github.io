//import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
  const espacios = document.querySelectorAll('.lugar');

  espacios.forEach(espacio => {
    espacio.addEventListener('click', () => {
      const id = espacio.getAttribute('id').substring(5);
      const estado = espacio.getAttribute('estado') === 'vacío' ? 'vacío' : 'ocupado';
      const data = {
        estado
      }

      fetch(`http://localhost:3000/api/espacios/${id}`, {
        method: 'PUT',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Origin': 'http://localhost:3000'
        },
        body: JSON.stringify(data),
        mode: 'cors'
      })
      .then(response => {
        if (!response.ok) {
            throw new Error('Error en la actualización');
        }
        return response.json();
      })
      .then(updatedSpace => {
        console.log('Espacio actualizado:', updatedSpace);
        espacio.classList.toggle('ocupado');
        Swal.fire({
          title: 'Espacio actualizado',
          text: 'El espacio ha sido actualizado correctamente',
          icon: 'success'
        });
      })
      .catch(error => {
        console.error('Hubo un problema con la solicitud:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema con la solicitud',
          icon: 'error'
        });
      });
    });
  });
})