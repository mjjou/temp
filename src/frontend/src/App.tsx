import React, { useEffect, useState } from 'react';
import ExampleComponent from './components/ExampleComponent';
import Papa from 'papaparse'
import MovieItem from './components/MovieItem';
import './style.css'

export interface Movie {
  title: string;
  overview: string;
  release: Date;
  popularity: number;
  votes: number;
  rating: number;
  language: string;
  genre: string;
  poster: string;
  comments: string[];
}

function App() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(9);
  useEffect(() => {
    async function download () {
      setLoading(true)
      const response = await fetch('/9000plus.csv')
      const text = await response.text()
      const parsed = Papa.parse(text)
      const movies = parsed.data.map((row) => {
        const [release, title, overview, popularity, votes, rating, language, genre, poster] = row as string[]
        const movie: Movie = {
          title,
          overview,
          release: new Date(release),
          popularity: Number(popularity),
          votes: Number(votes),
          rating: Number(rating),
          language,
          genre,
          poster,
          comments: []
        }
        return movie
      })
      const filtered = movies.filter((movie) => {
        return movie.title && movie.overview && movie.release && movie.popularity && movie.votes && movie.rating && movie.language && movie.genre && movie.poster
      })
      setMovies(filtered)
      setLoading(false)
    }
    download()
  }, [])

  if (loading) {
    return <h1>Loading movies...</h1>
  }

  const limited = movies.slice(0, limit)

  function addComment (movie: Movie, newComment: string) {
    console.log('addComment', movie, newComment)
    const newMovies = movies.map((m) => {
      if (m.title === movie.title) {
        return {
          ...m,
          comments: [...m.comments, newComment]
        }
      }
      return m
    })
    setMovies(newMovies)
  }

  const items = limited.map(movie => {
    return (
      <MovieItem key={movie.title} movie={movie} addComment={addComment} />
    )
  })

  function handleMore () {
    setLimit(limit + 9)
  }

  return (
    <div>
      <h1>{movies.length} <span className='brand'>Movies</span></h1>
      <div className='movie-container'>
        {items}
      </div>
      <button onClick={handleMore}>Load More</button>
    </div>
  );
}

export default App;
