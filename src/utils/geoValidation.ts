import * as turf from '@turf/turf';
import type { Feature, Polygon, MultiPolygon } from '@turf/turf';
import { CAMPUS_POLYGON } from '../constants/heatmap';
import type { BuildingPolygonData, WayData } from '../types/heatmap';

export interface GridCell {
  id: string;
  polygon: Feature<Polygon>;
}

/**
 * Creates a uniform grid over the campus polygon bounding box.
 * Only returns cells whose center is inside the campus polygon.
 */
export function generateCampusGrid(cellSizeMeters: number = 10): GridCell[] {
  const campusPoly = turf.polygon([CAMPUS_POLYGON]);
  const campusBbox = turf.bbox(campusPoly);

  // Generate grid. turf.squareGrid returns a FeatureCollection of Polygons
  const gridFc = turf.squareGrid(campusBbox, cellSizeMeters / 1000, { units: 'kilometers' });

  const cells: GridCell[] = [];
  
  turf.featureEach(gridFc, (currentFeature, index) => {
    // Check if the center of the cell is inside the campus polygon
    const center = turf.center(currentFeature);
    if (turf.booleanPointInPolygon(center, campusPoly)) {
      cells.push({
        id: `grid-cell-${index}`,
        polygon: currentFeature as Feature<Polygon>,
      });
    }
  });

  return cells;
}

/**
 * Merges selected grid cells into a single Feature.
 * Returns null if no cells are selected.
 */
export function mergeSelectedCells(selectedCells: Feature<Polygon>[]): Feature<Polygon | MultiPolygon> | null {
  if (selectedCells.length === 0) return null;
  if (selectedCells.length === 1) return selectedCells[0];

  const fc = turf.featureCollection(selectedCells);
  // turf.union can union a whole FeatureCollection in modern versions,
  // but just in case we use a reduce approach or the union function directly.
  try {
    let merged = selectedCells[0] as Feature<Polygon | MultiPolygon>;
    for (let i = 1; i < selectedCells.length; i++) {
      const res = turf.union(turf.featureCollection([merged, selectedCells[i]]));
      if (res) {
        merged = res as Feature<Polygon | MultiPolygon>;
      }
    }
    return merged;
  } catch (e) {
    console.error('Error merging cells', e);
    return null;
  }
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates the merged polygon.
 * 1. Must be a single Polygon (not MultiPolygon).
 * 2. Must not have holes.
 * 3. Must not overlap with existing buildings.
 * 4. Must not overlap with existing ways.
 */
export function validateCustomBuilding(
  feature: Feature<Polygon | MultiPolygon>,
  existingBuildings: BuildingPolygonData[],
  existingWays: WayData[]
): ValidationResult {
  // 1. Must be a single Polygon
  if (feature.geometry.type === 'MultiPolygon') {
    return { isValid: false, error: 'Hình dạng tòa nhà bị đứt đoạn. Vui lòng chọn các ô liền kề nhau.' };
  }

  const poly = feature as Feature<Polygon>;

  // 2. No holes. A Polygon's coordinates array has length > 1 if there are holes.
  // The first element is the outer ring, subsequent elements are inner rings (holes).
  if (poly.geometry.coordinates.length > 1) {
    return { isValid: false, error: 'Tòa nhà không được có khoảng trống (lỗ hổng) ở giữa.' };
  }

  // 3. Overlap with existing buildings
  for (const b of existingBuildings) {
    if (b.coordinates.length === 0) continue;
    try {
      const bPoly = turf.polygon([b.coordinates]);
      // booleanOverlap or intersect
      if (turf.booleanIntersects(poly, bPoly)) {
        // booleanIntersects returns true even if they just touch boundaries.
        // Let's use intersect to see if the intersection is a polygon.
        const intersection = turf.intersect(turf.featureCollection([poly, bPoly]));
        if (intersection && (intersection.geometry.type === 'Polygon' || intersection.geometry.type === 'MultiPolygon')) {
          return { isValid: false, error: `Tòa nhà bị đè lên công trình hiện tại: ${b.name || 'Không tên'}.` };
        }
      }
    } catch (e) {
      // ignore invalid building geometries
    }
  }

  // 4. Overlap with ways
  for (const w of existingWays) {
    if (w.coordinates.length < 2) continue;
    try {
      const line = turf.lineString(w.coordinates);
      if (turf.booleanIntersects(poly, line)) {
        return { isValid: false, error: `Tòa nhà đè lên đường đi: ${w.name || 'Không tên'}.` };
      }
    } catch (e) {
      // ignore invalid way geometries
    }
  }

  return { isValid: true };
}
