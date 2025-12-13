import { Router } from "express";
import { SearchRequest } from "./movies.types";

const router = Router();

router.get('/search', async (req: SearchRequest, res) => {
    try {

    } catch(err) {
        res.status(400).send(err)
    }
})