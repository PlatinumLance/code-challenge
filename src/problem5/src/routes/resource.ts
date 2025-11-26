import {Router, Request, Response} from "express";
import {createResource, getResourcesWithFilters, getResourceById, updateResource, deleteResource} from "../models/resource";

const router = Router()

// Create new resource
router.post("/", (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({error: "Name must not be empty"});
    }
    const resource = createResource({name, description});
    res.status(201).json(resource)
});

// Get list resource with option filters
router.get("/", (req: Request, res: Response) => {
    const { name, description, search } = req.query;

    const resources = getResourcesWithFilters({
        name: typeof name === "string" ? name : undefined,
        description: typeof description === "string" ? description : undefined,
        search: typeof search === "string" ? search : undefined
    });

    res.json(resources);
});

// Get resource by ID
router.get("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const resource = getResourceById(id);

    if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
    }

    // Send the resource if found
    res.json(resource);
});

// Update resource
router.put("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const {name, description} = req.body;
    const resource = updateResource(id, {name, description});
    if (!resource) {
        return res.status(404).json({error: "Resource not found"});
    }
    res.json(resource);
});

// Delete resource
router.delete("/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const result = deleteResource(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Resource not found" });
    }

    res.json({ message: "Resource deleted" });
});

export default router;