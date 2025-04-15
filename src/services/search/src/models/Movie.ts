import mongoose from 'mongoose';

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

export const Movie = mongoose.model('Movie', movieSchema);
