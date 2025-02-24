document.addEventListener('DOMContentLoaded', function () {
    // Botón para obtener pacientes
    document.getElementById('btnObtenerPacientes').addEventListener('click', function () {
        fetch('/pacientes')
            .then(response => response.json())
            .then(data => {
                const listaPacientes = document.getElementById('listaPacientes');
                listaPacientes.innerHTML = '<h4>Lista de Pacientes:</h4>';
                data.forEach(paciente => {
                    listaPacientes.innerHTML += `
                        <p>
                            ID: ${paciente.id}, Nombre: ${paciente.nombre}, Historial: ${paciente.historial}
                        </p>`;
                });
            })
            .catch(error => console.error('Error al obtener pacientes:', error));
    });

    // Botón para agregar un paciente
    document.getElementById('btnAgregarPaciente').addEventListener('click', function () {
        const nombre = prompt("Ingrese el nombre del paciente:");
        if (nombre === null) return;

        const historial = prompt("Ingrese el historial médico:");
        if (historial === null) return;

        const nuevoPaciente = { nombre, historial };

        fetch('/pacientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoPaciente)
        })
        .then(response => response.json())
        .then(data => {
            alert(`Paciente agregado con ID: ${data.id}`);
            document.getElementById('btnObtenerPacientes').click(); // Actualizar la lista
        })
        .catch(error => console.error('Error al agregar paciente:', error));
    });

    // Botón para editar un paciente
    document.getElementById('btnEditarPaciente').addEventListener('click', function () {
        const id = prompt("Ingrese el ID del paciente que desea editar:");
        if (id === null) return;

        fetch(`/pacientes/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Paciente no encontrado.");
                }
                return response.json();
            })
            .then(paciente => {
                const nuevoNombre = prompt("Ingrese el nuevo nombre del paciente:", paciente.nombre);
                if (nuevoNombre === null) return;

                const nuevoHistorial = prompt("Ingrese el nuevo historial médico:", paciente.historial);
                if (nuevoHistorial === null) return;

                return fetch(`/pacientes/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nombre: nuevoNombre, historial: nuevoHistorial })
                });
            })
            .then(response => {
                if (response.ok) {
                    alert("Paciente actualizado correctamente.");
                    document.getElementById('btnObtenerPacientes').click(); // Actualizar la lista
                } else {
                    alert("Error al actualizar el paciente.");
                }
            })
            .catch(error => {
                alert(error.message); // Mostrar advertencia si el ID no existe
            });
    });

    // Botón para borrar un paciente
    document.getElementById('btnBorrarPaciente').addEventListener('click', function () {
        const id = prompt("Ingrese el ID del paciente que desea borrar:");
        if (id === null) return;

        if (confirm("¿Estás seguro de que quieres borrar este paciente?")) {
            fetch(`/pacientes/${id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Paciente no encontrado.");
                    }
                    return fetch(`/pacientes/${id}`, {
                        method: 'DELETE'
                    });
                })
                .then(response => {
                    if (response.ok) {
                        alert("Paciente borrado correctamente.");
                        document.getElementById('btnObtenerPacientes').click(); // Actualizar la lista
                    } else {
                        alert("Error al borrar el paciente.");
                    }
                })
                .catch(error => {
                    alert(error.message); // Mostrar advertencia si el ID no existe
                });
        }
    });

    // Botón para obtener citas
    document.getElementById('btnObtenerCitas').addEventListener('click', function () {
        fetch('/citas')
            .then(response => response.json())
            .then(data => {
                const listaCitas = document.getElementById('listaCitas');
                listaCitas.innerHTML = '<h4>Lista de Citas:</h4>';
                data.forEach(cita => {
                    listaCitas.innerHTML += `
                        <p>
                            ID: ${cita.id}, Paciente: ${cita.nombre_paciente}, Fecha: ${cita.fecha_hora}, Motivo: ${cita.motivo}
                        </p>`;
                });
            })
            .catch(error => console.error('Error al obtener citas:', error));
    });

    // Botón para agregar una cita
    document.getElementById('btnAgregarCita').addEventListener('click', function () {
        const nombrePaciente = prompt("Ingrese el nombre del paciente:");
        if (nombrePaciente === null) return;

        const fechaHora = prompt("Ingrese la fecha y hora (YYYY-MM-DD HH:MM):");
        if (fechaHora === null) return;

        const motivo = prompt("Ingrese el motivo de la cita:");
        if (motivo === null) return;

        const nuevaCita = {
            nombre_paciente: nombrePaciente,
            fecha_hora: fechaHora,
            motivo: motivo
        };

        fetch('/citas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaCita)
        })
        .then(response => response.json())
        .then(data => {
            alert(`Cita agregada con ID: ${data.id}`);
            document.getElementById('btnObtenerCitas').click(); // Actualizar la lista
        })
        .catch(error => console.error('Error al agregar cita:', error));
    });

    // Botón para editar una cita
    document.getElementById('btnEditarCita').addEventListener('click', function () {
        const id = prompt("Ingrese el ID de la cita que desea editar:");
        if (id === null) return;

        fetch(`/citas/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Cita no encontrada.");
                }
                return response.json();
            })
            .then(cita => {
                const nuevoNombrePaciente = prompt("Ingrese el nuevo nombre del paciente:", cita.nombre_paciente);
                if (nuevoNombrePaciente === null) return;

                const nuevaFechaHora = prompt("Ingrese la nueva fecha y hora (YYYY-MM-DD HH:MM):", cita.fecha_hora);
                if (nuevaFechaHora === null) return;

                const nuevoMotivo = prompt("Ingrese el nuevo motivo de la cita:", cita.motivo);
                if (nuevoMotivo === null) return;

                return fetch(`/citas/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nombre_paciente: nuevoNombrePaciente,
                        fecha_hora: nuevaFechaHora,
                        motivo: nuevoMotivo
                    })
                });
            })
            .then(response => {
                if (response.ok) {
                    alert("Cita actualizada correctamente.");
                    document.getElementById('btnObtenerCitas').click(); // Actualizar la lista
                } else {
                    alert("Error al actualizar la cita.");
                }
            })
            .catch(error => {
                alert(error.message); // Mostrar advertencia si el ID no existe
            });
    });

    // Botón para borrar una cita
    document.getElementById('btnBorrarCita').addEventListener('click', function () {
        const id = prompt("Ingrese el ID de la cita que desea borrar:");
        if (id === null) return;

        if (confirm("¿Estás seguro de que quieres borrar esta cita?")) {
            fetch(`/citas/${id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Cita no encontrada.");
                    }
                    return fetch(`/citas/${id}`, {
                        method: 'DELETE'
                    });
                })
                .then(response => {
                    if (response.ok) {
                        alert("Cita borrada correctamente.");
                        document.getElementById('btnObtenerCitas').click(); // Actualizar la lista
                    } else {
                        alert("Error al borrar la cita.");
                    }
                })
                .catch(error => {
                    alert(error.message); // Mostrar advertencia si el ID no existe
                });
        }
    });

    // Botón para predecir diagnóstico
    document.getElementById('btnPredecirDiagnostico').addEventListener('click', function () {
        const sintomas = prompt("Ingrese los síntomas separados por comas (ej: 1,0,1,0,1):");
        if (sintomas === null) return;

        fetch('/diagnostico', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sintomas: sintomas.split(',').map(Number) })
        })
        .then(response => response.json())
        .then(data => {
            const resultadoDiagnostico = document.getElementById('resultadoDiagnostico');
            resultadoDiagnostico.innerHTML = `<h4>Diagnóstico:</h4><p>${data.diagnostico}</p>`;
        })
        .catch(error => {
            console.error('Error al predecir diagnóstico:', error);
            alert('Error al predecir diagnóstico. Verifica la consola para más detalles.');
        });
    });
});