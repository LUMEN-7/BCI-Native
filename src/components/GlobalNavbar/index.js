import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, Text, TouchableWithoutFeedback, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { listNotifications } from "../../services/notificationService";
import { pick } from '../../utils/vehicleAdapters';
import styles from "./styles";
const NAVIGATION_ITEMS = [{
  route: "Home",
  label: "Home",
  icon: "home-outline"
}, {
  route: "Search",
  label: "Pesquisar",
  icon: "search-outline"
}, {
  route: "Compare",
  label: "Comparar",
  icon: "git-compare-outline"
}, {
  route: "Insights",
  label: "Insights",
  icon: "analytics-outline"
}, {
  route: "Alerts",
  label: "Alertas",
  icon: "notifications-outline",
  alert: true
}, {
  route: "WorkspaceAccess",
  label: "Workspace",
  icon: "grid-outline"
}, {
  route: "Saved",
  label: "Salvos",
  icon: "bookmark-outline"
}, {
  route: "Notes",
  label: "Anotações",
  icon: "document-text-outline"
}];
export default function GlobalNavbar({
  navigation,
  currentRoute
}) {
  const insets = useSafeAreaInsets();
  const showFloatingMenu = currentRoute !== 'VehicleDetail' && currentRoute !== 'CompareResult';
  const [open, setOpen] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);
  const loadNotifications = useCallback(async () => {
    try {
      const notifications = await listNotifications();
      setHasUnreadAlerts(Array.isArray(notifications) && notifications.some(notification => pick(notification, 'lida', 'lido', 'read') === false && pick(notification, 'excluido') !== true));
    } catch {
      setHasUnreadAlerts(false);
    }
  }, []);
  useFocusEffect(useCallback(() => {
    loadNotifications();
  }, [loadNotifications]));
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);
  function navigateTo(route) {
    setOpen(false);
    if (currentRoute === route) {
      return;
    }
    navigation.navigate(route);
  }
  function goToProfile() {
    setOpen(false);
    if (currentRoute === "Profile") {
      return;
    }
    navigation.navigate("Profile");
  }
  return <>
      {showFloatingMenu && <View pointerEvents="box-none" style={[styles.floatingContainer, {
      top: insets.top + 12
    }]}>
        <Pressable onPress={() => setOpen(current => !current)} style={({
        pressed
      }) => [styles.menuButton, pressed && styles.menuButtonPressed]} accessibilityRole="button" accessibilityLabel={open ? "Fechar menu" : "Abrir menu"}>
          <Ionicons name={open ? "close-outline" : "menu-outline"} size={27} color="#00142E" />
        </Pressable>
      </View>}

      <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.menu, {
              top: insets.top + 68
            }]}>
                <View style={styles.menuMain}>
                  {NAVIGATION_ITEMS.map(({
                  route,
                  label,
                  icon,
                  alert
                }) => {
                  const active = currentRoute === route;
                  return <Pressable key={route} onPress={() => navigateTo(route)} style={({
                    pressed
                  }) => [styles.navItem, active && styles.navItemActive, pressed && !active && styles.navItemPressed]}>
                          <View style={styles.iconWrapper}>
                            <Ionicons name={icon} size={21} color={active ? "#FFFFFF" : "#00142E"} />

                            {alert && hasUnreadAlerts ? <View style={styles.alertIndicator} /> : null}
                          </View>

                          <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                            {label}
                          </Text>
                        </Pressable>;
                })}
                </View>

                <View style={styles.separator} />

                <Pressable onPress={goToProfile} style={({
                pressed
              }) => [styles.navItem, currentRoute === "Profile" && styles.navItemActive, pressed && currentRoute !== "Profile" && styles.navItemPressed]}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="person-circle-outline" size={22} color={currentRoute === "Profile" ? "#FFFFFF" : "#00142E"} />
                  </View>

                  <Text style={[styles.navLabel, currentRoute === "Profile" && styles.navLabelActive]}>
                    Perfil
                  </Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>;
}
