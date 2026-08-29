import express from "express";
import { getSpaces, getSpaceById } from "../controllers/spaceController.js";

const router = express.Router();
router.get("/", getSpaces);
router.get("/:id", getSpaceById);

export default router;