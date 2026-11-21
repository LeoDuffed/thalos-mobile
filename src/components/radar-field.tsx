import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useId } from 'react';

import { font } from '@/constants/design';

// La escala representa el campo de referencia, no mediciones del sensor.
const cx = 180;
const cy = 240;
const radius = 204;
function arc(r: number) {
  const dx = r * Math.sin(Math.PI / 3);
  return `M ${cx - dx} ${cy - r / 2} A ${r} ${r} 0 0 1 ${cx + dx} ${cy - r / 2}`;
}

export function RadarField({ compact = false }: { compact?: boolean }) {
  const clip = `radar${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.titleRow}><View style={styles.indicator} /><Text style={styles.eyebrow}>{compact ? 'PERCEPCIÓN DEL ENTORNO' : 'CAMPO DE DETECCIÓN'}</Text></View>
        <Text style={styles.reference}>{compact ? '01' : 'VISTA SUPERIOR'}</Text>
      </View>
      <View style={[styles.drawing, compact && styles.compactDrawing]} accessible accessibilityLabel="Campo de referencia vacío del radar. Sin mediciones disponibles.">
        <Svg width="100%" height="100%" viewBox="0 0 360 280" accessible={false}>
          <Defs><ClipPath id={clip}><Path d={`M ${cx} ${cy} L ${cx - radius * Math.sin(Math.PI / 3)} ${cy - radius / 2} ${arc(radius).replace(/^M [^A]+/, '')} Z`} /></ClipPath></Defs>
          <G clipPath={`url(#${clip})`}>
            <Rect width={360} height={280} fill="#1C1C1C" />
            {Array.from({ length: 11 }, (_, i) => <Line key={`v${i}`} x1={10 + i * 34} y1={25} x2={10 + i * 34} y2={240} stroke="#FFFFFF" strokeOpacity={0.06} />)}
            {[1, 2, 3, 4, 5, 6].map(n => <Line key={`h${n}`} x1={0} y1={cy - n * 34} x2={360} y2={cy - n * 34} stroke="#FFFFFF" strokeOpacity={0.06} />)}
          </G>
          {[1, 2, 3, 4, 5, 6].map(n => <G key={n}>
            <Path d={arc(n * 34)} stroke={n === 6 ? '#AAAAAA' : '#555555'} strokeWidth={n === 6 ? 1.4 : 1} fill="none" />
            {!compact && <SvgText x={cx + 7} y={cy - n * 34 + 13} fill="#AAAAAA" fontSize={8}>{n} m</SvgText>}
          </G>)}
          {[-60, 0, 60].map(angle => <Line key={angle} x1={cx} y1={cy} x2={cx + radius * Math.sin(angle * Math.PI / 180)} y2={cy - radius * Math.cos(angle * Math.PI / 180)} stroke="#777777" strokeWidth={1} strokeDasharray={angle === 0 ? '3 5' : undefined} />)}
          <SvgText x={180} y={18} fill="#999999" textAnchor="middle" letterSpacing={2} fontSize={8}>FRENTE</SvgText>
          {!compact && <><SvgText x={10} y={153} fill="#AAAAAA" fontSize={9}>+60°</SvgText><SvgText x={324} y={153} fill="#AAAAAA" fontSize={9}>−60°</SvgText></>}
          <Circle cx={cx} cy={cy} r={24} fill="none" stroke="#777777" strokeOpacity={0.25} />
          <Rect x={cx - 13} y={cy - 13} width={26} height={26} rx={7} fill="white" />
          <Path d={`M ${cx - 5} ${cy} h 10 M ${cx} ${cy - 5} v 10`} stroke="#111111" strokeWidth={1.7} />
          <SvgText x={cx} y={275} fill="#AAAAAA" textAnchor="middle" letterSpacing={1.6} fontSize={8}>SENSOR / ROBOT 01</SvgText>
        </Svg>
      </View>
      <View style={styles.caption}>
        <Text style={styles.captionText}>{compact ? 'Una perspectiva sin cámaras.' : 'Referencia: 6 m · ±60°'}</Text>
        <Text style={styles.waiting}>{compact ? 'THALOS' : 'SIN LECTURAS'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#111111', borderRadius: 22, overflow: 'hidden' },
  heading: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'center', padding: 17, borderBottomWidth: 1, borderColor: '#2D2D2D' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  indicator: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#888888' },
  eyebrow: { fontFamily: font.medium, fontSize: 8, letterSpacing: 1.3, color: '#D5D5D5' },
  reference: { fontFamily: font.medium, fontSize: 8, letterSpacing: 1, color: '#888888' },
  drawing: { width: '100%', aspectRatio: 360 / 280, paddingHorizontal: 12 },
  compactDrawing: { aspectRatio: 360 / 210 },
  caption: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderColor: '#2D2D2D' },
  captionText: { fontFamily: font.regular, fontSize: 10, color: '#A3A3A3' },
  waiting: { fontFamily: font.medium, fontSize: 8, letterSpacing: 1, color: '#A3A3A3' },
});
