const express = require('express');
const auth = require("../middleware/auth");
const {Task, isFieldValidTask} = require('../model/task');
const router = new express.Router();

router.post('/task', auth ,async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try{
        await task.save();
        res.send(task);
    }catch(e){
        res.status(400).send(e);
    }
});
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};
    match.owner = req.user._id;
    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1].toString().toLowerCase() === 'desc'? -1 :1;
    }
    try{
        const tasks = await Task.find(match)
        .limit(parseInt(req.query.limit))
        .skip(parseInt(req.query.skip))
        .sort(sort);
        if(!tasks){
            return res.statusCode(400).send("No record found");
        }
        res.send(tasks);
    }catch(e){
        res.status(500).send(e);
    }
});

router.get('/tasks/:id', auth , async (req, res) => {
    const _id = req.params.id;
    try{
        const task = await Task.findOne({_id, owner: req.user._id});
        if(!task){
            return res.statusCode(400).send("No record found");
        }
        res.send(task);
    }catch(e){
        res.status(500).send("Internal Server Error");
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    if(!isFieldValidTask(req.body)){
        return res.status(400).send({error: "Please enter a correct json"});
    }
    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if(!task){
            return res.status(404).send("No record found");
        }
        const keys = Object.keys(req.body);
        keys.forEach((key) => task[key] = req.body[key]);
        await task.save();
        res.send(task);
    }catch(e){
        res.status(400).send(e);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try{
        const task = await Task.findOneAndDelete({_id: _id, owner: req.user._id});
        if(!task){
            return res.status(404).send({error: "No such record found"});
        }
        res.send(task);
    }catch(e){
        res.status(500).send();
    }
});


module.exports = router;