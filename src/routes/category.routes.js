import { Router } from "express";
import { getCategories, getCategoriesById } from "../controllers/category.controller.js";


const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategoriesById)


export default router;
