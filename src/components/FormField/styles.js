import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
export default StyleSheet.create({wrap:{gap:6},label:{fontFamily:fonts.bold,fontSize:12,letterSpacing:1.1,textTransform:'uppercase',color:colors.primary},input:{minHeight:48,borderWidth:1,borderColor:colors.border,borderRadius:14,paddingHorizontal:14,fontFamily:fonts.body,fontSize:16,color:colors.primary,backgroundColor:colors.white},inputError:{borderColor:colors.error},error:{fontFamily:fonts.body,fontSize:12,color:colors.error}});
