import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ACTIVITIES_FILE = path.join(__dirname, "activities.json");
const BINGO_FILE = path.join(__dirname, "bingo.json");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/bingo", (req, res) => {
    try {
      if (!fs.existsSync(BINGO_FILE)) {
        fs.writeFileSync(BINGO_FILE, JSON.stringify([], null, 2));
      }
      const data = fs.readFileSync(BINGO_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Failed to read bingo" });
    }
  });

  app.put("/api/bingo", (req, res) => {
    try {
      fs.writeFileSync(BINGO_FILE, JSON.stringify(req.body, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update bingo" });
    }
  });

  app.get("/api/activities", (req, res) => {
    try {
      const data = fs.readFileSync(ACTIVITIES_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Failed to read activities" });
    }
  });

  app.post("/api/activities", (req, res) => {
    try {
      const data = fs.readFileSync(ACTIVITIES_FILE, "utf-8");
      const activities = JSON.parse(data);
      const newActivity = { ...req.body, id: Date.now().toString() };
      activities.push(newActivity);
      fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(activities, null, 2));
      res.json(newActivity);
    } catch (error) {
      res.status(500).json({ error: "Failed to save activity" });
    }
  });

  app.put("/api/activities/:id", (req, res) => {
    try {
      const data = fs.readFileSync(ACTIVITIES_FILE, "utf-8");
      let activities = JSON.parse(data);
      activities = activities.map((a: any) => a.id === req.params.id ? { ...req.body, id: req.params.id } : a);
      fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(activities, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update activity" });
    }
  });

  app.delete("/api/activities/:id", (req, res) => {
    try {
      const data = fs.readFileSync(ACTIVITIES_FILE, "utf-8");
      let activities = JSON.parse(data);
      activities = activities.filter((a: any) => a.id !== req.params.id);
      fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(activities, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete activity" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
