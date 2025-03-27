import "reflect-metadata";  // This import must be first!
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";

(async () => {
  dotenv.config();
  
  try {
    console.log("Database connection established");
    
    const app = express();

    
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(fileUpload({ createParentPath: true }));

    app.get("/ping", (_req, res) => {
      res.send("pong");
    });

  } catch (error) {
  }
})();
