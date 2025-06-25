import axios from 'axios';
import { TMDB_API_KEY } from '@env';

const TMDB_API_KEY_FALLBACK = 'YOUR_TMDB_API_KEY'; 
const API_KEY = TMDB_API_KEY || TMDB_API_KEY_FALLBACK;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

console.log('TMDB API KEY:', API_KEY);

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const searchMovies = async (
  searchTerm: string,
  page: number = 1
): Promise<any> => {
  try {
    const response = await tmdbClient.get('/search/movie', {
      params: {
        query: searchTerm,
        page,
      },
    });
    
    return {
      Search: response.data.results.map((movie: any) => ({
        imdbID: movie.id.toString(), 
        Title: movie.title,
        Year: movie.release_date?.substring(0, 4) || 'N/A',
        Poster: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'N/A',
        Type: 'movie',
      })),
      totalResults: response.data.total_results.toString(),
      Response: 'True',
    };
  } catch (error) {
    console.error('Error searching movies:', error);
    return {
      Search: [],
      totalResults: '0',
      Response: 'False',
      Error: 'Failed to search movies',
    };
  }
};

export const getMovieById = async (
  tmdbId: string
): Promise<any> => {
  try {
    const response = await tmdbClient.get(`/movie/${tmdbId}`);
    const movie = response.data;
    
    const [creditsRes, imagesRes, videosRes] = await Promise.all([
      tmdbClient.get(`/movie/${tmdbId}/credits`),
      tmdbClient.get(`/movie/${tmdbId}/images`),
      tmdbClient.get(`/movie/${tmdbId}/videos`),
    ]);
    
    return {
      imdbID: movie.imdb_id || movie.id.toString(),
      Title: movie.title,
      Year: movie.release_date?.substring(0, 4) || 'N/A',
      Rated: movie.adult ? 'R' : 'PG-13',
      Released: movie.release_date,
      Runtime: movie.runtime ? `${movie.runtime} min` : 'N/A',
      Genre: movie.genres?.map((g: any) => g.name).join(', ') || 'N/A',
      Director: creditsRes.data.crew
        ?.find((person: any) => person.job === 'Director')?.name || 'N/A',
      Writer: creditsRes.data.crew
        ?.filter((person: any) => person.department === 'Writing')
        .slice(0, 3)
        .map((person: any) => person.name)
        .join(', ') || 'N/A',
      Actors: creditsRes.data.cast
        ?.slice(0, 4)
        .map((actor: any) => actor.name)
        .join(', ') || 'N/A',
      Plot: movie.overview || 'No plot available.',
      Language: movie.original_language || 'N/A',
      Country: movie.production_countries
        ?.map((c: any) => c.name)
        .join(', ') || 'N/A',
      Awards: 'N/A', 
      Ratings: [
        {
          Source: 'TMDb',
          Value: `${movie.vote_average?.toFixed(1)}/10`,
        },
        {
          Source: 'TMDb Votes',
          Value: movie.vote_count?.toString() || 'N/A',
        },
      ],
      Metascore: 'N/A',
      imdbRating: movie.vote_average?.toFixed(1) || 'N/A',
      imdbVotes: movie.vote_count?.toLocaleString() || 'N/A',
      DVD: 'N/A',
      BoxOffice: 'N/A',
      Production: movie.production_companies
        ?.map((c: any) => c.name)
        .join(', ') || 'N/A',
      Website: movie.homepage || 'N/A',
      Response: 'True',
      Poster: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'N/A',
      Backdrop: movie.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : null,
      tmdbId: movie.id,
      trailer: videosRes.data.results
        ?.find((video: any) => video.type === 'Trailer' && video.site === 'YouTube')?.key,
    };
  } catch (error) {
    console.error('Error getting movie details:', error);
    return {
      Response: 'False',
      Error: 'Failed to fetch movie details',
    };
  }
};

export const getPopularMovies = async (
  page: number = 1
): Promise<any> => {
  try {
    const response = await tmdbClient.get('/movie/popular', {
      params: {
        page,
      },
    });
    
    return {
      Search: response.data.results.map((movie: any) => ({
        imdbID: movie.id.toString(),
        Title: movie.title,
        Year: movie.release_date?.substring(0, 4) || 'N/A',
        Poster: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'N/A',
        Type: 'movie',
      })),
      totalResults: response.data.total_results.toString(),
      Response: 'True',
    };
  } catch (error) {
    console.error('Error getting popular movies:', error);
    return {
      Search: [],
      totalResults: '0',
      Response: 'False',
      Error: 'Failed to fetch popular movies',
    };
  }
};

export const getNowPlayingMovies = async (
  page: number = 1
): Promise<any> => {
  try {
    const response = await tmdbClient.get('/movie/now_playing', {
      params: {
        page,
      },
    });
    
    return {
      Search: response.data.results.map((movie: any) => ({
        imdbID: movie.id.toString(),
        Title: movie.title,
        Year: movie.release_date?.substring(0, 4) || 'N/A',
        Poster: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'N/A',
        Type: 'movie',
      })),
      totalResults: response.data.total_results.toString(),
      Response: 'True',
    };
  } catch (error) {
    console.error('Error getting now playing movies:', error);
    return {
      Search: [],
      totalResults: '0',
      Response: 'False',
      Error: 'Failed to fetch now playing movies',
    };
  }
};

export const getUpcomingMovies = async (
  page: number = 1
): Promise<any> => {
  try {
    const response = await tmdbClient.get('/movie/upcoming', {
      params: {
        page,
      },
    });
    
    return {
      Search: response.data.results.map((movie: any) => ({
        imdbID: movie.id.toString(),
        Title: movie.title,
        Year: movie.release_date?.substring(0, 4) || 'N/A',
        Poster: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'N/A',
        Type: 'movie',
      })),
      totalResults: response.data.total_results.toString(),
      Response: 'True',
    };
  } catch (error) {
    console.error('Error getting upcoming movies:', error);
    return {
      Search: [],
      totalResults: '0',
      Response: 'False',
      Error: 'Failed to fetch upcoming movies',
    };
  }
};

export const getTopRatedMovies = async (
  page: number = 1
): Promise<any> => {
  try {
    const response = await tmdbClient.get('/movie/top_rated', {
      params: {
        page,
      },
    });
    
    return {
      Search: response.data.results.map((movie: any) => ({
        imdbID: movie.id.toString(),
        Title: movie.title,
        Year: movie.release_date?.substring(0, 4) || 'N/A',
        Poster: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'N/A',
        Type: 'movie',
      })),
      totalResults: response.data.total_results.toString(),
      Response: 'True',
    };
  } catch (error) {
    console.error('Error getting top rated movies:', error);
    return {
      Search: [],
      totalResults: '0',
      Response: 'False',
      Error: 'Failed to fetch top rated movies',
    };
  }
};

export const getMoviesByGenre = async (
  genreId: number,
  page: number = 1
): Promise<any> => {
  try {
    const response = await tmdbClient.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page,
        sort_by: 'popularity.desc',
      },
    });
    
    return {
      Search: response.data.results.map((movie: any) => ({
        imdbID: movie.id.toString(),
        Title: movie.title,
        Year: movie.release_date?.substring(0, 4) || 'N/A',
        Poster: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'N/A',
        Type: 'movie',
      })),
      totalResults: response.data.total_results.toString(),
      Response: 'True',
    };
  } catch (error) {
    console.error('Error getting movies by genre:', error);
    return {
      Search: [],
      totalResults: '0',
      Response: 'False',
      Error: 'Failed to fetch movies by genre',
    };
  }
};

export const getTrendingMovies = async (
  timeWindow: 'day' | 'week' = 'week',
  page: number = 1
): Promise<any> => {
  try {
    const response = await tmdbClient.get(`/trending/movie/${timeWindow}`, {
      params: {
        page,
      },
    });
    
    return {
      Search: response.data.results.map((movie: any) => ({
        imdbID: movie.id.toString(),
        Title: movie.title,
        Year: movie.release_date?.substring(0, 4) || 'N/A',
        Poster: movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'N/A',
        Type: 'movie',
      })),
      totalResults: response.data.total_results.toString(),
      Response: 'True',
    };
  } catch (error) {
    console.error('Error getting trending movies:', error);
    return {
      Search: [],
      totalResults: '0',
      Response: 'False',
      Error: 'Failed to fetch trending movies',
    };
  }
};

export const getStreamingUrl = (tmdbId: string): string => {
  return `https://vidsrc.icu/embed/movie/${tmdbId}`;
};

export const getStreamingSources = (tmdbId: string, imdbId?: string) => {
  const sources = [
    // Primary sources - most reliable
    `https://vidsrc.icu/embed/movie/${tmdbId}`,
    `https://vidsrc.to/embed/movie/${tmdbId}`,
    
    // Alternative sources
    `https://www.2embed.cc/embed/${tmdbId}`,
    `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    
    // Backup sources
    `https://embedplus.net/movie/${tmdbId}`,
    `https://streamwish.com/e/${tmdbId}`,
    
    // Additional sources
    `https://vidsrc.xyz/embed/movie/${tmdbId}`,
    `https://vidsrc.me/embed/movie/${tmdbId}`,
  ].filter(Boolean) as string[];
  
  return sources;
};

export const getGenres = async (): Promise<any[]> => {
  try {
    const response = await tmdbClient.get('/genre/movie/list');
    return response.data.genres;
  } catch (error) {
    console.error('Error getting genres:', error);
    return [];
  }
};

export const getMovieWithStreamingInfo = async (tmdbId: string) => {
  try {
    const movieData = await getMovieById(tmdbId);
    const imdbId = movieData.imdbID; // Keep the 'tt' prefix
    
    return {
      ...movieData,
      streamingSources: getStreamingSources(tmdbId, imdbId),
      tmdbId,
      imdbId,
    };
  } catch (error) {
    console.error('Error getting movie with streaming info:', error);
    return null;
  }
};