export interface CircleOrSquareShapeStyles {
  backgroundColor: string | null;
  borderStyle: string | null;
  borderColor: string | null;
  borderWidth: string | null;
  color: string | null;
  opacity: number | null;
  transform: string | null;
  backgroundSize: string | number | null;
  backgroundImage: string | null;
  backgroundPosition?: string | null;
  backgroundRepeat?: string | null;
}

export interface TriangleShapeStyles {
  opacity?: number;
  transform?: string;
  fill: string;
  strokeWidth: number;
  borderColor: string;
  strokeDasharray: number;
  gradientStartColor: string;
  gradientStopColor: string;
  isGradient: boolean;
  backgroundImage?: string;
  gradientAngle: {
    x1: string;
    x2: string;
    y1: string;
    y2: string;
  };
}
