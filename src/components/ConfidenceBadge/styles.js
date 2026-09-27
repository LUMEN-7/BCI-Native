import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
export default StyleSheet.create({badge:{maxWidth:'100%',alignSelf:'flex-start',borderRadius:999,paddingHorizontal:10,paddingVertical:5,flexDirection:'row',alignItems:'center',gap:6},confirmed:{backgroundColor:'#E6F4EF'},speculative:{backgroundColor:'#FFF3DD'},dot:{width:7,height:7,borderRadius:99},confirmedDot:{backgroundColor:colors.success},speculativeDot:{backgroundColor:colors.warning},text:{flexShrink:1,fontFamily:fonts.bold,fontSize:11},confirmedText:{color:colors.success},speculativeText:{color:'#845A0D'}});
