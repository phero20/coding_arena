import {
  BaseBoxShapeUtil,
  Geometry2d,
  HTMLContainer,
  Rectangle2d,
  T,
  TLShapeId,
} from 'tldraw';

export interface DeviceShapeProps {
  w: number;
  h: number;
  deviceType: 'phone' | 'tablet' | 'browser' | 'desktop' | 'laptop' | 'terminal';
}

export interface IDeviceShape {
  id: TLShapeId;
  type: 'device-frame';
  props: DeviceShapeProps;
  [key: string]: any;
}

export class DeviceShapeUtil extends BaseBoxShapeUtil<any> {
  static override type = 'device-frame' as const;

  static override props = {
    w: T.number,
    h: T.number,
    deviceType: T.string,
  };

  override canBind = () => true;
  override canEdit = () => false;
  override canResize = () => true;

  override getDefaultProps() {
    return {
      w: 150,
      h: 320,
      deviceType: 'phone' as const,
    };
  }

  override getGeometry(shape: IDeviceShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: IDeviceShape) {
    const { w, h, deviceType } = shape.props;
    const isDark = true; // Hardcoded dark mode for now to match the app theme

    const bezelColor = isDark ? '#1a1a1a' : '#000000';
    const screenBg = isDark ? '#09090b' : '#ffffff';

    if (deviceType === 'phone') {
      return (
        <HTMLContainer id={shape.id}>
          <div
            style={{
              width: '100%',
              height: '100%',
              border: '3px solid',
              borderColor: '#ffffff',
              borderRadius: '16px',
              backgroundColor: 'transparent',
              boxShadow: '0 8px 16px -4px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden',
              pointerEvents: 'all',
            }}
          >
            {/* Dynamic Island */}
            <div
              style={{
                position: 'absolute',
                top: '4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40px',
                height: '10px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                zIndex: 10,
              }}
            />
            {/* Home Indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: '3px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '48px',
                height: '2px',
                backgroundColor: '#ffffff',
                borderRadius: '4px',
                zIndex: 10,
              }}
            />
          </div>
        </HTMLContainer>
      );
    }

    if (deviceType === 'tablet') {
      return (
        <HTMLContainer id={shape.id}>
          <div
            style={{
              width: "100%",
              height: "100%",
              border: "3px solid",
              borderColor: "#ffffff",
              borderRadius: "16px",
              backgroundColor: "transparent",
              boxShadow: "0 8px 16px -4px rgba(0,0,0,0.3)",
              position: "relative",
              overflow: "hidden",
              pointerEvents: "all",
            }}
          >
            {/* Front Camera */}
            <div
              style={{
                position: "absolute",
                top: "4px",
                left: "50%",
                transform: "translate(-50%, 0)",
                width: "4px",
                height: "4px",
                backgroundColor: "#ffffff",
                borderRadius: "50%",
                zIndex: 10,
              }}
            />
            {/* Home Indicator */}
            <div
              style={{
                position: "absolute",
                bottom: "4px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "64px",
                height: "2px",
                backgroundColor: "#ffffff",
                borderRadius: "4px",
                zIndex: 10,
              }}
            />
          </div>
        </HTMLContainer>
      );
    }

    if (deviceType === 'browser') {
      return (
        <HTMLContainer id={shape.id}>
          <div
            style={{
              width: '100%',
              height: '100%',
              border: '3px solid',
              borderColor: '#ffffff',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              boxShadow: '0 8px 16px -4px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              pointerEvents: 'all',
            }}
          >
            {/* Safari Top Bar */}
            <div
              style={{
                height: '18px',
                backgroundColor: 'transparent',
                borderBottom: '2px solid',
                borderBottomColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                padding: '0 6px',
                gap: '3px',
                position: 'relative',
              }}
            >
              {/* Traffic Lights */}
              <div style={{ display: 'flex', gap: '3px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
              </div>
              {/* URL Bar */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40%',
                  height: '10px',
                  backgroundColor: 'transparent',
                  borderRadius: '3px',
                  border: '1px solid',
                  borderColor: '#ffffff',
                }}
              />
            </div>
            {/* Browser Content Area */}
            <div style={{ flex: 1, backgroundColor: 'transparent' }} />
          </div>
        </HTMLContainer>
      );
    }

    if (deviceType === 'desktop') {
      return (
        <HTMLContainer id={shape.id}>
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'all',
            }}
          >
            {/* Monitor Screen */}
            <div
              style={{
                width: '100%',
                flex: 1,
                border: '3px solid',
                borderColor: '#ffffff',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                boxShadow: '0 8px 16px -4px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
               {/* Chin Line */}
               <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '12px',
                  borderTop: '2px solid #ffffff',
               }} />
            </div>
            {/* Stand */}
            <div
              style={{
                width: '48px',
                height: '10px',
                backgroundColor: '#ffffff',
                clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0% 100%)',
              }}
            />
            {/* Stand Base */}
            <div
              style={{
                width: '64px',
                height: '3px',
                backgroundColor: '#ffffff',
                borderRadius: '2px',
              }}
            />
          </div>
        </HTMLContainer>
      );
    }

    if (deviceType === 'laptop') {
      return (
        <HTMLContainer id={shape.id}>
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'all',
              position: 'relative',
            }}
          >
            {/* Screen */}
            <div
              style={{
                width: '100%',
                flex: 1,
                border: '3px solid',
                borderColor: '#ffffff',
                borderRadius: '8px 8px 0 0',
                backgroundColor: 'transparent',
                boxShadow: '0 8px 16px -4px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
            />
            {/* Keyboard Base */}
            <div
              style={{
                width: 'calc(100% + 40px)', // Sticks out past the screen
                height: '14px',
                backgroundColor: '#ffffff',
                borderRadius: '0 0 12px 12px',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {/* Lid Opening Notch */}
              <div
                style={{
                  width: '30px',
                  height: '4px',
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  borderBottomRightRadius: '4px',
                  borderBottomLeftRadius: '4px',
                  opacity: 0.5,
                }}
              />
            </div>
          </div>
        </HTMLContainer>
      );
    }

    if (deviceType === 'terminal') {
      return (
        <HTMLContainer id={shape.id}>
          <div
            style={{
              width: '100%',
              height: '100%',
              border: '2px solid',
              borderColor: '#ffffff',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              boxShadow: '0 8px 16px -4px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              pointerEvents: 'all',
            }}
          >
            {/* Terminal Top Bar */}
            <div
              style={{
                height: '24px',
                backgroundColor: 'transparent',
                borderBottom: '2px solid',
                borderBottomColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                gap: '5px',
              }}
            >
              {/* Traffic Lights */}
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
              
              {/* Terminal Title */}
              <div style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: '#ffffff', fontFamily: 'monospace', opacity: 0.7, marginLeft: '-30px' }}>
                bash - 80x24
              </div>
            </div>
            {/* Terminal Body */}
            <div style={{ flex: 1, backgroundColor: 'transparent', padding: '8px', color: '#ffffff', fontFamily: 'monospace', fontSize: '12px' }}>
              <span style={{ color: '#27c93f' }}>➜</span> <span style={{ color: '#ffbd2e' }}>~</span>
            </div>
          </div>
        </HTMLContainer>
      );
    }

    return null;
  }

  getIndicatorPath(shape: IDeviceShape) {
    const path = new Path2D();
    const { w, h, deviceType } = shape.props;
    
    if (deviceType === 'phone') {
        path.roundRect(0, 0, w, h, 16);
    } else if (deviceType === 'tablet') {
        path.roundRect(0, 0, w, h, 12);
    } else if (deviceType === 'browser' || deviceType === 'terminal') {
        path.roundRect(0, 0, w, h, 6);
    } else if (deviceType === 'laptop') {
        path.roundRect(0, 0, w, h, 8);
    } else {
        path.rect(0, 0, w, h);
    }
    
    return path;
  }
}
