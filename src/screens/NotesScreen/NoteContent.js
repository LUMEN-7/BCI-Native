import { Image, Linking, Pressable, Text, View } from 'react-native';
import { s } from '../../components/MobileUI';
import { safeSourceUrl } from '../../utils/vehicleAdapters';
import { fonts } from '../../theme/typography';
function inline(text, onCar, onError) {
  return text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const car = link[2].match(/^\/information\/(\d+)$/),
        url = safeSourceUrl(link[2]);
      if (car || url) return <Text key={i} accessibilityRole="link" style={{
        color: '#0562D2',
        textDecorationLine: 'underline'
      }} onPress={() => car ? onCar?.(car[1]) : Linking.openURL(url).catch(() => onError?.('Não foi possível abrir o link.'))}>{link[1]}</Text>;
    }
    if (part.startsWith('**') && part.endsWith('**')) return <Text key={i} style={{
      fontFamily: fonts.bold
    }}>{part.slice(2, -2)}</Text>;
    if (part.startsWith('__') && part.endsWith('__')) return <Text key={i} style={{
      textDecorationLine: 'underline'
    }}>{part.slice(2, -2)}</Text>;
    if (part.startsWith('*') && part.endsWith('*')) return <Text key={i} style={{
      fontStyle: 'italic'
    }}>{part.slice(1, -1)}</Text>;
    return part;
  });
}
export default function NoteContent({
  content,
  onCar,
  onToggle,
  onImage,
  onError,
  busy
}) {
  const lines = (content || '').split('\n');
  return <View style={{
    gap: 9
  }}>{lines.map((line, i) => {
      const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (image && safeSourceUrl(image[2])) return <Pressable key={i} accessibilityRole="button" accessibilityLabel={'Ampliar imagem ' + image[1]} onPress={() => onImage?.(image[2])}><Image source={{
          uri: image[2]
        }} accessibilityLabel={image[1]} style={{
          height: 180,
          width: '100%'
        }} resizeMode="contain" /></Pressable>;
      const checkbox = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.*)$/);
      if (checkbox) return <Pressable key={i} disabled={busy || !onToggle} accessibilityRole="checkbox" accessibilityState={{
        checked: checkbox[1] !== ' '
      }} onPress={() => {
        const next = [...lines];
        next[i] = line.replace(/\[[ xX]\]/, checkbox[1] === ' ' ? '[x]' : '[ ]');
        onToggle(next.join('\n'));
      }} style={s.row}><Text style={s.strong}>{checkbox[1] === ' ' ? '☐' : '☑'}</Text><Text style={[s.body, s.grow]}>{inline(checkbox[2], onCar, onError)}</Text></Pressable>;
      const heading = line.match(/^(#{1,3})\s+(.*)$/),
        list = line.match(/^\s*[-*]\s+(.*)$/);
      if (/^---+$/.test(line)) return <View key={i} style={s.rule} />;
      return <Text key={i} selectable style={heading ? s.title : s.body}>{heading ? inline(heading[2], onCar, onError) : list ? ['• ', ...inline(list[1], onCar, onError)] : inline(line, onCar, onError)}</Text>;
    })}</View>;
}
