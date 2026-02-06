import mapboxgl from 'mapbox-gl';

// Helper function to convert various color formats to RGB string
const colorToRGB = (color: string): string => {
  // If already in RGB format (e.g., "255, 0, 0"), return as-is
  if (/^\d+,\s*\d+,\s*\d+$/.test(color)) {
    return color;
  }

  // Create a temporary element to parse the color
  const temp = document.createElement('div');
  temp.style.color = color;
  document.body.appendChild(temp);
  const computed = window.getComputedStyle(temp).color;
  document.body.removeChild(temp);

  // Extract RGB values from computed color (e.g., "rgb(255, 0, 0)")
  const match = computed.match(/\d+/g);
  if (match && match.length >= 3) {
    return `${match[0]}, ${match[1]}, ${match[2]}`;
  }

  // Fallback to black if parsing fails
  return '0, 0, 0';
};

interface PulseImageData extends mapboxgl.StyleImageInterface {
  context: CanvasRenderingContext2D | null;
}

// Custom pulse animation for Mapbox
export const createPulseDot = (
  map: mapboxgl.Map,
  color: string,
  duration: number = 2000
): PulseImageData => {
  const size = 100;
  const rgbColor = colorToRGB(color);

  return {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),
    context: null,

    onAdd: function () {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext('2d', { willReadFrequently: true });
    },

    render: function () {
      const t = (performance.now() % duration) / duration;
      const radius = (size / 2) * 0.3;
      const outerRadius = (size / 2) * 0.7 * t + radius;
      const context = this.context;

      if (!context) return false;

      context.clearRect(0, 0, this.width, this.height);

      // Outer pulsing circle (capped opacity so overlapping stations don't blend into wrong colors)
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${rgbColor}, ${0.35 * (1 - t)})`;
      context.fill();

      // Inner static circle
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${rgbColor}, 1)`;
      context.strokeStyle = 'white';
      context.lineWidth = 2;
      context.fill();
      context.stroke();

      this.data = context.getImageData(0, 0, this.width, this.height).data;
      map.triggerRepaint();
      return true;
    }
  };
};