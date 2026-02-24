import { useNode } from '@craftjs/core';
import { Children } from 'react';

interface SectionProps extends StyleProps {
  children: React.ReactNode;
}

export const Section = ({ 
  children,
  ...styleProps
}: Partial<SectionProps>) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const styles: React.CSSProperties = {
    paddingTop: padding,
    paddingBottom: padding,
    paddingLeft: padding,
    paddingRight: padding,
    marginTop: 0,
    marginBottom: 16,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor,
    minHeight: '100px',
    maxWidth: '80rem',
  };

  const showPlaceholder = Children.count(children) === 0;

  return (
    <section
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={styles}
      className="mx-auto"
    >
      {showPlaceholder ? (
        <div className="flex items-center justify-center min-h-25 text-gray-400">
          <p className="text-sm">Drop blocks here...</p>
        </div>
      ) : (
        children
      )}
    </section>
  );
};

Section.craft = {
  displayName: 'Section',
  isCanvas: true,
  props: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#f8f8f8',
    marginTop: 0,
    marginBottom: 16,
    marginLeft: 0,
    marginRight: 0,
    width: '100%',
    height: 'auto',
    maxWidth: '80rem',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    settings: () => <StyleSettings prefix="sectionSettings" />,
  },
};