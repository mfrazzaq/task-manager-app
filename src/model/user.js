const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../model/task').Task;
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(value.length < 6){
                throw new Error("Length of the password should be greater or equal to 6");
            } else if(value.toLowerCase().includes('password')){
                throw new Error("You should not use \"Password\" as a password");
            }
        }

    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid");
            }
        }
    },
    age: {
        type : Number,
        default: 0,
        validate(value){
            
            if(value < 0){
                throw new Error("Please enter a valid value");
            }
        }
    },
    avatar: {
        type: Buffer
    },
    tokens: [{
        type: String,
        required: true
    }],
    
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});


userSchema.methods.generateToken = async function() {
    const user = this;
    const token = jwt.sign({id: user._id.toString()}, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat(token);
    await user.save();
    return token;
}

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}



userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email});
    if(!user){
        return new Error("Unable to login");
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if(!isMatch){
        return new Error("Unable to login");
    }
    return user;
}


userSchema.pre('save', async function (next) {
    const user = this;
    if(user.isModified('password')){
        user.password = await bcryptjs.hash(user.password, 8);
    }
    next();
});

userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({owner: user._id});
    next();
});

const User = mongoose.model("User", userSchema);

const isFieldValid = (user) => {
    const field = ['age', 'email', 'password', 'name'];
    const keys = Object.keys(user);
    const isValid = keys.every((key) => field.includes(key));
    return isValid;
}

module.exports = {User, isFieldValid};