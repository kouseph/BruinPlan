import mongoose from "mongoose";
import scrapeSubject from "./scrapeSubject.js";
import course from "../models/course.js"; 
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// These two lines recreate __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory (parent of scripts)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import connectDB from '../config/db.js';

await connectDB(); // Establish DB connection before running your script

(async function runAllSubjects() {
  await connectDB();

  for (let i = 61; i <= 187; i++) {
    try {
      const curr = await scrapeSubject(i);
      console.log(`Scraped subject index ${i}:`, curr.length, "courses");

      // Insert scraped courses into DB
      // Using insertMany for bulk insert, ignoring duplicates or you can handle differently
      if (curr && curr.length > 0) {
        await course.insertMany(curr, { ordered: false }).catch(err => {
          // catch duplicate or other insert errors without stopping the loop
          console.warn("Insert warning:", err.message);
        });
      }
    } catch (err) {
      console.error(`Error scraping subject index ${i}:`, err);
    }
  }

  // Close the DB connection when done
  await mongoose.connection.close();
  console.log("Done and DB connection closed.");
})();
