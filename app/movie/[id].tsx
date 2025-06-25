// app/movie/[id].tsx
import { useEffect, useState, useContext } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Share, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Button, Chip, Divider, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { getMovieById } from '../../src/services/api';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { ThemeContext } from '../_layout';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import VideoPlayer from '../../src/components/VideoPlayer';

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { dimensions } = useContext(ThemeContext);
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  
  // Adjust poster height for different screen sizes
  const posterHeight = dimensions.height * 0.65;
  
  useEffect(() => {
    if (id) {
      fetchMovieDetails(id);
    }
  }, [id]);
  
  const fetchMovieDetails = async (movieId: string) => {
    try {
      setLoading(true);
      const data = await getMovieById(movieId);
      if (data.Response === 'True') {
        setMovie(data);
      } else {
        setError(data.Error || 'Failed to fetch movie details');
      }
    } catch (error) {
      setError('An error occurred while fetching movie details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleFavorite = () => {
    setFavorite(!favorite);
    // TODO: Implement actual favorites functionality with AsyncStorage
  };
  
  const shareMovie = async () => {
    if (movie) {
      try {
        await Share.share({
          message: `Check out this movie: ${movie.Title} (${movie.Year}) - TMDb Rating: ${movie.imdbRating}/10`,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };
  
  const playMovie = () => {
    console.log('Play movie clicked for:', movie.Title);
    console.log('TMDB ID:', movie.tmdbId);
    console.log('IMDB ID:', movie.imdbID);
    setShowVideoPlayer(true);
  };
  
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text 
          style={{ 
            marginTop: 16, 
            color: theme.colors.onSurface,
            fontFamily: 'Poppins-Regular'
          }}
        >
          Loading movie details...
        </Text>
      </View>
    );
  }
  
  if (error || !movie) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text 
          style={{ 
            color: theme.colors.error,
            fontFamily: 'Poppins-Medium',
            marginBottom: 12,
            textAlign: 'center'
          }}
        >
          {error || 'Movie not found'}
        </Text>
        <Button 
          mode="contained" 
          onPress={() => router.back()} 
          style={styles.button}
          icon="arrow-left"
          buttonColor={theme.colors.primary}
          labelStyle={{ fontFamily: 'Poppins-Medium' }}
        >
          Go Back
        </Button>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Full-size poster with overlay */}
        <View style={styles.posterContainer}>
          <Animated.Image 
            source={{
              uri: movie.Backdrop || (movie.Poster !== 'N/A'
                ? movie.Poster
                : 'https://via.placeholder.com/600x900?text=No+Poster'),
            }}
            style={[styles.posterImage, { height: posterHeight }]}
            resizeMode="cover"
            entering={ZoomIn.duration(600)}
          />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', theme.colors.background]}
            style={[styles.posterGradient, { height: posterHeight }]}
          />
          
          {/* Play button overlay */}
          <TouchableOpacity 
            style={styles.playButtonOverlay}
            onPress={playMovie}
          >
            <Animated.View 
              entering={FadeIn.delay(800)}
              style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
            >
              <Ionicons name="play" size={48} color="white" style={{ marginLeft: 4 }} />
            </Animated.View>
          </TouchableOpacity>
        </View>
        
        {/* Navigation and action buttons */}
        <SafeAreaView edges={['top']} style={styles.navContainer}>
          <View style={styles.navButtons}>
            <Animated.View entering={FadeIn.duration(800)}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            </Animated.View>
            
            <View style={styles.rightButtons}>
              <Animated.View entering={FadeIn.duration(800).delay(100)}>
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                  onPress={shareMovie}
                >
                  <Ionicons name="share-outline" size={24} color="white" />
                </TouchableOpacity>
              </Animated.View>
              
              <Animated.View entering={FadeIn.duration(800).delay(200)}>
                <TouchableOpacity
                  style={[
                    styles.iconButton, 
                    { backgroundColor: favorite ? theme.colors.primary : 'rgba(0,0,0,0.5)' }
                  ]}
                  onPress={toggleFavorite}
                >
                  <Ionicons name={favorite ? "heart" : "heart-outline"} size={24} color="white" />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </SafeAreaView>
        
        {/* Movie details */}
        <View style={styles.detailsContainer}>
          <Animated.View entering={FadeInUp.duration(700)}>
            <Text 
              variant="headlineMedium" 
              style={[
                styles.title, 
                { 
                  color: theme.colors.onSurface,
                  fontFamily: 'Poppins-Bold'
                }
              ]}
            >
              {movie.Title}
            </Text>
            
            <View style={styles.metaContainer}>
              <Text 
                variant="titleMedium" 
                style={[
                  styles.year, 
                  { 
                    color: theme.colors.onSurface,
                    fontFamily: 'Poppins-Medium',
                    opacity: 0.8
                  }
                ]}
              >
                {movie.Year}
              </Text>
              
              <View style={styles.dot} />
              
              <Text 
                variant="titleMedium" 
                style={[
                  styles.year, 
                  { 
                    color: theme.colors.onSurface,
                    fontFamily: 'Poppins-Medium',
                    opacity: 0.8
                  }
                ]}
              >
                {movie.Runtime}
              </Text>
              
              <View style={styles.dot} />
              
              <Text 
                variant="titleMedium" 
                style={[
                  styles.year, 
                  { 
                    color: theme.colors.onSurface,
                    fontFamily: 'Poppins-Medium',
                    opacity: 0.8
                  }
                ]}
              >
                {movie.Rated}
              </Text>
            </View>
            
            {movie.imdbRating !== "N/A" && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={20} color="#FFD700" style={{ marginRight: 4 }} />
                <Text 
                  style={{ 
                    color: 'white', 
                    fontFamily: 'Poppins-Bold',
                    fontSize: 16
                  }}
                >
                  {movie.imdbRating}/10
                </Text>
              </View>
            )}
          </Animated.View>
          
          <View style={styles.genreContainer}>
            {movie.Genre.split(', ').map((genre:any, index:any) => (
              <Animated.View key={genre} entering={FadeIn.delay(300 + index * 100)}>
                <Chip 
                  style={[
                    styles.genreChip,
                    {
                      backgroundColor: theme.dark 
                        ? `${theme.colors.primary}20` 
                        : `${theme.colors.primary}15`
                    }
                  ]} 
                  textStyle={{ 
                    color: theme.colors.primary,
                    fontFamily: 'Poppins-Medium'
                  }}
                >
                  {genre}
                </Chip>
              </Animated.View>
            ))}
          </View>
          
          {/* Watch Now Button */}
          <Animated.View entering={FadeInUp.delay(350).duration(500)}>
            <Button
              mode="contained"
              onPress={playMovie}
              style={[styles.watchButton, { backgroundColor: theme.colors.primary }]}
              icon="play"
              labelStyle={{ fontFamily: 'Poppins-Medium', fontSize: 16 }}
            >
              Watch Now
            </Button>
          </Animated.View>
          
          <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
          
          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <Text 
              variant="titleMedium" 
              style={[
                styles.sectionTitle, 
                { 
                  color: theme.colors.onSurface,
                  fontFamily: 'Poppins-Bold'
                }
              ]}
            >
              Plot
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[
                styles.plot, 
                { 
                  color: theme.colors.onSurface,
                  fontFamily: 'Poppins-Regular'
                }
              ]}
            >
              {movie.Plot}
            </Text>
          </Animated.View>
          
          <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
          
          <Animated.View entering={FadeInUp.delay(300).duration(500)}>
            <Text 
              variant="titleMedium" 
              style={[
                styles.sectionTitle, 
                { 
                  color: theme.colors.onSurface,
                  fontFamily: 'Poppins-Bold'
                }
              ]}
            >
              Cast & Crew
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[
                styles.infoText, 
                { 
                  color: theme.colors.onSurface,
                  fontFamily: 'Poppins-Regular'
                }
              ]}
            >
              <Text style={[styles.labelText, { color: theme.colors.primary }]}>Director: </Text>
              {movie.Director}
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[
                styles.infoText, 
                { 
                  color: theme.colors.onSurface,
                  fontFamily: 'Poppins-Regular'
                }
              ]}
            >
              <Text style={[styles.labelText, { color: theme.colors.primary }]}>Writer: </Text>
              {movie.Writer}
            </Text>
            <Text 
              variant="bodyMedium" 
              style={[
                styles.infoText, 
                { 
                  color: theme.colors.onSurface,
                  fontFamily: 'Poppins-Regular'
                }
              ]}
            >
              <Text style={[styles.labelText, { color: theme.colors.primary }]}>Actors: </Text>
              {movie.Actors}
            </Text>
          </Animated.View>
          
          <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
          
          <Animated.View entering={FadeInUp.delay(400).duration(500)}>
            <Text 
              variant="titleMedium" 
              style={[
                styles.sectionTitle, 
                { 
                  color: theme.colors.onSurface,
                  fontFamily: 'Poppins-Bold'
                }
              ]}
            >
              Ratings
            </Text>
            <View style={styles.ratingsContainer}>
              {movie.Ratings.map((rating:any, index:any) => (
                <Animated.View 
                  key={rating.Source} 
                  entering={FadeInUp.delay(500 + index * 100)}
                  style={[
                    styles.ratingItem, 
                    { 
                      backgroundColor: theme.colors.surface,
                      borderColor: `${theme.colors.primary}30`,
                      borderWidth: 1
                    }
                  ]}
                >
                  <Text 
                    variant="bodyMedium" 
                    style={[
                      styles.ratingSource, 
                      { 
                        color: theme.colors.onSurface,
                        fontFamily: 'Poppins-Regular'
                      }
                    ]}
                  >
                    {rating.Source}
                  </Text>
                  <Text 
                    variant="titleLarge" 
                    style={[
                      styles.ratingValue, 
                      { 
                        color: theme.colors.primary,
                        fontFamily: 'Poppins-Bold'
                      }
                    ]}
                  >
                    {rating.Value}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
          
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
      
      {/* Video Player Modal */}
      <VideoPlayer
        visible={showVideoPlayer}
        onClose={() => setShowVideoPlayer(false)}
        tmdbId={movie.tmdbId?.toString() || movie.imdbID}
        imdbId={movie.imdbID}  
        movieTitle={movie.Title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  posterContainer: {
    position: 'relative',
  },
  posterImage: {
    width: '100%',
  },
  posterGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    zIndex: 5,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  navContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 16,
    marginTop: -60,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  year: {
    marginBottom: 0,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#888',
    marginHorizontal: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    marginBottom: 8,
  },
  genreChip: {
    margin: 4,
    borderWidth: 0,
  },
  watchButton: {
    paddingVertical: 12,
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  plot: {
    lineHeight: 24,
  },
  infoText: {
    marginBottom: 8,
    lineHeight: 22,
  },
  labelText: {
    fontWeight: 'bold',
  },
  ratingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  ratingItem: {
    alignItems: 'center',
    padding: 14,
    minWidth: 110,
    borderRadius: 12,
    margin: 6,
    elevation: 1,
  },
  ratingSource: {
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingValue: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});