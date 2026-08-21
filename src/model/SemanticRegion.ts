export type SemanticRegionKind =
  | 'chest'
  | 'groin'
  | 'buttocks'
  | 'face'
  | 'upperClothing'
  | 'lowerClothing'
  | 'customProtected';

export interface SemanticRegion {
  nodeName: string;
  kind: SemanticRegionKind;
  confidence: number;
  source: 'automatic' | 'user';
}

/** Editable semantic metadata for model Mesh/Node mappings. */
export class SemanticRegionMap {
  private readonly regions = new Map<string, SemanticRegion>();

  set(region: SemanticRegion): void {
    this.regions.set(region.nodeName, region);
  }

  assign(nodeName: string, kind: SemanticRegionKind): void {
    this.set({ nodeName, kind, confidence: 1, source: 'user' });
  }

  get(nodeName: string): SemanticRegion | undefined {
    return this.regions.get(nodeName);
  }

  all(): SemanticRegion[] {
    return [...this.regions.values()];
  }

  clear(): void {
    this.regions.clear();
  }
}
