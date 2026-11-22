import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

// Draws a Code 128 barcode as a scalable SVG
const BarcodeSvg = ({ value, height = 60 }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !value) return;
    try {
      JsBarcode(el, value, {
        format: "CODE128",
        width: 2,
        height,
        displayValue: true,
        fontSize: 16,
        margin: 6,
      });
      // Make the SVG scale to its container
      const w = parseFloat(el.getAttribute("width"));
      const h = parseFloat(el.getAttribute("height"));
      if (!el.getAttribute("viewBox") && w && h) {
        el.setAttribute("viewBox", `0 0 ${w} ${h}`);
      }
      el.removeAttribute("width");
      el.removeAttribute("height");
    } catch {
      // Invalid value: leave the SVG empty
    }
  }, [value, height]);

  return <svg ref={ref} className="bc-svg" />;
};

export default BarcodeSvg;