import json
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from pymongo import MongoClient
from bson.json_util import dumps as bson_dumps

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["test_db"]
collection = db["canciones"]

# Fetch all songs from the collection and store them in the canciones list
canciones = list(collection.find({}))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/canciones', methods=['GET'])
def get_canciones():
    return bson_dumps(canciones)

@app.route('/canciones/pila', methods=['POST'])
def add_cancion_pila():
    cancion = {
        "name": request.form['name'],
        "author": request.form['author'],
        "duration": request.form['duration'],
        "genre": request.form['genre'],
        "added_in": "pila"
    }
    global canciones
    canciones = [cancion] + canciones

    print("Estado actual de canciones (Pila):")
    print(json.dumps(canciones, indent=4))

    return jsonify(cancion), 201

@app.route('/canciones/cola', methods=['POST'])
def add_cancion_cola():
    cancion = {
        "name": request.form['name'],
        "author": request.form['author'],
        "duration": request.form['duration'],
        "genre": request.form['genre'],
        "added_in": "cola"
    }
    global canciones
    canciones.append(cancion)

    print("Estado actual de canciones (Cola):")
    print(json.dumps(canciones, indent=4))

    return jsonify(cancion), 201

@app.route('/canciones/<int:index>', methods=['DELETE'])
def delete_cancion(index):
    if index < 0 or index >= len(canciones):
        return jsonify({"error": "Index out of range"}), 400

    # Check if there are any songs added in pila or cola
    has_added_songs = any('added_in' in cancion for cancion in canciones)

    if 'added_in' not in canciones[index] and has_added_songs:
        return jsonify({"error": "Cannot delete initial songs while there are songs added in pila or cola"}), 400

    deleted_cancion = canciones.pop(index)

    print("Canción eliminada:")
    print(json.dumps(deleted_cancion, indent=4))
    print("Estado actual de canciones:")
    print(json.dumps(canciones, indent=4))

    return jsonify(deleted_cancion), 200

@app.route('/canciones/<int:index>', methods=['PUT'])
def update_cancion(index):
    print(f"Intentando actualizar la canción en el índice: {index}")  # Debug

    if index < 0 or index >= len(canciones):
        return jsonify({"error": "Index out of range"}), 400

    cancion = request.get_json()
    canciones[index] = cancion
    print("Canción actualizada:", json.dumps(canciones[index], indent=4))

    return jsonify(cancion), 200

@app.route('/guardar', methods=['POST'])
def guardar_canciones():
    new_collection = db["v2_canciones"]
    if canciones:
        new_collection.insert_many(canciones)
        print("Canciones insertadas")
        print(bson_dumps(canciones, indent=4)) # Debugging
    return jsonify({"message": "Canciones guardadas en la base de datos"}), 200

if __name__ == '__main__':
    app.run(debug=True)