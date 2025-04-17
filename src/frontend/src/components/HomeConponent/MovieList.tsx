import React, { useState } from 'react';
import MovieItem from './MovieItem';
import { Movie } from '../../types/movie';
import { IconButton, InputBase, Paper, Collapse } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface MovieListProps {
  movies: Movie[];
  addComment: (movie: Movie, comment: string) => void;
}

const MovieList: React.FC<MovieListProps> = ({ movies, addComment }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchClick = () => {
    setExpanded(true);
  };

  const handleClearClick = () => {
    setSearchQuery('');
    setExpanded(false);
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Paper
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: expanded ? 300 : 'auto',
          mb: 2,
          transition: 'width 0.3s',
        }}
      >
        <IconButton sx={{ p: '10px' }} onClick={handleSearchClick}>
          <SearchIcon />
        </IconButton>
        <Collapse in={expanded} orientation="horizontal" sx={{ width: '100%' }}>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search movies by title"
            value={searchQuery}
            onChange={handleSearchChange}
            autoFocus={expanded}
          />
          {expanded && (
            <IconButton sx={{ p: '10px' }} onClick={handleClearClick}>
              <ClearIcon />
            </IconButton>
          )}
        </Collapse>
      </Paper>
      <div className="movie-container">
        {filteredMovies.map((movie) => (
          <MovieItem key={movie.title} movie={movie} addComment={addComment} />
        ))}
      </div>
    </>
  );
};

export default MovieList;
