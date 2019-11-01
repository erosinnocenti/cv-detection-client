import { Point } from "./point";

export class GeometryUtils {
    static closestPointToSegment(p, a, b) {
        const a_to_p = new Point();
        const a_to_b = new Point();

        // Vettore A -> P
        a_to_p.x = p.x - a.x;
        a_to_p.y = p.y - a.y;
        
        // Vettore A -> B
        a_to_b.x = b.x - a.x;
        a_to_b.y = b.y - a.y;

        const atb2 = a_to_b.x * a_to_b.x + a_to_b.y * a_to_b.y;

        // Prodotto di a_to_p e a_to_b
        const atp_dot_atb = a_to_p.x * a_to_b.x + a_to_p.y * a_to_b.y;
        
        // Distanza normalizzata da A al punto piu vicino
        const t = atp_dot_atb / atb2;

        return new Point(a.x + a_to_b.x * t, a.y + a_to_b.y * t);
    }

    static distance(p1, p2) {
        const a = p1.x - p2.x;
        const b = p1.y - p2.y;

        const result = Math.sqrt(a * a + b * b);

        return result;
    }
}