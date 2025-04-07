import { ChangeEvent, FormEvent, useState } from "react";
import { Movie } from "../App";

export default function MovieItem(props: {
  movie: Movie
  addComment: (movie: Movie, comment: string) => void
}) {
  const [newComment, setNewComment] = useState("");
  function handleCommentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setNewComment(event.target.value);
  }
  function handleSubmit (event: FormEvent) {
    event.preventDefault()
    props.addComment(props.movie, newComment)
    setNewComment("")
  }
  const commentItems = props.movie.comments.map((comment, index) => {
    return (
      <li key={index}>
        {comment}
      </li>
    );
  })
  return (
    <div key={props.movie.title} className='movie-card'>
      <h2 className='movie-title'>{props.movie.title}</h2>
      <img
        src={props.movie.poster}
        alt={props.movie.title}
        height={300}
        width={200}
      />
      <p className='movie-overview'>{props.movie.overview}</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="comment">Comment:</label>
        <textarea
          name="comment"
          value={newComment}
          onChange={handleCommentChange}
        />
        <button type='submit'>Submit</button>
      </form>
      <ul>{commentItems}</ul>
    </div>
  );
}
