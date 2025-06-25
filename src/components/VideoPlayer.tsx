import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  BackHandler,
  TouchableWithoutFeedback,
  Alert,
  Platform
} from 'react-native';
import { useTheme, Text, IconButton, Button } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInUp, 
  SlideOutUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay
} from 'react-native-reanimated';
import { getStreamingSources } from '../services/api';

interface VideoPlayerProps {
  visible: boolean;
  onClose: () => void;
  tmdbId: string;
  imdbId?: string;
  movieTitle: string;
}

const { width, height } = Dimensions.get('window');

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  visible, 
  onClose, 
  tmdbId,
  imdbId, 
  movieTitle 
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [sources, setSources] = useState<string[]>([]);
  const webViewRef = useRef<WebView>(null);
  const fadeAnim = useSharedValue(1);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    if (visible) {
      // Get all streaming sources
      const streamingSources = getStreamingSources(tmdbId, imdbId);
      setSources(streamingSources);
      
      setLoading(true);
      setError(false);
      setCurrentSourceIndex(0);
      setErrorMessage('');
      
      // Auto-hide controls after 3 seconds
      timeoutRef.current = setTimeout(() => {
        hideControls();
      }, 3000);
      
      // Handle hardware back button on Android
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (visible) {
          onClose();
          return true;
        }
        return false;
      });
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        backHandler.remove();
      };
    }
  }, [visible, tmdbId, imdbId]);
  
  const showControlsFunc = () => {
    setShowControls(true);
    fadeAnim.value = withTiming(1, { duration: 200 });
    
    // Auto-hide after 3 seconds
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      hideControls();
    }, 3000);
  };
  
  const hideControls = () => {
    fadeAnim.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setShowControls)(false);
    });
  };
  
  const animatedControlsStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
    };
  });
  
  const currentStreamingUrl = sources[currentSourceIndex];
  
  const handleWebViewLoad = () => {
    console.log('WebView loaded successfully:', currentStreamingUrl);
    setLoading(false);
    setError(false);
  };
  
  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    
    setLoading(false);
    setError(true);
    
    // Set specific error message based on error type
    if (nativeEvent.code === -1009 || nativeEvent.code === -1004) {
      setErrorMessage('No internet connection');
    } else if (nativeEvent.statusCode === 404 || nativeEvent.code === -1100) {
      setErrorMessage('Movie not available on this server');
    } else if (nativeEvent.statusCode === 500) {
      setErrorMessage('Server error');
    } else {
      setErrorMessage('Failed to load movie');
    }
  };
  
  const handleRetry = () => {
    if (currentSourceIndex < sources.length - 1) {
      const newIndex = currentSourceIndex + 1;
      setCurrentSourceIndex(newIndex);
      setError(false);
      setLoading(true);
      
      // Small delay to ensure WebView updates
      setTimeout(() => {
        if (webViewRef.current) {
          webViewRef.current.reload();
        }
      }, 100);
    } else {
      // All sources failed
      Alert.alert(
        'Movie Unavailable',
        'This movie is not available for streaming on any of our servers. Please try another movie.',
        [
          {
            text: 'OK',
            onPress: onClose
          }
        ]
      );
    }
  };
  
  const handleSelectServer = () => {
    const serverOptions = sources.map((source, index) => {
      let serverName = `Server ${index + 1}`;
      
      // Give servers descriptive names
      if (source.includes('vidsrc.icu')) serverName = 'VidSrc Main';
      else if (source.includes('vidsrc.to')) serverName = 'VidSrc Alt';
      else if (source.includes('2embed')) serverName = '2Embed';
      else if (source.includes('multiembed')) serverName = 'MultiEmbed';
      else if (source.includes('embedplus')) serverName = 'EmbedPlus';
      else if (source.includes('streamwish')) serverName = 'StreamWish';
      
      return {
        text: serverName,
        onPress: () => {
          setCurrentSourceIndex(index);
          setError(false);
          setLoading(true);
          
          setTimeout(() => {
            if (webViewRef.current) {
              webViewRef.current.reload();
            }
          }, 100);
        }
      };
    });
    
    Alert.alert(
      'Select Server',
      'Choose a different streaming server',
      [
        ...serverOptions,
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };
  
  const toggleControls = () => {
    if (showControls) {
      hideControls();
    } else {
      showControlsFunc();
    }
  };
  
  const handleLoadStart = () => {
    console.log('WebView load started:', currentStreamingUrl);
  };
  
  const handleHttpError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.log('HTTP Error:', nativeEvent.statusCode, nativeEvent.url);
    
    if (nativeEvent.statusCode === 404) {
      handleWebViewError(syntheticEvent);
    }
  };
  
  return (
    <Modal visible={visible} animationType="none" transparent>
      <View style={styles.container}>
        <StatusBar style="light" hidden />
        
        {/* Video Container */}
        <TouchableWithoutFeedback onPress={toggleControls}>
          <View style={styles.videoContainer}>
            {currentStreamingUrl && (
              <WebView
                ref={webViewRef}
                source={{ uri: currentStreamingUrl }}
                style={styles.webView}
                javaScriptEnabled={true}
                allowsFullscreenVideo={true}
                onLoad={handleWebViewLoad}
                onLoadStart={handleLoadStart}
                onError={handleWebViewError}
                onHttpError={handleHttpError}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                allowsProtectedMedia={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                bounces={false}
                userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
                mixedContentMode="compatibility"
                onShouldStartLoadWithRequest={(request) => {
                  // Allow all requests
                  return true;
                }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
        
        {/* Loading State */}
        {loading && (
          <Animated.View 
            style={styles.fullScreenOverlay}
            entering={FadeIn}
            exiting={FadeOut}
          >
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading movie...</Text>
            <Text style={styles.movieTitleSmall}>{movieTitle}</Text>
            <Text style={styles.serverInfo}>
              {sources[currentSourceIndex]?.includes('vidsrc.icu') ? 'VidSrc Main' :
               sources[currentSourceIndex]?.includes('vidsrc.to') ? 'VidSrc Alt' :
               sources[currentSourceIndex]?.includes('2embed') ? '2Embed' :
               sources[currentSourceIndex]?.includes('multiembed') ? 'MultiEmbed' :
               sources[currentSourceIndex]?.includes('embedplus') ? 'EmbedPlus' :
               sources[currentSourceIndex]?.includes('streamwish') ? 'StreamWish' :
               `Server ${currentSourceIndex + 1}`}
            </Text>
          </Animated.View>
        )}
        
        {/* Error State */}
        {error && (
          <Animated.View 
            style={styles.fullScreenOverlay}
            entering={FadeIn}
            exiting={FadeOut}
          >
            <Ionicons name="alert-circle-outline" size={64} color="#fff" />
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Text style={styles.errorSubtext}>
              {currentSourceIndex < sources.length - 1 
                ? 'Trying a different server might help.'
                : 'This movie is not available on any servers.'}
            </Text>
            
            <View style={styles.errorButtons}>
              {currentSourceIndex < sources.length - 1 && (
                <TouchableOpacity 
                  style={[styles.errorButton, styles.primaryButton]}
                  onPress={handleRetry}
                >
                  <Text style={styles.errorButtonText}>Try Next Server</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.errorButton, styles.secondaryButton]}
                onPress={handleSelectServer}
              >
                <Text style={styles.errorButtonText}>Select Server</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.errorButton, styles.outlineButton]}
                onPress={onClose}
              >
                <Text style={[styles.errorButtonText, { color: '#fff' }]}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        
        {/* Video Controls Overlay */}
        {showControls && !loading && !error && (
          <Animated.View 
            style={[styles.controlsContainer, animatedControlsStyle]}
            pointerEvents={showControls ? 'auto' : 'none'}
          >
            {/* Top Bar */}
            <Animated.View 
              style={styles.topBar}
              entering={SlideInUp.duration(200)}
              exiting={SlideOutUp.duration(200)}
            >
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.movieTitle} numberOfLines={1}>
                {movieTitle}
              </Text>
              <TouchableOpacity onPress={handleSelectServer} style={styles.serverButton}>
                <Ionicons name="server-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
            
            {/* Bottom Bar */}
            <Animated.View 
              style={styles.bottomBar}
              entering={SlideInUp.duration(200)}
              exiting={SlideOutUp.duration(200)}
            >
              <View style={styles.progressContainer}>
                <Text style={styles.serverText}>
                  {sources[currentSourceIndex]?.includes('vidsrc.icu') ? 'VidSrc Main' :
                   sources[currentSourceIndex]?.includes('vidsrc.to') ? 'VidSrc Alt' :
                   sources[currentSourceIndex]?.includes('2embed') ? '2Embed' :
                   sources[currentSourceIndex]?.includes('multiembed') ? 'MultiEmbed' :
                   sources[currentSourceIndex]?.includes('embedplus') ? 'EmbedPlus' :
                   sources[currentSourceIndex]?.includes('streamwish') ? 'StreamWish' :
                   `Server ${currentSourceIndex + 1}`}
                </Text>
              </View>
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
  },
  movieTitleSmall: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  serverInfo: {
    color: '#fff',
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    opacity: 0.6,
  },
  errorText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
  },
  errorSubtext: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    opacity: 0.8,
    textAlign: 'center',
    maxWidth: '80%',
    paddingHorizontal: 16,
  },
  errorButtons: {
    marginTop: 32,
    gap: 12,
    alignItems: 'center',
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#6200ee',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topBar: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backButton: {
    padding: 8,
  },
  movieTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    marginLeft: 16,
  },
  serverButton: {
    padding: 8,
  },
  bottomBar: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    opacity: 0.8,
  },
});

export default VideoPlayer;