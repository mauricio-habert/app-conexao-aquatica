import { StyleSheet, View, Text } from 'react-native';
import { Fonts } from '@/constants/Fonts';

type BadgeProps = {
  label: string;
  color: string;
};

export function Badge({ label, color }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
  },
});
