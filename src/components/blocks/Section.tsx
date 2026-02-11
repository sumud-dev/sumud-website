import { useNode } from '@craftjs/core';
import { stylePropsToCSS, type StyleProps } from '@/src/lib/types/block-props';
import { StyleSettings } from '@/src/components/admin/page-builder/StyleSettings';

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

  const styles = stylePropsToCSS({
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 0,
    marginBottom: 16,
    marginLeft: 0,
    marginRight: 0,
    backgroundColor: '#f8f8f8',
    minHeight: '100px',
    maxWidth: styleProps.maxWidth || '80rem',
    ...styleProps,
  });

  return (
    <section
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={styles}
      className="mx-auto w-full"
    >
      {children}
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