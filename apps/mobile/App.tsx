import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createSupabaseClient, type Listing } from '@kaze/shared';

export default function App() {
  const placeholder: Listing['listingType'] = 'rent';
  const supabaseClientFactory = createSupabaseClient;

  return (
    <View style={styles.container}>
      <Text>Kaze mobile — {placeholder} listings coming soon</Text>
      <Text style={styles.debug}>
        @kaze/shared loaded: {typeof supabaseClientFactory === 'function' ? 'yes' : 'no'}
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debug: {
    marginTop: 8,
    color: '#888',
    fontSize: 12,
  },
});
