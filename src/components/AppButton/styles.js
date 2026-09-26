import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
export default StyleSheet.create({
  shadow:{backgroundColor:'#003A82',borderRadius:999,marginBottom:5},compactShadow:{alignSelf:'flex-start'},secondaryShadow:{backgroundColor:'#AEB6C1'},ghostShadow:{backgroundColor:'transparent'},pressed:{transform:[{translateY:3}]},disabled:{opacity:.45},
  face:{minHeight:50,paddingHorizontal:22,borderRadius:999,backgroundColor:colors.secondary,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8,transform:[{translateY:-4}]},compactFace:{minHeight:40,paddingHorizontal:16},secondaryFace:{backgroundColor:colors.white},ghostFace:{backgroundColor:colors.surfaceSoft,borderWidth:1,borderColor:colors.border},
  text:{color:colors.white,fontFamily:fonts.bold,fontSize:15},darkText:{color:colors.primary},
});
