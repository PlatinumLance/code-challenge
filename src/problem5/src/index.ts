import express from "express";
import resourceRouter  from "./routes/resource";

const app = express();
app.use(express.json());

app.use("/resource", resourceRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));