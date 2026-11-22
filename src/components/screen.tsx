import { router, usePathname } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { font, palette } from '@/constants/design';
import { Icon } from './icon';

export function Brand() {
  return <View style={styles.brand}>
    <Image source={require('../../assets/images/thalos-symbol.png')} style={styles.symbol} />
    <Text style={styles.wordmark}>Thalos</Text>
  </View>;
}

// compartimos la cabecera, la navegación y los márgenes seguros entre las dos pantallas
export function Screen({ children }: PropsWithChildren) {
  const dashboard = usePathname() === '/dashboard';
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.shell}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Thalos, ir al inicio"
            onPress={() => router.navigate('/')} style={({ pressed }) => pressed && styles.pressed}>
            <Brand />
          </Pressable>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
        <View style={styles.navigation} accessibilityRole="tablist">
          <NavItem href="/" active={!dashboard} label="Inicio" icon="home" />
          <NavItem href="/dashboard" active={dashboard} label="Centro de control" icon="radar" />
        </View>
      </View>
    </SafeAreaView>
  );
}

function NavItem({ href, active, label, icon }: {
  href: '/' | '/dashboard'; active: boolean; label: string; icon: 'home' | 'radar';
}) {
  return <Pressable onPress={() => router.navigate(href)}
      accessibilityRole="tab" accessibilityState={{ selected: active }} aria-selected={active}
      style={({ pressed }) => [styles.navItem, active && styles.navActive, pressed && styles.pressed]}>
      <Icon name={icon} size={19} color={active ? palette.ink : palette.muted} />
      <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
    </Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.paper },
  shell: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
  header: { height: 76, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: palette.line },
  brand: { flexDirection: 'row', gap: 9, alignItems: 'center' },
  symbol: { width: 34, height: 29, resizeMode: 'contain' },
  wordmark: { fontFamily: font.bold, fontSize: 25, letterSpacing: -1 },
  mobileBadge: { borderWidth: 1, borderColor: palette.line, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 6 },
  mobileText: { color: palette.muted, fontFamily: font.medium, fontSize: 9, letterSpacing: 1.3 },
  scroll: { flex: 1 },
  content: { padding: 24, gap: 26 },
  navigation: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 10, gap: 8, borderTopWidth: 1, borderColor: palette.line },
  navItem: { minHeight: 48, flex: 1, flexDirection: 'row', gap: 9, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  navActive: { backgroundColor: palette.soft },
  navText: { fontFamily: font.medium, fontSize: 11, color: palette.muted },
  navTextActive: { color: palette.ink },
  pressed: { opacity: 0.65 },
  footer: { flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: palette.muted },
  footerText: { fontFamily: font.medium, fontSize: 8, letterSpacing: 1.2, color: palette.muted },
});
