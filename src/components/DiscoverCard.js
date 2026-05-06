// DiscoverCard - Individual discover/playlist card
import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import colors from '../theme/colors';

const DiscoverCard = ({ 
  title, 
  subtitle, 
  image, 
  onPress,
  variant = 'default',
}) => {
  const isArtist = variant === 'artist';
  const isCentered = variant === 'artist' || variant === 'radio';

  return (
    <TouchableOpacity 
      style={[styles.container, isArtist && styles.containerArtist, variant === 'radio' && { width: 140 }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: image }} 
        style={[styles.image, isArtist && styles.imageArtist]}
        resizeMode="cover"
      />
      <View style={[styles.info, isCentered && styles.infoArtist]}>
        <Text style={[styles.title, isCentered && styles.textCenter]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, isCentered && styles.textCenter]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: 12,
  },
  containerArtist: {
    width: 120, // Artists typically slightly smaller/more compact
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  imageArtist: {
    width: 120,
    height: 120,
    borderRadius: 60, // Circular
  },
  info: {
    marginTop: 8,
  },
  infoArtist: {
    alignItems: 'center', // Center text for artist
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  textCenter: {
    textAlign: 'center',
  },
});

export default DiscoverCard;
