import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { Event } from './types';
import {categorizeEvents} from './utils';


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;


let events: Event[] = [];

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
app.post("/events", async (req: Request, res: Response) => {
      const event: Event = req.body;
      const category = categorizeEvents(event.title, event.notes);
      event.category = category;

      // Save the event to the database
      await eventsCollection.insertOne(event);
      res.status(201).json(event);
      events.push(event);
      res.status(201).json(event);
    });

    app.get("/events", (req: Request, res: Response) => {
      const sortedEvents = events.sort((a, b) => {
        const aTime = new Date(a.date).getTime();
        const bTime = new Date(b.date).getTime();
        if (isNaN(aTime) || isNaN(bTime)) {
          return 0; 
        }
        return aTime - bTime;
      });
      res.json(sortedEvents);
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
