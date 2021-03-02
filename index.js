const express = require('express');
require('./src/db/mongoose');

const userRoute = require('./src/routes/user.js');
const taskRoute = require('./src/routes/task');
const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use(userRoute);
app.use(taskRoute);
app.listen(port, () =>{
    console.log('App is running at port ' + port);
});