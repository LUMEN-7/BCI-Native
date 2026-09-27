import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
export default StyleSheet.create({
  authLabel: {fontSize:11,letterSpacing:1.5},
  authShell: {borderRadius:999,backgroundColor:colors.surface,boxShadow:'inset 4px 4px 9px rgba(0,20,46,0.1), inset -4px -4px 9px rgba(255,255,255,0.95)'},
  authFocused: {boxShadow:'0px 18px 40px rgba(0,20,46,0.11), 0px 4px 10px rgba(0,20,46,0.05)'},
  authError: {borderWidth:1,borderColor:colors.error},
  authInput: {minHeight:44,borderWidth:0,borderRadius:999,paddingHorizontal:15,paddingVertical:10,fontSize:14,backgroundColor:'transparent'},
wrap:{gap:6},label:{fontFamily:fonts.bold,fontSize:12,letterSpacing:1.1,textTransform:'uppercase',color:colors.primary},input:{minHeight:48,borderWidth:1,borderColor:colors.border,borderRadius:14,paddingHorizontal:14,fontFamily:fonts.body,fontSize:16,color:colors.primary,backgroundColor:colors.white},inputError:{borderColor:colors.error},error:{fontFamily:fonts.body,fontSize:12,color:colors.error}});
