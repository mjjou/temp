import React from 'react';
import MovieItem from './MovieItem';
import { Movie } from '../../types/movie';
interface MovieListProps {
  movies: Movie[];
  addComment: (movie: Movie, comment: string) => void;
}

const MovieList: React.FC<MovieListProps> = ({ movies, addComment }) => {
  return (
    <div className="movie-container">
      {movies.map((movie) => (
        <MovieItem key={movie.title} movie={movie} addComment={addComment} />
      ))}
    </div>
  );
};

export default MovieList;
