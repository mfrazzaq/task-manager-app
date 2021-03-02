const express = require('express');
const {User, isFieldValid} = require('../model/user');
const auth = require('../middleware/auth');
const router = new express.Router();
const sharp = require('sharp');
const sendEmail = require('../email/account')

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try{
        await user.save();
        sendEmail(user.name, user.email);
        token = await user.generateToken();
        res.status(201).send({user, token});
    }catch(e){
        res.status(400).send(e);
    }
});

router.get('/users', async (req, res) => {
    try{
        const users = await User.find({});
        if(!users){
            return res.statusCode(404).send("No record found");
        }
        res.send(users);
    }catch(e){
        res.status(500).send(e);
    }
});

router.get('/users/me',auth ,async (req, res) => {
    res.send(req.user);
});


router.get('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token !== req.token;
        });
        await req.user.save();
        res.send("Successfully logged out");
    }catch(e){
        res.status(500).send();
    }
});

router.get('/users/logoutall', auth, async (req, res) => {
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send("Successfully logged out");
    }catch(e){
        res.status(500).send();
    }
});



router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;
    try{
        const user = await User.findById({_id});
        if(!user){
            return res.statusCode(400).send("No record found");
        }
        res.send(user);
    }catch(e){
        res.status(500).send(e);
    }
});

router.patch('/users/me', auth, async (req, res) => {
    if(!isFieldValid(req.body)){
        return res.status(400).send({error: "Please enter a correct json"});
    }
    try{
        const user = req.user;
        if(!user){
            res.status(404).send("No record found");
        }
        const keys = Object.keys(req.body);
        keys.forEach((key) => user[key] = req.body[key]);
        user.save();
        res.send(user);
    }catch(e){
        res.status(400).send(e);
    }
});


router.delete('/users/me',auth, async (req, res) => {
    try{
        req.user.remove();
        res.send(req.user);
    }catch(e){
        res.status(500).send();
    }
});

router.post('/user/login',async (req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateToken();
        res.send({user,token});
    }catch(e){
        res.status(400).send(e);
    }
});

const multer = require('multer');
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback){
        if(!file.originalname.match(/\.(png|jpg|jpeg|PNG|JPG|JPEG)$/)){
            callback(new Error("Please upload a png, jpg or jpeg file"));
        }
        callback(undefined, true);
    }
});

router.post('/users/me/avatar', auth ,upload.single('upload'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send(req.user);
}, (error, req, res, next) => {
    res.status(404).send({errorMessage: error.message});
});
router.delete('/users/me/avatar', auth, async (req, res) => {
    try{
        req.user.avatar = undefined;
        await req.user.save();
        res.send("Image deleted succesfully");
    }catch(e){
        res.status(500).send();
    }
});

router.get('/users/avatar/:id', async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            throw new Error();
        }
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    }catch(e){
        res.status(404).send();
    }
});

module.exports = router;