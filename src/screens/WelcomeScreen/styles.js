import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
export default StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    padding: 24,
    gap: 24
  },
  copy: {
    gap: 7
  },
  kicker: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 2,
    color: '#8EABD0'
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 32,
    lineHeight: 36,
    color: colors.primary
  },
  body: {
    fontFamily: fonts.body,
    color: colors.lightGrey
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 0,
    gap: 14
  }
});
