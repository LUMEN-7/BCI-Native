import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
export default StyleSheet.create({card:{backgroundColor:colors.white,borderRadius:20,padding:18,borderWidth:1,borderColor:colors.border,gap:14},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:12},titleWrap:{flex:1},eyebrow:{fontFamily:fonts.bold,fontSize:10,letterSpacing:1.6,textTransform:'uppercase',color:colors.secondary},title:{fontFamily:fonts.title,fontSize:25,textTransform:'uppercase',color:colors.primary,lineHeight:29}});
