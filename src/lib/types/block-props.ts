/**
 * Common style properties that can be applied to blocks and templates
 */
export interface StyleProps {
  // Dimensions
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  
  // Spacing
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  
  // Background
  backgroundColor?: string;
  
  // Display
  display?: 'block' | 'flex' | 'inline-block' | 'inline-flex' | 'grid';
}

/**
 * Default style props values
 */
export const defaultStyleProps: StyleProps = {
  width: 'auto',
  height: 'auto',
  minWidth: 'auto',
  minHeight: 'auto',
  maxWidth: 'none',
  maxHeight: 'none',
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  paddingTop: 20,
  paddingBottom: 20,
  paddingLeft: 20,
  paddingRight: 20,
  backgroundColor: 'transparent',
  display: 'block',
};

/**
 * Convert StyleProps to CSS style object
 */
export function stylePropsToCSS(props: Partial<StyleProps>): React.CSSProperties {
  return {
    width: props.width,
    height: props.height,
    minWidth: props.minWidth,
    minHeight: props.minHeight,
    maxWidth: props.maxWidth,
    maxHeight: props.maxHeight,
    marginTop: props.marginTop ? `${props.marginTop}px` : undefined,
    marginBottom: props.marginBottom ? `${props.marginBottom}px` : undefined,
    marginLeft: props.marginLeft ? `${props.marginLeft}px` : undefined,
    marginRight: props.marginRight ? `${props.marginRight}px` : undefined,
    paddingTop: props.paddingTop ? `${props.paddingTop}px` : undefined,
    paddingBottom: props.paddingBottom ? `${props.paddingBottom}px` : undefined,
    paddingLeft: props.paddingLeft ? `${props.paddingLeft}px` : undefined,
    paddingRight: props.paddingRight ? `${props.paddingRight}px` : undefined,
    backgroundColor: props.backgroundColor,
    display: props.display,
  };
}
