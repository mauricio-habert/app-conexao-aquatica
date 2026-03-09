import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { View, ViewProps } from './Themed';

type CardProps = Omit<ViewProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
};

export function Card({ style, children, ...props }: CardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
});
