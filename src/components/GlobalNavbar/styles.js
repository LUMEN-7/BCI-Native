import { StyleSheet } from "react-native";

import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";

export default StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    right: 18,
    zIndex: 1000,
    elevation: 30,
  },

  menuButton: {
    width: 46,
    height: 46,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 99,

    backgroundColor:
      "rgba(255, 255, 255, 0.94)",

    borderWidth: 1,
    borderColor:
      "rgba(255, 255, 255, 0.85)",

    shadowColor: "#00142E",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.15,
    shadowRadius: 14,

    elevation: 9,
  },

  menuButtonPressed: {
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  modalBackdrop: {
    flex: 1,

    backgroundColor:
      "rgba(0, 20, 46, 0.08)",
  },

  menu: {
    position: "absolute",

    right: 18,

    width: 220,

    padding: 12,

    borderRadius: 20,

    borderWidth: 1,
    borderColor:
      "rgba(0, 20, 46, 0.07)",

    backgroundColor:
      "rgba(255, 255, 255, 0.97)",

    shadowColor: "#00142E",
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.15,
    shadowRadius: 28,

    elevation: 18,
  },

  menuMain: {
    gap: 4,
  },

  navItem: {
    minHeight: 46,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,

    borderRadius: 12,

    gap: 12,
  },

  navItemActive: {
    backgroundColor: colors.primary,
  },

  navItemPressed: {
    backgroundColor:
      "rgba(0, 20, 46, 0.06)",
  },

  iconWrapper: {
    width: 24,
    height: 24,

    alignItems: "center",
    justifyContent: "center",

    position: "relative",
  },

  navLabel: {
    flex: 1,

    fontFamily: fonts.bold,

    fontSize: 11,

    letterSpacing: 0.7,

    textTransform: "uppercase",

    color: colors.primary,
  },

  navLabelActive: {
    color: colors.white,
  },

  alertIndicator: {
    position: "absolute",

    right: -2,
    top: -1,

    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: "#D96B55",

    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },

  separator: {
    height: 1,

    marginVertical: 7,
    marginHorizontal: 7,

    backgroundColor:
      "rgba(0, 20, 46, 0.08)",
  },
});