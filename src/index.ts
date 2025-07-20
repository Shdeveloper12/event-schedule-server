import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { Event } from './types';
import { categorizeEvents } from './utils';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dgti16b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a new MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db("eventScheduler");
    const eventsCollection = database.collection<Event>("events");
    await client.connect();
    console.log("Connected to MongoDB!");

    app.post("/events", async (req: Request, res: Response) => {
      try {
        const event: Event = req.body;
        const category = categorizeEvents(event.title, event.notes);
        event.category = category;

        // Save the event to the database
        const result = await eventsCollection.insertOne(event);
        res.status(201).json({ ...event, _id: result.insertedId });
      } catch (error) {
        res.status(500).json({ message: "Error creating event", error });
      }
    });

    app.get("/events", async (req: Request, res: Response) => {
      try {
        // Fetch events from database and sort by date
        const sortedEvents = await eventsCollection.find().sort({ date: 1 }).toArray();
        res.json(sortedEvents);
      } catch (error) {
        res.status(500).json({ message: "Error fetching events", error });
      }
    });

    app.put('/events/:id', async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const result = await eventsCollection.updateOne(
          { id: id },
          { $set: { archived: true } }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Event not found" });
        }
        
        const updatedEvent = await eventsCollection.findOne({ id: id });
        res.status(200).json(updatedEvent);
      } catch (error) {
        res.status(500).json({ message: "Error updating event", error });
      }
    });

    app.delete('/events/:id', async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const result = await eventsCollection.deleteOne({ id: id });
        
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Event not found" });
        }
        
        res.status(200).json({ message: "Event deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: "Error deleting event", error });
      }
    });

    app.get("/", (req: Request, res: Response) => {
      res.send("Event Scheduler Server Running");
    });
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
  } catch (err) {
    console.log("MongoDB connection error:", err);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
