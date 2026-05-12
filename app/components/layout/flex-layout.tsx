import { memo } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

export interface FlexLayoutProps extends React.ComponentProps<typeof View> {
  flex?: ViewStyle['flex'];
  gap?: ViewStyle['gap'];
  center?: boolean | 'items' | 'content' | 'self';
  items?: ViewStyle['alignItems'];
  content?: ViewStyle['justifyContent'];
  rounded?: ViewStyle['borderRadius'];
  bg?: ViewStyle['backgroundColor'];
}

export const FlexLayout = memo(function FlexLayout({
  type,
  flex,
  gap,
  center,
  items,
  content,
  rounded,
  bg,
  ...viewProps
}: { type: 'row' | 'column' } & FlexLayoutProps) {
  return (
    <View
      {...viewProps}
      style={[
        { display: 'flex', flex, gap, borderRadius: rounded, backgroundColor: bg },

        center === true && { alignItems: 'center', justifyContent: 'center' },
        center === 'items' && { alignItems: 'center' },
        center === 'content' && { justifyContent: 'center' },
        center === 'self' && { alignSelf: 'center' },

        items && { alignItems: items },
        content && { justifyContent: content },
        viewProps.style,
      ]}
    />
  );
});

export const Column = memo(function Column(props: FlexLayoutProps) {
  return <FlexLayout type="column" {...props} />;
});

export const Row = memo(function Row(props: FlexLayoutProps) {
  return <FlexLayout type="row" {...props} />;
});

export const AnimatedColumn = Animated.createAnimatedComponent(Column);
export const AnimatedRow = Animated.createAnimatedComponent(Row);
