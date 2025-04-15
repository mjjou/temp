import React, { useState } from 'react';
import useMovies from './useMovies';
import MovieList from '../../components/HomeConponent/MovieList';
import { Movie } from '../../types/movie';

const Home: React.FC = () => {
  const { movies, loading, setMovies } = useMovies();
  const [limit, setLimit] = useState(9);

  const addComment = (movie: Movie, comment: string) => {
    const updatedMovies = movies.map((m) =>
      m.title === movie.title ? { ...m, comments: [...m.comments, comment] } : m
    );
    setMovies(updatedMovies);
  };

  if (loading) return <h1>Loading movies...</h1>;

  const limited = movies.slice(0, limit);

  return (
    <div>
      <h1>{movies.length} <span className="brand">Movies</span></h1>
      <MovieList movies={limited} addComment={addComment} />
      <button onClick={() => setLimit(limit + 9)}>Load More</button>
    </div>
  );
};

export default Home;
