import React, { ChangeEvent, FormEvent, useState } from "react";
import { Movie } from "../../types/movie";
import { styled } from '@mui/material/styles';
import { Link } from "react-router-dom";
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Rating from '@mui/material/Rating';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface Props {
  movie: Movie;
  addComment: (movie: Movie, comment: string) => void;
}

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

export const truncateWords = (str: string, n: number): string => {
  if (!str) return "";
  const words = str.trim().split(/\s+/);
  if (words.length <= n) return str;
  return words.slice(0, n).join(" ") + "…";
};

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
    <Link to={`/movie/${movie.title}`} style={{ textDecoration: 'none' }}>
      <Card sx={{ width: 300, height: 750, display: 'flex', flexDirection: 'column' }} >
        <CardHeader
          sx={{ 
            height: 100, 
            overflow: 'hidden',
            '& .MuiCardHeader-content': {
              overflow: 'hidden'
            },
            '& .MuiCardHeader-title': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }
          }}
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
          title={movie.title}
          subheader={
            <div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {movie.release.getFullYear()} - <Rating name="read-only" value={3.5} precision={0.5} readOnly />
              </div>
              <p style={{ margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.genre}</p>
            </div>
          }
        />
        <CardMedia
          component="img"
          height="400"
          image={movie.poster}
          alt={movie.title}
        />
        <CardContent sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {truncateWords(movie.overview, 20)}
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <IconButton aria-label="add to favorites">
            <FavoriteIcon />
          </IconButton>
          <IconButton aria-label="share">
            <ShareIcon />
          </IconButton>
        </CardActions>
      </Card>
    </Link>
  );
};

export default MovieItem;
