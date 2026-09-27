import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeHero from './components/HomeHero';
import Overview from './components/Overview';
import Highlights from './components/Highlights';
import Coverage from './components/Coverage';
import Monitoring from './components/Monitoring';
import RecentActivity from './components/RecentActivity';
import useHomeDashboard from './useHomeDashboard';
import styles from './styles';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const data = useHomeDashboard();
  return <View style={styles.screen}><ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 84, paddingBottom: insets.bottom + 100 }]} refreshControl={<RefreshControl refreshing={data.loading} onRefresh={data.reload} tintColor="#0562D2" colors={['#0562D2']}/>}>
    <View style={styles.container}>
      <HomeHero user={data.user} onSearch={() => navigation.navigate('Search')} onCompare={() => navigation.navigate('Compare')}/>
      {data.errors.length > 0 && <View style={styles.errorBanner}><Text accessibilityRole="alert" style={styles.errorText}>Alguns dados não puderam ser atualizados.</Text><Pressable accessibilityRole="button" disabled={data.loading} onPress={data.reload} style={styles.retry}><Text style={styles.linkText}>Tentar novamente</Text></Pressable></View>}
      <Overview metrics={data.metrics}/>
      <Highlights cars={data.cars} loading={data.loading} navigation={navigation}/>
      <Coverage cars={data.cars} loading={data.loading}/>
      <Monitoring alerts={data.alerts} loading={data.loading} onReview={() => navigation.navigate('Alerts')}/>
      <RecentActivity items={data.activity} loading={data.loading} onSaved={() => navigation.navigate('Saved', { initialTab: 'comparisons', selectionKey: Date.now() })}/>
      <View style={styles.footer}><Text style={styles.footerText}>© {new Date().getFullYear()} Ford Motor Company · Uso interno</Text><Text style={styles.footerText}>BCI · Business Competitive Intelligence</Text></View>
    </View>
  </ScrollView></View>;
}
