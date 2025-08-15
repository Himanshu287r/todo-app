const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files (your frontend HTML/CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Task schema
const taskSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date, default: null },
    priority: { type: String, default: null },
    dateAdded: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

// API routes
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ error: 'Bad request' });
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ error: 'Bad request' });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve the frontend (index.html) for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));