import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
export default StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.primary
  },
  shell: {
    flex: 1,
    backgroundColor: colors.surface
  },
  hero: {
    height: 210,
    justifyContent: 'flex-end'
  },
  heroImage: {
    resizeMode: 'cover'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,20,46,.5)'
  },
  heroCopy: {
    padding: 28
  },
  kicker: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 2,
    color: '#fff'
  },
  heroTitle: {
    fontFamily: fonts.title,
    fontSize: 40,
    lineHeight: 43,
    color: '#fff',
    marginTop: 8
  },
  form: {
    padding: 22,
    gap: 17,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center'
  },
  formKicker: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.secondary,
    marginTop: 8
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 34,
    lineHeight: 38,
    color: colors.primary
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.lightGrey,
    marginBottom: 7
  },
  error: {
    fontFamily: fonts.body,
    color: colors.error
  },
  link: {
    fontFamily: fonts.semibold,
    color: colors.secondary,
    textAlign: 'center',
    paddingVertical: 10
  },
  footer: {
    fontFamily: fonts.body,
    color: colors.lightGrey,
    textAlign: 'center'
  },
  linkStrong: {
    fontFamily: fonts.bold,
    color: colors.primary
  }
});
