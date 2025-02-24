from flask import Flask, request, jsonify, render_template
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
from sklearn.linear_model import LogisticRegression
import numpy as np

app = Flask(__name__)

# Configuración de la base de datos (SQLite)
engine = create_engine('sqlite:///doctrack.db', echo=True)
Base = declarative_base()

# Definición de la tabla de pacientes
class Paciente(Base):
    __tablename__ = 'pacientes'
    id = Column(Integer, primary_key=True)
    nombre = Column(String)
    historial = Column(String)

# Definición de la tabla de citas
class Cita(Base):
    __tablename__ = 'citas'
    id = Column(Integer, primary_key=True)
    nombre_paciente = Column(String)
    fecha_hora = Column(DateTime)
    motivo = Column(String)

# Crear la base de datos y las tablas
Base.metadata.create_all(engine)

# Configurar la sesión para interactuar con la base de datos
Session = sessionmaker(bind=engine)
session = Session()

# Datos de ejemplo para entrenar el modelo de diagnóstico
X = np.array([
    [1, 1, 0, 0],  # Paciente 1
    [0, 1, 1, 0],  # Paciente 2
    [1, 0, 1, 1],  # Paciente 3
    [0, 0, 0, 0],  # Paciente 4
    [1, 1, 1, 1]   # Paciente 5
])
y = np.array([1, 1, 1, 0, 1])  # Diagnósticos

# Entrenar el modelo
modelo = LogisticRegression()
modelo.fit(X, y)

# Ruta para el dashboard
@app.route('/dashboard')
def dashboard():
    return render_template('Unidad3.html')

# Ruta para obtener pacientes
@app.route('/pacientes', methods=['GET'])
def obtener_pacientes():
    pacientes = session.query(Paciente).all()
    return jsonify([{'id': p.id, 'nombre': p.nombre, 'historial': p.historial} for p in pacientes])

# Ruta para obtener un paciente por ID
@app.route('/pacientes/<int:id>', methods=['GET'])
def obtener_paciente_por_id(id):
    paciente = session.query(Paciente).get(id)
    if paciente:
        return jsonify({
            'id': paciente.id,
            'nombre': paciente.nombre,
            'historial': paciente.historial
        }), 200
    else:
        return jsonify({'error': 'Paciente no encontrado'}), 404

# Ruta para agregar un paciente
@app.route('/pacientes', methods=['POST'])
def agregar_paciente():
    data = request.get_json()
    nuevo_paciente = Paciente(nombre=data['nombre'], historial=data['historial'])
    session.add(nuevo_paciente)
    session.commit()
    return jsonify({'id': nuevo_paciente.id}), 201

# Ruta para editar un paciente
@app.route('/pacientes/<int:id>', methods=['PUT'])
def editar_paciente(id):
    data = request.get_json()
    paciente = session.query(Paciente).get(id)
    if paciente:
        paciente.nombre = data.get('nombre', paciente.nombre)
        paciente.historial = data.get('historial', paciente.historial)
        session.commit()
        return jsonify({'mensaje': 'Paciente actualizado correctamente'}), 200
    else:
        return jsonify({'error': 'Paciente no encontrado'}), 404

# Ruta para borrar un paciente
@app.route('/pacientes/<int:id>', methods=['DELETE'])
def borrar_paciente(id):
    paciente = session.query(Paciente).get(id)
    if paciente:
        session.delete(paciente)
        session.commit()
        return jsonify({'mensaje': 'Paciente borrado correctamente'}), 200
    else:
        return jsonify({'error': 'Paciente no encontrado'}), 404

# Ruta para obtener citas
@app.route('/citas', methods=['GET'])
def obtener_citas():
    citas = session.query(Cita).all()
    return jsonify([{'id': c.id, 'nombre_paciente': c.nombre_paciente, 'fecha_hora': c.fecha_hora, 'motivo': c.motivo} for c in citas])

# Ruta para obtener una cita por ID
@app.route('/citas/<int:id>', methods=['GET'])
def obtener_cita_por_id(id):
    cita = session.query(Cita).get(id)
    if cita:
        return jsonify({
            'id': cita.id,
            'nombre_paciente': cita.nombre_paciente,
            'fecha_hora': cita.fecha_hora,
            'motivo': cita.motivo
        }), 200
    else:
        return jsonify({'error': 'Cita no encontrada'}), 404

# Ruta para agregar una cita
@app.route('/citas', methods=['POST'])
def agregar_cita():
    data = request.get_json()
    nueva_cita = Cita(
        nombre_paciente=data['nombre_paciente'],
        fecha_hora=datetime.strptime(data['fecha_hora'], '%Y-%m-%d %H:%M'),
        motivo=data['motivo']
    )
    session.add(nueva_cita)
    session.commit()
    return jsonify({'id': nueva_cita.id}), 201

# Ruta para editar una cita
@app.route('/citas/<int:id>', methods=['PUT'])
def editar_cita(id):
    data = request.get_json()
    cita = session.query(Cita).get(id)
    if cita:
        cita.nombre_paciente = data.get('nombre_paciente', cita.nombre_paciente)
        cita.fecha_hora = datetime.strptime(data.get('fecha_hora'), '%Y-%m-%d %H:%M')
        cita.motivo = data.get('motivo', cita.motivo)
        session.commit()
        return jsonify({'mensaje': 'Cita actualizada correctamente'}), 200
    else:
        return jsonify({'error': 'Cita no encontrada'}), 404

# Ruta para borrar una cita
@app.route('/citas/<int:id>', methods=['DELETE'])
def borrar_cita(id):
    cita = session.query(Cita).get(id)
    if cita:
        session.delete(cita)
        session.commit()
        return jsonify({'mensaje': 'Cita borrada correctamente'}), 200
    else:
        return jsonify({'error': 'Cita no encontrada'}), 404

# Ruta para predecir diagnóstico
@app.route('/diagnostico', methods=['POST'])
def predecir_diagnostico():
    data = request.get_json()
    sintomas = data['sintomas']

    # Validar que se ingresen exactamente 4 síntomas
    if len(sintomas) != 4:
        return jsonify({'error': 'Debes ingresar exactamente 4 síntomas (fiebre, tos, dificultad para respirar, dolor de garganta).'}), 400

    sintomas = np.array(sintomas).reshape(1, -1)
    diagnostico = modelo.predict(sintomas)[0]
    resultado = "Enfermo" if diagnostico == 1 else "Sano"
    return jsonify({'diagnostico': resultado}), 200

if __name__ == '__main__':
    app.run(debug=True)