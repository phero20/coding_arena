import {
  BaseBoxShapeUtil,
  Geometry2d,
  HTMLContainer,
  Rectangle2d,
  T,
  TLShapeId,
} from 'tldraw';
import { DIAGRAM_ASSETS } from '@/constants/diagram-assets';

/** Shape props interface for our custom system-icon shape */
export interface SystemDesignShapeProps {
  w: number;
  h: number;
  assetId: string;
  label: string;
}

/** The full shape record as stored by tldraw */
export interface ISystemDesignShape {
  id: TLShapeId;
  type: 'system-icon';
  props: SystemDesignShapeProps;
  [key: string]: any;
}

export class SystemDesignShapeUtil extends BaseBoxShapeUtil<any> {
  static override type = 'system-icon' as const;

  static override props = {
    w: T.number,
    h: T.number,
    assetId: T.string,
    label: T.string,
  };

  override canBind = () => true;
  override canEdit = () => false;
  override canResize = () => true;

  override getDefaultProps() {
    return {
      w: 64,
      h: 64,
      assetId: 'ec2',
      label: 'EC2 Instance',
    };
  }

  override getGeometry(shape: ISystemDesignShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: ISystemDesignShape) {
    const asset = DIAGRAM_ASSETS.find((a) => a.id === shape.props.assetId);

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'all',
          backgroundColor: 'transparent',
          width: '100%',
          height: '100%',
          padding: '4px',
        }}
      >
        {asset ? (
          <img
            src={asset.path}
            alt={asset.name}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
            draggable={false}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ⚠️
          </div>
        )}
      </HTMLContainer>
    );
  }

  getIndicatorPath(shape: ISystemDesignShape) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }

  override async toSvg(shape: ISystemDesignShape) {
    const asset = DIAGRAM_ASSETS.find((a) => a.id === shape.props.assetId);
    if (!asset) return null;

    return (
      <image
        href={asset.path}
        width={shape.props.w}
        height={shape.props.h}
        x={0}
        y={0}
      />
    );
  }
}

