import express from "express";
import cors from "cors";
import logger from "morgan";
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import streamRouter from "./modules/stream/stream.controler";
import contentRouter from "./modules/content/content.controler";

const app = express();
app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.set('views',path.join(__dirname, 'views'));

app.use('/content',contentRouter);
app.use('/stream',streamRouter)

const PORT = process.env.PORT || 8080;

app.listen(PORT,()=>{
    console.log('start ')
})