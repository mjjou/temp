import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Movie } from '../../types/movie';
import useMovies from '../home/useMovies';
import { 
  Typography, 
  Card, 
  CardMedia, 
  CardContent, 
  Box, 
  Chip, 
  Rating, 
  Divider, 
  Paper,
  List,
  ListItem,
  ListItemText,
  Container
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LanguageIcon from '@mui/icons-material/Language';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const MovieDetails: React.FC = () => {
    const { title } = useParams<{ title: string }>();
    const { movies, loading } = useMovies();
    const [movie, setMovie] = useState<Movie | null>(null);

    useEffect(() => {
        const foundMovie = movies.find((movie) => movie.title === title);
        if (foundMovie) {
            setMovie(foundMovie);
        }
    }, [title, movies]);

    if (loading) {
        return <Typography variant="h5" sx={{ textAlign: 'center', my: 4 }}>Loading...</Typography>;
    }

    if (!movie) {
        return <Typography variant="h5" sx={{ textAlign: 'center', my: 4 }}>Movie not found</Typography>;
    }

    // Format release date
    const releaseDate = new Date(movie.release).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Extract genres from the genre string
    const genres = movie.genre.split(',').map(genre => genre.trim());

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, mb: 4, boxShadow: 3 }}>
                <CardMedia
                    component="img"
                    sx={{ 
                        width: { xs: '100%', md: 300 },
                        objectFit: 'contain',
                        maxHeight: { xs: 'auto', md: 'none' }
                    }}
                    image={movie.poster}
                    alt={movie.title}
                />
                <CardContent sx={{ flex: 1, p: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom style={{backgroundColor: 'white', color: 'black'}}>
                        {movie.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating 
                            value={movie.rating / 2} 
                            precision={0.1} 
                            readOnly 
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                            {movie.rating}/10 ({movie.votes} votes)
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {genres.map((genre, index) => (
                            <Chip key={index} label={genre} variant="outlined" size="small" />
                        ))}
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarMonthIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">{releaseDate}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LanguageIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">{movie.language.toUpperCase()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ThumbUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">Popularity: {Math.round(movie.popularity)}</Typography>
                        </Box>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>Overview</Typography>
                    <Typography variant="body1" paragraph>
                        {movie.overview}
                    </Typography>
                </CardContent>
            </Card>
            
            <Paper sx={{ p: 3, mt: 3, boxShadow: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Comments ({movie.comments.length})
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {movie.comments.length > 0 ? (
                    <List>
                        {movie.comments.map((comment, index) => (
                            <React.Fragment key={index}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText primary={comment} />
                                </ListItem>
                                {index < movie.comments.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        No comments yet. Be the first to comment!
                    </Typography>
                )}
            </Paper>
        </Container>
    );
};

export default MovieDetails;