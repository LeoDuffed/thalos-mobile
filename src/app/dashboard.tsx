import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { RadarField } from '@/components/radar-field';
import { Screen } from '@/components/screen';
import { font, palette } from '@/constants/design';
import { targetColors } from '@/constants/radar';
import { useTelemetry } from '@/hooks/use-telemetry';
import { ageLabel, formatTime, getReadingState, targetInView, type RadarTarget } from '@/lib/telemetry';

export default function DashboardScreen() {
  const telemetry = useTelemetry();
  const { status, reading, connected, loaded, error, now, retry } = telemetry;
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  // si falta algún dato, dejamos un guion; no lo convertimos en una medición de cero
  const valid = reading?.valid === true;
  const targets = valid ? reading.targets : [];
  const selected = targets.find(target => target.slot === selectedSlot) ?? targets[0];
  const { current, espOnline, sensorOnline } = getReadingState(reading, status, now, connected && loaded && !error);
  const nearest = targets.length ? Math.min(...targets.map(target => target.distanceM)) : null;
  const badge = error ? 'ERROR DE CONEXIÓN' : !loaded ? 'CONECTANDO' : !connected ? 'SIN CONEXIÓN' : current ? 'EN VIVO' : 'SIN LECTURA ACTUAL';
  const notice = error ?? (!loaded ? 'Conectando a Firebase y esperando las lecturas del robot.'
    : reading && !valid ? reading.issue
    : !connected ? 'Sin conexión a Firebase. Se conserva la última lectura recibida.'
    : current ? 'Lecturas reales del radar recibidas a través de Firebase.'
    : valid ? 'La última lectura es antigua. Esperando nuevos datos del sensor.'
    : 'Firebase está conectado. Esperando la primera lectura del sensor.');

  return <Screen>
    <View style={styles.heading}>
      <View style={styles.topline}>
        <Text style={styles.eyebrow}>{telemetry.deviceId.toUpperCase()} / PANEL</Text>
        <View style={styles.badge}><View style={[styles.dot, current && styles.liveDot]} /><Text style={styles.badgeText}>{badge}</Text></View>
      </View>
      <Text accessibilityRole="header" style={styles.title}>Centro de{'\n'}control.</Text>
      <Text style={styles.description}>Una vista del robot y su entorno.</Text>
    </View>
    <View style={styles.notice} accessibilityLiveRegion="polite">
      <Icon name="signal" size={18} color={palette.muted} /><Text style={styles.noticeText}>{notice}</Text>
    </View>
    {(error || (loaded && !connected)) && <Pressable accessibilityRole="button" onPress={retry}
      style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
      <Text style={styles.retryText}>Reintentar conexión</Text>
    </Pressable>}
    <RadarField targets={targets} current={current} hasReading={valid} selectedSlot={selected?.slot}
      deviceId={telemetry.deviceId} />
    <View style={styles.metrics}>
      <Metric title="Objetivos" icon="target" value={valid ? String(targets.length) : '—'} caption={valid ? current ? 'En esta lectura' : 'Última lectura' : 'Sin mediciones'} />
      <Metric title="Más cercano" icon="radar" value={nearest === null ? '—' : nearest.toFixed(2)} caption={valid && !current ? 'Última lectura' : 'Distancia al sensor'} unit="m" />
    </View>
    {valid && !current && <Text style={styles.latest}>Última medición: {formatTime(reading.updatedAt)} · {ageLabel(reading.updatedAt, now)}</Text>}
    <View style={styles.section}>
      <View style={styles.sectionHead}><Text accessibilityRole="header" style={styles.sectionTitle}>Estado del sistema</Text><Text style={styles.smallLabel}>CONEXIONES</Text></View>
      <View style={styles.connections}>
        <Connection icon="cloud" title="Base de datos" detail="Firebase" online={connected && loaded && !error} state={error ? 'Error' : connected && loaded ? 'Conectada' : loaded ? 'Sin conexión' : 'Conectando'} />
        <Connection icon="chip" title="Controlador" detail={status.wifiRssiDbm === null ? 'ESP32' : `ESP32 · ${status.wifiRssiDbm} dBm`} online={espOnline} state={espOnline ? 'En línea' : status.lastSeenAt ? 'Sin señal reciente' : 'Sin reporte'} />
        <Connection icon="radar" title="Radar" detail="HLK-LD2450" online={sensorOnline} state={sensorOnline ? 'Lectura vigente' : valid ? 'Lectura antigua' : 'Sin lecturas'} last />
      </View>
    </View>
    <View style={styles.section}>
      <View style={styles.sectionHead}><Text accessibilityRole="header" style={styles.sectionTitle}>Objetivos detectados</Text>{valid && <Text style={styles.smallLabel}>{current ? 'LECTURA VIGENTE' : 'ÚLTIMA LECTURA'}</Text>}</View>
      {targets.length ? targets.map(target => <TargetCard key={target.slot} target={target}
        selected={selected?.slot === target.slot} current={current} onSelect={() => setSelectedSlot(target.slot)} />)
        : <View style={styles.empty}>
          <View style={styles.emptyIcon}><Icon name="target" size={26} color={palette.muted} /></View>
          <Text style={styles.emptyTitle}>{valid ? current ? 'Sin objetivos en esta lectura' : 'Última lectura sin objetivos' : 'Aún no hay lecturas válidas'}</Text>
          <Text style={styles.emptyText}>{valid ? 'El radar reportó una trama válida sin objetivos activos.' : 'Aquí aparecerán la posición, la distancia y la velocidad de cada objetivo.'}</Text>
        </View>}
      {targets.length > 0 && <Text style={styles.slotNote}>T1–T3 son ranuras de seguimiento del radar, no identifican personas. Los objetivos fuera de la escala se conservan en estas tarjetas.</Text>}
    </View>
    <View style={styles.timestamp}><Text style={styles.timestampText}>Última actualización del radar</Text><Text style={styles.timestampValue}>{valid ? formatTime(reading.updatedAt) : '—'}</Text></View>
    {valid && <Text style={styles.latest}>{ageLabel(reading.updatedAt, now)} · Reporte #{reading.sequence}</Text>}
  </Screen>;
}

function Metric({ title, icon, value, caption, unit }: { title: string; icon: IconName; value: string; caption: string; unit?: string }) {
  return <View style={styles.metric}>
    <View style={styles.metricHeading}><Text style={styles.metricLabel}>{title}</Text><Icon name={icon} size={17} color={palette.muted} /></View>
    <View style={styles.valueRow}><Text style={styles.metricValue} accessibilityLabel={value === '—' ? 'Sin datos' : value}>{value}</Text>{unit && <Text style={styles.unit}>{unit}</Text>}</View>
    <Text style={styles.metricCaption}>{caption}</Text>
  </View>;
}

function Connection({ icon, title, detail, online, state, last = false }: { icon: IconName; title: string; detail: string; online: boolean; state: string; last?: boolean }) {
  return <View style={[styles.connection, !last && styles.connectionBorder]}>
    <View style={styles.connectionIcon}><Icon name={icon} size={20} /></View>
    <View style={styles.connectionBody}><Text style={styles.connectionTitle}>{title}</Text><Text style={styles.connectionDetail}>{detail}</Text></View>
    <View style={styles.connectionState}><View style={[styles.dot, online && styles.liveDot]} /><Text style={styles.connectionStateText}>{state}</Text></View>
  </View>;
}

// al tocar una tarjeta resaltamos esa misma ranura en el radar
function TargetCard({ target, selected, current, onSelect }: { target: RadarTarget; selected: boolean; current: boolean; onSelect: () => void }) {
  const measures = [
    ['Distancia', `${target.distanceM.toFixed(2)} m`],
    ['Velocidad reportada', `${(target.speedCms / 100).toFixed(2)} m/s`],
    ['Posición X', `${(target.xMm / 1000).toFixed(2)} m`],
    ['Posición Y', `${(target.yMm / 1000).toFixed(2)} m`],
    ['Ángulo reportado', `${target.angleDeg.toFixed(1)}°`],
    ['Resolución', `${target.resolutionMm} mm`],
  ];
  return <Pressable accessibilityRole="button" accessibilityLabel={`Seleccionar objetivo T${target.slot}${current ? '' : ', lectura antigua'}`}
    accessibilityState={{ selected }} onPress={onSelect} style={({ pressed }) => [styles.targetCard, selected && styles.targetSelected, pressed && styles.pressed]}>
    <View style={styles.targetHeader}><View style={[styles.targetDot, { backgroundColor: targetColors[target.slot - 1] }]} /><Text style={styles.targetTitle}>Objetivo T{target.slot}</Text><Text style={styles.targetTag}>{!targetInView(target) ? 'Fuera de escala' : current ? 'Lectura actual' : 'Lectura antigua'}</Text></View>
    <View style={styles.targetGrid}>{measures.map(([label, value]) => <View key={label} style={styles.targetMeasure}><Text style={styles.targetLabel}>{label}</Text><Text style={styles.targetValue}>{value}</Text></View>)}</View>
  </Pressable>;
}

const styles = StyleSheet.create({
  liveDot: { backgroundColor: '#111111' },
  retry: { alignSelf: 'flex-start', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, backgroundColor: palette.ink, marginTop: -14 },
  retryText: { fontFamily: font.medium, color: 'white', fontSize: 12 },
  pressed: { opacity: 0.65 },
  latest: { fontFamily: font.regular, fontSize: 10, color: palette.muted, marginTop: -14 },
  targetCard: { borderWidth: 1, borderColor: palette.line, borderRadius: 16, padding: 16, gap: 18 },
  targetSelected: { borderColor: palette.ink },
  targetHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  targetDot: { width: 7, height: 7, borderRadius: 4 },
  targetTitle: { fontFamily: font.semibold, fontSize: 14, flex: 1 },
  targetTag: { fontFamily: font.regular, fontSize: 10, color: palette.muted },
  targetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  targetMeasure: { width: '44%', gap: 4 },
  targetLabel: { fontFamily: font.regular, fontSize: 10, color: palette.muted },
  targetValue: { fontFamily: font.medium, fontSize: 16, color: palette.ink },
  slotNote: { fontFamily: font.regular, fontSize: 10, lineHeight: 16, color: palette.muted },
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
