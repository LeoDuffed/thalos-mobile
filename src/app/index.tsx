import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { RadarField } from '@/components/radar-field';
import { Screen } from '@/components/screen';
import { font, palette } from '@/constants/design';

export default function HomeScreen() {
  return <Screen>
    <View style={styles.hero}>
      <Text accessibilityRole="header" style={styles.title}>Tu robot.{'\n'}Otra perspectiva.</Text>
      <Text style={styles.description}>El centro de control de Thalos, ahora en tus manos.</Text>
    </View>
    <RadarField compact />
    <View style={styles.action}>
        <Pressable onPress={() => router.push('/dashboard')} accessibilityRole="button"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Abrir centro de control</Text><Icon name="arrow" color="white" size={21} />
        </Pressable>
    </View>
    <View style={styles.overview}>
      <Text style={styles.sectionLabel}>UNA VISTA. TODO EL CONTEXTO.</Text>
      <View style={styles.feature}>
        <View style={styles.featureIcon}><Icon name="radar" /></View>
        <View style={styles.featureBody}><Text style={styles.featureTitle}>Observa el entorno.</Text><Text style={styles.featureText}>Posición, distancia y movimiento en un mismo lugar.</Text></View>
      </View>
      <View style={styles.feature}>
        <View style={styles.featureIcon}><Icon name="chip" /></View>
        <View style={styles.featureBody}><Text style={styles.featureTitle}>Un sistema que crece.</Text><Text style={styles.featureText}>Un espacio para el robot y sus próximos sensores.</Text></View>
      </View>
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { gap: 18, paddingTop: 14 },
  eyebrowRow: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: palette.ink },
  eyebrow: { fontFamily: font.medium, fontSize: 9, letterSpacing: 1.2, color: palette.muted },
  title: { fontFamily: font.medium, color: palette.ink, fontSize: 42, lineHeight: 44, letterSpacing: -2.2 },
  description: { fontFamily: font.regular, color: palette.muted, fontSize: 16, lineHeight: 24, maxWidth: 285 },
  action: { gap: 13 },
  button: { minHeight: 58, paddingHorizontal: 20, paddingVertical: 16, backgroundColor: palette.ink, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  buttonText: { color: 'white', fontFamily: font.medium, fontSize: 15, flexShrink: 1 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  actionNote: { color: palette.muted, fontFamily: font.regular, fontSize: 10, textAlign: 'center' },
  overview: { borderTopWidth: 1, borderColor: palette.line, marginTop: 6, paddingTop: 26, gap: 23 },
  sectionLabel: { fontFamily: font.medium, fontSize: 9, letterSpacing: 1.6, color: palette.muted },
  feature: { flexDirection: 'row', gap: 15, alignItems: 'flex-start' },
  featureIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: palette.soft, alignItems: 'center', justifyContent: 'center' },
  featureBody: { flex: 1, gap: 5 },
  featureTitle: { fontFamily: font.medium, fontSize: 16, color: palette.ink, letterSpacing: -0.4 },
  featureText: { fontFamily: font.regular, fontSize: 13, color: palette.muted, lineHeight: 20 },
});
