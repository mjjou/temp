import React, { ChangeEvent, FormEvent, useState } from "react";
import { Movie } from "../../types/movie";

interface Props {
  movie: Movie;
  addComment: (movie: Movie, comment: string) => void;
}

const MovieItem: React.FC<Props> = ({ movie, addComment }) => {
  const [newComment, setNewComment] = useState("");

  const handleCommentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(event.target.value);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (newComment.trim() === "") return;
    addComment(movie, newComment.trim());
    setNewComment("");
  };

  return (
    <div className="movie-card">
      <h2 className="movie-title">{movie.title}</h2>
      <img src={movie.poster} alt={movie.title} height={300} width={200} />
      <p className="movie-overview">{movie.overview}</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="comment">Comment:</label>
        <textarea
          name="comment"
          value={newComment}
          onChange={handleCommentChange}
        />
        <button type="submit">Submit</button>
      </form>
      <ul>
        {movie.comments.map((comment, index) => (
          <li key={index}>{comment}</li>
        ))}
      </ul>
    </div>
  );
};

export default MovieItem;
