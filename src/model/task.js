const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
    description: {
        type: String,
        required:true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

const isFieldValidTask = (task) => {
    const field = ['completed', 'description'];
    const keys = Object.keys(task);
    const isValid = keys.every((key) => field.includes(key));
    return isValid;
}

module.exports = {Task, isFieldValidTask};
