// app/index.tsx
import { useEffect, useState, useContext, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Searchbar, Text, Card, Button, IconButton, useTheme, Surface } from 'react-native-paper';
import { 
  getPopularMovies, 
  searchMovies, 
  getNowPlayingMovies, 
  getUpcomingMovies, 
  getTopRatedMovies,
  getTrendingMovies,
  getGenres,
  getMoviesByGenre
} from '../src/services/api';
import { Movie, TMDBGenre } from '../src/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from './_layout';
import Animated, { FadeInDown, FadeInUp, SlideInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.32;
const HERO_HEIGHT = width * 0.6;

interface MovieSection {
  title: string;
  data: Movie[];
  loading: boolean;
  error: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { toggleTheme, dimensions } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<TMDBGenre | null>(null);
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  
  // Section states
  const [sections, setSections] = useState<{
    trending: MovieSection;
    nowPlaying: MovieSection;
    popular: MovieSection;
    upcoming: MovieSection;
    topRated: MovieSection;
  }>({
    trending: { title: 'Trending This Week', data: [], loading: true, error: '' },
    nowPlaying: { title: 'Now Playing', data: [], loading: true, error: '' },
    popular: { title: 'Popular', data: [], loading: true, error: '' },
    upcoming: { title: 'Coming Soon', data: [], loading: true, error: '' },
    topRated: { title: 'Top Rated', data: [], loading: true, error: '' },
  });
  
  useEffect(() => {
    fetchInitialData();
  }, []);
  
  const fetchInitialData = async () => {
    try {
      // Fetch genres
      const genreList = await getGenres();
      setGenres(genreList);
      
      // Fetch all sections
      await Promise.all([
        fetchTrendingMovies(),
        fetchNowPlayingMovies(),
        fetchPopularMovies(),
        fetchUpcomingMovies(),
        fetchTopRatedMovies(),
        fetchHeroMovies(),
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };
  
  const fetchHeroMovies = async () => {
    try {
      const response = await getTrendingMovies('day');
      if (response.Response === 'True') {
        setHeroMovies(response.Search.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching hero movies:', error);
    }
  };
  
  const fetchTrendingMovies = async () => {
    try {
      const response = await getTrendingMovies();
      if (response.Response === 'True') {
        setSections(prev => ({
          ...prev,
          trending: { ...prev.trending, data: response.Search, loading: false, error: '' }
        }));
      } else {
        setSections(prev => ({
          ...prev,
          trending: { ...prev.trending, loading: false, error: response.Error || 'Failed to fetch' }
        }));
      }
    } catch (error) {
      setSections(prev => ({
        ...prev,
        trending: { ...prev.trending, loading: false, error: 'An error occurred' }
      }));
    }
  };
  
  const fetchNowPlayingMovies = async () => {
    try {
      const response = await getNowPlayingMovies();
      if (response.Response === 'True') {
        setSections(prev => ({
          ...prev,
          nowPlaying: { ...prev.nowPlaying, data: response.Search, loading: false, error: '' }
        }));
      } else {
        setSections(prev => ({
          ...prev,
          nowPlaying: { ...prev.nowPlaying, loading: false, error: response.Error || 'Failed to fetch' }
        }));
      }
    } catch (error) {
      setSections(prev => ({
        ...prev,
        nowPlaying: { ...prev.nowPlaying, loading: false, error: 'An error occurred' }
      }));
    }
  };
  
  const fetchPopularMovies = async () => {
    try {
      const response = await getPopularMovies();
      if (response.Response === 'True') {
        setSections(prev => ({
          ...prev,
          popular: { ...prev.popular, data: response.Search, loading: false, error: '' }
        }));
      } else {
        setSections(prev => ({
          ...prev,
          popular: { ...prev.popular, loading: false, error: response.Error || 'Failed to fetch' }
        }));
      }
    } catch (error) {
      setSections(prev => ({
        ...prev,
        popular: { ...prev.popular, loading: false, error: 'An error occurred' }
      }));
    }
  };
  
  const fetchUpcomingMovies = async () => {
    try {
      const response = await getUpcomingMovies();
      if (response.Response === 'True') {
        setSections(prev => ({
          ...prev,
          upcoming: { ...prev.upcoming, data: response.Search, loading: false, error: '' }
        }));
      } else {
        setSections(prev => ({
          ...prev,
          upcoming: { ...prev.upcoming, loading: false, error: response.Error || 'Failed to fetch' }
        }));
      }
    } catch (error) {
      setSections(prev => ({
        ...prev,
        upcoming: { ...prev.upcoming, loading: false, error: 'An error occurred' }
      }));
    }
  };
  
  const fetchTopRatedMovies = async () => {
    try {
      const response = await getTopRatedMovies();
      if (response.Response === 'True') {
        setSections(prev => ({
          ...prev,
          topRated: { ...prev.topRated, data: response.Search, loading: false, error: '' }
        }));
      } else {
        setSections(prev => ({
          ...prev,
          topRated: { ...prev.topRated, loading: false, error: response.Error || 'Failed to fetch' }
        }));
      }
    } catch (error) {
      setSections(prev => ({
        ...prev,
        topRated: { ...prev.topRated, loading: false, error: 'An error occurred' }
      }));
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearching(true);
      const response = await searchMovies(searchQuery);
      if (response.Response === 'True') {
        setSearchResults(response.Search);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };
  
  const handleGenreSelect = async (genre: TMDBGenre) => {
    setSelectedGenre(genre);
    try {
      const response = await getMoviesByGenre(genre.id);
      if (response.Response === 'True') {
        setSections(prev => ({
          ...prev,
          trending: { title: `${genre.name} Movies`, data: response.Search, loading: false, error: '' }
        }));
      }
    } catch (error) {
      console.error('Error fetching genre movies:', error);
    }
  };
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  }, []);
  
  const navigateToDetails = (id: string) => {
    router.push(`/movie/${id}`);
  };
  
  const navigateToSection = (sectionTitle: string, fetchFunc: () => Promise<void>) => {
    router.push({
      pathname: '/section',
      params: { title: sectionTitle }
    });
  };
  
  const renderHeroItem = ({ item, index }: { item: Movie, index: number }) => (
    <TouchableOpacity onPress={() => navigateToDetails(item.imdbID)}>
      <View style={[styles.heroCard, { marginLeft: index === 0 ? 16 : 8 }]}>
        <Animated.Image
          source={{
            uri: item.Poster !== 'N/A' 
              ? item.Poster.replace('w500', 'w780')
              : 'https://via.placeholder.com/780x440?text=No+Poster',
          }}
          style={styles.heroImage}
          entering={FadeInUp.delay(index * 100).duration(400)}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.heroGradient}
        >
          <Text style={styles.heroTitle} numberOfLines={2}>
            {item.Title}
          </Text>
          <Text style={styles.heroYear}>{item.Year}</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
  
  const renderGenreItem = ({ item }: { item: TMDBGenre }) => (
    <TouchableOpacity onPress={() => handleGenreSelect(item)}>
      <Animated.View 
        style={[
          styles.genreChip, 
          selectedGenre?.id === item.id && { backgroundColor: theme.colors.primary }
        ]}
        entering={SlideInLeft.delay(100)}
      >
        <Text style={[
          styles.genreText,
          { color: selectedGenre?.id === item.id ? 'white' : theme.colors.onSurface }
        ]}>
          {item.name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
  
  const renderMovieItem = ({ item, index }: { item: Movie, index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400)}
      style={styles.movieCard}
    >
      <TouchableOpacity onPress={() => navigateToDetails(item.imdbID)}>
        <Surface style={[styles.cardSurface, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardWrapper}>
            <Card style={styles.card} mode="elevated">
              <Card.Cover
                source={{
                  uri: item.Poster !== 'N/A'
                    ? item.Poster
                    : 'https://via.placeholder.com/300x450?text=No+Poster',
                }}
                style={styles.cardImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.cardGradient}
              >
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.Title}
                </Text>
                <Text style={styles.cardYear}>{item.Year}</Text>
              </LinearGradient>
            </Card>
          </View>
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  );
  
  const renderSection = (section: MovieSection, keyPrefix: string) => {
    if (section.loading) {
      return (
        <View style={styles.sectionLoading}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }
    
    if (section.error) {
      return (
        <View style={styles.sectionError}>
          <Text style={{ color: theme.colors.error, fontSize: 12 }}>
            {section.error}
          </Text>
        </View>
      );
    }
    
    return (
      <FlatList
        data={section.data}
        renderItem={renderMovieItem}
        keyExtractor={(item) => `${keyPrefix}-${item.imdbID}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    );
  };
  
  if (searchResults.length > 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="headlineLarge" style={{ color: theme.colors.primary, fontFamily: 'Poppins-Bold' }}>
              JoeJoy
            </Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontFamily: 'Poppins-Medium', marginLeft: 4 }}>
              Movies
            </Text>
          </View>
          <IconButton
            icon={theme.dark ? "white-balance-sunny" : "moon-waning-crescent"}
            iconColor={theme.colors.onSurface}
            size={24}
            onPress={toggleTheme}
          />
        </View>
        
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search movies..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            onClearIconPress={() => setSearchResults([])}
            style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
            iconColor={theme.colors.primary}
            placeholderTextColor={`${theme.colors.onSurface}80`}
            inputStyle={{ color: theme.colors.onSurface, fontFamily: 'Poppins-Regular' }}
          />
        </View>
        
        <FlatList
          data={searchResults}
          renderItem={({ item, index }) => renderMovieItem({ item, index })}
          keyExtractor={(item) => `search-${item.imdbID}`}
          numColumns={3}
          contentContainerStyle={styles.searchResults}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={styles.header} entering={FadeInDown.duration(500)}>
          <View style={styles.titleContainer}>
            <Text variant="headlineLarge" style={{ color: theme.colors.primary, fontFamily: 'Poppins-Bold' }}>
              JoeJoy
            </Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontFamily: 'Poppins-Medium', marginLeft: 4 }}>
              Movies
            </Text>
          </View>
          <IconButton
            icon={theme.dark ? "white-balance-sunny" : "moon-waning-crescent"}
            iconColor={theme.colors.onSurface}
            size={24}
            onPress={toggleTheme}
          />
        </Animated.View>
        
        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(150).duration(450)} style={styles.searchContainer}>
          <Searchbar
            placeholder="Search movies..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
            iconColor={theme.colors.primary}
            placeholderTextColor={`${theme.colors.onSurface}80`}
            inputStyle={{ color: theme.colors.onSurface, fontFamily: 'Poppins-Regular' }}
          />
        </Animated.View>
        
        {/* Hero Carousel */}
        <Animated.View entering={FadeInDown.delay(200).duration(450)}>
          <FlatList
            data={heroMovies}
            renderItem={renderHeroItem}
            keyExtractor={(item) => `hero-${item.imdbID}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width * 0.8}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={{ paddingRight: 16 }}
          />
        </Animated.View>
        
        {/* Genres */}
        <Animated.View entering={FadeInDown.delay(250).duration(450)} style={styles.genresContainer}>
          <FlatList
            data={genres}
            renderItem={renderGenreItem}
            keyExtractor={(item) => `genre-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </Animated.View>
        
        {Object.entries(sections).map(([key, section], index) => (
         <Animated.View key={key} entering={FadeInDown.delay(300 + index * 50).duration(450)}>
           <View style={styles.sectionHeader}>
             <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, fontFamily: 'Poppins-Bold' }]}>
               {section.title}
             </Text>
             <TouchableOpacity onPress={() => navigateToSection(section.title, () => {})}>
               <Text style={[styles.seeAll, { color: theme.colors.primary, fontFamily: 'Poppins-Medium' }]}>
                 See All
               </Text>
             </TouchableOpacity>
           </View>
           {renderSection(section, key)}
         </Animated.View>
       ))}
       
       <View style={{ height: 24 }} />
     </ScrollView>
   </SafeAreaView>
 );
}

const styles = StyleSheet.create({
 container: {
   flex: 1,
 },
 header: {
   paddingHorizontal: 16,
   paddingTop: 12,
   paddingBottom: 8,
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
 },
 titleContainer: {
   flexDirection: 'row',
   alignItems: 'baseline',
 },
 searchContainer: {
   paddingHorizontal: 16,
   marginBottom: 16,
 },
 searchBar: {
   elevation: 4,
   borderRadius: 12,
   height: 50,
 },
 searchResults: {
   paddingHorizontal: 16,
   paddingTop: 8,
 },
 heroCard: {
   width: width * 0.75,
   height: HERO_HEIGHT,
   borderRadius: 16,
   overflow: 'hidden',
   marginRight: 16,
   elevation: 8,
   shadowColor: '#000',
   shadowOffset: {
     width: 0,
     height: 4,
   },
   shadowOpacity: 0.3,
   shadowRadius: 8,
 },
 heroImage: {
   width: '100%',
   height: '100%',
   resizeMode: 'cover',
 },
 heroGradient: {
   position: 'absolute',
   bottom: 0,
   left: 0,
   right: 0,
   height: '40%',
   padding: 16,
   justifyContent: 'flex-end',
 },
 heroTitle: {
   color: 'white',
   fontSize: 20,
   fontFamily: 'Poppins-Bold',
   textShadowColor: 'rgba(0, 0, 0, 0.75)',
   textShadowOffset: { width: 0, height: 1 },
   textShadowRadius: 4,
 },
 heroYear: {
   color: 'white',
   fontSize: 14,
   fontFamily: 'Poppins-Regular',
   marginTop: 4,
   opacity: 0.9,
 },
 genresContainer: {
   marginVertical: 16,
 },
 genreChip: {
   paddingHorizontal: 16,
   paddingVertical: 8,
   borderRadius: 20,
   marginRight: 8,
   backgroundColor: 'rgba(255, 255, 255, 0.1)',
 },
 genreText: {
   fontSize: 14,
   fontFamily: 'Poppins-Medium',
 },
 sectionHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   paddingHorizontal: 16,
   marginTop: 24,
   marginBottom: 12,
 },
 sectionTitle: {
   fontSize: 20,
 },
 seeAll: {
   fontSize: 14,
 },
 horizontalList: {
   paddingLeft: 16,
   paddingBottom: 8,
 },
 sectionLoading: {
   height: 60,
   justifyContent: 'center',
   alignItems: 'center',
 },
 sectionError: {
   height: 40,
   justifyContent: 'center',
   alignItems: 'center',
   paddingHorizontal: 16,
 },
 movieCard: {
   marginRight: 12,
 },
 cardSurface: {
   borderRadius: 12,
   overflow: 'hidden',
   elevation: 4,
   shadowColor: '#000',
   shadowOffset: {
     width: 0,
     height: 2,
   },
   shadowOpacity: 0.15,
   shadowRadius: 4,
 },
 cardWrapper: {
   overflow: 'hidden',
 },
 card: {
   width: ITEM_WIDTH,
   borderRadius: 12,
   overflow: 'hidden',
 },
 cardImage: {
   height: ITEM_WIDTH * 1.5,
   borderRadius: 12,
 },
 cardGradient: {
   position: 'absolute',
   bottom: 0,
   left: 0,
   right: 0,
   height: '35%',
   padding: 8,
   justifyContent: 'flex-end',
 },
 cardTitle: {
   color: 'white',
   fontSize: 12,
   fontFamily: 'Poppins-Medium',
   textShadowColor: 'rgba(0, 0, 0, 0.75)',
   textShadowOffset: { width: 0, height: 1 },
   textShadowRadius: 2,
 },
 cardYear: {
   color: 'white',
   fontSize: 10,
   fontFamily: 'Poppins-Regular',
   marginTop: 2,
   opacity: 0.8,
 },
});