import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Movie } from '../../types/movie';

export default function useMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function download() {
      setLoading(true);
      const response = await fetch('/9000plus.csv');
      const text = await response.text();
      const parsed = Papa.parse(text);
      const movies = parsed.data.map((row) => {
        const [release, title, overview, popularity, votes, rating, language, genre, poster] = row as string[];
        return {
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
        } as Movie;
      });
      const filtered = movies.filter((m) =>
        m.title && m.overview && m.release && m.popularity && m.votes && m.rating && m.language && m.genre && m.poster
      );
      setMovies(filtered);
      setLoading(false);
    }
    download();
  }, []);

  return { movies, loading, setMovies };
}
