import { StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { RadarField } from '@/components/radar-field';
import { Screen } from '@/components/screen';
import { font, palette } from '@/constants/design';

export default function DashboardScreen() {
  return <Screen>
    <View style={styles.heading}>
      <View style={styles.topline}><Text style={styles.eyebrow}>ROBOT 01 / PANEL</Text><View style={styles.badge}><View style={styles.dot} /><Text style={styles.badgeText}>SIN CONECTAR</Text></View></View>
      <Text accessibilityRole="header" style={styles.title}>Centro de{'\n'}control.</Text>
      <Text style={styles.description}>Una vista del robot y su entorno.</Text>
    </View>
    <View style={styles.notice}><Icon name="signal" size={18} color={palette.muted} /><Text style={styles.noticeText}>La conexión a los sensores estará disponible en la siguiente etapa.</Text></View>
    <RadarField />
    <View style={styles.metrics}>
      <Metric title="Objetivos" icon="target" caption="Sin mediciones" />
      <Metric title="Más cercano" icon="radar" caption="Distancia al sensor" unit="m" />
    </View>
    <View style={styles.section}>
      <View style={styles.sectionHead}><Text accessibilityRole="header" style={styles.sectionTitle}>Estado del sistema</Text><Text style={styles.smallLabel}>CONEXIONES</Text></View>
      <View style={styles.connections}>
        <Connection icon="cloud" title="Base de datos" detail="Firebase" />
        <Connection icon="chip" title="Controlador" detail="ESP32" />
        <Connection icon="radar" title="Radar" detail="HLK-LD2450" last />
      </View>
    </View>
    <View style={styles.section}>
      <View style={styles.sectionHead}><Text accessibilityRole="header" style={styles.sectionTitle}>Objetivos detectados</Text></View>
      <View style={styles.empty}>
        <View style={styles.emptyIcon}><Icon name="target" size={26} color={palette.muted} /></View>
        <Text style={styles.emptyTitle}>Aún no hay lecturas</Text>
        <Text style={styles.emptyText}>Aquí aparecerán la posición, la distancia y la velocidad de cada objetivo.</Text>
      </View>
    </View>
    <View style={styles.timestamp}><Text style={styles.timestampText}>Última actualización</Text><Text style={styles.timestampValue}>—</Text></View>
  </Screen>;
}

function Metric({ title, icon, caption, unit }: { title: string; icon: IconName; caption: string; unit?: string }) {
  return <View style={styles.metric}>
    <View style={styles.metricHeading}><Text style={styles.metricLabel}>{title}</Text><Icon name={icon} size={17} color={palette.muted} /></View>
    <View style={styles.valueRow}><Text style={styles.metricValue} accessibilityLabel="Sin datos">—</Text>{unit && <Text style={styles.unit}>{unit}</Text>}</View>
    <Text style={styles.metricCaption}>{caption}</Text>
  </View>;
}

function Connection({ icon, title, detail, last = false }: { icon: IconName; title: string; detail: string; last?: boolean }) {
  return <View style={[styles.connection, !last && styles.connectionBorder]}>
    <View style={styles.connectionIcon}><Icon name={icon} size={20} /></View>
    <View style={styles.connectionBody}><Text style={styles.connectionTitle}>{title}</Text><Text style={styles.connectionDetail}>{detail}</Text></View>
    <View style={styles.connectionState}><View style={styles.dot} /><Text style={styles.connectionStateText}>Sin conectar</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  heading: { gap: 16, paddingTop: 10 },
  topline: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontFamily: font.medium, fontSize: 9, letterSpacing: 1.4, color: palette.muted },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: palette.line, borderRadius: 6 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#9A9A97' },
  badgeText: { fontFamily: font.medium, fontSize: 8, letterSpacing: 1, color: palette.muted },
  title: { fontFamily: font.medium, color: palette.ink, fontSize: 46, lineHeight: 47, letterSpacing: -2.5 },
  description: { fontFamily: font.regular, color: palette.muted, fontSize: 14, lineHeight: 21 },
  notice: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: palette.soft, marginTop: -7 },
  noticeText: { flex: 1, fontFamily: font.regular, fontSize: 11, lineHeight: 17, color: '#626260' },
  metrics: { flexDirection: 'row', gap: 12, marginTop: -10 },
  metric: { flex: 1, borderWidth: 1, borderColor: palette.line, borderRadius: 16, padding: 16, gap: 13, minWidth: 0 },
  metricHeading: { flexDirection: 'row', gap: 5, justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontFamily: font.medium, fontSize: 11, color: palette.ink, flexShrink: 1 },
  valueRow: { flexDirection: 'row', gap: 5, alignItems: 'baseline' },
  metricValue: { fontFamily: font.medium, fontSize: 34, lineHeight: 39, color: palette.ink },
  unit: { fontFamily: font.regular, fontSize: 14, color: palette.muted },
  metricCaption: { fontFamily: font.regular, fontSize: 9, color: palette.muted, lineHeight: 14 },
  section: { gap: 16, marginTop: 2 },
  sectionHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sectionTitle: { fontFamily: font.medium, fontSize: 18, letterSpacing: -0.5, color: palette.ink },
  smallLabel: { fontFamily: font.medium, fontSize: 8, color: palette.muted, letterSpacing: 1 },
  connections: { borderWidth: 1, borderColor: palette.line, borderRadius: 16, paddingHorizontal: 16 },
  connection: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, paddingVertical: 16 },
  connectionBorder: { borderBottomWidth: 1, borderColor: palette.line },
  connectionIcon: { width: 35, height: 35, backgroundColor: palette.soft, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  connectionBody: { flex: 1, gap: 4, minWidth: 90 },
  connectionTitle: { fontFamily: font.medium, fontSize: 12, color: palette.ink },
  connectionDetail: { fontFamily: font.regular, fontSize: 10, color: palette.muted },
  connectionState: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  connectionStateText: { fontFamily: font.regular, fontSize: 10, color: palette.muted },
  empty: { paddingHorizontal: 24, paddingVertical: 30, borderWidth: 1, borderStyle: 'dashed', borderColor: '#D3D3CF', borderRadius: 16, alignItems: 'center', gap: 10 },
  emptyIcon: { width: 52, height: 52, backgroundColor: palette.soft, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  emptyTitle: { fontFamily: font.medium, fontSize: 15, color: palette.ink },
  emptyText: { fontFamily: font.regular, fontSize: 12, lineHeight: 19, color: palette.muted, textAlign: 'center', maxWidth: 245 },
  timestamp: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: palette.line, paddingTop: 20 },
  timestampText: { fontFamily: font.regular, fontSize: 11, color: palette.muted },
  timestampValue: { fontFamily: font.medium, fontSize: 15, color: palette.muted },
});
