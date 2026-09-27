import { StyleSheet } from "react-native";

import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";

export default StyleSheet.create({
  floatingContainer: {
    position: "absolute",

    right: 20,

    zIndex: 900,

    elevation: 20,
  },

  floatingButton: {
    width: 60,
    height: 60,

    borderRadius: 30,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(255,255,255,0.95)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.8)",

    shadowColor: "#00142E",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,

    elevation: 10,
  },

  floatingButtonPressed: {
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  backdrop: {
    flex: 1,

    backgroundColor:
      "rgba(0,20,46,0.13)",
  },

  backdropDismiss: {
    ...StyleSheet.absoluteFillObject,
  },

  panel: {
    position: "absolute",

    left: 14,
    right: 14,

    overflow: "hidden",

    borderRadius: 24,

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.75)",

    backgroundColor:
      "rgba(250,251,252,0.98)",

    shadowColor: "#00142E",
    shadowOffset: {
      width: 0,
      height: 22,
    },
    shadowOpacity: 0.24,
    shadowRadius: 35,

    elevation: 25,
  },

  header: {
    minHeight: 74,

    paddingHorizontal: 18,
    paddingVertical: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",

    borderBottomWidth: 1,
    borderBottomColor:
      "rgba(0,20,46,0.08)",
  },

  headerTitle: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    gap: 11,
  },

  headerIcon: {
    width: 42,
    height: 42,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      colors.primary,
  },

  kicker: {
    fontFamily: fonts.bold,

    fontSize: 9,

    letterSpacing: 1.5,

    color: "#7D8793",
  },

  heading: {
    maxWidth: 190,

    fontFamily: fonts.bold,

    fontSize: 20,

    color: colors.primary,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",

    gap: 7,
  },

  newButton: {
    height: 36,

    paddingHorizontal: 12,

    borderRadius: 10,

    flexDirection: "row",
    alignItems: "center",

    gap: 5,

    backgroundColor:
      colors.primary,
  },

  newButtonText: {
    fontFamily: fonts.semibold,

    fontSize: 12,

    color: colors.white,
  },

  iconButton: {
    width: 38,
    height: 38,

    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(0,20,46,0.06)",
  },

  search: {
    height: 46,

    marginHorizontal: 16,
    marginTop: 14,

    paddingHorizontal: 13,

    borderRadius: 13,

    borderWidth: 1,
    borderColor:
      "rgba(0,20,46,0.08)",

    flexDirection: "row",
    alignItems: "center",

    gap: 8,

    backgroundColor:
      "rgba(255,255,255,0.85)",
  },

  searchInput: {
    flex: 1,

    fontFamily: fonts.body,

    fontSize: 14,

    color: colors.primary,
  },

  loading: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    padding: 16,

    gap: 10,
  },

  noteCard: {
    padding: 14,

    borderRadius: 17,

    borderWidth: 1,
    borderColor:
      "rgba(0,20,46,0.08)",

    backgroundColor:
      "rgba(255,255,255,0.92)",
  },

  noteCardExpanded: {
    borderColor:
      "rgba(5,98,210,0.25)",

    shadowColor: "#00142E",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.07,
    shadowRadius: 14,

    elevation: 3,
  },

  noteHeader: {
    flexDirection: "row",
    alignItems: "center",

    gap: 8,
  },

  noteTitleRow: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    gap: 5,
  },

  noteTitle: {
    flex: 1,

    fontFamily: fonts.bold,

    fontSize: 14,

    color: colors.primary,
  },

  quickActions: {
    flexDirection: "row",

    gap: 3,
  },

  quickButton: {
    width: 31,
    height: 31,

    borderRadius: 9,

    alignItems: "center",
    justifyContent: "center",
  },

  noteSnippet: {
    marginTop: 8,

    fontFamily: fonts.body,

    fontSize: 12,
    lineHeight: 18,

    color: "#66717D",
  },

  expandedContent: {
    marginTop: 12,
    paddingTop: 12,

    borderTopWidth: 1,
    borderTopColor:
      "rgba(0,20,46,0.08)",
  },

  expandedText: {
    fontFamily: fonts.body,

    fontSize: 13,
    lineHeight: 20,

    color: "#566371",
  },

  attachedList: {
    marginTop: 13,

    gap: 6,
  },

  attachedCar: {
    minHeight: 40,

    paddingHorizontal: 11,

    borderRadius: 11,

    flexDirection: "row",
    alignItems: "center",

    gap: 8,

    backgroundColor:
      "rgba(5,98,210,0.06)",
  },

  attachedCarText: {
    flex: 1,

    fontFamily: fonts.semibold,

    fontSize: 12,

    color: colors.primary,
  },

  empty: {
    minHeight: 330,

    alignItems: "center",
    justifyContent: "center",

    padding: 30,
  },

  emptyTitle: {
    marginTop: 12,

    fontFamily: fonts.bold,

    fontSize: 17,

    color: colors.primary,
  },

  emptyText: {
    marginTop: 4,

    fontFamily: fonts.body,

    fontSize: 13,

    textAlign: "center",

    color: "#7D8793",
  },

  emptyButton: {
    marginTop: 18,

    height: 42,

    paddingHorizontal: 18,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      colors.primary,
  },

  emptyButtonText: {
    fontFamily: fonts.semibold,

    fontSize: 13,

    color: colors.white,
  },

  editor: {
    padding: 17,

    paddingBottom: 35,
  },

  titleInput: {
    minHeight: 50,

    paddingHorizontal: 2,

    borderBottomWidth: 1,
    borderBottomColor:
      "rgba(0,20,46,0.12)",

    fontFamily: fonts.bold,

    fontSize: 19,

    color: colors.primary,
  },

  textarea: {
    minHeight: 190,

    marginTop: 15,

    padding: 14,

    borderRadius: 15,

    borderWidth: 1,
    borderColor:
      "rgba(0,20,46,0.09)",

    backgroundColor:
      "rgba(255,255,255,0.8)",

    fontFamily: fonts.body,

    fontSize: 14,
    lineHeight: 21,

    color: colors.primary,
  },

  sectionHeader: {
    marginTop: 22,
    marginBottom: 10,

    flexDirection: "row",
    alignItems: "center",

    gap: 7,
  },

  sectionTitle: {
    fontFamily: fonts.bold,

    fontSize: 10,

    letterSpacing: 1,

    color: colors.primary,
  },

  carChips: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 7,
  },

  carChip: {
    minHeight: 36,

    paddingHorizontal: 10,

    borderRadius: 11,

    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    borderWidth: 1,
    borderColor:
      "rgba(0,20,46,0.12)",

    backgroundColor:
      "#FFFFFF",
  },

  carChipSelected: {
    backgroundColor:
      colors.primary,

    borderColor:
      colors.primary,
  },

  carChipText: {
    maxWidth: 210,

    fontFamily: fonts.semibold,

    fontSize: 11,

    color: colors.primary,
  },

  carChipTextSelected: {
    color: colors.white,
  },

  saveButton: {
    height: 50,

    marginTop: 25,

    borderRadius: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,

    backgroundColor:
      colors.primary,

    shadowColor: "#00142E",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,

    elevation: 5,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    fontFamily: fonts.bold,

    fontSize: 13,

    color: colors.white,
  },

  helper: {
    fontFamily: fonts.body,

    fontSize: 12,

    color: "#7D8793",
  },

  error: {
    marginHorizontal: 17,
    marginTop: 10,

    fontFamily: fonts.body,

    fontSize: 12,

    color: colors.error,
  },
});