from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

tasks = []  # Store tasks in memory (cleared on refresh)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks)  # Send the list of tasks to the frontend

@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.json
    task = {"id": len(tasks) + 1, "text": data["text"], "completed": False}
    tasks.append(task)
    return jsonify({"message": "Task added", "task": task})

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def complete_task(task_id):
    for task in tasks:
        if task["id"] == task_id:
            task["completed"] = not task["completed"]
            return jsonify({"message": "Task updated", "task": task})
    return jsonify({"message": "Task not found"}), 404

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def remove_task(task_id):
    global tasks
    tasks = [task for task in tasks if task["id"] != task_id]
    return jsonify({"message": "Task removed"})

if __name__ == '__main__':
    app.run(debug=True)
