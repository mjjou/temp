import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';
const csvFilePath = path.join(__dirname, '../data/9000plus.csv');

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const movieSchema = new mongoose.Schema({
  title: String,
  overview: String,
  releaseDate: String,
  popularity: Number,
  voteCount: Number,
  voteAverage: Number,
  originalLanguage: String,
  genre: [String],
  posterUrl: String
});
const Movie = mongoose.model('Movie', movieSchema);
const parseNumber = (value: string, fallback = 0): number => {
  const num = parseFloat(value);
  return isNaN(num) ? fallback : num;
};

const parseIntSafe = (value: string, fallback = 0): number => {
  const num = parseInt(value);
  return isNaN(num) ? fallback : num;
};
const movies: any[] = [];

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    const genreArray = row.Genre
      ? row.Genre.split(',').map((g: string) => g.trim())
      : [];

    movies.push({
      title: row.Title,
      overview: row.Overview,
      releaseDate: row.Release_Date,
      popularity: parseNumber(row.Popularity),
      voteCount: parseIntSafe(row.Vote_Count),
      voteAverage: parseNumber(row.Vote_Average),
      originalLanguage: row.Original_Language,
      genre: genreArray,
      posterUrl: row.Poster_Url
    });
  })
  .on('end', async () => {
    try {
      const result = await Movie.insertMany(movies);
      console.log(`✅ Imported ${result.length} movies`);
      process.exit(0);
    } catch (err) {
      console.error('Insert failed:', err);
      process.exit(1);
    }
  });
