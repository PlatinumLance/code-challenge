import db from "../models/db";

interface Resource {
    id?: number;
    name: string;
    description: string;
}

export default Resource

export const createResource = (resource: Resource) => {
    const insert = db.prepare("INSERT INTO resources (name, description) VALUES (?, ?)");
    const info = insert.run(resource.name, resource.description);
    return {id: info.lastInsertRowid, ...resource}
};

export const getResources = () => {
    return db.prepare("SELECT * FROM resources").all();
}

export const getResourceById = (id: number) => {
    return db.prepare("SELECT * FROM resources WHERE id = ?").get(id);
};

export const updateResource = (id: number, resource: Partial<Resource>) => {
    const update = db.prepare("UPDATE resources SET name = ?, description = ? WHERE id = ?");
    update.run(resource.name, resource.description, id);
    return getResourceById(id);
};

export const deleteResource = (id: number)=> {
    return db.prepare("DELETE FROM resources WHERE id = ?").run(id);
}