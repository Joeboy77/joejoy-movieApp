import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, Text, IconButton, Card, Surface } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Movie } from '../src/types';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SectionScreen() {
  const { title } = useLocalSearchParams<{ title: string }>();
  const router = useRouter();
  const theme = useTheme();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  
  useEffect(() => {
    setLoading(false);
  }, [title]);
  
  const navigateToDetails = (id: string) => {
    router.push(`/movie/${id}`);
  };
  
  const renderMovieItem = ({ item, index }: { item: Movie, index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400)}
      style={styles.cardContainer}
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
                <Text style={styles.cardTitle} numberOfLines={2}>
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
  
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
            iconColor={theme.colors.onSurface}
          />
          <Text 
            variant="titleLarge" 
            style={{ 
              color: theme.colors.onSurface, 
              fontFamily: 'Poppins-Bold',
              marginLeft: 8
            }}
          >
            {title}
          </Text>
        </View>
      </View>
      
      <FlatList
        data={movies}
        renderItem={renderMovieItem}
        keyExtractor={(item) => item.imdbID}
        numColumns={3}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: {
    padding: 8,
  },
  cardContainer: {
    flex: 1,
    padding: 8,
  },
  cardSurface: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    height: 150,
    borderRadius: 12,
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
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
  cardWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});