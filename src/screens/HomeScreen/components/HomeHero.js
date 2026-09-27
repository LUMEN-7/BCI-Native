import { useEffect, useState } from 'react';
import { AccessibilityInfo, AppState, Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { firstName, greeting } from '../homeData';
import styles from '../styles';

// The same decorative Ford imagery used by Home web, not catalogue/search records.
const IMAGES = [
  'https://raw.githubusercontent.com/LUMEN-7/images/refs/heads/main/carros/2021_ford_bronco.png',
  'https://raw.githubusercontent.com/LUMEN-7/images/refs/heads/main/mustang.png',
  'https://raw.githubusercontent.com/LUMEN-7/images/refs/heads/main/carros/2025_ford_bronco_sport.png',
  'https://raw.githubusercontent.com/LUMEN-7/images/refs/heads/main/carros/2026_ford_expedition.png',
  'https://raw.githubusercontent.com/LUMEN-7/images/refs/heads/main/carros/2026_ford_explorer.png',
  'https://raw.githubusercontent.com/LUMEN-7/images/refs/heads/main/carros/2026_ford_mustang_mach.png',
];
function HeroButton({ label, icon, secondary, onPress }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.heroButton, secondary && styles.secondaryButton, pressed && styles.pressed]}>
    <Ionicons name={icon} size={17} color={secondary ? '#00142E' : '#fff'}/><Text style={[styles.buttonLabel, secondary && styles.secondaryLabel]}>{label}</Text><Ionicons name="arrow-forward" size={17} color={secondary ? '#00142E' : '#fff'}/>
  </Pressable>;
}
export default function HomeHero({ user, onSearch, onCompare }) {
  const { width } = useWindowDimensions();
  const focused = useIsFocused();
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState({});
  const [reducedMotion, setReducedMotion] = useState(true);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReducedMotion(value); }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    const appState = AppState.addEventListener('change', value => setForeground(value === 'active'));
    return () => { active = false; motion.remove(); appState.remove(); };
  }, []);
  useEffect(() => {
    if (!focused || !foreground || reducedMotion) return;
    const timer = setInterval(() => setIndex(current => (current + 1) % IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, [focused, foreground, reducedMotion]);
  const titleSize = Math.min(64, Math.max(42, width * 0.13));
  return <View style={styles.hero}>
    <View style={styles.heroCopy}>
      <Text style={styles.eyebrow}>BUSINESS COMPETITIVE INTELLIGENCE</Text>
      <Text accessibilityRole="header" style={[styles.heroTitle, { fontSize: titleSize, lineHeight: titleSize * 1.04 }]}>{greeting(new Date().getHours())}{'\n'}{firstName(user)}.</Text>
      <Text style={styles.heroDescription}>Explore o mercado, compare modelos e transforme dados em decisões estratégicas para a Ford.</Text>
      <View style={styles.heroActions}><HeroButton label="Pesquisar" icon="search-outline" onPress={onSearch}/><HeroButton label="Comparar" icon="git-compare-outline" secondary onPress={onCompare}/></View>
    </View>
    <View style={styles.carStage}>
      <View style={styles.carGlow}/>
      {failed[index] ? <View style={styles.carFallback}><Ionicons name="car-sport-outline" size={76} color="#8393A7"/><Text style={styles.muted}>Imagem indisponível</Text></View> : <Image source={{ uri: IMAGES[index] }} accessibilityLabel="Veículo Ford — imagem de apresentação" resizeMode="contain" style={styles.heroCar} onError={() => setFailed(current => ({ ...current, [index]: true }))}/>}
      <View style={styles.carouselControls}>
        <Pressable accessibilityRole="button" accessibilityLabel="Imagem anterior" onPress={() => setIndex(current => (current + IMAGES.length - 1) % IMAGES.length)} style={styles.carouselButton}><Ionicons name="chevron-back-outline" size={16} color="#00142E"/></Pressable>
        <Text style={styles.carouselCount}>{String(index + 1).padStart(2, '0')} <Text style={styles.carouselTotal}>/ {String(IMAGES.length).padStart(2, '0')}</Text></Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Próxima imagem" onPress={() => setIndex(current => (current + 1) % IMAGES.length)} style={styles.carouselButton}><Ionicons name="chevron-forward-outline" size={16} color="#00142E"/></Pressable>
      </View>
    </View>
  </View>;
}
