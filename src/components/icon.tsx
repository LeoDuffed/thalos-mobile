import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName = 'arrow' | 'back' | 'radar' | 'home' | 'chip' | 'cloud' | 'target' | 'signal';

export function Icon({ name, size = 22, color = '#111111' }: {
  name: IconName; size?: number; color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" accessible={false}>
      {name === 'arrow' && <Path d="M4 12h16m-6-6 6 6-6 6" />}
      {name === 'back' && <Path d="M20 12H4m6-6-6 6 6 6" />}
      {name === 'home' && <><Path d="m3 10 9-7 9 7v10H3Z" /><Path d="M9 20v-7h6v7" /></>}
      {name === 'radar' && <><Circle cx="12" cy="12" r="9" /><Circle cx="12" cy="12" r="5" /><Path d="m12 12 7-7M12 3v2M3 12h2M12 19v2M19 12h2" /><Circle cx="12" cy="12" r="1" /></>}
      {name === 'chip' && <><Rect x="6" y="6" width="12" height="12" rx="2" /><Rect x="9" y="9" width="6" height="6" rx="1" /><Path d="M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3" /></>}
      {name === 'cloud' && <Path d="M7 18h11a4 4 0 0 0 .5-8 6.5 6.5 0 0 0-12-2A5 5 0 0 0 7 18Z" />}
      {name === 'target' && <><Circle cx="12" cy="12" r="7" /><Circle cx="12" cy="12" r="2" /><Path d="M12 2v3m0 14v3M2 12h3m14 0h3" /></>}
      {name === 'signal' && <><Path d="M4 19v-3m5 3v-6m5 6V9m5 10V5" /></>}
    </Svg>
  );
}
