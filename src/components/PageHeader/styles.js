import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
export default StyleSheet.create({
  wrap: {
    gap: 18,
    marginBottom: 18
  },
  copy: {
    gap: 8
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: colors.secondary
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 46,
    lineHeight: 49,
    letterSpacing: -1,
    textTransform: 'uppercase',
    color: colors.primary
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 23,
    color: colors.lightGrey,
    marginTop: 12
  }
});
