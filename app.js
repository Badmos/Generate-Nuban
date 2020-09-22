const express = require('express');
const { json } = require('body-parser');

require("dotenv").config();

const { nubanRouter } = require('./route/route');
const { errorHandler } = require('./middleware/middlewares');


const app = express();

app.use(json())
app.use(nubanRouter);
app.use(errorHandler);

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`Started!!! listening on ${PORT}`);
});