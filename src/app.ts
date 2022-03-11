import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
const port = 3000;
const host = "127.0.0.1";
const app = express();

app.use(cors());

app.get("/api/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    message: "certificate verified succesfully",
  });
});

app.listen(port, host, () => {
  console.log("im listening");
});
